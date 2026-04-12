<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAttendanceExcuseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'in:present,late,excused,sick,absent,dispensasi,dinas,izin,return,alpha,hadir,sakit,terlambat,pulang'],
            'reason' => ['nullable', 'string', 'required_if:status,return,pulang'],
            'attachment' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
            'replace_existing_attachment' => ['nullable', 'boolean'],
        ];
    }
}
