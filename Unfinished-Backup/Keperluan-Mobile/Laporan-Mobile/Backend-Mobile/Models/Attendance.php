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
        'is_draft',
        'draft_saved_at',
        'finalized_at',
        'manual_session_started_at',
    ];

    protected $casts = [
        'date' => 'datetime',
        'checked_in_at' => 'datetime',
        'is_draft' => 'boolean',
        'draft_saved_at' => 'datetime',
        'finalized_at' => 'datetime',
        'manual_session_started_at' => 'datetime',
    ];

    public function scopeDraft($query)
    {
        return $query->where('is_draft', true);
    }

    public function scopeFinal($query)
    {
        return $query->where('is_draft', false);
    }

    public function scopeForManualSession($query, int $scheduleId, string $date)
    {
        return $query
            ->where('schedule_id', $scheduleId)
            ->where('attendee_type', 'student')
            ->whereDate('date', $date);
    }

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
            'dispen' => 'dispensasi',
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
            'dispensasi' => 'hadir',
            'dispen' => 'hadir',
        ];

        return $map[strtolower($status)] ?? 'alpha';
    }
}
