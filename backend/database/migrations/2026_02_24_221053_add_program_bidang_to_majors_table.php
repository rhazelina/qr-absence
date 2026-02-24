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
        Schema::table('majors', function (Blueprint $table) {
            $table->string('program_keahlian')->nullable()->after('department');
            $table->string('bidang_keahlian')->nullable()->after('program_keahlian');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('majors', function (Blueprint $table) {
            $table->dropColumn(['program_keahlian', 'bidang_keahlian']);
        });
    }
};
