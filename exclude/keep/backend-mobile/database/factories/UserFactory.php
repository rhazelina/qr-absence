<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'username' => fake()->unique()->userName(),
            'email' => fake()->unique()->safeEmail(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            'user_type' => 'student',
            'active' => true,
        ];
    }

    public function teacher(): static
    {
        return $this->state(fn (array $attributes) => [
            'user_type' => 'teacher',
        ])->afterCreating(function ($user) {
            \App\Models\TeacherProfile::factory()->create(['user_id' => $user->id]);
        });
    }

    public function student(): static
    {
        return $this->state(fn (array $attributes) => [
            'user_type' => 'student',
        ])->afterCreating(function ($user) {
            \App\Models\StudentProfile::factory()->create(['user_id' => $user->id]);
        });
    }

    public function admin(): static
    {
        return $this->state(fn (array $attributes) => [
            'user_type' => 'admin',
        ])->afterCreating(function ($user) {
            \App\Models\AdminProfile::factory()->create([
                'user_id' => $user->id,
                'type' => 'admin',
            ]);
        });
    }

    public function waka(): static
    {
        return $this->state(fn (array $attributes) => [
            'user_type' => 'admin',
        ])->afterCreating(function ($user) {
            \App\Models\AdminProfile::factory()->create([
                'user_id' => $user->id,
                'type' => 'waka',
            ]);
        });
    }
}
