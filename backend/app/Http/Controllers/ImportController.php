<?php

namespace App\Http\Controllers;

use App\Models\Classes;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class ImportController extends Controller
{
    private function formatValidationErrors($validator, array $items): JsonResponse
    {
        $errors = [];
        $failedRows = [];

        foreach ($validator->errors()->messages() as $field => $messages) {
            if (preg_match('/items\.(\d+)\.(.+)/', $field, $matches)) {
                $row = (int) $matches[1] + 1; // 1-indexed for the user
                $column = $matches[2];
                $failedRows[$row] = true;

                foreach ($messages as $message) {
                    $errors[] = [
                        'row' => $row,
                        'column' => $column,
                        'message' => $message,
                    ];
                }
            } elseif ($field === 'items') {
                foreach ($messages as $message) {
                    $errors[] = [
                        'row' => 0,
                        'column' => 'file',
                        'message' => $message,
                    ];
                }
            }
        }

        $totalRows = count($items);
        $failedCount = count($failedRows);

        return response()->json([
            'total_rows' => $totalRows,
            'success_count' => 0, // Transaction will abort, so 0 success
            'failed_count' => $failedCount,
            'errors' => $errors,
        ], 422);
    }

    public function importSiswa(Request $request): JsonResponse
    {
        $items = $request->input('items', []);

        $validator = Validator::make($request->all(), [
            'items' => ['required', 'array', 'min:1'],
            'items.*.name' => ['required', 'string', 'max:255'],
            'items.*.username' => ['nullable', 'string', 'max:50', 'distinct', 'unique:users,username'],
            'items.*.email' => ['nullable', 'email', 'distinct', 'unique:users,email'],
            'items.*.password' => ['nullable', 'string'],
            'items.*.nisn' => ['required', 'numeric', 'distinct', 'unique:student_profiles,nisn'],
            'items.*.nis' => ['nullable', 'string', 'distinct', 'unique:student_profiles,nis'],
            'items.*.gender' => ['nullable', 'in:L,P'],
            'items.*.address' => ['nullable', 'string'],
            'items.*.class_id' => ['required', 'exists:classes,id'],
            'items.*.is_class_officer' => ['nullable', 'boolean'],
            'items.*.phone' => ['nullable', 'string', 'max:30'],
            'items.*.contact' => ['nullable', 'string', 'max:50'],
        ]);

        if ($validator->fails()) {
            return $this->formatValidationErrors($validator, $items);
        }

        $count = 0;

        try {
            DB::transaction(function () use ($items, &$count) {
                foreach ($items as $item) {
                    // Auto-generate missing fields (same as StudentController)
                    $item['username'] = $item['username'] ?? $item['nisn'];
                    $item['nis'] = $item['nis'] ?? $item['nisn'];
                    $item['gender'] = $item['gender'] ?? 'L';
                    $item['address'] = $item['address'] ?? '-';
                    $password = isset($item['password']) && strlen($item['password']) >= 6
                        ? $item['password']
                        : ($item['nisn'] ?? 'password123');

                    $user = User::create([
                        'name' => $item['name'],
                        'username' => $item['username'],
                        'email' => $item['email'] ?? null,
                        'password' => Hash::make($password),
                        'phone' => $item['phone'] ?? null,
                        'contact' => $item['contact'] ?? null,
                        'user_type' => 'student',
                    ]);

                    $user->studentProfile()->create([
                        'nisn' => $item['nisn'],
                        'nis' => $item['nis'],
                        'gender' => $item['gender'],
                        'address' => $item['address'],
                        'class_id' => $item['class_id'],
                        'is_class_officer' => $item['is_class_officer'] ?? false,
                    ]);
                    $count++;
                }
            });

            return response()->json([
                'total_rows' => count($items),
                'success_count' => $count,
                'failed_count' => 0,
                'errors' => [],
            ], 201);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Import Siswa failed: '.$e->getMessage(), ['trace' => $e->getTraceAsString()]);

            return response()->json([
                'total_rows' => count($items),
                'success_count' => 0,
                'failed_count' => count($items),
                'errors' => [
                    [
                        'row' => 0,
                        'column' => 'system',
                        'message' => 'Import failed: '.$e->getMessage(),
                    ],
                ],
            ], 500);
        }
    }

    public function importGuru(Request $request): JsonResponse
    {
        $items = $request->input('items', []);

        $validator = Validator::make($request->all(), [
            'items' => ['required', 'array', 'min:1'],
            'items.*.name' => ['required', 'string', 'max:255'],
            'items.*.username' => ['nullable', 'string', 'max:50', 'distinct', 'unique:users,username'],
            'items.*.email' => ['nullable', 'email', 'distinct', 'unique:users,email'],
            'items.*.password' => ['nullable', 'string', 'min:6'],
            'items.*.nip' => ['nullable', 'string', 'distinct', 'unique:teacher_profiles,nip'],
            'items.*.phone' => ['nullable', 'string', 'max:30'],
            'items.*.contact' => ['nullable', 'string', 'max:50'],
            'items.*.homeroom_class_id' => ['nullable', 'exists:classes,id'],
            'items.*.subject' => ['nullable', 'string', 'max:100'],
            'items.*.jabatan' => ['nullable', 'string', 'in:Guru,Waka,Kapro,Wali Kelas'],
            'items.*.bidang' => ['nullable', 'string', 'max:100'],
            'items.*.konsentrasi_keahlian' => ['nullable', 'string', 'max:100'],
        ]);

        if ($validator->fails()) {
            return $this->formatValidationErrors($validator, $items);
        }

        $count = 0;

        try {
            DB::transaction(function () use ($items, &$count) {
                foreach ($items as $item) {
                    // Auto-generate missing fields (order matters!)
                    $item['nip'] = $item['nip'] ?? ($item['kode_guru'] ?? null);
                    $item['username'] = $item['username'] ?? ($item['nip'] ?? null);
                    $item['password'] = $item['password'] ?? ($item['nip'] ?? 'password123');
                    $item['jabatan'] = $item['jabatan'] ?? 'Guru';

                    // Map class_name to class_id if provided
                    if (! empty($item['class_name']) && empty($item['homeroom_class_id'])) {
                        $class = \App\Models\Classes::where('label', $item['class_name'])->first();
                        if ($class) {
                            $item['homeroom_class_id'] = $class->id;
                        }
                    }

                    $user = User::create([
                        'name' => $item['name'],
                        'username' => $item['username'],
                        'email' => $item['email'] ?? null,
                        'password' => Hash::make($item['password']),
                        'phone' => $item['phone'] ?? null,
                        'contact' => $item['contact'] ?? null,
                        'user_type' => 'teacher',
                    ]);

                    $user->teacherProfile()->create([
                        'nip' => $item['nip'],
                        'homeroom_class_id' => $item['homeroom_class_id'] ?? null,
                        'subject' => $item['subject'] ?? null,
                        'jabatan' => $item['jabatan'] ?? 'Guru',
                        'bidang' => $item['bidang'] ?? null,
                        'konsentrasi_keahlian' => $item['konsentrasi_keahlian'] ?? null,
                        'kode_guru' => $item['kode_guru'] ?? $item['nip'] ?? null,
                    ]);
                    $count++;
                }
            });

            return response()->json([
                'total_rows' => count($items),
                'success_count' => $count,
                'failed_count' => 0,
                'errors' => [],
            ], 201);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Import Guru failed: '.$e->getMessage(), ['trace' => $e->getTraceAsString()]);

            return response()->json([
                'total_rows' => count($items),
                'success_count' => 0,
                'failed_count' => count($items),
                'errors' => [
                    [
                        'row' => 0,
                        'column' => 'system',
                        'message' => 'Import failed: '.$e->getMessage(),
                    ],
                ],
            ], 500);
        }
    }

    public function importKelas(Request $request): JsonResponse
    {
        $items = $request->input('items', []);

        $validator = Validator::make($request->all(), [
            'items' => ['required', 'array', 'min:1'],
            'items.*.grade' => ['required', 'string'],
            'items.*.label' => ['required', 'string'],
            'items.*.major_id' => ['nullable', 'exists:majors,id'],
            'items.*.homeroom_teacher_id' => ['nullable', 'exists:teacher_profiles,id'],
        ]);

        if ($validator->fails()) {
            return $this->formatValidationErrors($validator, $items);
        }

        // Additional uniqueness validation: combination of grade, label, major_id must be unique within file and DB.
        // Doing this manually to be exact since unique mapping across multiple columns is complex for arrays in Laravel's distinct.
        $errors = [];
        $failedRows = [];
        $combinations = [];

        foreach ($items as $index => $item) {
            $row = $index + 1;
            $comb = $item['grade'].'_'.$item['label'].'_'.($item['major_id'] ?? 'none');

            if (isset($combinations[$comb])) {
                $failedRows[$row] = true;
                $errors[] = [
                    'row' => $row,
                    'column' => 'grade/label/major',
                    'message' => 'Kombinasi grade, label, dan jurusan duplikat dalam file.',
                ];
            } else {
                $combinations[$comb] = true;
            }

            // Check db
            $exists = Classes::where('grade', $item['grade'])
                ->where('label', $item['label'])
                ->when(isset($item['major_id']), function ($q) use ($item) {
                    return $q->where('major_id', $item['major_id']);
                }, function ($q) {
                    return $q->whereNull('major_id');
                })->exists();

            if ($exists) {
                $failedRows[$row] = true;
                $errors[] = [
                    'row' => $row,
                    'column' => 'grade/label/major',
                    'message' => 'Kelas sudah ada di database.',
                ];
            }
        }

        if (count($errors) > 0) {
            return response()->json([
                'total_rows' => count($items),
                'success_count' => 0,
                'failed_count' => count($failedRows),
                'errors' => $errors,
            ], 422);
        }

        $count = 0;

        try {
            DB::transaction(function () use ($items, &$count) {
                foreach ($items as $item) {
                    $class = Classes::create([
                        'grade' => $item['grade'],
                        'label' => $item['label'],
                        'major_id' => $item['major_id'] ?? null,
                    ]);

                    if (isset($item['homeroom_teacher_id'])) {
                        \App\Models\TeacherProfile::where('id', $item['homeroom_teacher_id'])
                            ->update(['homeroom_class_id' => $class->id]);
                    }
                    $count++;
                }
            });

            return response()->json([
                'total_rows' => count($items),
                'success_count' => $count,
                'failed_count' => 0,
                'errors' => [],
            ], 201);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Import Kelas failed: '.$e->getMessage(), ['trace' => $e->getTraceAsString()]);

            return response()->json([
                'total_rows' => count($items),
                'success_count' => 0,
                'failed_count' => count($items),
                'errors' => [
                    [
                        'row' => 0,
                        'column' => 'system',
                        'message' => 'Import failed: '.$e->getMessage(),
                    ],
                ],
            ], 500);
        }
    }

    public function importJadwal(Request $request): JsonResponse
    {
        $items = $request->input('items', []);

        // Accept both ID-based and name-based format
        // ID-based: { class_id, semester, year, day, start_time, end_time, subject_id, teacher_profile_id }
        // Name-based: { class_name, semester, year, day, start_time, end_time, subject_name, teacher_nip }

        // Resolve name-based items to ID-based
        $resolvedItems = [];
        foreach ($items as $item) {
            $resolved = $item;

            // Resolve class_name to class_id
            if (isset($item['class_name']) && empty($item['class_id'])) {
                $class = \App\Models\Classes::where('name', $item['class_name'])->first();
                if (!$class) {
                    return response()->json([
                        'message' => "Kelas tidak ditemukan: {$item['class_name']}"
                    ], 422);
                }
                $resolved['class_id'] = $class->id;
            }

            // Resolve subject_name to subject_id
            if (isset($item['subject_name']) && empty($item['subject_id'])) {
                $subject = \App\Models\Subject::where('name', $item['subject_name'])->first();
                if (!$subject) {
                    return response()->json([
                        'message' => "Mata pelajaran tidak ditemukan: {$item['subject_name']}"
                    ], 422);
                }
                $resolved['subject_id'] = $subject->id;
            }

            // Resolve teacher_nip to teacher_profile_id
            if (isset($item['teacher_nip']) && empty($item['teacher_profile_id'])) {
                $teacher = \App\Models\TeacherProfile::where('kode_guru', $item['teacher_nip'])
                    ->orWhere('nip', $item['teacher_nip'])->first();
                if (!$teacher) {
                    return response()->json([
                        'message' => "Guru tidak ditemukan: {$item['teacher_nip']}"
                    ], 422);
                }
                $resolved['teacher_profile_id'] = $teacher->id;
            }

            // Normalize semester (1 -> ganjil, 2 -> genap)
            if (isset($item['semester'])) {
                $semesterMap = ['1' => 'ganjil', 'ganjil' => 'ganjil', '2' => 'genap', 'genap' => 'genap'];
                $resolved['semester'] = $semesterMap[$item['semester']] ?? $item['semester'];
            }

            // Normalize day to lowercase Indonesian
            if (isset($item['day'])) {
                $dayMap = ['senin' => 'senin', 'selasa' => 'selasa', 'rabu' => 'rabu', 'kamis' => 'kamis', 'jumat' => 'jumat', 'jumat' => 'jumat', 'sabtu' => 'sabtu', 'minggu' => 'minggu'];
                $dayLower = strtolower($item['day']);
                $resolved['day'] = $dayMap[$dayLower] ?? $dayLower;
            }

            // Add seconds to time if not present
            if (isset($item['start_time']) && strlen($item['start_time']) === 5) {
                $resolved['start_time'] = $item['start_time'] . ':00';
            }
            if (isset($item['end_time']) && strlen($item['end_time']) === 5) {
                $resolved['end_time'] = $item['end_time'] . ':00';
            }

            $resolvedItems[] = $resolved;
        }

        $items = $resolvedItems;

        $validator = Validator::make(['items' => $items], [
            'items' => ['required', 'array', 'min:1'],
            'items.*.class_id' => ['required', 'exists:classes,id'],
            'items.*.semester' => ['required', 'in:ganjil,genap'],
            'items.*.year' => ['required', 'string'],
            'items.*.day' => ['required', 'in:senin,selasa,rabu,kamis,jumat,sabtu,minggu'],
            'items.*.start_time' => ['required', 'date_format:H:i:s'],
            'items.*.end_time' => ['required', 'date_format:H:i:s', 'after:items.*.start_time'],
            'items.*.subject_id' => ['required', 'exists:subjects,id'],
            'items.*.teacher_profile_id' => ['required', 'exists:teacher_profiles,id'],
        ]);

        if ($validator->fails()) {
            return $this->formatValidationErrors($validator, $items);
        }

        $errors = [];
        $failedRows = [];

        // Validate overlapping schedule (Time validation)
        foreach ($items as $index => $item) {
            $row = $index + 1;

            if ($item['start_time'] >= $item['end_time']) {
                $failedRows[$row] = true;
                $errors[] = [
                    'row' => $row,
                    'column' => 'start_time/end_time',
                    'message' => 'Waktu mulai harus lebih awal dari waktu selesai.',
                ];

                continue;
            }

            // Check for collision with incoming items
            foreach ($items as $index2 => $item2) {
                if ($index === $index2) {
                    continue;
                }
                if ($item['day'] === $item2['day']) {
                    $isOverlappingTime = ($item['start_time'] < $item2['end_time'] && $item['end_time'] > $item2['start_time']);
                    if ($isOverlappingTime) {
                        if ($item['teacher_profile_id'] === $item2['teacher_profile_id']) {
                            $failedRows[$row] = true;
                            $errors[] = [
                                'row' => $row,
                                'column' => 'schedule',
                                'message' => 'Bentrok jadwal guru di dalam file pada hari '.$item['day'],
                            ];
                        }
                        if ($item['class_id'] === $item2['class_id']) {
                            $failedRows[$row] = true;
                            $errors[] = [
                                'row' => $row,
                                'column' => 'schedule',
                                'message' => 'Bentrok jadwal kelas di dalam file pada hari '.$item['day'],
                            ];
                        }
                    }
                }
            }
        }

        if (count($errors) > 0) {
            return response()->json([
                'total_rows' => count($items),
                'success_count' => 0,
                'failed_count' => count($failedRows),
                'errors' => $errors,
            ], 422);
        }

        $count = 0;

        try {
            DB::transaction(function () use ($items, &$count, &$errors, &$failedRows) {
                foreach ($items as $index => $item) {
                    $row = $index + 1;

                    // Check database for existing class schedules to avoid collision
                    // For thorough collision check in DB:
                    // This is simple for a clean database but let's check properly

                    // DB logic to insert Jadwal...
                    // Usually we search if ClassSchedule exists for (class_id, semester, year)
                    $classSchedule = \App\Models\ClassSchedule::firstOrCreate(
                        [
                            'class_id' => $item['class_id'],
                            'semester' => $item['semester'],
                            'year' => $item['year'],
                        ],
                        [
                            'is_active' => true,
                        ]
                    );

                    $dailySchedule = $classSchedule->dailySchedules()->firstOrCreate([
                        'day' => strtolower($item['day']),
                    ]);

                    // Check DB Collision
                    $existsTeacher = \App\Models\ScheduleItem::whereHas('dailySchedule', function ($q) use ($item) {
                        $q->where('day', strtolower($item['day']));
                    })
                        ->where('teacher_profile_id', $item['teacher_profile_id'])
                        ->where(function ($query) use ($item) {
                            $query->where('start_time', '<', $item['end_time'])
                                ->where('end_time', '>', $item['start_time']);
                        })
                        ->exists();

                    if ($existsTeacher) {
                        throw new \Exception("Row {$row}: Guru sudah ada jadwal di jam yang sama pada hari {$item['day']}");
                    }

                    $existsClass = $dailySchedule->scheduleItems()
                        ->where(function ($query) use ($item) {
                            $query->where('start_time', '<', $item['end_time'])
                                ->where('end_time', '>', $item['start_time']);
                        })
                        ->exists();

                    if ($existsClass) {
                        throw new \Exception("Row {$row}: Kelas sudah ada jadwal di jam yang sama pada hari {$item['day']}");
                    }

                    $dailySchedule->scheduleItems()->create([
                        'subject_id' => $item['subject_id'],
                        'teacher_profile_id' => $item['teacher_profile_id'],
                        'start_time' => $item['start_time'],
                        'end_time' => $item['end_time'],
                    ]);

                    $count++;
                }
            });

            return response()->json([
                'total_rows' => count($items),
                'success_count' => $count,
                'failed_count' => 0,
                'errors' => [],
            ], 201);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Import Jadwal failed: '.$e->getMessage(), ['trace' => $e->getTraceAsString()]);

            return response()->json([
                'total_rows' => count($items),
                'success_count' => 0,
                'failed_count' => count($items), // Rollback affects all
                'errors' => [
                    [
                        'row' => 0,
                        'column' => 'system/collision',
                        'message' => $e->getMessage(),
                    ],
                ],
            ], 500);
        }
    }
}
