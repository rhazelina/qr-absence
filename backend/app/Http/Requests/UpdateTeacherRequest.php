<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTeacherRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->user_type === 'admin';
    }

    public function rules(): array
    {
        $teacherId = $this->route('teacher')->id;
        $userId = $this->route('teacher')->user_id;

        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'unique:users,email,'.$userId],
            'password' => ['nullable', 'string', 'min:6'],
            'phone' => ['nullable', 'string', 'max:30'],
            'contact' => ['nullable', 'string', 'max:50'],
            'homeroom_class_id' => ['nullable', 'exists:classes,id'],
            'subject' => ['nullable', 'string', 'max:100'],
            'nip' => ['sometimes', 'string', 'unique:teacher_profiles,nip,'.$teacherId],
            'username' => ['sometimes', 'string', 'max:50', 'unique:users,username,'.$userId],
        ];
    }
}
