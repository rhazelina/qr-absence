<?php

namespace App\Data;

use Illuminate\Http\Request;

class ManualAttendanceData
{
    public function __construct(
        public string $attendee_type,
        public int $schedule_id,
        public string $status,
        public string $date,
        public ?int $student_id = null,
        public ?int $teacher_id = null,
        public ?string $reason = null,
    ) {}

    public static function fromRequest(Request $request): self
    {
        return new self(
            attendee_type: $request->input('attendee_type'),
            schedule_id: $request->integer('schedule_id'),
            status: $request->input('status'),
            date: $request->input('date'),
            student_id: $request->input('student_id') ? (int) $request->input('student_id') : null,
            teacher_id: $request->input('teacher_id') ? (int) $request->input('teacher_id') : null,
            reason: $request->input('reason'),
        );
    }
}
