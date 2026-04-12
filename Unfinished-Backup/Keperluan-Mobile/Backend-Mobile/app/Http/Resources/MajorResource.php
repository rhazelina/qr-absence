<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MajorResource extends JsonResource
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
            'code' => $this->code,
            'kodeJurusan' => $this->code,
            'name' => $this->name,
            'namaJurusan' => $this->name,
            'department' => $this->department,
            'program_keahlian' => $this->program_keahlian,
            'programKeahlian' => $this->program_keahlian,
            'bidang_keahlian' => $this->bidang_keahlian,
            'bidangKeahlian' => $this->bidang_keahlian,
            'category' => $this->category,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
