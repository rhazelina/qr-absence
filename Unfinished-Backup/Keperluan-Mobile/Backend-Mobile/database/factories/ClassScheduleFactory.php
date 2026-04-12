<?php

namespace Database\Factories;

use App\Models\Classes;
use App\Models\ClassSchedule;
use Illuminate\Database\Eloquent\Factories\Factory;

class ClassScheduleFactory extends Factory
{
    protected $model = ClassSchedule::class;

    public function definition(): array
    {
        return [
            'class_id' => Classes::factory(),
            'semester' => 1,
            'year' => '2024/2025',
            'is_active' => true,
        ];
    }
}
