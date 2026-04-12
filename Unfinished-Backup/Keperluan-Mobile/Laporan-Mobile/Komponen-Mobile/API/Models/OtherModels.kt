package com.example.ritamesa.api.models

import com.google.gson.annotations.SerializedName

// ===================================================================
// OtherModels.kt
// ===================================================================

// ===== QR CODE =====
data class Qrcode(
    val id: Int?,
    val token: String?,
    val schedule: QRScheduleInfo?,
    val issuer: QRIssuerInfo?,
    @SerializedName("is_active")
    val isActive: Boolean?,
    @SerializedName("scan_count")
    val scanCount: Int?,
    @SerializedName("created_at")
    val createdAt: String?,
    @SerializedName("expires_at")
    val expiresAt: String?
) {
    /** Token aktif dari field yang tersedia */
    fun resolveToken(): String? = token

    /** Waktu kedaluwarsa dari field yang tersedia */
    fun resolveExpiresAt(): String? = expiresAt
}

data class QRScheduleInfo(
    val id: Int?,
    @SerializedName("class_name")
    val className: String?,
    @SerializedName("subject_name")
    val subjectName: String?,
    @SerializedName("start_time")
    val startTime: String?,
    @SerializedName("end_time")
    val endTime: String?
)

data class QRIssuerInfo(
    val id: Int?,
    val name: String?
)

data class GenerateQRCodeRequest(
    @SerializedName("schedule_id")
    val scheduleId: Int,
    val type: String? = "student",
    @SerializedName("expires_in_minutes")
    val expiresInMinutes: Int? = 5
)

/**
 * Root-level wrapper untuk respons POST /me/class/qr-token dan POST /qrcodes/generate.
 *
 * Struktur respons aktual dari backend:
 * {
 *   "qrcode":  { "token": "...", "expires_at": "...", ... },  ← objek QR utama
 *   "qr_svg":  "base64...",                                   ← SVG (opsional, diabaikan)
 *   "payload": { "token": "...", "expires_at": "...", ... },  ← duplikat token
 *   "mobile_format": "ABSENSI|...",
 *   "metadata": { "class_name": "...", ... }
 * }
 *
 * Catatan: backend TIDAK membungkus dalam {"data": {...}}, melainkan
 * mengembalikan field di root level. Oleh karena itu ApiService harus
 * mendeklarasikan return type sebagai ApiResponse<GenerateQRCodeResponse>
 * DAN GenerateQRCodeResponse ini memetakan root-level tersebut.
 */
data class GenerateQRCodeResponse(
    // Field "qrcode" berisi objek QR utama
    val qrcode: QrcodeDetail? = null,

    // Field "payload" adalah salinan ringkas token (fallback)
    val payload: QRPayloadInfo? = null,

    // Field "metadata" berisi info kelas & jadwal
    val metadata: QRMetadata? = null,

    @SerializedName("mobile_format")
    val mobileFormat: String? = null,

    @SerializedName("qr_svg")
    val qrSvg: String? = null,

    // Fallback: jika backend mengubah format dan mengirim token langsung di root
    val token: String? = null,

    @SerializedName("expires_at")
    val expiresAt: String? = null
) {
    /**
     * Ambil token dari field mana pun yang tersedia.
     * Prioritas: qrcode.token → payload.token → token (root)
     */
    fun resolveToken(): String? =
        qrcode?.token?.takeIf { it.isNotBlank() }
            ?: payload?.token?.takeIf { it.isNotBlank() }
            ?: token?.takeIf { it.isNotBlank() }

    /**
     * Ambil waktu kedaluwarsa dari field mana pun yang tersedia.
     */
    fun resolveExpiresAt(): String? =
        qrcode?.expiresAt?.takeIf { it.isNotBlank() }
            ?: payload?.expiresAt?.takeIf { it.isNotBlank() }
            ?: expiresAt?.takeIf { it.isNotBlank() }
}

/** Objek QR detail dari field "qrcode" */
data class QrcodeDetail(
    val id: Int? = null,
    val token: String? = null,
    val type: String? = null,

    @SerializedName("schedule_id")
    val scheduleId: Int? = null,

    @SerializedName("issued_by")
    val issuedBy: Int? = null,

    val status: String? = null,

    @SerializedName("is_active")
    val isActive: Boolean? = null,

    @SerializedName("expires_at")
    val expiresAt: String? = null,

    @SerializedName("created_at")
    val createdAt: String? = null,

    @SerializedName("updated_at")
    val updatedAt: String? = null,

    val schedule: QRScheduleDetail? = null
)

/** Jadwal lengkap di dalam objek qrcode */
data class QRScheduleDetail(
    val id: Int? = null,
    @SerializedName("subject_name")
    val subjectName: String? = null,
    @SerializedName("start_time")
    val startTime: String? = null,
    @SerializedName("end_time")
    val endTime: String? = null,
    val room: String? = null,
    val day: String? = null
)

/** Field "payload" — ringkasan token untuk mobile */
data class QRPayloadInfo(
    val token: String? = null,
    val type: String? = null,

    @SerializedName("schedule_id")
    val scheduleId: Int? = null,

    @SerializedName("expires_at")
    val expiresAt: String? = null
)

/** Field "metadata" — info display kelas & guru */
data class QRMetadata(
    @SerializedName("class_name")
    val className: String? = null,

    @SerializedName("subject_name")
    val subjectName: String? = null,

    @SerializedName("teacher_name")
    val teacherName: String? = null,

    @SerializedName("start_time")
    val startTime: String? = null,

    @SerializedName("end_time")
    val endTime: String? = null
)

// ===== DEVICE =====
data class Device(
    val id: Int?,
    @SerializedName("device_token")
    val deviceToken: String?,
    @SerializedName("device_name")
    val deviceName: String?,
    @SerializedName("device_type")
    val deviceType: String?,
    @SerializedName("device_id")
    val deviceId: String?,
    @SerializedName("created_at")
    val createdAt: String?
)

data class RegisterDeviceRequest(
    @SerializedName("device_token")
    val deviceToken: String,
    @SerializedName("device_name")
    val deviceName: String? = null,
    @SerializedName("device_type")
    val deviceType: String,
    @SerializedName("device_id")
    val deviceId: String? = null
)

// ===== ABSENCE REQUEST =====
data class AbsenceRequest(
    val id: Int?,
    val student: StudentInfo?,
    val type: String?,
    @SerializedName("start_date")
    val startDate: String?,
    @SerializedName("end_date")
    val endDate: String?,
    val reason: String?,
    val status: String?,
    @SerializedName("submitted_at")
    val submittedAt: String?,
    @SerializedName("approved_at")
    val approvedAt: String?,
    @SerializedName("approved_by")
    val approvedBy: String?
)

data class StoreAbsenceRequest(
    val type: String,
    @SerializedName("start_date")
    val startDate: String,
    @SerializedName("end_date")
    val endDate: String,
    val reason: String? = null,
    @SerializedName("student_id")
    val studentId: Int? = null
)

data class ApproveAbsenceRequest(
    val notes: String? = null
)

data class RejectAbsenceRequest(
    val reason: String
)

// ===== MAJOR =====
data class Major(
    val id: Int?,
    val code: String?,
    val name: String?,
    @SerializedName("program_keahlian")
    val programKeahlian: String?,
    @SerializedName("bidang_keahlian")
    val bidangKeahlian: String?
)

data class CreateMajorRequest(
    val code: String,
    val name: String,
    @SerializedName("program_keahlian")
    val programKeahlian: String,
    @SerializedName("bidang_keahlian")
    val bidangKeahlian: String
)

// ===== ROOM =====
data class Room(
    val id: Int?,
    val code: String?,
    val name: String?,
    val capacity: Int?,
    val location: String?
)

data class CreateRoomRequest(
    val code: String,
    val name: String,
    val capacity: Int? = null,
    val location: String? = null
)

// ===== SUBJECT =====
data class Subject(
    val id: Int?,
    val code: String?,
    val name: String?,
    @SerializedName("major_id")
    val majorId: Int?,
    @SerializedName("major_name")
    val majorName: String?
)

data class CreateSubjectRequest(
    val code: String,
    val name: String,
    @SerializedName("major_id")
    val majorId: Int? = null
)

// ===== TIME SLOT =====
data class TimeSlot(
    val id: Int?,
    @SerializedName("start_time")
    val startTime: String?,
    @SerializedName("end_time")
    val endTime: String?,
    val session: Int?
)

data class CreateTimeSlotRequest(
    @SerializedName("start_time")
    val startTime: String,
    @SerializedName("end_time")
    val endTime: String,
    val session: Int? = null
)

// ===== SCHOOL YEAR =====
data class SchoolYear(
    val id: Int?,
    val year: String?,
    @SerializedName("is_active")
    val isActive: Boolean = false,
    @SerializedName("start_date")
    val startDate: String?,
    @SerializedName("end_date")
    val endDate: String?
)

// ===== SEMESTER =====
data class Semester(
    val id: Int?,
    val name: String?,
    @SerializedName("school_year_id")
    val schoolYearId: Int?,
    @SerializedName("school_year")
    val schoolYear: String?,
    @SerializedName("is_active")
    val isActive: Boolean = false,
    @SerializedName("start_date")
    val startDate: String?,
    @SerializedName("end_date")
    val endDate: String?
)

// ===== DASHBOARD MODELS =====

data class StudentDashboard(
    @SerializedName("today_attendance")
    val todayAttendance: AttendanceSummary?,
    @SerializedName("today_schedules")
    val todaySchedules: List<TodayScheduleItem>?,
    val notice: String?
)

data class TodayScheduleItem(
    val id: Int?,
    @SerializedName(value = "subject_name", alternate = ["mapel_name"])
    val subjectName: String?,
    @SerializedName("subject")
    val subject: String? = null,
    @SerializedName(value = "start_time", alternate = ["time_start"])
    val startTime: String?,
    @SerializedName(value = "end_time", alternate = ["time_end"])
    val endTime: String?,
    val room: String?,
    val teacher: TeacherInfo?,
    @SerializedName("attendance_status")
    val attendanceStatus: String?,
    @SerializedName("is_checked_in")
    val isCheckedIn: Boolean?
) {
    fun resolvedSubjectName(): String? = subjectName ?: subject
}

data class TeacherDashboard(
    @SerializedName(value = "today_statistics", alternate = ["statistics", "stats", "summary"])
    val todayStatistics: TeacherStatistics?,
    @SerializedName(value = "schedule_today", alternate = ["today_schedules", "schedules", "items"])
    val todaySchedules: List<TeachingScheduleItem>?,
    @SerializedName("attendance_summary")
    val attendanceSummary: Map<String, Int>? = null,
    @SerializedName("school_attendance_summary_today")
    val schoolAttendanceSummaryToday: SchoolAttendanceSummaryToday? = null
)

data class SchoolAttendanceSummaryToday(
    val present: Int? = 0,
    val excused: Int? = 0,
    val sick: Int? = 0,
    val absent: Int? = 0
)

data class TeacherStatistics(
    @SerializedName(value = "total_students_present", alternate = ["present", "hadir", "present_count"])
    val totalStudentsPresent: Int?,
    @SerializedName(value = "total_students_absent", alternate = ["absent", "alpha", "alpa", "absent_count"])
    val totalStudentsAbsent: Int?,
    @SerializedName(value = "total_students_late", alternate = ["late", "telat", "late_count"])
    val totalStudentsLate: Int?,
    @SerializedName(value = "total_students_excused", alternate = ["excused", "izin", "permit", "izin_count"])
    val totalStudentsExcused: Int? = null,
    @SerializedName(value = "total_students_sick", alternate = ["sick", "sakit", "sakit_count"])
    val totalStudentsSick: Int? = null,
    @SerializedName(value = "total_classes_today", alternate = ["total_classes", "classes_count", "classes"])
    val totalClassesToday: Int?
)

data class TeachingScheduleItem(
    val id: Int?,
    @SerializedName("class_id")
    val classId: Int? = null,
    @SerializedName("class")
    val `class`: String?,
    @SerializedName(value = "subject_name", alternate = ["mapel_name"])
    val subjectName: String?,
    @SerializedName("subject")
    val subject: String? = null,
    @SerializedName(value = "start_time", alternate = ["time_start"])
    val startTime: String?,
    @SerializedName(value = "end_time", alternate = ["time_end"])
    val endTime: String?,
    val room: String?,
    @SerializedName("attendance_count")
    val attendanceCount: Int?,
    @SerializedName("class_name")
    val className: String? = null,
    @SerializedName(value = "student_count", alternate = ["students_count", "total_students"])
    val studentCount: Int? = null,
    @SerializedName(value = "time_slot", alternate = ["session_name", "jam_ke"])
    val timeSlot: String? = null,
    @SerializedName("time_slot_id")
    val timeSlotId: Int? = null
) {
    fun resolvedSubjectName(): String? = subjectName ?: subject
}

data class AdminDashboard(
    @SerializedName("total_students")
    val totalStudents: Int? = null,
    @SerializedName("total_teachers")
    val totalTeachers: Int? = null,
    @SerializedName("total_classes")
    val totalClasses: Int? = null,
    @SerializedName("majors_count")
    val majorsCount: Int? = null,
    @SerializedName("today_attendance_rate")
    val todayAttendanceRate: Float? = null,
    @SerializedName("recent_activities")
    val recentActivities: List<Any>? = null
)

data class AdminDashboardWrapper(
    val data: AdminDashboard? = null,
    @SerializedName("students_count")
    val studentsCount: Int? = null,
    @SerializedName("teachers_count")
    val teachersCount: Int? = null,
    @SerializedName("classes_count")
    val classesCount: Int? = null,
    @SerializedName("majors_count")
    val majorsCount: Int? = null,
    @SerializedName("rooms_count")
    val roomsCount: Int? = null,
    @SerializedName("attendance_today")
    val attendanceToday: Map<String, Int>? = null,
    @SerializedName("total_students")
    val totalStudents: Int? = null,
    @SerializedName("total_teachers")
    val totalTeachers: Int? = null,
    @SerializedName("total_classes")
    val totalClasses: Int? = null,
    val message: String? = null,
    val status: Boolean? = null,
    val success: Boolean? = null
) {
    fun toAdminDashboard(): AdminDashboard? {
        if (data != null) return data
        val students = studentsCount ?: totalStudents
        val teachers = teachersCount ?: totalTeachers
        val classes  = classesCount  ?: totalClasses
        if (students != null || teachers != null || classes != null) {
            return AdminDashboard(
                totalStudents       = students,
                totalTeachers       = teachers,
                totalClasses        = classes,
                majorsCount         = majorsCount,
                todayAttendanceRate = null
            )
        }
        return null
    }
}

data class HomeroomDashboard(
    @SerializedName("class")
    val `class`: ClassInfo?,
    @SerializedName("today_summary")
    val todaySummary: AttendanceSummary?,
    @SerializedName("weekly_summary")
    val weeklySummary: AttendanceSummary?,
    @SerializedName("students_absent_today")
    val studentsAbsentToday: List<StudentInfo>?
)

data class WakaDashboard(
    @SerializedName("overall_attendance")
    val overallAttendance: OverallAttendance?,
    @SerializedName("top_absent_students")
    val topAbsentStudents: List<TopAbsentStudent>?,
    @SerializedName("class_status")
    val classStatus: List<ClassStatus>?,
    val alerts: List<String>?
)

data class OverallAttendance(
    @SerializedName("present_percentage")
    val presentPercentage: Int?,
    @SerializedName("absent_percentage")
    val absentPercentage: Int?,
    @SerializedName("late_percentage")
    val latePercentage: Int?
)

data class TopAbsentStudent(
    val id: Int?,
    val name: String?,
    @SerializedName("absence_count")
    val absenceCount: Int?
)

data class ClassStatus(
    @SerializedName("class_id")
    val classId: Int?,
    @SerializedName("class_name")
    val className: String?,
    val present: Int?,
    val absent: Int?
)

data class ClassDashboard(
    @SerializedName("class")
    val `class`: ClassInfo?,
    @SerializedName("today_summary")
    val todaySummary: AttendanceSummary?,
    val today: String?
)

// ===== MISC =====

data class StudentFollowUpRequest(
    @SerializedName("student_id")
    val studentId: Int,
    val note: String,
    val action: String? = null
)

data class StudentFollowUpAttendanceSummary(
    val absent: Int? = 0,
    val excused: Int? = 0,
    val sick: Int? = 0
)

data class StudentFollowUpBadge(
    val type: String? = null,
    val label: String? = null
)

data class StudentFollowUp(
    val id: Int? = null,
    @SerializedName("student_id")
    val studentId: Int?,
    @SerializedName("student_name")
    val studentName: String?,
    // From TeacherController.getStudentsFollowUp
    val name: String? = null,
    val nis: String? = null,
    val nisn: String? = null,
    @SerializedName("class_name")
    val className: String? = null,
    @SerializedName("major_name")
    val majorName: String? = null,
    @SerializedName("attendance_summary")
    val attendanceSummary: StudentFollowUpAttendanceSummary? = null,
    val badge: StudentFollowUpBadge? = null,
    @SerializedName("severity_score")
    val severityScore: Int? = 0,
    // From StudentFollowUpController.index (legacy)
    @SerializedName("absence_count")
    val absenceCount: Int? = null,
    @SerializedName("latest_absence")
    val latestAbsence: String? = null,
    val note: String? = null
) {
    /** Resolved absent count — compatible with both endpoints */
    fun resolvedAbsent(): Int = attendanceSummary?.absent ?: absenceCount ?: 0
    fun resolvedExcused(): Int = attendanceSummary?.excused ?: 0
    fun resolvedSick(): Int = attendanceSummary?.sick ?: 0
    fun resolvedName(): String = studentName ?: name ?: "-"
}

data class ClassAttendanceSummary(
    @SerializedName("class_id")
    val classId: Int?,
    @SerializedName("class_name")
    val className: String?,
    val present: Int?,
    val absent: Int?,
    val late: Int?,
    val excused: Int?,
    @SerializedName("attendance_rate")
    val attendanceRate: Float?
)

// ===== NOTIFICATION =====
data class MobileNotification(
    val id: Int?,
    val title: String?,
    val message: String?,
    val type: String?,
    @SerializedName("read_at")
    val readAt: String?,
    @SerializedName("created_at")
    val createdAt: String?
)

// ===== SETTINGS =====
data class Setting(
    val key: String?,
    val value: String?,
    val type: String?
)

data class SyncSettingsResponse(
    @SerializedName("school_name")
    val schoolName: String?,
    @SerializedName("school_phone")
    val schoolPhone: String?,
    @SerializedName("school_email")
    val schoolEmail: String?,
    @SerializedName("school_address")
    val schoolAddress: String?,
    val year: String?
)






//package com.example.ritamesa.api.models
//
//import com.google.gson.JsonDeserializationContext
//import com.google.gson.JsonDeserializer
//import com.google.gson.JsonElement
//import com.google.gson.annotations.JsonAdapter
//import com.google.gson.annotations.SerializedName
//import java.lang.reflect.Type
//
//// ===================================================================
//// OtherModels.kt
//// ===================================================================
//
//// ===== SUBJECT FLEX PARSER =====
//data class SubjectRef(
//    val id: Int? = null,
//    val name: String? = null,
//    val code: String? = null
//) {
//    fun displayName(): String? = name ?: code
//}
//
//class SubjectRefDeserializer : JsonDeserializer<SubjectRef?> {
//    override fun deserialize(
//        json: JsonElement?,
//        typeOfT: Type?,
//        context: JsonDeserializationContext?
//    ): SubjectRef? {
//        return when {
//            json == null || json.isJsonNull -> null
//            json.isJsonPrimitive -> SubjectRef(name = json.asString)
//            json.isJsonObject -> {
//                val obj = json.asJsonObject
//                SubjectRef(
//                    id = obj.get("id")?.takeIf { !it.isJsonNull }?.asInt,
//                    name = obj.get("name")?.takeIf { !it.isJsonNull }?.asString,
//                    code = obj.get("code")?.takeIf { !it.isJsonNull }?.asString
//                )
//            }
//            else -> null
//        }
//    }
//}
//
//// ===== QR CODE =====
//data class Qrcode(
//    val id: Int?,
//    val token: String?,
//    val schedule: QRScheduleInfo?,
//    val issuer: QRIssuerInfo?,
//    @SerializedName("is_active")
//    val isActive: Boolean?,
//    @SerializedName("scan_count")
//    val scanCount: Int?,
//    @SerializedName("created_at")
//    val createdAt: String?,
//    @SerializedName("expires_at")
//    val expiresAt: String?
//) {
//    fun resolveToken(): String? = token
//    fun resolveExpiresAt(): String? = expiresAt
//}
//
//data class QRScheduleInfo(
//    val id: Int?,
//    @SerializedName("class_name")
//    val className: String?,
//    @SerializedName("subject_name")
//    val subjectName: String?,
//    @SerializedName("start_time")
//    val startTime: String?,
//    @SerializedName("end_time")
//    val endTime: String?
//)
//
//data class QRIssuerInfo(
//    val id: Int?,
//    val name: String?
//)
//
//data class GenerateQRCodeRequest(
//    @SerializedName("schedule_id")
//    val scheduleId: Int,
//    val type: String? = "student",
//    @SerializedName("expires_in_minutes")
//    val expiresInMinutes: Int? = 5
//)
//
//data class GenerateQRCodeResponse(
//    val qrcode: QrcodeDetail? = null,
//    val payload: QRPayloadInfo? = null,
//    val metadata: QRMetadata? = null,
//    @SerializedName("mobile_format")
//    val mobileFormat: String? = null,
//    @SerializedName("qr_svg")
//    val qrSvg: String? = null,
//    val token: String? = null,
//    @SerializedName("expires_at")
//    val expiresAt: String? = null
//) {
//    fun resolveToken(): String? =
//        qrcode?.token?.takeIf { it.isNotBlank() }
//            ?: payload?.token?.takeIf { it.isNotBlank() }
//            ?: token?.takeIf { it.isNotBlank() }
//
//    fun resolveExpiresAt(): String? =
//        qrcode?.expiresAt?.takeIf { it.isNotBlank() }
//            ?: payload?.expiresAt?.takeIf { it.isNotBlank() }
//            ?: expiresAt?.takeIf { it.isNotBlank() }
//}
//
//data class QrcodeDetail(
//    val id: Int? = null,
//    val token: String? = null,
//    val type: String? = null,
//    @SerializedName("schedule_id")
//    val scheduleId: Int? = null,
//    @SerializedName("issued_by")
//    val issuedBy: Int? = null,
//    val status: String? = null,
//    @SerializedName("is_active")
//    val isActive: Boolean? = null,
//    @SerializedName("expires_at")
//    val expiresAt: String? = null,
//    @SerializedName("created_at")
//    val createdAt: String? = null,
//    @SerializedName("updated_at")
//    val updatedAt: String? = null,
//    val schedule: QRScheduleDetail? = null
//)
//
//data class QRScheduleDetail(
//    val id: Int? = null,
//    @SerializedName("subject_name")
//    val subjectName: String? = null,
//    @SerializedName("start_time")
//    val startTime: String? = null,
//    @SerializedName("end_time")
//    val endTime: String? = null,
//    val room: String? = null,
//    val day: String? = null
//)
//
//data class QRPayloadInfo(
//    val token: String? = null,
//    val type: String? = null,
//    @SerializedName("schedule_id")
//    val scheduleId: Int? = null,
//    @SerializedName("expires_at")
//    val expiresAt: String? = null
//)
//
//data class QRMetadata(
//    @SerializedName("class_name")
//    val className: String? = null,
//    @SerializedName("subject_name")
//    val subjectName: String? = null,
//    @SerializedName("teacher_name")
//    val teacherName: String? = null,
//    @SerializedName("start_time")
//    val startTime: String? = null,
//    @SerializedName("end_time")
//    val endTime: String? = null
//)
//
//// ===== DEVICE =====
//data class Device(
//    val id: Int?,
//    @SerializedName("device_token")
//    val deviceToken: String?,
//    @SerializedName("device_name")
//    val deviceName: String?,
//    @SerializedName("device_type")
//    val deviceType: String?,
//    @SerializedName("device_id")
//    val deviceId: String?,
//    @SerializedName("created_at")
//    val createdAt: String?
//)
//
//data class RegisterDeviceRequest(
//    @SerializedName("device_token")
//    val deviceToken: String,
//    @SerializedName("device_name")
//    val deviceName: String? = null,
//    @SerializedName("device_type")
//    val deviceType: String,
//    @SerializedName("device_id")
//    val deviceId: String? = null
//)
//
//// ===== ABSENCE REQUEST =====
//data class AbsenceRequest(
//    val id: Int?,
//    val student: StudentInfo?,
//    val type: String?,
//    @SerializedName("start_date")
//    val startDate: String?,
//    @SerializedName("end_date")
//    val endDate: String?,
//    val reason: String?,
//    val status: String?,
//    @SerializedName("submitted_at")
//    val submittedAt: String?,
//    @SerializedName("approved_at")
//    val approvedAt: String?,
//    @SerializedName("approved_by")
//    val approvedBy: String?
//)
//
//data class StoreAbsenceRequest(
//    val type: String,
//    @SerializedName("start_date")
//    val startDate: String,
//    @SerializedName("end_date")
//    val endDate: String,
//    val reason: String? = null,
//    @SerializedName("student_id")
//    val studentId: Int? = null
//)
//
//data class ApproveAbsenceRequest(
//    val notes: String? = null
//)
//
//data class RejectAbsenceRequest(
//    val reason: String
//)
//
//// ===== MAJOR =====
//data class Major(
//    val id: Int?,
//    val code: String?,
//    val name: String?,
//    @SerializedName("program_keahlian")
//    val programKeahlian: String?,
//    @SerializedName("bidang_keahlian")
//    val bidangKeahlian: String?
//)
//
//data class CreateMajorRequest(
//    val code: String,
//    val name: String,
//    @SerializedName("program_keahlian")
//    val programKeahlian: String,
//    @SerializedName("bidang_keahlian")
//    val bidangKeahlian: String
//)
//
//// ===== ROOM =====
//data class Room(
//    val id: Int?,
//    val code: String?,
//    val name: String?,
//    val capacity: Int?,
//    val location: String?
//)
//
//data class CreateRoomRequest(
//    val code: String,
//    val name: String,
//    val capacity: Int? = null,
//    val location: String? = null
//)
//
//// ===== SUBJECT =====
//data class Subject(
//    val id: Int?,
//    val code: String?,
//    val name: String?,
//    @SerializedName("major_id")
//    val majorId: Int?,
//    @SerializedName("major_name")
//    val majorName: String?
//)
//
//data class CreateSubjectRequest(
//    val code: String,
//    val name: String,
//    @SerializedName("major_id")
//    val majorId: Int? = null
//)
//
//// ===== TIME SLOT =====
//data class TimeSlot(
//    val id: Int?,
//    @SerializedName("start_time")
//    val startTime: String?,
//    @SerializedName("end_time")
//    val endTime: String?,
//    val session: Int?
//)
//
//data class CreateTimeSlotRequest(
//    @SerializedName("start_time")
//    val startTime: String,
//    @SerializedName("end_time")
//    val endTime: String,
//    val session: Int? = null
//)
//
//// ===== SCHOOL YEAR =====
//data class SchoolYear(
//    val id: Int?,
//    val year: String?,
//    @SerializedName("is_active")
//    val isActive: Boolean = false,
//    @SerializedName("start_date")
//    val startDate: String?,
//    @SerializedName("end_date")
//    val endDate: String?
//)
//
//// ===== SEMESTER =====
//data class Semester(
//    val id: Int?,
//    val name: String?,
//    @SerializedName("school_year_id")
//    val schoolYearId: Int?,
//    @SerializedName("school_year")
//    val schoolYear: String?,
//    @SerializedName("is_active")
//    val isActive: Boolean = false,
//    @SerializedName("start_date")
//    val startDate: String?,
//    @SerializedName("end_date")
//    val endDate: String?
//)
//
//// ===== DASHBOARD MODELS =====
//data class StudentDashboard(
//    @SerializedName("today_attendance")
//    val todayAttendance: AttendanceSummary?,
//    @SerializedName("today_schedules")
//    val todaySchedules: List<TodayScheduleItem>?,
//    val notice: String?
//)
//
//data class TodayScheduleItem(
//    val id: Int?,
//    @SerializedName(value = "subject_name", alternate = ["mapel_name"])
//    val subjectName: String?,
//    @JsonAdapter(SubjectRefDeserializer::class)
//    @SerializedName("subject")
//    val subject: SubjectRef? = null,
//    @SerializedName(value = "start_time", alternate = ["time_start"])
//    val startTime: String?,
//    @SerializedName(value = "end_time", alternate = ["time_end"])
//    val endTime: String?,
//    val room: String?,
//    val teacher: TeacherInfo?,
//    @SerializedName("attendance_status")
//    val attendanceStatus: String?,
//    @SerializedName("is_checked_in")
//    val isCheckedIn: Boolean?
//) {
//    fun resolvedSubjectName(): String? = subjectName ?: subject?.displayName()
//}
//
//data class TeacherDashboard(
//    @SerializedName(value = "today_statistics", alternate = ["statistics", "stats", "summary"])
//    val todayStatistics: TeacherStatistics?,
//    @SerializedName(value = "schedule_today", alternate = ["today_schedules", "schedules", "items"])
//    val todaySchedules: List<TeachingScheduleItem>?,
//    @SerializedName("attendance_summary")
//    val attendanceSummary: Map<String, Int>? = null
//)
//
//data class TeacherStatistics(
//    @SerializedName(value = "total_students_present", alternate = ["present", "hadir", "present_count"])
//    val totalStudentsPresent: Int?,
//    @SerializedName(value = "total_students_absent", alternate = ["absent", "alpha", "alpa", "absent_count"])
//    val totalStudentsAbsent: Int?,
//    @SerializedName(value = "total_students_late", alternate = ["late", "telat", "late_count"])
//    val totalStudentsLate: Int?,
//    @SerializedName(value = "total_students_excused", alternate = ["excused", "izin", "permit", "izin_count"])
//    val totalStudentsExcused: Int? = null,
//    @SerializedName(value = "total_students_sick", alternate = ["sick", "sakit", "sakit_count"])
//    val totalStudentsSick: Int? = null,
//    @SerializedName(value = "total_classes_today", alternate = ["total_classes", "classes_count", "classes"])
//    val totalClassesToday: Int?
//)
//
//data class TeachingScheduleItem(
//    val id: Int?,
//    @SerializedName("class_id")
//    val classId: Int? = null,
//    @SerializedName("class")
//    val `class`: String?,
//    @SerializedName(value = "subject_name", alternate = ["mapel_name"])
//    val subjectName: String?,
//    @SerializedName("subject")
//    val subject: String? = null,
//    @SerializedName(value = "start_time", alternate = ["time_start"])
//    val startTime: String?,
//    @SerializedName(value = "end_time", alternate = ["time_end"])
//    val endTime: String?,
//    val room: String?,
//    @SerializedName("attendance_count")
//    val attendanceCount: Int?,
//    @SerializedName("class_name")
//    val className: String? = null,
//    @SerializedName(value = "student_count", alternate = ["students_count", "total_students"])
//    val studentCount: Int? = null,
//    @SerializedName(value = "time_slot", alternate = ["session_name", "jam_ke"])
//    val timeSlot: String? = null,
//    @SerializedName("time_slot_id")
//    val timeSlotId: Int? = null
//) {
//    fun resolvedSubjectName(): String? = subjectName ?: subject
//}
//
//
//
//data class AdminDashboard(
//    @SerializedName("total_students")
//    val totalStudents: Int? = null,
//    @SerializedName("total_teachers")
//    val totalTeachers: Int? = null,
//    @SerializedName("total_classes")
//    val totalClasses: Int? = null,
//    @SerializedName("majors_count")
//    val majorsCount: Int? = null,
//    @SerializedName("today_attendance_rate")
//    val todayAttendanceRate: Float? = null,
//    @SerializedName("recent_activities")
//    val recentActivities: List<Any>? = null
//)
//
//data class AdminDashboardWrapper(
//    val data: AdminDashboard? = null,
//    @SerializedName("students_count")
//    val studentsCount: Int? = null,
//    @SerializedName("teachers_count")
//    val teachersCount: Int? = null,
//    @SerializedName("classes_count")
//    val classesCount: Int? = null,
//    @SerializedName("majors_count")
//    val majorsCount: Int? = null,
//    @SerializedName("rooms_count")
//    val roomsCount: Int? = null,
//    @SerializedName("attendance_today")
//    val attendanceToday: Map<String, Int>? = null,
//    @SerializedName("total_students")
//    val totalStudents: Int? = null,
//    @SerializedName("total_teachers")
//    val totalTeachers: Int? = null,
//    @SerializedName("total_classes")
//    val totalClasses: Int? = null,
//    val message: String? = null,
//    val status: Boolean? = null,
//    val success: Boolean? = null
//) {
//    fun toAdminDashboard(): AdminDashboard? {
//        if (data != null) return data
//        val students = studentsCount ?: totalStudents
//        val teachers = teachersCount ?: totalTeachers
//        val classes = classesCount ?: totalClasses
//        if (students != null || teachers != null || classes != null) {
//            return AdminDashboard(
//                totalStudents = students,
//                totalTeachers = teachers,
//                totalClasses = classes,
//                majorsCount = majorsCount,
//                todayAttendanceRate = null
//            )
//        }
//        return null
//    }
//}
//
//data class HomeroomDashboard(
//    @SerializedName("class")
//    val `class`: ClassInfo?,
//    @SerializedName("today_summary")
//    val todaySummary: AttendanceSummary?,
//    @SerializedName("weekly_summary")
//    val weeklySummary: AttendanceSummary?,
//    @SerializedName("students_absent_today")
//    val studentsAbsentToday: List<StudentInfo>?
//)
//
//data class WakaDashboard(
//    @SerializedName("overall_attendance")
//    val overallAttendance: OverallAttendance?,
//    @SerializedName("top_absent_students")
//    val topAbsentStudents: List<TopAbsentStudent>?,
//    @SerializedName("class_status")
//    val classStatus: List<ClassStatus>?,
//    val alerts: List<String>?
//)
//
//data class OverallAttendance(
//    @SerializedName("present_percentage")
//    val presentPercentage: Int?,
//    @SerializedName("absent_percentage")
//    val absentPercentage: Int?,
//    @SerializedName("late_percentage")
//    val latePercentage: Int?
//)
//
//data class TopAbsentStudent(
//    val id: Int?,
//    val name: String?,
//    @SerializedName("absence_count")
//    val absenceCount: Int?
//)
//
//data class ClassStatus(
//    @SerializedName("class_id")
//    val classId: Int?,
//    @SerializedName("class_name")
//    val className: String?,
//    val present: Int?,
//    val absent: Int?
//)
//
//data class ClassDashboard(
//    @SerializedName("class")
//    val `class`: ClassInfo?,
//    @SerializedName("today_summary")
//    val todaySummary: AttendanceSummary?,
//    val today: String?
//)
//
//// ===== MISC =====
//data class StudentFollowUpRequest(
//    @SerializedName("student_id")
//    val studentId: Int,
//    val note: String,
//    val action: String? = null
//)
//
//data class StudentFollowUpAttendanceSummary(
//    val absent: Int? = 0,
//    val excused: Int? = 0,
//    val sick: Int? = 0
//)
//
//data class StudentFollowUpBadge(
//    val type: String? = null,
//    val label: String? = null
//)
//
//data class StudentFollowUp(
//    val id: Int? = null,
//    @SerializedName("student_id")
//    val studentId: Int?,
//    @SerializedName("student_name")
//    val studentName: String?,
//    val name: String? = null,
//    val nis: String? = null,
//    val nisn: String? = null,
//    @SerializedName("class_name")
//    val className: String? = null,
//    @SerializedName("major_name")
//    val majorName: String? = null,
//    @SerializedName("attendance_summary")
//    val attendanceSummary: StudentFollowUpAttendanceSummary? = null,
//    val badge: StudentFollowUpBadge? = null,
//    @SerializedName("severity_score")
//    val severityScore: Int? = 0,
//    @SerializedName("absence_count")
//    val absenceCount: Int? = null,
//    @SerializedName("latest_absence")
//    val latestAbsence: String? = null,
//    val note: String? = null
//) {
//    fun resolvedAbsent(): Int = attendanceSummary?.absent ?: absenceCount ?: 0
//    fun resolvedExcused(): Int = attendanceSummary?.excused ?: 0
//    fun resolvedSick(): Int = attendanceSummary?.sick ?: 0
//    fun resolvedName(): String = studentName ?: name ?: "-"
//}
//
//data class ClassAttendanceSummary(
//    @SerializedName("class_id")
//    val classId: Int?,
//    @SerializedName("class_name")
//    val className: String?,
//    val present: Int?,
//    val absent: Int?,
//    val late: Int?,
//    val excused: Int?,
//    @SerializedName("attendance_rate")
//    val attendanceRate: Float?
//)
//
//// ===== NOTIFICATION =====
//data class MobileNotification(
//    val id: Int?,
//    val title: String?,
//    val message: String?,
//    val type: String?,
//    @SerializedName("read_at")
//    val readAt: String?,
//    @SerializedName("created_at")
//    val createdAt: String?
//)
//
//// ===== SETTINGS =====
//data class Setting(
//    val key: String?,
//    val value: String?,
//    val type: String?
//)
//
//data class SyncSettingsResponse(
//    @SerializedName("school_name")
//    val schoolName: String?,
//    @SerializedName("school_phone")
//    val schoolPhone: String?,
//    @SerializedName("school_email")
//    val schoolEmail: String?,
//    @SerializedName("school_address")
//    val schoolAddress: String?,
//    val year: String?
//)
