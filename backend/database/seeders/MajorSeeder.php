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
                'code' => 'RPL',
                'name' => 'Rekayasa Perangkat Lunak',
                'category' => 'Teknologi Informasi',
                'program_keahlian' => 'Pengembangan Perangkat Lunak dan Gim',
                'bidang_keahlian' => 'Teknologi Informasi',
            ],
            [
                'code' => 'DKV',
                'name' => 'Desain Komunikasi Visual',
                'category' => 'Seni dan Ekonomi Kreatif',
                'program_keahlian' => 'Desain Komunikasi Visual',
                'bidang_keahlian' => 'Seni dan Ekonomi Kreatif',
            ],
            [
                'code' => 'TKJ',
                'name' => 'Teknik Komputer dan Jaringan',
                'category' => 'Teknologi Informasi',
                'program_keahlian' => 'Teknik Jaringan Komputer dan Telekomunikasi',
                'bidang_keahlian' => 'Teknologi Informasi',
            ],
            [
                'code' => 'TEI',
                'name' => 'Elektronika Industri',
                'category' => 'Teknik Elektronika',
                'program_keahlian' => 'Teknik Elektronika',
                'bidang_keahlian' => 'Teknologi Manufaktur dan Rekayasa',
            ],
            [
                'code' => 'TMT',
                'name' => 'Mekatronika',
                'category' => 'Teknik Elektronika',
                'program_keahlian' => 'Teknik Elektronika',
                'bidang_keahlian' => 'Teknologi Manufaktur dan Rekayasa',
            ],
            [
                'code' => 'AN',
                'name' => 'Animasi',
                'category' => 'Seni dan Ekonomi Kreatif',
                'program_keahlian' => 'Animasi',
                'bidang_keahlian' => 'Seni dan Ekonomi Kreatif',
            ],
            [
                'code' => 'BC',
                'name' => 'Broadcasting',
                'category' => 'Seni dan Ekonomi Kreatif',
                'program_keahlian' => 'Broadcasting dan Perfilman',
                'bidang_keahlian' => 'Seni dan Ekonomi Kreatif',
            ],
            [
                'code' => 'TAV',
                'name' => 'Teknik Audio Video',
                'category' => 'Teknik Elektronika',
                'program_keahlian' => 'Teknik Elektronika',
                'bidang_keahlian' => 'Teknologi Manufaktur dan Rekayasa',
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
