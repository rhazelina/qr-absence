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
            'username' => ['nullable', 'string', 'max:50', 'unique:users,username'],
            'email' => ['nullable', 'email', 'unique:users,email'],
            'password' => ['nullable', 'string', 'min:6'],
            'nip' => ['nullable', 'string', 'unique:teacher_profiles,nip'],
            'phone' => ['nullable', 'string', 'max:30'],
            'contact' => ['nullable', 'string', 'max:50'],
            'homeroom_class_id' => ['nullable', 'exists:classes,id'],
            'subject' => ['nullable', 'string', 'max:100'],
            'jabatan' => ['nullable', 'string', 'in:Guru,Waka,Kapro,Wali Kelas'],
            'bidang' => ['nullable', 'string', 'max:100'],
            'konsentrasi_keahlian' => ['nullable', 'string', 'max:100'],
            'kode_guru' => ['nullable', 'string', 'max:50', 'unique:teacher_profiles,kode_guru'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama guru wajib diisi',
            'nip.unique' => 'NIP sudah terdaftar',
            'jabatan.in' => 'Jabatan tidak valid',
        ];
    }
}
