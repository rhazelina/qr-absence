<?php

namespace App\Console\Commands;

use App\Services\AttendanceService;
use Illuminate\Console\Command;

class AutoCloseScheduleAttendanceCommand extends Command
{
    protected $signature = 'attendance:auto-mark-absent
        {--date= : Tanggal target (YYYY-MM-DD)}
        {--schedule_id= : Proses satu schedule tertentu}
        {--force : Paksa proses walau end_time belum lewat pada tanggal target}';

    protected $description = 'Mark absent automatically for ended schedules when students have no attendance record.';

    public function __construct(private readonly AttendanceService $attendanceService)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $result = $this->attendanceService->autoMarkAbsentForEndedSchedules(
            $this->option('date') ?: now()->toDateString(),
            $this->option('schedule_id') ? (int) $this->option('schedule_id') : null,
            (bool) $this->option('force')
        );

        $this->info(sprintf(
            'Processed %d schedules and created %d absent attendances for %s.',
            $result['processed_schedules'],
            $result['created_absent_attendances'],
            $result['date']
        ));

        return self::SUCCESS;
    }
}
