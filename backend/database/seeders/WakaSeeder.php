<?php

namespace Database\Seeders;

use App\Models\AdminProfile;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class WakaSeeder extends Seeder
{
    public function run(): void
    {
        $wakaName = 'Wiwin Winangsih, S.Pd., M.Pd.';
        $user = User::where('name', $wakaName)->first();

        if (!$user) {
            throw new \Exception("Teacher '$wakaName' not found. Please run TeacherSeeder first.");
        }

        // Update to admin type and set specific username
        $user->update([
            'username' => 'waka1',
            'user_type' => 'admin',
        ]);

        AdminProfile::updateOrCreate(
            ['user_id' => $user->id],
            ['type' => 'waka']
        );
    }
}
