<?php

namespace App\Http\Middleware;

use App\Models\Attendance;
use App\Support\WakaCapability;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnforceWakaAccess
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! WakaCapability::isWaka($user)) {
            return $next($request);
        }

        $wakaRole = $this->resolveWakaRole(WakaCapability::teacherJabatanList($user));

        if ($request->isMethodSafe()) {
            return $next($request);
        }

        if (in_array($wakaRole, ['humas', 'sarpras'], true)) {
            abort(403, 'Waka Humas/Sarpras hanya memiliki akses read-only.');
        }

        $writeContext = $this->detectWriteContext($request);

        if ($wakaRole === 'kesiswaan' && $writeContext !== 'student_attendance') {
            abort(403, 'Waka Kesiswaan hanya dapat mengubah kehadiran siswa.');
        }

        if ($wakaRole === 'kurikulum' && $writeContext === 'student_attendance') {
            abort(403, 'Waka Kurikulum tidak diizinkan mengubah kehadiran siswa.');
        }

        if ($wakaRole === null) {
            abort(403, 'Tipe Waka tidak dikenali untuk aksi write/update/delete.');
        }

        return $next($request);
    }

    private function resolveWakaRole(mixed $jabatan): ?string
    {
        $roles = is_array($jabatan) ? $jabatan : [$jabatan];
        $joined = strtolower(implode(' ', array_filter($roles, fn ($item) => is_string($item))));

        if (str_contains($joined, 'kesiswaan')) {
            return 'kesiswaan';
        }
        if (str_contains($joined, 'kurikulum')) {
            return 'kurikulum';
        }
        if (str_contains($joined, 'humas')) {
            return 'humas';
        }
        if (str_contains($joined, 'sarpras')) {
            return 'sarpras';
        }

        return null;
    }

    private function detectWriteContext(Request $request): string
    {
        $path = $request->path();

        if ($this->isStudentAttendanceWrite($request, $path)) {
            return 'student_attendance';
        }

        if ($this->isTeacherAttendanceWrite($request, $path)) {
            return 'teacher_attendance';
        }

        if (
            str_contains($path, '/schedules') ||
            str_contains($path, '/time-slots') ||
            str_contains($path, '/school-years') ||
            str_contains($path, '/semesters') ||
            str_contains($path, '/subjects') ||
            str_contains($path, '/classes') ||
            str_contains($path, '/rooms')
        ) {
            return 'schedule_or_academic';
        }

        return 'other_write';
    }

    private function isStudentAttendanceWrite(Request $request, string $path): bool
    {
        if (
            str_contains($path, '/attendance/bulk-manual') ||
            str_contains($path, '/attendance/scan-student') ||
            str_contains($path, '/leave-permissions') ||
            str_contains($path, '/absence-requests')
        ) {
            return true;
        }

        if (str_contains($path, '/attendance/manual')) {
            return $request->input('attendee_type', 'student') === 'student';
        }

        $attendance = $request->route('attendance');
        if ($attendance instanceof Attendance) {
            return $attendance->attendee_type === 'student';
        }

        return false;
    }

    private function isTeacherAttendanceWrite(Request $request, string $path): bool
    {
        if (str_contains($path, '/attendance/manual')) {
            return $request->input('attendee_type') === 'teacher';
        }

        $attendance = $request->route('attendance');
        if ($attendance instanceof Attendance) {
            return $attendance->attendee_type === 'teacher';
        }

        return false;
    }
}
