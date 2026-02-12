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
        Schema::table('teacher_profiles', function (Blueprint $table) {
            $table->enum('jabatan', ['Guru', 'Waka', 'Kapro', 'Wali Kelas'])->default('Guru')->after('user_id');
            $table->string('bidang')->nullable()->after('jabatan');
            $table->string('konsentrasi_keahlian')->nullable()->after('bidang');
            $table->string('kode_guru')->unique()->nullable()->after('nip');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('teacher_profiles', function (Blueprint $table) {
            $table->dropColumn(['jabatan', 'bidang', 'konsentrasi_keahlian', 'kode_guru']);
        });
    }
};
