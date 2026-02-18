<?php

namespace Database\Seeders;

use App\Models\Classes;
use App\Models\Major;
use App\Models\StudentProfile;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class ClassOfficerSeeder extends Seeder
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
                'label' => 'RPL 2',
            ],
            [
                'major_id' => $major->id,
            ]
        );

        // Gunakan siswa existing berdasarkan NISN jika sudah ada,
        // agar tidak membuat akun duplikat dengan identitas yang sama.
        $existingProfile = StudentProfile::query()
            ->where('nisn', '0079292238')
            ->with('user')
            ->first();

        if ($existingProfile) {
            $existingProfile->update([
                'class_id' => $class->id,
                'is_class_officer' => true,
            ]);

            return;
        }

        // Fallback: buat akun bila belum ada di data utama.
        $user = User::updateOrCreate(
            ['username' => '0079292238'],
            [
                'name' => 'MOCH. ABYL GUSTIAN',
                'email' => '0079292238@student.example.com',
                'password' => Hash::make('password123'),
                'user_type' => 'student',
                'active' => true,
            ]
        );

        StudentProfile::updateOrCreate(
            ['user_id' => $user->id],
            [
                'nisn' => '0079292238',
                'nis' => '0079292238',
                'gender' => 'L',
                'address' => 'Alamat Siswa',
                'class_id' => $class->id,
                'is_class_officer' => true,
            ]
        );
    }
}
