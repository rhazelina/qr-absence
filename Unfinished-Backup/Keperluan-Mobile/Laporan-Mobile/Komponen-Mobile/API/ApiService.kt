package com.example.ritamesa.api.services

import com.example.ritamesa.api.models.*
import okhttp3.MultipartBody
import okhttp3.RequestBody
import okhttp3.ResponseBody
import retrofit2.Response
import retrofit2.http.*

interface ApiService {

    // ===== AUTHENTICATION =====
    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<LoginResponse>

    @GET("me")
    suspend fun getMe(): Response<ApiResponse<MeResponse>>

    @POST("auth/logout")
    suspend fun logout(): Response<ApiResponse<Any>>

    // ===== ATTENDANCE - SCAN =====
    @POST("attendance/scan")
    suspend fun scanAttendance(@Body request: ScanAttendanceRequest): Response<AttendanceScanResponse>

    @POST("attendance/scan-student")
    suspend fun scanStudentAttendance(@Body request: ScanAttendanceRequest): Response<AttendanceScanResponse>

    @POST("attendance/manual")
    suspend fun recordManualAttendance(@Body request: ManualAttendanceRequest): Response<AttendanceScanResponse>

    @POST("attendance/bulk-manual")
    suspend fun recordBulkManualAttendance(@Body request: BulkManualAttendanceRequest): Response<BulkManualAttendanceResponse>

    @POST("attendance/manual/finalize")
    suspend fun finalizeManualAttendance(@Body request: FinalizeManualAttendanceRequest): Response<FinalizeManualAttendanceResponse>

    // ===== ATTENDANCE - HISTORY & SUMMARY =====
    @GET("attendance/schedules/{schedule}")
    suspend fun getAttendanceBySchedule(
        @Path("schedule") scheduleId: Int,
        @Query("date") date: String? = null,
        @Query("per_page") perPage: Int? = null
    ): Response<ApiResponse<List<AttendanceResource>>>

    @GET("students/absences")
    suspend fun getStudentAbsences(
        @Query("student_id") studentId: Int? = null,
        @Query("start_date") startDate: String? = null,
        @Query("end_date") endDate: String? = null
    ): Response<PaginatedResponse<StudentAbsenceResponseItem>>

    @GET("waka/attendance/teachers/daily")
    suspend fun getDailyTeacherAttendance(@Query("date") date: String? = null): Response<DailyTeacherAttendanceResponse>

    @GET("me/attendance")
    suspend fun getMyAttendance(
        @Query("start_date") startDate: String? = null,
        @Query("end_date") endDate: String? = null
    ): Response<PaginatedResponse<AttendanceResource>>

    @GET("me/attendance/teaching")
    suspend fun getMyTeachingAttendance(
        @Query("start_date") startDate: String? = null,
        @Query("end_date") endDate: String? = null
    ): Response<PaginatedResponse<AttendanceResource>>

    @GET("classes/{class}/attendance")
    suspend fun getClassAttendanceByDate(
        @Path("class") classId: Int,
        @Query("date") date: String
    ): Response<ClassAttendanceResponse>

    @GET("attendance/summary")
    suspend fun getAttendanceSummaryRaw(
        @Query("start_date") startDate: String? = null,
        @Query("end_date") endDate: String? = null
    ): Response<Map<String, Int>>

    @GET("me/attendance/summary")
    suspend fun getMyAttendanceSummary(
        @Query("start_date") startDate: String? = null,
        @Query("end_date") endDate: String? = null
    ): Response<ApiResponse<AttendanceSummary>>

    @GET("me/attendance/teaching/summary")
    suspend fun getMyTeachingAttendanceSummary(
        @Query("start_date") startDate: String? = null,
        @Query("end_date") endDate: String? = null
    ): Response<ApiResponse<AttendanceSummary>>

    @GET("classes/{class}/students/attendance-summary")
    suspend fun getClassStudentsAttendanceSummary(
        @Path("class") classId: Int,
        @Query("start_date") startDate: String? = null,
        @Query("end_date") endDate: String? = null
    ): Response<PaginatedResponse<Any>>

    @GET("classes/{class}/students/absences")
    suspend fun getClassStudentsAbsences(
        @Path("class") classId: Int,
        @Query("start_date") startDate: String? = null,
        @Query("end_date") endDate: String? = null
    ): Response<PaginatedResponse<Any>>

    @GET("attendance/schedules/{schedule}/summary")
    suspend fun getScheduleAttendanceSummary(@Path("schedule") scheduleId: Int): Response<ApiResponse<AttendanceSummary>>

    // ===== EXPORT =====
    @GET("attendance/export")
    suspend fun exportAttendance(
        @Query("class_id") classId: Int? = null,
        @Query("start_date") startDate: String? = null,
        @Query("end_date") endDate: String? = null,
        @Query("format") format: String = "csv"
    ): Response<String>

    @GET("attendance/export-pdf")
    suspend fun exportAttendancePdf(
        @Query("start_date") startDate: String? = null,
        @Query("end_date") endDate: String? = null
    ): Response<String>

    @GET("attendance/recap")
    suspend fun getAttendanceRecap(@Query("class_id") classId: Int? = null): Response<ApiResponse<Any>>

    // ===== ATTACHMENTS & EXCUSES =====
    @POST("attendance/{attendance}/attachments")
    suspend fun addAttendanceAttachment(@Path("attendance") attendanceId: Int, @Body data: Map<String, String>): Response<ApiResponse<AttendanceDocument>>

    @Multipart
    @POST("attendance/{attendance}/attachments")
    suspend fun addAttendanceAttachmentFile(@Path("attendance") attendanceId: Int, @Part file: MultipartBody.Part): Response<ApiResponse<AttendanceDocument>>

    @POST("attendance/{attendance}/document")
    suspend fun uploadAttendanceDocument(@Path("attendance") attendanceId: Int, @Body data: Map<String, String>): Response<ApiResponse<AttendanceDocument>>

    @GET("attendance/{attendance}/document")
    suspend fun getAttendanceDocument(@Path("attendance") attendanceId: Int): Response<ApiResponse<AttendanceDocument>>

    @POST("attendance/{attendance}/excuse")
    suspend fun markAttendanceExcuse(@Path("attendance") attendanceId: Int, @Body data: Map<String, String>): Response<AttendanceResource>

    @Multipart
    @PATCH("attendance/{attendance}/update-excuse")
    suspend fun updateAttendanceExcuse(
        @Path("attendance") attendanceId: Int,
        @PartMap data: Map<String, @JvmSuppressWildcards RequestBody>,
        @Part attachment: MultipartBody.Part? = null
    ): Response<UpdateAttendanceExcuseResponse>

    @PATCH("attendance/{attendance}")
    suspend fun updateAttendance(@Path("attendance") attendanceId: Int, @Body data: Map<String, String>): Response<ApiResponse<AttendanceResource>>

    @DELETE("attendance/{attendance}")
    suspend fun voidAttendance(@Path("attendance") attendanceId: Int): Response<ApiResponse<AttendanceResource>>

    @POST("schedules/{schedule}/close")
    suspend fun closeScheduleAttendance(@Path("schedule") scheduleId: Int): Response<ApiResponse<Any>>

    // ===== DASHBOARD =====
    @GET("me/dashboard/summary")
    suspend fun getStudentDashboardRaw(): Response<Map<String, Any>>

    @GET("me/dashboard/teacher-summary")
    suspend fun getTeacherDashboard(): Response<TeacherDashboard>

    @GET("guru/dashboard")
    suspend fun getGuruDashboard(): Response<TeacherDashboard>

    @GET("me/homeroom/dashboard")
    suspend fun getHomeroomDashboard(): Response<HomeroomDashboard>

    @GET("waka/dashboard/summary")
    suspend fun getWakaDashboard(): Response<ApiResponse<WakaDashboard>>

    @GET("waka/attendance/summary")
    suspend fun getWakaAttendanceSummaryRaw(
        @Query("start_date") startDate: String? = null,
        @Query("end_date") endDate: String? = null
    ): Response<WakaAttendanceSummaryResponse>

    @GET("admin/summary")
    suspend fun getAdminDashboard(): Response<AdminDashboardWrapper>

    @GET("me/class/dashboard")
    suspend fun getMyClassDashboard(): Response<ApiResponse<ClassDashboard>>

    @GET("me/students/follow-up")
    suspend fun getStudentsFollowUp(): Response<ApiResponse<List<StudentFollowUp>>>

    @POST("me/students/follow-up")
    suspend fun createFollowUp(@Body request: StudentFollowUpRequest): Response<ApiResponse<StudentFollowUp>>

    @GET("me/statistics/monthly")
    suspend fun getMonthlyStatistics(): Response<ApiResponse<Map<String, Any>>>

    // ===== MAJOR =====
    @GET("majors")
    suspend fun getMajors(@Query("search") search: String? = null, @Query("page") page: Int? = null): Response<PaginatedResponse<Major>>

    @POST("majors")
    suspend fun createMajorFlat(@Body request: CreateMajorRequest): Response<Major>

    @GET("majors/{major}")
    suspend fun getMajor(@Path("major") majorId: Int): Response<ApiResponse<Major>>

    @PATCH("majors/{major}")
    suspend fun updateMajorFlat(@Path("major") majorId: Int, @Body request: CreateMajorRequest): Response<Major>

    @DELETE("majors/{major}")
    suspend fun deleteMajor(@Path("major") majorId: Int): Response<ApiResponse<Any>>

    // ===== ROOM =====
    @GET("rooms")
    suspend fun getRooms(): Response<ApiResponse<List<Room>>>

    @POST("rooms")
    suspend fun createRoomFlat(@Body request: CreateRoomRequest): Response<Room>

    @GET("rooms/{room}")
    suspend fun getRoom(@Path("room") roomId: Int): Response<ApiResponse<Room>>

    @PATCH("rooms/{room}")
    suspend fun updateRoomFlat(@Path("room") roomId: Int, @Body request: CreateRoomRequest): Response<Room>

    @DELETE("rooms/{room}")
    suspend fun deleteRoom(@Path("room") roomId: Int): Response<ApiResponse<Any>>

    // ===== SUBJECT =====
    @GET("subjects")
    suspend fun getSubjects(@Query("search") search: String? = null, @Query("page") page: Int? = null): Response<PaginatedResponse<Subject>>

    @POST("subjects")
    suspend fun createSubjectFlat(@Body request: CreateSubjectRequest): Response<Subject>

    @GET("subjects/{subject}")
    suspend fun getSubject(@Path("subject") subjectId: Int): Response<ApiResponse<Subject>>

    @PATCH("subjects/{subject}")
    suspend fun updateSubjectFlat(@Path("subject") subjectId: Int, @Body request: CreateSubjectRequest): Response<Subject>

    @DELETE("subjects/{subject}")
    suspend fun deleteSubject(@Path("subject") subjectId: Int): Response<ApiResponse<Any>>

    // ===== TIME SLOT =====
    @GET("time-slots")
    suspend fun getTimeSlots(): Response<ApiResponse<List<TimeSlot>>>

    @POST("time-slots")
    suspend fun createTimeSlotFlat(@Body request: CreateTimeSlotRequest): Response<TimeSlot>

    @GET("time-slots/{time_slot}")
    suspend fun getTimeSlot(@Path("time_slot") timeSlotId: Int): Response<ApiResponse<TimeSlot>>

    @PATCH("time-slots/{time_slot}")
    suspend fun updateTimeSlotFlat(@Path("time_slot") timeSlotId: Int, @Body request: CreateTimeSlotRequest): Response<TimeSlot>

    @DELETE("time-slots/{time_slot}")
    suspend fun deleteTimeSlot(@Path("time_slot") timeSlotId: Int): Response<ApiResponse<Any>>

    // ===== SCHOOL YEAR =====
    @GET("school-years")
    suspend fun getSchoolYears(): Response<ApiResponse<List<SchoolYear>>>

    @POST("school-years")
    suspend fun createSchoolYearFlat(@Body request: SchoolYear): Response<SchoolYear>

    @GET("school-years/{school_year}")
    suspend fun getSchoolYear(@Path("school_year") schoolYearId: Int): Response<ApiResponse<SchoolYear>>

    @PATCH("school-years/{school_year}")
    suspend fun updateSchoolYearFlat(@Path("school_year") schoolYearId: Int, @Body request: SchoolYear): Response<SchoolYear>

    @DELETE("school-years/{school_year}")
    suspend fun deleteSchoolYear(@Path("school_year") schoolYearId: Int): Response<ApiResponse<Any>>

    // ===== SEMESTER =====
    @GET("semesters")
    suspend fun getSemesters(): Response<ApiResponse<List<Semester>>>

    @POST("semesters")
    suspend fun createSemesterFlat(@Body request: Semester): Response<Semester>

    @GET("semesters/{semester}")
    suspend fun getSemester(@Path("semester") semesterId: Int): Response<ApiResponse<Semester>>

    @PATCH("semesters/{semester}")
    suspend fun updateSemesterFlat(@Path("semester") semesterId: Int, @Body request: Semester): Response<Semester>

    @DELETE("semesters/{semester}")
    suspend fun deleteSemester(@Path("semester") semesterId: Int): Response<ApiResponse<Any>>

    // ===== DEVICE =====
    @POST("devices/register")
    suspend fun registerDevice(@Body request: RegisterDeviceRequest): Response<ApiResponse<Device>>

    @POST("devices/register-my")
    suspend fun registerMyDevice(@Body request: RegisterDeviceRequest): Response<ApiResponse<Device>>

    @DELETE("devices/{device}")
    suspend fun deleteMyDevice(@Path("device") deviceId: Int): Response<ApiResponse<Any>>

    // ===== NOTIFICATIONS =====
    @GET("notifications")
    suspend fun getMobileNotifications(@Query("page") page: Int? = null): Response<PaginatedResponse<MobileNotification>>

    @GET("me/notifications")
    suspend fun getMyNotifications(@Query("page") page: Int? = null): Response<PaginatedResponse<MobileNotification>>

    // ===== CLASSES =====
    @GET("classes")
    suspend fun getClasses(
        @Query("search") search: String? = null,
        @Query("grade") grade: String? = null,
        @Query("major") major: String? = null,
        @Query("available") available: Boolean? = null,
        @Query("page") page: Int? = null,
        @Query("per_page") perPage: Int? = null
    ): Response<PaginatedResponse<Classes>>

    @POST("classes")
    suspend fun createClassFlat(@Body request: CreateKelasRequest): Response<Classes>

    @GET("classes/{class}")
    suspend fun getClass(@Path("class") classId: Int): Response<ApiResponse<Classes>>

    @PATCH("classes/{class}")
    suspend fun updateClassFlat(@Path("class") classId: Int, @Body request: UpdateKelasRequest): Response<Classes>

    @DELETE("classes/{class}")
    suspend fun deleteClass(@Path("class") classId: Int): Response<ApiResponse<Any>>

    @GET("me/class")
    suspend fun getMyClass(): Response<ApiResponse<Classes>>

    @GET("me/class/schedules")
    suspend fun getMyClassSchedules(@Query("date") date: String? = null): Response<PaginatedResponse<Schedule>>

    @GET("me/class/attendance")
    suspend fun getMyClassAttendance(
        @Query("start_date") startDate: String? = null,
        @Query("end_date") endDate: String? = null
    ): Response<TeacherAttendanceHistoryResponse>

    @POST("classes/{class}/schedule-image")
    suspend fun uploadClassScheduleImage(@Path("class") classId: Int, @Body data: Map<String, String>): Response<ApiResponse<Any>>

    @Multipart
    @POST("classes/{class}/schedule-image")
    suspend fun uploadClassScheduleImageMultipart(@Path("class") classId: Int, @Part image: MultipartBody.Part): Response<ApiResponse<Any>>

    @GET("classes/{class}/schedule-image")
    suspend fun getClassScheduleImage(@Path("class") classId: Int): Response<ResponseBody>

    @DELETE("classes/{class}/schedule-image")
    suspend fun deleteClassScheduleImage(@Path("class") classId: Int): Response<ApiResponse<Any>>

    @GET("classes/{class}/students-on-leave")
    suspend fun getClassStudentsOnLeave(@Path("class") classId: Int): Response<ApiResponse<List<StudentLeavePermission>>>

    @GET("classes/{class}/leave-permissions")
    suspend fun getClassLeavePermissions(@Path("class") classId: Int): Response<ApiResponse<List<StudentLeavePermission>>>

    // ===== SCHEDULE =====
    @GET("schedules")
    suspend fun getSchedules(
        @Query("class_id") classId: Int? = null,
        @Query("year") year: String? = null,
        @Query("semester") semester: String? = null
    ): Response<ApiResponse<List<Schedule>>>

    @GET("schedules/{schedule}")
    suspend fun getSchedule(@Path("schedule") scheduleId: Int): Response<ApiResponse<Schedule>>

    @POST("schedules")
    suspend fun createSchedule(@Body request: StoreScheduleRequest): Response<ApiResponse<Schedule>>

    @PATCH("schedules/{schedule}")
    suspend fun updateSchedule(@Path("schedule") scheduleId: Int, @Body request: UpdateScheduleRequest): Response<ApiResponse<Schedule>>

    @DELETE("schedules/{schedule}")
    suspend fun deleteSchedule(@Path("schedule") scheduleId: Int): Response<ApiResponse<Any>>

    @GET("teachers/{teacher}/schedules")
    suspend fun getTeacherSchedules(@Path("teacher") teacherId: Int): Response<ApiResponse<List<Schedule>>>

    @GET("me/schedules")
    suspend fun getMySchedules(@Query("date") date: String? = null): Response<PaginatedResponse<Schedule>>

    @GET("me/schedules/today")
    suspend fun getTodaysSchedule(): Response<PaginatedResponse<Schedule>>

    @GET("me/schedules/{schedule}/detail")
    suspend fun getMyScheduleDetail(@Path("schedule") scheduleId: Int): Response<TeacherScheduleDetailResponse>

    @GET("me/schedules/{schedule}/students")
    suspend fun getMyScheduleStudents(@Path("schedule") scheduleId: Int): Response<ApiResponse<List<StudentResource>>>

    @POST("classes/{class}/schedules/bulk")
    suspend fun bulkUpsertSchedules(@Path("class") classId: Int, @Body request: BulkScheduleRequest): Response<ApiResponse<List<Schedule>>>

    // ===== STUDENT =====
    @GET("students")
    suspend fun getStudents(
        @Query("search") search: String? = null,
        @Query("class_id") classId: Int? = null,
        @Query("page") page: Int? = null,
        @Query("per_page") perPage: Int? = null
    ): Response<PaginatedResponse<StudentResource>>

    @POST("students")
    suspend fun createStudentFlat(@Body request: StoreStudentRequest): Response<StudentResource>

    @GET("students/{student}")
    suspend fun getStudent(@Path("student") studentId: Int): Response<ApiResponse<StudentResource>>

    @PATCH("students/{student}")
    suspend fun updateStudentFlat(@Path("student") studentId: Int, @Body request: UpdateStudentRequest): Response<StudentResource>

    @DELETE("students/{student}")
    suspend fun deleteStudent(@Path("student") studentId: Int): Response<ApiResponse<Any>>

    @POST("students/import")
    suspend fun importStudents(@Body request: StudentImportRequest): Response<ApiResponse<StudentImportResponse>>

    @GET("students/{student}/attendance")
    suspend fun getStudentAttendanceHistory(
        @Path("student") studentId: Int,
        @Query("start_date") startDate: String? = null,
        @Query("end_date") endDate: String? = null
    ): Response<TeacherAttendanceHistoryResponse>

    @GET("students/attendance-summary")
    suspend fun getStudentsAttendanceSummary(
        @Query("start_date") startDate: String? = null,
        @Query("end_date") endDate: String? = null
    ): Response<ApiResponse<List<Any>>>

    // ===== TEACHER =====
    @GET("teachers")
    suspend fun getTeachers(
        @Query("search") search: String? = null,
        @Query("page") page: Int? = null,
        @Query("per_page") perPage: Int? = null
    ): Response<PaginatedResponse<TeacherResource>>

    @POST("teachers")
    suspend fun createTeacherFlat(@Body request: StoreTeacherRequest): Response<TeacherResource>

    @GET("teachers/{teacher}")
    suspend fun getTeacher(@Path("teacher") teacherId: Int): Response<ApiResponse<TeacherResource>>

    @PATCH("teachers/{teacher}")
    suspend fun updateTeacherFlat(@Path("teacher") teacherId: Int, @Body request: UpdateTeacherRequest): Response<TeacherResource>

    @DELETE("teachers/{teacher}")
    suspend fun deleteTeacher(@Path("teacher") teacherId: Int): Response<ApiResponse<Any>>

    @POST("teachers/import")
    suspend fun importTeachers(@Body request: TeacherImportRequest): Response<ApiResponse<TeacherImportResponse>>

    @GET("teachers/{teacher}/attendance")
    suspend fun getTeacherAttendance(
        @Path("teacher") teacherId: Int,
        @Query("start_date") startDate: String? = null,
        @Query("end_date") endDate: String? = null
    ): Response<ApiResponse<List<AttendanceResource>>>

    @GET("teachers/{teacher}/attendance-history")
    suspend fun getTeacherAttendanceHistory(
        @Path("teacher") teacherId: Int,
        @Query("from") from: String? = null,
        @Query("to") to: String? = null
    ): Response<TeacherAttendanceHistoryResponse>

    @GET("teachers/{teacher}/schedule-image")
    suspend fun getTeacherScheduleImage(@Path("teacher") teacherId: Int): Response<String>

    @POST("teachers/{teacher}/schedule-image")
    suspend fun uploadTeacherScheduleImage(@Path("teacher") teacherId: Int, @Body data: Map<String, String>): Response<ApiResponse<Any>>

    @DELETE("teachers/{teacher}/schedule-image")
    suspend fun deleteTeacherScheduleImage(@Path("teacher") teacherId: Int): Response<ApiResponse<Any>>

    @GET("me/homeroom")
    suspend fun getMyHomeroom(): Response<ApiResponse<Classes>>

    @GET("me/homeroom/students")
    suspend fun getMyHomeroomStudents(): Response<List<StudentResource>>

    @GET("me/homeroom/schedules")
    suspend fun getMyHomeroomSchedules(): Response<HomeroomSchedulesResponse>

    @GET("me/homeroom/attendance")
    suspend fun getMyHomeroomAttendance(
        @Query("start_date") startDate: String? = null,
        @Query("end_date") endDate: String? = null
    ): Response<PaginatedResponse<AttendanceResource>>

    @GET("me/homeroom/attendance-summary")
    suspend fun getMyHomeroomAttendanceSummary(
        @Query("start_date") startDate: String? = null,
        @Query("end_date") endDate: String? = null
    ): Response<ApiResponse<AttendanceSummary>>

    // ===== LEAVE PERMISSION =====
    @POST("schedules/{schedule}/students/{student}/leave")
    suspend fun createStudentLeave(
        @Path("schedule") scheduleId: Int,
        @Path("student") studentId: Int,
        @Body data: Map<String, String>
    ): Response<ApiResponse<StudentLeavePermission>>

    @POST("schedules/{schedule}/students/{student}/leave-early")
    suspend fun createLeaveEarly(
        @Path("schedule") scheduleId: Int,
        @Path("student") studentId: Int,
        @Body data: Map<String, String>
    ): Response<ApiResponse<StudentLeavePermission>>

    // ===== LEAVE PERMISSION MANAGEMENT =====
    @GET("leave-permissions")
    suspend fun getLeavePermissions(
        @Query("student_id") studentId: Int? = null,
        @Query("status") status: String? = null,
        @Query("page") page: Int? = null
    ): Response<PaginatedResponse<StudentLeavePermission>>

    @GET("leave-permissions/{permission}")
    suspend fun getLeavePermission(
        @Path("permission") permissionId: Int
    ): Response<StudentLeavePermission>

    @POST("leave-permissions")
    suspend fun createLeavePermission(
        @Body request: CreateLeavePermissionRequest
    ): Response<LeavePermissionMutationResponse>

    @PATCH("leave-permissions/{permission}")
    suspend fun updateLeavePermission(
        @Path("permission") permissionId: Int,
        @Body request: UpdateLeavePermissionRequest
    ): Response<LeavePermissionMutationResponse>

    @POST("leave-permissions/{permission}/return")
    suspend fun markLeavePermissionReturn(
        @Path("permission") permissionId: Int
    ): Response<LeavePermissionMutationResponse>

    @POST("leave-permissions/{permission}/mark-absent")
    suspend fun markLeavePermissionAbsent(
        @Path("permission") permissionId: Int
    ): Response<LeavePermissionMutationResponse>

    @POST("leave-permissions/{permission}/cancel")
    suspend fun cancelLeavePermission(
        @Path("permission") permissionId: Int
    ): Response<LeavePermissionMutationResponse>

    // ===== ABSENCE REQUEST =====
    @GET("absence-requests")
    suspend fun getAbsenceRequests(
        @Query("status") status: String? = null,
        @Query("page") page: Int? = null
    ): Response<PaginatedResponse<AbsenceRequest>>

    @POST("absence-requests")
    suspend fun createAbsenceRequest(
        @Body request: StoreAbsenceRequest
    ): Response<AbsenceRequestMutationResponse>

    @POST("absence-requests/{absenceRequest}/approve")
    suspend fun approveAbsenceRequest(
        @Path("absenceRequest") absenceRequestId: Int,
        @Body request: ApproveAbsenceRequest
    ): Response<AbsenceRequestMutationResponse>

    @POST("absence-requests/{absenceRequest}/reject")
    suspend fun rejectAbsenceRequest(
        @Path("absenceRequest") absenceRequestId: Int,
        @Body request: RejectAbsenceRequest
    ): Response<AbsenceRequestMutationResponse>

    // ===== SETTINGS =====
    @GET("settings")
    suspend fun getSettings(): Response<SettingsIndexResponse>

    @POST("settings")
    suspend fun updateSettings(
        @Body request: Map<String, String>
    ): Response<SettingsMutationResponse>

    @POST("settings/bulk")
    suspend fun bulkUpdateSettings(
        @Body request: Map<String, Map<String, String>>
    ): Response<SettingsMutationResponse>

    @GET("settings/sync")
    suspend fun syncSettings(): Response<SyncSettingsEnvelope>

    @POST("admin/data/sync")
    suspend fun syncAdminData(
        @Body request: Map<String, Any> = emptyMap()
    ): Response<Map<String, Any>>

    // ===== QR CODE =====
    @GET("qrcodes/active")
    suspend fun getActiveQRCode(): Response<PaginatedResponse<Qrcode>>

    @GET("qrcodes/{token}")
    suspend fun getQRCode(
        @Path("token") token: String
    ): Response<Qrcode>

    @POST("qrcodes/{token}/revoke")
    suspend fun revokeQRCode(
        @Path("token") token: String
    ): Response<Map<String, String>>
}
