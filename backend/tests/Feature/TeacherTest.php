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
        'subject' => ['Math'],
        'jabatan' => ['Guru'],
    ]);

    $response->assertStatus(201);
    $this->assertDatabaseHas('users', ['username' => 'newteacher']);
    // Subject is stored as JSON in DB, so we might need JSON search if driver supports it,
    // or just check individual fields. DatabaseHas for JSON can be tricky depending on driver.
    $this->assertDatabaseHas('teacher_profiles', ['nip' => 'NIP999']);
});

it('allows admin to update a teacher', function () {
    $admin = User::factory()->admin()->create();
    $teacher = User::factory()->teacher()->create();

    $response = $this->actingAs($admin)->putJson("/api/teachers/{$teacher->teacherProfile->id}", [
        'name' => 'Updated Teacher',
        'subject' => ['Science'],
        'jabatan' => ['Guru', 'Wali Kelas'],
    ]);

    $response->assertStatus(200);
    $this->assertDatabaseHas('users', ['id' => $teacher->id, 'name' => 'Updated Teacher']);

    $teacherProfile = $teacher->teacherProfile->fresh();
    expect($teacherProfile->subject)->toBe(['Science']);
    expect($teacherProfile->jabatan)->toBe(['Guru', 'Wali Kelas']);
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

    $response = $this->actingAs($admin)->postJson('/api/import/guru', $payload);

    $response->assertStatus(201)
        ->assertJsonFragment(['success_count' => 2]);
});
