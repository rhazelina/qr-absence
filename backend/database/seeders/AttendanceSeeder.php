<?php

namespace Database\Seeders;

use App\Models\Attendance;
use App\Models\Schedule;
use App\Models\StudentProfile;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class AttendanceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all students
        $students = StudentProfile::all();

        if ($students->isEmpty()) {
            $this->command->info('No students found. Skipping AttendanceSeeder.');
            return;
        }

        // Get schedules for the last 30 days
        // We need to simulate attendance for past days based on schedules.
        // Assuming schedules are recurring weekly.
        
        $startDate = Carbon::now()->subDays(30);
        $endDate = Carbon::now();

        $this->command->info('Generating attendance records...');

        foreach ($students as $student) {
            // Find schedules for this student's class
            $schedules = Schedule::where('class_id', $student->class_id)->get();

            if ($schedules->isEmpty()) {
                continue;
            }

            // Iterate through each day from start to end date
            $currentDate = $startDate->copy();
            while ($currentDate <= $endDate) {
                // Skip weekends
                if ($currentDate->isWeekend()) {
                    $currentDate->addDay();
                    continue;
                }

                $dayName = $currentDate->format('l'); // Monday, Tuesday, etc.

                // Find schedules for this day
                $daysSchedules = $schedules->where('day', $dayName);

                foreach ($daysSchedules as $schedule) {
                    // Randomly assign status
                    // 80% Present, 5% Late, 5% Sick, 5% Permission, 5% Absent
                    $rand = rand(1, 100);
                    $status = 'present';
                    $reason = null;

                    if ($rand > 80 && $rand <= 85) {
                        $status = 'late';
                    } elseif ($rand > 85 && $rand <= 90) {
                        $status = 'sick';
                        $reason = 'Sakit demam';
                    } elseif ($rand > 90 && $rand <= 95) {
                        $status = 'izin';
                        $reason = 'Acara keluarga';
                    } elseif ($rand > 95) {
                        $status = 'absent';
                    }

                    // Create attendance record
                    Attendance::create([
                        'attendee_type' => 'student',
                        'student_id' => $student->id,
                        'schedule_id' => $schedule->id,
                        'date' => $currentDate->toDateString(),
                        'status' => $status,
                        'checked_in_at' => $status === 'present' || $status === 'late' 
                            ? $currentDate->copy()->setTimeFromTimeString($schedule->start_time)->addMinutes(rand(0, 30)) 
                            : null,
                        'source' => 'seeder',
                        'reason' => $reason,
                    ]);
                }

                $currentDate->addDay();
            }
        }
    }
}
