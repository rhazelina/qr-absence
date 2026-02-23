<?php

namespace App\Http\Controllers;

use App\Models\ScheduleItem;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
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
            $day = Carbon::parse($request->string('date'))->format('l');
            $query->whereHas('dailySchedule', function ($q) use ($day) {
                $q->where('day', $day);
            });
        }

        $schedules = $query->latest()->paginate(15)->withQueryString();

        return view('schedules.index', [
            'schedules' => $schedules,
        ]);
    }
}
