<?php

namespace App\Jobs;

use App\Models\Attendance;
use App\Models\StudentProfile;
use App\Services\WhatsAppService;
use App\Services\WhatsAppTemplates;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SendWeeklyParentReport implements ShouldQueue
{
    use Queueable;

    /**
     * Execute the job.
     */
    public function handle(WhatsAppService $whatsapp): void
    {
        $startOfWeek = now()->startOfWeek();
        $endOfWeek = now()->endOfWeek();
        $range = $startOfWeek->format('d M').' - '.$endOfWeek->format('d M');

        // Only for students with parent phones
        $students = StudentProfile::whereNotNull('parent_phone')->with('user')->get();

        foreach ($students as $student) {
            $stats = Attendance::where('student_id', $student->id)
                ->whereBetween('date', [$startOfWeek, $endOfWeek])
                ->selectRaw('status, count(*) as total')
                ->groupBy('status')
                ->get()
                ->pluck('total', 'status');

            $present = $stats->get('present', 0);
            $late = $stats->get('late', 0);
            $totalSessions = Attendance::where('student_id', $student->id)
                ->whereBetween('date', [$startOfWeek, $endOfWeek])
                ->count();

            if ($totalSessions === 0) {
                continue;
            }

            $message = WhatsAppTemplates::weeklySummary(
                $student->user->name,
                $range,
                $present,
                $totalSessions,
                $late
            );

            $whatsapp->sendMessage($student->parent_phone, $message);
        }
    }
}
