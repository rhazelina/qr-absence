<?php

namespace App\Enums;

enum AttendanceStatus: string
{
    case PRESENT = 'present';
    case LATE = 'late';
    case SICK = 'sick';
    case PERMISSION = 'izin'; // 'izin' in DB
    case EXCUSED = 'excused';
    case ABSENT = 'absent';
    case RETURN = 'return'; // 'return' or 'pulang' ? likely 'return' based on previous code usage 'return', 'pulang' => 'Pulang'
    case DINAS = 'dinas';
}
