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
        // Add Cascade Delete to attendance_attachments
        Schema::table('attendance_attachments', function (Blueprint $table) {
            $table->dropForeign(['attendance_id']);
            $table->foreign('attendance_id')
                ->references('id')
                ->on('attendances')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('attendance_attachments', function (Blueprint $table) {
            $table->dropForeign(['attendance_id']);
            $table->foreign('attendance_id')
                ->references('id')
                ->on('attendances');
        });
    }
};
