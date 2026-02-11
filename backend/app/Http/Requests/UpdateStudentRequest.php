<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->user_type === 'admin';
    }

    public function rules(): array
    {
        $studentId = $this->route('student')->id;
        $userId = $this->route('student')->user_id;

        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'unique:users,email,'.$userId],
            'password' => ['nullable', 'string', 'min:6'],
            'gender' => ['sometimes', 'in:L,P'],
            'address' => ['sometimes', 'string'],
            'class_id' => ['sometimes', 'exists:classes,id'],
            'is_class_officer' => ['nullable', 'boolean'],
            'phone' => ['nullable', 'string', 'max:30'],
            'contact' => ['nullable', 'string', 'max:50'],
            'parent_phone' => ['nullable', 'string', 'max:20'],

            //  IGNORE ID SENDIRI
            'nisn' => ['sometimes', 'string', 'unique:student_profiles,nisn,'.$studentId],
            'nis' => ['sometimes', 'string', 'unique:student_profiles,nis,'.$studentId],
            'username' => ['sometimes', 'string', 'max:50', 'unique:users,username,'.$userId],
        ];
    }
}
