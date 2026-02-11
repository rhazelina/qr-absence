<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('allows student to register a device', function () {
    $student = User::factory()->student()->create();

    $response = $this->actingAs($student)->postJson('/api/me/devices', [
        'name' => 'My Phone',
        'identifier' => 'device-123',
        'platform' => 'android',
    ]);

    $response->assertStatus(201);
    $this->assertDatabaseHas('devices', [
        'user_id' => $student->id,
        'identifier' => 'device-123',
    ]);
});

it('allows student to delete a device', function () {
    $student = User::factory()->student()->create();
    $device = $student->devices()->create([
        'name' => 'Old Phone',
        'identifier' => 'old-123',
        'platform' => 'ios',
    ]);

    $response = $this->actingAs($student)->deleteJson("/api/me/devices/{$device->id}");

    $response->assertStatus(200);
    $this->assertDatabaseMissing('devices', ['id' => $device->id]);
});
