<?php

namespace App\Http\Controllers\Api;

use App\Enums\AttendanceStatus;
use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\ScheduleItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StudentDashboardController extends Controller
{
    /**
     * Today's Schedule for Student
     */
    public function scheduleToday(Request $request): JsonResponse
    {
        $user = $request->user();
        $profile = $user->studentProfile;

        if (! $profile) {
            return response()->json(['message' => 'Student profile not found'], 404);
        }

        $today = now();
        $dayName = $today->format('l'); // Monday, Tuesday, etc.
        $dateStr = $today->toDateString();

        $schedules = ScheduleItem::whereHas('dailySchedule', function ($query) use ($dayName, $profile) {
            $query->where('day', $dayName)
                ->whereHas('classSchedule', function ($query2) use ($profile) {
                    $query2->where('class_id', $profile->class_id)
                        ->where('is_active', true);
                });
        })
            ->with(['teacher.user', 'subject'])
            ->orderBy('start_time')
            ->get();

        $attendances = Attendance::where('student_id', $profile->id)
            ->whereDate('date', $dateStr)
            ->get()
            ->keyBy('schedule_id');

        $data = $schedules->map(function ($item) use ($attendances) {
            $attendance = $attendances->get($item->id);

            return [
                'id' => $item->id,
                'mapel' => $item->subject_name,
                'guru' => $item->teacher?->user?->name ?? 'N/A',
                'start' => substr($item->start_time, 0, 5),
                'end' => substr($item->end_time, 0, 5),
                'status' => $attendance?->status ?? 'none',
                'checked_in_at' => $attendance?->checked_in_at?->format('H:i'),
            ];
        });

        return response()->json([
            'date' => $dateStr,
            'day' => $dayName,
            'items' => $data,
        ]);
    }

    /**
     * Attendance Statistics for Charts
     */
    public function attendanceStats(Request $request): JsonResponse
    {
        $user = $request->user();
        $profile = $user->studentProfile;

        if (! $profile) {
            return response()->json(['message' => 'Student profile not found'], 404);
        }

        $now = now();
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfMonth();
        $startOfWeek = $now->copy()->startOfWeek();
        $endOfWeek = $now->copy()->endOfWeek();

        // 1. Monthly Chart Data (Daily breakdown)
        $monthlyAttendances = Attendance::where('student_id', $profile->id)
            ->whereBetween('date', [$startOfMonth->toDateString(), $endOfMonth->toDateString()])
            ->select('date', 'status', DB::raw('count(*) as count'))
            ->groupBy('date', 'status')
            ->get()
            ->groupBy('date');

        $monthlyChartData = [];
        $cursor = $startOfMonth->copy();
        while ($cursor->lte($endOfMonth)) {
            $dateStr = $cursor->toDateString();

            // Skip weekends if no attendance data exists to keep chart clean
            if ($cursor->isWeekend() && ! $monthlyAttendances->has($dateStr)) {
                $cursor->addDay();

                continue;
            }

            $dateRecords = $monthlyAttendances->get($dateStr, collect());

            $monthlyChartData[] = [
                'date' => $dateStr,
                'day_label' => $cursor->format('d M'),
                'present' => $dateRecords->whereIn('status', [AttendanceStatus::PRESENT->value, AttendanceStatus::LATE->value])->sum('count'),
                'late' => $dateRecords->where('status', AttendanceStatus::LATE->value)->sum('count'),
                'sick' => $dateRecords->where('status', AttendanceStatus::SICK->value)->sum('count'),
                'excused' => $dateRecords->whereIn('status', [AttendanceStatus::EXCUSED->value, AttendanceStatus::PERMISSION->value])->sum('count'),
                'absent' => $dateRecords->where('status', AttendanceStatus::ABSENT->value)->sum('count'),
            ];

            $cursor->addDay();
        }

        // 2. Weekly Distribution Stats
        $weeklyStats = Attendance::where('student_id', $profile->id)
            ->whereBetween('date', [$startOfWeek->toDateString(), $endOfWeek->toDateString()])
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status');

        $weeklyDistribution = [
            'present' => $weeklyStats->get(AttendanceStatus::PRESENT->value, 0) + $weeklyStats->get(AttendanceStatus::LATE->value, 0),
            'late' => $weeklyStats->get(AttendanceStatus::LATE->value, 0),
            'sick' => $weeklyStats->get(AttendanceStatus::SICK->value, 0),
            'excused' => $weeklyStats->get(AttendanceStatus::EXCUSED->value, 0) + $weeklyStats->get(AttendanceStatus::PERMISSION->value, 0),
            'absent' => $weeklyStats->get(AttendanceStatus::ABSENT->value, 0),
            'total' => $weeklyStats->sum(),
        ];

        return response()->json([
            'monthly_chart' => $monthlyChartData,
            'weekly_stats' => $weeklyDistribution,
        ]);
    }
}
