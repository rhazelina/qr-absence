<?php

namespace App\Data;

use Illuminate\Http\Request;

class BulkScheduleData
{
    public function __construct(
        public string $day,
        public int $semester,
        public int $year,
        public array $items
    ) {}

    public static function fromRequest(Request $request): self
    {
        return new self(
            day: $request->input('day'),
            semester: $request->integer('semester'),
            year: $request->integer('year'),
            items: $request->input('items', [])
        );
    }
}
