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
                'bidang' => 'Pengembangan Perangkat Lunak dan Gim',
            ],
            [
                'code' => 'TMT',
                'name' => 'Mekatronika',
                'category' => 'Teknik Elektronika',
                'bidang' => ' Teknologi Manufaktur dan Rekayasa',
            ],
            [
                'code' => 'AN',
                'name' => 'Animasi',
                'category' => 'Seni dan Industri Kreatif',
                'bidang' => 'Seni dan Ekonomi Kreatif',
            ],
            [
                'code' => 'BC',
                'name' => 'Broadcasting',
                'category' => 'Seni dan Industri Kreatif',
                'bidang' => ' Seni dan Ekonomi Kreatif',
            ],
            [
                'code' => 'TEI',
                'name' => 'Elektronika Industri',
                'category' => 'Teknik Elektronika',
                'bidang' => 'Teknologi Manufaktur dan Rekayasa',
            ],
            [
                'code' => 'TKJ',
                'name' => 'Teknik Komputer dan Jaringan',
                'category' => 'Teknologi Informasi',
                'bidang' => 'Teknik Tomputer  dan Jaringan',
            ],
            [
                'code' => 'TAV',
                'name' => 'Audio Video',
                'category' => 'Teknik Elektronika',
                'bidang' => 'Teknologi Manufaktur dan Rekayasa',
            ],
            [
                'code' => 'DKV',
                'name' => 'Desain Komunikasi Visual',
                'category' => 'Seni dan Industri Kreatif',
                'bidang' => 'Seni dan Ekonomi Kreatif',
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
