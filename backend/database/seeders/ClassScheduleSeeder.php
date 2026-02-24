<?php

namespace Database\Seeders;

use App\Models\Classes;
use App\Models\ClassSchedule;
use App\Models\DailySchedule;
use App\Models\ScheduleItem;
use App\Models\Subject;
use App\Models\TeacherProfile;
use App\Models\User;
use Illuminate\Database\Seeder;

class ClassScheduleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $className = 'XII RPL 2';
        $class = Classes::where('grade', '12')
            ->where('label', 'like', '%RPL 2%') // Match "XII RPL 2" or "12 RPL 2"
            ->first();

        // Fallback checks if precise name match fails but we found something similar
        if (! $class) {
            // Try strict check on name attribute if possible, but safe to fail here
            // Accessor might be tricky in query, so rely on raw columns
            $class = Classes::all()->first(function ($c) use ($className) {
                return $c->name === $className;
            });
        }

        if (! $class) {
            throw new \Exception("Class '$className' not found in database.");
        }

        $this->command->info("Found Class: {$class->name} (ID: {$class->id})");

        // Deactivate other active schedules for this class to ensure only one is active?
        // Request says "Set ClassSchedule.is_active = true".
        // It doesn't explicitly say to deactivate others but it implies this should be THE active one.
        ClassSchedule::where('class_id', $class->id)->update(['is_active' => false]);

        $scheduleHeader = ClassSchedule::create([
            'class_id' => $class->id,
            'semester' => 2, // Assuming Semester 2 based on current date (Feb), or make it generic/current
            'year' => '2025/2026', // Adjust if needed, usually just a string or int year
            'is_active' => true,
        ]);

        $scheduleData = [
            'Monday' => [
                ['07:00', '08:20', 'PKN', 'Samaodin, SAP'],
                ['08:20', '09:40', 'B. Inggris', 'Fajar Ningtyas, S.Pd'],
                ['10:00', '11:20', 'MPP', 'Aang Noeraries Wahyudipasa, S.Si'],
                ['12:00', '15:00', 'MPKK', 'RR. Henning Gratyannis Anggraeni, S.Pd'],
            ],
            'Tuesday' => [
                ['07:00', '09:00', 'MPKK', 'Zulkifli Abdillah, S.Kom'],
                ['09:00', '11:20', 'MTK', 'Wiwin Winangsih, S.Pd'],
                ['12:00', '14:20', 'PAI', null],
            ],
            'Wednesday' => [
                ['07:00', '08:20', 'B. Jawa', 'Moch. Bachrudin, S.Pd'],
                ['08:20', '09:40', 'B. Inggris', 'Fajar Ningtyas, S.Pd'],
                ['10:00', '15:00', 'MPKK', 'Triana Ardiane S.pd'],
            ],
            'Thursday' => [
                ['07:00', '08:20', 'MPP', 'Evi Intiyah, S.Pd'],
                ['08:20', '10:40', 'PKDK', 'Adhi Bagus Permana, S.Pd'],
                ['10:40', '11:20', 'BK', 'Roudhotul Husna Yanti, S.Psi'],
                ['12:00', '14:20', 'MPKK', 'Zulkifli Abdillah, S.Kom'],
            ],
            'Friday' => [
                ['08:20', '10:40', 'MPKK', 'RR. Henning Gratyannis Anggraeni, S.Pd'],
                ['10:40', '13:00', 'BI', 'Devi Arvini, S.Pd., Gr'],
                ['13:00', '14:20', 'MPKK', 'Triana Ardiane S.pd'],
            ],
        ];

        foreach ($scheduleData as $day => $items) {
            $this->command->info("Processing $day...");

            $dailySchedule = DailySchedule::create([
                'class_schedule_id' => $scheduleHeader->id,
                'day' => $day,
            ]);

            foreach ($items as $item) {
                [$start, $end, $subjectName, $teacherName] = $item;

                // 1. Resolve Subject
                $subject = $this->resolveSubject($subjectName);

                // 2. Resolve Teacher
                // For PAI on Tuesday, teacherName is null in my array but user said "gunakan teacher sesuai database jika ada"
                // Usually PAI teacher is singular per school or we can try to find one.
                if ($subjectName === 'PAI' && $teacherName === null) {
                    $teacher = $this->findTeacherBySubject('PAI') ?? $this->findTeacherBySubject('Pendidikan Agama') ?? $this->findTeacherBySubject('Agama');
                    if (! $teacher) {
                        throw new \Exception("Teacher for '$subjectName' not found (auto-resolution failed).");
                    }
                } else {
                    $teacher = $this->resolveTeacher($teacherName);
                }

                // 3. Validation: Overlap
                // Check if this time range overlaps with any existing item in this daily schedule
                $overlap = $dailySchedule->scheduleItems()
                    ->where(function ($query) use ($start, $end) {
                        $query->where(function ($q) use ($start, $end) {
                            $q->where('start_time', '>=', $start)
                                ->where('start_time', '<', $end);
                        })->orWhere(function ($q) use ($start, $end) {
                            $q->where('end_time', '>', $start)
                                ->where('end_time', '<=', $end);
                        });
                    })->exists();

                if ($overlap) {
                    throw new \Exception("Overlap detected on $day for $start - $end ($subjectName)");
                }

                ScheduleItem::create([
                    'daily_schedule_id' => $dailySchedule->id,
                    'subject_id' => $subject->id,
                    'teacher_id' => $teacher->id,
                    'start_time' => $start,
                    'end_time' => $end,
                    'room' => 'R. '.$class->grade, // Default room
                    'keterangan' => $subject->name,
                ]);
            }
        }

        $this->command->info("Schedule for $className created successfully.");
    }

    private function resolveSubject(string $name): Subject
    {
        // 1. Exact Match (Name or Code) - Case Insensitive
        $subject = Subject::whereRaw('LOWER(name) = ?', [strtolower($name)])
            ->orWhereRaw('LOWER(code) = ?', [strtolower($name)])
            ->first();
        if ($subject) {
            return $subject;
        }

        // 2. Mappings
        $map = [
            'B. Inggris' => 'Bahasa Inggris',
            'BI' => 'Bahasa Indonesia',
            'B. Jawa' => 'Muatan Lokal / Bahasa Daerah',
            'MTK' => 'Matematika',
            'PKN' => 'Pendidikan Pancasila dan Kewarganegaraan',
            'PAI' => 'Pendidikan Agama dan Budi Pekerti',
            'MPP' => 'Projek Penguatan Profil Pelajar Pancasila',
            'PKDK' => 'Projek Penguatan Profil Pelajar Pancasila',
        ];

        if (isset($map[$name])) {
            $mappedName = $map[$name];
            $subject = Subject::where('name', 'like', "%$mappedName%")->first();
            if ($subject) {
                return $subject;
            }
        }

        // 3. Partial Match
        $subject = Subject::where('name', 'like', "%$name%")->first();
        if ($subject) {
            return $subject;
        }

        throw new \Exception("Subject '$name' matches no record in database.");
    }

    private function resolveTeacher(string $name): TeacherProfile
    {
        // 1. Direct User Search - Case Insensitive
        $user = User::whereRaw('LOWER(name) = ?', [strtolower($name)])->first();

        // 2. Mappings / Fuzzy
        if (! $user) {
            $map = [
                'Evi Irniyah, S.Pd' => 'Ewit Irniyah, S.Pd',
                'Roudhotul Husna Yanti, S.Psi' => 'Roudhatul Husna Yanif, S.Psi',
                'Devi Arvini, S.Pd., Gr' => 'Devi Arveni, S.Pd, Gr',
                'Alfah Diantobes Aindra, S.Pd' => 'Alifah Diantebes Aindra, S.Pd',
            ];

            if (isset($map[$name])) {
                $mapped = $map[$name];
                $user = User::whereRaw('LOWER(name) = ?', [strtolower($mapped)])->first();
            }
        }

        // 3. Simple Partial Match (The whole name)
        if (! $user) {
            $user = User::where('name', 'like', "%$name%")->first();
        }

        // 4. Last Ditch Partial Search (Parts)
        if (! $user) {
            $parts = explode(' ', $name);
            foreach ($parts as $part) {
                // Remove punctuation
                $cleanPart = preg_replace('/[^a-zA-Z0-9]/', '', $part);
                if (strlen($cleanPart) > 3) {
                    $user = User::where('name', 'like', "%$cleanPart%")->first();
                    if ($user) {
                        break;
                    }
                }
            }
        }

        if (! $user) {
            throw new \Exception("Teacher '$name' not found in Users table.");
        }

        $teacher = TeacherProfile::where('user_id', $user->id)->first();

        if (! $teacher) {
            throw new \Exception("TeacherProfile not found for User '{$user->name}'.");
        }

        return $teacher;
    }

    private function findTeacherBySubject(string $subjectFragment): ?TeacherProfile
    {
        // Try to find a teacher who has this subject in their profile
        // Note: TeacherProfile has 'subject' string column based on TeacherSeeder
        return TeacherProfile::where('subject', 'like', "%$subjectFragment%")->first();
    }
}
