<?php

use App\Models\User;
use App\Models\Classes;
use App\Models\StudentProfile;
use App\Models\TeacherProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

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
            'rooms_count'
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
