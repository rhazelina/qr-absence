<?php

namespace App\Http\Controllers;

use App\Enums\AttendanceStatus;
use App\Http\Requests\FinalizeManualAttendanceRequest;
use App\Http\Requests\UpdateAttendanceExcuseRequest;
use App\Http\Resources\AttendanceResource;
use App\Models\Attendance;
use App\Models\Classes;
use App\Models\ScheduleItem;
use App\Models\StudentProfile;
use App\Models\TeacherProfile;
use App\Services\AttendanceService;
use App\Support\ScheduleDay;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AttendanceController extends Controller
{
    protected AttendanceService $service;

    public function __construct(AttendanceService $service)
    {
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
            'schedule_id' => ['nullable', 'exists:schedule_items,id'],
        ]);

        try {
            $result = $this->service->scanStudent(
                $data['token'],
                $request->user(),
                $data['device_id'] ?? null,
                $data['schedule_id'] ?? null
            );

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
                'attendance' => new \App\Http\Resources\AttendanceResource($attendance->load(['student.user', 'teacher.user', 'schedule.dailySchedule.classSchedule.class'])),
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
        $monthSelect = config('database.default') === 'sqlite' ? 'CAST(strftime("%m", date) AS INTEGER)' : 'MONTH(date)';

        $monthlyTrend = Attendance::where('student_id', $student->id)
            ->whereYear('date', $currentYear)
            ->selectRaw("{$monthSelect} as month, status, count(*) as count")
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

        $this->applyDraftFilters($query, $request);

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
            'months' => ['nullable', 'integer', 'min:1', 'max:24'],
            'group_by' => ['nullable', 'in:day,week,month'],
        ]);

        $studentId = $request->user()->studentProfile->id;
        $months = $request->integer('months', 6);
        $groupBy = $request->string('group_by', 'month')->toString();

        $baseQuery = Attendance::query()->where('student_id', $studentId);
        $this->applyDraftFilters($baseQuery, $request);

        if ($request->filled('from')) {
            $baseQuery->whereDate('date', '>=', $request->date('from'));
        }

        if ($request->filled('to')) {
            $baseQuery->whereDate('date', '<=', $request->date('to'));
        }

        if (! $request->filled('from') && ! $request->filled('to')) {
            $from = now()->subMonths($months - 1)->startOfMonth()->toDateString();
            $baseQuery->whereDate('date', '>=', $from);
        }

        $statusSummary = (clone $baseQuery)
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->get();

        $dateFormat = match ($groupBy) {
            'day' => '%Y-%m-%d',
            'week' => '%x-%v', // ISO Year and Week
            default => '%Y-%m',
        };

        $trendQuery = (clone $baseQuery)
            ->selectRaw("
                DATE_FORMAT(date, '{$dateFormat}') as bucket,
                status,
                SUM(1) as total
            ")
            ->groupBy('bucket', 'status')
            ->orderBy('bucket')
            ->get();

        $trendBuckets = $trendQuery->groupBy('bucket');

        $trend = $trendBuckets->map(function ($rows, $bucketKey) use ($groupBy) {
            $item = [
                'month' => $this->getBucketLabel($bucketKey, $groupBy),
                'hadir' => 0,
                'izin' => 0,
                'sakit' => 0,
                'alpha' => 0,
                'pulang' => 0,
            ];

            foreach ($rows as $row) {
                $frontendStatus = $this->mapStatusToFrontend($row->status);
                if (array_key_exists($frontendStatus, $item)) {
                    $item[$frontendStatus] += (int) $row->total;
                }
            }

            return $item;
        })->values();

        // Hitung weeklyStats dari statusSummary (ringkasan total, bukan per minggu)
        $weeklyStats = [
            'hadir' => 0,
            'izin' => 0,
            'sakit' => 0,
            'alpha' => 0,
            'pulang' => 0,
        ];
        foreach ($statusSummary as $row) {
            $frontendStatus = $this->mapStatusToFrontend($row->status);
            if (array_key_exists($frontendStatus, $weeklyStats)) {
                $weeklyStats[$frontendStatus] += (int) $row->total;
            }
        }

        // daily_summary: rekap per tanggal dalam rentang yang dipilih
        $dailySummary = (clone $baseQuery)
            ->selectRaw('date, status, count(*) as total')
            ->groupBy('date', 'status')
            ->orderBy('date')
            ->get()
            ->groupBy('date')
            ->map(fn ($rows) => $rows->pluck('total', 'status')->all());

        return response()->json([
            'status' => 'success',
            'data' => [
                'trend' => $trend,
                'statistik' => $weeklyStats,
                'group_by' => $groupBy,
                'months' => $months,
            ],
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

        $from = $request->input('from') ?? $request->input('start_date');
        $to = $request->input('to') ?? $request->input('end_date');

        $request->validate([
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date'],
            'status' => ['nullable', 'in:present,late,excused,sick,absent,dinas,izin,return'],
        ]);

        $teacherId = $request->user()->teacherProfile->id;

        $query = Attendance::query()
            ->with([
                'schedule.subject:id,name,code',
                'schedule.dailySchedule.classSchedule.class:id,name',
                'schedule.teacher.user:id,name',
                'attachments',
            ])
            ->where('attendee_type', 'teacher')
            ->where('teacher_id', $teacherId);

        $this->applyDraftFilters($query, $request);

        if ($from) {
            $query->whereDate('date', '>=', Carbon::parse($from)->toDateString());
        }

        if ($to) {
            $query->whereDate('date', '<=', Carbon::parse($to)->toDateString());
        }

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        $teacher = $request->user()->teacherProfile->loadMissing('user:id,name');
        $history = $query->latest('date')->get()->map(function (Attendance $attendance): array {
            $class = $attendance->schedule?->dailySchedule?->classSchedule?->class;
            $reasonFileUrl = null;
            if ($attendance->reason_file) {
                try {
                    $reasonFileUrl = Storage::temporaryUrl($attendance->reason_file, now()->addMinutes(60));
                } catch (\Throwable $e) {
                    $reasonFileUrl = route('attendance.document.proxy', ['path' => $attendance->reason_file]);
                }
            }

            return [
                'id' => $attendance->id,
                'date' => $attendance->date?->format('Y-m-d'),
                'status' => $attendance->status,
                'reason' => $attendance->reason,
                'checked_in_at' => $attendance->checked_in_at?->format('H:i:s'),
                'attendee_type' => $attendance->attendee_type,
                'reason_file_url' => $reasonFileUrl,
                'schedule' => [
                    'id' => $attendance->schedule?->id,
                    'start_time' => $attendance->schedule?->start_time,
                    'end_time' => $attendance->schedule?->end_time,
                    'subject' => $attendance->schedule?->subject ? [
                        'id' => $attendance->schedule->subject->id,
                        'name' => $attendance->schedule->subject->name,
                        'code' => $attendance->schedule->subject->code,
                    ] : null,
                    'daily_schedule' => [
                        'id' => $attendance->schedule?->dailySchedule?->id,
                        'day' => $attendance->schedule?->dailySchedule?->day,
                        'class_schedule' => [
                            'class' => $class ? [
                                'id' => $class->id,
                                'name' => $class->name,
                            ] : null,
                        ],
                    ],
                ],
            ];
        })->values();

        return response()->json([
            'teacher' => [
                'id' => $teacher->id,
                'nip' => $teacher->nip,
                'user' => $teacher->user ? [
                    'id' => $teacher->user->id,
                    'name' => $teacher->user->name,
                ] : null,
            ],
            'history' => $history,
        ]);
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

        $from = $request->input('from') ?? $request->input('start_date');
        $to = $request->input('to') ?? $request->input('end_date');

        $request->validate([
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date'],
        ]);

        $teacherId = $request->user()->teacherProfile->id;

        $query = Attendance::query()
            ->where('attendee_type', 'teacher')
            ->where('teacher_id', $teacherId);

        $this->applyDraftFilters($query, $request);

        if ($from) {
            $query->whereDate('date', '>=', Carbon::parse($from)->toDateString());
        }

        if ($to) {
            $query->whereDate('date', '<=', Carbon::parse($to)->toDateString());
        }

        $statusSummary = (clone $query)
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->get();

        $statusMap = $statusSummary->pluck('total', 'status');

        $present = (int) ($statusMap->get('present', 0));
        $late = (int) ($statusMap->get('late', 0));
        $sick = (int) ($statusMap->get('sick', 0));
        $absent = (int) ($statusMap->get('absent', 0));
        $excused = (int) ($statusMap->get('excused', 0))
            + (int) ($statusMap->get('permission', 0))
            + (int) ($statusMap->get('izin', 0));

        $total = $present + $late + $sick + $absent + $excused;
        $attendanceRate = $total > 0 ? (($present + $late) / $total) * 100 : 0;

        return response()->json([
            'data' => [
                'total_students' => $total,
                'present' => $present,
                'absent' => $absent,
                'late' => $late,
                'excused' => $excused,
                'sick' => $sick,
                'attendance_rate' => $attendanceRate,
            ],
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

        $this->applyDraftFilters($query, $request);

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
        $day = ScheduleDay::indonesian($date->toDateString());
        $dayVariants = ScheduleDay::variants($date->toDateString());

        $items = ScheduleItem::query()
            ->with(['teacher.user:id,name', 'subject'])
            ->whereHas('dailySchedule', function ($q) use ($dayVariants, $class) {
                $q->whereIn('day', $dayVariants)
                    ->whereHas('classSchedule', function ($cq) use ($class) {
                        $cq->where('class_id', $class->id);
                    });
            })
            ->orderBy('start_time')
            ->get();

        $scheduleIds = $items->pluck('id')->all();

        $attendances = Attendance::query()
            ->with(['student.user', 'student.classRoom', 'schedule', 'attachments'])
            ->whereIn('schedule_id', $scheduleIds)
            ->whereDate('date', $date->toDateString());

        $this->applyDraftFilters($attendances, $request);

        $attendances = $attendances->get()
            ->groupBy('schedule_id');

        $resultItems = $items->map(function (ScheduleItem $schedule) use ($attendances): array {
            return [
                'schedule' => $schedule,
                'attendances' => AttendanceResource::collection(
                    $attendances->get($schedule->id, collect())->values()
                ),
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
            ->whereHas('schedule.dailySchedule.classSchedule', function ($q) use ($class): void {
                $q->where('class_id', $class->id);
            });

        $this->applyDraftFilters($attendancesQuery, $request);

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
            'status' => ['nullable', 'in:hadir,terlambat,e,sakit,alfa,dinas,izin,kembali'],
        ]);

        $query = Attendance::query()
            ->with([
                'student.user:id,name',
                'schedule:id,subject_id,teacher_id,start_time,end_time,daily_schedule_id,room,keterangan',
                'schedule.subject:id,name',
                'schedule.teacher.user:id,name',
                'attachments',
            ])
            ->where('attendee_type', 'student')
            ->whereHas('schedule.dailySchedule.classSchedule', function ($q) use ($class): void {
                $q->where('class_id', $class->id);
            });

        $this->applyDraftFilters($query, $request);

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
            ->with(['schedule.subject', 'schedule.dailySchedule.classSchedule.class'])
            ->get()
            ->groupBy('teacher_id');

        $timeSlots = \App\Models\TimeSlot::orderBy('start_time')->get();

        $items = $teachers->getCollection()->map(function (TeacherProfile $teacher) use ($attendanceByTeacher, $timeSlots): array {
            $attendances = $attendanceByTeacher->get($teacher->id) ?? collect([]);

            // Map attendances to slots (1-10)
            $slots = array_fill(0, 10, null);

            foreach ($attendances as $attendance) {
                $schedule = $attendance->schedule;
                if ($schedule) {
                    // Try to find which slot this schedule belongs to
                    foreach ($timeSlots as $index => $slot) {
                        if ($index < 10 && $schedule->start_time === $slot->start_time) {
                            $slots[$index] = $attendance->status;
                            break;
                        }
                    }
                }
            }

            return [
                'teacher' => $teacher,
                'attendances' => $attendances,
                'status' => $attendances->isNotEmpty() ? $attendances->first()->status : 'absent',
                'slots' => $slots,
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
        try {
            $dto = \App\Data\ManualAttendanceData::fromRequest($request);
            $attendance = $this->service->storeManual([
                'attendee_type' => $dto->attendee_type,
                'student_id' => $dto->student_id,
                'schedule_id' => $dto->schedule_id,
                'status' => $dto->status,
                'date' => $dto->date,
                'reason' => $dto->reason,
            ], $request->user());

            return response()->json([
                'message' => 'Kehadiran berhasil disimpan',
                'attendance' => new \App\Http\Resources\AttendanceResource($attendance->load(['student.user', 'teacher.user', 'schedule.dailySchedule.classSchedule.class'])),
            ]);
        } catch (\Exception $e) {
            $code = $e->getCode();

            return response()->json(['message' => $e->getMessage()], $code >= 100 && $code < 600 ? $code : 500);
        }
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

        $this->applyDraftFilters($query, $request);

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
        $this->applyDraftFilters($query, $request);

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
            ->selectRaw('class_schedules.class_id as class_id, status, count(*) as total')
            ->join('schedule_items', 'attendances.schedule_id', '=', 'schedule_items.id')
            ->join('daily_schedules', 'schedule_items.daily_schedule_id', '=', 'daily_schedules.id')
            ->join('class_schedules', 'daily_schedules.class_schedule_id', '=', 'class_schedules.id')
            ->groupBy('class_schedules.class_id', 'status')
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
            $this->applyDraftFilters($q, $request);

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

        $this->applyDraftFilters($attendanceQuery, $request);

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
            ->whereBetween('date', [$start, $end]);

        $this->applyDraftFilters($summary, $request);

        $summary = $summary->groupBy('attendee_type', 'status')
            ->get();

        return response()->json($summary);
    }

    public function summaryBySchedule(Request $request, ScheduleItem $schedule): JsonResponse
    {
        $this->authorizeSchedule($request, $schedule);

        $data = Attendance::selectRaw('status, count(*) as total')
            ->where('schedule_id', $schedule->id);

        $this->applyDraftFilters($data, $request);

        $data = $data->groupBy('status')
            ->get();

        return response()->json($data);
    }

    public function summaryByClass(Request $request, \App\Models\Classes $class): JsonResponse
    {
        if ($request->user()->user_type === 'teacher') {
            $teacherId = optional($request->user()->teacherProfile)->id;
            $ownsSchedules = ScheduleItem::query()
                ->where('teacher_id', $teacherId)
                ->whereHas('dailySchedule.classSchedule', function ($q) use ($class): void {
                    $q->where('class_id', $class->id)
                        ->where('is_active', true);
                })
                ->exists();
            $isHomeroom = optional($class->homeroomTeacher)->id === $teacherId;
            if (! $ownsSchedules && ! $isHomeroom) {
                abort(403, 'Tidak boleh melihat rekap kelas ini');
            }
        }

        $data = Attendance::selectRaw('status, count(*) as total')
            ->whereHas('schedule.dailySchedule.classSchedule', fn ($q) => $q->where('class_id', $class->id));

        $this->applyDraftFilters($data, $request);

        $data = $data->groupBy('status')
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

    protected function authorizeAttendanceUpdate($user, Attendance $attendance): void
    {
        $isAdminOrWaka = $user->user_type === 'admin'
            || ($user->user_type === 'teacher' && $user->teacherProfile
                && collect($user->teacherProfile->jabatan ?? [])->contains(fn ($j) => in_array($j, [
                    'Waka Kurikulum',
                    'Waka Kesiswaan',
                    'Waka Humas',
                    'Waka Sarpras',
                ], true)));

        if ($isAdminOrWaka) {
            return;
        }

        if ($user->user_type !== 'teacher') {
            abort(403, 'Hanya guru yang dapat mengubah presensi ini.');
        }

        $teacher = $user->teacherProfile;
        if (! $teacher) {
            abort(403, 'Profil guru tidak ditemukan.');
        }

        if ($attendance->schedule) {
            $isScheduleTeacher = (int) $attendance->schedule->teacher_id === (int) $teacher->id;
            $isHomeroomTeacher = $attendance->student
                && (int) $attendance->student->class_id === (int) $teacher->homeroom_class_id;

            if (! $isScheduleTeacher && ! $isHomeroomTeacher) {
                abort(403, 'Anda tidak memiliki hak untuk mengubah presensi ini.');
            }

            return;
        }

        $isOwnTeacherAttendance = $attendance->attendee_type === 'teacher'
            && (int) $attendance->teacher_id === (int) $teacher->id;
        $isHomeroomStudentAttendance = $attendance->attendee_type === 'student'
            && $attendance->student
            && (int) $attendance->student->class_id === (int) $teacher->homeroom_class_id;

        if (! $isOwnTeacherAttendance && ! $isHomeroomStudentAttendance) {
            abort(403, 'Anda tidak memiliki hak untuk mengubah presensi ini.');
        }
    }

    protected function normalizeExcusePayload(array $data): array
    {
        $map = [
            'alpha' => 'absent',
            'tanpa-keterangan' => 'absent',
            'pulang' => 'return',
            'hadir' => 'present',
            'sakit' => 'sick',
            'izin' => 'excused',
            'terlambat' => 'late',
        ];

        $status = $data['status'] ?? '';
        if (isset($map[$status])) {
            $status = $map[$status];
        }

        $data['status'] = Attendance::normalizeStatus($status);

        return $data;
    }

    protected function enforceAutoAbsentCorrectionRules($user, Attendance $attendance, array $data, bool $hasAttachment): void
    {
        $isAutoAbsent = $attendance->source === 'system_close'
            && $attendance->status === 'absent';

        if (! $isAutoAbsent) {
            return;
        }

        $teacher = $user->teacherProfile;
        $isAdmin = $user->user_type === 'admin';
        $isWaka = $user->user_type === 'teacher'
            && $teacher
            && collect($teacher->jabatan ?? [])->contains(fn ($j) => in_array($j, [
                'Waka Kurikulum',
                'Waka Kesiswaan',
                'Waka Humas',
                'Waka Sarpras',
            ], true));

        if ($isAdmin || $isWaka) {
            if (blank($data['reason'] ?? null)) {
                throw new \Illuminate\Http\Exceptions\HttpResponseException(
                    response()->json([
                        'message' => 'Waka kesiswaan wajib menyertakan alasan untuk koreksi alpha otomatis.',
                    ], 422)
                );
            }

            return;
        }

        $isHomeroomTeacher = $user->user_type === 'teacher'
            && $teacher
            && $attendance->student
            && (int) $attendance->student->class_id === (int) $teacher->homeroom_class_id;

        if (! $isHomeroomTeacher) {
            abort(403, 'Presensi alpha otomatis hanya dapat dikoreksi oleh wali kelas atau waka kesiswaan.');
        }

        if (! in_array($data['status'] ?? null, ['sick', 'excused'], true)) {
            abort(403, 'Wali kelas hanya dapat mengubah alpha otomatis menjadi sakit atau izin.');
        }

        if (blank($data['reason'] ?? null) || ! $hasAttachment) {
            throw new \Illuminate\Http\Exceptions\HttpResponseException(
                response()->json([
                    'message' => 'Wali kelas wajib menyertakan alasan dan bukti surat untuk koreksi alpha otomatis.',
                ], 422)
            );
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

    protected function applyDraftFilters($query, Request $request, bool $defaultIncludeDrafts = false): void
    {
        $includeDrafts = $request->boolean('include_drafts', $defaultIncludeDrafts);
        $draftState = $request->input('draft_state', $includeDrafts ? 'all' : 'final');

        if (! $includeDrafts && $draftState === 'all') {
            $draftState = 'final';
        }

        match ($draftState) {
            'draft' => $query->where('is_draft', true),
            'final' => $query->where('is_draft', false),
            default => null,
        };
    }

    public function bySchedule(Request $request, ScheduleItem $schedule): JsonResponse
    {
        $this->authorizeSchedule($request, $schedule);

        $query = Attendance::query()
            ->with(['student.user:id,name', 'teacher.user:id,name', 'attachments'])
            ->where('schedule_id', $schedule->id)
            ->latest('checked_in_at');

        if ($request->filled('date')) {
            $query->whereDate('date', $request->date('date'));
        }

        $this->applyDraftFilters($query, $request, true);

        $perPage = $this->resolvePerPage($request);
        $attendances = $query->paginate($perPage);

        return \App\Http\Resources\AttendanceResource::collection($attendances)->response();
    }

    public function bulkManual(Request $request): JsonResponse
    {
        $data = $request->validate([
            'schedule_id' => ['required', 'exists:schedule_items,id'],
            'date' => ['required', 'date'],
            'mode' => ['nullable', 'in:draft,final'],
            'items' => ['required', 'array'],
            'items.*.student_id' => ['required', 'exists:student_profiles,id'],
            'items.*.status' => ['nullable', 'string'],
            'items.*.reason' => ['nullable', 'string'],
        ]);

        try {
            return response()->json($this->service->saveBulkManual($data, $request->user()));
        } catch (\Exception $e) {
            $code = $e->getCode();

            return response()->json(['message' => $e->getMessage()], $code >= 100 && $code < 600 ? $code : 500);
        }
    }

    public function finalizeManual(FinalizeManualAttendanceRequest $request): JsonResponse
    {
        $schedule = ScheduleItem::findOrFail($request->integer('schedule_id'));

        try {
            return response()->json($this->service->finalizeManualSession(
                $schedule,
                Carbon::parse($request->input('date'))->toDateString(),
                $request->input('finalize_empty_as', 'absent'),
                $request->user()
            ));
        } catch (\Exception $e) {
            $code = $e->getCode();

            return response()->json(['message' => $e->getMessage()], $code >= 100 && $code < 600 ? $code : 500);
        }
    }

    public function markExcuse(Request $request, Attendance $attendance): JsonResponse
    {
        $this->authorizeAttendanceUpdate($request->user(), $attendance);

        $data = $request->validate([
            'status' => ['required', 'in:present,late,excused,sick,absent,dispensasi,dinas,izin,return,alpha,hadir,sakit,terlambat,pulang'],
            'reason' => ['nullable', 'string', 'required_if:status,return,pulang'],
        ]);
        $data = $this->normalizeExcusePayload($data);
        $this->enforceAutoAbsentCorrectionRules($request->user(), $attendance, $data, false);

        $attendance->update([
            'status' => $data['status'],
            'reason' => $data['reason'] ?? null,
            'source' => 'manual',
            'is_draft' => false,
            'finalized_at' => now(),
        ]);

        $attendance->load(['student.user', 'teacher.user', 'schedule.dailySchedule.classSchedule.class', 'attachments']);

        return response()->json(new \App\Http\Resources\AttendanceResource($attendance));
    }

    public function updateExcuse(UpdateAttendanceExcuseRequest $request, Attendance $attendance): JsonResponse
    {
        $this->authorizeAttendanceUpdate($request->user(), $attendance);
        $data = $this->normalizeExcusePayload($request->validated());
        $this->enforceAutoAbsentCorrectionRules(
            $request->user(),
            $attendance,
            $data,
            $request->hasFile('attachment')
        );

        $attendance = DB::transaction(function () use ($attendance, $request, $data) {
            $attendance->update([
                'status' => $data['status'],
                'reason' => $data['reason'] ?? null,
                'source' => 'manual',
                'is_draft' => false,
                'finalized_at' => now(),
            ]);

            if ($request->hasFile('attachment')) {
                $file = $request->file('attachment');
                $path = $this->storeAttachment($file);

                if ($request->boolean('replace_existing_attachment')) {
                    $attendance->attachments->each(function (\App\Models\AttendanceAttachment $attachment): void {
                        Storage::delete($attachment->path);
                        $attachment->delete();
                    });
                }

                $attendance->attachments()->create([
                    'path' => $path,
                    'original_name' => $file->getClientOriginalName(),
                    'mime_type' => $file->getMimeType(),
                    'size' => $file->getSize(),
                ]);

                $attendance->forceFill(['reason_file' => $path])->save();
            }

            return $attendance->load(['student.user', 'teacher.user', 'schedule.dailySchedule.classSchedule.class', 'attachments']);
        });

        return response()->json([
            'message' => 'Presensi berhasil diperbarui',
            'attendance' => new \App\Http\Resources\AttendanceResource($attendance),
        ]);
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

        $user = $request->user();
        $query = Attendance::with([
            'student.user:id,name',
            'teacher.user:id,name',
            'schedule.subject:id,name',
            'schedule.dailySchedule.classSchedule.class:id,grade,label,major_id',
        ]);

        if ($request->filled('schedule_id')) {
            $schedule = ScheduleItem::findOrFail($request->integer('schedule_id'));
            if ($user->user_type === 'teacher' && $schedule->teacher_id !== optional($user->teacherProfile)->id) {
                abort(403, 'Tidak boleh mengekspor jadwal ini');
            }
            $query->where('schedule_id', $schedule->id);
        }

        if ($request->filled('class_id')) {
            $classId = $request->integer('class_id');

            // Authorization check for class_id
            if ($user->user_type === 'teacher') {
                $teacher = $user->teacherProfile;
                if ($teacher && $teacher->homeroomClass) {
                    $allowedClassIds = [$teacher->homeroomClass->id];
                    // Also allow teachers to export classes they teach
                    $taughtClasses = \App\Models\Classes::whereHas('subjects.teachers', function ($q) use ($teacher) {
                        $q->where('teacher_id', $teacher->id);
                    })->pluck('id')->toArray();
                    $allowedClassIds = array_merge($allowedClassIds, $taughtClasses);

                    if (! in_array($classId, $allowedClassIds)) {
                        abort(403, 'Anda tidak memiliki akses untuk mengekspor data kelas ini.');
                    }
                }
            }

            $query->whereHas('schedule.dailySchedule.classSchedule', fn ($q) => $q->where('class_id', $classId));
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

                    $className = $attendance->schedule?->dailySchedule?->classSchedule?->class?->name
                        ?? $attendance->schedule?->class?->name
                        ?? '-';

                    fputcsv($handle, [
                        $attendance->attendee_type,
                        $name,
                        $attendance->status,
                        optional($attendance->checked_in_at)->toDateTimeString(),
                        $attendance->reason,
                        $className,
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

        $user = $request->user();
        $classId = $request->class_id;

        // Authorization check
        if ($user->user_type === 'student') {
            abort(403, 'Anda tidak memiliki akses untuk mengunduh laporan ini.');
        }

        if ($user->user_type === 'teacher') {
            $teacher = $user->teacherProfile;
            if ($teacher && $teacher->homeroomClass) {
                $allowedClassIds = [$teacher->homeroomClass->id];
                // Also allow teachers to view classes they teach
                $taughtClasses = \App\Models\Classes::whereHas('subjects.teachers', function ($q) use ($teacher) {
                    $q->where('teacher_id', $teacher->id);
                })->pluck('id')->toArray();
                $allowedClassIds = array_merge($allowedClassIds, $taughtClasses);

                if ($classId && ! in_array($classId, $allowedClassIds)) {
                    abort(403, 'Anda tidak memiliki akses untuk mengunduh laporan kelas ini.');
                }
            }
        }

        // Admin can download any class
        $query = Attendance::with(['student.user', 'schedule.dailySchedule.classSchedule.class', 'schedule.subject'])
            ->where('attendee_type', 'student');

        if ($classId) {
            $query->whereHas('schedule.dailySchedule.classSchedule', fn ($q) => $q->where('class_id', $classId));
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

    private function getBucketLabel(string $bucket, string $groupBy): string
    {
        if ($groupBy === 'day') {
            return Carbon::parse($bucket)->format('d M');
        }

        if ($groupBy === 'week') {
            [$year, $week] = explode('-', $bucket);

            return "Minggu {$week} ({$year})";
        }

        return Carbon::parse($bucket . '-01')->locale('id')->translatedFormat('M Y');
    }

    private function resolvePerPage(Request $request): ?int
    {
        if (! $request->filled('per_page') && ! $request->filled('page')) {
            return null;
        }

        $request->validate([
            'per_page' => ['nullable', 'integer', 'min:-1', 'max:1000'],
        ]);

        $perPage = $request->integer('per_page', 15);

        if ($perPage === -1) {
            return 1000; // Cap at 1000 for safety, but effectively returns "all" for small-mid schools
        }

        return min(max($perPage, 1), 1000);
    }
}
