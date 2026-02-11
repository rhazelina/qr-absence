<?php

use App\Models\Classes;
use App\Models\Major;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

it('allows admin to list classes', function () {
    $admin = User::factory()->admin()->create();
    Classes::factory()->count(3)->create();

    $response = $this->actingAs($admin)->getJson('/api/classes');

    $response->assertStatus(200);
});

it('allows admin to create a class', function () {
    $admin = User::factory()->admin()->create();
    $major = Major::factory()->create();

    $response = $this->actingAs($admin)->postJson('/api/classes', [
        'grade' => 'XII',
        'label' => 'RPL 1',
        'major_id' => $major->id,
    ]);

    $response->assertStatus(201);
    $this->assertDatabaseHas('classes', ['label' => 'RPL 1']);
});

it('allows teacher to upload class schedule image', function () {
    Storage::fake('public');
    $waka = User::factory()->waka()->create();
    $class = Classes::factory()->create();

    $file = UploadedFile::fake()->image('class_schedule.jpg');

    $response = $this->actingAs($waka)->postJson("/api/classes/{$class->id}/schedule-image", [
        'file' => $file,
    ]);

    $response->assertStatus(200);
    Storage::disk('public')->assertExists($class->fresh()->schedule_image_path);
});

it('allows student to see their class info', function () {
    $student = User::factory()->student()->create();
    $student->studentProfile->update(['is_class_officer' => true]);

    $response = $this->actingAs($student)->getJson('/api/me/class');

    $response->assertStatus(200)
        ->assertJsonPath('id', $student->studentProfile->class_id);
});
