<?php

namespace Database\Seeders;

use App\Models\Classes;
use App\Models\Schedule;
use App\Models\Subject;
use App\Models\TeacherProfile;
use Illuminate\Database\Seeder;

class ClassScheduleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Seeding schedules for all classes...');

        // Ensure subjects exist first
        $this->seedSubjects();

        $classes = Classes::with(['homeroomTeacher', 'major'])->get();
        $teachers = TeacherProfile::all();
        $subjects = Subject::all();

        if ($classes->isEmpty()) {
            $this->command->warn('No classes found. Please run ComprehensiveDataSeeder first.');
            return;
        }

        if ($teachers->isEmpty()) {
            $this->command->warn('No teachers found. Please run ComprehensiveDataSeeder first.');
            return;
        }

        $days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
        $currentYear = date('Y');
        $currentMonth = (int)date('m');
        $semester = $currentMonth >= 7 ? 1 : 2; // Semester 1: July-Dec, Semester 2: Jan-June

        $scheduleCount = 0;

        foreach ($classes as $class) {
            $this->command->info("Creating schedules for class: {$class->name}");

            // Get subjects based on class grade
            $classSubjects = $this->getSubjectsForGrade($class->grade, $class->major->code ?? 'RPL');

            $teacherIndex = 0;
            $dayIndex = 0;
            $currentTime = '07:30';

            foreach ($classSubjects as $subjectData) {
                // Assign a teacher (rotate through available teachers)
                $teacher = $teachers[$teacherIndex % $teachers->count()];
                $teacherIndex++;

                // Calculate end time (each class is typically 90 minutes for vocational subjects, 45 for general)
                $duration = $subjectData['duration'] ?? 90;
                $endTime = $this->addMinutes($currentTime, $duration);

                try {
                    Schedule::create([
                        'day' => $days[$dayIndex],
                        'start_time' => $currentTime,
                        'end_time' => $endTime,
                        'title' => $subjectData['name'],
                        'subject_name' => $subjectData['name'],
                        'teacher_id' => $teacher->id,
                        'class_id' => $class->id,
                        'room' => $this->getRoomName($class->major->code ?? 'RPL', $subjectData['code']),
                        'semester' => $semester,
                        'year' => $currentYear,
                    ]);

                    $scheduleCount++;

                    // Move to next time slot
                    $currentTime = $this->addMinutes($endTime, 15); // 15 min break

                    // If time exceeds school hours, move to next day
                    if ($this->timeToMinutes($currentTime) >= $this->timeToMinutes('15:30')) {
                        $dayIndex = ($dayIndex + 1) % count($days);
                        $currentTime = '07:30';
                    }

                } catch (\Exception $e) {
                    $this->command->warn("Failed to create schedule: " . $e->getMessage());
                }
            }
        }

        $this->command->info("✓ Created {$scheduleCount} schedules successfully");
    }

    private function seedSubjects(): void
    {
        $subjects = [
            ['code' => 'PAI', 'name' => 'Pendidikan Agama dan Budi Pekerti'],
            ['code' => 'PPN', 'name' => 'Pendidikan Pancasila'],
            ['code' => 'BIN', 'name' => 'Bahasa Indonesia'],
            ['code' => 'BIG', 'name' => 'Bahasa Inggris'],
            ['code' => 'MTK', 'name' => 'Matematika'],
            ['code' => 'SEJ', 'name' => 'Sejarah'],
            ['code' => 'PJOK', 'name' => 'Pendidikan Jasmani, Olahraga, dan Kesehatan'],
            ['code' => 'SB', 'name' => 'Seni Budaya'],
            ['code' => 'INF', 'name' => 'Informatika'],
            ['code' => 'IPAS', 'name' => 'Projek Ilmu Pengetahuan Alam dan Sosial'],
            ['code' => 'PKK', 'name' => 'Projek Kreatif dan Kewirausahaan'],
            ['code' => 'BK', 'name' => 'Bimbingan Konseling'],
            
            // RPL Subjects
            ['code' => 'PWPB', 'name' => 'Pemrograman Web dan Perangkat Bergerak'],
            ['code' => 'PPB', 'name' => 'Pemrograman Berorientasi Objek'],
            ['code' => 'BD', 'name' => 'Basis Data'],
            ['code' => 'PBO', 'name' => 'Pemrograman Berorientasi Objek'],
            
            // TKJ Subjects
            ['code' => 'TJKT', 'name' => 'Teknik Jaringan Komputer dan Telekomunikasi'],
            ['code' => 'SKJ', 'name' => 'Sistem Komputer dan Jaringan'],
            ['code' => 'ADJ', 'name' => 'Administrasi Infrastruktur Jaringan'],
            
            // DKV Subjects
            ['code' => 'DG', 'name' => 'Desain Grafis'],
            ['code' => 'DGP', 'name' => 'Desain Grafis Percetakan'],
            ['code' => 'DM', 'name' => 'Desain Media Interaktif'],
            
            // AV Subjects
            ['code' => 'TAVT', 'name' => 'Teknik Audio Video Teknologi'],
            ['code' => 'TELAV', 'name' => 'Teknologi Layanan Audio Video'],
            
            // MT Subjects
            ['code' => 'MEKA', 'name' => 'Teknik Mekatronika'],
            ['code' => 'PLC', 'name' => 'Programmable Logic Controller'],
            
            // BC Subjects
            ['code' => 'PROD', 'name' => 'Produksi Broadcasting'],
            ['code' => 'PENY', 'name' => 'Penyiaran'],
            
            // ANIMASI Subjects
            ['code' => 'ANI2D', 'name' => 'Animasi 2D'],
            ['code' => 'ANI3D', 'name' => 'Animasi 3D'],
            
            // EI Subjects
            ['code' => 'ELIN', 'name' => 'Elektronika Industri'],
            ['code' => 'SISEL', 'name' => 'Sistem Elektronika'],
        ];

        foreach ($subjects as $subject) {
            Subject::updateOrCreate(
                ['code' => $subject['code']],
                $subject
            );
        }
    }

    private function getSubjectsForGrade(string $grade, string $majorCode): array
    {
        // Common subjects for all grades
        $commonSubjects = [
            ['code' => 'PAI', 'name' => 'Pendidikan Agama dan Budi Pekerti', 'duration' => 45],
            ['code' => 'PPN', 'name' => 'Pendidikan Pancasila', 'duration' => 45],
            ['code' => 'BIN', 'name' => 'Bahasa Indonesia', 'duration' => 45],
            ['code' => 'BIG', 'name' => 'Bahasa Inggris', 'duration' => 45],
            ['code' => 'MTK', 'name' => 'Matematika', 'duration' => 45],
            ['code' => 'PJOK', 'name' => 'Pendidikan Jasmani, Olahraga, dan Kesehatan', 'duration' => 90],
            ['code' => 'BK', 'name' => 'Bimbingan Konseling', 'duration' => 45],
        ];

        // Major-specific subjects
        $majorSubjects = [
            'RPL' => [
                ['code' => 'PWPB', 'name' => 'Pemrograman Web dan Perangkat Bergerak', 'duration' => 180],
                ['code' => 'PPB', 'name' => 'Pemrograman Berorientasi Objek', 'duration' => 135],
                ['code' => 'BD', 'name' => 'Basis Data', 'duration' => 135],
                ['code' => 'PKK', 'name' => 'Projek Kreatif dan Kewirausahaan', 'duration' => 90],
            ],
            'TKJ' => [
                ['code' => 'TJKT', 'name' => 'Teknik Jaringan Komputer dan Telekomunikasi', 'duration' => 180],
                ['code' => 'SKJ', 'name' => 'Sistem Komputer dan Jaringan', 'duration' => 135],
                ['code' => 'ADJ', 'name' => 'Administrasi Infrastruktur Jaringan', 'duration' => 135],
                ['code' => 'PKK', 'name' => 'Projek Kreatif dan Kewirausahaan', 'duration' => 90],
            ],
            'DKV' => [
                ['code' => 'DG', 'name' => 'Desain Grafis', 'duration' => 180],
                ['code' => 'DGP', 'name' => 'Desain Grafis Percetakan', 'duration' => 135],
                ['code' => 'DM', 'name' => 'Desain Media Interaktif', 'duration' => 135],
                ['code' => 'PKK', 'name' => 'Projek Kreatif dan Kewirausahaan', 'duration' => 90],
            ],
            'AV' => [
                ['code' => 'TAVT', 'name' => 'Teknik Audio Video Teknologi', 'duration' => 180],
                ['code' => 'TELAV', 'name' => 'Teknologi Layanan Audio Video', 'duration' => 135],
                ['code' => 'PKK', 'name' => 'Projek Kreatif dan Kewirausahaan', 'duration' => 90],
            ],
            'MT' => [
                ['code' => 'MEKA', 'name' => 'Teknik Mekatronika', 'duration' => 180],
                ['code' => 'PLC', 'name' => 'Programmable Logic Controller', 'duration' => 135],
                ['code' => 'PKK', 'name' => 'Projek Kreatif dan Kewirausahaan', 'duration' => 90],
            ],
            'BC' => [
                ['code' => 'PROD', 'name' => 'Produksi Broadcasting', 'duration' => 180],
                ['code' => 'PENY', 'name' => 'Penyiaran', 'duration' => 135],
                ['code' => 'PKK', 'name' => 'Projek Kreatif dan Kewirausahaan', 'duration' => 90],
            ],
            'ANIMASI' => [
                ['code' => 'ANI2D', 'name' => 'Animasi 2D', 'duration' => 180],
                ['code' => 'ANI3D', 'name' => 'Animasi 3D', 'duration' => 135],
                ['code' => 'PKK', 'name' => 'Projek Kreatif dan Kewirausahaan', 'duration' => 90],
            ],
            'EI' => [
                ['code' => 'ELIN', 'name' => 'Elektronika Industri', 'duration' => 180],
                ['code' => 'SISEL', 'name' => 'Sistem Elektronika', 'duration' => 135],
                ['code' => 'PKK', 'name' => 'Projek Kreatif dan Kewirausahaan', 'duration' => 90],
            ],
        ];

        $subjects = $commonSubjects;

        // Add major-specific subjects
        if (isset($majorSubjects[$majorCode])) {
            $subjects = array_merge($subjects, $majorSubjects[$majorCode]);
        }

        return $subjects;
    }

    private function getRoomName(string $majorCode, string $subjectCode): string
    {
        // General classrooms
        if (in_array($subjectCode, ['PAI', 'PPN', 'BIN', 'BIG', 'MTK', 'SEJ', 'BK'])) {
            return 'R-' . rand(101, 120);
        }

        // Lab/Workshop based on major
        $labMap = [
            'RPL' => 'Lab RPL',
            'TKJ' => 'Lab TKJ',
            'DKV' => 'Lab DKV',
            'AV' => 'Lab AV',
            'MT' => 'Workshop Mekatronika',
            'BC' => 'Studio Broadcasting',
            'ANIMASI' => 'Lab Animasi',
            'EI' => 'Lab Elektronika',
        ];

        return $labMap[$majorCode] ?? 'Ruang Kelas';
    }

    private function addMinutes(string $time, int $minutes): string
    {
        $timestamp = strtotime($time);
        $newTimestamp = $timestamp + ($minutes * 60);
        return date('H:i', $newTimestamp);
    }

    private function timeToMinutes(string $time): int
    {
        list($hours, $minutes) = explode(':', $time);
        return ($hours * 60) + $minutes;
    }
}
