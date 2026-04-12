<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->boolean('is_draft')->default(false)->after('source');
            $table->timestamp('draft_saved_at')->nullable()->after('is_draft');
            $table->timestamp('finalized_at')->nullable()->after('draft_saved_at');
            $table->timestamp('manual_session_started_at')->nullable()->after('finalized_at');
            $table->index(['schedule_id', 'date', 'attendee_type', 'is_draft'], 'idx_attendance_schedule_date_draft');
        });

        DB::table('attendances')
            ->whereIn('source', ['manual', 'qrcode', 'teacher_scan', 'system_close', 'system_propagation'])
            ->update([
                'is_draft' => false,
                'finalized_at' => DB::raw('created_at'),
                'manual_session_started_at' => null,
            ]);
    }

    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->dropIndex('idx_attendance_schedule_date_draft');
            $table->dropColumn([
                'is_draft',
                'draft_saved_at',
                'finalized_at',
                'manual_session_started_at',
            ]);
        });
    }
};
