<?php

use App\Models\Qrcode;
use App\Models\StudentProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('architecture: application logic rejects double scan', function () {
    config(['app.demo_mode' => true]);
    \Carbon\Carbon::setTestNow(\Carbon\Carbon::create(2026, 2, 20, 10, 0, 0, 'UTC'));

    $classSchedule = \App\Models\ClassSchedule::factory()->create();
    $user = User::factory()->create(['user_type' => 'student']);
    StudentProfile::factory()->create(['user_id' => $user->id, 'class_id' => $classSchedule->class_id]);

    $dailySchedule = \App\Models\DailySchedule::factory()->create(['class_schedule_id' => $classSchedule->id]);
    $schedule = \App\Models\ScheduleItem::factory()->create(['daily_schedule_id' => $dailySchedule->id]);

    $uuid = \Illuminate\Support\Str::uuid()->toString();
    $signature = hash_hmac('sha256', $uuid, config('app.key'));
    $signedToken = $uuid.'.'.$signature;

    $teacher = User::factory()->create(['user_type' => 'teacher']);
    Qrcode::create([
        'schedule_id' => $schedule->id,
        'params' => 'test',
        'token' => $signedToken,
        'is_active' => true,
        'expires_at' => now()->addHour(),
        'type' => 'student',
        'issued_by' => $teacher->id,
    ]);

    $response1 = $this->actingAs($user)->postJson('/api/attendance/scan', ['token' => $signedToken]);
    $response1->assertStatus(200);

    $response2 = $this->actingAs($user)->postJson('/api/attendance/scan', ['token' => $signedToken]);
    $response2->assertStatus(200);
    $response2->assertJsonFragment(['message' => 'Presensi sudah tercatat']);
});

test('architecture: memory management checks (pagination)', function () {
    $user = User::factory()->create(['user_type' => 'admin']);
    $response = $this->actingAs($user)->getJson('/api/teachers');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'data',
            'links',
            'meta',
        ]);
});
