package com.example.ritamesa.api.repositories

import android.content.Context
import com.example.ritamesa.api.ApiClient
import com.example.ritamesa.api.ApiUtils
import com.example.ritamesa.api.Result
import com.example.ritamesa.api.models.*

class AttendanceRepository(
    private val context: Context,
    private val apiService: com.example.ritamesa.api.services.ApiService = ApiClient.getApiService(context)
) {

    // ===== SCAN ATTENDANCE =====
    suspend fun scanAttendance(qrToken: String): Result<AttendanceData> {
        return ApiUtils.handleApiCall {
            apiService.scanAttendance(ScanAttendanceRequest(token = qrToken))
        }.map { response ->
            response.data ?: throw Exception("No attendance data in response")
        }
    }

    suspend fun scanStudentAttendance(qrToken: String): Result<AttendanceData> {
        return ApiUtils.handleApiCall {
            apiService.scanStudentAttendance(ScanAttendanceRequest(token = qrToken))
        }.map { response ->
            response.data ?: throw Exception("No attendance data in response")
        }
    }

    // ===== MANUAL ATTENDANCE =====
    suspend fun recordManualAttendance(request: ManualAttendanceRequest): Result<AttendanceData> {
        return ApiUtils.handleApiCall {
            apiService.recordManualAttendance(request)
        }.map { response ->
            response.data ?: throw Exception("No attendance data in response")
        }
    }

    suspend fun recordBulkManualAttendance(records: List<BulkAttendanceItem>): Result<List<AttendanceData>> {
        return ApiUtils.handleApiCall {
            apiService.recordBulkManualAttendance(BulkManualAttendanceRequest(records))
        }.map { response ->
            response.data ?: emptyList()
        }
    }

    // ===== GET ATTENDANCE RECORDS =====
    suspend fun getAttendanceBySchedule(scheduleId: Int): Result<List<AttendanceResource>> {
        return ApiUtils.handleApiCall {
            apiService.getAttendanceBySchedule(scheduleId)
        }.map { response ->
            response.data ?: emptyList()
        }
    }

    suspend fun getStudentAbsences(studentId: Int? = null, startDate: String? = null, endDate: String? = null): Result<List<AttendanceResource>> {
        return ApiUtils.handleApiCall {
            apiService.getStudentAbsences(studentId, startDate, endDate)
        }.map { response ->
            response.data ?: emptyList()
        }
    }

    suspend fun getDailyTeacherAttendance(date: String? = null): Result<List<DailyAttendanceData>> {
        return ApiUtils.handleApiCall {
            apiService.getDailyTeacherAttendance(date)
        }.map { response ->
            response.data ?: emptyList()
        }
    }

    suspend fun getMyAttendance(startDate: String? = null, endDate: String? = null): Result<List<AttendanceResource>> {
        return ApiUtils.handleApiCall {
            apiService.getMyAttendance(startDate, endDate)
        }.map { response ->
            response.data ?: emptyList()
        }
    }

    suspend fun getMyTeachingAttendance(startDate: String? = null, endDate: String? = null): Result<List<AttendanceResource>> {
        return ApiUtils.handleApiCall {
            apiService.getMyTeachingAttendance(startDate, endDate)
        }.map { response ->
            response.data ?: emptyList()
        }
    }

    suspend fun getClassAttendanceByDate(classId: Int, date: String): Result<List<AttendanceResource>> {
        return ApiUtils.handleApiCall {
            apiService.getClassAttendanceByDate(classId, date)
        }.map { response ->
            response.data ?: emptyList()
        }
    }

    // ===== ATTENDANCE SUMMARY =====
    suspend fun getAttendanceSummary(startDate: String? = null, endDate: String? = null): Result<AttendanceSummary> {
        return ApiUtils.handleApiCall {
            apiService.getAttendanceSummary(startDate, endDate)
        }.map { response ->
            response.data ?: AttendanceSummary()
        }
    }

    suspend fun getMyAttendanceSummary(startDate: String? = null, endDate: String? = null): Result<AttendanceSummary> {
        return ApiUtils.handleApiCall {
            apiService.getMyAttendanceSummary(startDate, endDate)
        }.map { response ->
            response.data ?: AttendanceSummary()
        }
    }

    suspend fun getMyTeachingAttendanceSummary(startDate: String? = null, endDate: String? = null): Result<AttendanceSummary> {
        return ApiUtils.handleApiCall {
            apiService.getMyTeachingAttendanceSummary(startDate, endDate)
        }.map { response ->
            response.data ?: AttendanceSummary()
        }
    }

    // ===== CLASS ATTENDANCE =====
    suspend fun getClassStudentsAttendanceSummary(classId: Int, startDate: String? = null, endDate: String? = null): Result<List<Any>> {
        return ApiUtils.handleApiCall {
            apiService.getClassStudentsAttendanceSummary(classId, startDate, endDate)
        }.map { response ->
            response.data ?: emptyList()
        }
    }

    suspend fun getClassStudentsAbsences(classId: Int, startDate: String? = null, endDate: String? = null): Result<List<Any>> {
        return ApiUtils.handleApiCall {
            apiService.getClassStudentsAbsences(classId, startDate, endDate)
        }.map { response ->
            response.data ?: emptyList()
        }
    }

    suspend fun getScheduleAttendanceSummary(scheduleId: Int): Result<AttendanceSummary> {
        return ApiUtils.handleApiCall {
            apiService.getScheduleAttendanceSummary(scheduleId)
        }.map { response ->
            response.data ?: AttendanceSummary()
        }
    }

    // ===== ATTENDANCE EXPORT =====
    suspend fun exportAttendance(classId: Int? = null, startDate: String? = null, endDate: String? = null, format: String = "csv"): Result<String> {
        return ApiUtils.handleApiCall {
            apiService.exportAttendance(classId, startDate, endDate, format)
        }
    }

    suspend fun exportAttendancePdf(startDate: String? = null, endDate: String? = null): Result<String> {
        return ApiUtils.handleApiCall {
            apiService.exportAttendancePdf(startDate, endDate)
        }
    }

    suspend fun getAttendanceRecap(classId: Int? = null): Result<Any> {
        return ApiUtils.handleApiCall {
            apiService.getAttendanceRecap(classId)
        }.map { response ->
            response.data ?: Any()
        }
    }

    // ===== ATTENDANCE DOCUMENTS =====
    suspend fun addAttendanceAttachment(attendanceId: Int, data: Map<String, String>): Result<AttendanceDocument> {
        return ApiUtils.handleApiCall {
            apiService.addAttendanceAttachment(attendanceId, data)
        }.map { response ->
            response.data ?: throw Exception("No attachment data in response")
        }
    }

    suspend fun uploadAttendanceDocument(attendanceId: Int, data: Map<String, String>): Result<AttendanceDocument> {
        return ApiUtils.handleApiCall {
            apiService.uploadAttendanceDocument(attendanceId, data)
        }.map { response ->
            response.data ?: throw Exception("No document data in response")
        }
    }

    suspend fun getAttendanceDocument(attendanceId: Int): Result<AttendanceDocument> {
        return ApiUtils.handleApiCall {
            apiService.getAttendanceDocument(attendanceId)
        }.map { response ->
            response.data ?: throw Exception("No document data in response")
        }
    }

    // ===== ATTENDANCE MARKS =====
    suspend fun markAttendanceExcuse(attendanceId: Int, data: Map<String, String>): Result<AttendanceResource> {
        return ApiUtils.handleApiCall {
            apiService.markAttendanceExcuse(attendanceId, data)
        }.map { response ->
            response.data ?: throw Exception("No attendance data in response")
        }
    }

    suspend fun updateAttendance(attendanceId: Int, data: Map<String, String>): Result<AttendanceResource> {
        return ApiUtils.handleApiCall {
            apiService.updateAttendance(attendanceId, data)
        }.map { response ->
            response.data ?: throw Exception("No attendance data in response")
        }
    }

    suspend fun voidAttendance(attendanceId: Int): Result<AttendanceResource> {
        return ApiUtils.handleApiCall {
            apiService.voidAttendance(attendanceId)
        }.map { response ->
            response.data ?: throw Exception("No attendance data in response")
        }
    }

    // ===== SCHEDULE CLOSURE =====
    suspend fun closeScheduleAttendance(scheduleId: Int): Result<Any> {
        return ApiUtils.handleApiCall {
            apiService.closeScheduleAttendance(scheduleId)
        }.map { response ->
            response.data ?: Any()
        }
    }
}
