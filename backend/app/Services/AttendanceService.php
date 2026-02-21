<?php

namespace App\Services;

use App\Enums\AttendanceStatus;
use App\Events\AttendanceRecorded;
use App\Models\Attendance;
use App\Models\Qrcode;
use App\Models\ScheduleItem;
use App\Models\StudentLeavePermission;
use App\Models\StudentProfile;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AttendanceService
{
    /**
     * Scan QR Code (Self)
     */
    public function scan(array $data, User $user): array
    {
        $now = now();

        // 1. Verify HMAC Signature format
        $parts = explode('.', $data['token']);
        if (count($parts) !== 2) {
            throw new \Exception('Format token tidak valid atau tidak memiliki signature', 422);
        }
        
        [$uuid, $signature] = $parts;
        $expectedSignature = hash_hmac('sha256', $uuid, config('app.key'));
        
        if (!hash_equals($expectedSignature, $signature)) {
            throw new \Exception('Signature token QR tidak valid (kemungkinan manipulasi)', 422);
        }

        // 2. Resolve QR Token
        $qr = Qrcode::with('schedule.dailySchedule.classSchedule.class')->where('token', $data['token'])->firstOrFail();

        if (! $qr->is_active || $qr->isExpired()) {
            throw new \Exception('QR tidak aktif atau sudah kadaluarsa', 422);
        }

        if ($qr->type === 'student' && $user->user_type !== 'student') {
            throw new \Exception('QR hanya untuk siswa', 403);
        }

        if ($qr->type === 'teacher' && $user->user_type !== 'teacher') {
            throw new \Exception('QR hanya untuk guru', 403);
        }

        if ($user->user_type === 'student' && ! $user->studentProfile) {
            throw new \Exception('Profil siswa tidak ditemukan', 422);
        }

        if ($user->user_type === 'teacher' && ! $user->teacherProfile) {
            throw new \Exception('Profil guru tidak ditemukan', 422);
        }

        // 3. Check if Schedule is Open
        $isClosed = \App\Models\Attendance::where('schedule_id', $qr->schedule_id)
            ->whereDate('date', today())
            ->where('source', 'system_close')
            ->exists();

        if ($isClosed) {
            throw new \Exception('Sesi absensi untuk jadwal ini sudah ditutup', 422);
        }

        // Geolocation Validation
        $this->validateLocation($data);

        // Check Leave (Student only)
        if ($user->user_type === 'student' && $user->studentProfile) {
            $this->checkLeaveStatus($user->studentProfile, $now, $qr->schedule);
        }

        $attributes = [
            'attendee_type' => $user->user_type,
            'student_id' => $user->user_type === 'student' ? $user->studentProfile->id : null,
            'teacher_id' => $user->user_type === 'teacher' ? $user->teacherProfile->id : null,
            'schedule_id' => $qr->schedule_id,
        ];

        $lockKey = "attendance_scan_{$user->id}_{$qr->schedule_id}_{$now->toDateString()}";

        return Cache::lock($lockKey, 10)->block(5, function () use ($attributes, $now, $qr, $user, $data) {
            return DB::transaction(function () use ($attributes, $now, $qr, $user, $data) {
                if ($user->user_type === 'student') {
                    $deviceId = $data['device_id'] ?? request('device_id');
                    if ($deviceId) {
                        $user->devices()->where('id', $deviceId)->where('active', true)->update(['last_used_at' => $now]);
                    }
                }

                $existing = Attendance::where($attributes)
                    ->whereDate('date', $now->toDateString())
                    ->lockForUpdate()
                    ->first();

                if ($existing) {
                    return [
                        'status' => 'existing',
                        'message' => 'Presensi sudah tercatat',
                        'attendance' => $existing->load(['student.user', 'teacher.user', 'schedule.dailySchedule.classSchedule.class', 'attachments']),
                    ];
                }

                $attendance = Attendance::create([
                    ...$attributes,
                    'date' => $now,
                    'qrcode_id' => $qr->id,
                    'status' => $this->determineStatus($qr->schedule, $now),
                    'checked_in_at' => $now,
                    'source' => 'qrcode',
                ]);

                AttendanceRecorded::dispatch($attendance);

                Log::info('attendance.recorded', [
                    'attendance_id' => $attendance->id,
                    'schedule_id' => $attendance->schedule_id,
                    'user_id' => $user->id,
                    'attendee_type' => $attendance->attendee_type,
                    'status' => $attendance->status,
                ]);

                return [
                    'status' => 'success',
                    'attendance' => $attendance->loadMissing(['student.user', 'teacher.user', 'schedule.dailySchedule.classSchedule.class', 'attachments']),
                ];
            });
        });
    }

    /**
     * Scan Student QR Code by Teacher
     */
    public function scanStudent(string $nisn, User $teacher, ?string $deviceId = null): array
    {
        if ($teacher->user_type !== 'teacher' || ! $teacher->teacherProfile) {
            throw new \Exception('Hanya guru yang dapat melakukan scan ini', 403);
        }

        $student = StudentProfile::with('user')->where('nisn', $nisn)->first();
        if (! $student) {
            throw new \Exception('Siswa dengan NISN ini tidak ditemukan', 404);
        }

        $now = now();
        $day = $now->format('l');
        $time = $now->format('H:i:s');

        $schedule = ScheduleItem::with('dailySchedule.classSchedule.class')
            ->where('teacher_id', $teacher->teacherProfile->id)
            ->whereHas('dailySchedule', function ($query) use ($day) {
                $query->where('day', $day);
            })
            ->whereHas('dailySchedule.classSchedule', function ($query) {
                $query->where('is_active', true);
            })
            ->where('start_time', '<=', $time)
            ->where('end_time', '>=', $time)
            ->first();

        if (! $schedule) {
            throw new \Exception('Tidak ada jadwal mengajar aktif saat ini.', 422);
        }

        $classId = $schedule->dailySchedule->classSchedule->class_id;
        if ($classId !== $student->class_id) {
            $className = $schedule->dailySchedule->classSchedule->class->name ?? 'Unknown';
            throw new \Exception("Siswa ini ({$student->user->name}) bukan dari kelas jadwal saat ini ({$className})", 422);
        }

        $this->checkLeaveStatus($student, $now, $schedule);

        $attributes = [
            'attendee_type' => 'student',
            'student_id' => $student->id,
            'schedule_id' => $schedule->id,
        ];

        $lockKey = "attendance_scan_student_{$student->id}_{$schedule->id}_{$now->toDateString()}";
        $lock = Cache::lock($lockKey, 10);

        try {
            if ($lock->get()) {
                $existing = Attendance::where($attributes)
                    ->whereDate('date', $now->toDateString())
                    ->first();

                if ($existing) {
                    return [
                        'status' => 'existing',
                        'message' => 'Presensi siswa sudah tercatat',
                        'attendance_status' => $existing->status,
                        'student' => $student,
                    ];
                }

                $attendance = Attendance::create([
                    'attendee_type' => 'student',
                    'student_id' => $student->id,
                    'schedule_id' => $schedule->id,
                    'date' => $now,
                    'status' => AttendanceStatus::PRESENT->value,
                    'checked_in_at' => $now,
                    'source' => 'teacher_scan',
                ]);

                AttendanceRecorded::dispatch($attendance);

                return [
                    'status' => 'success',
                    'message' => 'Presensi berhasil dicatat',
                    'attendance_status' => $attendance->status,
                    'student' => $student,
                ];
            } else {
                throw new \Exception('Sedang memproses...', 429);
            }
        } finally {
            $lock->release();
        }
    }

    /**
     * Store Manual Attendance
     */
    public function storeManual(array $data, User $user): Attendance
    {
        $schedule = ScheduleItem::findOrFail($data['schedule_id']);

        if ($user->user_type === 'teacher' && $schedule->teacher_id !== $user->teacherProfile->id) {
            throw new \Exception('Unauthorized', 403);
        }

        $now = Carbon::parse($data['date']);
        $status = Attendance::normalizeStatus($data['status']);

        $attributes = [
            'attendee_type' => 'student',
            'student_id' => $data['student_id'],
            'schedule_id' => $data['schedule_id'],
        ];

        return Attendance::updateOrCreate(
            [
                ...$attributes,
                'date' => $now->toDateString(),
            ],
            [
                'status' => $status,
                'checked_in_at' => $now,
                'source' => 'manual',
                'reason' => $data['reason'] ?? null,
            ]
        );
    }

    /**
     * Close Attendance Session
     */
    public function close(ScheduleItem $schedule, User $user): array
    {
        if ($user->user_type !== 'teacher' || $schedule->teacher_id !== $user->teacherProfile->id) {
            throw new \Exception('Unauthorized', 403);
        }

        $now = now();
        $today = $now->toDateString();

        $classId = $schedule->dailySchedule->classSchedule->class_id;

        return DB::transaction(function () use ($classId, $schedule, $today, $now) {
            $students = StudentProfile::where('class_id', $classId)->get();

            $existingStudentIds = Attendance::where('schedule_id', $schedule->id)
                ->where('attendee_type', 'student')
                ->whereDate('date', $today)
                ->pluck('student_id')
                ->all();

            $leavePermissions = StudentLeavePermission::where('class_id', $classId)
                ->where('date', $today)
                ->where('status', 'active')
                ->get()
                ->keyBy('student_id');

            $absentCount = 0;
            $onLeaveCount = 0;
            $bulkData = [];

            foreach ($students as $student) {
                if (in_array($student->id, $existingStudentIds)) {
                    continue;
                }

                $leavePermission = $leavePermissions->get($student->id);
                $status = AttendanceStatus::ABSENT->value;
                $reason = 'Tidak melakukan scan presensi';

                if ($leavePermission && $leavePermission->shouldHideFromAttendance($schedule)) {
                    $status = match ($leavePermission->type) {
                        'sakit' => AttendanceStatus::SICK->value,
                        'izin', 'izin_pulang', 'dispensasi' => AttendanceStatus::EXCUSED->value,
                        default => AttendanceStatus::EXCUSED->value,
                    };
                    $reason = $leavePermission->reason ?? ('Otomatis: '.$this->getLeaveTypeLabel($leavePermission->type));
                    $onLeaveCount++;
                } else {
                    $absentCount++;
                }

                $bulkData[] = [
                    'attendee_type' => 'student',
                    'student_id' => $student->id,
                    'schedule_id' => $schedule->id,
                    'date' => $today,
                    'status' => $status,
                    'source' => 'system_close',
                    'reason' => $reason,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }

            if (! empty($bulkData)) {
                foreach ($bulkData as $row) {
                    \Illuminate\Support\Facades\DB::table('attendances')->updateOrInsert(
                        [
                            'attendee_type' => $row['attendee_type'],
                            'student_id' => $row['student_id'],
                            'schedule_id' => $row['schedule_id'],
                            'date' => $row['date'],
                        ],
                        $row
                    );
                }
            }

            return [
                'absent_count' => $absentCount,
                'on_leave_count' => $onLeaveCount,
            ];
        });
    }

    // --- Helpers ---

    private function validateLocation(array $data): void
    {
        $settings = $this->cachedSettings();
        $schoolLat = $settings['school_lat'] ?? null;
        $schoolLong = $settings['school_long'] ?? null;
        $radius = (int) ($settings['attendance_radius_meters'] ?? 0);

        if ($schoolLat && $schoolLong && $radius > 0) {
            if (empty($data['lat']) || empty($data['long'])) {
                throw new \Exception('Lokasi diperlukan untuk presensi', 422);
            }

            $distance = $this->calculateDistance((float) $data['lat'], (float) $data['long'], (float) $schoolLat, (float) $schoolLong);

            if ($distance > $radius) {
                throw new \Exception('Anda berada di luar radius sekolah. Jarak: '.round($distance, 2).' meter. Max: '.$radius.' meter.', 422);
            }
        }
    }

    private function calculateDistance($lat1, $lon1, $lat2, $lon2)
    {
        $earthRadius = 6371000;
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);
        $a = sin($dLat / 2) * sin($dLat / 2) + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLon / 2) * sin($dLon / 2);
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }

    private function checkLeaveStatus(StudentProfile $studentProfile, Carbon $date, ScheduleItem $schedule): void
    {
        $activeLeave = StudentLeavePermission::where('student_id', $studentProfile->id)
            ->where('date', $date->toDateString())
            ->where('status', 'active')
            ->first();

        if ($activeLeave && $activeLeave->shouldHideFromAttendance($schedule)) {
            $leaveType = $this->getLeaveTypeLabel($activeLeave->type);
            throw new \Exception("Anda sedang dalam status {$leaveType} dan tidak dapat melakukan presensi", 422);
        }
    }

    private function determineStatus($schedule, $checkInTime): string
    {
        if (! $schedule || ! $schedule->start_time) {
            return AttendanceStatus::PRESENT->value;
        }

        $startTime = Carbon::parse($schedule->start_time);
        // Create scheduled date time relative to today
        $scheduledDateTime = Carbon::createFromTime($startTime->hour, $startTime->minute, $startTime->second);
        // Ensure same date
        $scheduledDateTime->setDate($checkInTime->year, $checkInTime->month, $checkInTime->day);

        $settings = $this->cachedSettings();
        $gracePeriod = (int) ($settings['grace_period'] ?? 15);
        $lateThreshold = $scheduledDateTime->copy()->addMinutes($gracePeriod);

        if ($checkInTime->gt($lateThreshold)) {
            return AttendanceStatus::LATE->value;
        }

        return AttendanceStatus::PRESENT->value;
    }

    /**
     * Load all settings from cache. Refreshes every 5 minutes.
     *
     * @return array<string, string|null>
     */
    private function cachedSettings(): array
    {
        return Cache::remember('app.settings.all', 300, function (): array {
            return \App\Models\Setting::query()->pluck('value', 'key')->all();
        });
    }

    private function getLeaveTypeLabel(string $type): string
    {
        return match ($type) {
            'sakit' => 'Sakit',
            'izin' => 'Izin',
            'izin_pulang' => 'Izin Pulang',
            'dispensasi' => 'Dispensasi',
            default => $type,
        };
    }
}
