package com.example.ritamesa.api.models

import com.google.gson.annotations.SerializedName

// ===== QR CODE MODELS =====
data class Qrcode(
    val id: Int?,
    val token: String?,
    @SerializedName("schedule")
    val schedule: QRScheduleInfo?,
    @SerializedName("issuer")
    val issuer: QRIssuerInfo?,
    @SerializedName("is_active")
    val isActive: Boolean?,
    @SerializedName("scan_count")
    val scanCount: Int?,
    @SerializedName("created_at")
    val createdAt: String?,
    @SerializedName("expires_at")
    val expiresAt: String?
)

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
    val type: String? = "student",  // student|teacher
    @SerializedName("expires_in_minutes")
    val expiresInMinutes: Int? = 5
)

data class GenerateQRCodeResponse(
    val id: Int?,
    val token: String?,
    @SerializedName("qr_code_url")
    val qrCodeUrl: String?,
    val schedule: QRScheduleInfo?,
    @SerializedName("is_active")
    val isActive: Boolean?,
    @SerializedName("created_at")
    val createdAt: String?,
    @SerializedName("expires_at")
    val expiresAt: String?,
    @SerializedName("ttl_seconds")
    val ttlSeconds: Int?
)

// ===== DEVICE MODELS =====
data class Device(
    val id: Int?,
    @SerializedName("device_token")
    val deviceToken: String?,
    @SerializedName("device_name")
    val deviceName: String?,
    @SerializedName("device_type")
    val deviceType: String?,  // android|ios
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
    val deviceType: String,  // android|ios
    @SerializedName("device_id")
    val deviceId: String? = null
)

// ===== ABSENCE REQUEST MODELS =====
data class AbsenceRequest(
    val id: Int?,
    val student: StudentInfo?,
    val type: String?,  // dispensation|sick|permit|dinas
    @SerializedName("start_date")
    val startDate: String?,
    @SerializedName("end_date")
    val endDate: String?,
    val reason: String?,
    val status: String?,  // pending|approved|rejected
    @SerializedName("submitted_at")
    val submittedAt: String?,
    @SerializedName("approved_at")
    val approvedAt: String?,
    @SerializedName("approved_by")
    val approvedBy: String?
)

// StudentInfo, TeacherInfo, and ClassInfo are defined in ClassScheduleModels.kt
// Removing duplicates to avoid compilation errors

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
    @SerializedName("subject_name")
    val subjectName: String?,
    @SerializedName("start_time")
    val startTime: String?,
    @SerializedName("end_time")
    val endTime: String?,
    val room: String?,
    val teacher: TeacherInfo?,
    @SerializedName("attendance_status")
    val attendanceStatus: String?,
    @SerializedName("is_checked_in")
    val isCheckedIn: Boolean?
)

data class TeacherDashboard(
    @SerializedName("today_statistics")
    val todayStatistics: TeacherStatistics?,
    @SerializedName("today_schedules")
    val todaySchedules: List<TeachingScheduleItem>?
)

data class TeacherStatistics(
    @SerializedName("total_students_present")
    val totalStudentsPresent: Int?,
    @SerializedName("total_students_absent")
    val totalStudentsAbsent: Int?,
    @SerializedName("total_students_late")
    val totalStudentsLate: Int?,
    @SerializedName("total_classes_today")
    val totalClassesToday: Int?
)

data class TeachingScheduleItem(
    val id: Int?,
    val `class`: ClassInfo?,
    @SerializedName("subject_name")
    val subjectName: String?,
    @SerializedName("start_time")
    val startTime: String?,
    @SerializedName("end_time")
    val endTime: String?,
    val room: String?,
    @SerializedName("attendance_count")
    val attendanceCount: Int?
)

data class AdminDashboard(
    @SerializedName("total_students")
    val totalStudents: Int?,
    @SerializedName("total_teachers")
    val totalTeachers: Int?,
    @SerializedName("total_classes")
    val totalClasses: Int?,
    @SerializedName("majors_count")
    val majorsCount: Int?,
    @SerializedName("today_attendance_rate")
    val todayAttendanceRate: Float?,
    @SerializedName("recent_activities")
    val recentActivities: List<Any>?
)

data class HomeroomDashboard(
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
    val `class`: ClassInfo?,
    @SerializedName("today_summary")
    val todaySummary: AttendanceSummary?,
    val today: String?
)

// ===== SCHEDULE ITEM MODELS =====
data class ScheduleItem(
    val id: Int?,
    @SerializedName("subject_name")
    val subjectName: String?,
    @SerializedName("teacher_name")
    val teacherName: String?,
    val room: String?,
    @SerializedName("start_time")
    val startTime: String?,
    @SerializedName("end_time")
    val endTime: String?,
    val status: String?
)

data class StudentFollowUp(
    @SerializedName("student_id")
    val studentId: Int?,
    @SerializedName("student_name")
    val studentName: String?,
    val nisn: String?,
    @SerializedName("absence_count")
    val absenceCount: Int?,
    @SerializedName("latest_absence")
    val latestAbsence: String?
)

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

// ===== NOTIFICATION MODELS =====
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

// ===== SETTINGS MODELS =====
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
