<?php

use App\Models\Classes;
use App\Models\ClassSchedule;
use App\Models\DailySchedule;
use App\Models\Major;
use App\Models\ScheduleItem;
use App\Models\Subject;
use App\Models\TeacherProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->admin = User::factory()->create(['user_type' => 'admin', 'username' => 'admin']);
    // Waka needs AdminProfile
    \App\Models\AdminProfile::factory()->create([
        'user_id' => $this->admin->id,
        'type' => 'waka',
    ]);
    \App\Models\TeacherProfile::factory()->create([
        'user_id' => $this->admin->id,
        'jabatan' => ['Waka Kurikulum'],
    ]);

    $this->teacher = User::factory()->create(['user_type' => 'teacher', 'username' => 'teacher']);
    $this->teacherProfile = TeacherProfile::factory()->create(['user_id' => $this->teacher->id]);

    $this->major = Major::factory()->create();
    $this->classRoom = Classes::create([
        'grade' => 'X',
        'label' => 'RPL 1',
        'major_id' => $this->major->id,
    ]);
});

test('waka can create class schedule', function () {
    $payload = [
        'class_id' => $this->classRoom->id,
        'semester' => 1,
        'year' => '2024/2025',
        'is_active' => true,
        'days' => [
            [
                'day' => 'Monday',
                'items' => [
                    [
                        'teacher_id' => $this->teacherProfile->id,
                        'subject_id' => \App\Models\Subject::factory()->create()->id,
                        'start_time' => '07:00',
                        'end_time' => '08:00',
                        'type' => 'regular',
                        'room' => 'Lab 1',
                    ],
                ],
            ],
        ],
    ];

    $response = $this->actingAs($this->admin)
        ->postJson('/api/schedules', $payload);

    $response->assertStatus(201)
        ->assertJsonPath('semester', 1);

    $this->assertDatabaseHas('class_schedules', [
        'class_id' => $this->classRoom->id,
        'semester' => 1,
    ]);
});

test('waka can update class schedule', function () {
    // initial setup
    $schedule = ClassSchedule::create([
        'class_id' => $this->classRoom->id,
        'semester' => 1,
        'year' => '2024/2025',
        'is_active' => true,
    ]);

    $payload = [
        'year' => '2025/2026',
        'days' => [
            [
                'day' => 'Tuesday',
                'items' => [],
            ],
        ],
    ];

    $response = $this->actingAs($this->admin)
        ->putJson("/api/schedules/{$schedule->id}", $payload);

    $response->assertStatus(200)
        ->assertJsonPath('year', '2025/2026');

    $this->assertDatabaseHas('class_schedules', [
        'id' => $schedule->id,
        'year' => '2025/2026',
    ]);
});

test('waka can delete class schedule', function () {
    $schedule = ClassSchedule::create([
        'class_id' => $this->classRoom->id,
        'semester' => 1,
        'year' => '2024/2025',
        'is_active' => true,
    ]);

    $response = $this->actingAs($this->admin)
        ->deleteJson("/api/schedules/{$schedule->id}");

    $response->assertStatus(200);

    $this->assertDatabaseMissing('class_schedules', ['id' => $schedule->id]);
});

test('waka kesiswaan cannot create class schedule', function () {
    $wakaKesiswaan = User::factory()->create(['user_type' => 'teacher', 'username' => 'waka_kesiswaan']);
    \App\Models\AdminProfile::factory()->create([
        'user_id' => $wakaKesiswaan->id,
        'type' => 'waka',
    ]);
    \App\Models\TeacherProfile::factory()->create([
        'user_id' => $wakaKesiswaan->id,
        'jabatan' => ['Waka Kesiswaan'],
    ]);

    $payload = [
        'class_id' => $this->classRoom->id,
        'semester' => 1,
        'year' => '2024/2025',
        'is_active' => true,
        'days' => [],
    ];

    $response = $this->actingAs($wakaKesiswaan)
        ->postJson('/api/schedules', $payload);

    $response->assertForbidden();
});

test('schedule overlap validation returns 422 instead of controller class error', function () {
    $admin = User::factory()->admin()->create();

    $existingSchedule = ClassSchedule::create([
        'class_id' => $this->classRoom->id,
        'semester' => 1,
        'year' => '2024/2025',
        'is_active' => true,
    ]);

    $dailySchedule = DailySchedule::factory()->create([
        'class_schedule_id' => $existingSchedule->id,
        'day' => 'Monday',
    ]);

    ScheduleItem::factory()->create([
        'daily_schedule_id' => $dailySchedule->id,
        'teacher_id' => $this->teacherProfile->id,
        'subject_id' => Subject::factory()->create()->id,
        'start_time' => '07:00',
        'end_time' => '08:00',
    ]);

    $payload = [
        'class_id' => $this->classRoom->id,
        'semester' => 1,
        'year' => '2024/2025',
        'is_active' => true,
        'days' => [
            [
                'day' => 'Monday',
                'items' => [
                    [
                        'teacher_id' => $this->teacherProfile->id,
                        'subject_id' => Subject::factory()->create()->id,
                        'start_time' => '07:30',
                        'end_time' => '08:30',
                        'type' => 'regular',
                        'room' => 'Lab 2',
                    ],
                ],
            ],
        ],
    ];

    $response = $this->actingAs($admin)
        ->postJson('/api/schedules', $payload);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['schedule']);
});

test('waka cannot create class schedule item without subject id', function () {
    $payload = [
        'class_id' => $this->classRoom->id,
        'semester' => 1,
        'year' => '2024/2025',
        'is_active' => true,
        'days' => [
            [
                'day' => 'Monday',
                'items' => [
                    [
                        'teacher_id' => $this->teacherProfile->id,
                        'start_time' => '07:00',
                        'end_time' => '08:00',
                        'room' => 'Lab 1',
                    ],
                ],
            ],
        ],
    ];

    $response = $this->actingAs($this->admin)
        ->postJson('/api/schedules', $payload);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['days.0.items.0.subject_id']);
});

test('waka cannot update class schedule item without subject id', function () {
    $schedule = ClassSchedule::create([
        'class_id' => $this->classRoom->id,
        'semester' => 1,
        'year' => '2024/2025',
        'is_active' => true,
    ]);

    $response = $this->actingAs($this->admin)
        ->putJson("/api/schedules/{$schedule->id}", [
            'days' => [
                [
                    'day' => 'Tuesday',
                    'items' => [
                        [
                            'teacher_id' => $this->teacherProfile->id,
                            'start_time' => '08:00',
                            'end_time' => '09:00',
                            'room' => 'Lab 2',
                        ],
                    ],
                ],
            ],
        ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['days.0.items.0.subject_id']);
});

test('today schedule endpoint returns schedules with indonesian day label', function () {
    $teacher = User::factory()->teacher()->create(['username' => 'teacher_today']);
    $classRoom = Classes::factory()->create();
    $classSchedule = ClassSchedule::factory()->create([
        'class_id' => $classRoom->id,
        'is_active' => true,
    ]);
    $dailySchedule = DailySchedule::factory()->create([
        'class_schedule_id' => $classSchedule->id,
        'day' => 'Monday',
    ]);
    $schedule = ScheduleItem::factory()->create([
        'daily_schedule_id' => $dailySchedule->id,
        'teacher_id' => $teacher->teacherProfile->id,
        'subject_id' => Subject::factory()->create(['name' => 'Pemrograman Web'])->id,
        'room' => 'Lab 3',
    ]);

    $response = $this->actingAs($teacher)
        ->getJson('/api/me/schedules/today');

    $response->assertOk()
        ->assertJsonPath('day', 'Senin')
        ->assertJsonPath('items.0.id', $schedule->id);
});

test('show class schedule includes warnings for legacy items without subject linkage', function () {
    $schedule = ClassSchedule::create([
        'class_id' => $this->classRoom->id,
        'semester' => 1,
        'year' => '2024/2025',
        'is_active' => true,
    ]);

    $dailySchedule = DailySchedule::factory()->create([
        'class_schedule_id' => $schedule->id,
        'day' => 'Monday',
    ]);

    $legacyItem = ScheduleItem::factory()->create([
        'daily_schedule_id' => $dailySchedule->id,
        'teacher_id' => $this->teacherProfile->id,
        'subject_id' => null,
        'keterangan' => 'BK',
        'start_time' => '07:00',
        'end_time' => '08:00',
    ]);

    $response = $this->actingAs($this->admin)
        ->getJson("/api/schedules/{$schedule->id}");

    $response->assertOk()
        ->assertJsonPath('daily_schedules.0.schedule_items.0.subject_name', 'BK')
        ->assertJsonPath('warnings.legacy_schedule_items.0.schedule_item_id', $legacyItem->id)
        ->assertJsonPath('warnings.legacy_schedule_items.0.issues.0', 'subject_missing');
});
