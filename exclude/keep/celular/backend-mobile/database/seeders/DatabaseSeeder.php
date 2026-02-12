<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            AdminSeeder::class,
            WakaSeeder::class,
            // ComprehensiveDataSeeder includes: Majors, Teachers, Classes with Wali Kelas, Students
            ComprehensiveDataSeeder::class,
            // Add schedules (mata pelajaran) for all classes
            ClassScheduleSeeder::class,
            // Optional: Add sample attendance data
            // SampleAttendanceSeeder::class,
            ClassOfficerSeeder::class,
        ]);
    }
}
