<?php

namespace Database\Factories;

use App\Models\Classes;
use App\Models\StudentProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class StudentProfileFactory extends Factory
{
    protected $model = StudentProfile::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'nisn' => fake()->unique()->numerify('##########'),
            'nis' => fake()->unique()->numerify('####'),
            'gender' => fake()->randomElement(['L', 'P']),
            'address' => fake()->address(),
            'class_id' => Classes::factory(),
            'is_class_officer' => false,
        ];
    }
}
