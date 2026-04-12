<?php

namespace App\Jobs;

use App\Models\Attendance;
use App\Models\User;
use App\Services\WhatsAppService;
use App\Services\WhatsAppTemplates;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Carbon;

class SendDailyAttendanceReport implements ShouldQueue
{
    use Queueable;

    /**
     * Execute the job.
     */
    public function handle(WhatsAppService $whatsapp): void
    {
        if (! config('whatsapp.notifications.daily_report')) {
            return;
        }

        $date = now()->toDateString();
        $wakaUsers = User::whereHas('adminProfile', function ($q) {
            $q->where('type', 'waka');
        })->get();

        if ($wakaUsers->isEmpty()) {
            return;
        }

        // Get global stats
        $stats = Attendance::whereDate('date', $date)
            ->where('attendee_type', 'student')
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status');

        $present = $stats->get('present', 0);
        $sick = $stats->get('sick', 0);
        $permit = $stats->get('izin', 0) + $stats->get('excused', 0);
        $absent = $stats->get('absent', 0);
        $total = Attendance::whereDate('date', $date)->where('attendee_type', 'student')->distinct('student_id')->count();

        $message = WhatsAppTemplates::dailyReport(
            'Seluruh Sekolah',
            $total,
            $present,
            $sick,
            $permit,
            $absent,
            Carbon::parse($date)->isoFormat('dddd, D MMMM Y')
        );

        foreach ($wakaUsers as $user) {
            if ($user->phone) {
                $whatsapp->sendMessage($user->phone, $message);
            }
        }
    }
}
