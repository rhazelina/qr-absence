<?php

namespace App\Models;

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
            'hadir' => 'present',
            'sakit' => 'sick',
            'izin' => 'excused',
            'terlambat' => 'late',
            'alpha' => 'absent',
            'alfa' => 'absent',
            'pulang' => 'return',
        ];

        return $map[strtolower($status)] ?? $status;
    }

    /**
     * Map backend status back to frontend labels.
     */
    public static function mapStatusToFrontend(string $status): string
    {
        $map = [
            'present' => 'hadir',
            'sick' => 'sakit',
            'excused' => 'izin',
            'late' => 'terlambat',
            'absent' => 'alpha',
            'return' => 'pulang',
        ];

        return $map[strtolower($status)] ?? 'alpha';
    }
}
