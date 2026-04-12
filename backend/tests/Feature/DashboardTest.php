<?php

use App\Models\Attendance;
use App\Models\Classes;
use App\Models\ClassSchedule;
use App\Models\DailySchedule;
use App\Models\ScheduleItem;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;

uses(RefreshDatabase::class);

beforeEach(function () {
    Carbon::setTestNow(Carbon::parse('2026-02-23 08:00:00')); // Monday
});

it('returns admin summary stats', function () {
    $admin = User::factory()->admin()->create();

    // Create some data
    User::factory()->count(2)->student()->create();
    User::factory()->count(2)->teacher()->create();

    $response = $this->actingAs($admin)->getJson('/api/admin/summary');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'students_count',
            'teachers_count',
            'classes_count',
            'majors_count',
            'rooms_count',
        ]);
});

it('returns waka dashboard stats', function () {
    $waka = User::factory()->waka()->create();

    $response = $this->actingAs($waka)->getJson('/api/waka/dashboard/summary');

    $response->assertStatus(200)
        ->assertJsonStructure(['date', 'statistik', 'trend']);
});

it('returns student dashboard data', function () {
    $student = User::factory()->student()->create();

    $response = $this->actingAs($student)->getJson('/api/me/dashboard/summary');

    $response->assertStatus(200)
        ->assertJsonStructure(['date', 'student', 'schedule_today']);
});

it('returns teacher dashboard data', function () {
    $teacher = User::factory()->teacher()->create();

    $response = $this->actingAs($teacher)->getJson('/api/me/dashboard/teacher-summary');

    $response->assertStatus(200)
        ->assertJsonStructure(['date', 'teacher', 'attendance_summary', 'schedule_today']);
});
it('returns teacher dashboard data via alias', function () {
    $teacher = User::factory()->teacher()->create();

    $response = $this->actingAs($teacher)->getJson('/api/me/teacher/dashboard');

    $response->assertStatus(200)
        ->assertJsonStructure(['date', 'teacher', 'attendance_summary', 'schedule_today']);
});

it('returns wrapped and flat teacher dashboard payloads', function () {
    $teacher = User::factory()->teacher()->create();
    $class = Classes::factory()->create();
    $classSchedule = ClassSchedule::factory()->create([
        'class_id' => $class->id,
        'is_active' => true,
    ]);
    $dailySchedule = DailySchedule::factory()->create([
        'class_schedule_id' => $classSchedule->id,
        'day' => now()->format('l'),
    ]);
    $schedule = ScheduleItem::factory()->create([
        'daily_schedule_id' => $dailySchedule->id,
        'teacher_id' => $teacher->teacherProfile->id,
        'subject_id' => Subject::factory()->create(['name' => 'Bahasa Indonesia'])->id,
    ]);
    Attendance::create([
        'attendee_type' => 'student',
        'student_id' => User::factory()->student()->create()->studentProfile->id,
        'schedule_id' => $schedule->id,
        'status' => 'late',
        'date' => now()->toDateString(),
        'source' => 'manual',
    ]);

    $response = $this->actingAs($teacher)->getJson('/api/me/dashboard/teacher-summary');

    $response->assertOk()
        ->assertJsonPath('data.schedule_today.0.id', $schedule->id)
        ->assertJsonPath('data.today_statistics.late', 1)
        ->assertJsonPath('attendance_summary.late', 1);
});

it('returns teacher dashboard schedules with indonesian day label for today', function () {
    $teacher = User::factory()->teacher()->create();
    $class = Classes::factory()->create();
    $classSchedule = ClassSchedule::factory()->create([
        'class_id' => $class->id,
        'is_active' => true,
    ]);
    $dailySchedule = DailySchedule::factory()->create([
        'class_schedule_id' => $classSchedule->id,
        'day' => 'Monday',
    ]);
    $schedule = ScheduleItem::factory()->create([
        'daily_schedule_id' => $dailySchedule->id,
        'teacher_id' => $teacher->teacherProfile->id,
        'subject_id' => Subject::factory()->create(['name' => 'Matematika'])->id,
    ]);

    $response = $this->actingAs($teacher)->getJson('/api/me/teacher/dashboard');

    $response->assertOk()
        ->assertJsonPath('day_name', 'Senin')
        ->assertJsonPath('schedule_today.0.id', $schedule->id);
});

it('returns student dashboard schedules with indonesian day label for today', function () {
    $student = User::factory()->student()->create();
    $classSchedule = ClassSchedule::factory()->create([
        'class_id' => $student->studentProfile->class_id,
        'is_active' => true,
    ]);
    $dailySchedule = DailySchedule::factory()->create([
        'class_schedule_id' => $classSchedule->id,
        'day' => 'Monday',
    ]);
    $schedule = ScheduleItem::factory()->create([
        'daily_schedule_id' => $dailySchedule->id,
        'subject_id' => Subject::factory()->create(['name' => 'Produktif RPL'])->id,
    ]);

    $response = $this->actingAs($student)->getJson('/api/me/dashboard/summary');

    $response->assertOk()
        ->assertJsonPath('day_name', 'Senin')
        ->assertJsonPath('schedule_today.0.id', $schedule->id);
});

it('returns wrapped homeroom dashboard payload for homeroom teacher', function () {
    $teacher = User::factory()->teacher()->create();
    $class = Classes::factory()->create();
    $teacher->teacherProfile->update(['homeroom_class_id' => $class->id]);

    $response = $this->actingAs($teacher)->getJson('/api/me/homeroom/dashboard');

    $response->assertOk()
        ->assertJsonPath('data.class.id', $class->id)
        ->assertJsonPath('class.id', $class->id)
        ->assertJsonStructure(['data' => ['today_summary', 'schedule_today']]);
});

it('returns 404 for teacher without homeroom dashboard', function () {
    $teacher = User::factory()->teacher()->create();

    $response = $this->actingAs($teacher)->getJson('/api/me/homeroom/dashboard');

    $response->assertStatus(404)
        ->assertJsonPath('message', 'Homeroom class not found');
});
