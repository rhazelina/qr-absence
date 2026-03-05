<?php

namespace Database\Seeders;

use App\Models\Attendance;
use App\Models\Schedule;
use App\Models\StudentProfile;
use App\Models\TeacherProfile;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class SampleAttendanceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Seeding attendance data...');

        // Get students and teachers
        $students = StudentProfile::with('classRoom')->get();
        $teachers = TeacherProfile::all();
        $schedules = Schedule::all();

        if ($students->isEmpty()) {
            $this->command->warn('No students found. Please run ComprehensiveDataSeeder first.');
            return;
        }

        // Generate attendance for the last 30 days
        $startDate = Carbon::now()->subDays(30);
        $endDate = Carbon::now();

        $attendanceStatuses = ['present', 'late', 'excused', 'sick', 'absent'];
        $attendanceWeights = [70, 15, 5, 5, 5]; // 70% present, 15% late, etc.

        $currentDate = $startDate->copy();
        
        while ($currentDate <= $endDate) {
            // Skip weekends
            if ($currentDate->isWeekend()) {
                $currentDate->addDay();
                continue;
            }

            // Create attendance for each student
            foreach ($students as $student) {
                // Random number of attendance records per day (1-3)
                $recordsCount = rand(1, 3);
                
                for ($i = 0; $i < $recordsCount; $i++) {
                    $status = $this->getWeightedRandomStatus($attendanceStatuses, $attendanceWeights);
                    
                    // Set check-in time based on status
                    $checkInTime = match($status) {
                        'present' => $currentDate->copy()->setTime(7, rand(0, 30)),
                        'late' => $currentDate->copy()->setTime(7, rand(31, 59)),
                        'excused', 'sick' => null,
                        'absent' => null,
                        default => $currentDate->copy()->setTime(7, rand(0, 30)),
                    };

                    // Get a random schedule if available
                    $schedule = $schedules->where('class_id', $student->class_id)->random(1)->first();

                    $attendanceData = [
                        'attendee_type' => 'student',
                        'date' => $currentDate->copy()->setTime(7, 0, 0),
                        'student_id' => $student->id,
                        'teacher_id' => null,
                        'qrcode_id' => null,
                        'schedule_id' => $schedule?->id,
                        'status' => $status,
                        'checked_in_at' => $checkInTime,
                        'source' => $status === 'absent' ? null : 'qr_code',
                        'reason' => in_array($status, ['excused', 'sick', 'absent']) 
                            ? $this->getRandomReason($status) 
                            : null,
                    ];

                    try {
                        Attendance::create($attendanceData);
                    } catch (\Exception $e) {
                        // Skip duplicates
                        continue;
                    }
                }
            }

            // Create teacher attendance (optional, fewer records)
            if ($teachers->isNotEmpty() && rand(1, 3) === 1) {
                $teacher = $teachers->random();
                $schedule = $schedules->random(1)->first();

                try {
                    Attendance::create([
                        'attendee_type' => 'teacher',
                        'date' => $currentDate->copy()->setTime(7, 0, 0),
                        'student_id' => null,
                        'teacher_id' => $teacher->id,
                        'qrcode_id' => null,
                        'schedule_id' => $schedule?->id,
                        'status' => rand(1, 10) <= 9 ? 'present' : 'dinas',
                        'checked_in_at' => $currentDate->copy()->setTime(7, rand(0, 30)),
                        'source' => 'qr_code',
                    ]);
                } catch (\Exception $e) {
                    // Skip duplicates
                }
            }

            $currentDate->addDay();
        }

        $totalAttendance = Attendance::count();
        $this->command->info("✓ Seeded {$totalAttendance} attendance records successfully");
    }

    private function getWeightedRandomStatus(array $statuses, array $weights): string
    {
        $totalWeight = array_sum($weights);
        $random = rand(1, $totalWeight);
        
        $currentWeight = 0;
        foreach ($statuses as $index => $status) {
            $currentWeight += $weights[$index];
            if ($random <= $currentWeight) {
                return $status;
            }
        }
        
        return $statuses[0];
    }

    private function getRandomReason(string $status): string
    {
        $reasons = [
            'sick' => [
                'Sakit demam',
                'Sakit flu',
                'Sakit perut',
                'Sakit kepala',
                'Rawat inap',
            ],
            'excused' => [
                'Izin keperluan keluarga',
                'Izin acara keluarga',
                'Izin urusan penting',
                'Izin mengikuti lomba',
                'Izin keperluan pribadi',
            ],
            'absent' => [
                'Tanpa keterangan',
                'Tidak ada konfirmasi',
            ],
        ];

        $reasonList = $reasons[$status] ?? ['Tanpa keterangan'];
        return $reasonList[array_rand($reasonList)];
    }
}
