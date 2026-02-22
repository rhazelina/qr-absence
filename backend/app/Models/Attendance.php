<?php

namespace App\Models;

use App\Enums\AttendanceStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Attendance extends Model
{
    protected $fillable = [
        'attendee_type',
        'date',
        'student_id',
        'teacher_id',
        'qrcode_id',
        'reason',
        'reason_file',
        'status',
        'checked_in_at',
        'schedule_id',
        'source',
    ];

    protected $casts = [
        'date' => 'datetime',
        'checked_in_at' => 'datetime',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(StudentProfile::class);
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(TeacherProfile::class);
    }

    public function schedule(): BelongsTo
    {
        return $this->belongsTo(ScheduleItem::class, 'schedule_id');
    }

    public function qrcode(): BelongsTo
    {
        return $this->belongsTo(Qrcode::class);
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(AttendanceAttachment::class);
    }

    /**
     * Map frontend/raw status to normalized backend status.
     */
    public static function normalizeStatus(string $status): string
    {
        $map = [
            'hadir' => AttendanceStatus::PRESENT->value,
            'sakit' => AttendanceStatus::SICK->value,
            'izin' => AttendanceStatus::EXCUSED->value, // or PERMISSION depending on logic, but map had 'excused'
            'terlambat' => AttendanceStatus::LATE->value,
            'alpha' => AttendanceStatus::ABSENT->value,
            'alfa' => AttendanceStatus::ABSENT->value,
            'pulang' => AttendanceStatus::RETURN->value,
        ];

        return $map[strtolower($status)] ?? $status;
    }

    /**
     * Map backend status back to frontend labels.
     */
    public static function mapStatusToFrontend(string $status): string
    {
        $map = [
            AttendanceStatus::PRESENT->value => 'hadir',
            AttendanceStatus::SICK->value => 'sakit',
            AttendanceStatus::EXCUSED->value => 'izin',
            AttendanceStatus::PERMISSION->value => 'izin', // Handle both if needed
            AttendanceStatus::LATE->value => 'terlambat',
            AttendanceStatus::ABSENT->value => 'alpha',
            AttendanceStatus::RETURN->value => 'pulang',
        ];

        return $map[strtolower($status)] ?? 'alpha';
    }
}
