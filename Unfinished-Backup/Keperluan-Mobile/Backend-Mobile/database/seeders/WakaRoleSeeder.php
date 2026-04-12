<?php

namespace Database\Seeders;

use App\Models\AdminProfile;
use App\Models\TeacherProfile;
use App\Models\User;
use Illuminate\Database\Seeder;

class WakaRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Cari user Pak Zul (Zulkifli)
        $pakZul = User::where('name', 'like', '%Zulkifli%')->first();

        if ($pakZul) {
            // Update Pak Zul sebagai Waka Kesiswaan
            $pakZul->update(['user_type' => 'admin']);

            if ($pakZul->teacherProfile) {
                $pakZul->teacherProfile->update([
                    'jabatan' => ['Waka Kesiswaan'],
                ]);
            }

            AdminProfile::updateOrCreate(
                ['user_id' => $pakZul->id],
                ['type' => 'waka']
            );

            $this->command->info("Pak Zul ({$pakZul->name}) berhasil ditetapkan sebagai Waka Kesiswaan.");
        } else {
            $this->command->error('User Pak Zul tidak ditemukan.');
        }

        // 2. Siapkan array sisa role Waka
        $remainingRoles = [
            'Waka Humas',
            'Waka Kurikulum',
            'Waka Sarpras',
        ];

        // 3. Ambil 3 user acak yang jabatannya saat ini adalah 'Guru' dan BUKAN Pak Zul
        $randomTeachers = User::whereHas('teacherProfile', function ($query) {
            $query->where('jabatan', 'like', '%Guru%');
        })
            ->where('id', '!=', $pakZul?->id ?? 0)
            ->inRandomOrder()
            ->take(count($remainingRoles))
            ->get();

        if ($randomTeachers->count() < count($remainingRoles)) {
            $this->command->warn('Jumlah guru tidak mencukupi untuk mengisi semua sisa role Waka.');
        }

        // 4. Looping untuk assign sisa role Waka
        foreach ($randomTeachers as $index => $teacher) {
            $role = $remainingRoles[$index];

            // Update user_type menjadi admin
            $teacher->update(['user_type' => 'admin']);

            // Update TeacherProfile jabatan
            if ($teacher->teacherProfile) {
                // Pastikan jabatan disimpan sebagai array karena model TeacherProfile menggunakan cast array
                $teacher->teacherProfile->update([
                    'jabatan' => [$role],
                ]);
            }

            // Update/Create AdminProfile dengan type 'waka'
            AdminProfile::updateOrCreate(
                ['user_id' => $teacher->id],
                ['type' => 'waka']
            );

            $this->command->info("Guru '{$teacher->name}' berhasil ditetapkan sebagai {$role}.");
        }
    }
}
