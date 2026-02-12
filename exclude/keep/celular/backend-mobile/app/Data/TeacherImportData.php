<?php

namespace App\Data;

use Illuminate\Http\Request;

class TeacherImportData
{
    public function __construct(
        public array $items
    ) {}

    public static function fromRequest(Request $request): self
    {
        return new self(
            items: $request->input('items', [])
        );
    }

    public function toArray(): array
    {
        return [
            'items' => $this->items,
        ];
    }
}
