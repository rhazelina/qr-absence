<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AttendanceResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'date' => $this->date->format('Y-m-d'),
            'status' => $this->status,
            'status_label' => $this->getStatusLabel($this->status),
            'checked_in_at' => $this->checked_in_at?->format('H:i:s'),
            'reason' => $this->reason,
            'reason_file_url' => $this->reason_file ? \Illuminate\Support\Facades\Storage::url($this->reason_file) : null,
            'has_attachments' => $this->attachments()->exists() || $this->reason_file !== null,
            'attachments' => $this->whenLoaded('attachments'),
            'student' => new StudentResource($this->whenLoaded('student')),
            'teacher' => new TeacherResource($this->whenLoaded('teacher')),
            'schedule' => $this->whenLoaded('schedule', function () {
                return [
                    'id' => $this->schedule->id,
                    'subject_name' => $this->schedule->subject_name,
                    'start_time' => $this->schedule->start_time,
                    'end_time' => $this->schedule->end_time,
                ];
            }),
            'source' => $this->source,
            'created_at' => $this->created_at,
        ];
    }

    private function getStatusLabel(?string $status): string
    {
        return match ($status) {
            'present' => 'Hadir Tepat Waktu',
            'late' => 'Hadir Terlambat',
            'sick' => 'Sakit',
            'excused', 'izin' => 'Izin',
            'absent' => 'Alpha',
            'return', 'pulang' => 'Pulang',
            'dinas' => 'Dinas',
            default => 'Belum Absen',
        };
    }
}
