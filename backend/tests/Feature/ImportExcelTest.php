<?php

use App\Models\Classes;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->admin = User::factory()->create(['user_type' => 'admin']);
});

it('validates siswa import array correctly and returns formatted error schema', function () {
    $response = $this->actingAs($this->admin)->postJson('/api/import/siswa', [
        'items' => [
            [
                'name' => 'John Doe',
                'username' => 'johndoe',
                'nisn' => 'not-numeric', // should fail
                'nis' => '12345',
                'gender' => 'L',
                'address' => 'Jl. Test 1',
                'class_id' => 999, // probably doesn't exist
            ],
        ],
    ]);

    $response->assertStatus(422)
        ->assertJsonStructure([
            'total_rows',
            'success_count',
            'failed_count',
            'errors' => [
                '*' => ['row', 'column', 'message'],
            ],
        ]);

    $json = $response->json();
    expect($json['total_rows'])->toBe(1);
    expect($json['success_count'])->toBe(0);
    expect($json['failed_count'])->toBe(1);

    // Check if error format is exact
    expect($json['errors'][0]['row'])->toBe(1);
    expect($json['errors'][0]['column'])->toBe('nisn');
});

it('successfully imports siswa with valid data', function () {
    $kelas = Classes::factory()->create();

    $response = $this->actingAs($this->admin)->postJson('/api/import/siswa', [
        'items' => [
            [
                'name' => 'John Doe Valid',
                'username' => 'johndoe_valid',
                'nisn' => '9999999',
                'nis' => '88888',
                'gender' => 'L',
                'address' => 'Jl. Test 1',
                'class_id' => $kelas->id,
            ],
        ],
    ]);

    $response->assertStatus(201);

    $json = $response->json();
    expect($json['success_count'])->toBe(1);
    expect($json['failed_count'])->toBe(0);

    $this->assertDatabaseHas('users', ['username' => 'johndoe_valid']);
    $this->assertDatabaseHas('student_profiles', ['nisn' => '9999999', 'class_id' => $kelas->id]);
});

it('successfully imports siswa with class label instead of ID', function () {
    $kelas = Classes::factory()->create(['label' => 'XII RPL 2']);

    $response = $this->actingAs($this->admin)->postJson('/api/import/siswa', [
        'items' => [
            [
                'name' => 'John Label',
                'username' => 'john_label',
                'nisn' => '7777777',
                'nis' => '66666',
                'gender' => 'L',
                'address' => 'Jl. Test 2',
                'class_id' => 'XII RPL 2', // Label here
            ],
        ],
    ]);

    $response->assertStatus(201);
    $this->assertDatabaseHas('student_profiles', ['nisn' => '7777777', 'class_id' => $kelas->id]);
});

it('successfully imports siswa using separate grade and class_label columns', function () {
    $kelas = Classes::factory()->create(['grade' => '11', 'label' => 'RPL 1']);

    $response = $this->actingAs($this->admin)->postJson('/api/import/siswa', [
        'items' => [
            [
                'name' => 'Jane Composite',
                'username' => 'jane_comp',
                'nisn' => '5555555',
                'nis' => '44444',
                'gender' => 'P',
                'address' => 'Jl. Test 3',
                'grade' => '11',
                'class_label' => 'RPL 1',
            ],
        ],
    ]);

    $response->assertStatus(201);
    $this->assertDatabaseHas('student_profiles', ['nisn' => '5555555', 'class_id' => $kelas->id]);
});
