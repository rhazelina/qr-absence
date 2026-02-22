<?php

namespace Database\Seeders;

use App\Models\Classes;
use App\Models\ClassSchedule;
use App\Models\DailySchedule;
use App\Models\Major;
use App\Models\ScheduleItem;
use App\Models\Subject;
use App\Models\TeacherProfile;
use Illuminate\Database\Seeder;

class ClassScheduleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Find 'XII RPL 2'
        $major = Major::where('code', 'RPL')->first();

        if (! $major) {
            $this->command->error('Major RPL not found!');

            return;
        }

        $class = Classes::where('grade', '12')
            ->where('major_id', $major->id)
            ->where('label', '2')
            ->first();

        if (! $class) {
            $this->command->error('Class XII RPL 2 not found!');

            return;
        }

        // 2. Create or update class schedule for Semester Genap 2025/2026 (Active)
        // Assuming current semester is active.
        $classSchedule = ClassSchedule::firstOrCreate(
            ['class_id' => $class->id, 'semester' => '2', 'year' => date('Y')],
            ['is_active' => true]
        );

        $days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        $subjects = Subject::all();
        $teachers = TeacherProfile::all();

        if ($subjects->isEmpty() || $teachers->isEmpty()) {
            $this->command->error('No subjects or teachers found. Please seed them first.');

            return;
        }

        foreach ($days as $day) {
            $dailySchedule = DailySchedule::firstOrCreate([
                'class_schedule_id' => $classSchedule->id,
                'day' => $day,
            ]);

            // Clear existing items to avoid duplicates on re-run
            $dailySchedule->scheduleItems()->delete();

            // Create 4 periods per day
            for ($i = 0; $i < 4; $i++) {
                $startHour = 7 + $i;
                $startTime = sprintf('%02d:00:00', $startHour);
                $endTime = sprintf('%02d:45:00', $startHour);

                $subject = $subjects->random();

                // Force assign teacher ID 1 to the first period of every day
                if ($i === 0) {
                    $teacher = TeacherProfile::find(1);
                } else {
                    $teacher = $teachers->random();
                }

                ScheduleItem::create([
                    'daily_schedule_id' => $dailySchedule->id,
                    'subject_id' => $subject->id,
                    'teacher_id' => $teacher->id,
                    'start_time' => $startTime,
                    'end_time' => $endTime,
                    'room' => 'R. '.($class->label ?? 'Umum'),
                    'keterangan' => 'Pelajaran '.($i + 1),
                ]);
            }
        }

        $this->command->info('Schedule for XII RPL 2 created successfully!');
    }
}
