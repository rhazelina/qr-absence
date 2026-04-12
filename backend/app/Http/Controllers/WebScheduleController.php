<?php

namespace App\Http\Controllers;

use App\Models\ScheduleItem;
use App\Support\ScheduleDay;
use Illuminate\Http\Request;
use Illuminate\View\View;

class WebScheduleController extends Controller
{
    public function index(Request $request): View
    {
        $query = ScheduleItem::query()->with([
            'teacher.user',
            'dailySchedule.classSchedule.class',
        ]);

        if ($request->user()->user_type === 'teacher') {
            $query->where('teacher_id', optional($request->user()->teacherProfile)->id);
        }

        if ($request->filled('class_id')) {
            $query->whereHas('dailySchedule.classSchedule', function ($q) use ($request) {
                $q->where('class_id', $request->integer('class_id'));
            });
        }

        if ($request->filled('date')) {
            $dayVariants = ScheduleDay::variants((string) $request->string('date'));
            $query->whereHas('dailySchedule', function ($q) use ($dayVariants) {
                $q->whereIn('day', $dayVariants);
            });
        }

        $schedules = $query->latest()->paginate(15)->withQueryString();

        return view('schedules.index', [
            'schedules' => $schedules,
        ]);
    }
}
