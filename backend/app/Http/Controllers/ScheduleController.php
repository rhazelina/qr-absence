<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreClassScheduleRequest;
use App\Http\Requests\UpdateClassScheduleRequest;
use App\Models\Classes;
use App\Models\ClassSchedule;
use App\Models\ScheduleItem;
use App\Models\TeacherProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ScheduleController extends Controller
{
    /**
     * List Class Schedules
     */
    public function index(Request $request): JsonResponse
    {
        $query = ClassSchedule::query()->with([
            'class.homeroomTeacher.user',
            'class.major',
        ]);

        if ($request->filled('class_id')) {
            $query->where('class_id', $request->class_id);
        }

        if ($request->filled('year')) {
            $query->where('year', $request->year);
        }

        if ($request->filled('semester')) {
            $query->where('semester', $request->semester);
        }

        $perPage = $request->integer('per_page', 10);

        return response()->json($query->orderBy('id', 'desc')->paginate($perPage > 0 ? $perPage : 10));
    }

    /**
     * Store a new Class Schedule
     */
    public function store(StoreClassScheduleRequest $request): JsonResponse
    {
        $data = $request->validated();

        $schedule = DB::transaction(function () use ($data) {
            $classSchedule = ClassSchedule::create([
                'class_id' => $data['class_id'],
                'semester' => $data['semester'],
                'year' => $data['year'],
                'is_active' => $data['is_active'] ?? true,
            ]);

            foreach ($data['days'] as $dayData) {
                $dayName = $this->normalizeDay($dayData['day']);
                $dailySchedule = $classSchedule->dailySchedules()->create([
                    'day' => $dayName,
                ]);

                if (isset($dayData['items'])) {
                    foreach ($dayData['items'] as $itemData) {
                        $this->validateOverlap($itemData, $dayName, $classSchedule);
                        $dailySchedule->scheduleItems()->create($itemData);
                    }
                }
            }

            return $classSchedule;
        });

        return response()->json($schedule->load(['class', 'dailySchedules.scheduleItems.subject', 'dailySchedules.scheduleItems.teacher.user']), 201);
    }

    /**
     * Show a Class Schedule
     */
    public function show(ClassSchedule $schedule): JsonResponse
    {
        return response()->json($schedule->load([
            'class',
            'dailySchedules.scheduleItems.subject',
            'dailySchedules.scheduleItems.teacher.user',
        ]));
    }

    /**
     * Update a Class Schedule
     */
    public function update(UpdateClassScheduleRequest $request, ClassSchedule $schedule): JsonResponse
    {
        $data = $request->validated();

        $schedule = DB::transaction(function () use ($schedule, $data) {
            $schedule->update([
                'semester' => $data['semester'] ?? $schedule->semester,
                'year' => $data['year'] ?? $schedule->year,
                'is_active' => $data['is_active'] ?? $schedule->is_active,
            ]);

            if (isset($data['days'])) {
                // Full replacement of days strategy for simplicity and correctness
                $schedule->dailySchedules()->delete();

                foreach ($data['days'] as $dayData) {
                    $dayName = $this->normalizeDay($dayData['day']);
                    $dailySchedule = $schedule->dailySchedules()->create([
                        'day' => $dayName,
                    ]);

                    if (isset($dayData['items'])) {
                        foreach ($dayData['items'] as $itemData) {
                            $this->validateOverlap($itemData, $dayName, $schedule);
                            $dailySchedule->scheduleItems()->create($itemData);
                        }
                    }
                }
            }

            return $schedule;
        });

        return response()->json($schedule->load(['class', 'dailySchedules.scheduleItems.subject', 'dailySchedules.scheduleItems.teacher.user']));
    }

    /**
     * Delete a Class Schedule
     */
    public function destroy(ClassSchedule $schedule): JsonResponse
    {
        $schedule->delete();

        return response()->json(['message' => 'Schedule deleted successfully']);
    }

    /**
     * Get Schedules by Teacher
     */
    public function byTeacher(Request $request, TeacherProfile $teacher): JsonResponse
    {
        // Return ScheduleItems for this teacher, grouped by ClassSchedule?
        // Or just a flat list of items with their day/class info?
        // Let's return flat list of items ordered by day/time

        $query = ScheduleItem::query()
            ->where('teacher_id', $teacher->id)
            ->with(['dailySchedule.classSchedule.class', 'subject'])
            ->whereHas('dailySchedule.classSchedule', function ($q) {
                $q->where('is_active', true);
            });

        return response()->json($query->get());
    }

    /**
     * Get My Schedules (Student/Teacher)
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->user_type === 'teacher') {
            $teacher = $user->teacherProfile;
            if (! $teacher) {
                return response()->json(['message' => 'Profile not found'], 404);
            }

            // Get all items for active schedules
            $items = ScheduleItem::query()
                ->where('teacher_id', $teacher->id)
                ->with(['dailySchedule.classSchedule.class', 'subject'])
                ->whereHas('dailySchedule.classSchedule', function ($q) {
                    $q->where('is_active', true);
                })
                ->get()
                ->map(function ($item) {
                    return [
                        'day' => $item->dailySchedule->day,
                        'start_time' => $item->start_time,
                        'end_time' => $item->end_time,
                        'class' => $item->dailySchedule->classSchedule->class->name,
                        'subject' => $item->subject->name ?? 'N/A',
                        'room' => $item->room,
                    ];
                });

            return response()->json([
                'status' => $items->isEmpty() ? 'no_schedule' : 'success',
                'message' => $items->isEmpty() ? 'Tidak ada jam mengajar hari ini' : 'Berhasil mengambil jadwal',
                'items' => $items,
            ]);
        }

        if ($user->user_type === 'student') {
            $student = $user->studentProfile;
            if (! $student) {
                return response()->json(['message' => 'Profile not found'], 404);
            }

            $schedule = ClassSchedule::query()
                ->where('class_id', $student->class_id)
                ->where('is_active', true)
                ->with(['dailySchedules.scheduleItems.subject', 'dailySchedules.scheduleItems.teacher.user'])
                ->first();

            if (! $schedule) {
                return response()->json([
                    'status' => 'no_schedule',
                    'message' => 'No active schedule found',
                ], 200);
            }

            return response()->json($schedule);
        }

        return response()->json(['message' => 'Unauthorized'], 403);
    }

    /**
     * Get Today's Schedules (Student/Teacher)
     */
    public function today(Request $request): JsonResponse
    {
        $user = $request->user();
        $todayEnglish = now()->format('l');

        if ($user->user_type === 'teacher') {
            $teacher = $user->teacherProfile;
            if (! $teacher) {
                return response()->json(['message' => 'Profile not found'], 404);
            }

            $items = ScheduleItem::query()
                ->where('teacher_id', $teacher->id)
                ->with(['dailySchedule.classSchedule.class', 'subject'])
                ->whereHas('dailySchedule', function ($q) use ($todayEnglish) {
                    $q->where('day', $todayEnglish)
                        ->whereHas('classSchedule', function ($q2) {
                            $q2->where('is_active', true);
                        });
                })
                ->get()
                ->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'day' => $item->dailySchedule->day,
                        'start_time' => $item->start_time,
                        'end_time' => $item->end_time,
                        'class' => $item->dailySchedule->classSchedule->class->name,
                        'subject' => $item->subject->name ?? 'N/A',
                        'room' => $item->room,
                        'teacher' => $item->teacher ? [
                            'nip' => $item->teacher->nip,
                            'name' => $item->teacher->user->name ?? 'Guru',
                        ] : null,
                    ];
                });

            return response()->json([
                'status' => $items->isEmpty() ? 'no_schedule' : 'success',
                'message' => $items->isEmpty() ? 'Tidak ada jam mengajar hari ini' : 'Berhasil mengambil jadwal hari ini',
                'items' => $items,
            ]);
        }

        if ($user->user_type === 'student') {
            $student = $user->studentProfile;
            if (! $student) {
                return response()->json(['message' => 'Profile not found'], 404);
            }

            $items = ScheduleItem::query()
                ->with(['dailySchedule.classSchedule.class', 'subject', 'teacher.user'])
                ->whereHas('dailySchedule', function ($q) use ($todayEnglish, $student) {
                    $q->where('day', $todayEnglish)
                        ->whereHas('classSchedule', function ($q2) use ($student) {
                            $q2->where('class_id', $student->class_id)
                                ->where('is_active', true);
                        });
                })
                ->get();

            return response()->json([
                'status' => $items->isEmpty() ? 'no_schedule' : 'success',
                'message' => $items->isEmpty() ? 'Tidak ada kelas hari ini' : 'Berhasil mengambil jadwal hari ini',
                'items' => $items,
            ]);
        }

        return response()->json(['message' => 'Unauthorized'], 403);
    }

    /**
     * Bulk Upsert Schedules for a Class
     */
    public function bulkUpsert(Request $request, Classes $class): JsonResponse
    {
        $data = $request->validate([
            'year' => 'required|string',
            'semester' => 'required|string',
            'is_active' => 'boolean',
            'days' => 'required|array',
            'days.*.day' => 'required|string',
            'days.*.items' => 'array',
            'days.*.items.*.subject_id' => 'required|exists:subjects,id',
            'days.*.items.*.teacher_id' => 'required|exists:teacher_profiles,id',
            'days.*.items.*.start_time' => 'required',
            'days.*.items.*.end_time' => 'required',
            'days.*.items.*.room' => 'nullable|string',
        ]);

        $schedule = DB::transaction(function () use ($class, $data) {
            $classSchedule = ClassSchedule::updateOrCreate(
                [
                    'class_id' => $class->id,
                    'year' => $data['year'],
                    'semester' => $data['semester'],
                ],
                [
                    'is_active' => $data['is_active'] ?? true,
                ]
            );

            if ($classSchedule->is_active) {
                ClassSchedule::where('class_id', $class->id)
                    ->where('id', '!=', $classSchedule->id)
                    ->update(['is_active' => false]);
            }

            $classSchedule->dailySchedules()->delete();

            foreach ($data['days'] as $dayData) {
                $dayName = $this->normalizeDay($dayData['day']);
                $dailySchedule = $classSchedule->dailySchedules()->create([
                    'day' => $dayName,
                ]);

                if (isset($dayData['items'])) {
                    foreach ($dayData['items'] as $itemData) {
                        $this->validateOverlap($itemData, $dayName, $classSchedule);
                        $dailySchedule->scheduleItems()->create($itemData);
                    }
                }
            }

            return $classSchedule;
        });

        return response()->json($schedule->load(['class', 'dailySchedules.scheduleItems.subject', 'dailySchedules.scheduleItems.teacher.user']));
    }

    private function validateOverlap(array $itemData, string $dayName, ClassSchedule $classSchedule)
    {
        $startTime = $itemData['start_time'];
        $endTime = $itemData['end_time'];

        if ($startTime >= $endTime) {
            throw ValidationException::withMessages([
                'schedule' => 'Waktu mulai harus lebih awal dari waktu selesai.',
            ]);
        }

        $overlappingItem = ScheduleItem::whereHas('dailySchedule', function ($query) use ($dayName, $classSchedule) {
            $query->where('day', $dayName)
                ->whereHas('classSchedule', function ($q2) use ($classSchedule) {
                    $q2->where('is_active', true)
                        ->where('semester', $classSchedule->semester)
                        ->where('year', $classSchedule->year);
                });
        })
            ->where(function ($query) use ($startTime, $endTime) {
                $query->where('start_time', '<', $endTime)
                    ->where('end_time', '>', $startTime);
            })
            ->where(function ($query) use ($itemData, $classSchedule) {
                $query->where('teacher_id', $itemData['teacher_id'])
                    ->orWhereHas('dailySchedule', function ($q) use ($classSchedule) {
                        $q->where('class_schedule_id', $classSchedule->id);
                    });
            })
            ->first();

        if ($overlappingItem) {
            $isSameClass = $overlappingItem->dailySchedule->class_schedule_id === $classSchedule->id;

            if ($isSameClass) {
                throw ValidationException::withMessages([
                    'schedule' => "Jadwal kelas bentrok pada hari {$dayName} jam {$startTime} - {$endTime}.",
                ]);
            } else {
                $teacher = TeacherProfile::find($itemData['teacher_id']);
                $teacherName = $teacher ? $teacher->user->name : 'Guru';
                $className = $overlappingItem->dailySchedule->classSchedule->class->name ?? 'Kelas Lain';

                throw ValidationException::withMessages([
                    'schedule' => "{$teacherName} sudah memiliki jadwal mengajar di kelas {$className} pada hari {$dayName} jam {$startTime} - {$endTime}.",
                ]);
            }
        }
    }

    private function normalizeDay(string $day): string
    {
        $map = [
            'senin' => 'Monday',
            'selasa' => 'Tuesday',
            'rabu' => 'Wednesday',
            'kamis' => 'Thursday',
            'jumat' => 'Friday',
        ];

        $lowercaseDay = strtolower($day);

        return $map[$lowercaseDay] ?? ucfirst($lowercaseDay);
    }

    /**
     * Get Active Schedule for a Class
     *
     * Retrieve the active schedule and its details for a specific class.
     */
    public function byClass(Classes $class): JsonResponse
    {
        $activeSchedule = $class->classSchedules()
            ->where('is_active', true)
            ->with([
                'dailySchedules.scheduleItems.subject',
                'dailySchedules.scheduleItems.teacher.user',
            ])
            ->latest('id')
            ->first();

        if (! $activeSchedule) {
            return response()->json(['message' => 'No active schedule found for this class'], 404);
        }

        return response()->json($activeSchedule);
    }
}
