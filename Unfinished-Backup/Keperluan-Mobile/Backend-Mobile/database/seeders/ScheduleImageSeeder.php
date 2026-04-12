<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

class ScheduleImageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Adjust path since exclude folder is one level up from backend
        $sourcePath = base_path('../exclude/JadwalImage/JadwalRpl2.jpg');
        $destinationDir = 'schedules/defaults';
        $destinationFileName = 'default_schedule.jpg';

        if (! File::exists($sourcePath)) {
            $this->command->error("Source image not found at: {$sourcePath}");

            return;
        }

        // Ensure directory exists in public disk
        if (! Storage::disk('public')->exists($destinationDir)) {
            Storage::disk('public')->makeDirectory($destinationDir);
        }

        // Copy file
        $fileContents = File::get($sourcePath);
        Storage::disk('public')->put($destinationDir.'/'.$destinationFileName, $fileContents);

        $this->command->info("Default schedule image copied to storage/app/public/{$destinationDir}/{$destinationFileName}");
    }
}
