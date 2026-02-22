<?php

use App\Models\User;
use App\Models\Classes;
use App\Models\StudentProfile;
use App\Models\TeacherProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use function Pest\Laravel\actingAs;

uses(RefreshDatabase::class);

test('admin can access students list', function () {
    $admin = User::factory()->create(['user_type' => 'admin']);
    $student = StudentProfile::factory()->create();

    $response = actingAs($admin)->getJson('/api/students');

    $response->assertStatus(200)
             ->assertJsonPath('data.0.id', $student->id);
});

test('teacher can access students list and see homeroom students', function () {
    $teacherUser = User::factory()->create(['user_type' => 'teacher']);
    $classRoom = Classes::factory()->create();
    $teacher = TeacherProfile::factory()->create([
        'user_id' => $teacherUser->id,
        'homeroom_class_id' => $classRoom->id,
    ]);

    $homeroomStudent = StudentProfile::factory()->create(['class_id' => $classRoom->id]);
    $otherStudent = StudentProfile::factory()->create();

    $response = actingAs($teacherUser)->getJson('/api/students');

    $response->assertStatus(200)
             ->assertJsonFragment(['id' => $homeroomStudent->id])
             ->assertJsonMissing(['id' => $otherStudent->id]);
});

test('student can access students list and see classmates', function () {
    $studentUser = User::factory()->create(['user_type' => 'student']);
    $classRoom = Classes::factory()->create();
    $student = StudentProfile::factory()->create([
        'user_id' => $studentUser->id,
        'class_id' => $classRoom->id,
    ]);

    $classmate = StudentProfile::factory()->create(['class_id' => $classRoom->id]);
    $otherStudent = StudentProfile::factory()->create();

    $response = actingAs($studentUser)->getJson('/api/students');

    $response->assertStatus(200)
             ->assertJsonFragment(['id' => $classmate->id])
             ->assertJsonMissing(['id' => $otherStudent->id]);
});

