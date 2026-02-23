<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TeacherResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->user->name,
            'nama_guru' => $this->user->name, // For Deskta
            'nip' => $this->nip,
            'code' => $this->nip, // Virtual field untuk Mobile (backward compatible)
            'kode_guru' => $this->kode_guru ?? $this->nip, // For Deskta
            'email' => $this->user->email,
            'phone' => $this->user->phone,
            'contact' => $this->user->contact,
            'subject' => $this->subject,
            'subject_name' => $this->subject, // Alias untuk Mobile
            'role' => $this->jabatan,
            'waka_field' => $this->bidang,
            'major_expertise' => $this->konsentrasi_keahlian,
            'homeroom_class_id' => $this->homeroom_class_id,
            'homeroom_class' => $this->whenLoaded('homeroomClass', function () {
                return [
                    'id' => $this->homeroomClass->id,
                    'name' => $this->homeroomClass->name,
                    'grade' => $this->homeroomClass->grade_roman, // Mapping to Roman
                    'major' => $this->homeroomClass->major?->code,
                    'major_name' => $this->homeroomClass->major?->name,
                ];
            }),
            'photo_url' => $this->user->photo_url ?? null,
            'schedule_image_path' => $this->schedule_image_path ?? 'schedules/defaults/default_schedule.jpg',
            'schedule_image_url' => $this->schedule_image_path ? asset('storage/'.$this->schedule_image_path) : asset('storage/schedules/defaults/default_schedule.jpg'),
            'classes_count' => \App\Models\ClassSchedule::whereHas('dailySchedules.scheduleItems', function ($q) {
                $q->where('teacher_id', $this->id);
            })->distinct('class_id')->count('class_id'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
