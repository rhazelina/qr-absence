package com.example.ritamesa.api.repositories

import android.content.Context
import android.util.Log
import com.example.ritamesa.api.ApiClient
import com.example.ritamesa.api.ApiUtils
import com.example.ritamesa.api.Result
import com.example.ritamesa.api.models.*

class StudentRepository(
    private val context: Context,
    private val apiService: com.example.ritamesa.api.services.ApiService = ApiClient.getApiService(context)
) {

    companion object {
        private const val TAG = "StudentRepository"
    }

    suspend fun getStudents(
        search: String? = null,
        classId: Int? = null,
        page: Int? = null,
        perPage: Int? = null
    ): Result<List<StudentResource>> {
        val resolvedPerPage = when {
            perPage != null -> perPage
            classId != null -> -1
            else -> null
        }

        Log.d(
            TAG,
            "getStudents: search=$search, classId=$classId, page=$page, perPage=$resolvedPerPage"
        )

        return ApiUtils.handleApiCall {
            apiService.getStudents(
                search = search,
                classId = classId,
                page = page,
                perPage = resolvedPerPage
            )
        }.map { response ->
            response.data ?: emptyList()
        }
    }


    suspend fun createStudent(request: StoreStudentRequest): Result<StudentResource> {
        Log.d(TAG, "createStudent: $request")
        return ApiUtils.handleApiCallFlat {
            apiService.createStudentFlat(request)
        }.also { result ->
            when (result) {
                is Result.Success -> Log.d(TAG, "createStudent success: ${result.data}")
                is Result.Error -> Log.e(TAG, "createStudent error: ${result.message}")
                else -> {}
            }
        }
    }

    suspend fun getStudent(studentId: Int): Result<StudentResource> {
        Log.d(TAG, "getStudent: studentId=$studentId")
        return ApiUtils.handleApiCall {
            apiService.getStudent(studentId)
        }.map { response ->
            response.data ?: throw Exception("No student data in response")
        }
    }

    suspend fun updateStudent(studentId: Int, request: UpdateStudentRequest): Result<StudentResource> {
        Log.d(TAG, "updateStudent: studentId=$studentId")
        return ApiUtils.handleApiCallFlat {
            apiService.updateStudentFlat(studentId, request)
        }.also { result ->
            when (result) {
                is Result.Success -> Log.d(TAG, "updateStudent success: ${result.data}")
                is Result.Error -> Log.e(TAG, "updateStudent error: ${result.message}")
                else -> {}
            }
        }
    }

    suspend fun deleteStudent(studentId: Int): Result<Unit> {
        Log.d(TAG, "deleteStudent: studentId=$studentId")
        return ApiUtils.handleApiCall {
            apiService.deleteStudent(studentId)
        }.map { Unit }.also { result ->
            when (result) {
                is Result.Success -> Log.d(TAG, "deleteStudent success")
                is Result.Error -> Log.e(TAG, "deleteStudent error: ${result.message}")
                else -> {}
            }
        }
    }

    suspend fun importStudents(request: StudentImportRequest): Result<StudentImportResponse> {
        Log.d(TAG, "importStudents: $request")
        return ApiUtils.handleApiCall {
            apiService.importStudents(request)
        }.map { response ->
            response.data ?: StudentImportResponse()
        }
    }

    suspend fun getStudentAttendanceHistory(
        studentId: Int,
        startDate: String? = null,
        endDate: String? = null
    ): Result<List<AttendanceResource>> {
        Log.d(TAG, "getStudentAttendanceHistory: studentId=$studentId")
        return ApiUtils.handleApiCallFlat {
            apiService.getStudentAttendanceHistory(studentId, startDate, endDate)
        }.map { historyResponse ->
            historyResponse.history.map { item ->
                AttendanceResource(
                    id = item.id,
                    student = null,
                    schedule = ScheduleInfo(
                        id = item.schedule?.id,
                        subjectName = item.schedule?.subject?.name,
                        className = item.schedule?.dailySchedule?.classSchedule?.classData?.name,
                        date = item.date
                    ),
                    status = item.status,
                    timestamp = item.resolvedCheckIn(),
                    checkedInAt = item.resolvedCheckIn(),
                    reason = item.reason
                )
            }
        }
    }

    suspend fun getMyClass(): Result<Classes> {
        Log.d(TAG, "getMyClass")
        return ApiUtils.handleApiCall {
            apiService.getMyClass()
        }.map { response ->
            response.data ?: throw Exception("No class data in response")
        }
    }

    suspend fun getMyClassSchedules(): Result<List<Schedule>> {
        Log.d(TAG, "getMyClassSchedules")
        return ApiUtils.handleApiCall {
            apiService.getMyClassSchedules(date = null)
        }.map { response ->
            response.data ?: emptyList()
        }
    }

    suspend fun getMyClassAttendance(): Result<List<AttendanceResource>> {
        Log.d(TAG, "getMyClassAttendance")
        return ApiUtils.handleApiCallFlat {
            apiService.getMyClassAttendance()
        }.map { historyResponse ->
            historyResponse.history.map { item ->
                AttendanceResource(
                    id = item.id,
                    student = null,
                    schedule = ScheduleInfo(
                        id = item.schedule?.id,
                        subjectName = item.schedule?.subject?.name,
                        className = item.schedule?.dailySchedule?.classSchedule?.classData?.name,
                        date = item.date
                    ),
                    status = item.status,
                    timestamp = item.resolvedCheckIn(),
                    checkedInAt = item.resolvedCheckIn(),
                    reason = item.reason
                )
            }
        }
    }

    suspend fun getStudentsAttendanceSummary(
        startDate: String? = null,
        endDate: String? = null
    ): Result<List<Any>> {
        Log.d(TAG, "getStudentsAttendanceSummary: startDate=$startDate, endDate=$endDate")
        return ApiUtils.handleApiCall {
            apiService.getStudentsAttendanceSummary(startDate, endDate)
        }.map { response ->
            response.data ?: emptyList()
        }
    }
}


// refixed
//package com.example.ritamesa.api.repositories
//
//import android.content.Context
//import android.util.Log
//import com.example.ritamesa.api.ApiClient
//import com.example.ritamesa.api.ApiUtils
//import com.example.ritamesa.api.Result
//import com.example.ritamesa.api.models.*
//
//class StudentRepository(
//    private val context: Context,
//    private val apiService: com.example.ritamesa.api.services.ApiService = ApiClient.getApiService(context)
//) {
//
//    companion object {
//        private const val TAG = "StudentRepository"
//    }
//
//    // FIX: ApiService.getStudents sekarang menerima perPage — sudah ditambahkan di ApiService.
//    suspend fun getStudents(
//        search: String? = null,
//        classId: Int? = null,
//        page: Int? = null,
//        perPage: Int? = null
//    ): Result<List<StudentResource>> {
//        Log.d(TAG, "getStudents: search=$search, classId=$classId, page=$page, perPage=$perPage")
//        return ApiUtils.handleApiCall {
//            apiService.getStudents(search, classId, page, perPage)
//        }.map { response ->
//            Log.d(TAG, "getStudents response: ${response.data?.size} items")
//            response.data ?: emptyList()
//        }
//    }
//
//    // FIX: Gunakan ApiUtils.handleApiCallFlat dengan tipe eksplisit agar type inference bekerja.
//    suspend fun createStudent(request: StoreStudentRequest): Result<StudentResource> {
//        Log.d(TAG, "createStudent: $request")
//        return ApiUtils.handleApiCallFlat<StudentResource> {
//            apiService.createStudentFlat(request)
//        }.also { result ->
//            when (result) {
//                is Result.Success -> Log.d(TAG, "createStudent success: ${result.data}")
//                is Result.Error   -> Log.e(TAG, "createStudent error: ${result.message}")
//                else -> {}
//            }
//        }
//    }
//
//    suspend fun getStudent(studentId: Int): Result<StudentResource> {
//        Log.d(TAG, "getStudent: studentId=$studentId")
//        return ApiUtils.handleApiCall {
//            apiService.getStudent(studentId)
//        }.map { response -> response.data ?: throw Exception("No student data in response") }
//    }
//
//    // FIX: Gunakan tipe eksplisit agar type inference bekerja.
//    suspend fun updateStudent(studentId: Int, request: UpdateStudentRequest): Result<StudentResource> {
//        Log.d(TAG, "updateStudent: studentId=$studentId")
//        return ApiUtils.handleApiCallFlat<StudentResource> {
//            apiService.updateStudentFlat(studentId, request)
//        }.also { result ->
//            when (result) {
//                is Result.Success -> Log.d(TAG, "updateStudent success: ${result.data}")
//                is Result.Error   -> Log.e(TAG, "updateStudent error: ${result.message}")
//                else -> {}
//            }
//        }
//    }
//
//    suspend fun deleteStudent(studentId: Int): Result<Unit> {
//        Log.d(TAG, "deleteStudent: studentId=$studentId")
//        return ApiUtils.handleApiCall {
//            apiService.deleteStudent(studentId)
//        }.map { Unit }.also { result ->
//            when (result) {
//                is Result.Success -> Log.d(TAG, "deleteStudent success")
//                is Result.Error   -> Log.e(TAG, "deleteStudent error: ${result.message}")
//                else -> {}
//            }
//        }
//    }
//
//    suspend fun importStudents(request: StudentImportRequest): Result<StudentImportResponse> {
//        Log.d(TAG, "importStudents: $request")
//        return ApiUtils.handleApiCall {
//            apiService.importStudents(request)
//        }.map { response -> response.data ?: StudentImportResponse() }
//    }
//
//    // FIX: ApiService.getStudentAttendanceHistory mengembalikan PaginatedResponse<AttendanceResource>
//    // — tidak ada .history, gunakan .data langsung. Tidak ada resolvedCheckIn() — gunakan timestamp.
//    suspend fun getStudentAttendanceHistory(
//        studentId: Int,
//        startDate: String? = null,
//        endDate: String? = null
//    ): Result<List<AttendanceResource>> {
//        Log.d(TAG, "getStudentAttendanceHistory: studentId=$studentId")
//        return ApiUtils.handleApiCall {
//            apiService.getStudentAttendanceHistory(studentId, startDate, endDate)
//        }.map { response ->
//            response.data ?: emptyList()
//        }
//    }
//
//    suspend fun getMyClass(): Result<Classes> {
//        Log.d(TAG, "getMyClass")
//        return ApiUtils.handleApiCall {
//            apiService.getMyClass()
//        }.map { response -> response.data ?: throw Exception("No class data in response") }
//    }
//
//    suspend fun getMyClassSchedules(): Result<List<Schedule>> {
//        Log.d(TAG, "getMyClassSchedules")
//        return ApiUtils.handleApiCall {
//            apiService.getMyClassSchedules()
//        }.map { response -> response.data ?: emptyList() }
//    }
//
//    // FIX: ApiService.getMyClassAttendance() mengembalikan PaginatedResponse<AttendanceResource>
//    // — gunakan .data langsung, tidak ada .history atau resolvedCheckIn().
//    suspend fun getMyClassAttendance(): Result<List<AttendanceResource>> {
//        Log.d(TAG, "getMyClassAttendance")
//        return ApiUtils.handleApiCall {
//            apiService.getMyClassAttendance()
//        }.map { response -> response.data ?: emptyList() }
//    }
//
//    suspend fun getStudentsAttendanceSummary(
//        startDate: String? = null,
//        endDate: String? = null
//    ): Result<List<Any>> {
//        Log.d(TAG, "getStudentsAttendanceSummary: startDate=$startDate, endDate=$endDate")
//        return ApiUtils.handleApiCall {
//            apiService.getStudentsAttendanceSummary(startDate, endDate)
//        }.map { response -> response.data ?: emptyList() }
//    }
//}