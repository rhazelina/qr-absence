<?php

namespace Database\Seeders;

use App\Models\Classes;
use App\Models\ClassSchedule;
use App\Models\Subject;
use App\Models\TeacherProfile;
use Illuminate\Database\Seeder;

class NewScheduleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Find or create class XII RPL 2
        $class = Classes::where('grade', '12')->where('label', 'RPL 2')->first()
            ?? Classes::where('name', 'like', '%XII RPL 2%')->first()
            ?? Classes::first(); // Fallback if still not found, although based on previous tinker it exists (ID 50)

        if (! $class) {
            $this->command->warn('No classes found. Skipping schedule seeding.');

            return;
        }

        // Delete existing schedules for this class to ensure clean insert
        ClassSchedule::where('class_id', $class->id)->delete();

        // Create Header
        $schedule = ClassSchedule::create([
            'class_id' => $class->id,
            'semester' => 1, // Or current semester
            'year' => '2024/2025', // Or current year
            'is_active' => true,
        ]);

        $periodemap = [
            1 => ['07:00', '07:40'],
            2 => ['07:40', '08:20'],
            3 => ['08:20', '09:00'],
            4 => ['09:00', '09:40'],
            5 => ['10:00', '10:40'],
            6 => ['10:40', '11:20'],
            7 => ['12:20', '13:00'],
            8 => ['13:00', '13:40'],
            9 => ['13:40', '14:20'],
            10 => ['14:20', '15:00'],
            11 => ['15:00', '15:40'],
            12 => ['15:40', '16:20'],
        ];

        $jadwalData = [
            'Monday' => [
                ['mapel' => 'PKN', 'guru' => 'Samadin, SAP', 'jam_mulai' => 1, 'jam_selesai' => 2],
                ['mapel' => 'B.Ing', 'guru' => 'Fajar Ningtyas, S.Pd', 'jam_mulai' => 3, 'jam_selesai' => 4],
                ['mapel' => 'MPP', 'guru' => 'Aang Noeraries Wahyudipasa, S.Si', 'jam_mulai' => 5, 'jam_selesai' => 6],
                ['mapel' => 'MPKK', 'guru' => 'RR. Henning Gratyani Anggraeni, S.Pd', 'jam_mulai' => 7, 'jam_selesai' => 10],
            ],
            'Tuesday' => [
                ['mapel' => 'MPKK', 'guru' => 'Zulkifli Abdillah, S.Kom', 'jam_mulai' => 1, 'jam_selesai' => 4],
                ['mapel' => 'MTK', 'guru' => 'Wiwin Winangsih, S.Pd', 'jam_mulai' => 5, 'jam_selesai' => 7],
                ['mapel' => 'PAI', 'guru' => 'Juzky S.Pd', 'jam_mulai' => 8, 'jam_selesai' => 10], // Assuming 'M' is a name/placeholder
            ],
            'Wednesday' => [
                ['mapel' => 'B.Jawa', 'guru' => 'Moch. Bachrudin, S.Pd', 'jam_mulai' => 1, 'jam_selesai' => 2],
                ['mapel' => 'B.Ing', 'guru' => 'Fajar Ningtyas, S.Pd', 'jam_mulai' => 3, 'jam_selesai' => 4],
                ['mapel' => 'MPKK', 'guru' => 'Triana Ardiane S.pd', 'jam_mulai' => 5, 'jam_selesai' => 10],
            ],
            'Thursday' => [
                ['mapel' => 'MPP', 'guru' => 'Evi Irniyah, S.Pd', 'jam_mulai' => 1, 'jam_selesai' => 2],
                ['mapel' => 'PKDK', 'guru' => 'Adhi Bagus Pormana, S.Pd', 'jam_mulai' => 3, 'jam_selesai' => 6],
                ['mapel' => 'BK', 'guru' => 'Roudhotul Husna Yani, S.Psi', 'jam_mulai' => 7, 'jam_selesai' => 7],
                ['mapel' => 'MPKK', 'guru' => 'Zulkifli Abdillah, S.Kom', 'jam_mulai' => 8, 'jam_selesai' => 10],
            ],
            'Friday' => [
                ['mapel' => 'MPKK', 'guru' => 'RR. Henning Gratyani Anggraeni, S.Pd', 'jam_mulai' => 3, 'jam_selesai' => 5],
                ['mapel' => 'BI', 'guru' => 'Devi Arveni, S.Pd., Gr', 'jam_mulai' => 6, 'jam_selesai' => 8],
                ['mapel' => 'MPKK', 'guru' => 'Triana Ardiane S.pd', 'jam_mulai' => 9, 'jam_selesai' => 10],
            ],
        ];

        foreach ($jadwalData as $day => $items) {
            $daily = $schedule->dailySchedules()->create(['day' => $day]);

            foreach ($items as $item) {
                // Find or create subject
                $subject = Subject::firstOrCreate(
                    ['name' => $item['mapel']],
                    ['code' => strtoupper(substr($item['mapel'], 0, 3)).'-'.rand(100, 999)]
                );

                // Find teacher by user name
                $teacherUser = \App\Models\User::where('name', 'like', "%{$item['guru']}%")->first();

                if ($teacherUser && $teacherUser->teacherProfile) {
                    $teacherId = $teacherUser->teacherProfile->id;
                } else {
                    // Create if not exists to avoid failure
                    $user = \App\Models\User::factory()->create([
                        'name' => $item['guru'],
                        'email' => strtolower(str_replace([' ', ',', '.'], '', $item['guru'])).'@example.com',
                        'user_type' => 'teacher',
                    ]);
                    $teacherProfile = TeacherProfile::factory()->create([
                        'user_id' => $user->id,
                        'subject' => $item['mapel'],
                    ]);
                    $teacherId = $teacherProfile->id;
                }

                $startTime = $periodemap[$item['jam_mulai']][0] ?? '07:00';
                $endTime = $periodemap[$item['jam_selesai']][1] ?? '08:00';

                $daily->scheduleItems()->create([
                    'subject_id' => $subject->id,
                    'teacher_id' => $teacherId,
                    'start_time' => $startTime,
                    'end_time' => $endTime,
                    'room' => 'R. '.$class->grade,
                    'keterangan' => "Jam ke-{$item['jam_mulai']} s/d {$item['jam_selesai']}",
                ]);
            }
        }

        $this->command->info("Created specific schedule structure for class: {$class->name}");
    }
}
