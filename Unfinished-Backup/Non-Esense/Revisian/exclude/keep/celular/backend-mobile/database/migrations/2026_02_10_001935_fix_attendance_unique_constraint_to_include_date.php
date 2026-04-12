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
            $table->dropUnique('attendance_unique_per_session');
            
            // Change date to date type to ensure uniqueness per day works consistently
            $table->date('date')->change();

            $table->unique(['attendee_type', 'student_id', 'teacher_id', 'schedule_id', 'date'], 'attendance_unique_per_session');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->dropUnique('attendance_unique_per_session');
            $table->dateTime('date')->change();
            $table->unique(['attendee_type', 'student_id', 'teacher_id', 'schedule_id'], 'attendance_unique_per_session');
        });
    }
};
