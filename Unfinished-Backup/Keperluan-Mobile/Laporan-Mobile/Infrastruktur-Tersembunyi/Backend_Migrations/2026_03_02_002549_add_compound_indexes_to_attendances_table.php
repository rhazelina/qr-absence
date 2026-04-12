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
            // Speed up student trend and dashboard queries
            $table->index(['student_id', 'date', 'status'], 'idx_attendance_student_date_status');

            // Speed up schedule-based monitoring and rekap
            $table->index(['schedule_id', 'date'], 'idx_attendance_schedule_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->dropIndex('idx_attendance_student_date_status');
            $table->dropIndex('idx_attendance_schedule_date');
        });
    }
};
