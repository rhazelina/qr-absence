package com.example.ritamesa.api.repositories

import android.content.Context
import com.example.ritamesa.api.ApiClient
import com.example.ritamesa.api.ApiUtils
import com.example.ritamesa.api.Result
import com.example.ritamesa.api.models.*

class TeacherRepository(private val context: Context) {
    private val apiService = ApiClient.getApiService(context)

    suspend fun getTeachers(search: String? = null, page: Int? = null): Result<List<TeacherResource>> {
        return ApiUtils.handleApiCall {
            apiService.getTeachers(search, page)
        }.map { response ->
            response.data ?: emptyList()
        }
    }

    suspend fun createTeacher(request: StoreTeacherRequest): Result<TeacherResource> {
        return ApiUtils.handleApiCall {
            apiService.createTeacher(request)
        }.map { response ->
            response.data ?: throw Exception("No teacher data in response")
        }
    }

    suspend fun getTeacher(teacherId: Int): Result<TeacherResource> {
        return ApiUtils.handleApiCall {
            apiService.getTeacher(teacherId)
        }.map { response ->
            response.data ?: throw Exception("No teacher data in response")
        }
    }

    suspend fun updateTeacher(teacherId: Int, request: UpdateTeacherRequest): Result<TeacherResource> {
        return ApiUtils.handleApiCall {
            apiService.updateTeacher(teacherId, request)
        }.map { response ->
            response.data ?: throw Exception("No teacher data in response")
        }
    }

    suspend fun deleteTeacher(teacherId: Int): Result<Unit> {
        return ApiUtils.handleApiCall {
            apiService.deleteTeacher(teacherId)
        }.map { Unit }
    }

    suspend fun importTeachers(request: TeacherImportRequest): Result<TeacherImportResponse> {
        return ApiUtils.handleApiCall {
            apiService.importTeachers(request)
        }.map { response ->
            response.data ?: TeacherImportResponse()
        }
    }

    suspend fun getTeacherAttendance(teacherId: Int, startDate: String? = null, endDate: String? = null): Result<List<AttendanceResource>> {
        return ApiUtils.handleApiCall {
            apiService.getTeacherAttendance(teacherId, startDate, endDate)
        }.map { response ->
            response.data ?: emptyList()
        }
    }

    suspend fun getTeacherScheduleImage(teacherId: Int): Result<String> {
        return ApiUtils.handleApiCall {
            apiService.getTeacherScheduleImage(teacherId)
        }
    }

    suspend fun uploadTeacherScheduleImage(teacherId: Int, data: Map<String, String>): Result<Any> {
        return ApiUtils.handleApiCall {
            apiService.uploadTeacherScheduleImage(teacherId, data)
        }.map { response ->
            response.data ?: Any()
        }
    }

    suspend fun deleteTeacherScheduleImage(teacherId: Int): Result<Any> {
        return ApiUtils.handleApiCall {
            apiService.deleteTeacherScheduleImage(teacherId)
        }.map { response ->
            response.data ?: Any()
        }
    }

    // ===== HOMEROOM TEACHER =====
    suspend fun getMyHomeroom(): Result<Classes> {
        return ApiUtils.handleApiCall {
            apiService.getMyHomeroom()
        }.map { response ->
            response.data ?: throw Exception("No class data in response")
        }
    }

    suspend fun getMyHomeroomStudents(): Result<List<StudentResource>> {
        return ApiUtils.handleApiCall {
            apiService.getMyHomeroomStudents()
        }.map { response ->
            response.data ?: emptyList()
        }
    }

    suspend fun getMyHomeroomSchedules(): Result<List<Schedule>> {
        return ApiUtils.handleApiCall {
            apiService.getMyHomeroomSchedules()
        }.map { response ->
            response.data ?: emptyList()
        }
    }

    suspend fun getMyHomeroomAttendance(startDate: String? = null, endDate: String? = null): Result<List<AttendanceResource>> {
        return ApiUtils.handleApiCall {
            apiService.getMyHomeroomAttendance(startDate, endDate)
        }.map { response ->
            response.data ?: emptyList()
        }
    }

    suspend fun getMyHomeroomAttendanceSummary(startDate: String? = null, endDate: String? = null): Result<AttendanceSummary> {
        return ApiUtils.handleApiCall {
            apiService.getMyHomeroomAttendanceSummary(startDate, endDate)
        }.map { response ->
            response.data ?: AttendanceSummary()
        }
    }

    suspend fun getTeacherSchedules(teacherId: Int): Result<List<Schedule>> {
        return ApiUtils.handleApiCall {
            apiService.getTeacherSchedules(teacherId)
        }.map { response ->
            response.data ?: emptyList()
        }
    }

    suspend fun getMyScheduleDetail(scheduleId: Int): Result<Any> {
        return ApiUtils.handleApiCall {
            apiService.getMyScheduleDetail(scheduleId)
        }.map { response ->
            response.data ?: Any()
        }
    }

    suspend fun getMyScheduleStudents(scheduleId: Int): Result<List<StudentResource>> {
        return ApiUtils.handleApiCall {
            apiService.getMyScheduleStudents(scheduleId)
        }.map { response ->
            response.data ?: emptyList()
        }
    }

    suspend fun createStudentLeave(scheduleId: Int, studentId: Int, data: Map<String, String>): Result<StudentLeavePermission> {
        return ApiUtils.handleApiCall {
            apiService.createStudentLeave(scheduleId, studentId, data)
        }.map { response ->
            response.data ?: throw Exception("No leave permission data in response")
        }
    }

    suspend fun createLeaveEarly(scheduleId: Int, studentId: Int, data: Map<String, String>): Result<StudentLeavePermission> {
        return ApiUtils.handleApiCall {
            apiService.createLeaveEarly(scheduleId, studentId, data)
        }.map { response ->
            response.data ?: throw Exception("No leave permission data in response")
        }
    }

    suspend fun getClassLeavePermissions(classId: Int): Result<List<StudentLeavePermission>> {
        return ApiUtils.handleApiCall {
            apiService.getClassLeavePermissions(classId)
        }.map { response ->
            response.data ?: emptyList()
        }
    }

    suspend fun getMonthlyStatistics(): Result<Map<String, Any>> {
        return ApiUtils.handleApiCall {
            apiService.getMonthlyStatistics()
        }.map { response ->
            response.data ?: emptyMap()
        }
    }

    suspend fun getStudentsFollowUp(): Result<List<StudentFollowUp>> {
        return ApiUtils.handleApiCall {
            apiService.getStudentsFollowUp()
        }.map { response ->
            response.data ?: emptyList()
        }
    }
}
