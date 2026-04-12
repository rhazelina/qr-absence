package com.example.ritamesa.api.repositories

import android.content.Context
import android.util.Log
import com.example.ritamesa.api.ApiClient
import com.example.ritamesa.api.ApiUtils
import com.example.ritamesa.api.Result
import com.example.ritamesa.api.models.*
import java.text.SimpleDateFormat
import java.util.*

class ScheduleRepository(
    private val context: Context,
    private val apiService: com.example.ritamesa.api.services.ApiService = ApiClient.getApiService(context)
) {
    companion object {
        private const val TAG = "ScheduleRepository"
    }

    // ============================================================
    // SCHEDULE ITEM — existing functions (tidak diubah)
    // ============================================================

    suspend fun getSchedules(classId: Int? = null, year: String? = null, semester: String? = null): Result<List<Schedule>> {
        Log.d(TAG, "getSchedules: classId=$classId")
        return ApiUtils.handleApiCall {
            apiService.getSchedules(classId, year, semester)
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
            response.data ?: emptyList()
        }
    }

    @Suppress("UNCHECKED_CAST")
    suspend fun getTodaysSchedule(): Result<List<Schedule>> {
        Log.d(TAG, "getTodaysSchedule")
        return ApiUtils.handleApiCall { apiService.getTodaysSchedule() }
            .map { response ->
                val resultList = mutableListOf<Schedule>()

                // Backend returns: { "status": "success", "message": "...", "items": [...] }
                // For teachers items are flat maps; for students items are full ScheduleItem objects with nested relations
                val rawItems: List<*>? = when {
                    response.containsKey("items") -> response["items"] as? List<*>
                    response.containsKey("data") -> {
                        val data = response["data"]
                        when {
                            data is Map<*, *> && data.containsKey("items") -> data["items"] as? List<*>
                            data is List<*> -> data
                            else -> null
                        }
                    }
                    else -> null
                }

                rawItems?.forEach { item ->
                    if (item !is Map<*, *>) return@forEach
                    try {
                        // --- Parse teacher ---
                        var teacherName: String? = null
                        var teacherInfo: TeacherInfo? = null
                        val teacherObj = item["teacher"]
                        when (teacherObj) {
                            is Map<*, *> -> {
                                // Nested: teacher.user.name (student schedule) OR teacher.name (teacher schedule)
                                val userObj = teacherObj["user"]
                                teacherName = if (userObj is Map<*, *>) {
                                    userObj["name"] as? String
                                } else {
                                    teacherObj["name"] as? String
                                }
                                teacherInfo = TeacherInfo(
                                    id = (teacherObj["id"] as? Double)?.toInt() ?: teacherObj["id"] as? Int,
                                    name = teacherName,
                                    nip = teacherObj["nip"] as? String,
                                    kodeGuru = teacherObj["kode_guru"] as? String
                                )
                            }
                            is String -> {
                                teacherName = teacherObj
                                teacherInfo = TeacherInfo(
                                    id = (item["teacher_id"] as? Double)?.toInt() ?: item["teacher_id"] as? Int,
                                    name = teacherName,
                                    nip = null,
                                    kodeGuru = null
                                )
                            }
                        }

                        // --- Parse subject name ---
                        // Backend for students sends nested subject object; for teachers sends flat "subject" string
                        val subjectName: String = run {
                            val subjectRaw = item["subject"]
                            when (subjectRaw) {
                                is Map<*, *> -> subjectRaw["name"] as? String
                                is String -> subjectRaw
                                else -> null
                            } ?: item["subject_name"] as? String ?: "Mata Pelajaran"
                        }

                        // --- Parse room ---
                        var roomName: String? = null
                        var roomInfo: RoomInfo? = null
                        val roomObj = item["room"]
                        when (roomObj) {
                            is Map<*, *> -> {
                                roomName = roomObj["name"] as? String
                                roomInfo = RoomInfo(
                                    id = (roomObj["id"] as? Double)?.toInt() ?: roomObj["id"] as? Int,
                                    name = roomName,
                                    code = roomObj["code"] as? String
                                )
                            }
                            is String -> {
                                roomName = roomObj
                                roomInfo = RoomInfo(id = null, name = roomName, code = null)
                            }
                        }

                        // --- Parse class ---
                        var classInfo: ClassInfo? = null
                        // For students the class is nested deep: dailySchedule.classSchedule.class
                        // Backend serializes full ScheduleItem with relations, so check nested paths
                        val classObj: Map<*, *>? = run {
                            val direct = item["class"]
                            if (direct is Map<*, *>) return@run direct
                            val ds = item["daily_schedule"] as? Map<*, *>
                            val cs = ds?.get("class_schedule") as? Map<*, *>
                            cs?.get("class") as? Map<*, *>
                        }
                        if (classObj != null) {
                            classInfo = ClassInfo(
                                id = (classObj["id"] as? Double)?.toInt() ?: classObj["id"] as? Int,
                                name = classObj["name"] as? String,
                                grade = classObj["grade"] as? String
                            )
                        }

                        // --- Parse day ---
                        val day: String? = run {
                            val direct = item["day"] as? String
                            if (direct != null) return@run direct
                            val ds = item["daily_schedule"] as? Map<*, *>
                            ds?.get("day") as? String
                        }

                        val scheduleId = (item["id"] as? Double)?.toInt() ?: item["id"] as? Int

                        val schedule = Schedule(
                            id = scheduleId,
                            subjectName = subjectName,
                            startTime = item["start_time"] as? String ?: "00:00",
                            endTime = item["end_time"] as? String ?: "00:00",
                            day = day,
                            `class` = classInfo,
                            teacher = teacherInfo,
                            teacherName = teacherName,
                            room = roomInfo,
                            roomName = roomName,
                            subject = null,
                            timeSlot = null,
                            createdAt = item["created_at"] as? String
                        )
                        resultList.add(schedule)
                    } catch (e: Exception) {
                        Log.e(TAG, "Error parsing schedule item: ${e.message}", e)
                    }
                }

                Log.d(TAG, "Parsed ${resultList.size} schedules from today's endpoint")
                resultList
            }
    }

    /**
     * Get all schedule items for the current user's class (used by Pengurus).
     * Uses GET /me/class/schedules which returns paginated Schedule items for the student's class.
     * Results include a `day` field so the caller can filter by day of week.
     */
    suspend fun getClassSchedules(classId: Int): Result<List<Schedule>> {
        Log.d(TAG, "getClassSchedules: using /me/class/schedules (classId=$classId ignored for pengurus)")
        return ApiUtils.handleApiCall {
            // /me/class/schedules returns the schedules of the logged-in student's class
            apiService.getMyClassSchedules(date = null)
        }.map { response ->
            response.data ?: emptyList()
        }
    }

    // FIX: ApiService.getMyScheduleDetail() mengembalikan Response<TeacherScheduleDetailResponse>
    // langsung (tidak dibungkus ApiResponse), sehingga handleApiCall + .data tidak valid.
    // Gunakan handleApiCallFlat dan kembalikan TeacherScheduleDetailResponse secara langsung.
    suspend fun getMyScheduleDetail(scheduleId: Int): Result<TeacherScheduleDetailResponse> {
        Log.d(TAG, "getMyScheduleDetail: scheduleId=$scheduleId")
        return ApiUtils.handleApiCallFlat {
            apiService.getMyScheduleDetail(scheduleId)
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
            response.data ?: emptyList()
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

    // ============================================================
    // CLASS SCHEDULE HIERARKI — fungsi baru untuk fitur waka/admin
    // ClassSchedule (Induk) → DailySchedule (Anak) → ScheduleItem (Cucu)
    // ============================================================

    /**
     * Ambil daftar ClassSchedule (paginasi).
     * Endpoint: GET /schedules?class_id=&year=&semester=
     *
     * Backend mengembalikan PaginatedResponse<Schedule> (schedule item level),
     * tapi untuk kebutuhan halaman TotalClassScheduleActivity kita tetap gunakan
     * model Schedule yang sudah ada karena belum ada endpoint list khusus ClassSchedule.
     */
    suspend fun getClassScheduleList(
        classId: Int? = null,
        year: String? = null,
        semester: String? = null
    ): Result<List<Schedule>> {
        Log.d(TAG, "getClassScheduleList: classId=$classId year=$year semester=$semester")
        return ApiUtils.handleApiCall {
            apiService.getSchedules(classId = classId, year = year, semester = semester, page = 1)
        }.map { response ->
            response.data ?: emptyList()
        }
    }

    /**
     * Ambil jadwal aktif untuk kelas tertentu beserta seluruh DailySchedule dan ScheduleItem.
     * Endpoint: GET /classes/{class}/schedules/active
     * Role: admin (waka)
     *
     * Respons: ClassScheduleDetail (berisi dailySchedules → scheduleItems)
     */
    suspend fun getActiveClassSchedule(classId: Int): Result<ClassScheduleDetail> {
        Log.d(TAG, "getActiveClassSchedule: classId=$classId")
        return ApiUtils.handleApiCall {
            apiService.getActiveClassSchedule(classId)
        }.map { response ->
            response.data ?: throw Exception("Tidak ada jadwal aktif untuk kelas ini")
        }
    }

    /**
     * Buat atau replace seluruh jadwal kelas sekaligus (semua hari + jam pelajaran).
     * Endpoint: POST /classes/{class}/schedules/bulk
     * Role: admin (waka)
     *
     * Backend akan:
     * 1. updateOrCreate ClassSchedule (class_id + year + semester)
     * 2. Nonaktifkan jadwal lama jika is_active=true
     * 3. Hapus DailySchedule lama lalu buat ulang dari request
     */
    suspend fun bulkUpsertClassSchedule(
        classId: Int,
        request: ClassScheduleBulkRequest
    ): Result<ClassScheduleDetail> {
        Log.d(TAG, "bulkUpsertClassSchedule: classId=$classId year=${request.year} semester=${request.semester}")
        return ApiUtils.handleApiCall {
            apiService.bulkUpsertClassSchedule(classId, request)
        }.map { response ->
            response.data ?: throw Exception("Gagal menyimpan jadwal kelas")
        }
    }

    /**
     * Hapus satu ScheduleItem (jam pelajaran).
     * Endpoint: DELETE /schedules/{id}
     * Alias dari deleteSchedule() di atas, dengan nama lebih deskriptif untuk fitur hierarki.
     */
    suspend fun deleteScheduleItem(scheduleItemId: Int): Result<Unit> {
        Log.d(TAG, "deleteScheduleItem: id=$scheduleItemId")
        return deleteSchedule(scheduleItemId)
    }

    // ============================================================
    // HELPER — data pendukung untuk form dialog
    // ============================================================

    /**
     * Ambil semua kelas (untuk dropdown pilih kelas di form ClassSchedule).
     * Endpoint: GET /classes?per_page=100
     */
    suspend fun getAllClasses(search: String? = null): Result<List<Classes>> {
        Log.d(TAG, "getAllClasses: search=$search")
        return ApiUtils.handleApiCall {
            apiService.getClasses(search = search, perPage = 100)
        }.map { response ->
            response.data ?: emptyList()
        }
    }

    /**
     * Ambil semua guru (untuk dropdown pilih guru di form ScheduleItem).
     * Endpoint: GET /teachers?per_page=100
     */
    suspend fun getAllTeachers(search: String? = null): Result<List<TeacherResource>> {
        Log.d(TAG, "getAllTeachers: search=$search")
        return ApiUtils.handleApiCall {
            apiService.getTeachers(search = search, perPage = 100)
        }.map { response ->
            response.data ?: emptyList()
        }
    }

    /**
     * Ambil semua mata pelajaran (untuk dropdown pilih mapel di form ScheduleItem).
     * Endpoint: GET /subjects
     */
    suspend fun getAllSubjects(search: String? = null): Result<List<Subject>> {
        Log.d(TAG, "getAllSubjects: search=$search")
        return ApiUtils.handleApiCall {
            apiService.getSubjects(search = search)
        }.map { response ->
            response.data ?: emptyList()
        }
    }

    /**
     * Ambil daftar semester (untuk dropdown di form ClassSchedule).
     * Endpoint: GET /semesters
     */
    suspend fun getAllSemesters(): Result<List<Semester>> {
        Log.d(TAG, "getAllSemesters")
        return ApiUtils.handleApiCall {
            apiService.getSemesters()
        }.map { response ->
            response.data ?: emptyList()
        }
    }

    // ============================================================
    // ALIAS / SHORTCUT — digunakan oleh TotalClassScheduleActivity,
    // TotalDailyScheduleActivity, dan TotalScheduleItemActivity
    // ============================================================

    /**
     * Alias: ambil semua ClassSchedule (paginasi).
     * Dipanggil oleh TotalClassScheduleActivity.loadSchedules().
     * Delegasi ke getClassScheduleList() yang sudah ada.
     */
    suspend fun getAllClassSchedulesPaginated(
        classId: Int? = null,
        year: String? = null,
        semester: String? = null
    ): Result<List<Schedule>> {
        Log.d(TAG, "getAllClassSchedulesPaginated")
        return getClassScheduleList(classId, year, semester)
    }

    /**
     * Alias: ambil daftar kelas.
     * Dipanggil oleh TotalClassScheduleActivity.loadClassList().
     * Delegasi ke getAllClasses() yang sudah ada.
     */
    suspend fun getClasses(search: String? = null): Result<List<Classes>> {
        Log.d(TAG, "getClasses: search=$search")
        return getAllClasses(search)
    }

    /**
     * Buat jadwal kelas baru (ClassSchedule / ScheduleItem level).
     * Dipanggil oleh TotalClassScheduleActivity dan TotalScheduleItemActivity.
     * Delegasi ke createSchedule() yang sudah ada.
     */
    suspend fun createClassSchedule(request: StoreScheduleRequest): Result<Schedule> {
        Log.d(TAG, "createClassSchedule")
        return createSchedule(request)
    }

    /**
     * Update jadwal kelas (ClassSchedule / ScheduleItem level).
     * Dipanggil oleh TotalClassScheduleActivity dan TotalScheduleItemActivity.
     * Delegasi ke updateSchedule() yang sudah ada.
     */
    suspend fun updateClassSchedule(
        scheduleId: Int,
        request: UpdateScheduleRequest
    ): Result<Schedule> {
        Log.d(TAG, "updateClassSchedule: scheduleId=$scheduleId")
        return updateSchedule(scheduleId, request)
    }

    /**
     * Hapus jadwal kelas (ClassSchedule / DailySchedule / ScheduleItem level).
     * Dipanggil oleh TotalClassScheduleActivity, TotalDailyScheduleActivity,
     * dan TotalScheduleItemActivity.
     * Delegasi ke deleteSchedule() yang sudah ada.
     */
    suspend fun deleteClassSchedule(scheduleId: Int): Result<Unit> {
        Log.d(TAG, "deleteClassSchedule: scheduleId=$scheduleId")
        return deleteSchedule(scheduleId)
    }

    /**
     * Ambil detail satu Schedule (termasuk relasi subject, teacher, class).
     * Dipanggil oleh TotalDailyScheduleActivity.loadDailySchedules() dan
     * TotalScheduleItemActivity.loadScheduleItems().
     * Delegasi ke getSchedule() yang sudah ada.
     */
    suspend fun getClassScheduleDetail(scheduleId: Int): Result<Schedule> {
        Log.d(TAG, "getClassScheduleDetail: scheduleId=$scheduleId")
        return getSchedule(scheduleId)
    }

    /**
     * Alias: ambil semua guru.
     * Dipanggil oleh TotalScheduleItemActivity.loadSupportingData().
     * Delegasi ke getAllTeachers() yang sudah ada.
     */
    suspend fun getTeachers(search: String? = null): Result<List<TeacherResource>> {
        Log.d(TAG, "getTeachers: search=$search")
        return getAllTeachers(search)
    }

    /**
     * Alias: ambil semua mata pelajaran.
     * Dipanggil oleh TotalScheduleItemActivity.loadSupportingData().
     * Delegasi ke getAllSubjects() yang sudah ada.
     */
    suspend fun getSubjects(search: String? = null): Result<List<Subject>> {
        Log.d(TAG, "getSubjects: search=$search")
        return getAllSubjects(search)
    }
}