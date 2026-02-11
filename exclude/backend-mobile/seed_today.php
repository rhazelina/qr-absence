<?php
require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$today = '2026-02-11';
$statuses = ['hadir', 'terlambat', 'sakit', 'izin', 'alpha', 'pulang'];

// Get students from class 19 (XI RPL 1 - wali kelas class)
$students = \App\Models\Student::where('class_id', 19)->take(20)->get();

foreach ($students as $i => $student) {
    \App\Models\Attendance::create([
        'date' => $today,
        'student_id' => $student->id,
        'attendee_type' => 'student',
        'status' => $statuses[$i % count($statuses)],
        'checked_in_at' => $today . ' 07:' . str_pad($i, 2, '0', STR_PAD_LEFT) . ':00',
        'source' => 'manual'
    ]);
}

echo "Created " . count($students) . " attendance records for class 19 on $today\n";
