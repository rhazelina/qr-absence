package com.example.ritamesa.api.repositories

import android.content.Context
import android.util.Log
import com.example.ritamesa.api.ApiClient
import com.example.ritamesa.api.ApiUtils
import com.example.ritamesa.api.Result
import com.example.ritamesa.api.models.*
import com.example.ritamesa.AppPreferences
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject

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
        Log.d(TAG, "getStudents: search=$search, classId=$classId, page=$page, perPage=$perPage")
        return ApiUtils.handleApiCall {
            apiService.getStudents(search, classId, page, perPage)
        }.map { response ->
            Log.d(TAG, "getStudents response: ${response.data?.size} items")
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
                is Result.Error   -> Log.e(TAG, "createStudent error: ${result.message}")
                else -> {}
            }
        }
    }

    suspend fun getStudent(studentId: Int): Result<StudentResource> {
        Log.d(TAG, "getStudent: studentId=$studentId")
        return ApiUtils.handleApiCall {
            apiService.getStudent(studentId)
        }.map { response -> response.data ?: throw Exception("No student data in response") }
    }

    suspend fun updateStudent(studentId: Int, request: UpdateStudentRequest): Result<StudentResource> {
        Log.d(TAG, "updateStudent: studentId=$studentId")
        return ApiUtils.handleApiCallFlat {
            apiService.updateStudentFlat(studentId, request)
        }.also { result ->
            when (result) {
                is Result.Success -> Log.d(TAG, "updateStudent success: ${result.data}")
                is Result.Error   -> Log.e(TAG, "updateStudent error: ${result.message}")
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
                is Result.Error   -> Log.e(TAG, "deleteStudent error: ${result.message}")
                else -> {}
            }
        }
    }

    suspend fun importStudents(request: StudentImportRequest): Result<StudentImportResponse> {
        Log.d(TAG, "importStudents: $request")
        return ApiUtils.handleApiCall {
            apiService.importStudents(request)
        }.map { response -> response.data ?: StudentImportResponse() }
    }

    /**
     * GET /api/students/{student}/attendance
     *
     * ROOT CAUSE FIX:
     * Endpoint ini dipanggil oleh Waka (bukan siswa), sehingga response-nya
     * bisa berbeda format tergantung implementasi backend:
     *
     *   Format A — Paginated (Laravel Resource Collection):
     *     { "data": [{id, status, date, schedule:{...}, student:{...}}, ...],
     *       "links":{...}, "meta":{...} }
     *
     *   Format B — History wrapper:
     *     { "history": [{id, status, date, schedule:{...}}, ...] }
     *
     * Sebelumnya kode ini hanya handle Format B (TeacherAttendanceHistoryResponse),
     * sedangkan backend kemungkinan mengembalikan Format A (paginated) yang sama
     * dengan AttendanceController@me() — sehingga field "history" tidak ketemu
     * → historyResponse.history selalu kosong → popup selalu kosong.
     *
     * Solusi: Parse raw JSON via OkHttp, deteksi format secara otomatis,
     * handle keduanya dengan field mapping yang lengkap dari AttendanceResource.
     *
     * Ini berbeda dengan kenapa dashboard waka bekerja: dashboard pakai endpoint
     * /waka/attendance/summary yang return flat {status_summary:[{status,total}]}
     * — bukan list detail kehadiran.
     */
    suspend fun getStudentAttendanceHistory(
        studentId: Int,
        startDate: String? = null,
        endDate: String? = null
    ): Result<List<AttendanceResource>> {
        Log.d(TAG, "getStudentAttendanceHistory: studentId=$studentId")
        return try {
            val items = fetchStudentAttendanceRaw(studentId, startDate, endDate)
            Log.d(TAG, "getStudentAttendanceHistory: parsed ${items.size} items for studentId=$studentId")
            Result.Success(items)
        } catch (e: Exception) {
            Log.e(TAG, "getStudentAttendanceHistory exception: studentId=$studentId", e)
            Result.Error(e, e.message ?: "Gagal memuat riwayat kehadiran siswa")
        }
    }

    /**
     * Ambil attendance siswa via OkHttp raw JSON parsing.
     *
     * Kenapa raw OkHttp, bukan Retrofit + Gson?
     * Karena kita tidak tahu pasti format response backend tanpa melihat
     * route /students/{id}/attendance di backend. Raw parsing memungkinkan kita
     * handle KEDUA format (paginated atau history) secara defensive.
     *
     * Parsing field dilakukan secara eksplisit dari JSON — tidak bergantung pada
     * nama field Kotlin model yang bisa berbeda dari nama field JSON backend.
     */
    private suspend fun fetchStudentAttendanceRaw(
        studentId: Int,
        startDate: String? = null,
        endDate: String? = null
    ): List<AttendanceResource> {
        val prefs   = AppPreferences(context)
        val token   = prefs.getAuthTokenSync()
            ?: throw Exception("Token tidak tersedia, silakan login ulang")
        val baseUrl = AppPreferences.API_BASE_URL

        // Build URL dengan query params opsional
        val urlBuilder = StringBuilder("${baseUrl}students/$studentId/attendance")
        val params = mutableListOf<String>()
        if (!startDate.isNullOrBlank()) params.add("start_date=$startDate")
        if (!endDate.isNullOrBlank())   params.add("end_date=$endDate")
        // Minta semua data tanpa pagination (per_page besar)
        params.add("per_page=1000")
        if (params.isNotEmpty()) urlBuilder.append("?${params.joinToString("&")}")

        val url = urlBuilder.toString()
        Log.d(TAG, "fetchStudentAttendanceRaw URL: $url")

        val client  = okhttp3.OkHttpClient.Builder()
            .connectTimeout(30, java.util.concurrent.TimeUnit.SECONDS)
            .readTimeout(30, java.util.concurrent.TimeUnit.SECONDS)
            .build()

        val request = okhttp3.Request.Builder()
            .url(url)
            .addHeader("Authorization", "Bearer $token")
            .addHeader("Accept", "application/json")
            .build()

        val rawBody = withContext(Dispatchers.IO) {
            client.newCall(request).execute().use { resp ->
                val code = resp.code
                val body = resp.body?.string()
                Log.d(TAG, "fetchStudentAttendanceRaw HTTP $code, body length=${body?.length ?: 0}")
                if (!resp.isSuccessful) {
                    throw Exception("HTTP $code: ${resp.message}")
                }
                body ?: throw Exception("Response body kosong dari server")
            }
        }

        Log.d(TAG, "fetchStudentAttendanceRaw raw response (first 500 chars): ${rawBody.take(500)}")

        return parseAttendanceFromJson(rawBody, studentId)
    }

    /**
     * Parse JSON response attendance ke List<AttendanceResource>.
     *
     * Deteksi format otomatis:
     *   - Jika ada key "data"    → Format A (Paginated / ResourceCollection)
     *   - Jika ada key "history" → Format B (TeacherAttendanceHistoryResponse)
     *   - Jika root adalah array → Format C (array langsung)
     */
    private fun parseAttendanceFromJson(
        rawJson: String,
        studentId: Int
    ): List<AttendanceResource> {
        return try {
            val root = JSONObject(rawJson)

            // ── Format A: Paginated { "data": [...] } ──────────────────────
            if (root.has("data")) {
                val dataVal = root.opt("data")
                if (dataVal is JSONArray) {
                    Log.d(TAG, "parseAttendanceFromJson: Format A (paginated data[])")
                    return parseAttendanceArray(dataVal, studentId)
                }
            }

            // ── Format B: History { "history": [...] } ─────────────────────
            if (root.has("history")) {
                val historyArr = root.optJSONArray("history")
                if (historyArr != null) {
                    Log.d(TAG, "parseAttendanceFromJson: Format B (history[])")
                    return parseHistoryArray(historyArr)
                }
            }

            // ── Format C: Root adalah object tunggal attendance ────────────
            // Fallback jika tidak ada key yang dikenal
            Log.w(TAG, "parseAttendanceFromJson: Format tidak dikenal, keys=${root.keys().asSequence().toList()}")
            emptyList()

        } catch (e: Exception) {
            // ── Format C: Root adalah array langsung ──────────────────────
            try {
                val rootArr = JSONArray(rawJson)
                Log.d(TAG, "parseAttendanceFromJson: Format C (root array)")
                parseAttendanceArray(rootArr, studentId)
            } catch (e2: Exception) {
                Log.e(TAG, "parseAttendanceFromJson: gagal parse JSON", e2)
                emptyList()
            }
        }
    }

    /**
     * Parse array item dari Format A (Paginated ResourceCollection).
     *
     * Setiap item adalah AttendanceResource dari backend:
     * {
     *   "id": 123,
     *   "date": "2025-01-15",
     *   "status": "present",
     *   "status_label": "Hadir",
     *   "checked_in_at": "2025-01-15T07:05:00",
     *   "reason": null,
     *   "student": { "id":"45", "name":"...", "nisn":"..." },
     *   "schedule": {
     *     "id": 7,
     *     "subject_name": "Matematika",
     *     "class_name": "X-RPL-1",
     *     "date": "2025-01-15"
     *   }
     * }
     */
    private fun parseAttendanceArray(arr: JSONArray, studentId: Int): List<AttendanceResource> {
        val result = mutableListOf<AttendanceResource>()
        for (i in 0 until arr.length()) {
            try {
                val item     = arr.getJSONObject(i)
                val id       = item.optInt("id", 0).takeIf { it != 0 }
                val date     = item.optString("date").takeIf { it.isNotBlank() }
                val status   = item.optString("status").takeIf { it.isNotBlank() }
                val reason   = item.optString("reason").takeIf { it.isNotBlank() && it != "null" }
                val checkIn  = resolveCheckIn(item)

                // Parse schedule — bisa nested object atau flat fields
                val scheduleInfo = parseScheduleFromItem(item, date)

                // Parse student info jika ada
                val studentInfo = parseStudentFromItem(item)

                result.add(
                    AttendanceResource(
                        id          = id,
                        student     = studentInfo,
                        schedule    = scheduleInfo,
                        status      = status,
                        timestamp   = checkIn,
                        checkedInAt = checkIn,
                        reason      = reason
                    )
                )
            } catch (e: Exception) {
                Log.w(TAG, "parseAttendanceArray: skip item[$i] — ${e.message}")
            }
        }
        Log.d(TAG, "parseAttendanceArray: parsed ${result.size} items")
        return result
    }

    /**
     * Parse array item dari Format B (TeacherAttendanceHistoryResponse).
     *
     * Setiap item adalah TeacherAttendanceHistoryItem:
     * {
     *   "id": 123,
     *   "date": "2025-01-15",
     *   "status": "present",
     *   "reason": null,
     *   "check_in_time": "07:05:00",
     *   "schedule": {
     *     "id": 7,
     *     "subject": { "name": "Matematika" },
     *     "daily_schedule": {
     *       "class_schedule": { "class": { "name": "X-RPL-1" } }
     *     }
     *   }
     * }
     */
    private fun parseHistoryArray(arr: JSONArray): List<AttendanceResource> {
        val result = mutableListOf<AttendanceResource>()
        for (i in 0 until arr.length()) {
            try {
                val item    = arr.getJSONObject(i)
                val id      = item.optInt("id", 0).takeIf { it != 0 }
                val date    = item.optString("date").takeIf { it.isNotBlank() }
                val status  = item.optString("status").takeIf { it.isNotBlank() }
                val reason  = item.optString("reason").takeIf { it.isNotBlank() && it != "null" }
                val checkIn = resolveCheckIn(item)

                // Parse schedule dari nested object (format TeacherHistoryItem)
                val scheduleObj = item.optJSONObject("schedule")
                val subjectName = scheduleObj
                    ?.optJSONObject("subject")
                    ?.optString("name")
                    ?.takeIf { it.isNotBlank() }
                val className = scheduleObj
                    ?.optJSONObject("daily_schedule")
                    ?.optJSONObject("class_schedule")
                    ?.optJSONObject("class")
                    ?.optString("name")
                    ?.takeIf { it.isNotBlank() }

                val scheduleInfo = ScheduleInfo(
                    id          = scheduleObj?.optInt("id")?.takeIf { it != 0 },
                    subjectName = subjectName,
                    className   = className,
                    date        = date
                )

                result.add(
                    AttendanceResource(
                        id          = id,
                        student     = null,
                        schedule    = scheduleInfo,
                        status      = status,
                        timestamp   = checkIn,
                        checkedInAt = checkIn,
                        reason      = reason
                    )
                )
            } catch (e: Exception) {
                Log.w(TAG, "parseHistoryArray: skip item[$i] — ${e.message}")
            }
        }
        Log.d(TAG, "parseHistoryArray: parsed ${result.size} items")
        return result
    }

    /**
     * Resolve waktu check-in dari berbagai field yang mungkin dipakai backend.
     *
     * Backend bisa mengirim salah satu dari:
     *   - "checked_in_at"  → dari AttendanceResource (Laravel Resource)
     *   - "check_in_time"  → dari TeacherAttendanceHistoryItem
     *   - "timestamp"      → field legacy
     *   - "created_at"     → fallback terakhir
     */
    private fun resolveCheckIn(item: JSONObject): String? {
        return listOf("checked_in_at", "check_in_time", "timestamp", "created_at")
            .firstNotNullOfOrNull { key ->
                item.optString(key).takeIf { it.isNotBlank() && it != "null" }
            }
    }

    /**
     * Parse ScheduleInfo dari item attendance.
     *
     * Format A (AttendanceResource dari ResourceCollection):
     *   "schedule": {
     *     "id": 7,
     *     "subject_name": "Matematika",   ← flat
     *     "class_name": "X-RPL-1",        ← flat
     *     "date": "2025-01-15"
     *   }
     *
     * Format B (TeacherHistoryItem):
     *   "schedule": {
     *     "id": 7,
     *     "subject": { "name": "Matematika" },    ← nested
     *     "daily_schedule": {
     *       "class_schedule": { "class": { "name": "X-RPL-1" } }
     *     }
     *   }
     */
    private fun parseScheduleFromItem(item: JSONObject, fallbackDate: String?): ScheduleInfo {
        val scheduleObj = item.optJSONObject("schedule")
            ?: return ScheduleInfo(id = null, subjectName = null, className = null, classId = null, date = fallbackDate)

        val scheduleId = scheduleObj.optInt("id").takeIf { it != 0 }

        // Coba flat field dulu (Format A)
        var subjectName = scheduleObj.optString("subject_name")
            .takeIf { it.isNotBlank() && it != "null" }

        // Fallback ke nested (Format B)
        if (subjectName == null) {
            subjectName = scheduleObj.optJSONObject("subject")
                ?.optString("name")
                ?.takeIf { it.isNotBlank() }
        }

        // Coba flat field dulu (Format A)
        var className = scheduleObj.optString("class_name")
            .takeIf { it.isNotBlank() && it != "null" }

        // Fallback ke deeply nested (Format B)
        if (className == null) {
            className = scheduleObj
                .optJSONObject("daily_schedule")
                ?.optJSONObject("class_schedule")
                ?.optJSONObject("class")
                ?.optString("name")
                ?.takeIf { it.isNotBlank() }
        }

        val scheduleDate = scheduleObj.optString("date")
            .takeIf { it.isNotBlank() && it != "null" }
            ?: fallbackDate

        return ScheduleInfo(
            id          = scheduleId,
            subjectName = subjectName,
            className   = className,
            classId     = null,
            date        = scheduleDate
        )
    }

    /**
     * Parse StudentInfo dari item attendance jika ada.
     * Beberapa endpoint menyertakan data student, beberapa tidak.
     */
    private fun parseStudentFromItem(item: JSONObject): StudentInfo? {
        val studentObj = item.optJSONObject("student") ?: return null
        return try {
            StudentInfo(
                id        = studentObj.optString("id").takeIf { it.isNotBlank() && it != "null" }
                    ?: studentObj.optInt("id").takeIf { it != 0 }?.toString(),
                name      = studentObj.optString("name").takeIf { it.isNotBlank() },
                nisn      = studentObj.optString("nisn").takeIf { it.isNotBlank() },
                nis       = studentObj.optString("nis").takeIf { it.isNotBlank() },
                className = studentObj.optString("class_name").takeIf { it.isNotBlank() }
            )
        } catch (e: Exception) {
            null
        }
    }

    suspend fun getMyClass(): Result<Classes> {
        Log.d(TAG, "getMyClass")
        return ApiUtils.handleApiCall {
            apiService.getMyClass()
        }.map { response -> response.data ?: throw Exception("No class data in response") }
    }

    suspend fun getMyClassSchedules(): Result<List<Schedule>> {
        Log.d(TAG, "getMyClassSchedules")
        return ApiUtils.handleApiCall {
            apiService.getMyClassSchedules()
        }.map { response -> response.data ?: emptyList() }
    }

    suspend fun getMyClassAttendance(): Result<List<AttendanceResource>> {
        Log.d(TAG, "getMyClassAttendance")
        return ApiUtils.handleApiCallFlat {
            apiService.getMyClassAttendance()
        }.map { historyResponse ->
            historyResponse.history.map { item ->
                AttendanceResource(
                    id       = item.id,
                    student  = null,
                    schedule = ScheduleInfo(
                        id          = item.schedule?.id,
                        subjectName = item.schedule?.subject?.name,
                        className   = item.schedule?.dailySchedule?.classSchedule?.classData?.name,
                        date        = item.date
                    ),
                    status      = item.status,
                    timestamp   = item.resolvedCheckIn(),
                    checkedInAt = item.resolvedCheckIn(),
                    reason      = item.reason
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
        }.map { response -> response.data ?: emptyList() }
    }
}