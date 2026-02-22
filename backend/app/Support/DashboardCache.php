<?php

namespace App\Support;

class DashboardCache
{
    public static function key(string $role, ?string $userId = null, ?string $date = null): string
    {
        $date = $date ?? now()->format('Y-m-d');

        if ($userId) {
            return "dashboard.{$role}.{$userId}.{$date}";
        }

        return "dashboard.{$role}.{$date}";
    }

    /**
     * Generate Waka Dashboard Key (supports semester)
     */
    public static function wakaKey(string $date, ?string $semesterId = null): string
    {
        $key = "dashboard.waka.{$date}";
        if ($semesterId) {
            $key .= ".sem.{$semesterId}";
        }

        return $key;
    }

    /**
     * Generate Class Dashboard Key
     */
    public static function classKey(string $classId, string $date): string
    {
        return "dashboard.class.{$classId}.{$date}";
    }
}
