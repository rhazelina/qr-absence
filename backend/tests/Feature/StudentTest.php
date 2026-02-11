<?php

use App\Models\Classes;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('allows admin to list students', function () {
    $admin = User::factory()->admin()->create();
    $class = Classes::factory()->create();
    User::factory()->count(3)->student()->create(); // Creates user + student profile (via factory callback)

    $response = $this->actingAs($admin)->getJson('/api/students');

    $response->assertStatus(200)
        ->assertJsonStructure(['data', 'links']);
});

it('allows admin to create a student', function () {
    $admin = User::factory()->admin()->create();
    $class = Classes::factory()->create();

    $response = $this->actingAs($admin)->postJson('/api/students', [
        'name' => 'New Student',
        'username' => 'newstudent',
        'email' => 'new@student.com',
        'password' => 'password',
        'nisn' => '1234567890',
        'nis' => '12345',
        'gender' => 'L',
        'address' => 'Jl. Baru',
        'class_id' => $class->id,
        'phone' => '08123456789',
    ]);

    $response->assertStatus(201);
    $this->assertDatabaseHas('users', ['username' => 'newstudent']);
    $this->assertDatabaseHas('student_profiles', ['nisn' => '1234567890']);
});

it('allows admin to update a student', function () {
    $admin = User::factory()->admin()->create();
    $student = User::factory()->student()->create();
    $newClass = Classes::factory()->create();

    $response = $this->actingAs($admin)->putJson("/api/students/{$student->studentProfile->id}", [
        'name' => 'Updated Name',
        'class_id' => $newClass->id,
    ]);

    $response->assertStatus(200);
    $this->assertDatabaseHas('users', ['id' => $student->id, 'name' => 'Updated Name']);
    $this->assertDatabaseHas('student_profiles', ['id' => $student->studentProfile->id, 'class_id' => $newClass->id]);
});

it('allows admin to delete a student', function () {
    $admin = User::factory()->admin()->create();
    $student = User::factory()->student()->create();

    $response = $this->actingAs($admin)->deleteJson("/api/students/{$student->studentProfile->id}");

    $response->assertStatus(200);
    $this->assertDatabaseMissing('users', ['id' => $student->id]);
});

it('allows admin to import students', function () {
    $admin = User::factory()->admin()->create();
    $class = Classes::factory()->create();

    $payload = [
        'items' => [
            [
                'name' => 'Imported 1',
                'username' => 'imp1',
                'nisn' => '11111',
                'nis' => '111',
                'gender' => 'L',
                'address' => 'Addr 1',
                'class_id' => $class->id,
            ],
            [
                'name' => 'Imported 2',
                'username' => 'imp2',
                'nisn' => '22222',
                'nis' => '222',
                'gender' => 'P',
                'address' => 'Addr 2',
                'class_id' => $class->id,
            ],
        ],
    ];

    $response = $this->actingAs($admin)->postJson('/api/students/import', $payload);

    $response->assertStatus(201)
        ->assertJson(['created' => 2]);

    $this->assertDatabaseHas('users', ['username' => 'imp1']);
    $this->assertDatabaseHas('users', ['username' => 'imp2']);
});
