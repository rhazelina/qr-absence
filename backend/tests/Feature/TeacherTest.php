<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

it('allows admin to list teachers', function () {
    $admin = User::factory()->admin()->create();
    User::factory()->count(3)->teacher()->create();

    $response = $this->actingAs($admin)->getJson('/api/teachers');

    $response->assertStatus(200)
        ->assertJsonStructure(['data', 'links']);
});

it('allows admin to create a teacher', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->postJson('/api/teachers', [
        'name' => 'New Teacher',
        'username' => 'newteacher',
        'email' => 'teach@school.com',
        'password' => 'password',
        'nip' => 'NIP999',
        'subject' => 'Math',
    ]);

    $response->assertStatus(201);
    $this->assertDatabaseHas('users', ['username' => 'newteacher']);
    $this->assertDatabaseHas('teacher_profiles', ['nip' => 'NIP999']);
});

it('allows admin to update a teacher', function () {
    $admin = User::factory()->admin()->create();
    $teacher = User::factory()->teacher()->create();

    $response = $this->actingAs($admin)->putJson("/api/teachers/{$teacher->teacherProfile->id}", [
        'name' => 'Updated Teacher',
        'subject' => 'Science',
    ]);

    $response->assertStatus(200);
    $this->assertDatabaseHas('users', ['id' => $teacher->id, 'name' => 'Updated Teacher']);
    $this->assertDatabaseHas('teacher_profiles', ['id' => $teacher->teacherProfile->id, 'subject' => 'Science']);
});

it('allows teacher to upload schedule image', function () {
    Storage::fake('public');
    $teacher = User::factory()->teacher()->create();

    $file = UploadedFile::fake()->image('schedule.jpg');

    $response = $this->actingAs($teacher)->postJson('/api/me/schedule-image', [
        'file' => $file,
    ]);

    $response->assertStatus(200);

    $path = $teacher->teacherProfile->fresh()->schedule_image_path;
    Storage::disk('public')->assertExists($path);
});

it('allows admin to import teachers', function () {
    $admin = User::factory()->admin()->create();

    $payload = [
        'items' => [
            [
                'name' => 'T1',
                'username' => 't1',
                'nip' => '111',
                'subject' => 'Bio',
            ],
            [
                'name' => 'T2',
                'username' => 't2',
                'nip' => '222',
                'subject' => 'Chem',
            ],
        ],
    ];

    $response = $this->actingAs($admin)->postJson('/api/teachers/import', $payload);

    $response->assertStatus(201)
        ->assertJson(['created' => 2]);
});
