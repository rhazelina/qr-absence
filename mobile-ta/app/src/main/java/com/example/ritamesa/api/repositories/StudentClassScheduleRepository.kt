package com.example.ritamesa.api.repositories

import android.content.Context
import com.example.ritamesa.api.ApiClient
import com.example.ritamesa.api.ApiUtils
import com.example.ritamesa.api.Result
import com.example.ritamesa.api.models.*

class StudentRepository(
    private val context: Context,
    private val apiService: com.example.ritamesa.api.services.ApiService = ApiClient.getApiService(context)
) {

    suspend fun getStudents(search: String? = null, classId: Int? = null, page: Int? = null): Result<List<StudentResource>> {
        return ApiUtils.handleApiCall {
            apiService.getStudents(search, classId, page)
        }.map { response ->
            response.data ?: emptyList()
        }
    }

    suspend fun createStudent(request: StoreStudentRequest): Result<StudentResource> {
        return ApiUtils.handleApiCall {
            apiService.createStudent(request)
        }.map { response ->
            response.data ?: throw Exception("No student data in response")
        }
    }

    suspend fun getStudent(studentId: Int): Result<StudentResource> {
        return ApiUtils.handleApiCall {
            apiService.getStudent(studentId)
        }.map { response ->
            response.data ?: throw Exception("No student data in response")
        }
    }

    suspend fun updateStudent(studentId: Int, request: UpdateStudentRequest): Result<StudentResource> {
        return ApiUtils.handleApiCall {
            apiService.updateStudent(studentId, request)
        }.map { response ->
            response.data ?: throw Exception("No student data in response")
        }
    }

    suspend fun deleteStudent(studentId: Int): Result<Unit> {
        return ApiUtils.handleApiCall {
            apiService.deleteStudent(studentId)
        }.map { Unit }
    }

    suspend fun importStudents(request: StudentImportRequest): Result<StudentImportResponse> {
        return ApiUtils.handleApiCall {
            apiService.importStudents(request)
        }.map { response ->
            response.data ?: StudentImportResponse()
        }
    }

    suspend fun getStudentAttendanceHistory(studentId: Int, startDate: String? = null, endDate: String? = null): Result<List<AttendanceResource>> {
        return ApiUtils.handleApiCall {
            apiService.getStudentAttendanceHistory(studentId, startDate, endDate)
        }.map { response ->
            response.data ?: emptyList()
        }
    }

    suspend fun getMyClass(): Result<Classes> {
        return ApiUtils.handleApiCall {
            apiService.getMyClass()
        }.map { response ->
            response.data ?: throw Exception("No class data in response")
        }
    }

    suspend fun getMyClassSchedules(): Result<List<Schedule>> {
        return ApiUtils.handleApiCall {
            apiService.getMyClassSchedules()
        }.map { response ->
            response.data ?: emptyList()
        }
    }

    suspend fun getMyClassAttendance(): Result<List<AttendanceResource>> {
        return ApiUtils.handleApiCall {
            apiService.getMyClassAttendance()
        }.map { response ->
            response.data ?: emptyList()
        }
    }

    suspend fun getStudentsAttendanceSummary(startDate: String? = null, endDate: String? = null): Result<List<Any>> {
        return ApiUtils.handleApiCall {
            apiService.getStudentsAttendanceSummary(startDate, endDate)
        }.map { response ->
            response.data ?: emptyList()
        }
    }
}

class ClassRepository(private val context: Context) {
    private val apiService = ApiClient.getApiService(context)

    suspend fun getClasses(search: String? = null, page: Int? = null): Result<List<Classes>> {
        return ApiUtils.handleApiCall {
            apiService.getClasses(search, page)
        }.map { response ->
            response.data ?: emptyList()
        }
    }

    suspend fun createClass(request: ClassPayload): Result<Classes> {
        return ApiUtils.handleApiCall {
            apiService.createClass(request)
        }.map { response ->
            response.data ?: throw Exception("No class data in response")
        }
    }

    suspend fun getClass(classId: Int): Result<Classes> {
        return ApiUtils.handleApiCall {
            apiService.getClass(classId)
        }.map { response ->
            response.data ?: throw Exception("No class data in response")
        }
    }

    suspend fun updateClass(classId: Int, request: ClassPayload): Result<Classes> {
        return ApiUtils.handleApiCall {
            apiService.updateClass(classId, request)
        }.map { response ->
            response.data ?: throw Exception("No class data in response")
        }
    }

    suspend fun deleteClass(classId: Int): Result<Unit> {
        return ApiUtils.handleApiCall {
            apiService.deleteClass(classId)
        }.map { Unit }
    }

    suspend fun uploadClassScheduleImage(classId: Int, data: Map<String, String>): Result<Any> {
        return ApiUtils.handleApiCall {
            apiService.uploadClassScheduleImage(classId, data)
        }.map { response ->
            response.data ?: Any()
        }
    }

    suspend fun getClassScheduleImage(classId: Int): Result<String> {
        return ApiUtils.handleApiCall {
            apiService.getClassScheduleImage(classId)
        }
    }

    suspend fun deleteClassScheduleImage(classId: Int): Result<Any> {
        return ApiUtils.handleApiCall {
            apiService.deleteClassScheduleImage(classId)
        }.map { response ->
            response.data ?: Any()
        }
    }

    suspend fun getClassAttendanceByDate(classId: Int, date: String): Result<List<AttendanceResource>> {
        return ApiUtils.handleApiCall {
            apiService.getClassAttendanceByDate(classId, date)
        }.map { response ->
            response.data ?: emptyList()
        }
    }

    suspend fun getClassStudentsAttendanceSummary(classId: Int, startDate: String? = null, endDate: String? = null): Result<List<Any>> {
        return ApiUtils.handleApiCall {
            apiService.getClassStudentsSummary(classId, startDate, endDate)
        }.map { response ->
            response.data ?: emptyList()
        }
    }

    suspend fun getClassStudentsOnLeave(classId: Int): Result<List<StudentLeavePermission>> {
        return ApiUtils.handleApiCall {
            apiService.getClassStudentsOnLeave(classId)
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

    suspend fun getClassDashboard(): Result<ClassDashboard> {
        return ApiUtils.handleApiCall {
            apiService.getMyClassDashboard()
        }.map { response ->
            response.data ?: throw Exception("No dashboard data in response")
        }
    }
}

class ScheduleRepository(private val context: Context) {
    private val apiService = ApiClient.getApiService(context)

    suspend fun getSchedules(classId: Int? = null, page: Int? = null): Result<List<Schedule>> {
        return ApiUtils.handleApiCall {
            apiService.getSchedules(classId, page)
        }.map { response ->
            response.data ?: emptyList()
        }
    }

    suspend fun createSchedule(request: StoreScheduleRequest): Result<Schedule> {
        return ApiUtils.handleApiCall {
            apiService.createSchedule(request)
        }.map { response ->
            response.data ?: throw Exception("No schedule data in response")
        }
    }

    suspend fun getSchedule(scheduleId: Int): Result<Schedule> {
        return ApiUtils.handleApiCall {
            apiService.getSchedule(scheduleId)
        }.map { response ->
            response.data ?: throw Exception("No schedule data in response")
        }
    }

    suspend fun updateSchedule(scheduleId: Int, request: UpdateScheduleRequest): Result<Schedule> {
        return ApiUtils.handleApiCall {
            apiService.updateSchedule(scheduleId, request)
        }.map { response ->
            response.data ?: throw Exception("No schedule data in response")
        }
    }

    suspend fun deleteSchedule(scheduleId: Int): Result<Unit> {
        return ApiUtils.handleApiCall {
            apiService.deleteSchedule(scheduleId)
        }.map { Unit }
    }

    suspend fun bulkUpsertSchedules(classId: Int, request: BulkScheduleRequest): Result<List<Schedule>> {
        return ApiUtils.handleApiCall {
            apiService.bulkUpsertSchedules(classId, request)
        }.map { response ->
            response.data ?: emptyList()
        }
    }

    suspend fun getTeacherSchedules(teacherId: Int): Result<List<Schedule>> {
        return ApiUtils.handleApiCall {
            apiService.getTeacherSchedules(teacherId)
        }.map { response ->
            response.data ?: emptyList()
        }
    }

    suspend fun getMySchedules(): Result<List<Schedule>> {
        return ApiUtils.handleApiCall {
            apiService.getMySchedules()
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
}
