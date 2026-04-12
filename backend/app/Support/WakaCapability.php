<?php

namespace App\Support;

use App\Models\User;

class WakaCapability
{
    public static function isWaka(?User $user): bool
    {
        return $user?->adminProfile?->type === 'waka';
    }

    public static function teacherJabatanList(?User $user): array
    {
        $jabatan = $user?->teacherProfile?->jabatan ?? [];

        if (is_string($jabatan)) {
            $jabatan = [$jabatan];
        }

        return array_values(array_filter($jabatan, fn ($item) => is_string($item) && $item !== ''));
    }

    public static function hasTeacherJabatan(?User $user, string $expected): bool
    {
        foreach (self::teacherJabatanList($user) as $jabatan) {
            if (strcasecmp($jabatan, $expected) === 0) {
                return true;
            }
        }

        return false;
    }

    public static function isWakaKurikulum(?User $user): bool
    {
        return self::isWaka($user) && self::hasTeacherJabatan($user, 'Waka Kurikulum');
    }

    public static function isWakaKesiswaan(?User $user): bool
    {
        return self::isWaka($user) && self::hasTeacherJabatan($user, 'Waka Kesiswaan');
    }

    public static function isWakaReadOnly(?User $user): bool
    {
        return self::isWaka($user) && ! self::isWakaKurikulum($user) && ! self::isWakaKesiswaan($user);
    }

    public static function canManageAcademicSchedule(?User $user): bool
    {
        if (! $user) {
            return false;
        }

        if ($user->user_type === 'admin' && ! self::isWaka($user)) {
            return true;
        }

        return self::isWakaKurikulum($user);
    }

    public static function canManageTeacherAttendance(?User $user): bool
    {
        if (! $user) {
            return false;
        }

        if ($user->user_type === 'admin' && ! self::isWaka($user)) {
            return true;
        }

        return self::isWakaKurikulum($user);
    }

    public static function canManageStudentAttendance(?User $user): bool
    {
        if (! $user) {
            return false;
        }

        if ($user->user_type === 'admin' && ! self::isWaka($user)) {
            return true;
        }

        return self::isWakaKesiswaan($user);
    }
}
