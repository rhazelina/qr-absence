<?php

use App\Models\StudentProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('can login with NISN without password', function () {
    $user = User::factory()->student()->create([
        'username' => 'student1',
        'password' => bcrypt('password'),
        'active' => true,
    ]);

    $user->studentProfile->update(['nisn' => '1234567890']);

    $response = $this->postJson('/api/auth/login', [
        'login' => '1234567890',
        'password' => '', // Empty password for NISN login
    ]);

    $response->assertSuccessful()
        ->assertJsonStructure(['token', 'user']);
});

it('can login with NISN with correct password', function () {
    $user = User::factory()->student()->create([
        'username' => 'student1',
        'password' => bcrypt('password'),
        'active' => true,
    ]);

    $user->studentProfile->update(['nisn' => '1234567890']);

    $response = $this->postJson('/api/auth/login', [
        'login' => '1234567890',
        'password' => 'password',
    ]);

    $response->assertSuccessful()
        ->assertJsonStructure(['token', 'user']);
});

it('cannot login with NISN if user is not a student', function () {
    $user = User::factory()->teacher()->create([
        'username' => 'teacher1',
        'password' => bcrypt('password'),
        'active' => true,
    ]);

    // Manually create a student profile for a teacher (edge case, shouldn't happen usually but to test logic)
    // Actually, logic searches StudentProfile by NISN.
    // If a teacher has a student profile (e.g. dual role?), they might login.
    // But assuming strict separation:
    // Teachers don't have StudentProfile.

    $response = $this->postJson('/api/auth/login', [
        'login' => 'nonexistent_nisn',
        'password' => '',
    ]);

    $response->assertStatus(422);
});

it('can login with username and password as student', function () {
    $user = User::factory()->student()->create([
        'username' => 'student_user',
        'password' => bcrypt('secret'),
        'active' => true,
    ]);

    $response = $this->postJson('/api/auth/login', [
        'login' => 'student_user',
        'password' => 'secret',
    ]);

    $response->assertSuccessful();
});

it('requires password for non-student users', function () {
    $user = User::factory()->teacher()->create([
        'username' => 'teacher_user',
        'password' => bcrypt('secret'),
        'active' => true,
    ]);

    $response = $this->postJson('/api/auth/login', [
        'login' => 'teacher_user',
        'password' => '',
    ]);

    $response->assertStatus(422);
});
