<?php

use App\Models\Qrcode;
use App\Models\Schedule;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('allows teacher to generate a QR code for their schedule', function () {
    $teacher = User::factory()->teacher()->create();
    $teacher->refresh(); // Load teacherProfile created in factory callback

    $schedule = Schedule::factory()->create(['teacher_id' => $teacher->teacherProfile->id]);

    $response = $this->actingAs($teacher)->postJson('/api/qrcodes/generate', [
        'schedule_id' => $schedule->id,
        'type' => 'student',
        'expires_in_minutes' => 30,
    ]);

    $response->assertStatus(201)
        ->assertJsonStructure(['qrcode', 'qr_svg', 'payload']);
});

it('allows class officer to generate a QR code for their class', function () {
    $user = User::factory()->student()->create();
    $user->refresh();
    $user->studentProfile->update(['is_class_officer' => true]);

    $schedule = Schedule::factory()->create(['class_id' => $user->studentProfile->class_id]);

    $response = $this->actingAs($user)->postJson('/api/qrcodes/generate', [
        'schedule_id' => $schedule->id,
        'type' => 'student',
    ]);

    $response->assertStatus(201);
});

it('prevents regular student from generating a QR code', function () {
    $student = User::factory()->student()->create();
    $student->refresh();
    $student->studentProfile->update(['is_class_officer' => false]);
    $schedule = Schedule::factory()->create(['class_id' => $student->studentProfile->class_id]);

    $response = $this->actingAs($student)->postJson('/api/qrcodes/generate', [
        'schedule_id' => $schedule->id,
        'type' => 'student',
    ]);

    $response->assertStatus(403);
});

it('allows revoking a QR code', function () {
    $teacher = User::factory()->teacher()->create();
    $teacher->refresh();

    $schedule = Schedule::factory()->create(['teacher_id' => $teacher->teacherProfile->id]);
    $qr = Qrcode::factory()->create([
        'schedule_id' => $schedule->id,
        'issued_by' => $teacher->id,
        'is_active' => true,
    ]);

    $response = $this->actingAs($teacher)->postJson("/api/qrcodes/{$qr->token}/revoke");

    $response->assertStatus(200);
    $this->assertDatabaseHas('qrcodes', [
        'id' => $qr->id,
        'is_active' => false,
    ]);
});
