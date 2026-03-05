<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTeacherRequest extends FormRequest
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
            'nip' => ['required', 'string', 'unique:teacher_profiles,nip'],
            'phone' => ['nullable', 'string', 'max:30'],
            'contact' => ['nullable', 'string', 'max:50'],
            'homeroom_class_id' => ['nullable', 'exists:classes,id'],
            'subject' => ['nullable', 'string', 'max:100'],
        ];
    }
}
