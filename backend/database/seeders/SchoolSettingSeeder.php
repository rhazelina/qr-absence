<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class SchoolSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            'school_name' => 'SMKN 2 SINGOSARI',
            'school_npsn' => '20517748',
            'school_type' => 'SMK',
            'school_accreditation' => 'A',
            'school_headmaster' => 'SUMIJAH, S.Pd., M.Si',
            'school_headmaster_nip' => '97002101998022009',
            'school_address' => 'Jl. Perusahaan No.20',
            'village' => 'Tunjungtirto',
            'district' => 'Singosari',
            'city' => 'Kab. Malang',
            'province' => 'Jawa Timur',
            'postal_code' => '65154',
            'school_phone' => '(0341) 458823',
            'school_email' => 'smkn2.singosari@yahoo.co.id',
        ];

        foreach ($settings as $key => $value) {
            \App\Models\Setting::updateOrCreate(
                ['key' => $key],
                ['value' => $value, 'type' => 'string', 'group' => 'school_profile']
            );
        }
    }
}
