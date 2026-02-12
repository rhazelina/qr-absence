<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->user_type === 'admin';
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:50', 'unique:users,username'],
            'email' => ['nullable', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6'],
            'nisn' => ['required', 'string', 'unique:student_profiles,nisn'],
            'nis' => ['required', 'string', 'unique:student_profiles,nis'],
            'gender' => ['required', 'in:L,P'],
            'address' => ['required', 'string'],
            'class_id' => ['required', 'exists:classes,id'],
            'is_class_officer' => ['nullable', 'boolean'],
            'phone' => ['nullable', 'string', 'max:30'],
            'contact' => ['nullable', 'string', 'max:50'],
            'parent_phone' => ['nullable', 'string', 'max:20'],
        ];
    }
}
