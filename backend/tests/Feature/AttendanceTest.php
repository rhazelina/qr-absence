<?php

use App\Models\Attendance;
use App\Models\ClassSchedule;
use App\Models\DailySchedule;
use App\Models\ScheduleItem;
use App\Models\StudentProfile;
use App\Models\Subject;
use App\Models\TeacherProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;

uses(RefreshDatabase::class);

beforeEach(function () {
    Carbon::setTestNow(Carbon::parse('2026-02-23 08:00:00')); // It is a Monday
});

it('allows waka to record manual attendance', function () {
    $waka = User::factory()->waka()->create();
    $waka->refresh();

    $student = User::factory()->student()->create();
    $student->refresh();

    $classSchedule = ClassSchedule::factory()->create(['class_id' => $student->studentProfile->class_id]);
    $dailySchedule = DailySchedule::factory()->create(['class_schedule_id' => $classSchedule->id]);
    $schedule = ScheduleItem::factory()->create(['daily_schedule_id' => $dailySchedule->id]);

    $response = $this->actingAs($waka)
        ->postJson('/api/attendance/manual', [
            'attendee_type' => 'student',
            'student_id' => $student->studentProfile->id,
            'schedule_id' => $schedule->id,
            'status' => 'present',
            'date' => now()->toDateString(),
        ]);

    $response->assertSuccessful();
});

it('normalizes status from frontend in manual attendance', function () {
    $admin = User::factory()->admin()->create();
    $admin->refresh();
    $student = User::factory()->student()->create();
    $student->refresh();

    $classSchedule = ClassSchedule::factory()->create(['class_id' => $student->studentProfile->class_id]);
    $dailySchedule = DailySchedule::factory()->create(['class_schedule_id' => $classSchedule->id]);
    $schedule = ScheduleItem::factory()->create([
        'daily_schedule_id' => $dailySchedule->id,
        'teacher_id' => $admin->teacherProfile ? $admin->teacherProfile->id : \App\Models\TeacherProfile::factory()->create(['user_id' => $admin->id])->id,
    ]);

    $response = $this->actingAs($admin)
        ->postJson('/api/attendance/manual', [
            'attendee_type' => 'student',
            'student_id' => $student->studentProfile->id,
            'schedule_id' => $schedule->id,
            'status' => 'alpha', // Should map to 'absent'
            'date' => now()->toDateString(),
        ]);

    $response->assertSuccessful();
    $this->assertDatabaseHas('attendances', [
        'student_id' => $student->studentProfile->id,
        'status' => 'absent',
    ]);
});

it('allows teacher to record manual attendance for their schedule', function () {
    $teacher = User::factory()->teacher()->create();
    $teacher->refresh();
    $student = User::factory()->student()->create();
    $student->refresh();

    $classSchedule = ClassSchedule::factory()->create(['class_id' => $student->studentProfile->class_id]);
    $dailySchedule = DailySchedule::factory()->create(['class_schedule_id' => $classSchedule->id]);
    $schedule = ScheduleItem::factory()->create([
        'daily_schedule_id' => $dailySchedule->id,
        'teacher_id' => $teacher->teacherProfile->id,
    ]);

    $response = $this->actingAs($teacher)
        ->postJson('/api/attendance/manual', [
            'attendee_type' => 'student',
            'student_id' => $student->studentProfile->id,
            'schedule_id' => $schedule->id,
            'status' => 'sakit', // Should map to 'sick'
            'date' => now()->toDateString(),
        ]);

    $response->assertSuccessful();
    $this->assertDatabaseHas('attendances', [
        'student_id' => $student->studentProfile->id,
        'status' => 'sick',
    ]);
});

it('normalizes status in markExcuse', function () {
    $teacher = User::factory()->teacher()->create();
    $teacher->refresh();
    $student = User::factory()->student()->create();
    $student->refresh();

    $classSchedule = ClassSchedule::factory()->create(['class_id' => $student->studentProfile->class_id]);
    $dailySchedule = DailySchedule::factory()->create(['class_schedule_id' => $classSchedule->id]);
    $schedule = ScheduleItem::factory()->create([
        'daily_schedule_id' => $dailySchedule->id,
        'teacher_id' => $teacher->teacherProfile->id,
    ]);

    $attendance = Attendance::create([
        'attendee_type' => 'student',
        'student_id' => $student->studentProfile->id,
        'schedule_id' => $schedule->id,
        'status' => 'absent',
        'date' => now(),
    ]);

    $response = $this->actingAs($teacher)
        ->patchJson("/api/attendance/{$attendance->id}", [
            'status' => 'pulang', // Should map to 'return'
            'reason' => 'Sakit perut',
        ]);

    $response->assertSuccessful();
    $this->assertDatabaseHas('attendances', [
        'id' => $attendance->id,
        'status' => 'return',
        'reason' => 'Sakit perut',
    ]);
});

it('prevents student from accessing another student document', function () {
    $student1 = User::factory()->student()->create();
    $student2 = User::factory()->student()->create();

    $schedule = ScheduleItem::factory()->create();
    $attendance = Attendance::create([
        'attendee_type' => 'student',
        'student_id' => $student2->studentProfile->id,
        'schedule_id' => $schedule->id,
        'status' => 'present',
        'date' => now(),
    ]);

    $attendance->attachments()->create([
        'path' => 'test.pdf',
        'original_name' => 'test.pdf',
        'mime_type' => 'application/pdf',
        'size' => 100,
    ]);

    $response = $this->actingAs($student1)
        ->getJson("/api/attendance/{$attendance->id}/document");

    $response->assertForbidden();
});

it('allows student to access their own document', function () {
    $student = User::factory()->student()->create();
    $student->load('studentProfile');

    $schedule = ScheduleItem::factory()->create();
    $attendance = Attendance::create([
        'attendee_type' => 'student',
        'student_id' => $student->studentProfile->id,
        'schedule_id' => $schedule->id,
        'status' => 'present',
        'date' => now(),
    ]);

    $attendance->attachments()->create([
        'path' => 'test.pdf',
        'original_name' => 'test.pdf',
        'mime_type' => 'application/pdf',
        'size' => 100,
    ]);

    $response = $this->withoutExceptionHandling()
        ->actingAs($student)
        ->getJson("/api/attendance/{$attendance->id}/document");

    $response->assertSuccessful();
});

it('allows homeroom teacher (wali kelas) to record bulk attendance for their class schedule', function () {
    $classRoom = \App\Models\Classes::factory()->create();

    $waliKelas = User::factory()->teacher()->create();
    // Assuming teacherProfile exists and related to user
    $waliKelas->teacherProfile->update(['homeroom_class_id' => $classRoom->id]);

    $subjectTeacher = User::factory()->teacher()->create();
    if (! $subjectTeacher->teacherProfile) {
        $subjectTeacher->teacherProfile()->create(['user_id' => $subjectTeacher->id]);
    }

    $classSchedule = ClassSchedule::factory()->create(['class_id' => $classRoom->id]);
    $dailySchedule = DailySchedule::factory()->create(['class_schedule_id' => $classSchedule->id]);
    $schedule = ScheduleItem::factory()->create([
        'daily_schedule_id' => $dailySchedule->id,
        'teacher_id' => $subjectTeacher->teacherProfile->id,
    ]);

    $student1 = User::factory()->student()->create();
    // Assuming studentProfile exists
    $student1->studentProfile->update(['class_id' => $classRoom->id]);

    $student2 = User::factory()->student()->create();
    $student2->studentProfile->update(['class_id' => $classRoom->id]);

    // Create attendance items
    $items = [
        [
            'student_id' => $student1->studentProfile->id,
            'status' => 'hadir',
            'reason' => null,
        ],
        [
            'student_id' => $student2->studentProfile->id,
            'status' => 'alfa',
            'reason' => 'Bolos',
        ],
    ];

    $response = $this->actingAs($waliKelas)
        ->postJson('/api/attendance/bulk-manual', [
            'schedule_id' => $schedule->id,
            'date' => now()->toDateString(),
            'items' => $items,
        ]);

    $response->assertSuccessful();

    $this->assertDatabaseHas('attendances', [
        'student_id' => $student1->studentProfile->id,
        'schedule_id' => $schedule->id,
        'status' => 'present',
    ]);

    $this->assertDatabaseHas('attendances', [
        'student_id' => $student2->studentProfile->id,
        'schedule_id' => $schedule->id,
        'status' => 'absent', // 'alfa' is normalized to 'absent'
    ]);
});

it('supports legacy and mobile date query aliases on me teaching history', function () {
    $teacher = User::factory()->teacher()->create();
    $classRoom = \App\Models\Classes::factory()->create();
    $classSchedule = ClassSchedule::factory()->create([
        'class_id' => $classRoom->id,
        'is_active' => true,
    ]);
    $dailySchedule = DailySchedule::factory()->create([
        'class_schedule_id' => $classSchedule->id,
        'day' => now()->format('l'),
    ]);
    $subject = Subject::factory()->create(['name' => 'Matematika']);
    $schedule = ScheduleItem::factory()->create([
        'daily_schedule_id' => $dailySchedule->id,
        'teacher_id' => $teacher->teacherProfile->id,
        'subject_id' => $subject->id,
    ]);

    Attendance::create([
        'attendee_type' => 'teacher',
        'teacher_id' => $teacher->teacherProfile->id,
        'schedule_id' => $schedule->id,
        'status' => 'present',
        'date' => now()->toDateString(),
        'checked_in_at' => now()->setTime(7, 5),
        'source' => 'manual',
    ]);

    $legacyResponse = $this->actingAs($teacher)
        ->getJson('/api/me/attendance/teaching?from='.now()->toDateString().'&to='.now()->toDateString());

    $legacyResponse->assertOk()
        ->assertJsonPath('history.0.schedule.subject.name', 'Matematika');

    $mobileResponse = $this->actingAs($teacher)
        ->getJson('/api/me/attendance/teaching?start_date='.now()->toDateString().'&end_date='.now()->toDateString());

    $mobileResponse->assertOk()
        ->assertJsonPath('history.0.schedule.daily_schedule.class_schedule.class.id', $classRoom->id);
});

it('returns localized student name and status on class attendance by date', function () {
    $classRoom = \App\Models\Classes::factory()->create();

    $waliKelas = User::factory()->teacher()->create();
    $waliKelas->teacherProfile->update(['homeroom_class_id' => $classRoom->id]);

    $subjectTeacher = User::factory()->teacher()->create();

    $classSchedule = ClassSchedule::factory()->create(['class_id' => $classRoom->id]);
    $dailySchedule = DailySchedule::factory()->create([
        'class_schedule_id' => $classSchedule->id,
        'day' => 'Monday',
    ]);
    $schedule = ScheduleItem::factory()->create([
        'daily_schedule_id' => $dailySchedule->id,
        'teacher_id' => $subjectTeacher->teacherProfile->id,
    ]);

    $studentUser = User::factory()->student()->create(['name' => 'Budi Santoso']);
    $studentUser->studentProfile->update(['class_id' => $classRoom->id]);

    Attendance::create([
        'attendee_type' => 'student',
        'student_id' => $studentUser->studentProfile->id,
        'schedule_id' => $schedule->id,
        'status' => 'excused',
        'date' => '2026-02-23',
        'checked_in_at' => Carbon::parse('2026-02-23 07:05:00'),
    ]);

    $response = $this->actingAs($waliKelas)
        ->getJson("/api/classes/{$classRoom->id}/attendance?date=2026-02-23");

    $response->assertOk()
        ->assertJsonPath('items.0.attendances.0.student.name', 'Budi Santoso')
        ->assertJsonPath('items.0.attendances.0.status', 'Izin')
        ->assertJsonPath('items.0.attendances.0.status_code', 'excused');
});

it('returns class attendance by date with indonesian day label', function () {
    $classRoom = \App\Models\Classes::factory()->create();

    $waliKelas = User::factory()->teacher()->create();
    $waliKelas->teacherProfile->update(['homeroom_class_id' => $classRoom->id]);

    $subjectTeacher = User::factory()->teacher()->create();

    $classSchedule = ClassSchedule::factory()->create(['class_id' => $classRoom->id]);
    $dailySchedule = DailySchedule::factory()->create([
        'class_schedule_id' => $classSchedule->id,
        'day' => 'Monday',
    ]);
    $schedule = ScheduleItem::factory()->create([
        'daily_schedule_id' => $dailySchedule->id,
        'teacher_id' => $subjectTeacher->teacherProfile->id,
    ]);

    $studentUser = User::factory()->student()->create(['name' => 'Citra Dewi']);
    $studentUser->studentProfile->update(['class_id' => $classRoom->id]);

    Attendance::create([
        'attendee_type' => 'student',
        'student_id' => $studentUser->studentProfile->id,
        'schedule_id' => $schedule->id,
        'status' => 'present',
        'date' => '2026-02-23',
        'checked_in_at' => Carbon::parse('2026-02-23 07:10:00'),
    ]);

    $response = $this->actingAs($waliKelas)
        ->getJson("/api/classes/{$classRoom->id}/attendance?date=2026-02-23");

    $response->assertOk()
        ->assertJsonPath('day', 'Senin')
        ->assertJsonPath('items.0.schedule.id', $schedule->id)
        ->assertJsonPath('items.0.attendances.0.student.name', 'Citra Dewi');
});
