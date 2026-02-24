<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\StudentProfile;
use App\Models\Attendance;

class AttendanceChartSeeder extends Seeder
{
    public function run()
    {
        $students = StudentProfile::all();

        foreach ($students as $student) {
            for ($i = 0; $i < 120; $i++) {

                $date = now()->subDays(rand(0, 120));

                Attendance::create([
                    'student_id' => $student->id,
                    'date' => $date,
                    'status' => collect([
                        'present',
                        'present',
                        'present',
                        'late',
                        'excused',
                        'sick',
                        'absent'
                    ])->random(),
                ]);
            }
        }
    }
}