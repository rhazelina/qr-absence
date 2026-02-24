<?php

namespace Database\Seeders;

use App\Models\Attendance;
use App\Models\ClassSchedule;
use App\Models\TimeSlot;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class WakaAttendancePresentationSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedDefaultTimeSlots();

        $targetDates = $this->resolveRecentSchoolDates(6);
        $activeClassSchedules = ClassSchedule::query()
            ->where('is_active', true)
            ->with([
                'class.students',
                'dailySchedules.scheduleItems',
            ])
            ->get();

        if ($activeClassSchedules->isEmpty()) {
            $this->command?->warn('WakaAttendancePresentationSeeder: no active class schedules found.');

            return;
        }

        $upsertedStudentRows = 0;
        $upsertedTeacherRows = 0;

        foreach ($activeClassSchedules as $classSchedule) {
            $classRoom = $classSchedule->class;
            if (! $classRoom) {
                continue;
            }

            $students = $classRoom->students()->orderBy('id')->get();
            if ($students->isEmpty()) {
                continue;
            }

            $dailySchedules = $classSchedule->dailySchedules->keyBy(fn ($daily) => strtolower((string) $daily->day));

            foreach ($targetDates as $date) {
                $daily = $dailySchedules->get(strtolower($date->format('l')));
                if (! $daily || $daily->scheduleItems->isEmpty()) {
                    continue;
                }

                foreach ($daily->scheduleItems->sortBy('start_time')->values() as $itemIndex => $scheduleItem) {
                    [$teacherStatus, $teacherReason] = $this->pickTeacherStatus(
                        (int) $scheduleItem->teacher_id,
                        (int) $scheduleItem->id,
                        $date,
                        (int) $itemIndex
                    );

                    Attendance::updateOrCreate(
                        [
                            'attendee_type' => 'teacher',
                            'teacher_id' => $scheduleItem->teacher_id,
                            'schedule_id' => $scheduleItem->id,
                            'date' => $date->toDateString(),
                        ],
                        [
                            'status' => $teacherStatus,
                            'reason' => $teacherReason,
                            'checked_in_at' => $this->resolveCheckedInAt($teacherStatus, $date, (string) $scheduleItem->start_time),
                            'source' => 'waka_presentation',
                        ]
                    );
                    $upsertedTeacherRows++;

                    foreach ($students as $student) {
                        [$studentStatus, $studentReason] = $this->pickStudentStatus(
                            (int) $student->id,
                            (int) $scheduleItem->id,
                            $date
                        );

                        Attendance::updateOrCreate(
                            [
                                'attendee_type' => 'student',
                                'student_id' => $student->id,
                                'schedule_id' => $scheduleItem->id,
                                'date' => $date->toDateString(),
                            ],
                            [
                                'status' => $studentStatus,
                                'reason' => $studentReason,
                                'checked_in_at' => $this->resolveCheckedInAt($studentStatus, $date, (string) $scheduleItem->start_time),
                                'source' => 'waka_presentation',
                            ]
                        );
                        $upsertedStudentRows++;
                    }
                }
            }
        }

        $this->command?->info(
            "WakaAttendancePresentationSeeder completed. Upserted student rows: {$upsertedStudentRows}, teacher rows: {$upsertedTeacherRows}"
        );
    }

    private function seedDefaultTimeSlots(): void
    {
        if (TimeSlot::query()->count() > 0) {
            return;
        }

        $slots = [
            ['name' => 'Jam 1', 'start_time' => '07:00:00', 'end_time' => '07:40:00'],
            ['name' => 'Jam 2', 'start_time' => '07:40:00', 'end_time' => '08:20:00'],
            ['name' => 'Jam 3', 'start_time' => '08:20:00', 'end_time' => '09:00:00'],
            ['name' => 'Jam 4', 'start_time' => '09:00:00', 'end_time' => '09:40:00'],
            ['name' => 'Jam 5', 'start_time' => '10:00:00', 'end_time' => '10:40:00'],
            ['name' => 'Jam 6', 'start_time' => '10:40:00', 'end_time' => '11:20:00'],
            ['name' => 'Jam 7', 'start_time' => '12:20:00', 'end_time' => '13:00:00'],
            ['name' => 'Jam 8', 'start_time' => '13:00:00', 'end_time' => '13:40:00'],
            ['name' => 'Jam 9', 'start_time' => '13:40:00', 'end_time' => '14:20:00'],
            ['name' => 'Jam 10', 'start_time' => '14:20:00', 'end_time' => '15:00:00'],
        ];

        foreach ($slots as $slot) {
            TimeSlot::query()->create($slot);
        }
    }

    /**
     * @return array<int, Carbon>
     */
    private function resolveRecentSchoolDates(int $count): array
    {
        $dates = [];
        $cursor = Carbon::today();

        while (count($dates) < $count) {
            if (! $cursor->isWeekend()) {
                $dates[] = $cursor->copy();
            }
            $cursor->subDay();
        }

        return array_reverse($dates);
    }

    /**
     * @return array{0:string,1:?string}
     */
    private function pickStudentStatus(int $studentId, int $scheduleId, Carbon $date): array
    {
        $score = crc32("student-{$studentId}-{$scheduleId}-{$date->toDateString()}") % 100;

        if ($score < 68) {
            return ['present', null];
        }
        if ($score < 79) {
            return ['late', 'Terlambat datang'];
        }
        if ($score < 87) {
            return ['izin', 'Izin keperluan keluarga'];
        }
        if ($score < 93) {
            return ['sick', 'Sakit'];
        }
        if ($score < 98) {
            return ['absent', 'Tanpa keterangan'];
        }

        return ['return', 'Pulang lebih awal'];
    }

    /**
     * @return array{0:string,1:?string}
     */
    private function pickTeacherStatus(int $teacherId, int $scheduleId, Carbon $date, int $itemIndex): array
    {
        $statusCycle = ['present', 'late', 'izin', 'sick', 'absent'];
        $status = $statusCycle[($date->dayOfYear + $itemIndex) % count($statusCycle)];

        $reason = match ($status) {
            'late' => 'Terlambat hadir',
            'izin' => 'Izin tugas sekolah',
            'sick' => 'Sakit',
            'absent' => 'Tidak hadir',
            default => null,
        };

        // Add small deterministic shuffle so each day does not look too patterned.
        $score = crc32("teacher-{$teacherId}-{$scheduleId}-{$date->toDateString()}") % 10;
        if ($status === 'present' && $score >= 8) {
            return ['late', 'Terlambat hadir'];
        }

        return [$status, $reason];
    }

    private function resolveCheckedInAt(string $status, Carbon $date, string $startTime): ?Carbon
    {
        if (! in_array($status, ['present', 'late', 'return'], true)) {
            return null;
        }

        $start = Carbon::parse($date->toDateString().' '.substr($startTime, 0, 8));

        if ($status === 'late') {
            return $start->copy()->addMinutes((int) ($this->pseudoRandom($start->timestamp, 7, 20)));
        }

        if ($status === 'return') {
            return $start->copy()->addMinutes((int) ($this->pseudoRandom($start->timestamp + 17, 3, 12)));
        }

        return $start->copy()->subMinutes((int) ($this->pseudoRandom($start->timestamp + 31, 0, 4)));
    }

    private function pseudoRandom(int $seed, int $min, int $max): int
    {
        if ($max <= $min) {
            return $min;
        }

        $range = $max - $min + 1;

        return ($seed % $range) + $min;
    }
}
