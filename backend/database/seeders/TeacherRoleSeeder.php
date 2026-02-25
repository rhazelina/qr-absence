<?php

namespace Database\Seeders;

use App\Models\AdminProfile;
use App\Models\Classes;
use App\Models\Major;
use App\Models\TeacherProfile;
use Illuminate\Database\Seeder;

class TeacherRoleSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Assign Waka Roles
        $wakaRoles = [
            'Waka Kesiswaan',
            'Waka Kurikulum',
            'Waka Humas',
            'Waka Sarpras',
        ];

        $teachers = TeacherProfile::all()->shuffle();
        $wakaTeachers = $teachers->splice(0, 4);

        foreach ($wakaTeachers as $index => $teacher) {
            $teacher->update(['jabatan' => $wakaRoles[$index]]);

            // Also ensure they have an AdminProfile of type 'waka' if that's how the system works
            AdminProfile::updateOrCreate(
                ['user_id' => $teacher->user_id],
                ['type' => 'waka']
            );

            // Mark user type as admin for login permissions
            $teacher->user->update(['user_type' => 'admin']);
        }

        // 2. Assign Kapro Roles for each Major
        $majors = Major::all();
        $kaproTeachers = $teachers->splice(0, $majors->count());

        foreach ($majors as $index => $major) {
            $teacher = $kaproTeachers[$index];
            $teacher->update([
                'jabatan' => "Kapro {$major->code}",
                'konsentrasi_keahlian' => $major->name,
            ]);
        }
        

        // 3. Assign Walikelas Roles for all Classes
        $classes = Classes::all();
        $walikelasTeachers = $teachers->splice(0, $classes->count());

        foreach ($classes as $index => $class) {
            if (isset($walikelasTeachers[$index])) {
                $teacher = $walikelasTeachers[$index];

                // Format as requested: "10 RPL 1" etc.
                // We need to parse the class name to get something like "10 RPL 1"
                // Our class names are currently "Rekayasa Perangkat Lunak 1" with grade 10
                // We want "[Grade] [Code] [Number]"

                $label = $class->label; // "Rekayasa Perangkat Lunak 1"
                $parts = explode(' ', $label);
                $number = end($parts);
                $majorCode = $class->major->code;
                $formattedRole = "{$class->grade} {$majorCode} {$number}";

                $teacher->update([
                    'jabatan' => $formattedRole,
                    'homeroom_class_id' => $class->id,
                ]);
            }
        }
    }
}
