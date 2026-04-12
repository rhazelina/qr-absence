<?php

namespace App\Http\Resources;

use App\Enums\AttendanceStatus;
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
        $latestAttachment = $this->relationLoaded('attachments')
            ? $this->attachments->sortByDesc('id')->first()
            : $this->attachments()->latest('id')->first();

        return [
            'id' => $this->id,
            'date' => $this->date->format('Y-m-d'),
            'status' => AttendanceStatus::labelFor($this->status),
            'status_code' => $this->status,
            'status_label' => AttendanceStatus::labelFor($this->status),
            'checked_in_at' => $this->checked_in_at?->format('H:i:s'),
            'scanned_at' => $this->checked_in_at?->format('H:i:s'),
            'reason' => $this->reason,
            'reason_file_url' => $this->resolveReasonFileUrl(),
            'has_attachments' => $this->attachments->isNotEmpty() || $this->reason_file !== null,
            'attachments' => $this->whenLoaded('attachments'),
            'latest_attachment_url' => $latestAttachment?->url ?? $this->resolveReasonFileUrl(),
            'latest_attachment_mime_type' => $latestAttachment?->mime_type,
            'latest_attachment_name' => $latestAttachment?->original_name,
            'student' => new StudentResource($this->whenLoaded('student')),
            'teacher' => new TeacherResource($this->whenLoaded('teacher')),
            'schedule' => $this->whenLoaded('schedule', function () {
    $class = $this->schedule->dailySchedule?->classSchedule?->class;

    return [
        'id' => $this->schedule->id,
        'subject_name' => $this->schedule->subject_name,
        'class_id' => $class?->id,
        'class_name' => $class?->name,
        'date' => $this->date?->format('Y-m-d'),
        'start_time' => $this->schedule->start_time,
        'end_time' => $this->schedule->end_time,
    ];
}),
            // 'schedule' => $this->whenLoaded('schedule', function () {
            //     $class = $this->schedule->dailySchedule?->classSchedule?->class;

            //     return [
            //         'id' => $this->schedule->id,
            //         'subject_name' => $this->schedule->subject_name,
            //         'class_id' => $class?->id,
            //         'class_name' => $class?->name,
            //         'date' => $this->date?->format('Y-m-d'),
            //         'start_time' => $this->schedule->start_time,
            //         'end_time' => $this->schedule->end_time,
            //     ];
            // }),
            'source' => $this->source,
            'is_draft' => (bool) $this->is_draft,
            'draft_saved_at' => $this->draft_saved_at?->toIso8601String(),
            'finalized_at' => $this->finalized_at?->toIso8601String(),
            'manual_session_started_at' => $this->manual_session_started_at?->toIso8601String(),
            'auto_late' => $this->source === 'manual_draft'
                && $this->status === 'late'
                && $this->manual_session_started_at !== null,
            'created_at' => $this->created_at,
        ];
    }

    private function resolveReasonFileUrl(): ?string
    {
        if (! $this->reason_file) {
            return null;
        }

        try {
            return \Illuminate\Support\Facades\Storage::temporaryUrl($this->reason_file, now()->addMinutes(60));
        } catch (\Throwable $e) {
            return route('attendance.document.proxy', ['path' => $this->reason_file]);
        }
    }
}
