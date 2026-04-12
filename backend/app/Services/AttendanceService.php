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
use App\Support\ScheduleDay;
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

        if (! hash_equals($expectedSignature, $signature)) {
            throw new \Exception('Signature token QR tidak valid (kemungkinan manipulasi)', 422);
        }

        // 2. Resolve QR Token
        $qr = Qrcode::with('schedule.dailySchedule.classSchedule.class')->where('token', $data['token'])->firstOrFail();

        if (! $qr->is_active) {
            throw new \Exception('QR tidak aktif', 422);
        }

        if ($qr->type === 'student' && ! in_array($user->user_type, ['student', 'teacher'], true)) {
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

        if ($user->user_type === 'teacher') {
            $teacherId = $user->teacherProfile->id;
            $isOwner = $qr->schedule->teacher_id === $teacherId;
            if (! $isOwner) {
                throw new \Exception('QR ini bukan untuk jadwal mengajar Anda', 403);
            }
        }

        // Class ownership validation for students
        if ($user->user_type === 'student') {
            $classId = $qr->schedule->dailySchedule->classSchedule->class_id;
            if ($classId !== $user->studentProfile->class_id) {
                $className = $qr->schedule->dailySchedule->classSchedule->class->name ?? 'Unknown';
                throw new \Exception("Anda ({$user->name}) bukan dari kelas jadwal ini ({$className})", 422);
            }
        }

        // Schedule Day Validation
        $scheduleDay = $qr->schedule->dailySchedule->day;
        $todayVariants = ScheduleDay::variants($now->toDateString());
        $demoMode = config('app.demo_mode', env('APP_DEMO_MODE', false));

        if (! $demoMode) {
            if (! in_array($scheduleDay, $todayVariants, true)) {
                throw new \Exception("QR hanya valid pada hari {$scheduleDay}", 422);
            }
        }

        if (! $demoMode && ! $this->isWithinScheduleWindow($qr->schedule, $now)) {
            throw new \Exception('Sesi absensi sudah berakhir untuk jadwal ini', 422);
        }

        // 3. Check if Schedule is Open (skip in demo mode)
        $demoMode = config('app.demo_mode', false);

        if (! $demoMode) {
            $isClosed = \App\Models\Attendance::where('schedule_id', $qr->schedule_id)
                ->whereDate('date', today())
                ->where('source', 'system_close')
                ->exists();

            if ($isClosed) {
                throw new \Exception('Sesi absensi untuk jadwal ini sudah ditutup', 422);
            }
        }

        // Geolocation Validation (skip in demo mode)
        $demoMode = config('app.demo_mode', false);
        if (! $demoMode) {
            $this->validateLocation($data);
        }

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
                    'is_draft' => false,
                    'finalized_at' => $now,
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
    public function scanStudent(string $nisn, User $teacher, ?string $deviceId = null, ?string $scheduleId = null): array
    {
        if ($teacher->user_type !== 'teacher' || ! $teacher->teacherProfile) {
            throw new \Exception('Hanya guru yang dapat melakukan scan ini', 403);
        }

        $student = StudentProfile::with('user')->where('nisn', $nisn)->first();
        if (! $student) {
            throw new \Exception('Siswa dengan NISN ini tidak ditemukan', 404);
        }

        $now = now();
        $dayVariants = ScheduleDay::variants($now->toDateString());
        $time = $now->format('H:i:s');
        $demoMode = config('app.demo_mode', env('APP_DEMO_MODE', false));

        if ($scheduleId) {
            $schedule = ScheduleItem::with('dailySchedule.classSchedule.class')
                ->where('teacher_id', $teacher->teacherProfile->id)
                ->whereHas('dailySchedule.classSchedule', function ($query) {
                    $query->where('is_active', true);
                })
                ->find($scheduleId);
        } else {
            $schedule = ScheduleItem::with('dailySchedule.classSchedule.class')
                ->where('teacher_id', $teacher->teacherProfile->id)
                ->whereHas('dailySchedule', function ($query) use ($dayVariants) {
                    $query->whereIn('day', $dayVariants);
                })
                ->whereHas('dailySchedule.classSchedule', function ($query) {
                    $query->where('is_active', true);
                })
                ->where('start_time', '<=', $time)
                ->where('end_time', '>=', $time)
                ->first();
        }

        if (! $schedule) {
            throw new \Exception('Tidak ada jadwal mengajar aktif saat ini.', 422);
        }

        if (! $demoMode && ! $this->isWithinScheduleWindow($schedule, $now)) {
            throw new \Exception('Sesi absensi sudah berakhir untuk jadwal ini.', 422);
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
                    // Toggle Logic: Present -> Return, Return -> Present
                    $newStatus = $existing->status === AttendanceStatus::PRESENT->value
                        ? AttendanceStatus::RETURN->value
                        : AttendanceStatus::PRESENT->value;

                    $existing->update([
                        'status' => $newStatus,
                        'updated_at' => $now,
                    ]);

                    // Propagation Logic: If status is RETURN, mark subsequent schedules
                    if ($newStatus === AttendanceStatus::RETURN->value) {
                        $this->propagateReturnStatus($student, $now, $schedule);
                    } else {
                        // Optional: Clear subsequent 'return' if toggled back to present?
                        // For now, let's keep it simple: only auto-mark return.
                    }

                    return [
                        'status' => 'success',
                        'message' => 'Status presensi siswa diperbarui menjadi: '.($newStatus === 'return' ? 'Pulang' : 'Hadir'),
                        'attendance_status' => $newStatus,
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
                    'is_draft' => false,
                    'finalized_at' => $now,
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
     * Propagate Return Status to Subsequent Schedules
     */
    private function propagateReturnStatus(StudentProfile $student, Carbon $now, ScheduleItem $currentSchedule): void
    {
        $day = $now->format('l');
        $date = $now->toDateString();

        // Get all schedules for this class today that start AFTER or AT the same time as current schedule
        $subsequentSchedules = ScheduleItem::whereHas('dailySchedule', function ($query) use ($day, $currentSchedule) {
            $query->where('day', $day)
                ->where('class_schedule_id', $currentSchedule->dailySchedule->class_schedule_id);
        })
            ->where('start_time', '>=', $currentSchedule->start_time)
            ->where('id', '!=', $currentSchedule->id)
            ->get();

        foreach ($subsequentSchedules as $sch) {
            Attendance::updateOrCreate(
                [
                    'attendee_type' => 'student',
                    'student_id' => $student->id,
                    'schedule_id' => $sch->id,
                    'date' => $date,
                ],
                [
                    'status' => AttendanceStatus::RETURN->value,
                    'source' => 'system_propagation',
                    'reason' => 'Siswa sudah pulang (dicatat oleh guru sebelumnya)',
                    'checked_in_at' => $now,
                ]
            );
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

        $attendance = Attendance::where($attributes)
            ->whereBetween('date', [$now->toDateString() . ' 00:00:00', $now->toDateString() . ' 23:59:59'])
            ->first();

        if ($attendance) {
            $attendance->update([
                'status' => $status,
                'checked_in_at' => $now,
                'source' => 'manual',
                'reason' => $data['reason'] ?? null,
                'is_draft' => false,
                'draft_saved_at' => null,
                'finalized_at' => $now,
                'manual_session_started_at' => null,
            ]);
            $attendance = $attendance->fresh();
        } else {
            $attendance = Attendance::create([
                ...$attributes,
                'date' => $now->toDateString(),
                'status' => $status,
                'checked_in_at' => $now,
                'source' => 'manual',
                'reason' => $data['reason'] ?? null,
                'is_draft' => false,
                'draft_saved_at' => null,
                'finalized_at' => $now,
                'manual_session_started_at' => null,
            ]);
        }

        // Skenario 2: Otomatis buat StudentLeavePermission jika status izin atau sakit
        $this->createLeavePermissionIfNeeded(
            studentId: (int) $data['student_id'],
            scheduleId: (int) $data['schedule_id'],
            date: $now->toDateString(),
            status: $status,
            reason: $data['reason'] ?? null,
            grantedByUserId: $user->id
        );

        return $attendance;
    }

    public function saveBulkManual(array $data, User $user): array
    {
        $schedule = ScheduleItem::with('dailySchedule.classSchedule.class')->findOrFail($data['schedule_id']);
        $this->authorizeManualSchedule($schedule, $user);

        $date = Carbon::parse($data['date'])->toDateString();
        $mode = $data['mode'] ?? 'draft';

        return match ($mode) {
            'final' => $this->saveBulkManualFinal($schedule, $date, $data['items'], $user),
            'draft' => $this->saveBulkManualDraft($schedule, $date, $data['items'], $user),
            default => throw new \Exception('Mode absensi manual tidak valid.', 422),
        };
    }

    public function saveBulkManualDraft(ScheduleItem $schedule, string $date, array $items, User $user): array
    {
        $existingSession = $this->getManualSessionState($schedule->id, $date);
        if ($existingSession['is_finalized']) {
            throw new \Exception('Sesi absensi manual sudah difinalisasi', 409);
        }

        $now = now();
        $sessionStartedAt = $existingSession['session_started_at'] ? Carbon::parse($existingSession['session_started_at']) : $now->copy();
        $sessionAlreadyStarted = $existingSession['session_started_at'] !== null;
        $autoLateStudentIds = [];
        $results = [];

        DB::transaction(function () use ($schedule, $date, $items, $now, $sessionStartedAt, $sessionAlreadyStarted, $user, &$autoLateStudentIds, &$results) {
            foreach ($items as $item) {
                if (empty($item['status'])) {
                    continue;
                }

                // resolveManualStatusForDraft kini return array ['status', 'auto_reason']
                $resolved = $this->resolveManualStatusForDraft(
                    schedule: $schedule,
                    date: $date,
                    studentId: (int) $item['student_id'],
                    requestedStatus: $item['status'],
                    sessionAlreadyStarted: $sessionAlreadyStarted,
                    autoLateStudentIds: $autoLateStudentIds
                );
                $status = $resolved['status'];
                // Jika auto-late: pakai auto_reason. Jika user sudah isi reason, user reason tetap dipakai.
                $reason = ($item['reason'] ?? null) ?: $resolved['auto_reason'];

                $attendance = Attendance::where('student_id', (int) $item['student_id'])
                    ->where('schedule_id', $schedule->id)
                    ->where('attendee_type', 'student')
                    ->whereBetween('date', [$date . ' 00:00:00', $date . ' 23:59:59'])
                    ->lockForUpdate()
                    ->first();

                if ($attendance) {
                    $attendance->update([
                        'status' => $status,
                        'checked_in_at' => $now,
                        'source' => 'manual_draft',
                        'reason' => $reason,
                        'is_draft' => true,
                        'draft_saved_at' => $now,
                        'finalized_at' => null,
                        'manual_session_started_at' => $sessionStartedAt,
                    ]);
                } else {
                    $attendance = Attendance::create([
                        'student_id' => (int) $item['student_id'],
                        'schedule_id' => $schedule->id,
                        'attendee_type' => 'student',
                        'date' => $date,
                        'status' => $status,
                        'checked_in_at' => $now,
                        'source' => 'manual_draft',
                        'reason' => $reason,
                        'is_draft' => true,
                        'draft_saved_at' => $now,
                        'finalized_at' => null,
                        'manual_session_started_at' => $sessionStartedAt,
                    ]);
                }

                // Skenario 2: Otomatis buat StudentLeavePermission jika status izin atau sakit
                $this->createLeavePermissionIfNeeded(
                    studentId: (int) $item['student_id'],
                    scheduleId: $schedule->id,
                    date: $date,
                    status: $status,
                    reason: $reason,
                    grantedByUserId: $user->id
                );

                $results[] = [
                    'id'         => $attendance->id,
                    'student_id' => (int) $item['student_id'],
                    'status'     => $attendance->status,
                    'date'       => $attendance->date,
                    'source'     => $attendance->source,
                    'is_draft'   => $attendance->is_draft,
                    'checked_in_at' => optional($attendance->checked_in_at)->toIso8601String(),
                ];
            }
        });

        return [
            'message' => count($results).' data kehadiran draft berhasil disimpan',
            'mode' => 'draft',
            'session_started_at' => $sessionStartedAt->toIso8601String(),
            'saved_count' => count($results),
            'draft_count' => count($results),
            'final_count' => 0,
            'auto_late_student_ids' => $autoLateStudentIds,
            'data' => $results,
        ];
    }

    public function saveBulkManualFinal(ScheduleItem $schedule, string $date, array $items, User $user): array
    {
        $existingSession = $this->getManualSessionState($schedule->id, $date);
        $now = now();
        $sessionStartedAt = $existingSession['session_started_at']
            ? Carbon::parse($existingSession['session_started_at'])
            : null;
        $autoLateStudentIds = [];
        $results = [];
        $wasPreviouslyFinalized = $existingSession['is_finalized'];

        DB::transaction(function () use ($schedule, $date, $items, $now, $sessionStartedAt, $user, &$autoLateStudentIds, &$results) {
            foreach ($items as $item) {
                if (empty($item['status'])) {
                    continue;
                }

                $normalizedStatus = Attendance::normalizeStatus($item['status']);
                $existing = Attendance::where('schedule_id', $schedule->id)
                    ->where('attendee_type', 'student')
                    ->where('student_id', (int) $item['student_id'])
                    ->whereBetween('date', [$date . ' 00:00:00', $date . ' 23:59:59'])
                    ->lockForUpdate()
                    ->first();

                // Jika siswa baru pertama kali diinput saat finalisasi (tidak ada draft sebelumnya)
                // dan session sudah pernah dimulai → status hadir otomatis jadi terlambat + isi reason
                $autoReason = null;
                if (! $existing && $sessionStartedAt instanceof Carbon && $normalizedStatus === AttendanceStatus::PRESENT->value) {
                    $normalizedStatus = AttendanceStatus::LATE->value;
                    $autoReason = 'Terlambat: siswa baru diinput setelah sesi absensi dimulai';
                    $autoLateStudentIds[] = (int) $item['student_id'];
                }

                // Prioritas reason: user input > auto reason (untuk late)
                $reason = ($item['reason'] ?? null) ?: $autoReason;

                if ($existing) {
                    $existing->update([
                        'status' => $normalizedStatus,
                        'checked_in_at' => $now,
                        'source' => 'manual',
                        'reason' => $reason,
                        'is_draft' => false,
                        'draft_saved_at' => $existing->draft_saved_at,
                        'finalized_at' => $now,
                        'manual_session_started_at' => $sessionStartedAt,
                    ]);
                    $attendance = $existing->fresh();
                } else {
                    $attendance = Attendance::create([
                        'student_id' => (int) $item['student_id'],
                        'schedule_id' => $schedule->id,
                        'attendee_type' => 'student',
                        'date' => $date,
                        'status' => $normalizedStatus,
                        'checked_in_at' => $now,
                        'source' => 'manual',
                        'reason' => $reason,
                        'is_draft' => false,
                        'draft_saved_at' => null,
                        'finalized_at' => $now,
                        'manual_session_started_at' => $sessionStartedAt,
                    ]);
                }

                // Skenario 2: Otomatis buat StudentLeavePermission jika status izin atau sakit
                $this->createLeavePermissionIfNeeded(
                    studentId: (int) $item['student_id'],
                    scheduleId: $schedule->id,
                    date: $date,
                    status: $normalizedStatus,
                    reason: $reason,
                    grantedByUserId: $user->id
                );

                $results[] = [
                    'id'         => $attendance->id,
                    'student_id' => (int) $item['student_id'],
                    'status'     => $attendance->status,
                    'date'       => $attendance->date,
                    'source'     => $attendance->source,
                    'is_draft'   => $attendance->is_draft,
                    'checked_in_at' => optional($attendance->checked_in_at)->toIso8601String(),
                ];
            }
        });

        return [
            'message' => count($results).' data kehadiran final berhasil disimpan',
            'mode' => 'final',
            'already_finalized' => $wasPreviouslyFinalized,
            'session_started_at' => $sessionStartedAt?->toIso8601String(),
            'saved_count' => count($results),
            'draft_count' => 0,
            'final_count' => count($results),
            'auto_late_student_ids' => $autoLateStudentIds,
            'data' => $results,
        ];
    }

    public function finalizeManualSession(ScheduleItem $schedule, string $date, string $finalizeEmptyAs, User $user): array
    {
        $this->authorizeManualSchedule($schedule, $user);

        $state = $this->getManualSessionState($schedule->id, $date);
        if ($state['is_finalized']) {
            return [
                'message' => 'Sesi absensi manual sudah difinalisasi',
                'schedule_id' => $schedule->id,
                'date' => $date,
                'finalized_at' => $state['finalized_at'],
                'finalized_count' => 0,
                'auto_absent_count' => 0,
                'already_recorded_count' => $state['saved_count'],
                'already_finalized' => true,
            ];
        }

        $now = now();
        $eligibleStudents = $this->eligibleStudentsForManualSession($schedule, $date);
        $eligibleStudentIds = $eligibleStudents->pluck('id')->all();
        $existingAttendances = Attendance::forManualSession($schedule->id, $date)
            ->whereIn('student_id', $eligibleStudentIds)
            ->get()
            ->keyBy('student_id');
        $sessionStartedAt = $state['session_started_at'] ? Carbon::parse($state['session_started_at']) : null;

        $finalizedCount = 0;
        $autoAbsentCount = 0;

        DB::transaction(function () use ($existingAttendances, $eligibleStudentIds, $schedule, $date, $finalizeEmptyAs, $now, $sessionStartedAt, &$finalizedCount, &$autoAbsentCount) {
            foreach ($existingAttendances as $attendance) {
                $attendance->update([
                    'is_draft' => false,
                    'source' => 'manual',
                    'finalized_at' => $now,
                ]);
                $finalizedCount++;
            }

            if ($finalizeEmptyAs !== 'absent') {
                return;
            }

            foreach ($eligibleStudentIds as $studentId) {
                if ($existingAttendances->has($studentId)) {
                    continue;
                }

                Attendance::create([
                    'attendee_type' => 'student',
                    'student_id' => $studentId,
                    'schedule_id' => $schedule->id,
                    'date' => $date,
                    'status' => AttendanceStatus::ABSENT->value,
                    'checked_in_at' => $now,
                    'source' => 'manual',
                    'reason' => 'Tidak diisi saat finalisasi absensi manual',
                    'is_draft' => false,
                    'finalized_at' => $now,
                    'manual_session_started_at' => $sessionStartedAt,
                ]);
                $autoAbsentCount++;
            }
        });

        return [
            'message' => 'Sesi absensi manual berhasil difinalisasi',
            'schedule_id' => $schedule->id,
            'date' => $date,
            'finalized_at' => $now->toIso8601String(),
            'finalized_count' => $finalizedCount,
            'auto_absent_count' => $autoAbsentCount,
            'already_recorded_count' => $existingAttendances->count(),
            'already_finalized' => false,
        ];
    }

    public function getManualSessionState(int $scheduleId, string $date): array
    {
        $rows = Attendance::forManualSession($scheduleId, $date)
            ->whereIn('source', ['manual_draft', 'manual'])
            ->get();

        $sessionStartedAt = $rows->pluck('manual_session_started_at')->filter()->sort()->first();
        if (! $sessionStartedAt && $rows->isNotEmpty()) {
            // Fallback untuk draft lama yang belum menyimpan manual_session_started_at.
            $sessionStartedAt = $rows
                ->pluck('draft_saved_at')
                ->filter()
                ->sort()
                ->first()
                ?? $rows->pluck('created_at')->filter()->sort()->first();
        }
        $finalizedAt = $rows->pluck('finalized_at')->filter()->sortDesc()->first();

        return [
            'has_draft' => $rows->contains(fn (Attendance $attendance) => $attendance->is_draft),
            'is_finalized' => $finalizedAt !== null && $rows->every(fn (Attendance $attendance) => ! $attendance->is_draft),
            'session_started_at' => $sessionStartedAt?->toIso8601String(),
            'finalized_at' => $finalizedAt?->toIso8601String(),
            'saved_count' => $rows->count(),
            'draft_saved_count' => $rows->where('is_draft', true)->count(),
        ];
    }

    public function eligibleStudentsForManualSession(ScheduleItem $schedule, string $date)
    {
        $classId = $schedule->dailySchedule->classSchedule->class_id;
        $students = StudentProfile::where('class_id', $classId)->get();
        $dateCarbon = Carbon::parse($date);
        $scheduleStart = Carbon::parse($schedule->start_time);
        $scheduleEnd = Carbon::parse($schedule->end_time);

        $activeLeavePermissions = StudentLeavePermission::where('class_id', $classId)
            ->where('date', $dateCarbon->toDateString())
            ->where('status', 'active')
            ->get()
            ->keyBy('student_id');

        return $students->filter(function (StudentProfile $student) use ($activeLeavePermissions, $scheduleStart, $scheduleEnd) {
            $leavePermission = $activeLeavePermissions->get($student->id);
            if (! $leavePermission) {
                return true;
            }

            if ($leavePermission->is_full_day) {
                return false;
            }

            return ! $leavePermission->shouldHideFromAttendanceOptimized($scheduleStart, $scheduleEnd);
        })->values();
    }

    /**
     * Resolve status absen manual untuk draft.
     * Return: ['status' => string, 'auto_reason' => string|null]
     *
     * Jika siswa belum pernah di-absen dan session sudah dimulai sebelumnya,
     * input "hadir" otomatis diubah ke "terlambat" + reason otomatis diisi.
     */
    public function resolveManualStatusForDraft(
        ScheduleItem $schedule,
        string $date,
        int $studentId,
        string $requestedStatus,
        bool $sessionAlreadyStarted,
        array &$autoLateStudentIds
    ): array {
        $normalizedStatus = Attendance::normalizeStatus($requestedStatus);
        $autoReason = null;

        $existing = Attendance::forManualSession($schedule->id, $date)
            ->where('student_id', $studentId)
            ->first();

        if (! $existing && $sessionAlreadyStarted && $normalizedStatus === AttendanceStatus::PRESENT->value) {
            $normalizedStatus = AttendanceStatus::LATE->value;
            $autoReason = 'Terlambat: siswa baru diinput setelah sesi absensi dimulai';
            $autoLateStudentIds[] = $studentId;
        }

        return ['status' => $normalizedStatus, 'auto_reason' => $autoReason];
    }

    /**
     * Create Full Day Attendance Records
     *
     * Creates attendance records for all schedules today (for full day sick/izin)
     */
    public function createFullDayAttendance(StudentProfile $student, string $status, string $date, ?string $reason, ?string $reasonFile = null): void
    {
        $dayName = Carbon::parse($date)->format('l');

        $schedules = \App\Models\ScheduleItem::whereHas('dailySchedule', function ($q) use ($dayName, $student) {
            $q->where('day', $dayName)
                ->whereHas('classSchedule', function ($cq) use ($student) {
                    $cq->where('class_id', $student->class_id);
                });
        })
            ->get();

        foreach ($schedules as $schedule) {
            Attendance::updateOrCreate(
                [
                    'student_id' => $student->id,
                    'schedule_id' => $schedule->id,
                    'attendee_type' => 'student',
                    'date' => $date,
                ],
                [
                    'status' => $status,
                    'reason' => $reason,
                    'reason_file' => $reasonFile,
                    'source' => 'manual',
                    'is_draft' => false,
                    'finalized_at' => now(),
                ]
            );
        }
    }

    /**
     * Mark remaining schedules on the same day as izin.
     */
    public function markRemainingAsIzin(StudentProfile $student, string $date, string $startTime, ?string $reason, ?string $reasonFile = null): void
    {
        $dayName = Carbon::parse($date)->format('l');
        $normalizedStart = Carbon::parse($startTime)->format('H:i');

        $schedules = \App\Models\ScheduleItem::whereHas('dailySchedule', function ($q) use ($dayName, $student) {
            $q->where('day', $dayName)
                ->whereHas('classSchedule', function ($cq) use ($student) {
                    $cq->where('class_id', $student->class_id);
                });
        })
            ->where('start_time', '>=', $normalizedStart)
            ->orderBy('start_time')
            ->get();

        foreach ($schedules as $schedule) {
            Attendance::updateOrCreate(
                [
                    'student_id' => $student->id,
                    'schedule_id' => $schedule->id,
                    'attendee_type' => 'student',
                    'date' => $date,
                ],
                [
                    'status' => AttendanceStatus::PERMISSION->value,
                    'reason' => $reason,
                    'reason_file' => $reasonFile,
                    'source' => 'manual',
                    'is_draft' => false,
                    'finalized_at' => now(),
                ]
            );
        }
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
                    'is_draft' => false,
                    'finalized_at' => $now,
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

        $gracePeriod = 0;
        $lateThreshold = $scheduledDateTime->copy()->addMinutes($gracePeriod);

        if ($checkInTime->gt($lateThreshold)) {
            return AttendanceStatus::LATE->value;
        }

        return AttendanceStatus::PRESENT->value;
    }

    public function autoMarkAbsentForEndedSchedules(string $date, ?int $scheduleId = null, bool $force = false): array
    {
        $targetDate = Carbon::parse($date)->toDateString();
        $targetDay = Carbon::parse($targetDate)->format('l');
        $now = now();

        $query = ScheduleItem::query()
            ->with(['dailySchedule.classSchedule'])
            ->whereHas('dailySchedule.classSchedule', function ($q): void {
                $q->where('is_active', true);
            })
            ->whereHas('dailySchedule', function ($q) use ($targetDay): void {
                $q->where('day', $targetDay);
            });

        if ($scheduleId !== null) {
            $query->whereKey($scheduleId);
        }

        $schedules = $query->get()->filter(function (ScheduleItem $schedule) use ($targetDate, $now, $force): bool {
            if ($force) {
                return true;
            }

            if ($targetDate < $now->toDateString()) {
                return true;
            }

            return Carbon::parse($targetDate.' '.$schedule->end_time)->lte($now);
        })->values();

        $processedSchedules = 0;
        $createdAttendances = 0;

        foreach ($schedules as $schedule) {
            $processedSchedules++;
            
            $classId = $schedule->dailySchedule->classSchedule->class_id;
            $allStudents = StudentProfile::where('class_id', $classId)->get();

            $activeLeavePermissions = StudentLeavePermission::where('class_id', $classId)
                ->where('date', $targetDate)
                ->where('status', 'active')
                ->get()
                ->keyBy('student_id');

            $existingStudentIds = Attendance::query()
                ->where('attendee_type', 'student')
                ->where('schedule_id', $schedule->id)
                ->whereDate('date', $targetDate)
                ->pluck('student_id')
                ->all();

            foreach ($allStudents as $student) {
                if (in_array($student->id, $existingStudentIds, true)) {
                    continue;
                }

                $status = AttendanceStatus::ABSENT->value;
                $reason = 'Otomatis alpha setelah jam pelajaran berakhir';

                $leavePermission = $activeLeavePermissions->get($student->id);
                if ($leavePermission && $leavePermission->shouldHideFromAttendance($schedule)) {
                    $status = match ($leavePermission->type) {
                        'sakit' => AttendanceStatus::SICK->value,
                        'izin', 'izin_pulang', 'dispensasi' => AttendanceStatus::EXCUSED->value,
                        default => AttendanceStatus::EXCUSED->value,
                    };
                    $reason = $leavePermission->reason ?? ('Otomatis: ' . $this->getLeaveTypeLabel($leavePermission->type));
                }

                Attendance::updateOrCreate(
                    [
                        'attendee_type' => 'student',
                        'student_id' => $student->id,
                        'schedule_id' => $schedule->id,
                        'date' => $targetDate,
                    ],
                    [
                        'status' => $status,
                        'reason' => $reason,
                        'checked_in_at' => null,
                        'source' => 'system_close',
                        'is_draft' => false,
                        'finalized_at' => $now,
                    ]
                );

                $createdAttendances++;
            }
        }

        return [
            'date' => $targetDate,
            'processed_schedules' => $processedSchedules,
            'created_absent_attendances' => $createdAttendances,
        ];
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

    /**
     * Skenario 2: Otomatis buat StudentLeavePermission jika status izin atau sakit
     * di absen manual (storeManual, saveBulkManualDraft, saveBulkManualFinal).
     * Jika sudah ada record untuk student + date + type yang sama, tidak dibuat ulang (idempotent).
     */
    private function createLeavePermissionIfNeeded(
        int $studentId,
        int $scheduleId,
        string $date,
        string $status,
        ?string $reason,
        ?int $grantedByUserId
    ): void {
        $leaveStatuses = [
            AttendanceStatus::EXCUSED->value,  // 'excused' / izin
            AttendanceStatus::SICK->value,     // 'sick' / sakit
        ];

        if (! in_array($status, $leaveStatuses, true)) {
            return;
        }

        // Resolve class_id dari schedule
        $schedule = ScheduleItem::with('dailySchedule.classSchedule')->find($scheduleId);
        $classId = $schedule?->dailySchedule?->classSchedule?->class_id;

        if (! $classId || ! $schedule?->start_time || ! $grantedByUserId) {
            return;
        }

        $type = $status === AttendanceStatus::SICK->value ? 'sakit' : 'izin';

        // Cek apakah sudah ada leave permission aktif untuk siswa + tanggal + tipe ini
        $alreadyExists = StudentLeavePermission::where('student_id', $studentId)
            ->where('date', $date)
            ->where('type', $type)
            ->whereIn('status', ['active', 'pending'])
            ->exists();

        if ($alreadyExists) {
            return;
        }

        StudentLeavePermission::create([
            'student_id'  => $studentId,
            'class_id'    => $classId,
            'granted_by'  => $grantedByUserId,
            'schedule_id' => $scheduleId,
            'type'        => $type,
            'date'        => $date,
            'start_time'  => $schedule->start_time,
            'end_time'    => null,
            'reason'      => $reason ?? ('Dibuat otomatis dari absensi manual: ' . ($type === 'sakit' ? 'Sakit' : 'Izin')),
            'status'      => 'active',
            'is_full_day' => true,
        ]);
    }

    private function authorizeManualSchedule(ScheduleItem $schedule, User $user): void
    {
        if ($user->user_type !== 'teacher') {
            return;
        }

        $teacherProfile = $user->teacherProfile;
        $classId = $schedule->dailySchedule->classSchedule->class_id;
        $isScheduleTeacher = $schedule->teacher_id === $teacherProfile?->id;
        $isHomeroom = $teacherProfile?->homeroom_class_id === $classId;

        if (! $isScheduleTeacher && ! $isHomeroom) {
            throw new \Exception('Anda tidak memiliki akses untuk mengubah absensi ini.', 403);
        }
    }

    private function isWithinScheduleWindow(ScheduleItem $schedule, Carbon $now): bool
    {
        if (! $schedule->start_time || ! $schedule->end_time) {
            return true;
        }

        $start = Carbon::parse($now->toDateString().' '.$schedule->start_time);
        $end = Carbon::parse($now->toDateString().' '.$schedule->end_time);

        return $now->betweenIncluded($start, $end);
    }
}
