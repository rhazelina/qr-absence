<?php

namespace Database\Seeders;

use App\Models\Major;
use Illuminate\Database\Seeder;

class MajorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $majors = [
            [
                'code' => 'DKV',
                'name' => 'Desain Komunikasi Visual',
                'category' => 'Seni dan Industri Kreatif',
                'bidang_keahlian' => 'Seni dan Ekonomi Kreatif',
                'program_keahlian' => 'Seni dan Industri Kreatif',
            ],
            [
                'code' => 'AV',
                'name' => 'Audio Video',
                'category' => 'Teknik Elektronika',
                'bidang_keahlian' => 'Teknologi Manufaktur dan Rekayasa',
                'program_keahlian' => 'Teknik Elektro',
            ],
            [
                'code' => 'TKJ',
                'name' => 'Teknik Komputer dan Jaringan',
                'category' => 'Teknologi Informasi',
                'bidang_keahlian' => 'Teknik Komputer dan Jaringan',
                'program_keahlian' => 'Teknologi Informasi',
            ],
            [
                'code' => 'TEI',
                'name' => 'Elektronika Industri',
                'category' => 'Teknik Elektronika',
                'bidang_keahlian' => 'Teknologi Manufaktur dan Rekayasa',
                'program_keahlian' => 'Teknik Elektro',
            ],
            [
                'code' => 'BC',
                'name' => 'Broadcasting',
                'category' => 'Seni dan Industri Kreatif',
                'bidang_keahlian' => 'Seni dan Ekonomi Kreatif',
                'program_keahlian' => 'Seni dan Industri Kreatif',
            ],
            [
                'code' => 'ANM',
                'name' => 'Animasi',
                'category' => 'Seni dan Industri Kreatif',
                'bidang_keahlian' => 'Seni dan Ekonomi Kreatif',
                'program_keahlian' => 'Seni dan Industri Kreatif',
            ],
            [
                'code' => 'MT',
                'name' => 'Mekatronika',
                'category' => 'Teknik Elektronika',
                'bidang_keahlian' => 'Teknologi Manufaktur dan Rekayasa',
                'program_keahlian' => 'Teknik Mekatronika',
            ],
            [
                'code' => 'RPL',
                'name' => 'Rekayasa Perangkat Lunak',
                'category' => 'Teknologi Informasi',
                'bidang_keahlian' => 'Pengembangan Perangkat Lunak dan Gim',
                'program_keahlian' => 'Teknologi Informasi',
            ],
        ];

        foreach ($majors as $major) {
            Major::updateOrCreate(
                ['code' => $major['code']],
                $major
            );
        }
    }
}
