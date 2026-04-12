<?php

namespace Database\Seeders;

use App\Models\SchoolYear;
use App\Models\Semester;
use Illuminate\Database\Seeder;

class SemesterSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $schoolYear = SchoolYear::updateOrCreate(
            ['name' => '2025/2026'],
            [
                'start_year' => 2025,
                'end_year' => 2026,
                'active' => true,
            ]
        );

        Semester::updateOrCreate(
            ['name' => 'Ganjil', 'school_year_id' => $schoolYear->id],
            ['active' => false]
        );

        Semester::updateOrCreate(
            ['name' => 'Genap', 'school_year_id' => $schoolYear->id],
            ['active' => true]
        );
    }
}
