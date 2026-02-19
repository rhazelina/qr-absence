<?php

namespace App\Listeners;

use App\Enums\AttendanceStatus;
use App\Events\AttendanceRecorded;
use App\Jobs\SendWhatsAppNotification;
use App\Services\WhatsAppTemplates;
use App\Support\DashboardCache;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Cache;

class SendAttendanceNotification implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Handle the event.
     */
    public function handle(AttendanceRecorded $event): void
    {
        // 1. Clear Dashboard Cache
        $this->clearDashboardCache($event);

        // 2. Send WhatsApp Notification (only for students)
        $attendance = $event->attendance;
        if ($attendance->attendee_type === 'student' && $attendance->student && config('whatsapp.notifications.attendance_success')) {
            $student = $attendance->student->load('user');

            if ($student->parent_phone) {
                $statusLabel = $attendance->status === AttendanceStatus::LATE->value ? 'Hadir (Terlambat)' : 'Hadir';
                $time = $attendance->checked_in_at->format('H:i');

                $message = WhatsAppTemplates::attendanceSuccess(
                    $student->user->name,
                    $time,
                    $statusLabel
                );

                SendWhatsAppNotification::dispatch($student->parent_phone, $message);
            }
        }
    }

    private function clearDashboardCache(AttendanceRecorded $event): void
    {
        $today = now()->format('Y-m-d');

        // Clear caches that might be affected by new attendance
        Cache::forget(DashboardCache::key('admin', null, $today));

        // Clear Waka Dashboard for today
        Cache::forget(DashboardCache::wakaKey($today));
    }
}
