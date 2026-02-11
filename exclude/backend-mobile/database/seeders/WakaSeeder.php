<?php

namespace Database\Seeders;

use App\Models\AdminProfile;
use App\Models\User;
use Illuminate\Database\Seeder;

class WakaSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::updateOrCreate(
            ['username' => 'waka1'],
            [
                'name' => 'Wakil Kepala Sekolah',
                'email' => 'waka@example.com',
                'password' => 'password123', // Auto-hashed by User model cast
                'user_type' => 'admin',
                'active' => true,
            ]
        );

        AdminProfile::updateOrCreate(
            ['user_id' => $user->id],
            ['type' => 'waka']
        );
    }
}
