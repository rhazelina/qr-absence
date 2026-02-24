<?php

use App\Models\Classes;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $classes = Classes::all();

        foreach ($classes as $class) {
            $label = $class->label;
            if (! $label) {
                continue;
            }

            $newLabel = $label;

            // Replace Roman numerals at the start or surrounded by boundaries
            // We use Case Sensitive replacement to avoid matching substrings in major codes if any
            $replacements = [
                '/^XII\b/i' => '12',
                '/^XI\b/i' => '11',
                '/^X\b/i' => '10',
                '/\bXII\b/i' => '12',
                '/\bXI\b/i' => '11',
                '/\bX\b/i' => '10',
            ];

            foreach ($replacements as $pattern => $replacement) {
                $newLabel = preg_replace($pattern, $replacement, $newLabel);
            }

            if ($newLabel !== $label) {
                $class->update(['label' => $newLabel]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reversing is complex because we don't know original state exactly,
        // but we can try to map back 10->X, 11->XI, 12->XII if needed.
        // For now, leave empty or basic mapping.
    }
};
