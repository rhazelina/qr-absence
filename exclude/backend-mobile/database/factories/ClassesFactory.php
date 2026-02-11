<?php

namespace Database\Factories;

use App\Models\Classes;
use App\Models\Major;
use Illuminate\Database\Eloquent\Factories\Factory;

class ClassesFactory extends Factory
{
    protected $model = Classes::class;

    public function definition(): array
    {
        return [
            'grade' => fake()->randomElement(['X', 'XI', 'XII']),
            'label' => fake()->word(),
            'major_id' => Major::factory(),
        ];
    }
}
