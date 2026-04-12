<?php

use App\Models\Attendance;
use App\Models\ClassSchedule;
use App\Models\Classes;
use App\Models\DailySchedule;
use App\Models\Qrcode;
use App\Models\ScheduleItem;
use App\Models\StudentProfile;
use App\Models\TeacherProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    Carbon::setTestNow(Carbon::parse('2026-02-23 08:00:00'));
});

function createScheduleContextForRevisedFlow(): array
{
    $class = Classes::factory()->create();
    $teacherUser = User::factory()->create(['user_type' => 'teacher']);
    $teacherProfile = TeacherProfile::factory()->create([
        'user_id' => $teacherUser->id,
        'homeroom_class_id' => $class->id,
    ]);

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
        'teacher_id' => $teacherProfile->id,
        'start_time' => '07:00:00',
        'end_time' => '08:30:00',
    ]);

    return [$class, $teacherUser, $teacherProfile, $schedule];
}

it('allows qr scan before end time even when qr ttl has passed', function () {
    [$class, $teacherUser, $teacherProfile, $schedule] = createScheduleContextForRevisedFlow();

    $qr = Qrcode::factory()->create([
        'type' => 'teacher',
        'schedule_id' => $schedule->id,
        'issued_by' => $teacherUser->id,
        'expires_at' => now()->subMinutes(20),
        'is_active' => true,
    ]);

    $response = $this->actingAs($teacherUser)->postJson('/api/attendance/scan', [
        'token' => $qr->token,
    ]);

    $response->assertSuccessful();
    $this->assertDatabaseHas('attendances', [
        'teacher_id' => $teacherProfile->id,
        'schedule_id' => $schedule->id,
        'source' => 'qrcode',
    ]);
});

it('rejects qr scan after schedule end time', function () {
    [$class, $teacherUser, $teacherProfile, $schedule] = createScheduleContextForRevisedFlow();

    Carbon::setTestNow(Carbon::parse('2026-02-23 08:31:00'));

    $qr = Qrcode::factory()->create([
        'type' => 'teacher',
        'schedule_id' => $schedule->id,
        'issued_by' => $teacherUser->id,
        'expires_at' => now()->addMinutes(30),
        'is_active' => true,
    ]);

    $response = $this->actingAs($teacherUser)->postJson('/api/attendance/scan', [
        'token' => $qr->token,
    ]);

    $response->assertStatus(422)
        ->assertJsonPath('message', 'Sesi absensi sudah berakhir untuk jadwal ini');
});

it('auto marks absent for missing students on ended schedules', function () {
    [$class, $teacherUser, $teacherProfile, $schedule] = createScheduleContextForRevisedFlow();

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
        'schedule_id' => $schedule->id,
        'date' => now()->toDateString(),
        'status' => 'present',
        'source' => 'manual',
    ]);

    Carbon::setTestNow(Carbon::parse('2026-02-23 08:40:00'));

    Artisan::call('attendance:auto-mark-absent', [
        '--date' => now()->toDateString(),
    ]);

    $this->assertDatabaseHas('attendances', [
        'student_id' => $studentTwo->id,
        'schedule_id' => $schedule->id,
        'status' => 'absent',
        'source' => 'system_close',
    ]);

    $this->assertDatabaseMissing('attendances', [
        'student_id' => $studentOne->id,
        'schedule_id' => $schedule->id,
        'status' => 'absent',
        'source' => 'system_close',
    ]);
});

it('allows homeroom teacher to update excuse with attachment for attendance without schedule', function () {
    Storage::fake(config('filesystems.default'));

    [$class, $teacherUser, $teacherProfile, $schedule] = createScheduleContextForRevisedFlow();
    $student = StudentProfile::factory()->create([
        'user_id' => User::factory()->create(['user_type' => 'student'])->id,
        'class_id' => $class->id,
    ]);

    $attendance = Attendance::create([
        'attendee_type' => 'student',
        'student_id' => $student->id,
        'schedule_id' => null,
        'date' => now()->toDateString(),
        'status' => 'absent',
        'source' => 'manual',
    ]);

    $response = $this->actingAs($teacherUser)->patch('/api/attendance/'.$attendance->id.'/update-excuse', [
        'status' => 'excused',
        'reason' => 'Surat menyusul',
        'attachment' => UploadedFile::fake()->image('surat.jpg'),
    ]);

    $response->assertSuccessful()
        ->assertJsonPath('attendance.status', 'Izin')
        ->assertJsonPath('attendance.status_code', 'excused')
        ->assertJsonPath('attendance.reason', 'Surat menyusul');

    $attendance->refresh();
    expect($attendance->reason_file)->not->toBeNull();
    expect($attendance->attachments()->count())->toBe(1);
});

it('replaces existing excuse attachment when requested', function () {
    Storage::fake(config('filesystems.default'));

    [$class, $teacherUser, $teacherProfile, $schedule] = createScheduleContextForRevisedFlow();
    $student = StudentProfile::factory()->create([
        'user_id' => User::factory()->create(['user_type' => 'student'])->id,
        'class_id' => $class->id,
    ]);

    $attendance = Attendance::create([
        'attendee_type' => 'student',
        'student_id' => $student->id,
        'schedule_id' => $schedule->id,
        'date' => now()->toDateString(),
        'status' => 'sick',
        'source' => 'manual',
        'reason_file' => 'attendance-attachments/old-proof.jpg',
    ]);

    $attendance->attachments()->create([
        'path' => 'attendance-attachments/old-proof.jpg',
        'original_name' => 'old-proof.jpg',
        'mime_type' => 'image/jpeg',
        'size' => 100,
    ]);
    Storage::put('attendance-attachments/old-proof.jpg', 'old');

    $response = $this->actingAs($teacherUser)->patch('/api/attendance/'.$attendance->id.'/update-excuse', [
        'status' => 'sick',
        'reason' => 'Surat dokter terbaru',
        'replace_existing_attachment' => true,
        'attachment' => UploadedFile::fake()->image('new-proof.jpg'),
    ]);

    $response->assertSuccessful()
        ->assertJsonPath('attendance.status', 'Sakit')
        ->assertJsonPath('attendance.status_code', 'sick')
        ->assertJsonPath('attendance.reason', 'Surat dokter terbaru');

    $attendance->refresh();
    expect($attendance->attachments()->count())->toBe(1);
    expect($attendance->attachments()->first()->original_name)->toBe('new-proof.jpg');
    expect(Storage::exists('attendance-attachments/old-proof.jpg'))->toBeFalse();
});

it('supports bulk manual sick attendance followed by attachment upload', function () {
    Storage::fake(config('filesystems.default'));

    [$class, $teacherUser, $teacherProfile, $schedule] = createScheduleContextForRevisedFlow();
    $student = StudentProfile::factory()->create([
        'user_id' => User::factory()->create(['user_type' => 'student'])->id,
        'class_id' => $class->id,
    ]);

    $bulkResponse = $this->actingAs($teacherUser)->postJson('/api/attendance/bulk-manual', [
        'schedule_id' => $schedule->id,
        'date' => now()->toDateString(),
        'mode' => 'final',
        'items' => [
            [
                'student_id' => $student->id,
                'status' => 'sick',
                'reason' => 'Sakit awal',
            ],
        ],
    ]);

    $bulkResponse->assertOk()
        ->assertJsonPath('data.0.student_id', $student->id)
        ->assertJsonPath('data.0.status', 'sick');

    $attendanceId = $bulkResponse->json('data.0.id');
    expect($attendanceId)->not->toBeNull();

    $updateResponse = $this->actingAs($teacherUser)->patch('/api/attendance/'.$attendanceId.'/update-excuse', [
        'status' => 'sick',
        'reason' => 'Sakit dengan surat dokter',
        'replace_existing_attachment' => true,
        'attachment' => UploadedFile::fake()->image('surat-dokter.jpg'),
    ]);

    $updateResponse->assertSuccessful()
        ->assertJsonPath('attendance.status', 'Sakit')
        ->assertJsonPath('attendance.status_code', 'sick')
        ->assertJsonPath('attendance.reason', 'Sakit dengan surat dokter');

    $attendance = Attendance::findOrFail($attendanceId);
    expect($attendance->reason_file)->not->toBeNull();
    expect($attendance->attachments()->count())->toBe(1);
});

it('prevents subject teacher from correcting auto alpha attendance', function () {
    [$class, $teacherUser, $teacherProfile, $schedule] = createScheduleContextForRevisedFlow();
    $teacherProfile->update(['homeroom_class_id' => null]);

    $student = StudentProfile::factory()->create([
        'user_id' => User::factory()->create(['user_type' => 'student'])->id,
        'class_id' => $class->id,
    ]);

    $attendance = Attendance::create([
        'attendee_type' => 'student',
        'student_id' => $student->id,
        'schedule_id' => $schedule->id,
        'date' => now()->toDateString(),
        'status' => 'absent',
        'source' => 'system_close',
    ]);

    $response = $this->actingAs($teacherUser)->postJson('/api/attendance/'.$attendance->id.'/excuse', [
        'status' => 'present',
        'reason' => 'Koreksi manual',
    ]);

    $response->assertStatus(403)
        ->assertJsonPath('message', 'Presensi alpha otomatis hanya dapat dikoreksi oleh wali kelas atau waka kesiswaan.');
});

it('requires homeroom teacher to attach proof when correcting auto alpha attendance', function () {
    $this->withExceptionHandling();
    [$class, $teacherUser, $teacherProfile, $schedule] = createScheduleContextForRevisedFlow();

    $student = StudentProfile::factory()->create([
        'user_id' => User::factory()->create(['user_type' => 'student'])->id,
        'class_id' => $class->id,
    ]);

    $attendance = Attendance::create([
        'attendee_type' => 'student',
        'student_id' => $student->id,
        'schedule_id' => $schedule->id,
        'date' => now()->toDateString(),
        'status' => 'absent',
        'source' => 'system_close',
    ]);

    $response = $this->actingAs($teacherUser)->patch('/api/attendance/'.$attendance->id.'/update-excuse', [
        'status' => 'excused',
        'reason' => 'Surat menyusul',
    ]);

    $response->assertStatus(422)
        ->assertJsonPath('message', 'Wali kelas wajib menyertakan alasan dan bukti surat untuk koreksi alpha otomatis.');
});
