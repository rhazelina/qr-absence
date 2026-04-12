package com.example.ritamesa.api.repositories

import android.content.Context
import android.util.Log
import com.example.ritamesa.api.ApiClient
import com.example.ritamesa.api.ApiUtils
import com.example.ritamesa.api.Result
import com.example.ritamesa.api.models.*
import okhttp3.MultipartBody
import okhttp3.RequestBody
import okhttp3.RequestBody.Companion.toRequestBody
import retrofit2.Response

class AttendanceRepository(
    private val context: Context,
    private val apiService: com.example.ritamesa.api.services.ApiService = ApiClient.getApiService(context)
) {
    companion object {
        private const val TAG = "AttendanceRepository"
    }

    // ===== SCAN =====
    /**
     * Scan QR Token untuk guru.
     * Menggunakan try-catch agar tidak force close bila response malformed atau network error.
     */
    suspend fun scanAttendance(qrToken: String, deviceId: Int? = null): Result<AttendanceData> {
        Log.d(TAG, "scanAttendance: token=$qrToken")
        return try {
            val response: Response<AttendanceScanResponse> =
                apiService.scanAttendance(ScanAttendanceRequest(token = qrToken, deviceId = deviceId))
            if (response.isSuccessful) {
                val body: AttendanceScanResponse? = response.body()
                val data: AttendanceData? = body?.attendance ?: body?.data
                if (data != null) {
                    Result.Success(data)
                } else {
                    // Some success responses only return message, e.g. "Presensi sudah tercatat".
                    val msg: String = body?.message ?: "Presensi berhasil"
                    Result.Success(
                        AttendanceData(
                            id = null,
                            studentId = null,
                            studentNisn = null,
                            attendeeName = msg,
                            status = null,
                            scannedAt = null,
                            schedule = null,
                            reason = null
                        )
                    )
                }
            } else {
                val errorMsg: String = response.errorBody()?.string() ?: response.message()
                Result.Error(Exception("Gagal scan QR: $errorMsg"), "Gagal scan QR: $errorMsg")
            }
        } catch (e: Exception) {
            Log.e(TAG, "scanAttendance exception: ${e.message}", e)
            Result.Error(e, "Gagal menghubungi server: ${e.localizedMessage}")
        }
    }

    /**
     * Scan QR Token untuk siswa.
     * Menggunakan try-catch agar tidak force close bila response malformed atau network error.
     */
    suspend fun scanStudentAttendance(qrToken: String, deviceId: Int? = null): Result<AttendanceData> {
        Log.d(TAG, "scanStudentAttendance: token=$qrToken")
        return try {
            val response: Response<AttendanceScanResponse> =
                apiService.scanStudentAttendance(ScanAttendanceRequest(token = qrToken, deviceId = deviceId))
            if (response.isSuccessful) {
                val body: AttendanceScanResponse? = response.body()
                val data: AttendanceData? = body?.attendance ?: body?.data
                if (data != null) {
                    Result.Success(data)
                } else {
                    val msg: String = body?.message ?: "Presensi berhasil"
                    Result.Success(
                        AttendanceData(
                            id = null,
                            studentId = null,
                            studentNisn = null,
                            attendeeName = msg,
                            status = null,
                            scannedAt = null,
                            schedule = null,
                            reason = null
                        )
                    )
                }
            } else {
                val errorMsg: String = response.errorBody()?.string() ?: response.message()
                Result.Error(Exception("Gagal scan siswa: $errorMsg"), "Gagal scan siswa: $errorMsg")
            }
        } catch (e: Exception) {
            Log.e(TAG, "scanStudentAttendance exception: ${e.message}", e)
            Result.Error(e, "Fatal error: ${e.localizedMessage}")
        }
    }

    suspend fun recordManualAttendance(request: ManualAttendanceRequest): Result<AttendanceData> {
        return ApiUtils.handleApiCall<AttendanceScanResponse> {
            apiService.recordManualAttendance(request)
        }.map { response: AttendanceScanResponse ->
            response.attendance ?: response.data ?: throw Exception("No data")
        }
    }

    suspend fun recordBulkManualAttendance(request: BulkManualAttendanceRequest): Result<BulkManualAttendanceResponse> {
        return try {
            val response: Response<BulkManualAttendanceResponse> = apiService.recordBulkManualAttendance(request)
            if (response.isSuccessful) {
                Result.Success(response.body() ?: BulkManualAttendanceResponse())
            } else {
                // Ambil pesan error asli dari backend (validasi 422, 403, 500, dll)
                val rawError = response.errorBody()?.string()
                val errorMsg = try {
                    org.json.JSONObject(rawError ?: "").optString("message", null)
                        ?: rawError
                        ?: "Gagal menyimpan absensi (HTTP ${response.code()})"
                } catch (_: Exception) {
                    rawError ?: "Gagal menyimpan absensi (HTTP ${response.code()})"
                }
                Log.e(TAG, "recordBulkManualAttendance error ${response.code()}: $errorMsg")
                Result.Error(Exception(errorMsg), errorMsg)
            }
        } catch (e: Exception) {
            Log.e(TAG, "recordBulkManualAttendance exception: ${e.message}", e)
            Result.Error(e, "Gagal menghubungi server: ${e.localizedMessage}")
        }
    }

    suspend fun finalizeManualAttendance(request: FinalizeManualAttendanceRequest): Result<FinalizeManualAttendanceResponse> {
        return try {
            val response: Response<FinalizeManualAttendanceResponse> = apiService.finalizeManualAttendance(request)
            if (response.isSuccessful) {
                Result.Success(response.body() ?: FinalizeManualAttendanceResponse())
            } else {
                val rawError = response.errorBody()?.string()
                val errorMsg = try {
                    org.json.JSONObject(rawError ?: "").optString("message", null)
                        ?: rawError
                        ?: "Gagal memvalidasi absensi (HTTP ${response.code()})"
                } catch (_: Exception) {
                    rawError ?: "Gagal memvalidasi absensi (HTTP ${response.code()})"
                }
                Log.e(TAG, "finalizeManualAttendance error ${response.code()}: $errorMsg")
                Result.Error(Exception(errorMsg), errorMsg)
            }
        } catch (e: Exception) {
            Log.e(TAG, "finalizeManualAttendance exception: ${e.message}", e)
            Result.Error(e, "Gagal menghubungi server: ${e.localizedMessage}")
        }
    }

    suspend fun getAttendanceBySchedule(
        scheduleId: Int,
        date: String? = null,
        perPage: Int? = null
    ): Result<List<AttendanceResource>> {
        return ApiUtils.handleApiCall<ApiResponse<List<AttendanceResource>>> {
            apiService.getAttendanceBySchedule(scheduleId, date, perPage)
        }.map { response: ApiResponse<List<AttendanceResource>> ->
            response.data ?: emptyList()
        }
    }

    suspend fun getStudentAbsences(
        studentId: Int? = null,
        startDate: String? = null,
        endDate: String? = null
    ): Result<List<StudentAbsenceResponseItem>> {
        return ApiUtils.handleApiCall<PaginatedResponse<StudentAbsenceResponseItem>> {
            apiService.getStudentAbsences(studentId, startDate, endDate)
        }.map { response: PaginatedResponse<StudentAbsenceResponseItem> ->
            response.data ?: emptyList()
        }
    }

    suspend fun getDailyTeacherAttendance(date: String? = null): Result<List<DailyAttendanceData>> {
        return try {
            val response: Response<DailyTeacherAttendanceResponse> = apiService.getDailyTeacherAttendance(date)
            if (response.isSuccessful) {
                val body: DailyTeacherAttendanceResponse? = response.body()
                val list: List<DailyAttendanceData> = body?.items?.data?.map { item: DailyTeacherAttendanceItem ->
                    DailyAttendanceData(
                        date = body.date,
                        teacherId = item.teacher?.id,
                        teacherName = item.teacher?.name,
                        nip = item.teacher?.nip,
                        status = item.status,
                        timestamp = item.attendances.firstOrNull()?.timestamp
                    )
                } ?: emptyList()
                Result.Success(list)
            } else {
                Result.Error(Exception("Error"), "Gagal")
            }
        } catch (e: Exception) {
            Result.Error(e, "Error")
        }
    }

    suspend fun getMyAttendance(startDate: String? = null, endDate: String? = null): Result<List<AttendanceResource>> {
        return ApiUtils.handleApiCall<PaginatedResponse<AttendanceResource>> {
            apiService.getMyAttendance(startDate, endDate)
        }.map { response: PaginatedResponse<AttendanceResource> ->
            response.data ?: emptyList()
        }
    }

    suspend fun getMyTeachingAttendance(startDate: String? = null, endDate: String? = null): Result<List<AttendanceResource>> {
        return ApiUtils.handleApiCall<PaginatedResponse<AttendanceResource>> {
            apiService.getMyTeachingAttendance(startDate, endDate)
        }.map { response: PaginatedResponse<AttendanceResource> ->
            response.data ?: emptyList()
        }
    }

    suspend fun getClassAttendanceByDate(classId: Int, date: String): Result<List<AttendanceResource>> {
        return try {
            val response: Response<ClassAttendanceResponse> = apiService.getClassAttendanceByDate(classId, date)
            if (response.isSuccessful) {
                val body: ClassAttendanceResponse? = response.body()
                val list: List<AttendanceResource> = body?.items?.flatMap { item: ClassAttendanceItem ->
                    item.attendances.map { att: AttendanceResource ->
                        att.copy(
                            schedule = ScheduleInfo(
                                id = item.schedule?.id,
                                subjectName = item.schedule?.subjectName,
                                className = item.schedule?.className,
                                date = body.date
                            )
                        )
                    }
                } ?: emptyList()
                Result.Success(list)
            } else {
                Result.Success(emptyList())
            }
        } catch (e: Exception) {
            Result.Success(emptyList())
        }
    }

    suspend fun getAttendanceSummary(startDate: String? = null, endDate: String? = null): Result<AttendanceSummary> {
        return getAttendanceSummaryRaw(startDate, endDate)
    }

    suspend fun getAttendanceSummaryRaw(startDate: String? = null, endDate: String? = null): Result<AttendanceSummary> {
        return try {
            val response: Response<Map<String, Int>> = apiService.getAttendanceSummaryRaw(startDate, endDate)
            if (response.isSuccessful) {
                val body: Map<String, Int>? = response.body()
                if (body != null) {
                    val present = body["present"] ?: 0
                    val absent = body["absent"] ?: 0
                    val late = body["late"] ?: 0
                    val sick = body["sick"] ?: 0
                    val excused = (body["izin"] ?: 0) + (body["excused"] ?: 0)
                    val total = present + absent + late + sick + excused
                    val rate = if (total > 0) ((present + late).toFloat() / total * 100f) else 0f
                    Result.Success(AttendanceSummary(totalStudents = total, present = present, absent = absent, late = late, sick = sick, excused = excused, attendanceRate = rate))
                } else {
                    Result.Success(AttendanceSummary())
                }
            } else {
                Result.Error(Exception("Error"), "Error")
            }
        } catch (e: Exception) {
            Result.Error(e, "Error")
        }
    }

    suspend fun getMyAttendanceSummary(startDate: String? = null, endDate: String? = null): Result<AttendanceSummary> {
        return ApiUtils.handleApiCall<ApiResponse<AttendanceSummary>> {
            apiService.getMyAttendanceSummary(startDate, endDate)
        }.map { it.data ?: AttendanceSummary() }
    }

    suspend fun getMyTeachingAttendanceSummary(startDate: String? = null, endDate: String? = null): Result<AttendanceSummary> {
        return ApiUtils.handleApiCall<ApiResponse<AttendanceSummary>> {
            apiService.getMyTeachingAttendanceSummary(startDate, endDate)
        }.map { it.data ?: AttendanceSummary() }
    }

    suspend fun getClassStudentsAttendanceSummary(classId: Int, startDate: String? = null, endDate: String? = null): Result<List<Any>> {
        return ApiUtils.handleApiCall<PaginatedResponse<Any>> {
            apiService.getClassStudentsAttendanceSummary(classId, startDate, endDate)
        }.map { it.data ?: emptyList() }
    }

    suspend fun getClassStudentsAbsences(classId: Int, startDate: String? = null, endDate: String? = null): Result<List<Any>> {
        return ApiUtils.handleApiCall<PaginatedResponse<Any>> {
            apiService.getClassStudentsAbsences(classId, startDate, endDate)
        }.map { it.data ?: emptyList() }
    }

    suspend fun getScheduleAttendanceSummary(scheduleId: Int): Result<AttendanceSummary> {
        return ApiUtils.handleApiCall<ApiResponse<AttendanceSummary>> {
            apiService.getScheduleAttendanceSummary(scheduleId)
        }.map { it.data ?: AttendanceSummary() }
    }

    suspend fun exportAttendance(classId: Int? = null, startDate: String? = null, endDate: String? = null, format: String = "csv"): Result<String> {
        return try {
            val response = apiService.exportAttendance(classId, startDate, endDate, format)
            Result.Success(response.body() ?: "")
        } catch (e: Exception) { Result.Error(e, "Error") }
    }

    suspend fun exportAttendancePdf(startDate: String? = null, endDate: String? = null): Result<String> {
        return try {
            val response = apiService.exportAttendancePdf(startDate, endDate)
            Result.Success(response.body() ?: "")
        } catch (e: Exception) { Result.Error(e, "Error") }
    }

    suspend fun getAttendanceRecap(classId: Int? = null): Result<Any> {
        return ApiUtils.handleApiCall<ApiResponse<Any>> {
            apiService.getAttendanceRecap(classId)
        }.map { it.data ?: Any() }
    }

    suspend fun addAttendanceAttachment(attendanceId: Int, data: Map<String, String>): Result<AttendanceDocument> {
        return ApiUtils.handleApiCall<ApiResponse<AttendanceDocument>> {
            apiService.addAttendanceAttachment(attendanceId, data)
        }.map { it.data ?: throw Exception("No data") }
    }

    suspend fun addAttendanceAttachment(attendanceId: Int, file: MultipartBody.Part): Result<AttendanceDocument> {
        return ApiUtils.handleApiCall<ApiResponse<AttendanceDocument>> {
            apiService.addAttendanceAttachmentFile(attendanceId, file)
        }.map { it.data ?: throw Exception("No data") }
    }

    suspend fun uploadAttendanceDocument(attendanceId: Int, data: Map<String, String>): Result<AttendanceDocument> {
        return ApiUtils.handleApiCall<ApiResponse<AttendanceDocument>> {
            apiService.uploadAttendanceDocument(attendanceId, data)
        }.map { it.data ?: throw Exception("No data") }
    }

    suspend fun getAttendanceDocument(attendanceId: Int): Result<AttendanceDocument> {
        return ApiUtils.handleApiCall<ApiResponse<AttendanceDocument>> {
            apiService.getAttendanceDocument(attendanceId)
        }.map { it.data ?: throw Exception("No data") }
    }

    suspend fun markAttendanceExcuse(attendanceId: Int, data: Map<String, String>): Result<AttendanceResource> {
        return ApiUtils.handleApiCallFlat {
            apiService.markAttendanceExcuse(attendanceId, data)
        }
    }

    suspend fun markAttendanceExcuse(
        attendanceId: Int,
        request: MarkAttendanceExcuseRequest
    ): Result<AttendanceResource> {
        val data = LinkedHashMap<String, String>()
        data["status"] = request.status
        data["reason"] = request.reason ?: ""
        request.isEarlyLeave?.let { data["is_early_leave"] = it.toString() }
        return markAttendanceExcuse(attendanceId, data)
    }

    suspend fun updateAttendanceExcuse(
        attendanceId: Int,
        status: String,
        reason: String? = null,
        attachment: MultipartBody.Part? = null
    ): Result<AttendanceResource> {
        val data = linkedMapOf<String, RequestBody>(
            "status" to status.toRequestBody(MultipartBody.FORM),
            "replace_existing_attachment" to "1".toRequestBody(MultipartBody.FORM)
        )
        if (!reason.isNullOrBlank()) {
            data["reason"] = reason.toRequestBody(MultipartBody.FORM)
        }

        Log.d(TAG, "updateAttendanceExcuse: attendanceId=$attendanceId, status=$status, reason=$reason, hasAttachment=${attachment != null}")
        return try {
            val response = apiService.updateAttendanceExcuse(attendanceId, data, attachment)
            if (response.isSuccessful) {
                val attendance = response.body()?.attendance
                if (attendance != null) {
                    Log.d(TAG, "updateAttendanceExcuse success: attendanceId=$attendanceId")
                    Result.Success(attendance)
                } else {
                    Log.w(TAG, "updateAttendanceExcuse: response sukses tapi attendance null")
                    Result.Error(Exception("No data"), "Data absensi tidak ditemukan")
                }
            } else {
                val rawError = response.errorBody()?.string()
                val errorMsg = try {
                    org.json.JSONObject(rawError ?: "").optString("message", null)
                        ?: rawError
                        ?: "Gagal memperbarui absensi (HTTP ${response.code()})"
                } catch (_: Exception) {
                    rawError ?: "Gagal memperbarui absensi (HTTP ${response.code()})"
                }
                Log.e(TAG, "updateAttendanceExcuse error ${response.code()}: $errorMsg")
                Result.Error(Exception(errorMsg), errorMsg)
            }
        } catch (e: Exception) {
            Log.e(TAG, "updateAttendanceExcuse exception: ${e.message}", e)
            Result.Error(e, e.message ?: "Gagal memperbarui absensi")
        }
    }

    suspend fun updateAttendance(attendanceId: Int, data: Map<String, String>): Result<AttendanceResource> {
        return ApiUtils.handleApiCall<ApiResponse<AttendanceResource>> {
            apiService.updateAttendance(attendanceId, data)
        }.map { it.data ?: throw Exception("No data") }
    }

    suspend fun voidAttendance(attendanceId: Int): Result<AttendanceResource> {
        return ApiUtils.handleApiCall<ApiResponse<AttendanceResource>> {
            apiService.voidAttendance(attendanceId)
        }.map { it.data ?: throw Exception("No data") }
    }

    suspend fun closeScheduleAttendance(scheduleId: Int): Result<Any> {
        return ApiUtils.handleApiCall<ApiResponse<Any>> {
            apiService.closeScheduleAttendance(scheduleId)
        }.map { it.data ?: Any() }
    }
}