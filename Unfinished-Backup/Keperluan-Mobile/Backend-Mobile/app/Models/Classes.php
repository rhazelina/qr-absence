<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Classes extends Model
{
    use HasFactory;

    protected $with = ['major']; // Eager load major by default

    protected $appends = ['name', 'grade_roman'];

    protected $fillable = [
        'grade',
        'label',
        'major_id',
        'schedule_image_path',
    ];

    public function getNameAttribute(): string
    {
        $label = trim($this->label ?? '');
        $grade = (string) ($this->grade ?? '');

        // If label already contains major names or spaces, assume it's the full name
        // We ensure grade is prepended if not already.
        if (preg_match('/\s/', $label)) {
            if ($grade && !str_starts_with($label, $grade . ' ')) {
                return $grade . ' ' . $label;
            }
            return $label;
        }

        $parts = [];

        // Add grade
        $grade = (string) ($this->grade ?? '');
        if ($grade) {
            $parts[] = $grade;
        }

        // Add major code
        if ($this->major) {
            $parts[] = $this->major->code;
        }

        // Add label (typically just a number like "1" or "2")
        if ($label && $label !== $grade) {
            $parts[] = $label;
        }

        return implode(' ', $parts);
    }

    public function getGradeRomanAttribute(): string
    {
        // This attribute name is kept for backward compatibility with frontend
        // but it now returns the numeric grade as requested.
        return (string) ($this->grade ?? '');
    }

    // Siswa untuk
    public function students(): HasMany
    {
        return $this->hasMany(StudentProfile::class, 'class_id');
    }

    // Guru yang mengajar kelas
    public function homeroomTeacher(): HasOne
    {
        return $this->hasOne(TeacherProfile::class, 'homeroom_class_id');
    }

    // Jurusan yang diikuti kelas
    public function major(): BelongsTo
    {
        return $this->belongsTo(Major::class, 'major_id');
    }

    // Jadwal untuk kelas
    public function classSchedules(): HasMany
    {
        return $this->hasMany(ClassSchedule::class, 'class_id');
    }
}
