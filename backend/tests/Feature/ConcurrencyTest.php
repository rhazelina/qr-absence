<?php

use App\Models\Qrcode;
use App\Models\Schedule;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('returns existing active qr code if generated again for same schedule (idempotency)', function () {
    // 1. Setup
    $teacher = User::factory()->teacher()->create();
    $teacher->refresh();
    $schedule = Schedule::factory()->create(['teacher_id' => $teacher->teacherProfile->id]);

    // 2. First Generation
    $response1 = $this->actingAs($teacher)->postJson('/api/qrcodes/generate', [
        'schedule_id' => $schedule->id,
        'type' => 'student',
        'expires_in_minutes' => 30,
    ]);

    $response1->assertStatus(201);
    $token1 = $response1->json('payload.token');

    // 3. Second Generation (Concurrent simulation)
    $response2 = $this->actingAs($teacher)->postJson('/api/qrcodes/generate', [
        'schedule_id' => $schedule->id,
        'type' => 'student',
        'expires_in_minutes' => 30,
    ]);

    $response2->assertStatus(201); // 201 or 200 is fine, logic returns the object
    $token2 = $response2->json('payload.token');

    // 4. Assertions
    expect($token1)->toBe($token2);

    // Ensure only one active QR exists in DB
    $activeCount = Qrcode::where('schedule_id', $schedule->id)
        ->where('is_active', true)
        ->count();

    expect($activeCount)->toBe(1);
});

it('generates new qr code if previous one is expired', function () {
    // 1. Setup
    $teacher = User::factory()->teacher()->create();
    $teacher->refresh();
    $schedule = Schedule::factory()->create(['teacher_id' => $teacher->teacherProfile->id]);

    // 2. First Generation (Expired)
    $qr = Qrcode::factory()->create([
        'schedule_id' => $schedule->id,
        'type' => 'student',
        'is_active' => true,
        'expires_at' => now()->subMinute(), // Expired
        'issued_by' => $teacher->id,
    ]);

    // 3. Generate New
    $response = $this->actingAs($teacher)->postJson('/api/qrcodes/generate', [
        'schedule_id' => $schedule->id,
        'type' => 'student',
    ]);

    $response->assertStatus(201);
    $newToken = $response->json('payload.token');

    // 4. Assertions
    expect($newToken)->not->toBe($qr->token);

    // Old one should be deactivated (handled by logic)
    $qr->refresh();
    expect($qr->is_active)->toBeFalse();

    // Only one active now
    $activeCount = Qrcode::where('schedule_id', $schedule->id)
        ->where('is_active', true)
        ->count();

    expect($activeCount)->toBe(1);
});
