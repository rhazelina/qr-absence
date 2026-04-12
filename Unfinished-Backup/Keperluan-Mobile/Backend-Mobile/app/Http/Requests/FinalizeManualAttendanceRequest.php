<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class FinalizeManualAttendanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return in_array($this->user()?->user_type, ['admin', 'teacher'], true);
    }

    public function rules(): array
    {
        return [
            'schedule_id' => ['required', 'exists:schedule_items,id'],
            'date' => ['required', 'date'],
            'finalize_empty_as' => ['nullable', Rule::in(['absent', 'leave_as_empty'])],
        ];
    }
}
