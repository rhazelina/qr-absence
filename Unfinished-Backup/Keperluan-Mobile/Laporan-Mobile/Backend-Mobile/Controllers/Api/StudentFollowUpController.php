<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StudentFollowUp;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class StudentFollowUpController extends Controller
{
    /**
     * Menyimpan data tindak lanjut dari Guru ke Siswa.
     */
    public function store(Request $request)
    {
        // 1. Validasi input - gunakan tabel users karena student disimpan di sana
        $validated = $request->validate([
            'student_id' => 'required|exists:users,id',
            'note'       => 'required|string',
            'action'     => 'nullable|string',
            'date'       => 'nullable|date',
        ]);

        // 2. Tambahkan data pendukung otomatis
        $validated['teacher_id'] = Auth::id(); // Ambil ID Guru yang login
        $validated['date'] = $validated['date'] ?? now()->toDateString();
        $validated['type'] = $request->input('type', 'warning'); // Default UI mengirim ini

        try {
            // 3. Simpan ke database
            $followUp = StudentFollowUp::create($validated);

            // Fetch relations for return
            $followUp->load(['student.studentProfile.classRoom.major']);
            $student = $followUp->student;
            $profile = $student ? $student->studentProfile : null;
            
            $majorName = '-';
            if ($profile && $profile->classRoom && $profile->classRoom->major) {
                $majorName = $profile->classRoom->major->name;
            }

            return response()->json([
                'success' => true,
                'message' => 'Tindak lanjut berhasil disimpan! ^w^',
                'data'    => [
                    'id' => $followUp->id,
                    'student_id' => $followUp->student_id,
                    'student_name' => $student ? $student->name : 'Unknown',
                    'nisn' => $profile ? $profile->nisn : '-',
                    'major_name' => $majorName,
                    'notes' => $followUp->note,
                    'type' => $followUp->type ?? 'warning',
                    'created_at' => $followUp->created_at->toDateTimeString()
                ]
            ], 201);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Melihat riwayat tindak lanjut (untuk fitur Riwayat)
     */
    public function index()
    {
        // Eager load nested relations untuk mengambil Nama, NISN, dan Jurusan
        $data = StudentFollowUp::with(['student.studentProfile.classRoom.major'])
            ->where('teacher_id', Auth::id())
            ->latest()
            ->get();

        $formattedData = $data->map(function ($item) {
            $student = $item->student;
            $profile = $student ? $student->studentProfile : null;
            
            // Mendapatkan data jurusan dari nested relations
            $majorName = '-';
            if ($profile && $profile->classRoom && $profile->classRoom->major) {
                $majorName = $profile->classRoom->major->name;
            }

            return [
                'id' => $item->id,
                'student_id' => $item->student_id,
                // Pastikan format JSON cocok dengan parameter model StudentFollowUp di Kotlin
                'student_name' => $student ? $student->name : 'Unknown',
                'nisn' => $profile ? $profile->nisn : '-',
                'major_name' => $majorName, // Tambahan field Jurusan
                'absence_count' => 0, // Fallback default
                'latest_absence' => $item->date,
                'note' => $item->note,
            ];
        });

        return response()->json([
            'success' => true,
            'data'    => $formattedData
        ]);
    }
}