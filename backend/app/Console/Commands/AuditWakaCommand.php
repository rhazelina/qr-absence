<?php

namespace App\Console\Commands;

use App\Models\AdminProfile;
use App\Models\User;
use Illuminate\Console\Command;

class AuditWakaCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'audit:waka';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Audit Waka roles and profile consistency';

    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        $this->info('Starting Waka Role Audit...');

        // a. Mencari data Pak Zul dan men-print status
        $this->comment('--- Audit Data Pak Zul ---');
        $pakZul = User::where('name', 'like', '%Zulkifli%')->with(['teacherProfile', 'adminProfile'])->first();

        if ($pakZul) {
            $data = [
                [
                    'Name' => $pakZul->name,
                    'User Type' => $pakZul->user_type,
                    'Jabatan (TeacherProfile)' => json_encode($pakZul->teacherProfile?->jabatan ?? []),
                    'AdminProfile Type' => $pakZul->adminProfile?->type ?? 'None',
                    'Status' => $this->checkConsistency($pakZul) ? 'OK' : 'Inconsistent',
                ],
            ];
            $this->table(['Name', 'User Type', 'Jabatan (TeacherProfile)', 'AdminProfile Type', 'Status'], $data);
        } else {
            $this->error('User Pak Zul tidak ditemukan.');
        }

        // b. Mengecek seluruh user yang memiliki jabatan "Waka"
        $this->newLine();
        $this->comment('--- Audit Seluruh Waka ---');

        $wakas = User::whereHas('teacherProfile', function ($query) {
            $query->where('jabatan', 'like', '%Waka%');
        })->with(['teacherProfile', 'adminProfile'])->get();

        if ($wakas->isEmpty()) {
            $this->warn('Tidak ada user dengan jabatan Waka ditemukan di TeacherProfile.');
        } else {
            $tableData = [];
            foreach ($wakas as $waka) {
                $isConsistent = $this->checkConsistency($waka);

                $tableData[] = [
                    'Name' => $waka->name,
                    'User Type' => $waka->user_type,
                    'Jabatan' => json_encode($waka->teacherProfile?->jabatan ?? []),
                    'Admin Type' => $waka->adminProfile?->type ?? 'None',
                    'Status' => $isConsistent ? 'OK' : 'INCONSISTENT',
                ];

                if (! $isConsistent) {
                    $this->warn("PERINGATAN: Data Waka '{$waka->name}' tidak sinkron!");
                }
            }
            $this->table(['Name', 'User Type', 'Jabatan', 'Admin Type', 'Status'], $tableData);
        }

        $this->info('Audit Selesai.');
    }

    /**
     * Check if Waka data is consistent
     */
    private function checkConsistency(User $user): bool
    {
        $jabatan = $user->teacherProfile?->jabatan ?? [];

        // Handle case where jabatan might be a string (not properly cast)
        if (is_string($jabatan)) {
            $jabatan = [$jabatan];
        }

        $hasWakaJabatan = false;

        foreach ($jabatan as $j) {
            if (str_contains($j, 'Waka')) {
                $hasWakaJabatan = true;
                break;
            }
        }

        if (! $hasWakaJabatan) {
            return true; // Not a Waka, skip consistency check here
        }

        // Consistency Rules for Waka:
        // 1. user_type must be 'admin'
        // 2. adminProfile must exist and type should be 'waka'

        $isUserAdmin = ($user->user_type === 'admin');
        $isAdminProfileWaka = ($user->adminProfile?->type === 'waka');

        return $isUserAdmin && $isAdminProfileWaka;
    }
}
