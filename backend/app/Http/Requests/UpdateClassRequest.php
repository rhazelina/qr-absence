<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateClassRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->user_type === 'admin';
    }

    public function rules(): array
    {
        return [
            'grade' => ['sometimes', 'string', 'max:10'],
            'label' => ['sometimes', 'string', 'max:100'],
            'major_id' => ['nullable', 'exists:majors,id'],
            'homeroom_teacher_id' => ['nullable', 'exists:teacher_profiles,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'grade.string' => 'Format tingkat kelas tidak valid',
            'grade.max' => 'Tingkat kelas maksimal 10 karakter',
            'label.string' => 'Format label kelas tidak valid',
            'label.max' => 'Label kelas maksimal 100 karakter',
            'major_id.exists' => 'Jurusan tidak ditemukan',
            'homeroom_teacher_id.exists' => 'Wali kelas tidak ditemukan',
        ];
    }
}
