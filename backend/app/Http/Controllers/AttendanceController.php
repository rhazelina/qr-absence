<?php

namespace App\Http\Controllers;

use App\Enums\AttendanceStatus;
use App\Models\Attendance;
use App\Models\Classes;
use App\Models\ScheduleItem;
use App\Models\StudentProfile;
use App\Models\TeacherProfile;
use App\Services\AttendanceService;
use App\Services\WhatsAppService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AttendanceController extends Controller
{
    protected WhatsAppService $whatsapp;

    protected AttendanceService $service;

    public function __construct(WhatsAppService $whatsapp, AttendanceService $service)
    {
        $this->whatsapp = $whatsapp;
        $this->service = $service;
    }

    /**
     * Scan QR Code (Self)
     *
     * Record attendance by scanning a valid QR code.
     * Accessible by both Student and Teacher.
     */
    public function scan(Request $request): JsonResponse
    {
        $data = $request->validate([
            'token' => ['required', 'string', 'exists:qrcodes,token'],
            'device_id' => ['nullable', 'integer'],
            'lat' => ['nullable', 'numeric'],
            'long' => ['nullable', 'numeric'],
        ]);

        try {
            $result = $this->service->scan($data, $request->user());

            if (isset($result['status']) && $result['status'] === 'existing') {
                return response()->json([
                    'message' => $result['message'],
                    'attendance' => new \App\Http\Resources\AttendanceResource($result['attendance']),
                ]);
            }

            return response()->json(new \App\Http\Resources\AttendanceResource($result['attendance']));
        } catch (\Exception $e) {
            $code = $e->getCode();

            return response()->json(['message' => $e->getMessage()], $code >= 100 && $code < 600 ? $code : 500);
        }
    }

    /**
     * Scan Student QR Code (Teacher)
     *
     * Record attendance for a student by scanning their QR code (NISN).
     * Accessible only by Teachers.
     */
    public function scanStudent(Request $request): JsonResponse
    {
        $data = $request->validate([
            'token' => ['required', 'string'], // Accept 'token' as per frontend, but treat as NISN
            'device_id' => ['nullable', 'integer'],
        ]);

        try {
            $result = $this->service->scanStudent($data['token'], $request->user(), $data['device_id'] ?? null);

            $response = [
                'message' => $result['message'],
                'status' => $result['attendance_status'],
                'student' => $result['student'],
            ];

            return response()->json($response);

        } catch (\Exception $e) {
            $code = $e->getCode();

            return response()->json(['message' => $e->getMessage()], $code >= 100 && $code < 600 ? $code : 500);
        }
    }

    /**
     * Manual Attendance Input
     *
     * Manually record attendance for a student.
     * Accessible by Teachers (for their class/schedule).
     */
    public function storeManual(Request $request): JsonResponse
    {
        $data = $request->validate([
            'attendee_type' => ['required', 'in:student'],
            'student_id' => ['required', 'exists:student_profiles,id'],
            'schedule_id' => ['required', 'exists:schedule_items,id'],
            'status' => ['required', 'string'], // Validation typically string, logic handles Enum/Normalization
            'date' => ['required', 'date'],
            'reason' => ['nullable', 'string'],
        ]);

        try {
            $attendance = $this->service->storeManual($data, $request->user());

            return response()->json([
                'message' => 'Kehadiran berhasil disimpan',
                'attendance' => $attendance,
            ]);
        } catch (\Exception $e) {
            $code = $e->getCode();

            return response()->json(['message' => $e->getMessage()], $code >= 100 && $code < 600 ? $code : 500);
        }
    }

    /**
     * Close Attendance Session
     *
     * Close the attendance for a schedule, marking all unscanned students as absent (Alpha).
     */
    public function close(Request $request, ScheduleItem $schedule): JsonResponse
    {
        try {
            $result = $this->service->close($schedule, $request->user());

            return response()->json([
                'message' => "Absensi ditutup. {$result['absent_count']} siswa ditandai Alpha, {$result['on_leave_count']} siswa izin/sakit.",
                'absent_count' => $result['absent_count'],
                'on_leave_count' => $result['on_leave_count'],
            ]);
        } catch (\Exception $e) {
            $code = $e->getCode();

            return response()->json(['message' => $e->getMessage()], $code >= 100 && $code < 600 ? $code : 500);
        }
    }

    /**
     * Get My Attendance History
     *
     * Retrieve attendance history for the currently authenticated student.
     */
    public function summary(Request $request)
    {
        $user = $request->user();

        // Ensure user is a student
        if ($user->user_type !== 'student') { // Changed from $user->role to $user->user_type
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $student = $user->studentProfile; // Changed from $user->student to $user->studentProfile
        if (! $student) {
            return response()->json(['message' => 'Student profile not found'], 404);
        }

        // Monthly Trend (Current Year)
        $currentYear = date('Y');
        $monthlyTrend = Attendance::where('student_id', $student->id)
            ->whereYear('date', $currentYear)
            ->selectRaw('MONTH(date) as month, status, count(*) as count')
            ->groupBy('month', 'status')
            ->get();

        // format monthly trend for frontend
        $months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        $formattedMonthly = [];
        for ($i = 1; $i <= 12; $i++) {
            $monthData = [
                'month' => $months[$i - 1],
                'hadir' => 0,
                'izin' => 0,
                'sakit' => 0,
                'alpha' => 0,
                'pulang' => 0,
            ];

            foreach ($monthlyTrend as $trend) {
                if ($trend->month == $i) {
                    $status = $this->mapStatusToFrontend($trend->status);
                    if (isset($monthData[$status])) {
                        $monthData[$status] += $trend->count;
                    }
                }
            }
            $formattedMonthly[] = $monthData;
        }

        // Weekly Stats (Current Week)
        $startOfWeek = now()->startOfWeek()->format('Y-m-d');
        $endOfWeek = now()->endOfWeek()->format('Y-m-d');

        $weeklyStatsRaw = Attendance::where('student_id', $student->id)
            ->whereBetween('date', [$startOfWeek, $endOfWeek])
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->get();

        $weeklyStats = [
            'hadir' => 0,
            'izin' => 0,
            'sakit' => 0,
            'alpha' => 0,
            'pulang' => 0,
        ];

        foreach ($weeklyStatsRaw as $stat) {
            $status = $this->mapStatusToFrontend($stat->status);
            if (isset($weeklyStats[$status])) {
                $weeklyStats[$status] += $stat->count;
            }
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'monthly_trend' => $formattedMonthly,
                'weekly_stats' => $weeklyStats,
            ],
        ]);
    }

    private function mapStatusToFrontend($status)
    {
        return Attendance::mapStatusToFrontend($status);
    }

    /**
     * Get My Attendance History
     *
     * Retrieve attendance history for the currently authenticated student.
     */
    public function me(Request $request): JsonResponse
    {
        if ($request->user()->user_type !== 'student' || ! $request->user()->studentProfile) {
            abort(403, 'Hanya untuk siswa');
        }

        $query = Attendance::query()
            ->with(['schedule.teacher.user:id,name', 'schedule.dailySchedule.classSchedule.class:id,name', 'attachments'])
            ->where('student_id', $request->user()->studentProfile->id);

        if ($request->filled('from')) {
            $query->whereDate('date', '>=', $request->date('from'));
        }

        if ($request->filled('to')) {
            $query->whereDate('date', '<=', $request->date('to'));
        }

        if ($request->filled('status')) {
            $request->validate([
                'status' => ['in:present,late,excused,sick,absent,dinas,izin,return'],
            ]);
            $query->where('status', $request->string('status'));
        }

        $attendances = $query->latest('date')->paginate();

        return \App\Http\Resources\AttendanceResource::collection($attendances)->response();
    }

    /**
     * Get My Attendance Summary
     *
     * Retrieve a statistical summary of attendance for the currently authenticated student.
     */
    public function summaryMe(Request $request): JsonResponse
    {
        if ($request->user()->user_type !== 'student' || ! $request->user()->studentProfile) {
            abort(403, 'Hanya untuk siswa');
        }

        $request->validate([
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date'],
        ]);

        $studentId = $request->user()->studentProfile->id;

        $baseQuery = Attendance::query()->where('student_id', $studentId);

        if ($request->filled('from')) {
            $baseQuery->whereDate('date', '>=', $request->date('from'));
        }

        if ($request->filled('to')) {
            $baseQuery->whereDate('date', '<=', $request->date('to'));
        }

        $statusSummary = (clone $baseQuery)
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->get();

        $dailySummary = (clone $baseQuery)
            ->selectRaw('DATE(date) as day, status, count(*) as total')
            ->groupBy('day', 'status')
            ->orderBy('day')
            ->get();

        return response()->json([
            'status_summary' => $statusSummary,
            'daily_summary' => $dailySummary,
        ]);
    }

    /**
     * Get My Teaching Attendance
     *
     * Retrieve attendance/teaching history for the currently authenticated teacher.
     */
    public function meTeaching(Request $request): JsonResponse
    {
        if ($request->user()->user_type !== 'teacher' || ! $request->user()->teacherProfile) {
            abort(403, 'Hanya untuk guru');
        }

        $request->validate([
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date'],
            'status' => ['nullable', 'in:present,late,excused,sick,absent,dinas,izin,return'],
        ]);

        $teacherId = $request->user()->teacherProfile->id;

        $query = Attendance::query()
            ->with(['schedule.dailySchedule.classSchedule.class:id,name', 'schedule.teacher.user:id,name', 'attachments'])
            ->where('attendee_type', 'teacher')
            ->where('teacher_id', $teacherId);

        if ($request->filled('from')) {
            $query->whereDate('date', '>=', $request->date('from'));
        }

        if ($request->filled('to')) {
            $query->whereDate('date', '<=', $request->date('to'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        return \App\Http\Resources\AttendanceResource::collection($query->latest('date')->paginate())->response();
    }

    /**
     * Get My Teaching Summary
     *
     * Retrieve a statistical summary of teaching activities for the currently authenticated teacher.
     */
    public function summaryTeaching(Request $request): JsonResponse
    {
        if ($request->user()->user_type !== 'teacher' || ! $request->user()->teacherProfile) {
            abort(403, 'Hanya untuk guru');
        }

        $request->validate([
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date'],
        ]);

        $teacherId = $request->user()->teacherProfile->id;

        $query = Attendance::query()
            ->where('attendee_type', 'teacher')
            ->where('teacher_id', $teacherId);

        if ($request->filled('from')) {
            $query->whereDate('date', '>=', $request->date('from'));
        }

        if ($request->filled('to')) {
            $query->whereDate('date', '<=', $request->date('to'));
        }

        $statusSummary = (clone $query)
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->get();

        return response()->json([
            'status_summary' => $statusSummary,
            'total_sessions' => $query->count(),
        ]);
    }

    /**
     * Get Taught Students Attendance Summary
     *
     * Retrieve attendance summary for students taught by the currently authenticated teacher.
     * Useful for identifying students with high absence rates.
     */
    public function studentsAttendanceSummary(Request $request): JsonResponse
    {
        if ($request->user()->user_type !== 'teacher' || ! $request->user()->teacherProfile) {
            abort(403, 'Hanya untuk guru');
        }

        $request->validate([
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date'],
            'threshold' => ['nullable', 'integer', 'min:1'],
        ]);

        $teacherId = $request->user()->teacherProfile->id;

        $query = Attendance::query()
            ->with(['student.user', 'schedule.dailySchedule.classSchedule.class'])
            ->where('attendee_type', 'student')
            ->whereHas('schedule', function ($q) use ($teacherId): void {
                $q->where('teacher_id', $teacherId);
            });

        if ($request->filled('from')) {
            $query->whereDate('date', '>=', $request->date('from'));
        }

        if ($request->filled('to')) {
            $query->whereDate('date', '<=', $request->date('to'));
        }

        $perPage = $this->resolvePerPage($request);
        $studentIds = [];
        if ($perPage) {
            $studentIdsPage = (clone $query)
                ->select('student_id')
                ->distinct()
                ->orderBy('student_id')
                ->paginate($perPage);

            $studentIds = $studentIdsPage->getCollection()->pluck('student_id')->all();

            $raw = (clone $query)
                ->whereIn('student_id', $studentIds)
                ->selectRaw('student_id, status, count(*) as total')
                ->groupBy('student_id', 'status')
                ->get();
        } else {
            $raw = (clone $query)
                ->selectRaw('student_id, status, count(*) as total')
                ->groupBy('student_id', 'status')
                ->get();
        }

        $grouped = $raw->groupBy('student_id')->map(function ($rows): array {
            $totals = $rows->pluck('total', 'status')->all();

            return [
                'student_id' => $rows->first()->student_id,
                'totals' => $totals,
            ];
        })->values();

        if ($request->filled('threshold')) {
            $threshold = $request->integer('threshold');
            $grouped = $grouped->filter(function (array $item) use ($threshold): bool {
                foreach ($item['totals'] as $count) {
                    if ($count >= $threshold) {
                        return true;
                    }
                }

                return false;
            })->values();
        }

        if (! $perPage) {
            $studentIds = $grouped->pluck('student_id')->all();
        }

        $students = StudentProfile::query()
            ->with('user')
            ->whereIn('id', $studentIds)
            ->get()
            ->keyBy('id');

        $response = $grouped->map(function (array $item) use ($students): array {
            return [
                'student' => $students->get($item['student_id']),
                'totals' => $item['totals'],
            ];
        });

        if ($perPage) {
            $studentIdsPage->setCollection($response->values());

            return response()->json($studentIdsPage);
        }

        return response()->json($response);
    }

    /**
     * Get Class Attendance by Date
     *
     * Retrieve attendance records for a specific class on a specific date.
     * Accessible by Homeroom Teacher and Admin.
     */
    public function classAttendanceByDate(Request $request, Classes $class): JsonResponse
    {
        $user = $request->user();
        if ($user->user_type !== 'teacher' && $user->user_type !== 'admin') {
            abort(403, 'Unauthorized');
        }

        if ($user->user_type === 'teacher' && optional($class->homeroomTeacher)->id !== $user->teacherProfile?->id) {
            abort(403, 'Hanya wali kelas yang boleh melihat data ini');
        }

        $request->validate([
            'date' => ['required', 'date'],
        ]);

        $date = Carbon::parse($request->string('date'));
        $day = $date->format('l');

        $items = ScheduleItem::query()
            ->with(['teacher.user:id,name', 'subject'])
            ->whereHas('dailySchedule', function ($q) use ($day, $class) {
                $q->where('day', $day)
                    ->whereHas('classSchedule', function ($cq) use ($class) {
                        $cq->where('class_id', $class->id);
                    });
            })
            ->orderBy('start_time')
            ->get();

        $scheduleIds = $items->pluck('id')->all();

        $attendances = Attendance::query()
            ->with(['student.user', 'schedule'])
            ->whereIn('schedule_id', $scheduleIds)
            ->whereDate('date', $date->toDateString())
            ->get()
            ->groupBy('schedule_id');

        $resultItems = $items->map(function (ScheduleItem $schedule) use ($attendances): array {
            return [
                'schedule' => $schedule,
                'attendances' => $attendances->get($schedule->id, collect())->values(),
            ];
        });

        return response()->json([
            'class' => $class,
            'date' => $date->toDateString(),
            'day' => $day,
            'items' => $resultItems,
        ]);
    }

    /**
     * Get Class Students Summary
     *
     * Retrieve attendance summary for all students in a class.
     * Accessible by Homeroom Teacher.
     */
    public function classStudentsSummary(Request $request, Classes $class): JsonResponse
    {
        if ($request->user()->user_type !== 'teacher' || ! $request->user()->teacherProfile) {
            abort(403, 'Hanya untuk guru');
        }

        if (optional($class->homeroomTeacher)->id !== $request->user()->teacherProfile->id) {
            abort(403, 'Hanya wali kelas yang boleh melihat data ini');
        }

        return $this->calculateClassSummary($request, $class);
    }

    /**
     * Get Class Summary (Waka)
     *
     * Retrieve attendance summary for a class.
     * Accessible by Waka Kesiswaan/Kurikulum.
     */
    public function wakaClassSummary(Request $request, Classes $class): JsonResponse
    {
        return $this->calculateClassSummary($request, $class);
    }

    private function calculateClassSummary(Request $request, Classes $class): JsonResponse
    {
        $request->validate([
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date'],
            'threshold' => ['nullable', 'integer', 'min:1'],
        ]);

        // 1. Get students for the class (all of them)
        // Join with users to sort by name
        $query = $class->students()
            ->join('users', 'student_profiles.user_id', '=', 'users.id')
            ->select('student_profiles.*')
            ->with('user')
            ->orderBy('users.name');

        $perPage = $this->resolvePerPage($request);

        if ($perPage) {
            $students = $query->paginate($perPage);
            $studentCollection = $students->getCollection();
        } else {
            $studentCollection = $query->get();
            $students = null;
        }

        $studentIds = $studentCollection->pluck('id')->all();

        if (empty($studentIds)) {
            return $perPage ? response()->json($students) : response()->json([]);
        }

        // 2. Get attendance summaries for these students
        $attendancesQuery = Attendance::query()
            ->where('attendee_type', 'student')
            ->whereIn('student_id', $studentIds)
            ->whereHas('schedule', function ($q) use ($class): void {
                $q->where('class_id', $class->id);
            });

        if ($request->filled('from')) {
            $attendancesQuery->whereDate('date', '>=', $request->date('from'));
        }

        if ($request->filled('to')) {
            $attendancesQuery->whereDate('date', '<=', $request->date('to'));
        }

        $stats = $attendancesQuery
            ->selectRaw('student_id, status, count(*) as total')
            ->groupBy('student_id', 'status')
            ->get()
            ->groupBy('student_id');

        // 3. Map to result
        $result = $studentCollection->map(function ($student) use ($stats) {
            $studentStats = $stats->get($student->id, collect());
            $totals = $studentStats->pluck('total', 'status')->all();

            return [
                'student' => $student,
                'totals' => $totals ?: (object) [],
            ];
        });

        // 4. Apply threshold filter if needed (post-query)
        // Note: Filtering after pagination might result in fewer items per page.
        // If strict pagination is needed with threshold, we would need a more complex query.
        // For now, we apply filter on the current page/collection.
        if ($request->filled('threshold')) {
            $threshold = $request->integer('threshold');
            $result = $result->filter(function (array $item) use ($threshold): bool {
                foreach ($item['totals'] as $count) {
                    if ($count >= $threshold) {
                        return true;
                    }
                }

                return false;
            })->values();
        }

        if ($perPage) {
            $students->setCollection($result);

            return response()->json($students);
        }

        return response()->json($result);
    }

    public function classStudentsAbsences(Request $request, Classes $class): JsonResponse
    {
        if ($request->user()->user_type !== 'teacher' || ! $request->user()->teacherProfile) {
            abort(403, 'Hanya untuk guru');
        }

        if (optional($class->homeroomTeacher)->id !== $request->user()->teacherProfile->id) {
            abort(403, 'Hanya wali kelas yang boleh melihat data ini');
        }

        $request->validate([
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date'],
            'status' => ['nullable', 'in:present,late,excused,sick,absent,dinas,izin,return'],
        ]);

        $query = Attendance::query()
            ->with(['student.user:id,name', 'schedule:id,title,subject_name', 'attachments'])
            ->where('attendee_type', 'student')
            ->whereHas('schedule', function ($q) use ($class): void {
                $q->where('class_id', $class->id);
            });

        if ($request->filled('from')) {
            $query->whereDate('date', '>=', $request->date('from'));
        }

        if ($request->filled('to')) {
            $query->whereDate('date', '<=', $request->date('to'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        } else {
            $query->where('status', '!=', AttendanceStatus::PRESENT->value);
        }

        $perPage = $this->resolvePerPage($request);
        $studentIdsPage = (clone $query)
            ->select('student_id')
            ->distinct()
            ->orderBy('student_id')
            ->paginate($perPage);

        $studentIds = $studentIdsPage->getCollection()->pluck('student_id')->all();

        $items = $query
            ->whereIn('student_id', $studentIds)
            ->orderBy('date')
            ->get()
            ->groupBy('student_id');

        $response = collect($studentIds)->map(function ($studentId) use ($items): array {
            $rows = $items->get($studentId, collect());
            $student = optional($rows->first())->student;

            return [
                'student' => $student ? $student->loadMissing('user') : null,
                'items' => $rows->values(),
            ];
        });

        $studentIdsPage->setCollection($response);

        return response()->json($studentIdsPage);
    }

    public function teachersDailyAttendance(Request $request): JsonResponse
    {
        $request->validate([
            'date' => ['required', 'date'],
        ]);

        $date = Carbon::parse($request->string('date'))->toDateString();

        $perPage = $this->resolvePerPage($request);
        $teachersQuery = TeacherProfile::query()
            ->with('user')
            ->orderBy('id');

        // Enforce pagination if per_page is not set to prevent loading all teachers
        $perPage = $perPage ?: 100;

        $teachers = $teachersQuery->paginate($perPage);

        $teacherIds = $teachers->getCollection()->pluck('id')->all();

        $attendanceByTeacher = Attendance::query()
            ->where('attendee_type', 'teacher')
            ->whereDate('date', $date)
            ->whereIn('teacher_id', $teacherIds)
            ->with('schedule')
            ->orderByDesc('checked_in_at')
            ->get()
            ->groupBy('teacher_id');

        $items = $teachers->getCollection()->map(function (TeacherProfile $teacher) use ($attendanceByTeacher): array {
            $attendances = $attendanceByTeacher->get($teacher->id) ?? collect([]);
            // Eager load schedule if possible. But here we already fetched it?
            // No, the query above didn't eager load schedule.
            // We should update the query above to ->with('schedule').

            return [
                'teacher' => $teacher,
                'attendances' => $attendances,
                'status' => $attendances->isNotEmpty() ? $attendances->first()->status : 'absent', // Fallback status
            ];
        });

        $teachers->setCollection($items);

        return response()->json([
            'date' => $date,
            'items' => $teachers,
        ]);
    }

    public function manual(\App\Http\Requests\StoreManualAttendanceRequest $request): JsonResponse
    {
        // Data already validated and normalized in Form Request
        $dto = \App\Data\ManualAttendanceData::fromRequest($request);
        $user = $request->user();

        // Authorization Check
        $user = $request->user();
        if ($user->user_type === 'teacher') {
            $schedule = ScheduleItem::find($dto->schedule_id);
            if (! $schedule || $schedule->teacher_id !== $user->teacherProfile->id) {
                // Allow if homeroom teacher?
                $student = StudentProfile::find($dto->student_id);
                $homeroomId = $user->teacherProfile->homeroom_class_id;
                if (! $student || $student->class_id !== $homeroomId) {
                    abort(403, 'Anda tidak memiliki akses untuk mengubah absensi ini.');
                }
            }
        }

        if ($dto->attendee_type === 'student' && empty($dto->student_id)) {
            abort(422, 'student_id wajib untuk attendee_type student');
        }

        if ($dto->attendee_type === 'teacher' && empty($dto->teacher_id)) {
            abort(422, 'teacher_id wajib untuk attendee_type teacher');
        }

        $attributes = [
            'attendee_type' => $dto->attendee_type,
            'schedule_id' => $dto->schedule_id,
            'student_id' => $dto->student_id ?? null,
            'teacher_id' => $dto->teacher_id ?? null,
        ];

        $existing = Attendance::where($attributes)->first();

        if ($existing) {
            abort(409, 'Presensi siswa ini sudah tercatat untuk sesi ini.');
        }

        $attendance = Attendance::create([
            ...$attributes,
            'date' => $dto->date,
            'status' => $dto->status,
            'reason' => $dto->reason ?? null,
            'checked_in_at' => $dto->date,
            'source' => 'manual',
        ]);

        return response()->json([
            'message' => 'Kehadiran berhasil disimpan',
            'attendance' => new \App\Http\Resources\AttendanceResource($attendance->load(['student.user', 'teacher.user', 'schedule.dailySchedule.classSchedule.class'])),
        ], 201);
    }

    public function teacherAttendanceHistory(Request $request, TeacherProfile $teacher): JsonResponse
    {
        $request->validate([
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date'],
        ]);

        $query = Attendance::query()
            ->where('attendee_type', 'teacher')
            ->where('teacher_id', $teacher->id);

        if ($request->filled('from')) {
            $query->whereDate('date', '>=', $request->date('from'));
        }

        if ($request->filled('to')) {
            $query->whereDate('date', '<=', $request->date('to'));
        }

        $history = $query->with(['schedule.subject', 'schedule.dailySchedule.classSchedule.class'])
            ->orderByDesc('date')
            ->get();

        return response()->json([
            'teacher' => $teacher->load('user'),
            'history' => $history,
        ]);
    }

    public function wakaSummary(Request $request): JsonResponse
    {
        $request->validate([
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date'],
        ]);

        $query = Attendance::query()->where('attendee_type', 'student');

        if ($request->filled('from')) {
            $query->whereDate('date', '>=', $request->date('from'));
        }

        if ($request->filled('to')) {
            $query->whereDate('date', '<=', $request->date('to'));
        }

        $statusSummary = (clone $query)
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->get();

        $classSummary = (clone $query)
            ->selectRaw('class_schedules.class_id as class_id, attendances.status, count(*) as total')
            ->join('schedule_items', 'attendances.schedule_id', '=', 'schedule_items.id')
            ->join('daily_schedules', 'schedule_items.daily_schedule_id', '=', 'daily_schedules.id')
            ->join('class_schedules', 'daily_schedules.class_schedule_id', '=', 'class_schedules.id')
            ->groupBy('class_schedules.class_id', 'attendances.status')
            ->get()
            ->groupBy('class_id')
            ->map(function ($rows) {
                return $rows->pluck('total', 'status')->all();
            });

        $studentSummary = (clone $query)
            ->selectRaw('student_id, status, count(*) as total')
            ->groupBy('student_id', 'status')
            ->get()
            ->groupBy('student_id')
            ->map(function ($rows) {
                return $rows->pluck('total', 'status')->all();
            });

        return response()->json([
            'status_summary' => $statusSummary,
            'class_summary' => $classSummary,
            'student_summary' => $studentSummary,
        ]);
    }

    public function studentsAbsences(Request $request): JsonResponse
    {
        $request->validate([
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date'],
            'status' => ['nullable', 'in:present,late,excused,sick,absent,dinas,izin,return'],
            'class_id' => ['nullable', 'exists:classes,id'],
        ]);

        // 1. Build Query for Students with aggregated absence count
        $studentQuery = StudentProfile::query()
            ->with(['user']);

        if ($request->filled('class_id')) {
            $studentQuery->where('class_id', $request->integer('class_id'));
        }

        // Apply filter logic to the count
        $studentQuery->withCount(['attendances' => function ($q) use ($request) {
            $q->where('attendee_type', 'student');

            if ($request->filled('from')) {
                $q->whereDate('date', '>=', $request->date('from'));
            }
            if ($request->filled('to')) {
                $q->whereDate('date', '<=', $request->date('to'));
            }
            if ($request->filled('status')) {
                $q->where('status', $request->string('status'));
            } else {
                $q->where('status', '!=', 'present');
            }

            if ($request->filled('class_id')) {
                $q->whereHas('schedule.dailySchedule.classSchedule', function ($sq) use ($request) {
                    $sq->where('class_id', $request->integer('class_id'));
                });
            }
        }]);

        // Sort by absences count descending (using database index if possible)
        $studentQuery->orderBy('attendances_count', 'desc');

        // Paginate students
        $perPage = $this->resolvePerPage($request) ?? 15;
        $students = $studentQuery->paginate($perPage);
        $studentIds = $students->pluck('id')->all();

        // 2. Fetch detailed attendance records for these students only
        $attendanceQuery = Attendance::query()
            ->with(['schedule.dailySchedule.classSchedule.class', 'student.user'])
            ->whereIn('student_id', $studentIds)
            ->where('attendee_type', 'student');

        if ($request->filled('from')) {
            $attendanceQuery->whereDate('date', '>=', $request->date('from'));
        }
        if ($request->filled('to')) {
            $attendanceQuery->whereDate('date', '<=', $request->date('to'));
        }
        if ($request->filled('status')) {
            $attendanceQuery->where('status', $request->string('status'));
        } else {
            $attendanceQuery->where('status', '!=', 'present');
        }
        if ($request->filled('class_id')) {
            $attendanceQuery->whereHas('schedule.dailySchedule.classSchedule', fn ($q) => $q->where('class_id', $request->integer('class_id')));
        }

        $attendances = $attendanceQuery->orderBy('date')->get()->groupBy('student_id');

        // 3. Map students to response format
        $items = $students->getCollection()->map(function ($student) use ($attendances) {
            return [
                'student' => $student->loadMissing('user'),
                'items' => $attendances->get($student->id, collect())->values(),
                'total_absences' => $student->attendances_count, // Bonus info
            ];
        });

        $students->setCollection($items);

        return response()->json($students);
    }

    public function recap(Request $request): JsonResponse
    {
        $request->validate([
            'month' => ['required', 'date_format:Y-m'],
        ]);

        $start = \Illuminate\Support\Carbon::createFromFormat('Y-m', $request->string('month'))->startOfMonth();
        $end = $start->copy()->endOfMonth();

        $summary = Attendance::selectRaw('attendee_type, status, count(*) as total')
            ->whereBetween('date', [$start, $end])
            ->groupBy('attendee_type', 'status')
            ->get();

        return response()->json($summary);
    }

    public function summaryBySchedule(Request $request, ScheduleItem $schedule): JsonResponse
    {
        $this->authorizeSchedule($request, $schedule);

        $data = Attendance::selectRaw('status, count(*) as total')
            ->where('schedule_id', $schedule->id)
            ->groupBy('status')
            ->get();

        return response()->json($data);
    }

    public function summaryByClass(Request $request, \App\Models\Classes $class): JsonResponse
    {
        if ($request->user()->user_type === 'teacher') {
            $teacherId = optional($request->user()->teacherProfile)->id;
            $ownsSchedules = $class->schedules()->where('teacher_id', $teacherId)->exists();
            $isHomeroom = optional($class->homeroomTeacher)->id === $teacherId;
            if (! $ownsSchedules && ! $isHomeroom) {
                abort(403, 'Tidak boleh melihat rekap kelas ini');
            }
        }

        $data = Attendance::selectRaw('status, count(*) as total')
            ->whereHas('schedule', fn ($q) => $q->where('class_id', $class->id))
            ->groupBy('status')
            ->get();

        return response()->json($data);
    }

    public function attach(Request $request, Attendance $attendance): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'max:5120'],
        ]);

        $file = $request->file('file');
        $path = $this->storeAttachment($file);

        $attachment = $attendance->attachments()->create([
            'path' => $path,
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
        ]);

        return response()->json([
            'attachment' => $attachment,
            'url' => $this->signedUrl($attachment->path),
        ], 201);
    }

    public function getDocument(Request $request, Attendance $attendance): JsonResponse
    {
        $user = $request->user();

        // 🛡️ IDOR Protection
        $isAuthorized = false;

        if ($user->user_type === 'admin') {
            $isAuthorized = true;
        } elseif ($user->user_type === 'teacher') {
            $teacherProfile = $user->teacherProfile;
            if ($teacherProfile) {
                // Authorized if they are the teacher for the schedule OR if they are the homeroom teacher for the student
                $isAuthorized = ($attendance->schedule && $attendance->schedule->teacher_id == $teacherProfile->id) ||
                                ($attendance->student && $attendance->student->class_id == $teacherProfile->homeroom_class_id);

                // Also allow if it's the teacher's OWN attendance record
                if ($attendance->attendee_type === 'teacher' && $attendance->teacher_id == $teacherProfile->id) {
                    $isAuthorized = true;
                }
            }
        } elseif ($user->user_type === 'student') {
            // Authorized only if it's their own attendance
            $isAuthorized = ($attendance->student_id == $user->studentProfile?->id);
        }

        if (! $isAuthorized) {
            abort(403, 'Unauthorized access to document');
        }

        $attachment = $attendance->attachments()->latest()->first();

        if (! $attachment) {
            return response()->json(['message' => 'Document not found'], 404);
        }

        return response()->json([
            'id' => $attachment->id,
            'url' => $this->signedUrl($attachment->path),
            'mime_type' => $attachment->mime_type,
            'original_name' => $attachment->original_name,
        ]);
    }

    public function proxyDocument(Request $request, string $path): \Symfony\Component\HttpFoundation\BinaryFileResponse
    {
        $attachment = \App\Models\AttendanceAttachment::where('path', $path)->firstOrFail();
        $attendance = $attachment->attendance;
        $user = $request->user();

        // 🛡️ IDOR Protection (Same logic as getDocument)
        $isAuthorized = false;
        if ($user->user_type === 'admin') {
            $isAuthorized = true;
        } elseif ($user->user_type === 'teacher') {
            $teacherProfile = $user->teacherProfile;
            if ($teacherProfile) {
                // Authorized if they are the teacher for the schedule OR if they are the homeroom teacher for the student
                $isAuthorized = ($attendance->schedule && $attendance->schedule->teacher_id == $teacherProfile->id) ||
                                ($attendance->student && $attendance->student->class_id == $teacherProfile->homeroom_class_id);

                // Also allow if it's the teacher's OWN attendance record
                if ($attendance->attendee_type === 'teacher' && $attendance->teacher_id == $teacherProfile->id) {
                    $isAuthorized = true;
                }
            }
        } elseif ($user->user_type === 'student') {
            // Authorized only if it's their own attendance
            $isAuthorized = ($attendance->student_id == $user->studentProfile?->id);
        }

        if (! $isAuthorized) {
            abort(403, 'Unauthorized access to document');
        }

        if (! Storage::exists($path)) {
            abort(404);
        }

        return response()->file(Storage::path($path));
    }

    protected function storeAttachment(UploadedFile $file): string
    {
        return $file->store('attendance-attachments');
    }

    public function void(Request $request, Attendance $attendance): JsonResponse
    {
        $this->authorizeSchedule($request, $attendance->schedule);

        try {
            $attendance->delete();
            return response()->json(['message' => 'Scan dibatalkan']);
        } catch (\Illuminate\Database\QueryException $e) {
            if ($e->errorInfo[1] == 1451 || $e->getCode() == 23000) {
                return response()->json(['message' => 'Data tidak dapat dihapus karena masih terelasi dengan data lain'], 409);
            }
            throw $e;
        }
    }

    protected function signedUrl(string $path): string
    {
        try {
            // Check if disk supports temporary URLs (usually S3)
            return Storage::temporaryUrl($path, now()->addMinutes(10));
        } catch (\Throwable $e) {
            // Fallback to a secured API proxy route instead of a public URL
            // This ensures IDOR protection even if temporary URLs aren't supported
            return route('attendance.document.proxy', ['path' => $path]);
        }
    }

    protected function authorizeSchedule(Request $request, ScheduleItem $schedule): void
    {
        $user = $request->user();
        if ($user->user_type === 'teacher') {
            $teacherProfile = $user->teacherProfile;
            $isTeacher = $schedule->teacher_id === $teacherProfile->id;

            // Allow if homeroom teacher of the class
            $classId = $schedule->dailySchedule->classSchedule->class_id;
            $isHomeroom = $teacherProfile->homeroom_class_id === $classId;

            if (! $isTeacher && ! $isHomeroom) {
                abort(403, 'Tidak boleh mengakses jadwal ini');
            }
        }
    }

    public function bySchedule(Request $request, ScheduleItem $schedule): JsonResponse
    {
        if ($request->user()->user_type === 'teacher' && $schedule->teacher_id !== optional($request->user()->teacherProfile)->id) {
            abort(403, 'Tidak boleh melihat presensi jadwal ini');
        }

        $query = Attendance::query()
            ->with(['student.user:id,name', 'teacher.user:id,name', 'attachments'])
            ->where('schedule_id', $schedule->id)
            ->latest('checked_in_at');

        if ($request->filled('date')) {
            $query->whereDate('date', $request->date('date'));
        }

        $perPage = $this->resolvePerPage($request);
        $attendances = $query->paginate($perPage);

        return \App\Http\Resources\AttendanceResource::collection($attendances)->response();
    }

    public function bulkManual(Request $request): JsonResponse
    {
        $data = $request->validate([
            'schedule_id' => ['required', 'exists:schedule_items,id'],
            'date' => ['required', 'date'],
            'items' => ['required', 'array'],
            'items.*.student_id' => ['required', 'exists:student_profiles,id'],
            'items.*.status' => ['required', 'string'],
            'items.*.reason' => ['nullable', 'string'],
        ]);

        $schedule = \App\Models\ScheduleItem::findOrFail($data['schedule_id']);
        $this->authorizeSchedule($request, $schedule);

        $date = $data['date'];
        $results = [];

        DB::transaction(function () use ($data, $date, $schedule, &$results) {
            foreach ($data['items'] as $item) {
                $status = Attendance::normalizeStatus($item['status']);

                $attendance = Attendance::updateOrCreate(
                    [
                        'student_id' => $item['student_id'],
                        'schedule_id' => $schedule->id,
                        'date' => $date,
                    ],
                    [
                        'status' => $status,
                        'attendee_type' => 'student',
                        'checked_in_at' => now(),
                        'source' => 'manual',
                        'reason' => $item['reason'] ?? null,
                    ]
                );
                $results[] = $attendance;
            }
        });

        return response()->json([
            'message' => count($results).' data kehadiran berhasil disimpan',
            'data' => $results,
        ]);
    }

    public function markExcuse(Request $request, Attendance $attendance): JsonResponse
    {
        if ($request->user()->user_type === 'teacher' && $attendance->schedule->teacher_id !== optional($request->user()->teacherProfile)->id) {
            abort(403, 'Tidak boleh mengubah presensi jadwal ini');
        }

        // Input Normalization
        $status = $request->input('status');
        $map = [
            'alpha' => 'absent',
            'tanpa-keterangan' => 'absent',
            'pulang' => 'return',
            'hadir' => 'present',
            'sakit' => 'sick',
            'izin' => 'excused',
            'terlambat' => 'late',
        ];

        if (isset($map[$status])) {
            $request->merge(['status' => $map[$status]]);
        }

        $data = $request->validate([
            'status' => ['required', 'in:present,late,excused,sick,absent,dispensasi,dinas,izin,return'],
            'reason' => ['nullable', 'string'],
        ]);

        $attendance->update([
            'status' => Attendance::normalizeStatus($data['status']),
            'reason' => $data['reason'] ?? null,
            'source' => 'manual',
        ]);

        return response()->json($attendance);
    }

    public function export(Request $request): StreamedResponse
    {
        $request->validate([
            'schedule_id' => ['nullable', 'exists:schedule_items,id'],
            'class_id' => ['nullable', 'exists:classes,id'],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date'],
        ]);

        // Require at least one filter to prevent full-table dump
        if (! $request->filled('schedule_id') && ! $request->filled('class_id') && ! $request->filled('from') && ! $request->filled('to')) {
            abort(422, 'Harap sertakan minimal satu filter: schedule_id, class_id, from, atau to.');
        }

        $query = Attendance::with(['student.user:id,name', 'teacher.user:id,name', 'schedule.class:id,name']);

        if ($request->filled('schedule_id')) {
            $schedule = ScheduleItem::findOrFail($request->integer('schedule_id'));
            if ($request->user()->user_type === 'teacher' && $schedule->teacher_id !== optional($request->user()->teacherProfile)->id) {
                abort(403, 'Tidak boleh mengekspor jadwal ini');
            }
            $query->where('schedule_id', $schedule->id);
        }

        if ($request->filled('class_id')) {
            $query->whereHas('schedule', fn ($q) => $q->where('class_id', $request->integer('class_id')));
        }

        if ($request->filled('from')) {
            $query->whereDate('date', '>=', $request->date('from'));
        }
        if ($request->filled('to')) {
            $query->whereDate('date', '<=', $request->date('to'));
        }

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="attendance_export.csv"',
            'X-Accel-Buffering' => 'no',
        ];

        $callback = function () use ($query): void {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Type', 'Name', 'Status', 'Checked In At', 'Reason', 'Class', 'Schedule']);

            $query->orderBy('checked_in_at')->chunk(200, function ($attendances) use ($handle): void {
                foreach ($attendances as $attendance) {
                    $name = $attendance->attendee_type === 'student'
                        ? optional($attendance->student?->user)->name
                        : optional($attendance->teacher?->user)->name;

                    fputcsv($handle, [
                        $attendance->attendee_type,
                        $name,
                        $attendance->status,
                        optional($attendance->checked_in_at)->toDateTimeString(),
                        $attendance->reason,
                        optional($attendance->schedule?->class)->label,
                        optional($attendance->schedule)->title,
                    ]);
                }
            });

            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function downloadPdf(Request $request)
    {
        $request->validate([
            'class_id' => ['nullable', 'exists:classes,id'],
            'date' => ['nullable', 'date'],
        ]);

        $query = Attendance::with(['student.user', 'schedule.class'])
            ->where('attendee_type', 'student');

        if ($request->filled('class_id')) {
            $query->whereHas('schedule.dailySchedule.classSchedule', fn ($q) => $q->where('class_id', $request->class_id));
        }

        if ($request->filled('date')) {
            $query->whereDate('date', $request->date);
        } else {
            $query->whereDate('date', now());
        }

        $attendances = $query->get();
        $date = $request->date ?? now()->toDateString();

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.attendance_report', compact('attendances', 'date'));

        return $pdf->download('attendance_report.pdf');
    }

    private function resolvePerPage(Request $request): ?int
    {
        if (! $request->filled('per_page') && ! $request->filled('page')) {
            return null;
        }

        $request->validate([
            'per_page' => ['nullable', 'integer', 'min:1', 'max:200'],
        ]);

        $perPage = $request->integer('per_page', 15);

        return min(max($perPage, 1), 200);
    }
}
