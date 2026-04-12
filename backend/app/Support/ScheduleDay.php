<?php

namespace App\Support;

use Illuminate\Support\Carbon;

class ScheduleDay
{
    private const ENGLISH_TO_INDONESIAN = [
        'Monday' => 'Senin',
        'Tuesday' => 'Selasa',
        'Wednesday' => 'Rabu',
        'Thursday' => 'Kamis',
        'Friday' => 'Jumat',
        'Saturday' => 'Sabtu',
        'Sunday' => 'Minggu',
    ];

    private const INDONESIAN_TO_ENGLISH = [
        'senin' => 'Monday',
        'selasa' => 'Tuesday',
        'rabu' => 'Wednesday',
        'kamis' => 'Thursday',
        'jumat' => 'Friday',
        'jum\'at' => 'Friday',
        'sabtu' => 'Saturday',
        'minggu' => 'Sunday',
    ];

    public static function english(?string $date = null): string
    {
        return self::parseDate($date)->englishDayOfWeek;
    }

    public static function indonesian(?string $date = null): string
    {
        return self::ENGLISH_TO_INDONESIAN[self::english($date)] ?? self::parseDate($date)->locale('id')->translatedFormat('l');
    }

    public static function variants(?string $date = null): array
    {
        $english = self::english($date);
        $indonesian = self::indonesian($date);

        return array_values(array_unique([
            $english,
            strtolower($english),
            strtoupper($english),
            ucfirst(strtolower($english)),
            $indonesian,
            strtolower($indonesian),
            strtoupper($indonesian),
            ucfirst(strtolower($indonesian)),
        ]));
    }

    public static function normalize(string $day): string
    {
        $trimmed = trim($day);
        $lower = strtolower($trimmed);

        if (isset(self::INDONESIAN_TO_ENGLISH[$lower])) {
            return self::INDONESIAN_TO_ENGLISH[$lower];
        }

        return ucfirst($lower);
    }

    private static function parseDate(?string $date = null): Carbon
    {
        return $date ? Carbon::parse($date) : now();
    }
}
