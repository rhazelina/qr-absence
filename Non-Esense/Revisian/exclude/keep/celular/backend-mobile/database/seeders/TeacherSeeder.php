<?php

namespace Database\Seeders;

use App\Models\TeacherProfile;
use App\Models\User;
use Illuminate\Database\Seeder;

class TeacherSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::updateOrCreate(
            ['username' => 'guru1'],
            [
                'name' => 'Guru Pertama',
                'email' => 'guru1@example.com',
                'password' => 'password123', // Auto-hashed by User model cast
                'user_type' => 'teacher',
                'active' => true,
            ]
        );

        TeacherProfile::updateOrCreate(
            ['user_id' => $user->id],
            [
                'nip' => 'NIP-0001',
                'subject' => 'Normatif',
            ]
        );
    }
}
