<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class ProductionSeeder extends Seeder
{
    /**
     * Seed the application's database with essential data only.
     */
    public function run(): void
    {
        $this->call([
            SchoolYearSeeder::class,
            SemesterSeeder::class,
            MajorSeeder::class,
            AdminSeeder::class,
            SettingSeeder::class,
            // You can add TeacherSeeder if datagurufix.txt contains real data
            // TeacherSeeder::class,
        ]);
    }
}
