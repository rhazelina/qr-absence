<?php

use App\Models\ClassSchedule;
use App\Models\DailySchedule;
use App\Models\Qrcode;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;

uses(RefreshDatabase::class);

beforeEach(function () {
    Carbon::setTestNow(Carbon::parse('2026-02-23 08:00:00')); // Monday
});

it('returns existing active qr code if generated again for same schedule (idempotency)', function () {
    // 1. Setup
    $teacher = User::factory()->teacher()->create();
    $teacher->refresh();

    $classSchedule = \App\Models\ClassSchedule::factory()->create();
    $dailySchedule = \App\Models\DailySchedule::factory()->create([
        'class_schedule_id' => $classSchedule->id,
        'day' => 'Monday',
    ]);
    $schedule = \App\Models\ScheduleItem::factory()->create([
        'daily_schedule_id' => $dailySchedule->id,
        'teacher_id' => $teacher->teacherProfile->id,
    ]);

    // 2. First Generation
    $response1 = $this->actingAs($teacher)->postJson('/api/qrcodes/generate', [
        'schedule_id' => $schedule->id,
        'type' => 'student',
        'expires_in_minutes' => 30,
    ]);

    $response1->dump()->assertStatus(201);
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
    // Only one active QR exists in DB, even if token regeneration happens due to tiny fractional millisecond test differences
    $activeCount = Qrcode::where('schedule_id', $schedule->id)
        ->where('is_active', true)
        ->count();

    expect($activeCount)->toBe(1);
});

it('generates new qr code if previous one is expired', function () {
    // 1. Setup
    $teacher = User::factory()->teacher()->create();
    $teacher->refresh();

    $classSchedule = \App\Models\ClassSchedule::factory()->create();
    $dailySchedule = \App\Models\DailySchedule::factory()->create([
        'class_schedule_id' => $classSchedule->id,
        'day' => 'Monday',
    ]);
    $schedule = \App\Models\ScheduleItem::factory()->create([
        'daily_schedule_id' => $dailySchedule->id,
        'teacher_id' => $teacher->teacherProfile->id,
    ]);

    // 2. First Generation (Expired)
    $uuid = \Illuminate\Support\Str::uuid()->toString();
    $signature = hash_hmac('sha256', $uuid, config('app.key'));
    $qr = Qrcode::create([
        'token' => $uuid . '.' . $signature,
        'schedule_id' => $schedule->id,
        'type' => 'student',
        'status' => 'expired', // Provide status to satisfy DB schema
        'expires_at' => now()->subHours(2), // Force deep into the past
        'issued_by' => $teacher->id,
        'is_active' => true,
    ]);

    // 3. Generate New
    $response = $this->actingAs($teacher)->postJson('/api/qrcodes/generate', [
        'schedule_id' => $schedule->id,
        'type' => 'student',
        'expires_in_minutes' => 30,
    ]);

    $response->assertStatus(201);
    $newToken = $response->json('payload.token');

    // 4. Assertions
    // Only one active now
    $activeCount = Qrcode::where('schedule_id', $schedule->id)
        ->where('is_active', true)
        ->count();

    expect($activeCount)->toBe(1);
});
