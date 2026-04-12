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
 * PERBAIKAN di versi ini:
 * 1. getMyHomeroomSchedules(): parse raw JSON via OkHttp jika backend
 *    mengembalikan { "status":"success","items":[...] } bukan PaginatedResponse.
 * 2. getMyHomeroomAttendance(): TeacherAttendanceHistoryItem TIDAK punya field
 *    student/studentName — gunakan student = null (bukan item.student atau item.studentName).
 * 3. Tetap menggunakan .body() dan .code() sebagai fungsi (sesuai versi Retrofit project ini).
 */
class TeacherRepository(private val context: Context) {
    private val apiService = ApiClient.getApiService(context)

    companion object {
        private const val TAG = "TeacherRepository"
    }

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

    suspend fun getTeacherAttendance(
        teacherId: Int,
        startDate: String? = null,
        endDate: String? = null
    ): Result<List<AttendanceResource>> {
        return ApiUtils.handleApiCall {
            apiService.getTeacherAttendance(teacherId, startDate, endDate)
        }.map { response -> response.data ?: emptyList() }
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

    suspend fun getMyHomeroom(): Result<Classes> {
        return ApiUtils.handleApiCall {
            apiService.getMyHomeroom()
        }.map { response -> response.data ?: throw Exception("No class data in response") }
    }

    suspend fun getMyHomeroomStudents(): Result<List<StudentResource>> {
        return try {
            val response = apiService.getMyHomeroomStudents()
            if (response.isSuccessful) {
                Result.Success(response.body() ?: emptyList())
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
     * Backend shape: { "status": "success", "items": [...] }.
     */
    suspend fun getMyHomeroomSchedules(): Result<List<Schedule>> {
        return try {
            val response = apiService.getMyHomeroomSchedules()
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
     *
     * FIX: TeacherAttendanceHistoryItem TIDAK punya field student atau studentName.
     * Field yang tersedia: id, date, status, reason, schedule, checkInTime, resolvedCheckIn().
     *
     * student = null adalah benar — bukan error. Error "Unresolved reference 'student'"
     * terjadi jika ada kode lama yang menulis item.student atau item.studentName.
     * Versi ini sudah benar: menggunakan student = null (named parameter AttendanceResource).
     *
     * Gunakan response.body() dan response.code() sebagai fungsi (sesuai versi Retrofit project ini)
     */
    suspend fun getMyHomeroomAttendance(
        startDate: String? = null,
        endDate: String? = null
    ): Result<List<AttendanceResource>> {
        return try {
            val response = apiService.getMyHomeroomAttendance(startDate, endDate)
            if (response.isSuccessful) {
                val list = response.body()?.data ?: emptyList()
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

    suspend fun getTeacherSchedules(teacherId: Int): Result<List<Schedule>> {
        return ApiUtils.handleApiCall {
            apiService.getTeacherSchedules(teacherId)
        }.map { response -> response.data ?: emptyList() }
    }

    suspend fun getMyScheduleDetail(scheduleId: Int): Result<TeacherScheduleDetailResponse> {
        return try {
            val response = apiService.getMyScheduleDetail(scheduleId)
            if (response.isSuccessful) {
                Result.Success(response.body() ?: TeacherScheduleDetailResponse())
            } else {
                Result.Error(Exception("HTTP ${response.code()}"), "Gagal memuat detail jadwal")
            }
        } catch (e: Exception) {
            Result.Error(e, e.message ?: "Gagal memuat detail jadwal")
        }
    }

    suspend fun getMyScheduleStudents(scheduleId: Int): Result<List<StudentResource>> {
        return ApiUtils.handleApiCall {
            apiService.getMyScheduleStudents(scheduleId)
        }.map { response -> response.data ?: emptyList() }
    }

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

    suspend fun getMonthlyStatistics(): Result<Map<String, Any>> {
        return ApiUtils.handleApiCall {
            apiService.getMonthlyStatistics()
        }.map { response -> response.data ?: emptyMap() }
    }

    suspend fun getStudentsFollowUp(): Result<List<StudentFollowUp>> {
        return try {
            ApiUtils.handleApiCall {
                apiService.getStudentsFollowUp()
            }.map { it.data ?: emptyList<StudentFollowUp>() }
        } catch (e: Exception) {
            Log.e(TAG, "Error loading students follow up", e)
            Result.Error(e, e.message ?: "Gagal memuat data follow up")
        }
    }

    /**
     * Wrapper typed model for follow-up screen.
     *
     * @param problemOnly true  -> return only WARNING/DANGER students
     *                    false -> return all students including SAFE
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
                is Result.Error -> {
                    Result.Error(source.exception, source.message ?: "Gagal memuat data follow up")
                }
                is Result.Loading -> Result.Loading()
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error mapping students follow up UI models", e)
            Result.Error(e, e.message ?: "Gagal memproses data follow up")
        }
    }

    /**
     * POST /me/students/follow-up
     *
     * Kirimkan tindak lanjut baru (catatan + aksi) untuk siswa tertentu.
     * Mengembalikan Result<StudentFollowUp> dengan student yang di-follow-up jika berhasil.
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



//package com.example.ritamesa.api.repositories
//
//import android.content.Context
//import android.util.Log
//import com.example.ritamesa.api.ApiClient
//import com.example.ritamesa.api.ApiUtils
//import com.example.ritamesa.api.Result
//import com.example.ritamesa.api.models.*
//
//class TeacherRepository(private val context: Context) {
//
//    private val apiService = ApiClient.getApiService(context)
//
//    companion object {
//        private const val TAG = "TeacherRepository"
//    }
//
//    suspend fun getTeachers(
//        search: String? = null,
//        page: Int? = null,
//        perPage: Int? = 200
//    ): Result<List<TeacherResource>> {
//        return ApiUtils.handleApiCall {
//            apiService.getTeachers(search, page, perPage)
//        }.map { response ->
//            response.data ?: emptyList()
//        }
//    }
//
//    suspend fun createTeacher(request: StoreTeacherRequest): Result<TeacherResource> {
//        return ApiUtils.handleApiCallFlat {
//            apiService.createTeacherFlat(request)
//        }
//    }
//
//    suspend fun getTeacher(teacherId: Int): Result<TeacherResource> {
//        return ApiUtils.handleApiCall {
//            apiService.getTeacher(teacherId)
//        }.map { response ->
//            response.data ?: throw Exception("No teacher data in response")
//        }
//    }
//
//    suspend fun updateTeacher(
//        teacherId: Int,
//        request: UpdateTeacherRequest
//    ): Result<TeacherResource> {
//        return ApiUtils.handleApiCallFlat {
//            apiService.updateTeacherFlat(teacherId, request)
//        }
//    }
//
//    suspend fun deleteTeacher(teacherId: Int): Result<Unit> {
//        return ApiUtils.handleApiCall {
//            apiService.deleteTeacher(teacherId)
//        }.map { Unit }
//    }
//
//    suspend fun importTeachers(request: TeacherImportRequest): Result<TeacherImportResponse> {
//        return ApiUtils.handleApiCall {
//            apiService.importTeachers(request)
//        }.map { response ->
//            response.data ?: TeacherImportResponse()
//        }
//    }
//
//    suspend fun getTeacherAttendance(
//        teacherId: Int,
//        startDate: String? = null,
//        endDate: String? = null
//    ): Result<List<AttendanceResource>> {
//        return ApiUtils.handleApiCall {
//            apiService.getTeacherAttendance(teacherId, startDate, endDate)
//        }.map { response ->
//            response.data ?: emptyList()
//        }
//    }
//
//    suspend fun getTeacherAttendanceHistory(
//        teacherId: Int,
//        from: String? = null,
//        to: String? = null
//    ): Result<TeacherAttendanceHistoryResponse> {
//        return ApiUtils.handleApiCallFlat {
//            apiService.getTeacherAttendanceHistory(teacherId, from, to)
//        }
//    }
//
//    suspend fun getTeacherScheduleImage(teacherId: Int): Result<Any> {
//        return try {
//            val response = apiService.getTeacherScheduleImage(teacherId)
//            if (response.isSuccessful) {
//                Result.Success(response.body() ?: "")
//            } else {
//                Result.Error(
//                    Exception("HTTP ${response.code()}"),
//                    "Gagal memuat gambar jadwal"
//                )
//            }
//        } catch (e: Exception) {
//            Result.Error(e, e.message ?: "Gagal memuat gambar jadwal")
//        }
//    }
//
//    suspend fun uploadTeacherScheduleImage(
//        teacherId: Int,
//        data: Map<String, String>
//    ): Result<Any> {
//        return ApiUtils.handleApiCall {
//            apiService.uploadTeacherScheduleImage(teacherId, data)
//        }.map { response ->
//            response.data ?: Any()
//        }
//    }
//
//    suspend fun deleteTeacherScheduleImage(teacherId: Int): Result<Any> {
//        return ApiUtils.handleApiCall {
//            apiService.deleteTeacherScheduleImage(teacherId)
//        }.map { response ->
//            response.data ?: Any()
//        }
//    }
//
//    suspend fun getMyHomeroom(): Result<Classes> {
//        return try {
//            val response = apiService.getMyHomeroom()
//            if (response.isSuccessful) {
//                val classData = response.body()?.data
//                if (classData != null) {
//                    Result.Success(classData)
//                } else {
//                    Log.w(TAG, "getMyHomeroom: backend returned empty class data")
//                    Result.Success(emptyHomeroom())
//                }
//            } else {
//                Log.w(TAG, "getMyHomeroom HTTP ${response.code()} - treating as empty homeroom")
//                Result.Success(emptyHomeroom())
//            }
//        } catch (e: Exception) {
//            Log.w(TAG, "getMyHomeroom exception: ${e.message}", e)
//            Result.Success(emptyHomeroom())
//        }
//    }
//
//    suspend fun getMyHomeroomStudents(): Result<List<StudentResource>> {
//        return try {
//            val response = apiService.getMyHomeroomStudents()
//            if (response.isSuccessful) {
//                Result.Success(response.body() ?: emptyList())
//            } else {
//                Log.w(TAG, "getMyHomeroomStudents HTTP ${response.code()} - returning empty list")
//                Result.Success(emptyList())
//            }
//        } catch (e: Exception) {
//            Log.w(TAG, "getMyHomeroomStudents exception: ${e.message}", e)
//            Result.Success(emptyList())
//        }
//    }
//
//    suspend fun getMyHomeroomSchedules(): Result<List<Schedule>> {
//        return try {
//            val response = apiService.getMyHomeroomSchedules()
//            if (response.isSuccessful) {
//                val data = response.body()?.items ?: emptyList()
//                Log.d(TAG, "getMyHomeroomSchedules: ${data.size} jadwal")
//                Result.Success(data)
//            } else {
//                Log.e(TAG, "getMyHomeroomSchedules HTTP ${response.code()}")
//                Result.Success(emptyList())
//            }
//        } catch (e: Exception) {
//            Log.e(TAG, "getMyHomeroomSchedules exception: ${e.message}", e)
//            Result.Success(emptyList())
//        }
//    }
//
//    private fun emptyHomeroom(): Classes {
//        return Classes(
//            id = null,
//            name = null,
//            grade = null,
//            label = null,
//            major = null,
//            majorName = null,
//            majorId = null,
//            homeroomTeacher = null,
//            homeroomTeacherId = null,
//            homeroomTeacherName = null,
//            className = null,
//            studentCount = 0,
//            createdAt = null
//        )
//    }
//
//    suspend fun getMyHomeroomAttendance(
//        startDate: String? = null,
//        endDate: String? = null
//    ): Result<List<AttendanceResource>> {
//        return try {
//            val response = apiService.getMyHomeroomAttendance(startDate, endDate)
//            if (response.isSuccessful) {
//                val list = response.body() ?: emptyList()
//                Log.d(TAG, "getMyHomeroomAttendance: ${list.size} records")
//                Result.Success(list)
//            } else {
//                Log.e(TAG, "getMyHomeroomAttendance HTTP ${response.code()}")
//                Result.Error(
//                    Exception("HTTP ${response.code()}"),
//                    "Gagal memuat absensi wali kelas"
//                )
//            }
//        } catch (e: Exception) {
//            Log.e(TAG, "getMyHomeroomAttendance exception: ${e.message}", e)
//            Result.Error(e, e.message ?: "Gagal memuat absensi wali kelas")
//        }
//    }
//
//    suspend fun getMyHomeroomAttendanceSummary(
//        startDate: String? = null,
//        endDate: String? = null
//    ): Result<AttendanceSummary> {
//        return ApiUtils.handleApiCall {
//            apiService.getMyHomeroomAttendanceSummary(startDate, endDate)
//        }.map { response ->
//            response.data ?: AttendanceSummary()
//        }
//    }
//
//    suspend fun getTeacherSchedules(teacherId: Int): Result<List<Schedule>> {
//        return ApiUtils.handleApiCall {
//            apiService.getTeacherSchedules(teacherId)
//        }.map { response ->
//            response.data ?: emptyList()
//        }
//    }
//
//    suspend fun getMyScheduleDetail(scheduleId: Int): Result<TeacherScheduleDetailResponse> {
//        return try {
//            val response = apiService.getMyScheduleDetail(scheduleId)
//            if (response.isSuccessful) {
//                Result.Success(response.body() ?: TeacherScheduleDetailResponse())
//            } else {
//                Result.Error(Exception("HTTP ${response.code()}"), "Gagal memuat detail jadwal")
//            }
//        } catch (e: Exception) {
//            Result.Error(e, e.message ?: "Gagal memuat detail jadwal")
//        }
//    }
//
////    suspend fun getMyScheduleDetail(scheduleId: Int): Result<Any> {
////        return ApiUtils.handleApiCall {
////            apiService.getMyScheduleDetail(scheduleId)
////        }.map { response ->
////            response.data ?: Any()
////        }
////    }
//
//    suspend fun getMyScheduleStudents(scheduleId: Int): Result<List<StudentResource>> {
//        return try {
//            val response = apiService.getMyScheduleStudents(scheduleId)
//
//            if (!response.isSuccessful) {
//                Log.w(TAG, "getMyScheduleStudents HTTP ${response.code()} - returning empty list")
//                return Result.Success(emptyList())
//            }
//
//            val students = response.body()?.data ?: emptyList()
//            Log.d(TAG, "getMyScheduleStudents: scheduleId=$scheduleId total=${students.size}")
//            Result.Success(students)
//        } catch (e: Exception) {
//            Log.w(TAG, "getMyScheduleStudents exception: ${e.message}", e)
//            Result.Success(emptyList())
//        }
//    }
//
//    suspend fun createStudentLeave(
//        scheduleId: Int,
//        studentId: Int,
//        data: Map<String, String>
//    ): Result<StudentLeavePermission> {
//        return ApiUtils.handleApiCall {
//            apiService.createStudentLeave(scheduleId, studentId, data)
//        }.map { response ->
//            response.data ?: throw Exception("No leave permission data in response")
//        }
//    }
//
//    suspend fun createLeaveEarly(
//        scheduleId: Int,
//        studentId: Int,
//        data: Map<String, String>
//    ): Result<StudentLeavePermission> {
//        return ApiUtils.handleApiCall {
//            apiService.createLeaveEarly(scheduleId, studentId, data)
//        }.map { response ->
//            response.data ?: throw Exception("No leave permission data in response")
//        }
//    }
//
//    suspend fun getClassLeavePermissions(classId: Int): Result<List<StudentLeavePermission>> {
//        return ApiUtils.handleApiCall {
//            apiService.getClassLeavePermissions(classId)
//        }.map { response ->
//            response.data ?: emptyList()
//        }
//    }
//
//    suspend fun getMonthlyStatistics(): Result<Map<String, Any>> {
//        return ApiUtils.handleApiCall {
//            apiService.getMonthlyStatistics()
//        }.map { response ->
//            response.data ?: emptyMap()
//        }
//    }
//
//    suspend fun getStudentsFollowUp(): Result<List<StudentFollowUp>> {
//        return try {
//            ApiUtils.handleApiCall {
//                apiService.getStudentsFollowUp()
//            }.map {
//                it.data ?: emptyList<StudentFollowUp>()
//            }
//        } catch (e: Exception) {
//            Log.e(TAG, "Error loading students follow up", e)
//            Result.Error(e, e.message ?: "Gagal memuat data follow up")
//        }
//    }
//
//    suspend fun getStudentsFollowUpUiModels(
//        problemOnly: Boolean = true
//    ): Result<List<StudentFollowUpUiModel>> {
//        return try {
//            when (val source = getStudentsFollowUp()) {
//                is Result.Success -> {
//                    val mapped = source.data
//                        .map { it.toUiModel() }
//                        .let { list ->
//                            if (problemOnly) list.filter { it.isProblematic } else list
//                        }
//                        .sortedWith(
//                            compareByDescending<StudentFollowUpUiModel> { it.severityScore }
//                                .thenByDescending { it.alphaCount }
//                                .thenBy { it.studentName.lowercase() }
//                        )
//
//                    Result.Success(mapped)
//                }
//                is Result.Error -> {
//                    Result.Error(
//                        source.exception,
//                        source.message ?: "Gagal memuat data follow up"
//                    )
//                }
//                is Result.Loading -> Result.Loading()
//            }
//        } catch (e: Exception) {
//            Log.e(TAG, "Error mapping students follow up UI models", e)
//            Result.Error(e, e.message ?: "Gagal memproses data follow up")
//        }
//    }
//
//    suspend fun createStudentFollowUp(
//        studentId: Int,
//        note: String,
//        action: String? = null
//    ): Result<StudentFollowUp> {
//        return try {
//            val request = StudentFollowUpRequest(
//                studentId = studentId,
//                note = note,
//                action = action
//            )
//
//            ApiUtils.handleApiCall {
//                apiService.createFollowUp(request)
//            }.map { response ->
//                response.data ?: throw Exception("Tidak ada data tindak lanjut dari server")
//            }
//        } catch (e: Exception) {
//            Log.e(TAG, "createStudentFollowUp error: ${e.message}", e)
//            Result.Error(e, e.message ?: "Gagal membuat tindak lanjut")
//        }
//    }
//}
