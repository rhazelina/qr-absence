<?php

namespace Database\Seeders;

use App\Models\Classes;
use App\Models\Major;
use App\Models\TeacherProfile;
use App\Models\User;
use Illuminate\Database\Seeder;

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

        // Cari user wali kelas berdasarkan nama (agar sinkron dengan TeacherSeeder)
        $teacherName = 'Triana Ardiani, S.Pd';
        $user = User::where('name', $teacherName)->first();

        if (! $user) {
            throw new \Exception("Teacher '$teacherName' not found. Please run TeacherSeeder first.");
        }

        // Update username jika diperlukan untuk tetap walikelas1
        $user->update(['username' => 'walikelas1']);

        TeacherProfile::updateOrCreate(
            ['user_id' => $user->id],
            [
                'homeroom_class_id' => $class->id, // Set as homeroom teacher
            ]
        );
    }
}
