<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->index('status');
            $table->index(['student_id', 'status']);
        });

        if (! Schema::hasColumn('teacher_profiles', 'subject')) {
            Schema::table('teacher_profiles', function (Blueprint $table) {
                $table->string('subject')->nullable();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['student_id', 'status']);
        });
    }
};
