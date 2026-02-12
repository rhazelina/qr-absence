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
        Schema::table('absence_requests', function (Blueprint $table) {
            $table->foreignId('teacher_id')->nullable()->after('student_id')->constrained('teacher_profiles')->nullOnDelete();
            $table->unsignedBigInteger('student_id')->nullable()->change();
            $table->unsignedBigInteger('class_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('absence_requests', function (Blueprint $table) {
            $table->dropForeign(['teacher_id']);
            $table->dropColumn('teacher_id');
            $table->unsignedBigInteger('student_id')->nullable(false)->change();
            $table->unsignedBigInteger('class_id')->nullable(false)->change();
        });
    }
};