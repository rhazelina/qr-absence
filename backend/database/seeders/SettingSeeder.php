<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            [
                'key' => 'school_start_time',
                'value' => '07:00:00',
                'type' => 'string',
                'group' => 'general',
                'description' => 'Jam masuk sekolah',
            ],
            [
                'key' => 'school_end_time',
                'value' => '15:00:00',
                'type' => 'string',
                'group' => 'general',
                'description' => 'Jam pulang sekolah',
            ],
            [
                'key' => 'school_name',
                'value' => 'SMK NEGERI 2 SINGOSARI',
                'type' => 'string',
                'group' => 'general',
                'description' => 'Nama sekolah',
            ],
            // GRACE PERIOD INI BUAT ABSENSI 15 MENIT AWAL
            [
                'key' => 'grace_period',
                'value' => '15',
                'type' => 'integer',
                'group' => 'attendance',
                'description' => 'Grace period for attendance in minutes',
            ],
        ];

        foreach ($settings as $setting) {
            \App\Models\Setting::updateOrCreate(['key' => $setting['key']], $setting);
        }
    }
}
