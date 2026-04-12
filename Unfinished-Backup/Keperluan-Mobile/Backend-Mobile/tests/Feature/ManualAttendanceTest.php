<?php

use App\Models\Attendance;
use App\Models\Classes;
use App\Models\ClassSchedule;
use App\Models\DailySchedule;
use App\Models\ScheduleItem;
use App\Models\StudentProfile;
use App\Models\TeacherProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;

uses(RefreshDatabase::class);

beforeEach(function () {
    Carbon::setTestNow(Carbon::parse('2026-02-23 08:00:00')); // Monday
});

function createManualAttendanceContext(): array
{
    $class = Classes::factory()->create();
    $teacherUser = User::factory()->create(['user_type' => 'teacher']);
    $teacherProfile = TeacherProfile::factory()->create(['user_id' => $teacherUser->id]);

    $classSchedule = ClassSchedule::factory()->create([
        'class_id' => $class->id,
        'is_active' => true,
    ]);

    $dailySchedule = DailySchedule::factory()->create([
        'class_schedule_id' => $classSchedule->id,
        'day' => now()->format('l'),
    ]);

    $scheduleItem = ScheduleItem::factory()->create([
        'daily_schedule_id' => $dailySchedule->id,
        'teacher_id' => $teacherProfile->id,
        'start_time' => '07:00:00',
        'end_time' => '08:30:00',
    ]);

    return [$class, $teacherUser, $teacherProfile, $scheduleItem];
}

it('allows teacher to submit manual attendance', function () {
    // 1. Setup Data
    $class = Classes::factory()->create();
    $teacherUser = User::factory()->create(['user_type' => 'teacher']);
    $teacherProfile = TeacherProfile::factory()->create(['user_id' => $teacherUser->id]);

    $studentUser = User::factory()->create(['user_type' => 'student']);
    $student = StudentProfile::factory()->create([
        'user_id' => $studentUser->id,
        'class_id' => $class->id,
        'nisn' => '1234567890',
    ]);

    $classSchedule = ClassSchedule::factory()->create([
        'class_id' => $class->id,
        'is_active' => true,
    ]);

    $dailySchedule = DailySchedule::factory()->create([
        'class_schedule_id' => $classSchedule->id,
        'day' => now()->format('l'),
    ]);

    $scheduleItem = ScheduleItem::factory()->create([
        'daily_schedule_id' => $dailySchedule->id,
        'teacher_id' => $teacherProfile->id,
        'start_time' => '07:00:00',
        'end_time' => '17:00:00',
    ]);

    // 2. Submit Manual Attendance
    $response = $this->actingAs($teacherUser)
        ->postJson('/api/attendance/manual', [
            'attendee_type' => 'student',
            'student_id' => $student->id,
            'schedule_id' => $scheduleItem->id,
            'status' => 'present',
            'date' => Carbon::now()->toDateString(),
            'reason' => 'Manual input',
        ]);

    $response->assertSuccessful();

    $this->assertDatabaseHas('attendances', [
        'student_id' => $student->id,
        'schedule_id' => $scheduleItem->id,
        'status' => 'present',
        'source' => 'manual',
        'reason' => 'Manual input',
    ]);
});

it('maps pulang status to return in database', function () {
    // 1. Setup Data
    $class = Classes::factory()->create();
    $teacherUser = User::factory()->create(['user_type' => 'teacher']);
    $teacherProfile = TeacherProfile::factory()->create(['user_id' => $teacherUser->id]);

    $studentUser = User::factory()->create(['user_type' => 'student']);
    $student = StudentProfile::factory()->create([
        'user_id' => $studentUser->id,
        'class_id' => $class->id,
        'nisn' => '1234567890',
    ]);

    $classSchedule = ClassSchedule::factory()->create([
        'class_id' => $class->id,
        'is_active' => true,
    ]);

    $dailySchedule = DailySchedule::factory()->create([
        'class_schedule_id' => $classSchedule->id,
        'day' => now()->format('l'),
    ]);

    $scheduleItem = ScheduleItem::factory()->create([
        'daily_schedule_id' => $dailySchedule->id,
        'teacher_id' => $teacherProfile->id,
        'start_time' => '07:00:00',
        'end_time' => '17:00:00',
    ]);

    // 2. Submit Manual Attendance with 'pulang' status
    $response = $this->actingAs($teacherUser)
        ->postJson('/api/attendance/manual', [
            'attendee_type' => 'student',
            'student_id' => $student->id,
            'schedule_id' => $scheduleItem->id,
            'status' => 'pulang', // Sending 'pulang'
            'date' => Carbon::now()->toDateString(),
            'reason' => 'Pulang cepat',
        ]);

    $response->assertSuccessful();

    // 3. Verify Database has 'return' status
    $this->assertDatabaseHas('attendances', [
        'student_id' => $student->id,
        'schedule_id' => $scheduleItem->id,
        'status' => 'return', // Expecting 'return'
        'source' => 'manual',
    ]);
});

it('prevents unauthorized teacher from submitting attendance', function () {
    // 1. Setup Data - Schedule owned by OTHER teacher
    $class = Classes::factory()->create();
    $otherTeacherUser = User::factory()->create(['user_type' => 'teacher']);
    $otherTeacherProfile = TeacherProfile::factory()->create(['user_id' => $otherTeacherUser->id]);

    $classSchedule = ClassSchedule::factory()->create([
        'class_id' => $class->id,
        'is_active' => true,
    ]);

    $dailySchedule = DailySchedule::factory()->create([
        'class_schedule_id' => $classSchedule->id,
        'day' => now()->format('l'),
    ]);

    $scheduleItem = ScheduleItem::factory()->create([
        'daily_schedule_id' => $dailySchedule->id,
        'teacher_id' => $otherTeacherProfile->id,
    ]);

    $studentUser = User::factory()->create(['user_type' => 'student']);
    $student = StudentProfile::factory()->create([
        'user_id' => $studentUser->id,
        'class_id' => $class->id,
    ]);

    // 2. Unauthorized Teacher
    $unauthorizedTeacher = User::factory()->create(['user_type' => 'teacher']);
    TeacherProfile::factory()->create(['user_id' => $unauthorizedTeacher->id]);

    $response = $this->actingAs($unauthorizedTeacher)
        ->postJson('/api/attendance/manual', [
            'attendee_type' => 'student',
            'student_id' => $student->id,
            'schedule_id' => $scheduleItem->id,
            'status' => 'present',
            'date' => Carbon::now()->toDateString(),
        ]);

    $response->assertStatus(403);
});

it('allows teacher to save manual attendance as draft', function () {
    [$class, $teacherUser, $teacherProfile, $scheduleItem] = createManualAttendanceContext();

    $student = StudentProfile::factory()->create([
        'user_id' => User::factory()->create(['user_type' => 'student'])->id,
        'class_id' => $class->id,
    ]);

    $response = $this->actingAs($teacherUser)
        ->postJson('/api/attendance/bulk-manual', [
            'schedule_id' => $scheduleItem->id,
            'date' => now()->toDateString(),
            'mode' => 'draft',
            'items' => [
                [
                    'student_id' => $student->id,
                    'status' => 'present',
                    'reason' => 'Disimpan sementara',
                ],
            ],
        ]);

    $response->assertOk()
        ->assertJsonPath('mode', 'draft')
        ->assertJsonPath('saved_count', 1);

    $this->assertDatabaseHas('attendances', [
        'student_id' => $student->id,
        'schedule_id' => $scheduleItem->id,
        'status' => 'present',
        'source' => 'manual_draft',
        'is_draft' => true,
    ]);
});

it('marks newly added student as late after first draft save', function () {
    [$class, $teacherUser, $teacherProfile, $scheduleItem] = createManualAttendanceContext();

    $studentOne = StudentProfile::factory()->create([
        'user_id' => User::factory()->create(['user_type' => 'student'])->id,
        'class_id' => $class->id,
    ]);
    $studentTwo = StudentProfile::factory()->create([
        'user_id' => User::factory()->create(['user_type' => 'student'])->id,
        'class_id' => $class->id,
    ]);

    $this->actingAs($teacherUser)->postJson('/api/attendance/bulk-manual', [
        'schedule_id' => $scheduleItem->id,
        'date' => now()->toDateString(),
        'mode' => 'draft',
        'items' => [
            [
                'student_id' => $studentOne->id,
                'status' => 'present',
            ],
        ],
    ])->assertOk();

    Carbon::setTestNow(now()->copy()->addMinutes(5));

    $response = $this->actingAs($teacherUser)->postJson('/api/attendance/bulk-manual', [
        'schedule_id' => $scheduleItem->id,
        'date' => now()->toDateString(),
        'mode' => 'draft',
        'items' => [
            [
                'student_id' => $studentTwo->id,
                'status' => 'present',
            ],
        ],
    ]);

    $response->assertOk()
        ->assertJsonPath('auto_late_student_ids.0', $studentTwo->id);

    $this->assertDatabaseHas('attendances', [
        'student_id' => $studentTwo->id,
        'schedule_id' => $scheduleItem->id,
        'status' => 'late',
        'source' => 'manual_draft',
        'is_draft' => true,
    ]);

    $this->assertDatabaseHas('attendances', [
        'student_id' => $studentTwo->id,
        'schedule_id' => $scheduleItem->id,
        'reason' => 'Terlambat: siswa baru diinput setelah sesi absensi dimulai',
    ]);
});

it('marks newly added student as late when continuing a legacy draft without manual session timestamp', function () {
    [$class, $teacherUser, $teacherProfile, $scheduleItem] = createManualAttendanceContext();

    $studentOne = StudentProfile::factory()->create([
        'user_id' => User::factory()->create(['user_type' => 'student'])->id,
        'class_id' => $class->id,
    ]);
    $studentTwo = StudentProfile::factory()->create([
        'user_id' => User::factory()->create(['user_type' => 'student'])->id,
        'class_id' => $class->id,
    ]);

    Attendance::create([
        'attendee_type' => 'student',
        'student_id' => $studentOne->id,
        'schedule_id' => $scheduleItem->id,
        'date' => now()->toDateString(),
        'status' => 'present',
        'checked_in_at' => now(),
        'source' => 'manual_draft',
        'is_draft' => true,
        'draft_saved_at' => now()->subMinutes(10),
        'manual_session_started_at' => null,
    ]);

    $response = $this->actingAs($teacherUser)->postJson('/api/attendance/bulk-manual', [
        'schedule_id' => $scheduleItem->id,
        'date' => now()->toDateString(),
        'mode' => 'draft',
        'items' => [
            [
                'student_id' => $studentTwo->id,
                'status' => 'present',
            ],
        ],
    ]);

    $response->assertOk()
        ->assertJsonPath('auto_late_student_ids.0', $studentTwo->id);

    $this->assertDatabaseHas('attendances', [
        'student_id' => $studentTwo->id,
        'schedule_id' => $scheduleItem->id,
        'status' => 'late',
        'source' => 'manual_draft',
        'reason' => 'Terlambat: siswa baru diinput setelah sesi absensi dimulai',
        'is_draft' => true,
    ]);
});

it('finalizes manual draft and marks missing students absent by default', function () {
    [$class, $teacherUser, $teacherProfile, $scheduleItem] = createManualAttendanceContext();

    $studentOne = StudentProfile::factory()->create([
        'user_id' => User::factory()->create(['user_type' => 'student'])->id,
        'class_id' => $class->id,
    ]);
    $studentTwo = StudentProfile::factory()->create([
        'user_id' => User::factory()->create(['user_type' => 'student'])->id,
        'class_id' => $class->id,
    ]);

    $this->actingAs($teacherUser)->postJson('/api/attendance/bulk-manual', [
        'schedule_id' => $scheduleItem->id,
        'date' => now()->toDateString(),
        'mode' => 'draft',
        'items' => [
            [
                'student_id' => $studentOne->id,
                'status' => 'present',
            ],
        ],
    ])->assertOk();

    $response = $this->actingAs($teacherUser)->postJson('/api/attendance/manual/finalize', [
        'schedule_id' => $scheduleItem->id,
        'date' => now()->toDateString(),
    ]);

    $response->assertOk()
        ->assertJsonPath('already_finalized', false)
        ->assertJsonPath('auto_absent_count', 1);

    $this->assertDatabaseHas('attendances', [
        'student_id' => $studentOne->id,
        'schedule_id' => $scheduleItem->id,
        'status' => 'present',
        'source' => 'manual',
        'is_draft' => false,
    ]);

    $this->assertDatabaseHas('attendances', [
        'student_id' => $studentTwo->id,
        'schedule_id' => $scheduleItem->id,
        'status' => 'absent',
        'source' => 'manual',
        'is_draft' => false,
    ]);
});

it('allows teacher to finalize bulk manual sick attendance and creates leave permission', function () {
    [$class, $teacherUser, $teacherProfile, $scheduleItem] = createManualAttendanceContext();

    $student = StudentProfile::factory()->create([
        'user_id' => User::factory()->create(['user_type' => 'student'])->id,
        'class_id' => $class->id,
    ]);

    $response = $this->actingAs($teacherUser)->postJson('/api/attendance/bulk-manual', [
        'schedule_id' => $scheduleItem->id,
        'date' => now()->toDateString(),
        'mode' => 'final',
        'items' => [
            [
                'student_id' => $student->id,
                'status' => 'sick',
                'reason' => 'Sakit demam',
            ],
        ],
    ]);

    $response->assertOk()
        ->assertJsonPath('mode', 'final')
        ->assertJsonPath('saved_count', 1);

    $this->assertDatabaseHas('attendances', [
        'student_id' => $student->id,
        'schedule_id' => $scheduleItem->id,
        'status' => 'sick',
        'source' => 'manual',
        'is_draft' => false,
    ]);

    $this->assertDatabaseHas('student_leave_permissions', [
        'student_id' => $student->id,
        'class_id' => $class->id,
        'granted_by' => $teacherUser->id,
        'schedule_id' => $scheduleItem->id,
        'type' => 'sakit',
        'date' => now()->startOfDay()->toDateTimeString(),
        'start_time' => $scheduleItem->start_time,
        'is_full_day' => true,
        'status' => 'active',
    ]);
});

it('allows teacher to finalize bulk manual excused attendance and creates leave permission', function () {
    [$class, $teacherUser, $teacherProfile, $scheduleItem] = createManualAttendanceContext();

    $student = StudentProfile::factory()->create([
        'user_id' => User::factory()->create(['user_type' => 'student'])->id,
        'class_id' => $class->id,
    ]);

    $response = $this->actingAs($teacherUser)->postJson('/api/attendance/bulk-manual', [
        'schedule_id' => $scheduleItem->id,
        'date' => now()->toDateString(),
        'mode' => 'final',
        'items' => [
            [
                'student_id' => $student->id,
                'status' => 'excused',
                'reason' => 'Izin keluarga',
            ],
        ],
    ]);

    $response->assertOk()
        ->assertJsonPath('mode', 'final')
        ->assertJsonPath('saved_count', 1);

    $this->assertDatabaseHas('student_leave_permissions', [
        'student_id' => $student->id,
        'class_id' => $class->id,
        'granted_by' => $teacherUser->id,
        'schedule_id' => $scheduleItem->id,
        'type' => 'izin',
        'date' => now()->startOfDay()->toDateTimeString(),
        'start_time' => $scheduleItem->start_time,
        'is_full_day' => true,
        'status' => 'active',
    ]);
});

it('allows teacher to submit bulk manual final mode directly', function () {
    [$class, $teacherUser, $teacherProfile, $scheduleItem] = createManualAttendanceContext();

    $student = StudentProfile::factory()->create([
        'user_id' => User::factory()->create(['user_type' => 'student'])->id,
        'class_id' => $class->id,
    ]);

    $response = $this->actingAs($teacherUser)
        ->postJson('/api/attendance/bulk-manual', [
            'schedule_id' => $scheduleItem->id,
            'date' => now()->toDateString(),
            'mode' => 'final',
            'items' => [
                [
                    'student_id' => $student->id,
                    'status' => 'present',
                ],
            ],
        ]);

    $response->assertOk()
        ->assertJsonPath('mode', 'final')
        ->assertJsonPath('saved_count', 1);

    $this->assertDatabaseHas('attendances', [
        'student_id' => $student->id,
        'schedule_id' => $scheduleItem->id,
        'status' => 'present',
        'source' => 'manual',
        'is_draft' => false,
    ]);
});
