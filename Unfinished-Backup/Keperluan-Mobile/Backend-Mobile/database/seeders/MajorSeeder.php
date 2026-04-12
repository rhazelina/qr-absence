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
                'category' => 'Pengembangan Perangkat Lunak dan Gim',
                'bidang' => 'Teknologi Informasi',
                'program_keahlian' => 'Pengembangan Perangkat Lunak dan Gim',
                'bidang_keahlian' => 'Teknologi Informasi',
            ],
            [
                'code' => 'TMT',
                'name' => 'Teknik Mekatronika',
                'category' => 'Teknik Elektronika',
                'bidang' => 'Teknologi Manufaktur dan Rekayasa',
                'program_keahlian' => 'Teknik Elektronika',
                'bidang_keahlian' => 'Teknologi Manufaktur dan Rekayasa',
            ],
            [
                'code' => 'AN',
                'name' => 'Animasi',
                'category' => 'Animasi',
                'bidang' => 'Seni dan Ekonomi Kreatif',
                'program_keahlian' => 'Animasi',
                'bidang_keahlian' => 'Seni dan Ekonomi Kreatif',
            ],
            [
                'code' => 'BC',
                'name' => 'Produksi dan Siaran Program Televisi',
                'category' => 'Broadcasting dan Perfilman',
                'bidang' => 'Seni dan Ekonomi Kreatif',
                'program_keahlian' => 'Broadcasting dan Perfilman',
                'bidang_keahlian' => 'Seni dan Ekonomi Kreatif',
            ],
            [
                'code' => 'TEI',
                'name' => 'Teknik Elektronika Industri',
                'category' => 'Teknik Elektronika',
                'bidang' => 'Teknologi Manufaktur dan Rekayasa',
                'program_keahlian' => 'Teknik Elektronika',
                'bidang_keahlian' => 'Teknologi Manufaktur dan Rekayasa',
            ],
            [
                'code' => 'TKJ',
                'name' => 'Teknik Komputer dan Jaringan',
                'category' => 'Teknik Jaringan Komputer dan Telekomunikasi',
                'bidang' => 'Teknologi Informasi',
                'program_keahlian' => 'Teknik Jaringan Komputer dan Telekomunikasi',
                'bidang_keahlian' => 'Teknologi Informasi',
            ],
            [
                'code' => 'TAV',
                'name' => 'Teknik Audio Video',
                'category' => 'Teknik Elektronika',
                'bidang' => 'Teknologi Manufaktur dan Rekayasa',
                'program_keahlian' => 'Teknik Elektronika',
                'bidang_keahlian' => 'Teknologi Manufaktur dan Rekayasa',
            ],
            [
                'code' => 'DKV',
                'name' => 'Desain Komunikasi Visual',
                'category' => 'Desain Komunikasi Visual',
                'bidang' => 'Seni dan Ekonomi Kreatif',
                'program_keahlian' => 'Desain Komunikasi Visual',
                'bidang_keahlian' => 'Seni dan Ekonomi Kreatif',
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
