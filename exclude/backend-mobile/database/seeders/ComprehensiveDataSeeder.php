<?php

namespace Database\Seeders;

use App\Models\Classes;
use App\Models\Major;
use App\Models\StudentProfile;
use App\Models\TeacherProfile;
use App\Models\User;
use Illuminate\Database\Seeder;

class ComprehensiveDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Create Majors
        $this->seedMajors();
        
        // 2. Create Teachers (for wali kelas)
        $teachers = $this->seedTeachers();
        
        // 3. Create Classes with Wali Kelas
        $classes = $this->seedClasses($teachers);
        
        // 4. Create Students from CSV data
        $this->seedStudents($classes);
    }

    private function seedMajors(): void
    {
        $majors = [
            ['code' => 'DKV', 'name' => 'Desain Komunikasi Visual', 'category' => 'Seni dan Industri Kreatif'],
            ['code' => 'RPL', 'name' => 'Rekayasa Perangkat Lunak', 'category' => 'Teknologi Informasi'],
            ['code' => 'TKJ', 'name' => 'Teknik Komputer dan Jaringan', 'category' => 'Teknologi Informasi'],
            ['code' => 'AV', 'name' => 'Audio Video', 'category' => 'Teknik Elektro'],
            ['code' => 'MT', 'name' => 'Mekatronika', 'category' => 'Teknik Mesin'],
            ['code' => 'BC', 'name' => 'Broadcasting', 'category' => 'Seni dan Industri Kreatif'],
            ['code' => 'ANIMASI', 'name' => 'Animasi', 'category' => 'Seni dan Industri Kreatif'],
            ['code' => 'EI', 'name' => 'Elektronika Industri', 'category' => 'Teknik Elektro'],
        ];

        foreach ($majors as $major) {
            Major::updateOrCreate(
                ['code' => $major['code']],
                $major
            );
        }

        $this->command->info('✓ Majors seeded successfully');
    }

    private function seedTeachers(): array
    {
        $teachersData = [
            ['name' => 'Budi Santoso, S.Pd', 'nip' => '198501012010011001', 'subject' => 'Matematika'],
            ['name' => 'Siti Aminah, S.Kom', 'nip' => '198602022011012001', 'subject' => 'Pemrograman'],
            ['name' => 'Ahmad Fauzi, S.Pd', 'nip' => '198703032012011002', 'subject' => 'Bahasa Indonesia'],
            ['name' => 'Dewi Kartika, S.Sn', 'nip' => '198804042013012002', 'subject' => 'Desain Grafis'],
            ['name' => 'Hendra Wijaya, S.T', 'nip' => '198905052014011003', 'subject' => 'Jaringan Komputer'],
            ['name' => 'Rina Puspita, S.Pd', 'nip' => '199006062015012003', 'subject' => 'Bahasa Inggris'],
            ['name' => 'Arief Rahman, S.Kom', 'nip' => '199107072016011004', 'subject' => 'Basis Data'],
            ['name' => 'Lina Marlina, S.Pd', 'nip' => '199208082017012004', 'subject' => 'Fisika'],
            ['name' => 'Doni Prakoso, S.T', 'nip' => '199309092018011005', 'subject' => 'Elektronika'],
            ['name' => 'Maya Sari, S.Sn', 'nip' => '199410102019012005', 'subject' => 'Multimedia'],
            ['name' => 'Rudi Hartono, S.Pd', 'nip' => '199511112020011006', 'subject' => 'Kimia'],
            ['name' => 'Sri Wahyuni, S.Kom', 'nip' => '199612122021012006', 'subject' => 'Web Programming'],
            ['name' => 'Teguh Prasetyo, S.T', 'nip' => '199701012022011007', 'subject' => 'Mekatronika'],
            ['name' => 'Fitri Handayani, S.Pd', 'nip' => '199802022023012007', 'subject' => 'PKN'],
            ['name' => 'Yudi Setiawan, S.Sn', 'nip' => '199903032024011008', 'subject' => 'Broadcasting'],
            ['name' => 'Nur Azizah, S.Kom', 'nip' => '200004042025012008', 'subject' => 'Mobile Programming'],
            ['name' => 'Bambang Susilo, S.Pd', 'nip' => '198512052010011009', 'subject' => 'Sejarah'],
            ['name' => 'Indah Permata, S.T', 'nip' => '198613062011012009', 'subject' => 'Teknik Audio'],
        ];

        $teachers = [];
        foreach ($teachersData as $index => $teacherData) {
            $username = 'guru' . ($index + 1);
            
            $user = User::updateOrCreate(
                ['username' => $username],
                [
                    'name' => $teacherData['name'],
                    'email' => $username . '@smk.sch.id',
                    'password' => 'guru123', // Auto-hashed by User model cast
                    'user_type' => 'teacher',
                    'active' => true,
                ]
            );

            $teacher = TeacherProfile::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'nip' => $teacherData['nip'],
                    'subject' => $teacherData['subject'],
                ]
            );

            $teachers[] = $teacher;
        }

        $this->command->info('✓ Teachers seeded successfully');
        return $teachers;
    }

    private function seedClasses(array $teachers): array
    {
        $majors = Major::all()->keyBy('code');
        $grades = ['X', 'XI', 'XII'];
        $classes = [];
        $teacherIndex = 0;

        foreach ($majors as $majorCode => $major) {
            foreach ($grades as $grade) {
                // Create 2 classes per major per grade (e.g., X RPL 1, X RPL 2)
                for ($i = 1; $i <= 2; $i++) {
                    $class = Classes::updateOrCreate(
                        [
                            'grade' => $grade,
                            'label' => $majorCode . ' ' . $i,
                        ],
                        [
                            'major_id' => $major->id,
                        ]
                    );

                    // Assign wali kelas (homeroom teacher)
                    if (isset($teachers[$teacherIndex])) {
                        $teachers[$teacherIndex]->update([
                            'homeroom_class_id' => $class->id,
                        ]);
                        $teacherIndex++;
                    }

                    $classes["{$grade} {$majorCode} {$i}"] = $class;
                }
            }
        }

        $this->command->info('✓ Classes with wali kelas seeded successfully');
        return $classes;
    }

    private function seedStudents(array $classes): void
    {
        // Data siswa dari CSV RPL kelas XI
        $studentsData = [
            ['name' => 'ABRORY AKBAR AL BATAMI', 'nisn' => '3078207819', 'class' => 'XI RPL 1', 'gender' => 'L'],
            ['name' => 'AFIF FIRMANSYAH', 'nisn' => '0086659776', 'class' => 'XI RPL 1', 'gender' => 'L'],
            ['name' => 'AGIES WIDYAWATI', 'nisn' => '0087441890', 'class' => 'XI RPL 1', 'gender' => 'P'],
            ['name' => 'AGIL RIFATUL HAQ', 'nisn' => '0071026334', 'class' => 'XI RPL 1', 'gender' => 'L'],
            ['name' => 'AKH. SEPTIAN FIO RAMADHAN', 'nisn' => '0078492418', 'class' => 'XI RPL 1', 'gender' => 'L'],
            ['name' => 'Alya Fitri Larasati', 'nisn' => '0077521428', 'class' => 'XI RPL 1', 'gender' => 'P'],
            ['name' => 'ANASTASYA DYAH AYU PROBONINGRUM', 'nisn' => '0084302867', 'class' => 'XI RPL 1', 'gender' => 'P'],
            ['name' => 'ANISA PUSPITASARI', 'nisn' => '0079564039', 'class' => 'XI RPL 1', 'gender' => 'P'],
            ['name' => 'Anissa Prissilvia Tahara', 'nisn' => '0087599872', 'class' => 'XI RPL 1', 'gender' => 'P'],
            ['name' => 'AQILLA MAULIDDYAH', 'nisn' => '0084701495', 'class' => 'XI RPL 1', 'gender' => 'P'],
            ['name' => 'AQILNA FAILLA LILFARA AIZANI', 'nisn' => '0079518058', 'class' => 'XI RPL 1', 'gender' => 'P'],
            ['name' => 'Aristia Faren Rafaela', 'nisn' => '0076823738', 'class' => 'XI RPL 1', 'gender' => 'P'],
            ['name' => 'ASYHARIL KAHFI DEWANDA', 'nisn' => '0088840490', 'class' => 'XI RPL 1', 'gender' => 'L'],
            ['name' => 'Athaar Putra Ruhenda', 'nisn' => '0086920055', 'class' => 'XI RPL 1', 'gender' => 'L'],
            ['name' => 'AVRILIANA ANJANI', 'nisn' => '0088032174', 'class' => 'XI RPL 1', 'gender' => 'P'],
            ['name' => 'AZHAR ANISATUL JANNAH', 'nisn' => '0089732684', 'class' => 'XI RPL 1', 'gender' => 'P'],
            ['name' => 'BINTANG FIRMAN ARDANA', 'nisn' => '0086246127', 'class' => 'XI RPL 1', 'gender' => 'L'],
            ['name' => 'CALLISTA SHAFA RAMADHANI', 'nisn' => '3079461424', 'class' => 'XI RPL 1', 'gender' => 'P'],
            ['name' => 'CHEVY APRILIA HUTABARAT', 'nisn' => '0077372447', 'class' => 'XI RPL 1', 'gender' => 'P'],
            ['name' => 'CINDI TRI PRASETYO', 'nisn' => '0073851099', 'class' => 'XI RPL 1', 'gender' => 'P'],
            ['name' => 'CINTYA KARINA PUTRI', 'nisn' => '0082111423', 'class' => 'XI RPL 1', 'gender' => 'P'],
            ['name' => 'DHIA MIRZA HANDHIONO', 'nisn' => '0078343685', 'class' => 'XI RPL 1', 'gender' => 'L'],
            ['name' => 'DIANDHIKA DWI PRANATA', 'nisn' => '0081555900', 'class' => 'XI RPL 1', 'gender' => 'L'],
            ['name' => 'FAIRUZ QUDS ZAHRAN FIRDAUS', 'nisn' => '0081936855', 'class' => 'XI RPL 1', 'gender' => 'L'],
            ['name' => 'FARDAN RASYAH ISLAMI', 'nisn' => '0079300540', 'class' => 'XI RPL 1', 'gender' => 'L'],
            ['name' => 'FATCHUR ROHMAN ROFIAN', 'nisn' => '0088713839', 'class' => 'XI RPL 1', 'gender' => 'L'],
            ['name' => 'FIDATUL AVIVA', 'nisn' => '0087853322', 'class' => 'XI RPL 1', 'gender' => 'P'],
            ['name' => 'FIRLI ZULFA AZZAHRA', 'nisn' => '0088560011', 'class' => 'XI RPL 1', 'gender' => 'P'],
            ['name' => 'HAPSARI ISMARTOYO', 'nisn' => '0062756939', 'class' => 'XI RPL 1', 'gender' => 'P'],
            ['name' => 'HAVID ABDILAH SURAHMAD', 'nisn' => '0087538918', 'class' => 'XI RPL 1', 'gender' => 'L'],
            ['name' => 'IGNACIA ZANDRA', 'nisn' => '0072226999', 'class' => 'XI RPL 1', 'gender' => 'P'],
            ['name' => 'IQBAL LAZUARDI', 'nisn' => '0074853632', 'class' => 'XI RPL 1', 'gender' => 'L'],
            ['name' => 'IQLIMAHDA TANZILLA FINAN DIVA', 'nisn' => '0089462835', 'class' => 'XI RPL 1', 'gender' => 'P'],
            ['name' => 'IRDINA MARSYA MAZARINA', 'nisn' => '0077181841', 'class' => 'XI RPL 1', 'gender' => 'P'],
            ['name' => 'ISABEL CAHAYA HATI', 'nisn' => '0086237279', 'class' => 'XI RPL 1', 'gender' => 'P'],
            ['name' => 'KHOIRUN NI\'MAH NURUL HIDAYAH', 'nisn' => '0074316703', 'class' => 'XI RPL 1', 'gender' => 'P'],
            ['name' => 'LAURA LAVIDA LOCA', 'nisn' => '0074182519', 'class' => 'XI RPL 2', 'gender' => 'P'],
            ['name' => 'LELY SAGITA', 'nisn' => '0074320819', 'class' => 'XI RPL 2', 'gender' => 'P'],
            ['name' => 'MAYA MELINDA WIJAYANTI', 'nisn' => '0078658367', 'class' => 'XI RPL 2', 'gender' => 'P'],
            ['name' => 'MOCH. ABYL GUSTIAN', 'nisn' => '0079292238', 'class' => 'XI RPL 2', 'gender' => 'L'],
            ['name' => 'MUHAMMAD AMINULLAH', 'nisn' => '0084421457', 'class' => 'XI RPL 2', 'gender' => 'L'],
            ['name' => 'Muhammad Azka Fadli Atthaya', 'nisn' => '0089104721', 'class' => 'XI RPL 2', 'gender' => 'L'],
            ['name' => 'MUHAMMAD HADI FIRMANSYAH', 'nisn' => '0087917739', 'class' => 'XI RPL 2', 'gender' => 'L'],
            ['name' => 'MUHAMMAD HARRIS MAULANA SAPUTRA', 'nisn' => '0074704843', 'class' => 'XI RPL 2', 'gender' => 'L'],
            ['name' => 'MUHAMMAD IBNU RAFFI AHDAN', 'nisn' => '0077192596', 'class' => 'XI RPL 2', 'gender' => 'L'],
            ['name' => 'MUHAMMAD REYHAN ATHADIANSYAH', 'nisn' => '0075024492', 'class' => 'XI RPL 2', 'gender' => 'L'],
            ['name' => 'MUHAMMAD WISNU DEWANDARU', 'nisn' => '0141951182', 'class' => 'XI RPL 2', 'gender' => 'L'],
            ['name' => 'NABILA RAMADHAN', 'nisn' => '0072504970', 'class' => 'XI RPL 2', 'gender' => 'P'],
            ['name' => 'NADIA SINTA DEVI OKTAVIA', 'nisn' => '0061631562', 'class' => 'XI RPL 2', 'gender' => 'P'],
            ['name' => 'NADJWA KIRANA FIRDAUS', 'nisn' => '0081112175', 'class' => 'XI RPL 2', 'gender' => 'P'],
            ['name' => 'NINDI NARITA MAULIDYA', 'nisn' => '0089965810', 'class' => 'XI RPL 2', 'gender' => 'P'],
            ['name' => 'NISWATUL KHOIRIYAH', 'nisn' => '0085834363', 'class' => 'XI RPL 2', 'gender' => 'P'],
            ['name' => 'NOVERITA PASCALIA RAHMA', 'nisn' => '0087884391', 'class' => 'XI RPL 2', 'gender' => 'P'],
            ['name' => 'NOVITA ANDRIANI', 'nisn' => '0078285764', 'class' => 'XI RPL 2', 'gender' => 'P'],
            ['name' => 'NOVITA AZZAHRA', 'nisn' => '0078980482', 'class' => 'XI RPL 2', 'gender' => 'P'],
            ['name' => 'NURUL KHASANAH', 'nisn' => '0078036100', 'class' => 'XI RPL 2', 'gender' => 'P'],
            ['name' => 'RACHEL ALUNA MEIZHA', 'nisn' => '0081838771', 'class' => 'XI RPL 2', 'gender' => 'P'],
            ['name' => 'RAENA WESTI DHEANOFA HERLIANI', 'nisn' => '0079312790', 'class' => 'XI RPL 2', 'gender' => 'P'],
            ['name' => 'RAYHANUN', 'nisn' => '0084924963', 'class' => 'XI RPL 2', 'gender' => 'P'],
            ['name' => 'RAYYAN DAFFA AL AFFANI', 'nisn' => '0077652198', 'class' => 'XI RPL 2', 'gender' => 'L'],
            ['name' => 'RHAMEYZHA ALEA CHALILA PUTRI EDWARD', 'nisn' => '0087959211', 'class' => 'XI RPL 2', 'gender' => 'P'],
            ['name' => 'RHEISYA MAULIDDIVA PUTRI', 'nisn' => '0089530132', 'class' => 'XI RPL 2', 'gender' => 'P'],
            ['name' => 'RHEYVAN RAMADHAN I.P', 'nisn' => '0089479412', 'class' => 'XI RPL 2', 'gender' => 'L'],
            ['name' => 'RISKY RAMADHANI', 'nisn' => '0073540571', 'class' => 'XI RPL 2', 'gender' => 'P'],
            ['name' => 'RITA AURA AGUSTINA', 'nisn' => '0076610748', 'class' => 'XI RPL 2', 'gender' => 'P'],
            ['name' => 'RIZKY RAMADHANI', 'nisn' => '0077493253', 'class' => 'XI RPL 2', 'gender' => 'L'],
            ['name' => 'SA\'IDHATUL HASANA', 'nisn' => '0076376703', 'class' => 'XI RPL 2', 'gender' => 'P'],
            ['name' => 'SHISILIA ISMU PUTRI', 'nisn' => '0072620559', 'class' => 'XI RPL 2', 'gender' => 'P'],
            ['name' => 'SUCI RAMADANI INDRIANSYAH', 'nisn' => '0072336597', 'class' => 'XI RPL 2', 'gender' => 'P'],
            ['name' => 'TALITHA NUDIA RISMATULLAH', 'nisn' => '0075802873', 'class' => 'XI RPL 2', 'gender' => 'P'],
        ];

        // Add sample students for other classes
        $additionalStudents = $this->generateAdditionalStudents();
        $studentsData = array_merge($studentsData, $additionalStudents);

        $nisCounter = 202400001;
        foreach ($studentsData as $index => $studentData) {
            // Create username from name
            $username = strtolower(str_replace([' ', '.', '\''], '', explode(',', $studentData['name'])[0]));
            $username = substr($username, 0, 20) . ($index + 1);
            
            // Find the class
            $class = $classes[$studentData['class']] ?? null;
            if (!$class) {
                $this->command->warn("Class {$studentData['class']} not found for student {$studentData['name']}");
                continue;
            }

            $user = User::updateOrCreate(
                ['username' => $username],
                [
                    'name' => $studentData['name'],
                    'email' => $username . '@student.smk.sch.id',
                    'password' => 'siswa123', // Auto-hashed by User model cast
                    'user_type' => 'student',
                    'active' => true,
                ]
            );

            StudentProfile::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'nisn' => $studentData['nisn'],
                    'nis' => str_pad($nisCounter++, 9, '0', STR_PAD_LEFT),
                    'gender' => $studentData['gender'],
                    'address' => 'Jl. Pendidikan No. ' . ($index + 1) . ', Surabaya',
                    'class_id' => $class->id,
                    'parent_phone' => '08' . str_pad(rand(1000000000, 9999999999), 10, '0', STR_PAD_LEFT),
                ]
            );
        }

        $this->command->info('✓ Students seeded successfully');
    }

    private function generateAdditionalStudents(): array
    {
        $students = [];
        $majors = ['DKV', 'TKJ', 'AV', 'MT', 'BC', 'ANIMASI', 'EI'];
        $grades = ['X', 'XI', 'XII'];
        $maleNames = ['Adi Nugroho', 'Bayu Pratama', 'Cahya Wijaya', 'Dimas Saputra', 'Eko Prabowo'];
        $femaleNames = ['Ayu Lestari', 'Bella Sari', 'Citra Dewi', 'Dina Permata', 'Elsa Putri'];
        
        $nisnCounter = 100000000;

        foreach ($majors as $major) {
            foreach ($grades as $grade) {
                for ($classNum = 1; $classNum <= 2; $classNum++) {
                    // Add 5 students per class
                    for ($i = 0; $i < 5; $i++) {
                        $gender = $i % 2 == 0 ? 'L' : 'P';
                        $names = $gender == 'L' ? $maleNames : $femaleNames;
                        $name = $names[array_rand($names)] . ' ' . $major . ' ' . $i;
                        
                        $students[] = [
                            'name' => $name,
                            'nisn' => str_pad($nisnCounter++, 10, '0', STR_PAD_LEFT),
                            'class' => "$grade $major $classNum",
                            'gender' => $gender,
                        ];
                    }
                }
            }
        }

        return $students;
    }
}
