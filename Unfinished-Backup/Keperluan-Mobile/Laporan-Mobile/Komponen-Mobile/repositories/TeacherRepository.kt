package com.example.ritamesa.api.repositories

import android.content.Context
import android.util.Log
import com.example.ritamesa.api.ApiClient
import com.example.ritamesa.api.ApiUtils
import com.example.ritamesa.api.Result
import com.example.ritamesa.api.models.*

/**
 * TeacherRepository
 *
 * Fix yang digabung dari v1 (waka/admin) + v2 (guru/wali kelas):
 *
 * GURU:
 *   - getTeacherAttendance()   → handleApiCall + .data (v2: tidak pakai handleApiCallFlat)
 *   - getTeacherScheduleImage() → raw try-catch, bukan ApiUtils (v2)
 *   - getMyScheduleDetail()    → return TeacherScheduleDetailResponse langsung (v2)
 *   - getStudentsFollowUpUiModels() / createStudentFollowUp() → ditambah dari v2
 *
 * WALI KELAS:
 *   - getMyHomeroomStudents()  → raw try-catch, response.body() langsung (v2)
 *   - getMyHomeroomSchedules() → ambil dari HomeroomSchedulesResponse.items (v2, tidak ada OkHttp fallback)
 *   - getMyHomeroomAttendance() → ambil .data dari PaginatedResponse (v2)
 *
 * WAKA / ADMIN: tidak berubah dari v1.
 */
class TeacherRepository(private val context: Context) {
    private val apiService = ApiClient.getApiService(context)

    companion object {
        private const val TAG = "TeacherRepository"
    }

    // =========================================================
    // TEACHER CRUD
    // =========================================================

    suspend fun getTeachers(
        search: String? = null,
        page: Int? = null,
        perPage: Int? = 200
    ): Result<List<TeacherResource>> {
        return ApiUtils.handleApiCall {
            apiService.getTeachers(search, page, perPage)
        }.map { response -> response.data ?: emptyList() }
    }

    suspend fun createTeacher(request: StoreTeacherRequest): Result<TeacherResource> {
        return ApiUtils.handleApiCallFlat { apiService.createTeacherFlat(request) }
    }

    suspend fun getTeacher(teacherId: Int): Result<TeacherResource> {
        return ApiUtils.handleApiCall {
            apiService.getTeacher(teacherId)
        }.map { response -> response.data ?: throw Exception("No teacher data in response") }
    }

    suspend fun updateTeacher(
        teacherId: Int,
        request: UpdateTeacherRequest
    ): Result<TeacherResource> {
        return ApiUtils.handleApiCallFlat { apiService.updateTeacherFlat(teacherId, request) }
    }

    suspend fun deleteTeacher(teacherId: Int): Result<Unit> {
        return ApiUtils.handleApiCall { apiService.deleteTeacher(teacherId) }.map { Unit }
    }

    suspend fun importTeachers(request: TeacherImportRequest): Result<TeacherImportResponse> {
        return ApiUtils.handleApiCall {
            apiService.importTeachers(request)
        }.map { response -> response.data ?: TeacherImportResponse() }
    }

    // =========================================================
    // TEACHER ATTENDANCE
    // FIX v2: handleApiCall + .data (bukan handleApiCallFlat + .history)
    // =========================================================

    // FIX: Return type diubah dari Result<List<AttendanceResource>> → Result<List<TeacherHistoryItem>>
    // karena ApiService.getTeacherAttendance() mengembalikan Response<TeacherAttendanceHistoryResponse>
    // dan .history bertipe List<TeacherHistoryItem>, bukan List<AttendanceResource>.
    suspend fun getTeacherAttendance(
        teacherId: Int,
        startDate: String? = null,
        endDate: String? = null
    ): Result<List<TeacherHistoryItem>> {
        return ApiUtils.handleApiCallFlat {
            apiService.getTeacherAttendance(teacherId, startDate, endDate)
        }.map { response -> response.history }
    }

    suspend fun getTeacherAttendanceHistory(
        teacherId: Int,
        from: String? = null,
        to: String? = null
    ): Result<TeacherAttendanceHistoryResponse> {
        return ApiUtils.handleApiCallFlat {
            apiService.getTeacherAttendanceHistory(teacherId, from, to)
        }
    }

    // =========================================================
    // TEACHER SCHEDULE IMAGE
    // FIX v2: raw try-catch karena ApiService mengembalikan Response<ResponseBody>
    // =========================================================

    suspend fun getTeacherScheduleImage(teacherId: Int): Result<Any> {
        return try {
            val response = apiService.getTeacherScheduleImage(teacherId)
            if (response.isSuccessful) {
                Result.Success(response.body() ?: "")
            } else {
                Result.Error(Exception("HTTP ${response.code()}"), "Gagal memuat gambar jadwal")
            }
        } catch (e: Exception) {
            Result.Error(e, e.message ?: "Gagal memuat gambar jadwal")
        }
    }

    suspend fun uploadTeacherScheduleImage(
        teacherId: Int,
        data: Map<String, String>
    ): Result<Any> {
        return ApiUtils.handleApiCall {
            apiService.uploadTeacherScheduleImage(teacherId, data)
        }.map { response -> response.data ?: Any() }
    }

    suspend fun deleteTeacherScheduleImage(teacherId: Int): Result<Any> {
        return ApiUtils.handleApiCall {
            apiService.deleteTeacherScheduleImage(teacherId)
        }.map { response -> response.data ?: Any() }
    }

    // =========================================================
    // WALI KELAS — HOMEROOM
    // =========================================================

    suspend fun getMyHomeroom(): Result<Classes> {
        return ApiUtils.handleApiCall {
            apiService.getMyHomeroom()
        }.map { response -> response.data ?: throw Exception("No class data in response") }
    }

    /**
     * FIX v2: raw try-catch — ApiService.getMyHomeroomStudents() mengembalikan
     * Response<List<StudentResource>> langsung (bukan ApiResponse wrapper).
     */
    suspend fun getMyHomeroomStudents(): Result<List<StudentResource>> {
        return try {
            val response = apiService.getMyHomeroomStudents()
            if (response.isSuccessful) {
                Result.Success(response.body()?.data ?: emptyList())
            } else {
                Result.Error(Exception("HTTP ${response.code()}"), "Gagal memuat siswa wali kelas")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Exception in getMyHomeroomStudents: ${e.message}", e)
            Result.Error(e, e.message ?: "Gagal memuat siswa wali kelas")
        }
    }

    /**
     * GET /me/homeroom/schedules
     * FIX v2: Backend mengembalikan { "status":"success", "items":[...] }.
     * ApiService mendeklarasikan Response<HomeroomSchedulesResponse> — ambil .items langsung.
     */
    suspend fun getMyHomeroomSchedules(): Result<List<Schedule>> {
        return try {
            val response = apiService.getMyHomeroomSchedulesTyped()
            if (response.isSuccessful) {
                val data = response.body()?.items ?: emptyList()
                Log.d(TAG, "getMyHomeroomSchedules: ${data.size} jadwal")
                Result.Success(data)
            } else {
                Log.e(TAG, "getMyHomeroomSchedules HTTP ${response.code()}")
                Result.Success(emptyList())
            }
        } catch (e: Exception) {
            Log.e(TAG, "getMyHomeroomSchedules exception: ${e.message}", e)
            Result.Success(emptyList())
        }
    }

    /**
     * GET /me/homeroom/attendance
     * FIX: ApiService mengembalikan Response<TeacherAttendanceHistoryResponse> (bukan PaginatedResponse).
     * .history bertipe List<TeacherHistoryItem> — return type diubah sesuai.
     */
    suspend fun getMyHomeroomAttendance(
        startDate: String? = null,
        endDate: String? = null
    ): Result<List<TeacherHistoryItem>> {
        return try {
            val response = apiService.getMyHomeroomAttendance(startDate, endDate)
            if (response.isSuccessful) {
                val list = response.body()?.history ?: emptyList()
                Log.d(TAG, "getMyHomeroomAttendance: ${list.size} records")
                Result.Success(list)
            } else {
                Log.e(TAG, "getMyHomeroomAttendance HTTP ${response.code()}")
                Result.Error(Exception("HTTP ${response.code()}"), "Gagal memuat absensi wali kelas")
            }
        } catch (e: Exception) {
            Log.e(TAG, "getMyHomeroomAttendance exception: ${e.message}", e)
            Result.Error(e, e.message ?: "Gagal memuat absensi wali kelas")
        }
    }

    suspend fun getMyHomeroomAttendanceSummary(
        startDate: String? = null,
        endDate: String? = null
    ): Result<AttendanceSummary> {
        return ApiUtils.handleApiCall {
            apiService.getMyHomeroomAttendanceSummary(startDate, endDate)
        }.map { response -> response.data ?: AttendanceSummary() }
    }

    // =========================================================
    // GURU — JADWAL & ABSENSI MENGAJAR
    // =========================================================

    suspend fun getTeacherSchedules(teacherId: Int): Result<List<Schedule>> {
        return ApiUtils.handleApiCall {
            apiService.getTeacherSchedules(teacherId)
        }.map { response -> response.data ?: emptyList() }
    }

    /**
     * FIX v2: mengembalikan TeacherScheduleDetailResponse langsung (bukan Any).
     * ApiService.getMyScheduleDetail() → Response<TeacherScheduleDetailResponse>.
     */
    suspend fun getMyScheduleDetail(scheduleId: Int): Result<TeacherScheduleDetailResponse> {
        return try {
            val response = apiService.getMyScheduleDetail(scheduleId)
            if (response.isSuccessful) {
                val body = response.body()
                if (body != null) {
                    Log.d(TAG, "getMyScheduleDetail success: students=${body.students.size}")
                    Result.Success(body)
                } else {
                    Log.e(TAG, "getMyScheduleDetail response body null")
                    Result.Error(Exception("Response body null"), "Data tidak ditemukan")
                }
            } else {
                val errorMsg = response.errorBody()?.string() ?: "HTTP ${response.code()}"
                Log.e(TAG, "getMyScheduleDetail error: $errorMsg")
                Result.Error(Exception(errorMsg), "Gagal memuat detail jadwal")
            }
        } catch (e: Exception) {
            Log.e(TAG, "getMyScheduleDetail exception: ${e.message}", e)
            Result.Error(e, e.message ?: "Gagal memuat detail jadwal")
        }
    }

    suspend fun getMyScheduleStudents(scheduleId: Int): Result<List<StudentResource>> {
        return ApiUtils.handleApiCall {
            apiService.getMyScheduleStudents(scheduleId)
        }.map { response -> response.data ?: emptyList() }
    }

    // =========================================================
    // LEAVE PERMISSION (GURU)
    // =========================================================

    suspend fun createStudentLeave(
        scheduleId: Int,
        studentId: Int,
        data: Map<String, String>
    ): Result<StudentLeavePermission> {
        return ApiUtils.handleApiCall {
            apiService.createStudentLeave(scheduleId, studentId, data)
        }.map { response ->
            response.data ?: throw Exception("No leave permission data in response")
        }
    }

    suspend fun createLeaveEarly(
        scheduleId: Int,
        studentId: Int,
        data: Map<String, String>
    ): Result<StudentLeavePermission> {
        return ApiUtils.handleApiCall {
            apiService.createLeaveEarly(scheduleId, studentId, data)
        }.map { response ->
            response.data ?: throw Exception("No leave permission data in response")
        }
    }

    suspend fun getClassLeavePermissions(classId: Int): Result<List<StudentLeavePermission>> {
        return ApiUtils.handleApiCall {
            apiService.getClassLeavePermissions(classId)
        }.map { response -> response.data ?: emptyList() }
    }

    // =========================================================
    // STATISTIK & FOLLOW-UP (GURU / WALI KELAS)
    // =========================================================

    suspend fun getMonthlyStatistics(): Result<Map<String, Any>> {
        return ApiUtils.handleApiCall {
            apiService.getMonthlyStatistics()
        }.map { response -> response.data ?: emptyMap() }
    }

    suspend fun getStudentsFollowUp(): Result<List<StudentFollowUp>> {
        return try {
            ApiUtils.handleApiCall {
                apiService.getStudentsFollowUp()
            }.map { it.data ?: emptyList() }
        } catch (e: Exception) {
            Log.e(TAG, "Error loading students follow up", e)
            Result.Error(e, e.message ?: "Gagal memuat data follow up")
        }
    }

    /**
     * Konversi ke UI model dengan sorting severity.
     * @param problemOnly true → hanya WARNING/DANGER, false → semua siswa
     */
    suspend fun getStudentsFollowUpUiModels(
        problemOnly: Boolean = true
    ): Result<List<StudentFollowUpUiModel>> {
        return try {
            when (val source = getStudentsFollowUp()) {
                is Result.Success -> {
                    val mapped = source.data
                        .map { it.toUiModel() }
                        .let { list ->
                            if (problemOnly) list.filter { it.isProblematic } else list
                        }
                        .sortedWith(
                            compareByDescending<StudentFollowUpUiModel> { it.severityScore }
                                .thenByDescending { it.alphaCount }
                                .thenBy { it.studentName.lowercase() }
                        )
                    Result.Success(mapped)
                }
                is Result.Error   -> Result.Error(source.exception, source.message ?: "Gagal memuat data follow up")
                is Result.Loading -> Result.Loading()
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error mapping follow up UI models", e)
            Result.Error(e, e.message ?: "Gagal memproses data follow up")
        }
    }

    /**
     * POST /me/students/follow-up
     * Kirim catatan tindak lanjut untuk siswa tertentu.
     */
    suspend fun createStudentFollowUp(
        studentId: Int,
        note: String,
        action: String? = null
    ): Result<StudentFollowUp> {
        return try {
            val request = StudentFollowUpRequest(
                studentId = studentId,
                note = note,
                action = action
            )
            ApiUtils.handleApiCall {
                apiService.createFollowUp(request)
            }.map { response ->
                response.data ?: throw Exception("Tidak ada data tindak lanjut dari server")
            }
        } catch (e: Exception) {
            Log.e(TAG, "createStudentFollowUp error: ${e.message}", e)
            Result.Error(e, e.message ?: "Gagal membuat tindak lanjut")
        }
    }
}
