package com.example.ritamesa.api.repositories

import android.content.Context
import android.util.Log
import com.example.ritamesa.api.ApiClient
import com.example.ritamesa.api.ApiUtils
import com.example.ritamesa.api.Result
import com.example.ritamesa.api.models.*

class ScheduleRepository(
    private val context: Context,
    private val apiService: com.example.ritamesa.api.services.ApiService = ApiClient.getApiService(context)
) {
    companion object {
        private const val TAG = "ScheduleRepository"
    }

    suspend fun getSchedules(
        classId: Int? = null,
        year: String? = null,
        semester: String? = null
    ): Result<List<Schedule>> {
        Log.d(TAG, "getSchedules: classId=$classId, year=$year, semester=$semester")
        return ApiUtils.handleApiCall {
            apiService.getSchedules(
                classId = classId,
                year = year,
                semester = semester
            )
        }.map { response ->
            response.data ?: emptyList()
        }
    }

    suspend fun getSchedule(scheduleId: Int): Result<Schedule> {
        Log.d(TAG, "getSchedule: scheduleId=$scheduleId")
        return ApiUtils.handleApiCall {
            apiService.getSchedule(scheduleId)
        }.map { response ->
            response.data ?: throw Exception("No schedule data in response")
        }
    }

    suspend fun createSchedule(request: StoreScheduleRequest): Result<Schedule> {
        Log.d(TAG, "createSchedule")
        return ApiUtils.handleApiCall {
            apiService.createSchedule(request)
        }.map { response ->
            response.data ?: throw Exception("No schedule data in response")
        }
    }

    suspend fun updateSchedule(scheduleId: Int, request: UpdateScheduleRequest): Result<Schedule> {
        Log.d(TAG, "updateSchedule: scheduleId=$scheduleId")
        return ApiUtils.handleApiCall {
            apiService.updateSchedule(scheduleId, request)
        }.map { response ->
            response.data ?: throw Exception("No schedule data in response")
        }
    }

    suspend fun deleteSchedule(scheduleId: Int): Result<Unit> {
        Log.d(TAG, "deleteSchedule: scheduleId=$scheduleId")
        return ApiUtils.handleApiCall {
            apiService.deleteSchedule(scheduleId)
        }.map { Unit }
    }

    suspend fun getTeacherSchedules(teacherId: Int): Result<List<Schedule>> {
        Log.d(TAG, "getTeacherSchedules: teacherId=$teacherId")
        return ApiUtils.handleApiCall {
            apiService.getTeacherSchedules(teacherId)
        }.map { response ->
            response.data ?: emptyList()
        }
    }

    suspend fun getMySchedules(date: String? = null): Result<List<Schedule>> {
        Log.d(TAG, "getMySchedules: date=$date")
        return ApiUtils.handleApiCall {
            apiService.getMySchedules(date)
        }.map { response ->
            response.items ?: response.data ?: emptyList()
        }
    }

    suspend fun getTodaysSchedule(): Result<List<Schedule>> {
        Log.d(TAG, "getTodaysSchedule")
        return try {
            ApiUtils.handleApiCall {
                apiService.getTodaysSchedule()
            }.map { response ->
                val list = response.items ?: response.data ?: emptyList()
                Log.d(TAG, "Fetched ${list.size} schedules from today's endpoint")
                list
            }
        } catch (e: Exception) {
            Log.e(TAG, "getTodaysSchedule Exception: ${e.message}", e)
            Result.Error(e, e.message ?: "Gagal memuat jadwal hari ini")
        }
    }

    suspend fun getClassSchedules(classId: Int): Result<List<Schedule>> {
        Log.d(TAG, "getClassSchedules: using /me/class/schedules (classId=$classId ignored for pengurus)")
        return ApiUtils.handleApiCall {
            apiService.getMyClassSchedules(date = null)
        }.map { response ->
            response.items ?: response.data ?: emptyList()
        }
    }

    suspend fun getMyScheduleDetail(scheduleId: Int): Result<TeacherScheduleDetailResponse> {
        Log.d(TAG, "getMyScheduleDetail: scheduleId=$scheduleId")
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
        Log.d(TAG, "getMyScheduleStudents: scheduleId=$scheduleId")
        return ApiUtils.handleApiCall {
            apiService.getMyScheduleStudents(scheduleId)
        }.map { response ->
            response.data ?: emptyList()
        }
    }

    suspend fun getMyClassSchedules(date: String? = null): Result<List<Schedule>> {
        Log.d(TAG, "getMyClassSchedules: date=$date")
        return ApiUtils.handleApiCall {
            apiService.getMyClassSchedules(date)
        }.map { response ->
            response.items ?: response.data ?: emptyList()
        }
    }

    suspend fun bulkUpsertSchedules(classId: Int, request: BulkScheduleRequest): Result<List<Schedule>> {
        Log.d(TAG, "bulkUpsertSchedules: classId=$classId")
        return ApiUtils.handleApiCall {
            apiService.bulkUpsertSchedules(classId, request)
        }.map { response ->
            response.data ?: emptyList()
        }
    }

    suspend fun getScheduleAttendanceSummary(scheduleId: Int): Result<AttendanceSummary> {
        Log.d(TAG, "getScheduleAttendanceSummary: scheduleId=$scheduleId")
        return ApiUtils.handleApiCall {
            apiService.getScheduleAttendanceSummary(scheduleId)
        }.map { response ->
            response.data ?: AttendanceSummary()
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
//class ScheduleRepository(
//    private val context: Context,
//    private val apiService: com.example.ritamesa.api.services.ApiService = ApiClient.getApiService(context)
//) {
//    companion object {
//        private const val TAG = "ScheduleRepository"
//    }
//
//    suspend fun getSchedules(
//        classId: Int? = null,
//        year: String? = null,
//        semester: String? = null
//    ): Result<List<Schedule>> {
//        Log.d(TAG, "getSchedules: classId=$classId, year=$year, semester=$semester")
//        return ApiUtils.handleApiCall {
//            apiService.getSchedules(
//                classId = classId,
//                year = year,
//                semester = semester
//            )
//        }.map { response ->
//            response.data ?: emptyList()
//        }
//    }
//
//    suspend fun getSchedule(scheduleId: Int): Result<Schedule> {
//        Log.d(TAG, "getSchedule: scheduleId=$scheduleId")
//        return ApiUtils.handleApiCall {
//            apiService.getSchedule(scheduleId)
//        }.map { response ->
//            response.data ?: throw Exception("No schedule data in response")
//        }
//    }
//
//    suspend fun createSchedule(request: StoreScheduleRequest): Result<Schedule> {
//        Log.d(TAG, "createSchedule")
//        return ApiUtils.handleApiCall {
//            apiService.createSchedule(request)
//        }.map { response ->
//            response.data ?: throw Exception("No schedule data in response")
//        }
//    }
//
//    suspend fun updateSchedule(scheduleId: Int, request: UpdateScheduleRequest): Result<Schedule> {
//        Log.d(TAG, "updateSchedule: scheduleId=$scheduleId")
//        return ApiUtils.handleApiCall {
//            apiService.updateSchedule(scheduleId, request)
//        }.map { response ->
//            response.data ?: throw Exception("No schedule data in response")
//        }
//    }
//
//    suspend fun deleteSchedule(scheduleId: Int): Result<Unit> {
//        Log.d(TAG, "deleteSchedule: scheduleId=$scheduleId")
//        return ApiUtils.handleApiCall {
//            apiService.deleteSchedule(scheduleId)
//        }.map { Unit }
//    }
//
//    suspend fun getTeacherSchedules(teacherId: Int): Result<List<Schedule>> {
//        Log.d(TAG, "getTeacherSchedules: teacherId=$teacherId")
//        return ApiUtils.handleApiCall {
//            apiService.getTeacherSchedules(teacherId)
//        }.map { response ->
//            response.data ?: emptyList()
//        }
//    }
//
//    suspend fun getMySchedules(date: String? = null): Result<List<Schedule>> {
//        Log.d(TAG, "getMySchedules: date=$date")
//        return ApiUtils.handleApiCall {
//            apiService.getMySchedules(date)
//        }.map { response ->
//            response.items ?: response.data ?: emptyList()
//        }
//    }
//
//    suspend fun getTodaysSchedule(): Result<List<Schedule>> {
//        Log.d(TAG, "getTodaysSchedule")
//        return try {
//            ApiUtils.handleApiCall {
//                apiService.getTodaysSchedule()
//            }.map { response ->
//                val list = response.items ?: response.data ?: emptyList()
//                Log.d(TAG, "Fetched ${list.size} schedules from today's endpoint")
//                list
//            }
//        } catch (e: Exception) {
//            Log.e(TAG, "getTodaysSchedule Exception: ${e.message}", e)
//            Result.Error(e, e.message ?: "Gagal memuat jadwal hari ini")
//        }
//    }
//
//    suspend fun getClassSchedules(classId: Int): Result<List<Schedule>> {
//        Log.d(TAG, "getClassSchedules: using /me/class/schedules (classId=$classId ignored for pengurus)")
//        return ApiUtils.handleApiCall {
//            apiService.getMyClassSchedules(date = null)
//        }.map { response ->
//            response.items ?: response.data ?: emptyList()
//        }
//    }
//
//    suspend fun getMyScheduleDetail(scheduleId: Int): Result<Any> {
//        Log.d(TAG, "getMyScheduleDetail: scheduleId=$scheduleId")
//        return ApiUtils.handleApiCall {
//            apiService.getMyScheduleDetail(scheduleId)
//        }.map { response ->
//            response.data ?: Any()
//        }
//    }
//
//    suspend fun getMyScheduleStudents(scheduleId: Int): Result<List<StudentResource>> {
//        return try {
//            val response = apiService.getMyScheduleStudents(scheduleId)
//
//            if (!response.isSuccessful) {
//                Log.e(TAG, "getMyScheduleStudents HTTP ${response.code()}")
//                return Result.Error(
//                    Exception("HTTP ${response.code()}"),
//                    "Gagal memuat siswa jadwal"
//                )
//            }
//
//            // FIX: Ganti resolvedStudents() yang tidak ada menjadi .data
//            val students = response.body()?.data ?: emptyList()
//            Log.d(TAG, "getMyScheduleStudents: scheduleId=$scheduleId, total=${students.size}")
//
//            Result.Success(students)
//        } catch (e: Exception) {
//            Log.e(TAG, "getMyScheduleStudents exception: ${e.message}", e)
//            Result.Error(e, e.message ?: "Gagal memuat siswa jadwal")
//        }
//    }
//
//    suspend fun getMyClassSchedules(date: String? = null): Result<List<Schedule>> {
//        Log.d(TAG, "getMyClassSchedules: date=$date")
//        return ApiUtils.handleApiCall {
//            apiService.getMyClassSchedules(date)
//        }.map { response ->
//            response.items ?: response.data ?: emptyList()
//        }
//    }
//
//    suspend fun bulkUpsertSchedules(classId: Int, request: BulkScheduleRequest): Result<List<Schedule>> {
//        Log.d(TAG, "bulkUpsertSchedules: classId=$classId")
//        return ApiUtils.handleApiCall {
//            apiService.bulkUpsertSchedules(classId, request)
//        }.map { response ->
//            response.data ?: emptyList()
//        }
//    }
//
//    suspend fun getScheduleAttendanceSummary(scheduleId: Int): Result<AttendanceSummary> {
//        Log.d(TAG, "getScheduleAttendanceSummary: scheduleId=$scheduleId")
//        return ApiUtils.handleApiCall {
//            apiService.getScheduleAttendanceSummary(scheduleId)
//        }.map { response ->
//            response.data ?: AttendanceSummary()
//        }
//    }
//}



// refixed
//package com.example.ritamesa.api.repositories
//
//import android.content.Context
//import android.util.Log
//import com.example.ritamesa.api.ApiClient
//import com.example.ritamesa.api.ApiUtils
//import com.example.ritamesa.api.Result
//import com.example.ritamesa.api.models.*
//import java.text.SimpleDateFormat
//import java.util.*
//
//class ScheduleRepository(
//    private val context: Context,
//    private val apiService: com.example.ritamesa.api.services.ApiService = ApiClient.getApiService(context)
//) {
//    companion object {
//        private const val TAG = "ScheduleRepository"
//    }
//
//    // FIX: ApiService.getSchedules hanya menerima (classId, page) — tidak ada year/semester.
//    // Parameter year & semester dihapus agar sesuai signature ApiService.
//    suspend fun getSchedules(classId: Int? = null, page: Int? = null): Result<List<Schedule>> {
//        Log.d(TAG, "getSchedules: classId=$classId")
//        return ApiUtils.handleApiCall {
//            apiService.getSchedules(classId, page)
//        }.map { response ->
//            response.data ?: emptyList()
//        }
//    }
//
//    suspend fun getSchedule(scheduleId: Int): Result<Schedule> {
//        Log.d(TAG, "getSchedule: scheduleId=$scheduleId")
//        return ApiUtils.handleApiCall {
//            apiService.getSchedule(scheduleId)
//        }.map { response ->
//            response.data ?: throw Exception("No schedule data in response")
//        }
//    }
//
//    suspend fun createSchedule(request: StoreScheduleRequest): Result<Schedule> {
//        Log.d(TAG, "createSchedule")
//        return ApiUtils.handleApiCall {
//            apiService.createSchedule(request)
//        }.map { response ->
//            response.data ?: throw Exception("No schedule data in response")
//        }
//    }
//
//    suspend fun updateSchedule(scheduleId: Int, request: UpdateScheduleRequest): Result<Schedule> {
//        Log.d(TAG, "updateSchedule: scheduleId=$scheduleId")
//        return ApiUtils.handleApiCall {
//            apiService.updateSchedule(scheduleId, request)
//        }.map { response ->
//            response.data ?: throw Exception("No schedule data in response")
//        }
//    }
//
//    suspend fun deleteSchedule(scheduleId: Int): Result<Unit> {
//        Log.d(TAG, "deleteSchedule: scheduleId=$scheduleId")
//        return ApiUtils.handleApiCall {
//            apiService.deleteSchedule(scheduleId)
//        }.map { Unit }
//    }
//
//    suspend fun getTeacherSchedules(teacherId: Int): Result<List<Schedule>> {
//        Log.d(TAG, "getTeacherSchedules: teacherId=$teacherId")
//        return ApiUtils.handleApiCall {
//            apiService.getTeacherSchedules(teacherId)
//        }.map { response ->
//            response.data ?: emptyList()
//        }
//    }
//
//    // FIX: ApiService.getMySchedules() sekarang menerima optional date parameter.
//    suspend fun getMySchedules(date: String? = null): Result<List<Schedule>> {
//        Log.d(TAG, "getMySchedules: date=$date")
//        return ApiUtils.handleApiCall {
//            apiService.getMySchedules(date)
//        }.map { response ->
//            response.data ?: emptyList()
//        }
//    }
//
//    // FIX: Gunakan endpoint getTodaysSchedule() yang sudah ada di ApiService.
//    // Return type ApiResponse<List<Schedule>> — akses via .data.
//    suspend fun getTodaysSchedule(): Result<List<Schedule>> {
//        Log.d(TAG, "getTodaysSchedule")
//        return try {
//            ApiUtils.handleApiCall {
//                apiService.getTodaysSchedule()
//            }.map { response ->
//                val list = response.data ?: emptyList()
//                Log.d(TAG, "Fetched ${list.size} schedules from today's endpoint")
//                list
//            }
//        } catch (e: Exception) {
//            Log.e(TAG, "getTodaysSchedule Exception: ${e.message}", e)
//            Result.Error(e, e.message ?: "Gagal memuat jadwal hari ini")
//        }
//    }
//
//    // FIX: ApiService.getMyClassSchedules menerima optional date param.
//    suspend fun getClassSchedules(classId: Int): Result<List<Schedule>> {
//        Log.d(TAG, "getClassSchedules: classId=$classId")
//        return ApiUtils.handleApiCall {
//            apiService.getMyClassSchedules(date = null)
//        }.map { response ->
//            response.data ?: emptyList()
//        }
//    }
//
//    suspend fun getMyScheduleDetail(scheduleId: Int): Result<Any> {
//        Log.d(TAG, "getMyScheduleDetail: scheduleId=$scheduleId")
//        return ApiUtils.handleApiCall {
//            apiService.getMyScheduleDetail(scheduleId)
//        }.map { response ->
//            response.data ?: Any()
//        }
//    }
//
//    suspend fun getMyScheduleStudents(scheduleId: Int): Result<List<StudentResource>> {
//        Log.d(TAG, "getMyScheduleStudents: scheduleId=$scheduleId")
//        return ApiUtils.handleApiCall {
//            apiService.getMyScheduleStudents(scheduleId)
//        }.map { response ->
//            response.data ?: emptyList()
//        }
//    }
//
//    // FIX: ApiService.getMyClassSchedules menerima optional date param
//    suspend fun getMyClassSchedules(date: String? = null): Result<List<Schedule>> {
//        Log.d(TAG, "getMyClassSchedules: date=$date")
//        return ApiUtils.handleApiCall {
//            apiService.getMyClassSchedules(date)
//        }.map { response ->
//            response.data ?: emptyList()
//        }
//    }
//
//    suspend fun bulkUpsertSchedules(classId: Int, request: BulkScheduleRequest): Result<List<Schedule>> {
//        Log.d(TAG, "bulkUpsertSchedules: classId=$classId")
//        return ApiUtils.handleApiCall {
//            apiService.bulkUpsertSchedules(classId, request)
//        }.map { response ->
//            response.data ?: emptyList()
//        }
//    }
//
//    suspend fun getScheduleAttendanceSummary(scheduleId: Int): Result<AttendanceSummary> {
//        Log.d(TAG, "getScheduleAttendanceSummary: scheduleId=$scheduleId")
//        return ApiUtils.handleApiCall {
//            apiService.getScheduleAttendanceSummary(scheduleId)
//        }.map { response ->
//            response.data ?: AttendanceSummary()
//        }
//    }
//}