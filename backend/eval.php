<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Classes;
use App\Models\Subject;
use App\Models\TeacherProfile;
use App\Models\StudentProfile;
use App\Models\ClassSchedule;
use App\Models\QrCode;
use App\Models\Attendance;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Http\Controllers\QrCodeController;
use App\Http\Controllers\AttendanceController;
use Illuminate\Http\Request;
use App\Models\User;

$out = [];
DB::beginTransaction();
try {
    // 1. Inject Dummy Subject
    $subject = Subject::firstOrCreate(['name' => 'TESTING QR'], ['code' => 'TQR', 'kd_mapel' => 'TQR']);

    // 2. Select 1 Teacher & 1 Class & 1 Student
    $teacher = TeacherProfile::with('user')->first();
    $student = StudentProfile::with(['user', 'classRoom'])->first();
    $class = clone $student->classRoom; // Use the class of the student so the student can scan it

    // 3. Create Schedule for today
    $dayOfWeek = now()->format('l'); // e.g. 'Monday'
    
    $classSchedule = ClassSchedule::firstOrCreate([
        'class_id' => $class->id,
        'semester' => 'ganjil',
        'year' => '2024/2025' // mock year
    ], ['is_active' => true]);

    $dailySchedule = $classSchedule->dailySchedules()->firstOrCreate(['day' => $dayOfWeek]);

    $startTime = now()->subMinutes(10)->format('H:i:s');
    $endTime = now()->addMinutes(50)->format('H:i:s');

    $scheduleItem = $dailySchedule->scheduleItems()->create([
        'subject_id' => $subject->id,
        'teacher_id' => $teacher->id,
        'start_time' => $startTime,
        'end_time' => $endTime,
        'room' => 'Lab Komputer'
    ]);

    $out['step1'] = "Inject successful: Subject, ScheduleItem {$scheduleItem->id} for Teacher {$teacher->id} in Class {$class->name}";

    // 4. Generate QR (Mocking Teacher Request)
    $requestGenerate = Request::create('/api/qrcodes/generate', 'POST', [
        'schedule_id' => $scheduleItem->id,
        'type' => 'student',
        'duration' => 60
    ]);
    // Mock Auth
    $requestGenerate->setUserResolver(function() use ($teacher) {
        return clone $teacher->user;
    });

    $qrController = app(QrCodeController::class);
    $responseQr = $qrController->generate($requestGenerate);
    $qrData = json_decode($responseQr->getContent(), true);

    $out['step2'] = "Generate QR successful: Token -> " . ($qrData['payload']['token'] ?? 'FAIL');
    
    // 5. Scan QR (Mocking Student Request)
    $requestScan = Request::create('/api/attendance/scan', 'POST', [
        'token' => $qrData['payload']['token'],
        'latitude' => -6.2, 
        'longitude' => 106.8
    ]);
    try {
        $requestScan->setUserResolver(function() use ($student) {
            return clone $student->user; // Avoid caching issues
        });

        $attendanceController = app(AttendanceController::class);
        $responseScan = $attendanceController->scan($requestScan);
        $scanData = json_decode($responseScan->getContent(), true);
        $out['step3_scan1_status'] = $responseScan->getStatusCode();
        $out['step3_scan1'] = $scanData;
    } catch (\Exception $e) {
        $out['step3_scan1_error'] = $e->getMessage() . "\n" . $e->getTraceAsString();
    }

    // 6. Scan Twice (Duplicate Check)
    try {
        // Need a fresh request object because properties get accessed
        $requestScan2 = Request::create('/api/attendance/scan', 'POST', [
            'token' => $qrData['payload']['token'],
            'latitude' => -6.2, 
            'longitude' => 106.8
        ]);
        $requestScan2->setUserResolver(function() use ($student) {
            return clone $student->user;
        });

        $responseScan2 = $attendanceController->scan($requestScan2);
        $scanData2 = json_decode($responseScan2->getContent(), true);
        $out['step4_scan2_status'] = $responseScan2->getStatusCode();
        $out['step4_scan2'] = $scanData2;
    } catch (\Exception $e) {
        $out['step4_scan2_error'] = $e->getMessage();
    }

    // Verify DB
    $hasAttendance = Attendance::where('student_id', $student->id)
        ->where('schedule_id', $scheduleItem->id)
        ->where('date', now()->toDateString())
        ->exists();

    $out['step5_verification'] = $hasAttendance ? "Presence recorded successfully." : "Failed to find presence.";

} catch (\Exception $e) {
    $out['error'] = $e->getMessage() . ' at line ' . $e->getLine() . ' in ' . $e->getFile();
} finally {
    // Rollback so we don't mess up DB
    DB::rollBack();
}

echo json_encode($out, JSON_PRETTY_PRINT) . PHP_EOL;

