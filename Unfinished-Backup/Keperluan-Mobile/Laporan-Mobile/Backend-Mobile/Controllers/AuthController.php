<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    use \App\Traits\IpMasker;

    private function profileJabatanValue(User $user): ?string
    {
        $jabatan = $user->teacherProfile?->jabatan;
        if (! is_array($jabatan) || empty($jabatan)) {
            return null;
        }

        return collect($jabatan)
            ->filter(fn ($value) => is_string($value) && trim($value) !== '')
            ->map(fn ($value) => trim($value))
            ->implode(',');
    }

    private function teacherProfilePayload(User $user): ?array
    {
        if (! $user->teacherProfile) {
            return null;
        }

        return [
            'id' => $user->teacherProfile->id,
            'nip' => $user->teacherProfile->nip,
            'kode_guru' => $user->teacherProfile->kode_guru,
            'jabatan' => $user->teacherProfile->jabatan ?? [],
            'homeroom_class_id' => $user->teacherProfile->homeroom_class_id,
        ];
    }

    private function studentProfilePayload(User $user): ?array
    {
        if (! $user->studentProfile) {
            return null;
        }

        return [
            'id' => $user->studentProfile->id,
            'nisn' => $user->studentProfile->nisn,
            'nis' => $user->studentProfile->nis,
            'class_id' => $user->studentProfile->class_id,
        ];
    }

    /**
     * Determine the precise role for a user.
     *
     * Priority:
     * 1. adminProfile (cek LEBIH DULU) — user bisa ber-user_type=teacher
     * tapi terdaftar di admin_profiles sebagai waka/admin/dll.
     * 2. teacher — wakel jika punya homeroom_class_id, guru jika tidak.
     * 3. student — pengurus_kelas jika is_class_officer, siswa jika tidak.
     * 4. Fallback ke user_type.
     */
    private function resolveActualRole(User $user): string
    {
        // Prioritas 1: cek admin_profiles terlebih dahulu
        if ($user->adminProfile) {
            return $user->adminProfile->type ?? 'admin';
        }

        // Prioritas 2: teacher
        if ($user->user_type === 'teacher') {
            $isHomeroom = $user->teacherProfile?->homeroom_class_id !== null;

            return $isHomeroom ? 'wakel' : 'guru';
        }

        // Prioritas 3: student
        if ($user->user_type === 'student') {
            return $user->studentProfile?->is_class_officer ? 'pengurus_kelas' : 'siswa';
        }

        // Fallback
        return $user->user_type;
    }

    /**
     * Login User
     */
    public function login(LoginRequest $request): JsonResponse
    {
        Log::info('auth.login.attempt', [
            'ip' => $this->maskIp($request->ip()),
            'login' => $request->input('login'),
        ]);

        $data = $request->validated();

        // Try to find user by username or email first
        $user = User::query()
            ->where('username', $data['login'])
            ->orWhere('email', $data['login'])
            ->first();

        // If not found, try to find student by NISN
        if (! $user) {
            $studentProfile = \App\Models\StudentProfile::where('nisn', $data['login'])
                ->orWhere('nis', $data['login'])
                ->first();

            if ($studentProfile) {
                $user = $studentProfile->user;
            }
        }

        // If still not found, try to find teacher by NIP or Kode Guru
        if (! $user) {
            $teacherProfile = \App\Models\TeacherProfile::where('nip', $data['login'])
                ->orWhere('kode_guru', $data['login'])
                ->first();

            if ($teacherProfile) {
                $user = $teacherProfile->user;
            }
        }

        // If user not found at all
        if (! $user) {
            throw ValidationException::withMessages([
                'login' => ['Invalid credentials'],
            ]);
        }

        // Check if this is a student trying to login with NISN/NIS only (no password)
        $isStudentNisnLogin = $user->user_type === 'student' &&
                               empty($data['password']) &&
                               (\App\Models\StudentProfile::where('nisn', $data['login'])
                                   ->orWhere('nis', $data['login'])
                                   ->exists());

        // Check password for non-students OR students with password
        if (! $isStudentNisnLogin && ! Hash::check($data['password'] ?? '', $user->password)) {
            throw ValidationException::withMessages([
                'login' => ['Invalid credentials'],
            ]);
        }

        if (! $user->active) {
            throw ValidationException::withMessages([
                'login' => ['Account inactive'],
            ]);
        }

        // Eager load semua relasi yang dibutuhkan
        $user->load(['adminProfile', 'teacherProfile', 'teacherProfile.homeroomClass', 'studentProfile', 'studentProfile.classRoom']);

        // Auto-create adminProfile jika user_type=admin tapi belum punya profile
        if ($user->user_type === 'admin' && ! $user->adminProfile) {
            $user->adminProfile()->create(['type' => 'admin']);
            $user->load('adminProfile');
        }

        $token = $user->createToken('api')->plainTextToken;

        Log::info('auth.login.success', [
            'user_id' => $user->id,
            'user_type' => $user->user_type,
        ]);

        $isClassOfficer = $user->studentProfile?->is_class_officer ?? false;

        // Build Profile Gabungan (Data Wakel dari temen + Gambar Jadwal dari kamu)
        $profile = null;
        if ($user->user_type === 'student' && $user->studentProfile) {
            $profile = [
                'nis' => $user->studentProfile->nis,
                'class_id' => $user->studentProfile->class_id,
                'class_name' => $user->studentProfile->classRoom?->name,
                'photo_url' => $user->photo_url ?? null,
            ];
        } elseif ($user->teacherProfile) {
            $profile = [
                'nip' => $user->teacherProfile->nip,
                'kode_guru' => $user->teacherProfile->kode_guru,
                'jabatan' => $this->profileJabatanValue($user),
                'photo_url' => $user->photo_url ?? null,
                'homeroom_class_id' => $user->teacherProfile->homeroom_class_id,
                'homeroom_class_name' => $user->teacherProfile->homeroomClass?->name,
                'total_students' => $user->teacherProfile->homeroomClass?->students()->count() ?? 0,
                'schedule_image_url' => $user->teacherProfile->schedule_image_path
                    ? asset('storage/'.$user->teacherProfile->schedule_image_path)
                    : null,
            ];
        }

        // Tentukan role presisi menggunakan fungsi buatan temenmu
        $actualRole = $this->resolveActualRole($user);

        Log::info('auth.login.role_resolved', [
            'user_id' => $user->id,
            'user_type' => $user->user_type,
            'actual_role' => $actualRole,
        ]);

        $expiresInMinutes = config('sanctum.expiration', 60);

        return response()->json([
            'token' => $token,
            'expires_in' => $expiresInMinutes * 60,
            'token_type' => 'Bearer',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'user_type' => $user->user_type,
                'role' => $actualRole,
                'is_class_officer' => $isClassOfficer,
                'studentProfile' => $this->studentProfilePayload($user),
                'teacherProfile' => $this->teacherProfilePayload($user),
                'profile' => $profile,
            ],
        ]);
    }

    /**
     * Refresh Token
     */
    public function refresh(Request $request): JsonResponse
    {
        $user = $request->user();
        $request->user()->currentAccessToken()?->delete();
        $token = $user->createToken('api')->plainTextToken;
        $expiresInMinutes = config('sanctum.expiration', 60);

        Log::info('auth.token.refreshed', [
            'user_id' => $user->id,
            'user_type' => $user->user_type,
        ]);

        return response()->json([
            'token' => $token,
            'expires_in' => $expiresInMinutes * 60,
            'token_type' => 'Bearer',
        ]);
    }

    /**
     * Get Current User
     */
    public function me(Request $request): JsonResponse
    {
        // Eager load disamakan dengan fungsi login agar konsisten
        $user = $request->user()->load(['adminProfile', 'teacherProfile', 'teacherProfile.homeroomClass', 'studentProfile', 'studentProfile.classRoom']);

        $isClassOfficer = $user->studentProfile?->is_class_officer ?? false;

        // Build Profile Gabungan
        $profile = null;
        if ($user->user_type === 'student' && $user->studentProfile) {
            $profile = [
                'nis' => $user->studentProfile->nis,
                'class_id' => $user->studentProfile->class_id,
                'class_name' => $user->studentProfile->classRoom?->name,
                'photo_url' => $user->photo_url ?? null,
            ];
        } elseif ($user->teacherProfile) {
            $profile = [
                'nip' => $user->teacherProfile->nip,
                'kode_guru' => $user->teacherProfile->kode_guru,
                'jabatan' => $this->profileJabatanValue($user),
                'photo_url' => $user->photo_url ?? null,
                'homeroom_class_id' => $user->teacherProfile->homeroom_class_id,
                'homeroom_class_name' => $user->teacherProfile->homeroomClass?->name,
                'total_students' => $user->teacherProfile->homeroomClass?->students()->count() ?? 0,
                'schedule_image_url' => $user->teacherProfile->schedule_image_path
                    ? asset('storage/'.$user->teacherProfile->schedule_image_path)
                    : null,
            ];
        }

        // Tentukan role presisi menggunakan fungsi buatan temenmu
        $actualRole = $this->resolveActualRole($user);

        $payload = [
            'id' => $user->id,
            'name' => $user->name,
            'username' => $user->username,
            'email' => $user->email,
            'user_type' => $user->user_type,
            'role' => $actualRole,
            'is_class_officer' => $isClassOfficer,
            'studentProfile' => $this->studentProfilePayload($user),
            'teacherProfile' => $this->teacherProfilePayload($user),
            'profile' => $profile,
            'student_profile' => $user->studentProfile ? ['id' => $user->studentProfile->id] : null,
        ];

        return response()->json(array_merge($payload, [
            'data' => $payload,
        ]));
    }

    /**
     * Logout User
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        Log::info('auth.logout', [
            'user_id' => $request->user()->id,
            'user_type' => $request->user()->user_type,
        ]);

        return response()->json(['message' => 'Logged out']);
    }
}
