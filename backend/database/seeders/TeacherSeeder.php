<?php

namespace Database\Seeders;

use App\Models\TeacherProfile;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class TeacherSeeder extends Seeder
{
    public function run(): void
    {
        // Clean up old teacher data to ensure a clean slate
        TeacherProfile::query()->delete();
        User::where('user_type', 'teacher')->delete();

        $filePath = base_path('datagurufix.txt');
        if (! file_exists($filePath)) {
            $this->command->error("File $filePath not found!");

            return;
        }

        $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        // Remove duplicates from the file lines but maintain order
        $teachers = array_values(array_unique(array_map('trim', $lines)));

        foreach ($teachers as $index => $name) {
            if ($name === '.') {
                continue;
            } // Skip dot if any

            // Generate username from name (slugified)
            $cleanName = preg_replace('/[^a-zA-Z0-9\s]/', '', $name);
            $parts = explode(' ', strtolower($cleanName));
            $username = (count($parts) > 1) ? $parts[0].'.'.$parts[1] : $parts[0];

            // Handle username uniqueness
            $originalUsername = $username;
            $counter = 1;
            while (User::where('username', $username)->where('name', '!=', $name)->exists()) {
                $username = $originalUsername.$counter;
                $counter++;
            }

            $user = User::updateOrCreate(
                ['name' => $name],
                [
                    'username' => $username,
                    'email' => $username.'@sekolah.sch.id',
                    'password' => Hash::make('password123'),
                    'user_type' => 'teacher',
                    'active' => true,
                ]
            );

            TeacherProfile::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'nip' => 'NIP-'.str_pad($index + 1, 4, '0', STR_PAD_LEFT),
                    'jabatan' => 'Guru',
                    'kode_guru' => strtoupper(substr(Str::slug($name), 0, 3)).str_pad($index + 1, 3, '0', STR_PAD_LEFT),
                ]
            );
        }

        $this->command->info('Seeded '.count($teachers).' unique teachers.');
    }
}
