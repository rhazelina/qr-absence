<?php

namespace App\Http\Controllers;

use App\Events\AbsenceRequestCreated;
use App\Events\AbsenceRequestUpdated;
use App\Models\AbsenceRequest;
use App\Models\StudentProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AbsenceRequestController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = AbsenceRequest::query()->with(['student.user', 'classRoom', 'requester', 'approver']);

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('class_id')) {
            $query->where('class_id', $request->integer('class_id'));
        }

        if ($request->filled('type')) {
            $query->where('type', $request->string('type'));
        }

        return response()->json($query->latest()->paginate());
    }

    public function store(\App\Http\Requests\StoreAbsenceRequest $request): JsonResponse
    {
        $data = $request->validated();

        $user = $request->user();

        // Handle Teacher Absence
        if ($user->user_type === 'teacher' && empty($data['student_id'])) {
            $teacherProfile = $user->teacherProfile;
            if (! $teacherProfile) {
                abort(422, 'Profil guru tidak ditemukan');
            }

            $absenceRequest = DB::transaction(function () use ($data, $teacherProfile, $user) {
                return AbsenceRequest::create([
                    'teacher_id' => $teacherProfile->id,
                    'requested_by' => $user->id,
                    'type' => $data['type'],
                    'start_date' => $data['start_date'],
                    'end_date' => $data['end_date'],
                    'reason' => $data['reason'] ?? null,
                    'status' => 'pending',
                ]);
            });

            Log::info('absence.request.created', [
                'request_id' => $absenceRequest->id,
                'teacher_id' => $absenceRequest->teacher_id,
                'requested_by' => $absenceRequest->requested_by,
                'type' => $absenceRequest->type,
            ]);

            AbsenceRequestCreated::dispatch($absenceRequest);

            return response()->json($absenceRequest->load(['teacher.user', 'requester']), 201);
        }

        if ($user->user_type === 'student') {
            $studentProfile = $user->studentProfile;

            if (! $studentProfile) {
                abort(403, 'Profil siswa tidak ditemukan');
            }

            // Default to self if student_id is empty
            if (empty($data['student_id'])) {
                $data['student_id'] = $studentProfile->id;
                $student = $studentProfile;
            } else {
                $student = StudentProfile::with('classRoom')->findOrFail($data['student_id']);
                if (! $studentProfile->is_class_officer && $studentProfile->id !== $student->id) {
                    abort(403, 'Pengurus kelas saja yang boleh mengajukan untuk orang lain');
                }
            }
        } else {
            // Teacher or Admin must provide student_id
            if (empty($data['student_id'])) {
                abort(422, 'Student ID wajib diisi untuk pengajuan siswa');
            }
            $student = StudentProfile::with('classRoom')->findOrFail($data['student_id']);
        }

        if ($user->user_type === 'teacher') {
            $teacherProfile = $user->teacherProfile
                ?? \App\Models\TeacherProfile::where('user_id', $user->id)->first();
            $teacherId = $teacherProfile?->id;
            $classRoom = $student->classRoom;

            $isHomeroom = $classRoom && $classRoom->homeroomTeacher && $classRoom->homeroomTeacher->id === $teacherId;
            $isTeaching = $classRoom
                ? $classRoom->schedules()->where('teacher_id', $teacherId)->exists()
                : ($student->class_id
                    ? \App\Models\Schedule::where('class_id', $student->class_id)
                        ->where('teacher_id', $teacherId)
                        ->exists()
                    : false);

            if (! $isHomeroom && ! $isTeaching) {
                abort(403, 'Guru tidak boleh mengajukan untuk kelas ini');
            }
        }

        $absenceRequest = DB::transaction(function () use ($data, $student, $user) {
            return AbsenceRequest::create([
                'student_id' => $student->id,
                'class_id' => $student->class_id,
                'requested_by' => $user?->id,
                'type' => $data['type'],
                'start_date' => $data['start_date'],
                'end_date' => $data['end_date'],
                'reason' => $data['reason'] ?? null,
                'status' => 'pending',
            ]);
        });

        Log::info('absence.request.created', [
            'request_id' => $absenceRequest->id,
            'student_id' => $absenceRequest->student_id,
            'class_id' => $absenceRequest->class_id,
            'requested_by' => $absenceRequest->requested_by,
            'type' => $absenceRequest->type,
        ]);

        AbsenceRequestCreated::dispatch($absenceRequest);

        if ($absenceRequest->student_id) {
            \App\Jobs\NotifyTeacherNewAbsence::dispatch($absenceRequest);
        }

        return response()->json($absenceRequest->load(['student.user', 'classRoom', 'requester']), 201);
    }

    public function approve(Request $request, AbsenceRequest $absenceRequest): JsonResponse
    {
        $data = $request->validate([
            'approver_signature' => ['nullable', 'string'],
        ]);

        if ($absenceRequest->status !== 'pending') {
            abort(422, 'Request sudah diproses');
        }

        $absenceRequest->update([
            'status' => 'approved',
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
            'approver_signature' => $data['approver_signature'] ?? null,
        ]);

        Log::info('absence.request.approved', [
            'request_id' => $absenceRequest->id,
            'approved_by' => $absenceRequest->approved_by,
        ]);

        AbsenceRequestUpdated::dispatch($absenceRequest);

        return response()->json($absenceRequest->load(['student.user', 'classRoom', 'requester', 'approver']));
    }

    public function reject(Request $request, AbsenceRequest $absenceRequest): JsonResponse
    {
        $data = $request->validate([
            'approver_signature' => ['nullable', 'string'],
        ]);

        if ($absenceRequest->status !== 'pending') {
            abort(422, 'Request sudah diproses');
        }

        $absenceRequest->update([
            'status' => 'rejected',
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
            'approver_signature' => $data['approver_signature'] ?? null,
        ]);

        Log::info('absence.request.rejected', [
            'request_id' => $absenceRequest->id,
            'approved_by' => $absenceRequest->approved_by,
        ]);

        AbsenceRequestUpdated::dispatch($absenceRequest);

        return response()->json($absenceRequest->load(['student.user', 'classRoom', 'requester', 'approver']));
    }
}
