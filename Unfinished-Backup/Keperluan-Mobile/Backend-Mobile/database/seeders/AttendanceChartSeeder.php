<?php

namespace Database\Seeders;

use App\Models\Attendance;
use App\Models\ClassSchedule;
use App\Models\StudentProfile;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class AttendanceChartSeeder extends Seeder
{
    public function run(): void
    {
        $daysBack = (int) env('ATTENDANCE_CHART_DAYS', 120);
        $studentId = env('ATTENDANCE_CHART_STUDENT_ID');
        $truncateExisting = (bool) env('ATTENDANCE_CHART_TRUNCATE', false);
        $fromEnv = env('ATTENDANCE_CHART_FROM');
        $toEnv = env('ATTENDANCE_CHART_TO');

        $startDate = $fromEnv ? Carbon::parse($fromEnv)->startOfDay() : now()->subDays($daysBack)->startOfDay();
        $endDate = $toEnv ? Carbon::parse($toEnv)->endOfDay() : now()->endOfDay();

        $students = StudentProfile::query()
            ->when($studentId, fn ($q) => $q->where('id', $studentId))
            ->get();

        if ($students->isEmpty()) {
            $this->command?->warn('AttendanceChartSeeder: no students found.');

            return;
        }

        if ($truncateExisting) {
            Attendance::query()
                ->where('attendee_type', 'student')
                ->whereBetween('date', [$startDate->toDateString(), $endDate->toDateString()])
                ->when($studentId, fn ($q) => $q->where('student_id', $studentId))
                ->delete();
        }

        foreach ($students as $student) {
            $classSchedule = ClassSchedule::query()
                ->where('class_id', $student->class_id)
                ->where('is_active', true)
                ->with('dailySchedules.scheduleItems')
                ->latest('id')
                ->first();

            if (! $classSchedule) {
                continue;
            }

            $cursor = $startDate->copy();
            while ($cursor->lte($endDate)) {
                // Keep chart realistic for school days.
                if ($cursor->isWeekend()) {
                    $cursor->addDay();

                    continue;
                }

                $dayName = $cursor->format('l');
                $dailySchedule = $classSchedule->dailySchedules
                    ->first(fn ($d) => strtolower($d->day) === strtolower($dayName));

                if (! $dailySchedule || $dailySchedule->scheduleItems->isEmpty()) {
                    $cursor->addDay();

                    continue;
                }

                foreach ($dailySchedule->scheduleItems as $scheduleItem) {
                    [$status, $reason] = $this->pickStatus($cursor);
                    $checkedInAt = null;

                    if (in_array($status, ['present', 'late', 'return'], true)) {
                        $baseTime = Carbon::parse($cursor->toDateString().' '.$scheduleItem->start_time);
                        $checkedInAt = $status === 'late'
                            ? $baseTime->copy()->addMinutes(rand(10, 25))
                            : $baseTime->copy()->subMinutes(rand(0, 5));
                    }

                    Attendance::updateOrCreate(
                        [
                            'student_id' => $student->id,
                            'schedule_id' => $scheduleItem->id,
                            'date' => $cursor->toDateString(),
                        ],
                        [
                            'attendee_type' => 'student',
                            'status' => $status,
                            'reason' => $reason,
                            'checked_in_at' => $checkedInAt,
                            'source' => 'seeder_chart',
                        ]
                    );
                }

                $cursor->addDay();
            }
        }

        $this->command?->info('AttendanceChartSeeder completed. Students: '.$students->count());
    }

    private function pickStatus(Carbon $date): array
    {
        // Slightly more late on Monday and after holidays.
        $weights = [
            ['status' => 'present', 'weight' => 62, 'reason' => null],
            ['status' => 'late', 'weight' => $date->isMonday() ? 17 : 12, 'reason' => 'Terlambat masuk kelas'],
            ['status' => 'excused', 'weight' => 10, 'reason' => 'Izin kegiatan keluarga'],
            ['status' => 'sick', 'weight' => 9, 'reason' => 'Sakit'],
            ['status' => 'absent', 'weight' => 5, 'reason' => 'Tanpa keterangan'],
            ['status' => 'return', 'weight' => 2, 'reason' => 'Pulang lebih awal'],
        ];

        $total = array_sum(array_column($weights, 'weight'));
        $rand = rand(1, $total);
        $running = 0;

        foreach ($weights as $option) {
            $running += $option['weight'];
            if ($rand <= $running) {
                return [$option['status'], $option['reason']];
            }
        }

        return ['present', null];
    }
}
