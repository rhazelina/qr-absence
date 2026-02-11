<?php

namespace Database\Seeders;

use App\Models\Classes;
use App\Models\Major;
use App\Models\TeacherProfile;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class HomeroomTeacherSeeder extends Seeder
{
    public function run(): void
    {
        // Pastikan ada kelas
        $major = Major::firstOrCreate(
            ['code' => 'RPL'],
            ['name' => 'Rekayasa Perangkat Lunak']
        );

        $class = Classes::firstOrCreate(
            [
                'grade' => '12',
                'label' => 'RPL 1',
            ],
            [
                'major_id' => $major->id,
            ]
        );

        // Buat user wali kelas
        $user = User::updateOrCreate(
            ['username' => 'walikelas1'],
            [
                'name' => 'ALIFAH DIANTEBES AINDRA, S.Pd',
                'email' => 'walikelas1@example.com',
                'password' => Hash::make('password123'),
                'user_type' => 'teacher',
                'active' => true,
            ]
        );

        TeacherProfile::updateOrCreate(
            ['user_id' => $user->id],
            [
                'nip' => 'NIP-001',
                'subject' => 'Matematika',
                'homeroom_class_id' => $class->id, // Set as homeroom teacher
            ]
        );
    }
}
