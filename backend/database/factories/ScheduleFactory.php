<?php

namespace Database\Factories;

use App\Models\Classes;
use App\Models\Schedule;
use App\Models\TeacherProfile;
use Illuminate\Database\Eloquent\Factories\Factory;

class ScheduleFactory extends Factory
{
    protected $model = Schedule::class;

    public function definition(): array
    {
        return [
            'day' => fake()->randomElement(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']),
            'start_time' => '07:00:00',
            'end_time' => '08:30:00',
            'title' => fake()->words(3, true),
            'subject_name' => fake()->word(),
            'teacher_id' => TeacherProfile::factory(),
            'class_id' => Classes::factory(),
            'room' => 'Lab '.fake()->numerify('##'),
            'semester' => 1,
            'year' => 2025,
        ];
    }
}
