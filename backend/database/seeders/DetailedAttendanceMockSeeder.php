<?php

namespace Database\Seeders;

use App\Models\Attendance;
use App\Models\Schedule;
use App\Models\StudentProfile;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class DetailedAttendanceMockSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Cleaning old mock data...');
        Attendance::where('source', 'mock')->delete();

        $schedules = Schedule::all();
        $students = StudentProfile::all();

        if ($schedules->isEmpty() || $students->isEmpty()) {
            $this->command->error('Schedules or Students not found. Please run DashboardMockSeeder first.');

            return;
        }

        $this->command->info('Generating detailed 6-month history...');

        $attendances = [];
        // Generate for the last 180 days to populate 6-month charts
        $startDate = now()->subDays(180);
        $endDate = now();

        for ($date = clone $startDate; $date <= $endDate; $date->addDay()) {
            if ($date->isSunday()) {
                continue;
            }

            $dayName = $date->format('l');
            $daySchedules = $schedules->where('day', $dayName);

            foreach ($daySchedules as $schedule) {
                $classStudents = $students->where('class_id', $schedule->class_id);

                foreach ($classStudents as $student) {
                    // Logic to make recent months have better attendance than older ones for "trend" effect
                    $monthDiff = $date->diffInMonths(now());
                    $presentWeight = 80 + (5 - $monthDiff) * 2; // Newer months are "better"

                    $rand = rand(1, 100);
                    if ($rand <= $presentWeight) {
                        $status = 'present';
                    } elseif ($rand <= 92) {
                        $status = 'late';
                    } elseif ($rand <= 95) {
                        $status = 'sick';
                    } elseif ($rand <= 98) {
                        $status = 'excused';
                    } else {
                        $status = 'absent';
                    }

                    $checkIn = null;
                    if ($status === 'present' || $status === 'late') {
                        $baseTime = Carbon::parse($schedule->start_time);
                        $minutesToAdd = $status === 'present' ? rand(0, 14) : rand(16, 60);
                        $checkIn = $date->copy()->setTime($baseTime->hour, $baseTime->minute)->addMinutes($minutesToAdd);
                    }

                    $attendances[] = [
                        'attendee_type' => 'student',
                        'date' => $date->toDateString(),
                        'student_id' => $student->id,
                        'schedule_id' => $schedule->id,
                        'status' => $status,
                        'checked_in_at' => $checkIn,
                        'source' => 'mock',
                        'created_at' => $date->copy()->setTime(16, 0, 0),
                        'updated_at' => $date->copy()->setTime(16, 0, 0),
                    ];

                    if (count($attendances) >= 1000) {
                        Attendance::insert($attendances);
                        $attendances = [];
                    }
                }
            }
        }

        if (count($attendances) > 0) {
            Attendance::insert($attendances);
        }

        $this->command->info('Detailed mock data seeded successfully!');
    }
}
