<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAbsenceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Authorization logic handled in Controller based on user type
    }

    public function rules(): array
    {
        return [
            'student_id' => ['nullable', 'exists:student_profiles,id'],
            'type' => ['required', 'in:dispensation,sick,permit,dinas'],
            'start_date' => [
                'required',
                'date',
                'after_or_equal:today',
                function ($attribute, $value, $fail) {
                    if (date('N', strtotime($value)) == 7) {
                        $fail('Pengajuan tidak dapat dimulai pada hari Minggu.');
                    }
                },
            ],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'reason' => ['nullable', 'string', 'max:500'],
            'attachment' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'], // 5MB Max
        ];
    }
}
