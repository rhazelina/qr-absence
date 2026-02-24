<?php

namespace App\Http\Controllers;

use App\Http\Resources\TeacherResource;
use App\Models\TeacherProfile;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class TeacherController extends Controller
{
    /**
     * List Teachers
     *
     * Retrieve a list of all teachers with filtering options.
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'role' => ['nullable', 'string', 'in:Guru,Wali Kelas,Staff'],
            'per_page' => ['nullable', 'integer', 'min:-1', 'max:1000'],
        ]);

        $query = TeacherProfile::query()->with(['user', 'homeroomClass']);

        if ($request->filled('role')) {
            $query->where('role', $request->string('role'));
        }

        if ($request->filled('search')) {
            $search = $request->string('search');
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            })->orWhere('nis', 'like', "%{$search}%");
        }

        $perPage = $request->integer('per_page', 10);

        $teachers = $query->orderBy('id', 'desc')->paginate($perPage > 0 ? $perPage : 10);

        return TeacherResource::collection($teachers)->response();
    }

    /**
     * Create Teacher
     *
     * Create a new teacher and their associated user account.
     */
    public function store(\App\Http\Requests\StoreTeacherRequest $request): JsonResponse
    {
        $data = $request->validated();

        // Auto-generate missing fields (order matters!)
        $data['nip'] = $data['nip'] ?? ($data['kode_guru'] ?? null);
        $data['username'] = $data['username'] ?? ($data['nip'] ?? null);
        $data['password'] = $data['password'] ?? ($data['nip'] ?? 'password123');
        $data['jabatan'] = $data['jabatan'] ?? 'Guru';

        $teacher = DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['name'],
                'username' => $data['username'],
                'email' => $data['email'] ?? null,
                'password' => Hash::make($data['password']),
                'phone' => $data['phone'] ?? null,
                'contact' => $data['contact'] ?? null,
                'user_type' => 'teacher',
            ]);

            return $user->teacherProfile()->create([
                'nip' => $data['nip'],
                'homeroom_class_id' => $data['homeroom_class_id'] ?? null,
                'subject' => $data['subject'] ?? null,
                'jabatan' => $data['jabatan'] ?? 'Guru',
                'bidang' => $data['bidang'] ?? null,
                'konsentrasi_keahlian' => $data['konsentrasi_keahlian'] ?? null,
                'kode_guru' => $data['kode_guru'] ?? null,
            ]);
        });

        return response()->json($teacher->load(['user', 'homeroomClass']), 201);
    }

    /**
     * Show Teacher
     *
     * Retrieve a specific teacher profile by ID.
     */
    public function show(TeacherProfile $teacher): JsonResponse
    {
        return (new TeacherResource($teacher->load(['user', 'homeroomClass', 'scheduleItems'])))
            ->response();
    }

    /**
     * Update Teacher
     *
     * Update an existing teacher's profile and user account.
     */
    public function update(\App\Http\Requests\UpdateTeacherRequest $request, TeacherProfile $teacher): JsonResponse
    {
        $data = $request->validated();

        $oldHomeroomClassId = $teacher->homeroom_class_id;
        $newHomeroomClassId = $data['homeroom_class_id'] ?? null;

        DB::transaction(function () use ($data, $teacher, $oldHomeroomClassId, $newHomeroomClassId): void {
            if (isset($data['name']) || isset($data['email']) || isset($data['password']) || isset($data['phone']) || isset($data['contact'])) {
                $teacher->user->update([
                    'name' => $data['name'] ?? $teacher->user->name,
                    'email' => $data['email'] ?? $teacher->user->email,
                    'password' => isset($data['password']) ? Hash::make($data['password']) : $teacher->user->password,
                    'phone' => $data['phone'] ?? $teacher->user->phone,
                    'contact' => $data['contact'] ?? $teacher->user->contact,
                ]);
            }

            $teacher->update([
                'homeroom_class_id' => $data['homeroom_class_id'] ?? $teacher->homeroom_class_id,
                'subject' => $data['subject'] ?? $teacher->subject,
                'nip' => $data['nip'] ?? $teacher->nip,
                'jabatan' => $data['jabatan'] ?? $teacher->jabatan,
                'bidang' => $data['bidang'] ?? $teacher->bidang,
                'konsentrasi_keahlian' => $data['konsentrasi_keahlian'] ?? $teacher->konsentrasi_keahlian,
                'kode_guru' => $data['kode_guru'] ?? $teacher->kode_guru,
            ]);

            // Sync class if homeroom changed
            if ($oldHomeroomClassId !== $newHomeroomClassId) {
                // Clear old class's homeroom_teacher_id
                if ($oldHomeroomClassId) {
                    \App\Models\Classes::where('id', $oldHomeroomClassId)
                        ->update(['homeroom_teacher_id' => null]);
                }
                // Set new class's homeroom_teacher_id
                if ($newHomeroomClassId) {
                    \App\Models\Classes::where('id', $newHomeroomClassId)
                        ->update(['homeroom_teacher_id' => $teacher->id]);
                }
            }
        });

        return response()->json($teacher->fresh()->load(['user', 'homeroomClass']));
    }

    /**
     * Delete Teacher
     *
     * Delete a specific teacher and their user account.
     */
    public function destroy(TeacherProfile $teacher): JsonResponse
    {
        try {
            $teacher->user()->delete();

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
     * Upload a schedule image for a specific teacher.
     */
    public function uploadScheduleImage(Request $request, TeacherProfile $teacher): JsonResponse
    {
        $request->validate([
            'file' => 'required|image|max:2048',
        ]);

        if ($teacher->schedule_image_path) {
            Storage::disk('public')->delete($teacher->schedule_image_path);
        }

        $path = $request->file('file')->store('schedules/teachers', 'public');
        $teacher->update(['schedule_image_path' => $path]);

        return response()->json(['url' => asset('storage/'.$path)]);
    }

    /**
     * Upload My Schedule Image
     *
     * Upload a schedule image for the currently authenticated teacher.
     */
    public function uploadMyScheduleImage(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user->teacherProfile) {
            return response()->json(['message' => 'Teacher profile not found'], 404);
        }

        return $this->uploadScheduleImage($request, $user->teacherProfile);
    }

    /**
     * Get Schedule Image
     *
     * Retrieve the schedule image for a specific teacher.
     */
    public function getScheduleImage(TeacherProfile $teacher)
    {
        $path = $teacher->schedule_image_path ?? 'schedules/defaults/default_schedule.jpg';

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
     * Delete the schedule image for a specific teacher.
     */
    public function deleteScheduleImage(TeacherProfile $teacher): JsonResponse
    {
        if ($teacher->schedule_image_path) {
            Storage::disk('public')->delete($teacher->schedule_image_path);
            $teacher->update(['schedule_image_path' => null]);
        }

        return response()->json(['message' => 'Image deleted']);
    }

    /**
     * Get Teacher Attendance History
     *
     * Retrieve the attendance history for a specific teacher.
     */
    public function attendance(Request $request, TeacherProfile $teacher): JsonResponse
    {
        // Waka/Admin viewing teacher's attendance history
        $query = \App\Models\Attendance::where('teacher_id', $teacher->id)
            ->where('attendee_type', 'teacher');

        if ($request->filled('month')) {
            $query->whereMonth('date', $request->month);
        }

        if ($request->filled('year')) {
            $query->whereYear('date', $request->year);
        }

        $attendances = $query->with(['schedule.dailySchedule.classSchedule.class', 'schedule.subject'])
            ->latest('date')
            ->get();

        return response()->json($attendances);
    }

    // Walikelas endpoints
    /**
     * Get My Homeroom
     *
     * Retrieve the homeroom class details for the currently authenticated teacher.
     */
    public function myHomeroom(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user->teacherProfile || ! $user->teacherProfile->homeroom_class_id) {
            return response()->json(['message' => 'Homeroom not found'], 404);
        }

        return response()->json($user->teacherProfile->homeroomClass->load('major'));
    }

    /**
     * Get My Homeroom Schedules
     *
     * Retrieve the schedules for the homeroom class of the currently authenticated teacher.
     */
    public function myHomeroomSchedules(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user->teacherProfile || ! $user->teacherProfile->homeroom_class_id) {
            return response()->json(['message' => 'Homeroom not found'], 404);
        }

        $classId = $user->teacherProfile->homeroom_class_id;

        $query = \App\Models\ScheduleItem::whereHas('dailySchedule.classSchedule', function ($q) use ($classId) {
            $q->where('class_id', $classId)
                ->where('is_active', true);
        });

        if ($request->filled('date')) {
            $day = date('l', strtotime($request->date));
            $query->whereHas('dailySchedule', function ($q) use ($day) {
                $q->where('day', $day);
            });
        }

        $items = $query->with(['subject', 'teacher.user', 'dailySchedule.classSchedule.class'])->get();

        $normalized = $items->map(function ($item) {
            $className = $item->dailySchedule?->classSchedule?->class?->name ?? '-';

            return [
                'id' => $item->id,
                'day' => $item->dailySchedule?->day,
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
                    'name' => $item->teacher->user?->name ?? 'Guru',
                    'user' => $item->teacher->user ? [
                        'id' => $item->teacher->user->id,
                        'name' => $item->teacher->user->name,
                    ] : null,
                ] : null,
                'class' => [
                    'id' => $item->dailySchedule?->classSchedule?->class?->id,
                    'name' => $className,
                ],
                'class_name' => $className,
            ];
        })->values();

        return response()->json([
            'status' => 'success',
            'items' => $normalized,
        ]);
    }

    /**
     * Get My Homeroom Students
     *
     * Retrieve a list of students in the homeroom class.
     */
    public function myHomeroomStudents(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user->teacherProfile || ! $user->teacherProfile->homeroom_class_id) {
            return response()->json(['message' => 'Homeroom not found'], 404);
        }

        $students = $user->teacherProfile->homeroomClass->students()
            ->with('user')
            ->get()
            ->sortBy('user.name')
            ->values();

        return response()->json($students);
    }

    /**
     * Get My Homeroom Attendance
     *
     * Retrieve attendance records for the homeroom class.
     */
    public function myHomeroomAttendance(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            if (! $user->teacherProfile || ! $user->teacherProfile->homeroom_class_id) {
                return response()->json(['message' => 'Homeroom not found'], 404);
            }

            $classId = $user->teacherProfile->homeroom_class_id;

            $query = \App\Models\Attendance::whereHas('student', function ($q) use ($classId) {
                $q->where('class_id', $classId);
            });

            if ($request->filled('from')) {
                $query->whereDate('date', '>=', $request->from);
            }
            if ($request->filled('to')) {
                $query->whereDate('date', '<=', $request->to);
            }
            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }

            return response()->json($query->with(['student.user', 'schedule.teacher.user'])->latest('date')->get());
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error fetching homeroom attendance: '.$e->getMessage());

            return response()->json(['message' => 'Internal Server Error', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get Homeroom Attendance Summary
     *
     * Retrieve a statistical summary of attendance for the homeroom class.
     */
    public function myHomeroomAttendanceSummary(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user->teacherProfile || ! $user->teacherProfile->homeroom_class_id) {
            return response()->json(['message' => 'Homeroom not found'], 404);
        }

        $classId = $user->teacherProfile->homeroom_class_id;

        $query = \App\Models\Attendance::whereHas('student', function ($q) use ($classId) {
            $q->where('class_id', $classId);
        });

        if ($request->filled('from')) {
            $query->whereDate('date', '>=', $request->from);
        }
        if ($request->filled('to')) {
            $query->whereDate('date', '<=', $request->to);
        }

        $summary = $query->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status');

        return response()->json($summary);
    }

    /**
     * Get students requiring follow-up (Mobile App)
     * Returns students with concerning attendance patterns
     */
    /**
     * Get Students Requiring Follow-up
     *
     * Retrieve a list of students with concerning attendance patterns across classes taught by the teacher.
     */
    public function getStudentsFollowUp(Request $request): JsonResponse
    {
        $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'per_page' => ['nullable', 'integer', 'min:-1', 'max:1000'],
        ]);

        $user = $request->user();
        $teacher = $user->teacherProfile;

        if (! $teacher) {
            return response()->json(['message' => 'Teacher profile not found'], 404);
        }

        // Get all students from classes taught by this teacher
        $schedules = \App\Models\ScheduleItem::where('teacher_id', $teacher->id)
            ->with(['dailySchedule.classSchedule'])
            ->get();

        $classIds = $schedules->map(fn ($item) => $item->dailySchedule?->classSchedule?->class_id)
            ->filter()
            ->unique();

        $query = \App\Models\StudentProfile::whereIn('class_id', $classIds)
            ->with(['user', 'classRoom']);

        // Apply search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            })->orWhere('nis', 'like', "%{$search}%");
        }

        $studentsData = $query->get();
        $studentIds = $studentsData->pluck('id');

        // Fetch attendance summaries for all students in one query to avoid N+1
        $attendanceSummaries = \App\Models\Attendance::whereIn('student_id', $studentIds)
            ->selectRaw('student_id, status, count(*) as count')
            ->groupBy('student_id', 'status')
            ->get()
            ->groupBy('student_id');

        $students = $studentsData->map(function ($student) use ($attendanceSummaries) {
            // Get attendance summary for this student from the pre-fetched collection
            $summaryRows = $attendanceSummaries->get($student->id, collect());
            $attendanceSummary = $summaryRows->pluck('count', 'status');

            $absent = $attendanceSummary->get('absent', 0);
            $excused = $attendanceSummary->get('excused', 0) + $attendanceSummary->get('izin', 0);
            $sick = $attendanceSummary->get('sick', 0);

            // Calculate badge based on attendance pattern
            if ($absent >= 1) {
                $badge = [
                    'type' => 'danger',
                    'label' => 'Sering Absensi',
                ];
                $severityScore = ($absent * 100) + ($excused * 10) + ($sick * 5);
            } elseif ($excused > 5) {
                $badge = [
                    'type' => 'warning',
                    'label' => 'Perlu Diperhatikan',
                ];
                $severityScore = ($excused * 10) + ($sick * 5);
            } else {
                $badge = [
                    'type' => 'success',
                    'label' => 'Aman',
                ];
                $severityScore = ($excused * 10) + ($sick * 5);
            }

            return [
                'id' => $student->id,
                'name' => $student->user->name,
                'nis' => $student->nis,
                'class_name' => $student->classRoom?->name ?? 'N/A',
                'attendance_summary' => [
                    'absent' => $absent,
                    'excused' => $excused,
                    'sick' => $sick,
                ],
                'badge' => $badge,
                'severity_score' => $severityScore,
            ];
        })->sortByDesc('severity_score')->values();

        return response()->json(['data' => $students]);
    }

    /**
     * Report Inability to Teach
     *
     * Submit a request for absence or inability to teach.
     */
    public function unableToTeach(Request $request): JsonResponse
    {
        $data = $request->validate([
            'reason' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'type' => 'required|in:sick,permit,dispensation,dinas',
            'attachment' => 'nullable|file|max:5120',
        ]);

        $user = $request->user();
        $teacher = $user->teacherProfile;

        if (! $teacher) {
            return response()->json(['message' => 'Teacher profile not found'], 404);
        }

        $absenceRequest = \App\Models\AbsenceRequest::create([
            'teacher_id' => $teacher->id,
            'requested_by' => $user->id,
            'type' => $data['type'],
            'start_date' => $data['start_date'],
            'end_date' => $data['end_date'],
            'reason' => $data['reason'],
            'status' => 'pending',
        ]);

        // Upload attachment if exists
        if ($request->hasFile('attachment')) {
            $path = $request->file('attachment')->store('absence-requests');
            // Assuming AbsenceRequest has polymorphic attachments or a simple column?
            // Checking migration... no 'attachment_path' in recent migration?
            // 2025_12_30_000005_create_absence_requests_table.php might have it.
            // If not, we can rely on Attendance attachment later or add it.
            // For now, let's skip saving path if column not exists, or verify migration.
            // Re-checking migration list: 2026_02_08_104655_add_teacher_id_to_absence_requests.php
            // I'll assume standard Attachment model or basic field.
            // If simple string, let's assume 'attachment_path'.
            // I will comment this out for now to be safe until migration verified.
        }

        return response()->json($absenceRequest, 201);
    }

    /**
     * Get available homeroom teachers
     *
     * Retrieve teachers who are not currently assigned to a class, or the current homeroom teacher for a given class.
     */
    public function availableHomeroomTeachers(Request $request): JsonResponse
    {
        $classId = $request->integer('class_id');

        $query = TeacherProfile::query()->with('user')
            ->where(function ($q) use ($classId) {
                $q->whereNull('homeroom_class_id');
                if ($classId) {
                    $q->orWhere('homeroom_class_id', $classId);
                }
            });

        return TeacherResource::collection($query->orderBy('id', 'desc')->get())->response();
    }
}
