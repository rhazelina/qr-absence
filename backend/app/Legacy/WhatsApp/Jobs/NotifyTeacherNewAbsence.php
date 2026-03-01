<?php

namespace App\Jobs;

use App\Models\AbsenceRequest;
use App\Services\WhatsAppService;
use App\Services\WhatsAppTemplates;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class NotifyTeacherNewAbsence implements ShouldQueue
{
    use Queueable;

    public function __construct(public AbsenceRequest $request) {}

    public function handle(WhatsAppService $whatsapp): void
    {
        $request = $this->request->load(['student.user', 'student.classRoom.homeroomTeacher.user']);
        $studentName = $request->student->user->name;
        $className = $request->student->classRoom->name ?? 'Kelas';
        $status = match ($request->type) {
            'sick' => 'Sakit',
            'permit' => 'Izin',
            'dispensation' => 'Dispensasi',
            default => 'Izin'
        };

        $message = WhatsAppTemplates::absenceNotification($studentName, $className, $status);

        // Notify Homeroom Teacher
        $teacher = $request->student->classRoom?->homeroomTeacher;
        if ($teacher && $teacher->user->phone) {
            $whatsapp->sendMessage($teacher->user->phone, $message);
        }
    }
}
