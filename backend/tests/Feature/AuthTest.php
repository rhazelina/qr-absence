<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('can login with correct credentials', function () {
    $user = User::factory()->create([
        'username' => 'testuser',
        'password' => bcrypt('password123'),
        'active' => true,
    ]);

    $response = $this->postJson('/api/auth/login', [
        'login' => 'testuser',
        'password' => 'password123',
    ]);

    $response->assertSuccessful()
        ->assertJsonStructure([
            'token',
            'user' => ['id', 'username', 'name'],
        ]);
});

it('cannot login with incorrect password', function () {
    $user = User::factory()->create([
        'username' => 'testuser',
        'password' => bcrypt('password123'),
        'active' => true,
    ]);

    $response = $this->postJson('/api/auth/login', [
        'login' => 'testuser',
        'password' => 'wrongpassword',
    ]);

    $response->assertStatus(422);
});

it('can get authenticated user info', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->getJson('/api/me');

    $response->assertSuccessful()
        ->assertJsonPath('username', $user->username);
});

it('can logout', function () {
    $user = User::factory()->create();

    // Sanctum login simulation
    $token = $user->createToken('test')->plainTextToken;

    $response = $this->withHeader('Authorization', 'Bearer '.$token)
        ->postJson('/api/auth/logout');

    $response->assertSuccessful();
    expect($user->tokens()->count())->toBe(0);
});
