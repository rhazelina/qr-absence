<?php

namespace Database\Seeders;

use App\Models\AdminProfile;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::updateOrCreate(
            ['username' => 'admin'],
            [
                'name' => 'Admin',
                'email' => 'admin@example.com',
                'password' => Hash::make(config('app.admin_password', 'password123')),
                'user_type' => 'admin',
                'active' => true,
            ]
        );

        AdminProfile::updateOrCreate(
            ['user_id' => $user->id],
            ['type' => 'admin']
        );
    }
}
