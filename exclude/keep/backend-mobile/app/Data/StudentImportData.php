<?php

namespace App\Data;

use Illuminate\Http\Request;

class StudentImportData
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
}
