package com.example.ritamesa.api.repositories

import android.content.Context
import android.util.Log
import com.example.ritamesa.api.ApiClient
import com.example.ritamesa.api.ApiUtils
import com.example.ritamesa.api.Result
import com.example.ritamesa.api.models.*
import com.example.ritamesa.api.services.ApiService

class ClassRepository(
    private val context: Context,
    private val apiService: ApiService = ApiClient.getApiService(context)
) {

    companion object {
        private const val TAG = "ClassRepository"
    }

    // FIX: Tambah parameter perPage agar kompatibel dengan pemanggil (JadwalPembelajaranGuru).
    // ApiService.getClasses tidak mendukung per_page, parameter ini diabaikan.
    suspend fun getClasses(
        search: String? = null,
        grade: String? = null,
        major: String? = null,
        available: Boolean? = null,
        page: Int? = null,
        perPage: Int? = null
    ): Result<List<Classes>> {
        Log.d(TAG, "getClasses: search=$search, perPage=$perPage")
        return ApiUtils.handleApiCall {
            apiService.getClasses(
                search = search,
                grade = grade,
                major = major,
                available = available,
                page = page,
                perPage = perPage
            )
        }.map { response -> response.data ?: emptyList() }
    }

//    suspend fun getClasses(
//        search: String? = null,
//        page: Int? = null,
//        perPage: Int? = null
//    ): Result<List<Classes>> {
//        Log.d(TAG, "getClasses: search=$search, perPage=$perPage")
//        return ApiUtils.handleApiCall {
//            apiService.getClasses(search, page, perPage)
//        }.map { response -> response.data ?: emptyList() }
//    }

    suspend fun createClass(request: CreateKelasRequest): Result<Classes> {
        Log.d(TAG, "createClass")
        return ApiUtils.handleApiCallFlat { apiService.createClassFlat(request) }
    }

    suspend fun getClass(classId: Int): Result<Classes> {
        Log.d(TAG, "getClass: $classId")
        return ApiUtils.handleApiCall {
            apiService.getClass(classId)
        }.map { response -> response.data ?: throw Exception("No class data in response") }
    }

    suspend fun updateClass(classId: Int, request: UpdateKelasRequest): Result<Classes> {
        Log.d(TAG, "updateClass: $classId")
        return ApiUtils.handleApiCallFlat { apiService.updateClassFlat(classId, request) }
    }

    suspend fun deleteClass(classId: Int): Result<Unit> {
        Log.d(TAG, "deleteClass: $classId")
        return ApiUtils.handleApiCall { apiService.deleteClass(classId) }.map { Unit }
    }

    suspend fun getMyClass(): Result<Classes> {
        return ApiUtils.handleApiCall {
            apiService.getMyClass()
        }.map { it.data ?: throw Exception("No class data") }
    }

    // FIX: ApiService.getMyClassSchedules menerima optional date parameter
    suspend fun getMyClassSchedules(date: String? = null): Result<List<Schedule>> {
        return ApiUtils.handleApiCall {
            apiService.getMyClassSchedules(date)
        }.map { it.data ?: emptyList() }
    }

    // FIX: ApiService.getMyClassAttendance() returns Response<PaginatedResponse<AttendanceResource>>
    // — tidak ada parameter startDate/endDate, gunakan .data langsung (bukan .history).
    suspend fun getMyClassAttendance(
        startDate: String? = null,
        endDate: String? = null
    ): Result<List<AttendanceResource>> {
        return ApiUtils.handleApiCallFlat {
            apiService.getMyClassAttendance(startDate, endDate)
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


//    suspend fun getMyClassAttendance(startDate: String? = null, endDate: String? = null): Result<List<AttendanceResource>> {
//        return ApiUtils.handleApiCall {
//            apiService.getMyClassAttendance()
//        }.map { response -> response.data ?: emptyList() }
//    }

    suspend fun getMyClassDashboard(): Result<ClassDashboard> {
        return ApiUtils.handleApiCall {
            apiService.getMyClassDashboard()
        }.map { it.data ?: throw Exception("No dashboard data") }
    }

    suspend fun uploadClassScheduleImage(classId: Int, data: Map<String, String>): Result<Any> {
        return ApiUtils.handleApiCall {
            apiService.uploadClassScheduleImage(classId, data)
        }.map { it.data ?: Any() }
    }

    suspend fun uploadClassScheduleImageMultipart(
        classId: Int,
        imagePart: okhttp3.MultipartBody.Part
    ): Result<Any> {
        return ApiUtils.handleApiCall {
            apiService.uploadClassScheduleImageMultipart(classId, imagePart)
        }.map { it.data ?: Any() }
    }

    // FIX: ApiService.getClassScheduleImage mengembalikan Response<ResponseBody>,
    // gunakan .string() dari ResponseBody untuk membaca konten.
    suspend fun getClassScheduleImage(classId: Int): Result<String> {
        return try {
            val response = apiService.getClassScheduleImage(classId)
            if (response.isSuccessful) {
                val bodyString = response.body()?.string() ?: ""
                Log.d(TAG, "getClassScheduleImage raw: $bodyString")
                val url = parseImageUrl(bodyString)
                if (url != null) {
                    Result.Success(url)
                } else {
                    Result.Error(Exception("URL tidak ditemukan"), "URL gambar tidak ada dalam response")
                }
            } else {
                val errMsg = response.errorBody()?.string() ?: "Error ${response.code()}"
                Log.e(TAG, "getClassScheduleImage error: $errMsg")
                Result.Error(Exception(errMsg), errMsg)
            }
        } catch (e: Exception) {
            Log.e(TAG, "getClassScheduleImage exception: ${e.message}", e)
            Result.Error(e, e.message ?: "Error")
        }
    }

    private fun parseImageUrl(json: String): String? {
        return try {
            val obj = org.json.JSONObject(json)
            val data = obj.optJSONObject("data")
            if (data != null) {
                data.optString("url").takeIf { it.isNotBlank() && it != "null" }
                    ?: data.optString("path").takeIf { it.isNotBlank() && it != "null" }
                    ?: data.optString("image_url").takeIf { it.isNotBlank() && it != "null" }
                    ?: data.optString("file_url").takeIf { it.isNotBlank() && it != "null" }
            } else {
                obj.optString("url").takeIf { it.isNotBlank() && it != "null" }
                    ?: obj.optString("path").takeIf { it.isNotBlank() && it != "null" }
                    ?: obj.optString("image_url").takeIf { it.isNotBlank() && it != "null" }
                    ?: obj.optString("data").takeIf { it.isNotBlank() && it.startsWith("http") }
            }
        } catch (e: Exception) {
            Log.e(TAG, "parseImageUrl failed: ${e.message}")
            if (json.contains("http")) json.trim().removeSurrounding("\"") else null
        }
    }

    suspend fun deleteClassScheduleImage(classId: Int): Result<Any> {
        return ApiUtils.handleApiCall {
            apiService.deleteClassScheduleImage(classId)
        }.map { it.data ?: Any() }
    }

    suspend fun getClassStudentsOnLeave(classId: Int): Result<List<StudentLeavePermission>> {
        return ApiUtils.handleApiCall {
            apiService.getClassStudentsOnLeave(classId)
        }.map { it.data ?: emptyList() }
    }

    suspend fun getClassStudentsAbsences(classId: Int, startDate: String? = null, endDate: String? = null): Result<List<Any>> {
        return ApiUtils.handleApiCall {
            apiService.getClassStudentsAbsences(classId, startDate, endDate)
        }.map { it.data ?: emptyList() }
    }

    suspend fun getClassLeavePermissions(classId: Int): Result<List<StudentLeavePermission>> {
        return ApiUtils.handleApiCall {
            apiService.getClassLeavePermissions(classId)
        }.map { it.data ?: emptyList() }
    }
}