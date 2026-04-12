<?php

use App\Models\Classes;
use App\Models\ScheduleItem;
use App\Models\StudentProfile;
use App\Models\TeacherProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;

uses(RefreshDatabase::class);

beforeEach(function () {
    Carbon::setTestNow(Carbon::create(2026, 2, 23, 10, 0, 0, 'Asia/Jakarta'));
});

it('bypasses schedule time when demo mode is enabled', function () {
    config(['app.demo_mode' => true]);

    $class = Classes::factory()->create();
    $teacherUser = User::factory()->create(['user_type' => 'teacher']);
    $teacher = TeacherProfile::factory()->create(['user_id' => $teacherUser->id]);
    $studentUser = User::factory()->create(['user_type' => 'student']);
    $student = StudentProfile::factory()->create([
        'user_id' => $studentUser->id,
        'class_id' => $class->id,
        'nisn' => '1234567890',
    ]);

    // Create a schedule for TOMORROW (usually would fail)
    $tomorrowName = now()->addDay()->format('l');
    $classSchedule = \App\Models\ClassSchedule::factory()->create(['class_id' => $class->id, 'is_active' => true]);
    $dailySchedule = \App\Models\DailySchedule::factory()->create(['class_schedule_id' => $classSchedule->id, 'day' => $tomorrowName]);
    $scheduleItem = ScheduleItem::factory()->create([
        'daily_schedule_id' => $dailySchedule->id,
        'teacher_id' => $teacher->id,
    ]);

    $response = $this->actingAs($teacherUser)
        ->postJson('/api/attendance/scan-student', [
            'token' => '1234567890',
            'schedule_id' => $scheduleItem->id,
        ]);

    $response->assertOk()
        ->assertJson([
            'status' => 'present',
        ]);

    $this->assertDatabaseHas('attendances', [
        'student_id' => $student->id,
        'schedule_id' => $scheduleItem->id,
        'status' => 'present',
    ]);
});

it('toggles between present and return and propagates status', function () {
    config(['app.demo_mode' => true]);

    $class = Classes::factory()->create();
    $teacherUser = User::factory()->create(['user_type' => 'teacher']);
    $teacher = TeacherProfile::factory()->create(['user_id' => $teacherUser->id]);
    $studentUser = User::factory()->create(['user_type' => 'student']);
    $student = StudentProfile::factory()->create([
        'user_id' => $studentUser->id,
        'class_id' => $class->id,
        'nisn' => '1234567890',
    ]);

    $now = now();
    $classSchedule = \App\Models\ClassSchedule::factory()->create(['class_id' => $class->id, 'is_active' => true]);
    $dailySchedule = \App\Models\DailySchedule::factory()->create(['class_schedule_id' => $classSchedule->id, 'day' => $now->format('l')]);

    // Create current schedule
    $schedule1 = ScheduleItem::factory()->create([
        'daily_schedule_id' => $dailySchedule->id,
        'teacher_id' => $teacher->id,
        'start_time' => '08:00:00',
        'end_time' => '10:00:00',
    ]);

    // Create subsequent schedule
    $schedule2 = ScheduleItem::factory()->create([
        'daily_schedule_id' => $dailySchedule->id,
        'teacher_id' => $teacher->id,
        'start_time' => '10:00:00',
        'end_time' => '12:00:00',
    ]);

    // 1. First scan: mark as present
    $this->actingAs($teacherUser)
        ->postJson('/api/attendance/scan-student', [
            'token' => '1234567890',
            'schedule_id' => $schedule1->id,
        ])
        ->assertOk()
        ->assertJson(['status' => 'present']);

    $this->assertDatabaseHas('attendances', ['schedule_id' => $schedule1->id, 'status' => 'present']);
    $this->assertDatabaseMissing('attendances', ['schedule_id' => $schedule2->id]);

    // 2. Second scan: mark as return (Pulang) and propagate
    $this->actingAs($teacherUser)
        ->postJson('/api/attendance/scan-student', [
            'token' => '1234567890',
            'schedule_id' => $schedule1->id,
        ])
        ->assertOk()
        ->assertJson(['status' => 'return', 'message' => 'Status presensi siswa diperbarui menjadi: Pulang']);

    $this->assertDatabaseHas('attendances', ['schedule_id' => $schedule1->id, 'status' => 'return']);
    $this->assertDatabaseHas('attendances', [
        'schedule_id' => $schedule2->id,
        'status' => 'return',
        'source' => 'system_propagation',
    ]);

    // 3. Third scan: toggle back to present
    $this->actingAs($teacherUser)
        ->postJson('/api/attendance/scan-student', [
            'token' => '1234567890',
            'schedule_id' => $schedule1->id,
        ])
        ->assertOk()
        ->assertJson(['status' => 'present', 'message' => 'Status presensi siswa diperbarui menjadi: Hadir']);

    $this->assertDatabaseHas('attendances', ['schedule_id' => $schedule1->id, 'status' => 'present']);
});
