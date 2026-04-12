<?php

use App\Models\Attendance;
use App\Models\Classes;
use App\Models\Major;
use App\Models\StudentProfile;
use App\Models\TeacherProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

/**
 * ! BENERIN ANOMALI DATA "XII XII RPL 2"
 */
test('class name is correctly formatted as Grade Roman Major Label', function () {
    $major = Major::factory()->create(['code' => 'RPL']);
    $class = Classes::factory()->create([
        'grade' => '12',
        'major_id' => $major->id,
        'label' => '2',
    ]);

    expect($class->name)->toBe('XII RPL 2');
});

/**
 * ADMIN [DESKTOP] - Class List Check
 */
test('admin can see correct class name and major in class list', function () {
    $admin = User::factory()->create(['user_type' => 'admin']);
    $major = Major::factory()->create(['code' => 'RPL', 'name' => 'Rekayasa Perangkat Lunak']);
    $class = Classes::factory()->create([
        'grade' => '12',
        'major_id' => $major->id,
        'label' => '2',
    ]);

    $response = $this->actingAs($admin)->getJson('/api/classes');

    $response->assertStatus(200)
        ->assertJsonFragment([
            'name' => 'XII RPL 2',
            'major' => 'RPL',
        ]);
});

/**
 * SISWA [DESKTOP] - Error Fixes (MONTH() & 403)
 */
test('student can access /api/me/class without 403', function () {
    $class = Classes::factory()->create(['grade' => '12', 'label' => '2']);
    $user = User::factory()->create(['user_type' => 'student']);
    $student = StudentProfile::factory()->create([
        'user_id' => $user->id,
        'class_id' => $class->id,
        'is_class_officer' => true,
    ]);

    $response = $this->actingAs($user)->getJson('/api/me/class');

    $response->assertStatus(200)
        ->assertJsonFragment(['id' => $class->id]);
});

test('student attendance summary does not crash on sqlite (MONTH function fix)', function () {
    $user = User::factory()->create(['user_type' => 'student']);
    $student = StudentProfile::factory()->create(['user_id' => $user->id]);

    // Create some attendance data
    Attendance::create([
        'student_id' => $student->id,
        'attendee_type' => 'student',
        'date' => now()->format('Y-m-d'),
        'status' => 'present',
    ]);

    $response = $this->actingAs($user)->getJson('/api/me/attendance/summary');

    $response->assertStatus(200)
        ->assertJsonStructure(['status_summary', 'daily_summary']);
});

/**
 * WALI KELAS [DESKTOP] - Error Fixes (403)
 */
test('homeroom teacher can access /api/me/class (homeroom class)', function () {
    $class = Classes::factory()->create(['grade' => '12', 'label' => '2']);
    $user = User::factory()->create(['user_type' => 'teacher']);
    $teacher = TeacherProfile::factory()->create([
        'user_id' => $user->id,
        'homeroom_class_id' => $class->id,
    ]);

    $response = $this->actingAs($user)->getJson('/api/me/class');

    $response->assertStatus(200)
        ->assertJsonFragment(['id' => $class->id]);
});

test('homeroom teacher can access /api/me/class/attendance', function () {
    $class = Classes::factory()->create(['grade' => '12', 'label' => '2']);
    $user = User::factory()->create(['user_type' => 'teacher']);
    $teacher = TeacherProfile::factory()->create([
        'user_id' => $user->id,
        'homeroom_class_id' => $class->id,
    ]);

    $response = $this->actingAs($user)->getJson('/api/me/class/attendance');

    $response->assertStatus(200);
});

/**
 * GURU [DESKTOP] - Statistics Check (DAY function fix)
 */
test('teacher monthly statistics does not crash on sqlite (DAY function fix)', function () {
    $user = User::factory()->create(['user_type' => 'teacher']);
    $teacher = TeacherProfile::factory()->create(['user_id' => $user->id]);

    // Create attendance for teacher teaching
    Attendance::create([
        'teacher_id' => $teacher->id,
        'attendee_type' => 'teacher',
        'date' => now()->format('Y-m-d'),
        'status' => 'present',
    ]);

    $response = $this->actingAs($user)->getJson('/api/me/statistics/monthly');

    $response->assertStatus(200)
        ->assertJsonStructure(['summary', 'chart_data']);
});

/**
 * IMPORT / EXPORT - Master Data
 */
test('admin can see students in list with correct class and major names', function () {
    $admin = User::factory()->create(['user_type' => 'admin']);
    $major = Major::factory()->create(['code' => 'RPL']);
    $class = Classes::factory()->create(['grade' => '12', 'major_id' => $major->id, 'label' => '2']);
    $studentUser = User::factory()->create(['name' => 'Test Student']);
    $student = StudentProfile::factory()->create([
        'user_id' => $studentUser->id,
        'class_id' => $class->id,
    ]);

    $response = $this->actingAs($admin)->getJson('/api/students');

    $response->assertStatus(200)
        ->assertJsonFragment([
            'name' => 'Test Student',
            'class_name' => 'XII RPL 2',
        ]);
});

/**
 * WAKA - Export Test
 */
test('admin or waka can access export pdf endpoint', function () {
    $admin = User::factory()->create(['user_type' => 'admin']);

    $response = $this->actingAs($admin)->getJson('/api/attendance/export-pdf');

    // It should at least be successful (even if empty)
    $response->assertStatus(200);
});
