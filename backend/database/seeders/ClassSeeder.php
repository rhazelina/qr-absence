<?php

namespace Database\Seeders;

use App\Models\Classes;
use App\Models\Major;
use App\Models\StudentProfile;
use App\Models\User;
use Faker\Factory as Faker;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class ClassSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create('id_ID');
        $majors = Major::all();

        if ($majors->isEmpty()) {
            $this->command->warn('No majors found. Please run MajorSeeder first.');

            return;
        }

        $grades = ['10', '11', '12'];
        $labels = ['1', '2'];

        foreach ($majors as $major) {
            foreach ($grades as $grade) {
                foreach ($labels as $label) {
                    // Class label as requested: "Rekayasa Perangkat Lunak 1"
                    $className = "{$major->name} {$label}";

                    $class = Classes::firstOrCreate(
                        [
                            'grade' => (string) $grade,
                            'label' => $className,
                        ],
                        [
                            'major_id' => $major->id,
                        ]
                    );

                    // Create 5 students per class
                    for ($s = 1; $s <= 5; $s++) {
                        $nisn = $faker->unique()->numerify('00#######');
                        $gender = $faker->randomElement(['L', 'P']);
                        $name = $faker->firstName($gender == 'L' ? 'male' : 'female').' '.$faker->lastName;

                        $studentUser = User::create([
                            'username' => $nisn,
                            'name' => strtoupper($name),
                            'email' => "{$nisn}@student.example.com",
                            'password' => Hash::make('password123'),
                            'user_type' => 'student',
                            'active' => true,
                        ]);

                        StudentProfile::create([
                            'user_id' => $studentUser->id,
                            'nisn' => $nisn,
                            'nis' => '20'.$nisn,
                            'gender' => $gender,
                            'address' => $faker->address,
                            'class_id' => $class->id,
                        ]);
                    }
                }
            }
        }
    }
}
