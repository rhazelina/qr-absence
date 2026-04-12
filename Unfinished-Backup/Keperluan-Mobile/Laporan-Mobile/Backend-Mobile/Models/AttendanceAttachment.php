<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AttendanceAttachment extends Model
{
    protected $fillable = [
        'attendance_id',
        'path',
        'original_name',
        'mime_type',
        'size',
    ];

    protected $appends = ['url'];

    public function attendance(): BelongsTo
    {
        return $this->belongsTo(Attendance::class);
    }

    public function getUrlAttribute(): string
    {
        try {
            return \Illuminate\Support\Facades\Storage::temporaryUrl($this->path, now()->addMinutes(60));
        } catch (\Throwable $e) {
            return route('attendance.document.proxy', ['path' => $this->path]);
        }
    }
}
