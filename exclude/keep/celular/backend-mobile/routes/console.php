<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

use Illuminate\Support\Facades\Schedule;
use App\Jobs\SendDailyAttendanceReport;
use App\Jobs\SendWeeklyParentReport;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// 1. Close daily attendance
Schedule::command('attendance:close-daily')->dailyAt('16:00');

// 2. Send daily summary report to Waka
Schedule::job(new SendDailyAttendanceReport)->dailyAt('17:00');

// 3. Send weekly parent summary report (every Friday afternoon)
Schedule::job(new SendWeeklyParentReport)->weeklyOn(5, '16:30');

// 4. Prune Telescope entries
Schedule::command('telescope:prune --hours=48')->daily();

// 5. Prune expired Sanctum tokens
Schedule::command('sanctum:prune-expired --hours=24')->daily();

// 6. Clear application logs
Schedule::command('log:clear')->weekly();

// 7. Clear old password reset tokens
Schedule::command('auth:clear-resets')->everyFifteenMinutes();
