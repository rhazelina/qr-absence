package com.example.ritamesa.api.services

import com.example.ritamesa.api.models.*
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
    suspend fun scanAttendance(@Body request: ScanAttendanceRequest): Response<ApiResponse<AttendanceData>>

    @POST("attendance/scan-student")
    suspend fun scanStudentAttendance(@Body request: ScanAttendanceRequest): Response<ApiResponse<AttendanceData>>

    @POST("attendance/manual")
    suspend fun recordManualAttendance(@Body request: ManualAttendanceRequest): Response<ApiResponse<AttendanceData>>

    @POST("attendance/bulk-manual")
    suspend fun recordBulkManualAttendance(@Body request: BulkManualAttendanceRequest): Response<ApiResponse<List<AttendanceData>>>

    // ===== ATTENDANCE - RECORDS =====
    @GET("attendance/schedules/{schedule}")
    suspend fun getAttendanceBySchedule(
        @Path("schedule") scheduleId: Int
    ): Response<ApiResponse<List<AttendanceResource>>>

    @GET("students/absences")
    suspend fun getStudentAbsences(
        @Query("student_id") studentId: Int? = null,
        @Query("start_date") startDate: String? = null,
        @Query("end_date") endDate: String? = null
    ): Response<PaginatedResponse<AttendanceResource>>

    @GET("waka/attendance/teachers/daily")
    suspend fun getDailyTeacherAttendance(
        @Query("date") date: String? = null
    ): Response<PaginatedResponse<DailyAttendanceData>>

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
    ): Response<PaginatedResponse<AttendanceResource>>

    // ===== ATTENDANCE - SUMMARY & EXPORT =====
    @GET("attendance/summary")
    suspend fun getAttendanceSummary(
        @Query("start_date") startDate: String? = null,
        @Query("end_date") endDate: String? = null
    ): Response<ApiResponse<AttendanceSummary>>

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

    @GET("me/students/attendance-summary")
    suspend fun getStudentsAttendanceSummary(
        @Query("start_date") startDate: String? = null,
        @Query("end_date") endDate: String? = null
    ): Response<PaginatedResponse<Any>>

    @GET("classes/{class}/students/attendance-summary")
    suspend fun getClassStudentsAttendanceSummary(
        @Path("class") classId: Int,
        @Query("start_date") startDate: String? = null,
        @Query("end_date") endDate: String? = null
    ): Response<PaginatedResponse<Any>>

    @GET("attendance/export")
    suspend fun exportAttendance(
        @Query("class_id") classId: Int? = null,
        @Query("start_date") startDate: String? = null,
        @Query("end_date") endDate: String? = null,
        @Query("format") format: String? = "csv"
    ): Response<String>

    @GET("attendance/export-pdf")
    suspend fun exportAttendancePdf(
        @Query("start_date") startDate: String? = null,
        @Query("end_date") endDate: String? = null
    ): Response<String>

    @GET("attendance/recap")
    suspend fun getAttendanceRecap(
        @Query("class_id") classId: Int? = null
    ): Response<ApiResponse<Any>>

    // ===== ATTENDANCE - EXCUSE & DOCUMENT =====
    @POST("attendance/{attendance}/excuse")
    suspend fun markAttendanceExcuse(
        @Path("attendance") attendanceId: Int,
        @Body request: Map<String, String>
    ): Response<ApiResponse<AttendanceResource>>

    @PATCH("attendance/{attendance}")
    suspend fun updateAttendance(
        @Path("attendance") attendanceId: Int,
        @Body request: Map<String, String>
    ): Response<ApiResponse<AttendanceResource>>

    @POST("attendance/{attendance}/attachments")
    suspend fun addAttendanceAttachment(
        @Path("attendance") attendanceId: Int,
        @Body request: Map<String, String>
    ): Response<ApiResponse<AttendanceDocument>>

    @POST("attendance/{attendance}/document")
    suspend fun uploadAttendanceDocument(
        @Path("attendance") attendanceId: Int,
        @Body request: Map<String, String>
    ): Response<ApiResponse<AttendanceDocument>>

    @GET("attendance/{attendance}/document")
    suspend fun getAttendanceDocument(
        @Path("attendance") attendanceId: Int
    ): Response<ApiResponse<AttendanceDocument>>

    @POST("attendance/{attendance}/void")
    suspend fun voidAttendance(
        @Path("attendance") attendanceId: Int
    ): Response<ApiResponse<AttendanceResource>>

    // ===== CLOSE SCHEDULE (BULK ABSENT) =====
    @POST("me/schedules/{schedule}/close")
    suspend fun closeScheduleAttendance(
        @Path("schedule") scheduleId: Int
    ): Response<ApiResponse<Any>>

    // ===== TEACHERS =====
    @GET("teachers")
    suspend fun getTeachers(
        @Query("search") search: String? = null,
        @Query("page") page: Int? = null
    ): Response<PaginatedResponse<TeacherResource>>

    @POST("teachers")
    suspend fun createTeacher(@Body request: StoreTeacherRequest): Response<ApiResponse<TeacherResource>>

    @GET("teachers/{teacher}")
    suspend fun getTeacher(@Path("teacher") teacherId: Int): Response<ApiResponse<TeacherResource>>

    @PUT("teachers/{teacher}")
    suspend fun updateTeacher(
        @Path("teacher") teacherId: Int,
        @Body request: UpdateTeacherRequest
    ): Response<ApiResponse<TeacherResource>>

    @DELETE("teachers/{teacher}")
    suspend fun deleteTeacher(@Path("teacher") teacherId: Int): Response<ApiResponse<Any>>

    @POST("teachers/import")
    suspend fun importTeachers(@Body request: TeacherImportRequest): Response<ApiResponse<TeacherImportResponse>>

    @GET("teachers/{teacher}/attendance")
    suspend fun getTeacherAttendance(
        @Path("teacher") teacherId: Int,
        @Query("start_date") startDate: String? = null,
        @Query("end_date") endDate: String? = null
    ): Response<PaginatedResponse<AttendanceResource>>

    @GET("teachers/{teacher}/schedule-image")
    suspend fun getTeacherScheduleImage(@Path("teacher") teacherId: Int): Response<String>

    @POST("teachers/{teacher}/schedule-image")
    suspend fun uploadTeacherScheduleImage(
        @Path("teacher") teacherId: Int,
        @Body request: Map<String, String>
    ): Response<ApiResponse<Any>>

    @DELETE("teachers/{teacher}/schedule-image")
    suspend fun deleteTeacherScheduleImage(@Path("teacher") teacherId: Int): Response<ApiResponse<Any>>

    @GET("me/homeroom")
    suspend fun getMyHomeroom(): Response<ApiResponse<Classes>>

    @GET("me/homeroom/students")
    suspend fun getMyHomeroomStudents(): Response<PaginatedResponse<StudentResource>>

    @GET("me/homeroom/schedules")
    suspend fun getMyHomeroomSchedules(): Response<PaginatedResponse<Schedule>>

    @GET("me/homeroom/attendance")
    suspend fun getMyHomeroomAttendance(
        @Query("start_date") startDate: String? = null,
        @Query("end_date") endDate: String? = null
    ): Response<PaginatedResponse<AttendanceResource>>

    @GET("me/homeroom/attendance/summary")
    suspend fun getMyHomeroomAttendanceSummary(
        @Query("start_date") startDate: String? = null,
        @Query("end_date") endDate: String? = null
    ): Response<ApiResponse<AttendanceSummary>>

    // ===== STUDENTS =====
    @GET("students")
    suspend fun getStudents(
        @Query("search") search: String? = null,
        @Query("class_id") classId: Int? = null,
        @Query("page") page: Int? = null
    ): Response<PaginatedResponse<StudentResource>>

    @POST("students")
    suspend fun createStudent(@Body request: StoreStudentRequest): Response<ApiResponse<StudentResource>>

    @GET("students/{student}")
    suspend fun getStudent(@Path("student") studentId: Int): Response<ApiResponse<StudentResource>>

    @PUT("students/{student}")
    suspend fun updateStudent(
        @Path("student") studentId: Int,
        @Body request: UpdateStudentRequest
    ): Response<ApiResponse<StudentResource>>

    @DELETE("students/{student}")
    suspend fun deleteStudent(@Path("student") studentId: Int): Response<ApiResponse<Any>>

    @POST("students/import")
    suspend fun importStudents(@Body request: StudentImportRequest): Response<ApiResponse<StudentImportResponse>>

    @GET("students/{student}/attendance")
    suspend fun getStudentAttendanceHistory(
        @Path("student") studentId: Int,
        @Query("start_date") startDate: String? = null,
        @Query("end_date") endDate: String? = null
    ): Response<PaginatedResponse<AttendanceResource>>

    @GET("classes/{class}/students/absences")
    suspend fun getClassStudentsAbsences(
        @Path("class") classId: Int,
        @Query("start_date") startDate: String? = null,
        @Query("end_date") endDate: String? = null
    ): Response<PaginatedResponse<Any>>

    // ===== CLASSES =====
    @GET("classes")
    suspend fun getClasses(
        @Query("search") search: String? = null,
        @Query("page") page: Int? = null
    ): Response<PaginatedResponse<Classes>>

    @POST("classes")
    suspend fun createClass(@Body request: ClassPayload): Response<ApiResponse<Classes>>

    @GET("classes/{class}")
    suspend fun getClass(@Path("class") classId: Int): Response<ApiResponse<Classes>>

    @PUT("classes/{class}")
    suspend fun updateClass(
        @Path("class") classId: Int,
        @Body request: ClassPayload
    ): Response<ApiResponse<Classes>>

    @DELETE("classes/{class}")
    suspend fun deleteClass(@Path("class") classId: Int): Response<ApiResponse<Any>>

    @POST("classes/{class}/schedule-image")
    suspend fun uploadClassScheduleImage(
        @Path("class") classId: Int,
        @Body request: Map<String, String>
    ): Response<ApiResponse<Any>>

    @GET("classes/{class}/schedule-image")
    suspend fun getClassScheduleImage(@Path("class") classId: Int): Response<String>

    @DELETE("classes/{class}/schedule-image")
    suspend fun deleteClassScheduleImage(@Path("class") classId: Int): Response<ApiResponse<Any>>

    @GET("me/class")
    suspend fun getMyClass(): Response<ApiResponse<Classes>>

    @GET("me/class/schedules")
    suspend fun getMyClassSchedules(): Response<PaginatedResponse<Schedule>>

    @GET("me/class/attendance")
    suspend fun getMyClassAttendance(): Response<PaginatedResponse<AttendanceResource>>

    @GET("me/class/dashboard")
    suspend fun getMyClassDashboard(): Response<ApiResponse<ClassDashboard>>

    @GET("classes/{class}/students-on-leave")
    suspend fun getClassStudentsOnLeave(
        @Path("class") classId: Int
    ): Response<PaginatedResponse<StudentLeavePermission>>

    // ===== SCHEDULES =====
    @GET("schedules")
    suspend fun getSchedules(
        @Query("class_id") classId: Int? = null,
        @Query("page") page: Int? = null
    ): Response<PaginatedResponse<Schedule>>

    @POST("schedules")
    suspend fun createSchedule(@Body request: StoreScheduleRequest): Response<ApiResponse<Schedule>>

    @GET("schedules/{schedule}")
    suspend fun getSchedule(@Path("schedule") scheduleId: Int): Response<ApiResponse<Schedule>>

    @PUT("schedules/{schedule}")
    suspend fun updateSchedule(
        @Path("schedule") scheduleId: Int,
        @Body request: UpdateScheduleRequest
    ): Response<ApiResponse<Schedule>>

    @DELETE("schedules/{schedule}")
    suspend fun deleteSchedule(@Path("schedule") scheduleId: Int): Response<ApiResponse<Any>>

    @POST("classes/{class}/schedules/bulk")
    suspend fun bulkUpsertSchedules(
        @Path("class") classId: Int,
        @Body request: BulkScheduleRequest
    ): Response<ApiResponse<List<Schedule>>>

    @GET("teachers/{teacher}/schedules")
    suspend fun getTeacherSchedules(@Path("teacher") teacherId: Int): Response<PaginatedResponse<Schedule>>

    @GET("me/schedules")
    suspend fun getMySchedules(): Response<PaginatedResponse<Schedule>>

    @GET("attendance/schedules/{schedule}/summary")
    suspend fun getScheduleAttendanceSummary(
        @Path("schedule") scheduleId: Int
    ): Response<ApiResponse<AttendanceSummary>>

    @GET("classes/{class}/students/attendance-summary")
    suspend fun getClassStudentsSummary(
        @Path("class") classId: Int,
        @Query("start_date") startDate: String? = null,
        @Query("end_date") endDate: String? = null
    ): Response<PaginatedResponse<Any>>

    @GET("me/schedules/{schedule}/detail")
    suspend fun getMyScheduleDetail(@Path("schedule") scheduleId: Int): Response<ApiResponse<Any>>

    @GET("me/schedules/{schedule}/students")
    suspend fun getMyScheduleStudents(@Path("schedule") scheduleId: Int): Response<PaginatedResponse<StudentResource>>

    @POST("me/schedules/{schedule}/students/{student}/leave")
    suspend fun createStudentLeave(
        @Path("schedule") scheduleId: Int,
        @Path("student") studentId: Int,
        @Body request: Map<String, String>
    ): Response<ApiResponse<StudentLeavePermission>>

    @POST("me/schedules/{schedule}/students/{student}/leave-early")
    suspend fun createLeaveEarly(
        @Path("schedule") scheduleId: Int,
        @Path("student") studentId: Int,
        @Body request: Map<String, String>
    ): Response<ApiResponse<StudentLeavePermission>>

    @GET("classes/{class}/leave-permissions")
    suspend fun getClassLeavePermissions(
        @Path("class") classId: Int
    ): Response<PaginatedResponse<StudentLeavePermission>>

    // ===== LEAVE PERMISSIONS =====
    @GET("leave-permissions")
    suspend fun getLeavePermissions(
        @Query("student_id") studentId: Int? = null,
        @Query("status") status: String? = null,
        @Query("page") page: Int? = null
    ): Response<PaginatedResponse<StudentLeavePermission>>

    @POST("leave-permissions")
    suspend fun createLeavePermission(
        @Body request: CreateLeavePermissionRequest
    ): Response<ApiResponse<StudentLeavePermission>>

    @GET("leave-permissions/{permission}")
    suspend fun getLeavePermission(
        @Path("permission") permissionId: Int
    ): Response<ApiResponse<StudentLeavePermission>>

    @PATCH("leave-permissions/{permission}")
    suspend fun updateLeavePermission(
        @Path("permission") permissionId: Int,
        @Body request: UpdateLeavePermissionRequest
    ): Response<ApiResponse<StudentLeavePermission>>

    @POST("leave-permissions/{permission}/return")
    suspend fun markLeavePermissionReturn(
        @Path("permission") permissionId: Int
    ): Response<ApiResponse<StudentLeavePermission>>

    @POST("leave-permissions/{permission}/mark-absent")
    suspend fun markLeavePermissionAbsent(
        @Path("permission") permissionId: Int
    ): Response<ApiResponse<StudentLeavePermission>>

    @POST("leave-permissions/{permission}/cancel")
    suspend fun cancelLeavePermission(
        @Path("permission") permissionId: Int
    ): Response<ApiResponse<StudentLeavePermission>>

    @POST("leave-permissions/check-expired")
    suspend fun checkExpiredLeavePermissions(): Response<ApiResponse<Any>>

    @POST("me/leave-permissions/{leavePermission}/return")
    suspend fun markMyLeavePermissionReturn(
        @Path("leavePermission") leavePermissionId: Int
    ): Response<ApiResponse<StudentLeavePermission>>

    @POST("me/leave-permissions/{leavePermission}/mark-absent")
    suspend fun markMyLeavePermissionAbsent(
        @Path("leavePermission") leavePermissionId: Int
    ): Response<ApiResponse<StudentLeavePermission>>

    // ===== QR CODES =====
    @GET("qrcodes/active")
    suspend fun getActiveQRCode(): Response<ApiResponse<Qrcode>>

    @POST("qrcodes/generate")
    suspend fun generateQRCode(
        @Body request: GenerateQRCodeRequest
    ): Response<ApiResponse<GenerateQRCodeResponse>>

    @POST("me/class/qr-token")
    suspend fun generateMyClassQRToken(
        @Body request: GenerateQRCodeRequest
    ): Response<ApiResponse<GenerateQRCodeResponse>>

    @GET("qrcodes/{token}")
    suspend fun getQRCode(@Path("token") token: String): Response<ApiResponse<Qrcode>>

    @POST("qrcodes/{token}/revoke")
    suspend fun revokeQRCode(@Path("token") token: String): Response<ApiResponse<Any>>

    // ===== ABSENCE REQUESTS =====
    @GET("absence-requests")
    suspend fun getAbsenceRequests(
        @Query("status") status: String? = null,
        @Query("page") page: Int? = null
    ): Response<PaginatedResponse<AbsenceRequest>>

    @POST("absence-requests")
    suspend fun createAbsenceRequest(
        @Body request: StoreAbsenceRequest
    ): Response<ApiResponse<AbsenceRequest>>

    @POST("absence-requests/{absenceRequest}/approve")
    suspend fun approveAbsenceRequest(
        @Path("absenceRequest") absenceRequestId: Int,
        @Body request: ApproveAbsenceRequest
    ): Response<ApiResponse<AbsenceRequest>>

    @POST("absence-requests/{absenceRequest}/reject")
    suspend fun rejectAbsenceRequest(
        @Path("absenceRequest") absenceRequestId: Int,
        @Body request: RejectAbsenceRequest
    ): Response<ApiResponse<AbsenceRequest>>

    // ===== ROOMS =====
    @GET("rooms")
    suspend fun getRooms(): Response<PaginatedResponse<Room>>

    @POST("rooms")
    suspend fun createRoom(@Body request: CreateRoomRequest): Response<ApiResponse<Room>>

    @GET("rooms/{room}")
    suspend fun getRoom(@Path("room") roomId: Int): Response<ApiResponse<Room>>

    @PUT("rooms/{room}")
    suspend fun updateRoom(
        @Path("room") roomId: Int,
        @Body request: CreateRoomRequest
    ): Response<ApiResponse<Room>>

    @DELETE("rooms/{room}")
    suspend fun deleteRoom(@Path("room") roomId: Int): Response<ApiResponse<Any>>

    // ===== SUBJECTS =====
    @GET("subjects")
    suspend fun getSubjects(
        @Query("search") search: String? = null,
        @Query("page") page: Int? = null
    ): Response<PaginatedResponse<Subject>>

    @POST("subjects")
    suspend fun createSubject(@Body request: CreateSubjectRequest): Response<ApiResponse<Subject>>

    @GET("subjects/{subject}")
    suspend fun getSubject(@Path("subject") subjectId: Int): Response<ApiResponse<Subject>>

    @PUT("subjects/{subject}")
    suspend fun updateSubject(
        @Path("subject") subjectId: Int,
        @Body request: CreateSubjectRequest
    ): Response<ApiResponse<Subject>>

    @DELETE("subjects/{subject}")
    suspend fun deleteSubject(@Path("subject") subjectId: Int): Response<ApiResponse<Any>>

    // ===== TIME SLOTS =====
    @GET("time-slots")
    suspend fun getTimeSlots(): Response<PaginatedResponse<TimeSlot>>

    @POST("time-slots")
    suspend fun createTimeSlot(@Body request: CreateTimeSlotRequest): Response<ApiResponse<TimeSlot>>

    @GET("time-slots/{timeSlot}")
    suspend fun getTimeSlot(@Path("timeSlot") timeSlotId: Int): Response<ApiResponse<TimeSlot>>

    @PUT("time-slots/{timeSlot}")
    suspend fun updateTimeSlot(
        @Path("timeSlot") timeSlotId: Int,
        @Body request: CreateTimeSlotRequest
    ): Response<ApiResponse<TimeSlot>>

    @DELETE("time-slots/{timeSlot}")
    suspend fun deleteTimeSlot(@Path("timeSlot") timeSlotId: Int): Response<ApiResponse<Any>>

    // ===== MAJORS =====
    @GET("majors")
    suspend fun getMajors(
        @Query("search") search: String? = null,
        @Query("page") page: Int? = null
    ): Response<PaginatedResponse<Major>>

    @POST("majors")
    suspend fun createMajor(@Body request: CreateMajorRequest): Response<ApiResponse<Major>>

    @GET("majors/{major}")
    suspend fun getMajor(@Path("major") majorId: Int): Response<ApiResponse<Major>>

    @PUT("majors/{major}")
    suspend fun updateMajor(
        @Path("major") majorId: Int,
        @Body request: CreateMajorRequest
    ): Response<ApiResponse<Major>>

    @DELETE("majors/{major}")
    suspend fun deleteMajor(@Path("major") majorId: Int): Response<ApiResponse<Any>>

    // ===== SCHOOL YEARS =====
    @GET("school-years")
    suspend fun getSchoolYears(): Response<PaginatedResponse<SchoolYear>>

    @POST("school-years")
    suspend fun createSchoolYear(@Body request: SchoolYear): Response<ApiResponse<SchoolYear>>

    @GET("school-years/{schoolYear}")
    suspend fun getSchoolYear(@Path("schoolYear") schoolYearId: Int): Response<ApiResponse<SchoolYear>>

    @PUT("school-years/{schoolYear}")
    suspend fun updateSchoolYear(
        @Path("schoolYear") schoolYearId: Int,
        @Body request: SchoolYear
    ): Response<ApiResponse<SchoolYear>>

    @DELETE("school-years/{schoolYear}")
    suspend fun deleteSchoolYear(@Path("schoolYear") schoolYearId: Int): Response<ApiResponse<Any>>

    // ===== SEMESTERS =====
    @GET("semesters")
    suspend fun getSemesters(): Response<PaginatedResponse<Semester>>

    @POST("semesters")
    suspend fun createSemester(@Body request: Semester): Response<ApiResponse<Semester>>

    @GET("semesters/{semester}")
    suspend fun getSemester(@Path("semester") semesterId: Int): Response<ApiResponse<Semester>>

    @PUT("semesters/{semester}")
    suspend fun updateSemester(
        @Path("semester") semesterId: Int,
        @Body request: Semester
    ): Response<ApiResponse<Semester>>

    @DELETE("semesters/{semester}")
    suspend fun deleteSemester(@Path("semester") semesterId: Int): Response<ApiResponse<Any>>

    // ===== DEVICES =====
    @POST("devices")
    suspend fun registerDevice(@Body request: RegisterDeviceRequest): Response<ApiResponse<Device>>

    @POST("me/devices")
    suspend fun registerMyDevice(@Body request: RegisterDeviceRequest): Response<ApiResponse<Device>>

    @DELETE("me/devices/{device}")
    suspend fun deleteMyDevice(@Path("device") deviceId: Int): Response<ApiResponse<Any>>

    // ===== NOTIFICATIONS =====
    @GET("mobile/notifications")
    suspend fun getMobileNotifications(
        @Query("page") page: Int? = null
    ): Response<PaginatedResponse<MobileNotification>>

    @GET("me/notifications")
    suspend fun getMyNotifications(
        @Query("page") page: Int? = null
    ): Response<PaginatedResponse<MobileNotification>>

    // ===== DASHBOARD =====
    @GET("me/dashboard/summary")
    suspend fun getStudentDashboard(): Response<ApiResponse<StudentDashboard>>

    @GET("me/dashboard/teacher-summary")
    suspend fun getTeacherDashboard(): Response<ApiResponse<TeacherDashboard>>

    @GET("guru/dashboard")
    suspend fun getGuruDashboard(): Response<ApiResponse<TeacherDashboard>>

    @GET("me/homeroom/dashboard")
    suspend fun getHomeroomDashboard(): Response<ApiResponse<HomeroomDashboard>>

    @GET("waka/dashboard/summary")
    suspend fun getWakaDashboard(): Response<ApiResponse<WakaDashboard>>

    @GET("waka/attendance/summary")
    suspend fun getWakaAttendanceSummary(
        @Query("start_date") startDate: String? = null,
        @Query("end_date") endDate: String? = null
    ): Response<ApiResponse<AttendanceSummary>>

    @GET("admin/summary")
    suspend fun getAdminDashboard(): Response<ApiResponse<AdminDashboard>>

    @GET("me/students/follow-up")
    suspend fun getStudentsFollowUp(): Response<PaginatedResponse<StudentFollowUp>>

    @GET("me/statistics/monthly")
    suspend fun getMonthlyStatistics(): Response<ApiResponse<Map<String, Any>>>

    // ===== SETTINGS =====
    @GET("settings")
    suspend fun getSettings(): Response<ApiResponse<List<Setting>>>

    @POST("settings")
    suspend fun updateSettings(@Body request: Map<String, String>): Response<ApiResponse<Any>>

    @POST("settings/bulk")
    suspend fun bulkUpdateSettings(@Body request: Map<String, Map<String, String>>): Response<ApiResponse<Any>>

    @GET("settings/sync")
    suspend fun syncSettings(): Response<ApiResponse<SyncSettingsResponse>>

    // ===== ADMIN DATA SYNC =====
    @POST("admin/data/sync")
    suspend fun syncAdminData(): Response<ApiResponse<Any>>
}
