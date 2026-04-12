<?php

namespace App\Events;

use App\Models\Attendance;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AttendanceRecorded implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Attendance $attendance) {}

    public function broadcastOn(): array
    {
        return [new PrivateChannel('schedules.'.$this->attendance->schedule_id)];
    }

    public function broadcastAs(): string
    {
        return 'attendance.recorded';
    }

    public function broadcastWith(): array
    {
        return [
            'attendee_type' => $this->attendance->attendee_type,
            'schedule_id' => $this->attendance->schedule_id,
            'student_id' => $this->attendance->student_id, // Added ID
            'teacher_id' => $this->attendance->teacher_id, // Added ID
            'status' => $this->attendance->status,
            'name' => $this->attendance->attendee_type === 'student'
                ? optional($this->attendance->student?->user)->name
                : optional($this->attendance->teacher?->user)->name,
        ];
    }
}
