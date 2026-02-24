package com.example.ritamesa.api.models

import com.google.gson.annotations.SerializedName

// ===== ATTENDANCE MODELS =====
data class AttendanceData(
    val id: Int?,
    @SerializedName("attendee_name")
    val attendeeName: String?,
    val status: String?,  // present|absent|late|excused|sick|izin
    @SerializedName("scanned_at")
    val scannedAt: String?,
    val schedule: ScheduleInfo?,
    val reason: String?
)

data class ScheduleInfo(
    val id: Int?,
    @SerializedName("subject_name")
    val subjectName: String?,
    @SerializedName("class_name")
    val className: String?,
    val date: String?,
    @SerializedName("start_time")
    val startTime: String?,
    @SerializedName("end_time")
    val endTime: String?
)

data class AttendanceResource(
    val id: Int?,
    val student: StudentInfo?,
    val schedule: ScheduleInfo?,
    val date: String?,
    val status: String?,
    @SerializedName("status_label")
    val statusLabel: String?,
    @SerializedName("checked_in_at")
    val checkedInAt: String?,
    val timestamp: String?,
    val reason: String?,
    @SerializedName("created_at")
    val createdAt: String?
)

data class ScanAttendanceRequest(
    val token: String,  // QR token
    @SerializedName("device_id")
    val deviceId: Int? = null
)

data class ManualAttendanceRequest(
    @SerializedName("attendee_type")
    val attendeeType: String,  // student|teacher
    @SerializedName("schedule_id")
    val scheduleId: Int,
    val status: String,  // present|late|excused|sick|absent|dinas|izin|pulang
    val date: String,  // YYYY-MM-DD
    @SerializedName("student_id")
    val studentId: Int? = null,
    @SerializedName("teacher_id")
    val teacherId: Int? = null,
    val reason: String? = null
)

data class BulkManualAttendanceRequest(
    val records: List<BulkAttendanceItem>
)

data class BulkAttendanceItem(
    @SerializedName("attendee_type")
    val attendeeType: String,
    @SerializedName("schedule_id")
    val scheduleId: Int,
    val status: String,
    val date: String,
    @SerializedName("student_id")
    val studentId: Int? = null,
    @SerializedName("teacher_id")
    val teacherId: Int? = null,
    val reason: String? = null
)

data class AttendanceSummary(
    @SerializedName("total_students")
    val totalStudents: Int? = 0,
    val present: Int? = 0,
    val absent: Int? = 0,
    val late: Int? = 0,
    val excused: Int? = 0,
    val sick: Int? = 0,
    @SerializedName("attendance_rate")
    val attendanceRate: Float? = 0f
)

data class DailyAttendanceData(
    val date: String?,
    @SerializedName("teacher_id")
    val teacherId: Int?,
    @SerializedName("teacher_name")
    val teacherName: String?,
    val nip: String?,
    val status: String?,
    val timestamp: String?
)

// ===== ATTENDANCE EXPORT =====
data class ExportAttendanceRequest(
    @SerializedName("class_id")
    val classId: Int?,
    @SerializedName("start_date")
    val startDate: String?,
    @SerializedName("end_date")
    val endDate: String?,
    val format: String? = "csv"
)

data class AttendanceDocument(
    val id: Int?,
    @SerializedName("document_path")
    val documentPath: String?,
    @SerializedName("document_url")
    val documentUrl: String?,
    @SerializedName("created_at")
    val createdAt: String?
)
