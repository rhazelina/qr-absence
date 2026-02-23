<?php

use App\Models\Classes;
use App\Models\Major;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('FAILS when importing with missing mandatory fields (Simulation of Legacy Frontend)', function () {
    $admin = User::factory()->admin()->create();
    $class = Classes::factory()->create();

    // Simulation of payload from frontend/src/pages/Admin/DataSiswa.jsx
    // It only sends: name, nisn, major, grade
    $payload = [
        'items' => [
            [
                'name' => 'Legacy Student',
                'nisn' => '9999999999',
                'major' => 'RPL',
                'grade' => 'XII RPL 2',
            ],
        ],
    ];

    $response = $this->actingAs($admin)->postJson('/api/import/siswa', $payload);

    // This SHOULD fail because username, nis, gender, address, and class_id are missing
    $response->assertStatus(422)
        ->assertJsonStructure([
            'total_rows',
            'success_count',
            'failed_count',
            'errors' => [
                '*' => ['row', 'column', 'message'],
            ],
        ]);
});

it('SUCCEEDS when importing valid payload', function () {
    $admin = User::factory()->admin()->create();
    $class = Classes::factory()->create();

    $payload = [
        'items' => [
            [
                'name' => 'Deskta Student',
                'username' => 'deskta1',
                'email' => 'deskta1@example.com',
                'password' => 'password123',
                'nisn' => '8888888888',
                'nis' => '88888',
                'gender' => 'L',
                'address' => 'Jl. Deskta',
                'class_id' => $class->id, // Frontend now maps this correctly to ID
            ],
        ],
    ];

    $response = $this->actingAs($admin)->postJson('/api/import/siswa', $payload);

    $response->assertStatus(201);
    $this->assertDatabaseHas('student_profiles', [
        'nisn' => '8888888888',
        'class_id' => $class->id,
    ]);
});

it('SUCCEEDS when password is short or missing (Defaults to NISN)', function () {
    $admin = User::factory()->admin()->create();
    $class = Classes::factory()->create();

    $payload = [
        'items' => [
            [
                'name' => 'Short Pass Student',
                'username' => 'shortpass',
                'nisn' => '7777777777',
                'nis' => '77777',
                'gender' => 'P',
                'address' => 'Jl. Short',
                'class_id' => $class->id,
                'password' => '123', // Short password
            ],
        ],
    ];

    $response = $this->actingAs($admin)->postJson('/api/import/siswa', $payload);

    $response->assertStatus(201);
    $this->assertDatabaseHas('users', ['username' => 'shortpass']);
});
