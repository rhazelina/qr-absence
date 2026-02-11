<?php

namespace Database\Seeders;

use App\Models\Subject;
use Illuminate\Database\Seeder;

class SubjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $subjects = [
            ['code' => 'PAI', 'name' => 'Pendidikan Agama dan Budi Pekerti'],
            ['code' => 'PPN', 'name' => 'Pendidikan Pancasila'],
            ['code' => 'BIN', 'name' => 'Bahasa Indonesia'],
            ['code' => 'BIG', 'name' => 'Bahasa Inggris'],
            ['code' => 'MTK', 'name' => 'Matematika'],
            ['code' => 'SEJ', 'name' => 'Sejarah'],
            ['code' => 'OR', 'name' => 'Pendidikan Jasmani, Olahraga, dan Kesehatan'],
            ['code' => 'SB', 'name' => 'Seni Budaya'],
            ['code' => 'INF', 'name' => 'Informatika'],
            ['code' => 'IPAS', 'name' => 'Projek Ilmu Pengetahuan Alam dan Sosial'],
            ['code' => 'DK', 'name' => 'Dasar-dasar Keahlian'],
            ['code' => 'KK', 'name' => 'Konsentrasi Keahlian'],
            ['code' => 'PKK', 'name' => 'Projek Kreatif dan Kewirausahaan'],
            ['code' => 'LB', 'name' => 'Muatan Lokal / Bahasa Daerah'],
            ['code' => 'BK', 'name' => 'Bimbingan Konseling'],
        ];

        foreach ($subjects as $subject) {
            Subject::updateOrCreate(
                ['code' => $subject['code']],
                $subject
            );
        }
    }
}
