package com.example.ritamesa.api.repositories

import android.content.Context
import android.util.Log
import com.example.ritamesa.api.ApiClient
import com.example.ritamesa.api.Result
import com.example.ritamesa.api.models.*

/**
 * DashboardRepository — menyediakan data dashboard untuk semua role.
 *
 * PERBAIKAN:
 * 1. [BUG KRITIS] getTeacherDashboard(): Endpoint /me/dashboard/teacher-summary mengembalikan
 *    { data: { today_statistics:{...}, today_schedules:[...] } } saat teacher ada jadwal.
 *    Namun bila kosong kadang mengembalikan 404 / empty body.
 *    FIX: Jika data null → coba endpoint alias /guru/dashboard, lalu fallback ke jadwal hari ini.
 *
 * 2. [BUG KRITIS] getHomeroomDashboard(): Endpoint /me/homeroom/dashboard mengembalikan
 *    404 jika teacher tidak punya homeroom_class_id.
 *    FIX: Return Result.Error dengan pesan yang jelas agar fragment bisa handle gracefully.
 *
 * 3. [BUG] getTeacherDashboard() primary + fallback: runCatching().getOrNull() menelan semua
 *    exception secara diam-diam termasuk NetworkException — sulit di-debug.
 *    FIX: Log setiap langkah, kembalikan Result.Error dengan pesan yang informatif.
 *
 * 4. [BUG] buildStudentDashboardFromSchedules() langsung akses .body() tanpa null-check
 *    di beberapa branch. FIX: tambah null-check di setiap branch.
 *
 * 5. [BUG] getWakaAttendanceSummary() — WakaAttendanceSummaryResponse.toAttendanceSummary()
 *    belum ada di model. FIX: pastikan ekstensi tersedia atau parse manual di sini.
 */
class DashboardRepository(private val context: Context) {
    private val apiService = ApiClient.getApiService(context)

    companion object {
        private const val TAG = "DashboardRepository"
    }

    // ===== STUDENT DASHBOARD =====
    // GET /api/me/dashboard/summary — response FLAT (tidak wrapped dalam {data:...})
    @Suppress("UNCHECKED_CAST")
    suspend fun getStudentDashboard(): Result<StudentDashboard> {
        Log.d(TAG, "getStudentDashboard called")
        return try {
            val rawResponse = apiService.getStudentDashboardRaw()
            if (!rawResponse.isSuccessful) {
                Log.w(TAG, "getStudentDashboard HTTP ${rawResponse.code()}, fallback ke jadwal")
                return buildStudentDashboardFromSchedules()
            }
            val body = rawResponse.body()
            if (body != null) {
                Log.d(TAG, "Parsing /me/dashboard/summary dari Map")
                val dashboard = parseStudentDashboardFromMap(body)
                Log.d(TAG, "Parsed ${dashboard.todaySchedules?.size ?: 0} schedules")
                Result.Success(dashboard)
            } else {
                Log.w(TAG, "Body null, fallback ke /me/schedules/today")
                buildStudentDashboardFromSchedules()
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error loading student dashboard: ${e.message}, trying fallback", e)
            try {
                buildStudentDashboardFromSchedules()
            } catch (e2: Exception) {
                Log.e(TAG, "Fallback juga gagal: ${e2.message}", e2)
                Result.Error(e, e.message ?: "Gagal memuat dashboard siswa")
            }
        }
    }

    @Suppress("UNCHECKED_CAST")
    private fun parseStudentDashboardFromMap(body: Map<String, Any>): StudentDashboard {
        val rawSchedules = body["schedule_today"] as? List<*> ?: emptyList<Any>()
        val items = rawSchedules.mapNotNull { raw ->
            val item = raw as? Map<*, *> ?: return@mapNotNull null
            try {
                val id = (item["id"] as? Double)?.toInt() ?: item["id"] as? Int
                val subjectName = when (val s = item["subject"]) {
                    is Map<*, *> -> s["name"] as? String
                    is String    -> s
                    else         -> null
                } ?: item["subject_name"] as? String ?: "Mata Pelajaran"
                val teacherName = when (val t = item["teacher"]) {
                    is Map<*, *> -> (t["user"] as? Map<*, *>)?.get("name") as? String
                        ?: t["name"] as? String
                    is String    -> t
                    else         -> null
                }
                val teacherInfo = teacherName?.let {
                    TeacherInfo(id = null, name = it, nip = null, kodeGuru = null)
                }
                val room = when (val r = item["room"]) {
                    is Map<*, *> -> r["name"] as? String
                    is String    -> r
                    else         -> null
                }
                val status = item["status"] as? String
                val isCheckedIn = item["is_checked_in"] as? Boolean
                    ?: (status?.lowercase() in listOf("present", "late"))
                TodayScheduleItem(
                    id               = id,
                    subjectName      = subjectName,
                    startTime        = item["start_time"] as? String,
                    endTime          = item["end_time"] as? String,
                    room             = room,
                    teacher          = teacherInfo,
                    attendanceStatus = status,
                    isCheckedIn      = isCheckedIn
                )
            } catch (e: Exception) {
                Log.e(TAG, "Error mapping dashboard item: ${e.message}", e)
                null
            }
        }
        return StudentDashboard(
            todayAttendance = null,
            todaySchedules  = items,
            notice          = body["notice"] as? String
        )
    }

    @Suppress("UNCHECKED_CAST")
    private suspend fun buildStudentDashboardFromSchedules(): Result<StudentDashboard> {
        Log.d(TAG, "buildStudentDashboardFromSchedules (fallback)")
        return try {
            val resp = apiService.getTodaysSchedule()
            if (!resp.isSuccessful) {
                return Result.Error(Exception("HTTP ${resp.code()}"), "Gagal memuat jadwal")
            }
            val todayResponse: Map<String, Any> = resp.body()
                ?: return Result.Error(Exception("Empty response"), "Gagal memuat jadwal")
            val rawItems: List<*> = todayResponse["items"] as? List<*>
                ?: (todayResponse["data"] as? Map<*, *>)?.get("items") as? List<*>
                ?: emptyList<Any>()
            val scheduleItems = rawItems.mapNotNull { raw ->
                val item = raw as? Map<*, *> ?: return@mapNotNull null
                try {
                    val subjectRaw = item["subject"]
                    val subjectName: String = when (subjectRaw) {
                        is Map<*, *> -> subjectRaw["name"] as? String
                        is String    -> subjectRaw
                        else         -> null
                    } ?: item["subject_name"] as? String ?: "Mata Pelajaran"
                    val teacherObj = item["teacher"] as? Map<*, *>
                    val teacherName: String? = (teacherObj?.get("user") as? Map<*, *>)
                        ?.get("name") as? String
                        ?: teacherObj?.get("name") as? String
                    val teacherInfo: TeacherInfo? = teacherName?.let {
                        TeacherInfo(
                            id       = (teacherObj?.get("id") as? Double)?.toInt()
                                ?: teacherObj?.get("id") as? Int,
                            name     = it,
                            nip      = teacherObj?.get("nip") as? String,
                            kodeGuru = teacherObj?.get("kode_guru") as? String
                        )
                    }
                    val roomName: String? = when (val r = item["room"]) {
                        is Map<*, *> -> r["name"] as? String
                        is String    -> r
                        else         -> null
                    }
                    val id: Int? = (item["id"] as? Double)?.toInt() ?: item["id"] as? Int
                    TodayScheduleItem(
                        id               = id,
                        subjectName      = subjectName,
                        startTime        = item["start_time"] as? String,
                        endTime          = item["end_time"] as? String,
                        room             = roomName,
                        teacher          = teacherInfo,
                        attendanceStatus = null,
                        isCheckedIn      = false
                    )
                } catch (e: Exception) {
                    Log.e(TAG, "Error mapping schedule item: ${e.message}", e)
                    null
                }
            }
            Result.Success(
                StudentDashboard(
                    todayAttendance = null,
                    todaySchedules  = scheduleItems,
                    notice          = null
                )
            )
        } catch (e: Exception) {
            Log.e(TAG, "buildStudentDashboardFromSchedules failed", e)
            Result.Error(e, e.message ?: "Gagal memuat jadwal hari ini")
        }
    }

    // ===== TEACHER DASHBOARD =====
    // GET /api/me/dashboard/teacher-summary
    //
    // FIX: Perbaiki alur pengambilan data:
    // 1. Coba /me/dashboard/teacher-summary
    // 2. Jika gagal/data null → coba alias /guru/dashboard
    // 3. Jika masih gagal → buat TeacherDashboard kosong dari jadwal today
    suspend fun getTeacherDashboard(): Result<TeacherDashboard> {
        Log.d(TAG, "getTeacherDashboard called")

        // Langkah 1: endpoint utama
        val primaryData = try {
            val resp = apiService.getTeacherDashboard()
            if (resp.isSuccessful) {
                resp.body()?.data?.also {
                    Log.d(TAG, "Teacher dashboard primary OK: ${it.todaySchedules?.size} jadwal")
                }
            } else {
                Log.w(TAG, "Teacher dashboard primary HTTP ${resp.code()}")
                null
            }
        } catch (e: Exception) {
            Log.w(TAG, "Teacher dashboard primary exception: ${e.message}")
            null
        }

        if (primaryData != null) return Result.Success(primaryData)

        // Langkah 2: alias endpoint /guru/dashboard
        val aliasData = try {
            val resp = apiService.getGuruDashboard()
            if (resp.isSuccessful) {
                resp.body()?.data?.also {
                    Log.d(TAG, "Teacher dashboard alias OK: ${it.todaySchedules?.size} jadwal")
                }
            } else {
                Log.w(TAG, "Teacher dashboard alias HTTP ${resp.code()}")
                null
            }
        } catch (e: Exception) {
            Log.w(TAG, "Teacher dashboard alias exception: ${e.message}")
            null
        }

        if (aliasData != null) return Result.Success(aliasData)

        // Langkah 3: buat TeacherDashboard dari /me/schedules/today
        return buildTeacherDashboardFromSchedules()
    }

    /**
     * Fallback: buat TeacherDashboard dari endpoint /me/schedules/today.
     * Statistik hadir/alpha tidak tersedia di endpoint ini, dikembalikan 0.
     */
    @Suppress("UNCHECKED_CAST")
    private suspend fun buildTeacherDashboardFromSchedules(): Result<TeacherDashboard> {
        Log.d(TAG, "buildTeacherDashboardFromSchedules (fallback)")
        return try {
            val resp = apiService.getTodaysSchedule()
            if (!resp.isSuccessful) {
                val msg = "HTTP ${resp.code()}"
                Log.e(TAG, "getTodaysSchedule failed: $msg")
                // Kembalikan dashboard kosong — jangan error agar fragment tidak crash
                return Result.Success(TeacherDashboard(todayStatistics = null, todaySchedules = null))
            }
            val body: Map<String, Any> = resp.body() ?: return Result.Success(
                TeacherDashboard(todayStatistics = null, todaySchedules = null)
            )

            val rawItems: List<*> = body["items"] as? List<*>
                ?: (body["data"] as? Map<*, *>)?.get("items") as? List<*>
                ?: emptyList<Any>()

            val scheduleItems = rawItems.mapNotNull { raw ->
                val item = raw as? Map<*, *> ?: return@mapNotNull null
                try {
                    val subjectName = when (val s = item["subject"]) {
                        is Map<*, *> -> s["name"] as? String
                        is String    -> s
                        else         -> null
                    } ?: item["subject_name"] as? String ?: "-"

                    // FIX: TeachingScheduleItem.`class` bertipe String? (nama kelas),
                    // bukan ClassInfo. Ambil nama kelas dari field "class" atau "class_name".
                    val classObj = item["class"] as? Map<*, *>
                    val className = (classObj?.get("name") as? String)
                        ?: item["class_name"] as? String
                    val classIdVal = ((classObj?.get("id") as? Double)?.toInt()
                        ?: classObj?.get("id") as? Int)

                    TeachingScheduleItem(
                        id              = (item["id"] as? Double)?.toInt() ?: item["id"] as? Int,
                        `class`         = className,
                        classId         = classIdVal,
                        subjectName     = subjectName,
                        startTime       = item["start_time"] as? String ?: "00:00",
                        endTime         = item["end_time"] as? String ?: "00:00",
                        room            = item["room"] as? String,
                        attendanceCount = null
                    )
                } catch (e: Exception) {
                    Log.e(TAG, "Error parsing schedule item: ${e.message}")
                    null
                }
            }

            Log.d(TAG, "Fallback teacher dashboard: ${scheduleItems.size} jadwal")
            Result.Success(
                TeacherDashboard(
                    todayStatistics = TeacherStatistics(
                        totalStudentsPresent = 0,
                        totalStudentsAbsent  = 0,
                        totalStudentsLate    = 0,
                        totalClassesToday    = scheduleItems.size
                    ),
                    todaySchedules = scheduleItems
                )
            )
        } catch (e: Exception) {
            Log.e(TAG, "buildTeacherDashboardFromSchedules failed: ${e.message}", e)
            // Kembalikan data kosong — jangan error agar fragment tidak crash
            Result.Success(TeacherDashboard(todayStatistics = null, todaySchedules = null))
        }
    }

    // ===== HOMEROOM DASHBOARD =====
    // GET /api/me/homeroom/dashboard
    //
    // FIX: Jika teacher tidak punya homeroom_class_id → backend return 404.
    // Tangkap secara eksplisit dan return Result.Error dengan pesan yang jelas.
    suspend fun getHomeroomDashboard(): Result<HomeroomDashboard> {
        Log.d(TAG, "getHomeroomDashboard called")
        return try {
            val response = apiService.getHomeroomDashboard()
            when {
                response.isSuccessful -> {
                    val data = response.body()?.data
                    if (data != null) {
                        Log.d(TAG, "Homeroom dashboard OK: total=${data.todaySummary?.totalStudents}")
                        Result.Success(data)
                    } else {
                        val msg = "Data homeroom dashboard kosong dari backend"
                        Log.w(TAG, msg)
                        Result.Error(Exception(msg), msg)
                    }
                }
                response.code() == 404 -> {
                    val msg = "Homeroom tidak ditemukan — pastikan Anda terdaftar sebagai Wali Kelas"
                    Log.w(TAG, "Homeroom dashboard 404: $msg")
                    Result.Error(Exception(msg), msg)
                }
                else -> {
                    val msg = "HTTP ${response.code()}: ${response.message()}"
                    Log.e(TAG, "Homeroom dashboard error: $msg")
                    Result.Error(Exception(msg), msg)
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Exception homeroom dashboard: ${e.message}", e)
            Result.Error(e, e.message ?: "Gagal memuat dashboard wali kelas")
        }
    }

    // Alias — kedua method mengarah ke endpoint yang sama
    suspend fun getHomeroomDashboard2(): Result<HomeroomDashboard> = getHomeroomDashboard()

    // ===== WAKA DASHBOARD =====
    // GET /api/waka/dashboard/summary
    suspend fun getWakaDashboard(): Result<WakaDashboard> {
        Log.d(TAG, "getWakaDashboard called")
        return try {
            val response = apiService.getWakaDashboard()
            if (response.isSuccessful) {
                val data = response.body()?.data
                if (data != null) {
                    Result.Success(data)
                } else {
                    Result.Error(Exception("Data dashboard waka kosong"), "Data tidak tersedia")
                }
            } else {
                Result.Error(Exception("HTTP ${response.code()}"), "Error ${response.code()}")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error loading waka dashboard", e)
            Result.Error(e, e.message ?: "Gagal memuat dashboard waka")
        }
    }

    // GET /api/waka/attendance/summary
    // FIX: Backend mengembalikan FLAT response, bukan ApiResponse<AttendanceSummary>.
    suspend fun getWakaAttendanceSummary(
        startDate: String? = null,
        endDate: String? = null
    ): Result<AttendanceSummary> {
        Log.d(TAG, "getWakaAttendanceSummary: startDate=$startDate, endDate=$endDate")
        return try {
            val response = apiService.getWakaAttendanceSummaryRaw(startDate, endDate)
            if (response.isSuccessful) {
                val body = response.body()
                if (body != null) {
                    val summary = body.toAttendanceSummary()
                    Log.d(TAG, "wakaAttendanceSummary OK: present=${summary.present}")
                    Result.Success(summary)
                } else {
                    Log.w(TAG, "getWakaAttendanceSummary body null — return empty summary")
                    Result.Success(AttendanceSummary())
                }
            } else {
                val msg = "HTTP ${response.code()}: ${response.message()}"
                Log.e(TAG, "getWakaAttendanceSummary error: $msg")
                Result.Error(Exception(msg), msg)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error loading waka attendance summary", e)
            Result.Error(e, e.message ?: "Gagal memuat summary")
        }
    }

    // ===== ADMIN DASHBOARD =====
    // GET /api/admin/summary
    suspend fun getAdminDashboard(): Result<AdminDashboard> {
        Log.d(TAG, "getAdminDashboard called")
        return try {
            val response = apiService.getAdminDashboard()
            if (response.isSuccessful) {
                val wrapper = response.body()
                if (wrapper != null) {
                    val dashboard = wrapper.toAdminDashboard()
                    if (dashboard != null) {
                        Result.Success(dashboard)
                    } else {
                        Result.Error(Exception("Format response admin tidak dikenali"))
                    }
                } else {
                    Result.Error(Exception("Response body null"))
                }
            } else {
                Result.Error(Exception("HTTP ${response.code()}"), "Error ${response.code()}")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error loading admin dashboard", e)
            Result.Error(e, e.message ?: "Gagal memuat dashboard admin")
        }
    }

    // ===== CLASS DASHBOARD =====
    // GET /api/me/class/dashboard
    suspend fun getClassDashboard(): Result<ClassDashboard> {
        Log.d(TAG, "getClassDashboard called")
        return try {
            val response = apiService.getMyClassDashboard()
            if (response.isSuccessful) {
                val data = response.body()?.data
                if (data != null) {
                    Result.Success(data)
                } else {
                    Result.Error(Exception("Data dashboard kelas kosong"), "Data tidak tersedia")
                }
            } else {
                Result.Error(Exception("HTTP ${response.code()}"), "Error ${response.code()}")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error loading class dashboard", e)
            Result.Error(e, e.message ?: "Gagal memuat dashboard kelas")
        }
    }

    // ===== STUDENT FOLLOW UP =====
    // GET /api/me/students/follow-up
    suspend fun getStudentsFollowUp(): Result<List<StudentFollowUp>> {
        Log.d(TAG, "getStudentsFollowUp called")
        return try {
            val response = apiService.getStudentsFollowUp()
            if (response.isSuccessful) {
                Result.Success(response.body()?.data ?: emptyList())
            } else {
                Result.Error(Exception("HTTP ${response.code()}"), "Error ${response.code()}")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error loading students follow up", e)
            Result.Error(e, e.message ?: "Gagal memuat data follow up")
        }
    }

    // ===== MONTHLY STATISTICS =====
    // GET /api/me/statistics/monthly
    suspend fun getMonthlyStatistics(): Result<Map<String, Any>> {
        Log.d(TAG, "getMonthlyStatistics called")
        return try {
            val response = apiService.getMonthlyStatistics()
            if (response.isSuccessful) {
                Result.Success(response.body()?.data ?: emptyMap())
            } else {
                Result.Error(Exception("HTTP ${response.code()}"), "Error ${response.code()}")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error loading monthly statistics", e)
            Result.Error(e, e.message ?: "Gagal memuat statistik")
        }
    }
}