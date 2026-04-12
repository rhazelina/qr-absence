<?php

namespace App\Enums;

enum AttendanceStatus: string
{
    case PRESENT = 'present';
    case LATE = 'late';
    case SICK = 'sick';
    case PERMISSION = 'izin';
    case EXCUSED = 'excused';
    case ABSENT = 'absent';
    case RETURN = 'return';
    case DINAS = 'dinas';

    public function label(): string
    {
        return self::labelFor($this->value);
    }

    public static function labelFor(?string $status): string
    {
        return match ($status) {
            self::PRESENT->value => 'Hadir',
            self::LATE->value => 'Terlambat',
            self::SICK->value => 'Sakit',
            self::EXCUSED->value, self::PERMISSION->value => 'Izin',
            self::ABSENT->value, 'alpha', 'alfa' => 'Alpha',
            self::RETURN->value, 'pulang' => 'Pulang',
            self::DINAS->value => 'Dinas',
            default => 'Belum Absen',
        };
    }
}
