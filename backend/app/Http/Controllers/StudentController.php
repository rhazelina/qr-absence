<?php

namespace App\Http\Controllers;

use App\Models\Classes;
use App\Models\StudentProfile;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class StudentController extends Controller
{
    /**
     * List Students
     *
     * Retrieve a list of all students with filtering options.
     */
    public function index(Request $request): JsonResponse
    {
        $query = StudentProfile::query()->with(['user', 'classRoom']);

        $user = $request->user();
        if ($user && $user->user_type === 'teacher') {
            $teacher = $user->teacherProfile;
            if ($teacher) {
                $classIds = \App\Models\ScheduleItem::where('teacher_id', $teacher->id)
                    ->whereHas('dailySchedule.classSchedule', function ($q) {
                        $q->where('is_active', true);
                    })
                    ->get()
                    ->map(fn($item) => $item->dailySchedule->classSchedule->class_id ?? null)
                    ->filter()
                    ->unique()
                    ->toArray();

                if ($teacher->homeroom_class_id) {
                    $classIds[] = $teacher->homeroom_class_id;
                }

                $query->whereIn('class_id', array_unique($classIds));
            }
        } elseif ($user && $user->user_type === 'student') {
            $student = $user->studentProfile;
            if ($student) {
                $query->where('class_id', $student->class_id);
            }
        }

        if ($request->filled('nisn')) {
            $query->where('nisn', $request->string('nisn'));
        }

        if ($request->filled('class_id')) {
            $query->where('class_id', $request->integer('class_id'));
        }

        if ($request->filled('major_id')) {
            $query->whereHas('classRoom', function ($q) use ($request) {
                $q->where('major_id', $request->integer('major_id'));
            });
        }

        if ($request->filled('search')) {
            $search = $request->string('search');
            $query->where(function ($q) use ($search) {
                $q->where('nisn', 'like', "%{$search}%")
                    ->orWhere('nis', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($u) use ($search) {
                        $u->where('name', 'like', "%{$search}%")
                            ->orWhere('username', 'like', "%{$search}%");
                    });
            });
        }

        $perPage = $request->integer('per_page', 10);

        return \App\Http\Resources\StudentResource::collection(
            $query->orderBy('id', 'desc')->paginate($perPage > 0 ? $perPage : 10)->appends($request->all())
        )->response();
    }



    /**
     * Create Student
     *
     * Create a new student and their associated user account.
     */
    public function store(\App\Http\Requests\StoreStudentRequest $request): JsonResponse
    {
        $data = $request->validated();

        $student = DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['name'],
                'username' => $data['username'],
                'email' => $data['email'] ?? null,
                'password' => Hash::make($data['password']),
                'phone' => $data['phone'] ?? null,
                'contact' => $data['contact'] ?? null,
                'user_type' => 'student',
            ]);

            return $user->studentProfile()->create([
                'nisn' => $data['nisn'],
                'nis' => $data['nis'],
                'gender' => $data['gender'],
                'address' => $data['address'],
                'class_id' => $data['class_id'],
                'is_class_officer' => $data['is_class_officer'] ?? false,
                'parent_phone' => $data['parent_phone'] ?? null,
            ]);
        });

        return response()->json(new \App\Http\Resources\StudentResource($student->load(['user', 'classRoom'])), 201);
    }

    /**
     * Show Student
     *
     * Retrieve a specific student profile by ID.
     */
    public function show(StudentProfile $student): JsonResponse
    {
        return response()->json(new \App\Http\Resources\StudentResource($student->load(['user', 'classRoom', 'attendances'])));
    }

    /**
     * Update Student
     *
     * Update a specific student profile and associated user account.
     */
    public function update(\App\Http\Requests\UpdateStudentRequest $request, StudentProfile $student): JsonResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($data, $student): void {
            if (isset($data['name']) || isset($data['email']) || isset($data['password']) || isset($data['phone']) || isset($data['contact'])) {
                $student->user->update([
                    'name' => $data['name'] ?? $student->user->name,
                    'email' => $data['email'] ?? $student->user->email,
                    'password' => isset($data['password']) ? Hash::make($data['password']) : $student->user->password,
                    'phone' => $data['phone'] ?? $student->user->phone,
                    'contact' => $data['contact'] ?? $student->user->contact,
                ]);
            }

            $student->update([
                'gender' => $data['gender'] ?? $student->gender,
                'address' => $data['address'] ?? $student->address,
                'class_id' => $data['class_id'] ?? $student->class_id,
                'is_class_officer' => $data['is_class_officer'] ?? $student->is_class_officer,
                'parent_phone' => $data['parent_phone'] ?? $student->parent_phone,
            ]);
        });

        return response()->json(new \App\Http\Resources\StudentResource($student->fresh()->load(['user', 'classRoom'])));
    }

    /**
     * Delete Student
     *
     * Delete a specific student and their user account.
     */
    public function destroy(StudentProfile $student): JsonResponse
    {
        try {
            $student->user()->delete();
            return response()->json(['message' => 'Deleted']);
        } catch (\Illuminate\Database\QueryException $e) {
            if ($e->errorInfo[1] == 1451 || $e->getCode() == 23000) {
                return response()->json(['message' => 'Data tidak dapat dihapus karena masih terelasi dengan data lain'], 409);
            }
            throw $e;
        }
    }

    /**
     * Get Student Attendance History
     *
     * Retrieve the attendance history for a specific student.
     */
    public function attendanceHistory(Request $request, StudentProfile $student): JsonResponse
    {
        $query = $student->attendances()
            ->with(['schedule.class', 'schedule.teacher.user', 'schedule.subject']) // Added relations for detail view
            ->latest('date');

        if ($request->filled('from')) {
            $query->whereDate('date', '>=', $request->date('from'));
        }

        if ($request->filled('to')) {
            $query->whereDate('date', '<=', $request->date('to'));
        }

        if ($request->integer('per_page') === -1) {
            return response()->json($query->get());
        }

        return response()->json(
            $query->paginate($request->integer('per_page', 10))
        );
    }
}
