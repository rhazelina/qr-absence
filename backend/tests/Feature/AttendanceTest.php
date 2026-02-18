<?php

use App\Models\Attendance;
use App\Models\ClassSchedule;
use App\Models\DailySchedule;
use App\Models\ScheduleItem;
use App\Models\StudentProfile;
use App\Models\TeacherProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

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
    $classRoom = \App\Models\ClassRoom::factory()->create();

    $waliKelas = User::factory()->teacher()->create();
    // Assuming teacherProfile exists and related to user
    if (! $waliKelas->teacherProfile) {
        $waliKelas->teacherProfile()->create(['user_id' => $waliKelas->id]);
        $waliKelas->refresh();
    }
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
    if (! $student1->studentProfile) {
        $student1->studentProfile()->create(['user_id' => $student1->id]);
        $student1->refresh();
    }
    $student1->studentProfile->update(['class_id' => $classRoom->id]);

    $student2 = User::factory()->student()->create();
    if (! $student2->studentProfile) {
        $student2->studentProfile()->create(['user_id' => $student2->id]);
        $student2->refresh();
    }
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
        'status' => 'absent',
    ]);
});
