<?php

namespace App\Listeners;

use App\Events\AttendanceRecorded;
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

        // 2. WhatsApp Notification logic removed as feature is deprecated.
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
