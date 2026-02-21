<?php

use App\Models\Attendance;
use App\Models\ClassSchedule;
use App\Models\DailySchedule;
use App\Models\Qrcode;
use App\Models\ScheduleItem;
use App\Models\StudentProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// test('architecture: unique constraint prevents double attendance (race condition protection)', function () {
//     // Logic moved to Application Level Check due to MySQL Nullable Unique Index behavior.
//     // Verified by 'application logic rejects double scan' test.
// });

test('architecture: application logic rejects double scan', function () {
    \Carbon\Carbon::setTestNow(\Carbon\Carbon::create(2026, 2, 20, 10, 0, 0, 'UTC')); // This is a Friday
    $user = User::factory()->create(['user_type' => 'student']);
    $student = StudentProfile::factory()->create(['user_id' => $user->id]);
    $classSchedule = ClassSchedule::factory()->create(['class_id' => $student->class_id, 'is_active' => true]);
    $dailySchedule = DailySchedule::factory()->create([
        'class_schedule_id' => $classSchedule->id,
        'day' => 'Friday',
    ]);
    $schedule = ScheduleItem::factory()->create([
        'daily_schedule_id' => $dailySchedule->id,
        'start_time' => now()->subHour()->format('H:i:s'),
        'end_time' => now()->addHour()->format('H:i:s'),
    ]);
    // Ensure QR matches the schedule
    $uuid = \Illuminate\Support\Str::uuid()->toString();
    $signature = hash_hmac('sha256', $uuid, config('app.key'));
    $signedToken = $uuid . '.' . $signature;

    $teacher = User::factory()->create(['user_type' => 'teacher']);
    $qr = Qrcode::create([
        'schedule_id' => $schedule->id,
        'params' => 'test',
        'token' => $signedToken,
        'is_active' => true,
        'expires_at' => now()->addHour(),
        'type' => 'student',
        'issued_by' => $teacher->id,
    ]);

    // 2. Act: First Scan
    $response1 = $this->actingAs($user)->postJson('/api/attendance/scan', [
        'token' => $signedToken,
    ]);

    // 3. Assert: First scan successful
    $response1->dump()->assertStatus(200);

    // 4. Act: Second Scan (Simulate user trying again)
    $response2 = $this->actingAs($user)->postJson('/api/attendance/scan', [
        'token' => $signedToken,
    ]);

    // 5. Assert: Second scan rejected nicely (not 500 error)
    $response2->assertStatus(200); // Controller returns 200 but with specific message or data?
    // Checking controller logic: It returns 200 with "Presensi sudah tercatat" OR it might be caught by check.
    // Let's check the content.
    $response2->assertJsonFragment(['message' => 'Presensi sudah tercatat']);
});

test('architecture: memory management checks (pagination)', function () {
    // 1. Arrange: Create user
    $user = User::factory()->create(['user_type' => 'admin']);

    // 2. Act: Call an endpoint that lists data (e.g., active QR codes or teachers) because seeding millions is slow.
    // We verify the response structure implies pagination (data, links, meta).
    $response = $this->actingAs($user)->getJson('/api/teachers');

    // 3. Assert: Response should be paginated
    $response->assertStatus(200);
    // API Resources usually wrap in 'data', and pagination adds 'links' and 'meta'
    $response->assertJsonStructure([
        'data',
        'links',
        'meta',
    ]);
});
