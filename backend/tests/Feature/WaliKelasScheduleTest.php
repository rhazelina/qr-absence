<?php

use App\Models\Classes;
use App\Models\ClassSchedule;
use App\Models\DailySchedule;
use App\Models\ScheduleItem;
use App\Models\Subject;
use App\Models\TeacherProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('can fetch homeroom schedules as a wali kelas', function () {
    // 1. Setup Data
    $teacherUser = User::factory()->create(['user_type' => 'teacher']);
    $class = Classes::factory()->create();
    $teacherProfile = TeacherProfile::factory()->create([
        'user_id' => $teacherUser->id,
        'homeroom_class_id' => $class->id,
    ]);

    $subject = Subject::factory()->create();

    $classSchedule = ClassSchedule::factory()->create([
        'class_id' => $class->id,
        'is_active' => true,
    ]);

    $today = now()->format('l');
    $dailySchedule = DailySchedule::factory()->create([
        'class_schedule_id' => $classSchedule->id,
        'day' => $today,
    ]);

    $scheduleItem = ScheduleItem::factory()->create([
        'daily_schedule_id' => $dailySchedule->id,
        'subject_id' => $subject->id,
        'teacher_id' => $teacherProfile->id,
    ]);

    // 2. Act
    $response = $this->actingAs($teacherUser)
        ->getJson('/api/me/homeroom/schedules?date='.now()->toDateString());

    // 3. Assert
    $response->assertStatus(200);
    $response->assertJsonCount(1);
    $response->assertJsonPath('0.id', $scheduleItem->id);
    $response->assertJsonPath('0.subject.id', $subject->id);
});

it('returns 404 if teacher has no homeroom', function () {
    $teacherUser = User::factory()->create(['user_type' => 'teacher']);
    TeacherProfile::factory()->create([
        'user_id' => $teacherUser->id,
        'homeroom_class_id' => null,
    ]);

    $response = $this->actingAs($teacherUser)
        ->getJson('/api/me/homeroom/schedules');

    $response->assertStatus(404);
});
