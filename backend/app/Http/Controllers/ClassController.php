<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreClassRequest;
use App\Http\Requests\UpdateClassRequest;
use App\Http\Requests\UploadScheduleImageRequest;
use App\Models\Classes;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ClassController extends Controller
{
    /**
     * List Classes
     *
     * Retrieve a list of all classes.
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->integer('per_page', 10);

        $query = Classes::query()->with(['major', 'homeroomTeacher.user'])->orderBy('id', 'desc');

        return \App\Http\Resources\ClassResource::collection($query->paginate($perPage > 0 ? $perPage : 10))->response();
    }

    /**
     * Create Class
     *
     * Create a new class.
     */
    public function store(StoreClassRequest $request): JsonResponse
    {
        $data = $request->validated();

        $class = \Illuminate\Support\Facades\DB::transaction(function () use ($data) {
            $class = Classes::create([
                'grade' => $data['grade'],
                'label' => $data['label'],
                'major_id' => $data['major_id'] ?? null,
            ]);

            if (isset($data['homeroom_teacher_id'])) {
                \App\Models\TeacherProfile::where('id', $data['homeroom_teacher_id'])
                    ->update(['homeroom_class_id' => $class->id]);
            }

            return $class;
        });

        return response()->json($class, 201);
    }

    /**
     * Show Class
     *
     * Retrieve a specific class by ID.
     */
    public function show(Classes $class): JsonResponse
    {
        return response()->json($class->load(['students.user', 'homeroomTeacher.user', 'major']));
    }

    /**
     * Update Class
     *
     * Update a specific class by ID.
     */
    public function update(UpdateClassRequest $request, Classes $class): JsonResponse
    {
        $data = $request->validated();

        \Illuminate\Support\Facades\DB::transaction(function () use ($class, $data) {
            $class->update($data);

            if (isset($data['homeroom_teacher_id'])) {
                // Clear old homeroom if exists
                \App\Models\TeacherProfile::where('homeroom_class_id', $class->id)
                    ->update(['homeroom_class_id' => null]);

                // Set new homeroom
                \App\Models\TeacherProfile::where('id', $data['homeroom_teacher_id'])
                    ->update(['homeroom_class_id' => $class->id]);
            }
        });

        return response()->json($class->load('homeroomTeacher.user'));
    }

    /**
     * Delete Class
     *
     * Delete a specific class by ID.
     */
    public function destroy(Classes $class): JsonResponse
    {
        try {
            $class->delete();
            return response()->json(['message' => 'Deleted']);
        } catch (\Illuminate\Database\QueryException $e) {
            if ($e->errorInfo[1] == 1451 || $e->getCode() == 23000) {
                return response()->json(['message' => 'Data tidak dapat dihapus karena masih terelasi dengan data lain'], 409);
            }
            throw $e;
        }
    }

    /**
     * Upload Schedule Image
     *
     * Upload a schedule image for a specific class.
     */
    public function uploadScheduleImage(UploadScheduleImageRequest $request, Classes $class): JsonResponse
    {

        if ($class->schedule_image_path) {
            Storage::disk('public')->delete($class->schedule_image_path);
        }

        $path = $request->file('file')->store('schedules/classes', 'public');
        $class->update(['schedule_image_path' => $path]);

        return response()->json(['url' => asset('storage/'.$path)]);
    }

    /**
     * Get Schedule Image
     *
     * Retrieve the schedule image for a specific class.
     */
    public function getScheduleImage(Classes $class)
    {
        $path = $class->schedule_image_path ?? 'schedules/defaults/default_schedule.jpg';

        if (! Storage::disk('public')->exists($path)) {
            $path = 'schedules/defaults/default_schedule.jpg';
        }

        if (! Storage::disk('public')->exists($path)) {
            return response()->json(['message' => 'Image not found'], 404);
        }

        return response()->file(Storage::disk('public')->path($path));
    }

    /**
     * Delete Schedule Image
     *
     * Delete the schedule image for a specific class.
     */
    public function deleteScheduleImage(Classes $class): JsonResponse
    {
        if ($class->schedule_image_path) {
            Storage::disk('public')->delete($class->schedule_image_path);
            $class->update(['schedule_image_path' => null]);
        }

        return response()->json(['message' => 'Image deleted']);
    }

    /**
     * Get My Class
     *
     * Retrieve the class of the currently authenticated student.
     */
    public function myClass(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->user_type === 'student') {
            if (! $user->studentProfile || ! $user->studentProfile->class_id) {
                return response()->json(['message' => 'Class not found'], 404);
            }

            return response()->json($user->studentProfile->classRoom->load('major'));
        }

        if ($user->user_type === 'teacher') {
            if (! $user->teacherProfile || ! $user->teacherProfile->homeroom_class_id) {
                return response()->json(['message' => 'Homeroom class not found'], 404);
            }

            return response()->json($user->teacherProfile->homeroomClass->load('major'));
        }

        return response()->json(['message' => 'Unauthorized'], 403);
    }

    /**
     * Get My Class Schedules
     *
     * Retrieve the schedules for the class of the currently authenticated student.
     */
    public function myClassSchedules(Request $request): JsonResponse
    {
        $user = $request->user();
        $classRoom = null;

        if ($user->user_type === 'student') {
            if (! $user->studentProfile || ! $user->studentProfile->classRoom) {
                return response()->json(['message' => 'Class not found'], 404);
            }
            $classRoom = $user->studentProfile->classRoom;
        } elseif ($user->user_type === 'teacher') {
            if (! $user->teacherProfile || ! $user->teacherProfile->homeroomClass) {
                return response()->json(['message' => 'Homeroom class not found'], 404);
            }
            $classRoom = $user->teacherProfile->homeroomClass;
        } else {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $activeSchedule = $classRoom->classSchedules()
            ->where('is_active', true)
            ->with([
                'dailySchedules.scheduleItems.subject',
                'dailySchedules.scheduleItems.teacher.user',
            ])
            ->latest('id')
            ->first();

        if (! $activeSchedule) {
            return response()->json([]);
        }

        $targetDay = null;
        if ($request->filled('date')) {
            $targetDay = date('l', strtotime((string) $request->date));
        }

        $dailySchedules = $activeSchedule->dailySchedules;
        if ($targetDay) {
            $dailySchedules = $dailySchedules->where('day', $targetDay);
        }

        $items = $dailySchedules
            ->flatMap(function ($dailySchedule) use ($classRoom) {
                return $dailySchedule->scheduleItems->map(function ($item) use ($dailySchedule, $classRoom) {
                    return [
                        'id' => $item->id,
                        'day' => $dailySchedule->day,
                        'start_time' => $item->start_time,
                        'end_time' => $item->end_time,
                        'room' => $item->room,
                        'keterangan' => $item->keterangan,
                        'subject_name' => $item->subject?->name ?? $item->keterangan ?? '-',
                        'subject' => $item->subject ? [
                            'id' => $item->subject->id,
                            'name' => $item->subject->name,
                        ] : null,
                        'teacher' => $item->teacher ? [
                            'id' => $item->teacher->id,
                            'nip' => $item->teacher->nip,
                            'user' => $item->teacher->user ? [
                                'id' => $item->teacher->user->id,
                                'name' => $item->teacher->user->name,
                            ] : null,
                        ] : null,
                        'class' => [
                            'id' => $classRoom->id,
                            'name' => $classRoom->name,
                        ],
                    ];
                });
            })
            ->sortBy('start_time')
            ->values();

        return response()->json($items);
    }

    /**
     * Get My Class Attendance
     *
     * Retrieve the attendance records for the class of the currently authenticated student.
     */
    public function myClassAttendance(Request $request): JsonResponse
    {
        $user = $request->user();
        $classId = null;

        if ($user->user_type === 'student') {
            if (! $user->studentProfile || ! $user->studentProfile->class_id) {
                return response()->json(['message' => 'Class not found'], 404);
            }
            $classId = $user->studentProfile->class_id;
        } elseif ($user->user_type === 'teacher') {
            if (! $user->teacherProfile || ! $user->teacherProfile->homeroom_class_id) {
                return response()->json(['message' => 'Homeroom class not found'], 404);
            }
            $classId = $user->teacherProfile->homeroom_class_id;
        } else {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $query = \App\Models\Attendance::whereHas('student.classRoom', function ($q) use ($classId) {
            $q->where('id', $classId);
        });

        if ($request->filled('start_date')) {
            $query->whereDate('date', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $query->whereDate('date', '<=', $request->end_date);
        }
        // Legacy parameter support
        if ($request->filled('from')) {
            $query->whereDate('date', '>=', $request->from);
        }
        if ($request->filled('to')) {
            $query->whereDate('date', '<=', $request->to);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->with(['student.user', 'schedule.teacher.user'])->latest()->get());
    }

    /**
     * Get My Class Students
     *
     * Retrieve a list of students in the class of the currently authenticated student.
     */
    public function myClassStudents(Request $request): JsonResponse
    {
        $user = $request->user();
        $classId = null;

        if ($user->user_type === 'student') {
            if (! $user->studentProfile || ! $user->studentProfile->class_id) {
                return response()->json(['message' => 'Class not found'], 404);
            }
            $classId = $user->studentProfile->class_id;
        } elseif ($user->user_type === 'teacher') {
            if (! $user->teacherProfile || ! $user->teacherProfile->homeroom_class_id) {
                return response()->json(['message' => 'Homeroom class not found'], 404);
            }
            $classId = $user->teacherProfile->homeroom_class_id;
        } else {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $students = \App\Models\StudentProfile::where('class_id', $classId)
            ->with('user')
            ->get()
            ->sortBy('user.name')
            ->values();

        return response()->json($students);
    }
}
