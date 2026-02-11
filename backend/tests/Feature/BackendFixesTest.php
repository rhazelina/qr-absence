<?php

use App\Models\Attendance;
use App\Models\Classes;
use App\Models\Qrcode;
use App\Models\Schedule;
use App\Models\SchoolYear;
use App\Models\Semester;
use App\Models\StudentProfile;
use App\Models\TeacherProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Setup basic data
    $this->schoolYear = SchoolYear::create([
        'name' => '2024/2025',
        'start_year' => 2024,
        'end_year' => 2025,
        'active' => true,
    ]);
    Semester::create([
        'name' => 'Ganjil',
        'school_year_id' => $this->schoolYear->id,
        'active' => true,
    ]);
    $this->class = Classes::factory()->create();
});

test('item 14: teacher subject validation on schedule creation', function () {
    $teacher = User::factory()->create(['user_type' => 'teacher']);
    $profile = TeacherProfile::factory()->create([
        'user_id' => $teacher->id,
        'subject' => 'Matematika',
    ]);

    $admin = User::factory()->create(['user_type' => 'admin']);

    // 1. Invalid Subject
    $response = $this->actingAs($admin)->postJson('/api/schedules', [
        'day' => 'Monday',
        'start_time' => '07:00',
        'end_time' => '08:30',
        'subject_name' => 'Biologi', // Mismatch
        'class_id' => $this->class->id,
        'teacher_id' => $profile->id,
        'semester' => 1,
        'year' => 2025,
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['teacher_id']);

    // 2. Valid Subject
    $response = $this->actingAs($admin)->postJson('/api/schedules', [
        'day' => 'Monday',
        'start_time' => '07:00',
        'end_time' => '08:30',
        'subject_name' => 'Matematika', // Match
        'class_id' => $this->class->id,
        'teacher_id' => $profile->id,
        'semester' => 1,
        'year' => 2025,
    ]);

    $response->assertStatus(201);
});

test('item 15: teacher me endpoint returns no_schedule status if empty', function () {
    $teacher = User::factory()->create(['user_type' => 'teacher']);
    $profile = TeacherProfile::factory()->create(['user_id' => $teacher->id]);

    $response = $this->actingAs($teacher)->getJson('/api/me/schedules');

    $response->assertStatus(200)
        ->assertJson([
            'status' => 'no_schedule',
            'message' => 'Tidak ada jam mengajar hari ini',
            'items' => [],
        ]);
});

test('item 17: class officer cannot generate qr for future days', function () {
    $student = User::factory()->create(['user_type' => 'student']);
    $profile = StudentProfile::factory()->create([
        'user_id' => $student->id,
        'class_id' => $this->class->id,
        'is_class_officer' => true,
    ]);

    // Create schedule for tomorrow
    $tomorrow = now()->addDay();
    $schedule = Schedule::factory()->create([
        'class_id' => $this->class->id,
        'day' => $tomorrow->englishDayOfWeek,
    ]);

    $response = $this->actingAs($student)->postJson('/api/qrcodes/generate', [
        'schedule_id' => $schedule->id,
        'type' => 'student',
        'expires_in' => 5,
    ]);

    $day = now()->englishDayOfWeek;
    $response->assertStatus(422)
        ->assertJson(['message' => "Pengurus kelas hanya boleh membuat QR untuk jadwal hari ini ($day)"]);
});

test('item 19: qr code show endpoint auto expires', function () {
    $teacher = User::factory()->create(['user_type' => 'teacher']);
    $profile = TeacherProfile::factory()->create(['user_id' => $teacher->id]);
    $schedule = Schedule::factory()->create(['teacher_id' => $profile->id]);

    $qr = Qrcode::create([
        'token' => 'test-token',
        'schedule_id' => $schedule->id,
        'type' => 'student',
        'issued_by' => $teacher->id,
        'expires_at' => now()->subMinute(), // Expired
        'is_active' => true,
    ]);

    $admin = User::factory()->create(['user_type' => 'admin']);

    $response = $this->actingAs($admin)->getJson("/api/qrcodes/{$qr->token}");

    $response->assertStatus(200);
    $this->assertDatabaseHas('qrcodes', [
        'id' => $qr->id,
        'is_active' => false, // Should be deactivated
        'status' => 'expired',
    ]);
});

test('item 21: manual attendance prevents duplicate', function () {
    $teacher = User::factory()->create(['user_type' => 'teacher']);
    $profile = TeacherProfile::factory()->create(['user_id' => $teacher->id]);
    $schedule = Schedule::factory()->create(['teacher_id' => $profile->id]);
    $student = StudentProfile::factory()->create();

    // 1. Create first attendance
    $response = $this->actingAs($teacher)->postJson('/api/attendance/manual', [
        'schedule_id' => $schedule->id,
        'student_id' => $student->id,
        'status' => 'present',
        'date' => now()->toDateString(),
        'attendee_type' => 'student',
    ]);

    $response->assertStatus(201);

    // 2. Try duplicate
    $response = $this->actingAs($teacher)->postJson('/api/attendance/manual', [
        'schedule_id' => $schedule->id,
        'student_id' => $student->id,
        'status' => 'absent',
        'date' => now()->toDateString(),
        'attendee_type' => 'student',
    ]);

    $response->assertStatus(409)
        ->assertJson(['message' => 'Presensi siswa ini sudah tercatat untuk sesi ini.']);
});

test('item 24: students absences sorted by count', function () {
    $admin = User::factory()->create(['user_type' => 'admin']);
    \App\Models\AdminProfile::factory()->create([
        'user_id' => $admin->id,
        'type' => 'waka',
    ]);

    // Create 2 students
    $s1 = StudentProfile::factory()->create();
    $s2 = StudentProfile::factory()->create();

    // Create 3 absences for s1
    $sch1 = Schedule::factory()->create();

    for ($i = 0; $i < 3; $i++) {
        Attendance::create([
            'student_id' => $s1->id,
            'attendee_type' => 'student',
            'status' => 'absent',
            'schedule_id' => $sch1->id,
            'date' => now()->subDays($i + 1)->toDateString(),
            'checked_in_at' => now()->subDays($i + 1),
            'source' => 'manual',
        ]);
    }

    // Create 1 absence for s2
    Attendance::create([
        'student_id' => $s2->id,
        'attendee_type' => 'student',
        'status' => 'absent',
        'schedule_id' => $sch1->id,
        'date' => now()->subDays(1)->toDateString(),
        'checked_in_at' => now()->subDays(1),
        'source' => 'manual',
    ]);

    $response = $this->actingAs($admin)->getJson('/api/students/absences');

    $response->assertStatus(200);
    $data = $response->json('data');

    // s1 should be first because 3 > 1
    expect($data[0]['student']['id'])->toBe($s1->id);
    expect($data[1]['student']['id'])->toBe($s2->id);
});

test('item 25: settings sync endpoint', function () {
    $admin = User::factory()->create(['user_type' => 'admin']);

    $response = $this->actingAs($admin)->getJson('/api/settings/sync');

    $response->assertStatus(200)
        ->assertJsonStructure(['school_year', 'semester', 'settings']);
});

test('item 26: absence request date validation', function () {
    $student = User::factory()->create(['user_type' => 'student']);
    $profile = StudentProfile::factory()->create(['user_id' => $student->id]);

    // Past date
    $response = $this->actingAs($student)->postJson('/api/absence-requests', [
        'type' => 'sick',
        'start_date' => now()->subDay()->toDateString(),
        'end_date' => now()->toDateString(),
        'reason' => 'sick',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['start_date']); // Validation message for after_or_equal:today

    // Future date
    $response = $this->actingAs($student)->postJson('/api/absence-requests', [
        'type' => 'sick',
        'start_date' => now()->addDay()->toDateString(),
        'end_date' => now()->addDays(2)->toDateString(),
        'reason' => 'sick',
    ]);

    $response->assertStatus(201);
});
