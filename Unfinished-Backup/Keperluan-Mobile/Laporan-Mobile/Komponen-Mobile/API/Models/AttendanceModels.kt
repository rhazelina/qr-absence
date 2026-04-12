package com.example.ritamesa.api.models

import com.google.gson.annotations.SerializedName

// ===== SHARED INFO MODELS =====
// Model-model ini dipakai lintas modul (Attendance, Teacher, Student, dll.)

data class StudentInfo(
    val id: Int?,
    val name: String?,
    val nisn: String? = null,
    val nis: String? = null,
    @SerializedName("class_id")
    val classId: Int? = null,
    @SerializedName("class_name")
    val className: String? = null
)

data class ClassInfo(
    val id: Int?,
    val name: String?,
    val grade: String? = null,
    val major: String? = null
)

data class TeacherInfo(
    val id: Int?,
    val name: String?,
    val nip: String? = null,
    @SerializedName("kode_guru")
    val kodeGuru: String? = null
)

data class MajorInfo(
    val id: Int?,
    val name: String?,
    val code: String? = null
)


// ===== ATTENDANCE MODELS =====
data class AttendanceData(
    val id: Int?,
    @SerializedName("student_id")
    val studentId: Int? = null,
    @SerializedName("student_nisn")
    val studentNisn: String? = null,
    @SerializedName("attendee_name")
    val attendeeName: String?,
    val status: String?,  // present|absent|late|excused|sick|izin
    val date: String? = null,
    @SerializedName(value = "scanned_at", alternate = ["checked_in_at"])
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
    @SerializedName("class_id")
    val classId: Int? = null,
    val date: String? = null,
    @SerializedName("start_time")
    val startTime: String? = null,
    @SerializedName("end_time")
    val endTime: String? = null
)

data class AttendanceScanResponse(
    val message: String? = null,
    @SerializedName("attendance")
    val attendance: AttendanceData? = null,
    // Fallback jika backend tetap kirim key generic "data"
    @SerializedName("data")
    val data: AttendanceData? = null
)

data class AttendanceResource(
    val id: Int?,
    val student: StudentInfo?,
    val schedule: ScheduleInfo?,
    val status: String?,
    val timestamp: String?,
    val reason: String?,
    @SerializedName("checked_in_at")
    val checkedInAt: String? = null,
    @SerializedName("is_draft")
    val isDraft: Boolean? = null,
    @SerializedName("finalized_at")
    val finalizedAt: String? = null,
    @SerializedName("draft_saved_at")
    val draftSavedAt: String? = null,
    @SerializedName("manual_session_started_at")
    val manualSessionStartedAt: String? = null,
    val source: String? = null,
    @SerializedName("auto_late")
    val autoLate: Boolean? = null,
    @SerializedName("reason_file_url")
    val reasonFileUrl: String? = null,
    @SerializedName("has_attachments")
    val hasAttachments: Boolean? = null,
    @SerializedName("latest_attachment_url")
    val latestAttachmentUrl: String? = null,
    @SerializedName("latest_attachment_mime_type")
    val latestAttachmentMimeType: String? = null,
    @SerializedName("latest_attachment_name")
    val latestAttachmentName: String? = null,
    val attachments: List<AttendanceAttachmentItem> = emptyList()
)

data class AttendanceAttachmentItem(
    val id: Int? = null,
    val path: String? = null,
    @SerializedName("original_name")
    val originalName: String? = null,
    @SerializedName("mime_type")
    val mimeType: String? = null,
    val size: Long? = null,
    val url: String? = null
)

data class ScanAttendanceRequest(
    val token: String,
    @SerializedName("device_id")
    val deviceId: Int? = null
)

data class ManualAttendanceRequest(
    @SerializedName("attendee_type")
    val attendeeType: String,  // student|teacher
    @SerializedName("schedule_id")
    val scheduleId: Int,
    val status: String,        // present|late|excused|sick|absent|dinas|izin|pulang
    val date: String,          // YYYY-MM-DD
    @SerializedName("student_id")
    val studentId: Int? = null,
    @SerializedName("teacher_id")
    val teacherId: Int? = null,
    val reason: String? = null,
    @SerializedName("is_early_leave")
    val isEarlyLeave: Boolean? = null
)

data class BulkManualAttendanceRequest(
    @SerializedName("schedule_id")
    val scheduleId: Int,
    val date: String,
    val mode: String = "draft",
    val items: List<BulkAttendanceItem>
)

data class BulkAttendanceItem(
    @SerializedName("student_id")
    val studentId: Int,
    val status: String?,
    val reason: String? = null
)

data class FinalizeManualAttendanceRequest(
    @SerializedName("schedule_id")
    val scheduleId: Int,
    val date: String,
    @SerializedName("finalize_empty_as")
    val finalizeEmptyAs: String = "absent"
)

data class BulkManualAttendanceResponse(
    val message: String? = null,
    val mode: String? = null,
    @SerializedName("session_started_at")
    val sessionStartedAt: String? = null,
    @SerializedName("saved_count")
    val savedCount: Int? = 0,
    @SerializedName("draft_count")
    val draftCount: Int? = 0,
    @SerializedName("final_count")
    val finalCount: Int? = 0,
    @SerializedName("auto_late_student_ids")
    val autoLateStudentIds: List<Int> = emptyList(),
    val data: List<AttendanceData> = emptyList()
)

data class FinalizeManualAttendanceResponse(
    val message: String? = null,
    @SerializedName("schedule_id")
    val scheduleId: Int? = null,
    val date: String? = null,
    @SerializedName("finalized_at")
    val finalizedAt: String? = null,
    @SerializedName("finalized_count")
    val finalizedCount: Int? = 0,
    @SerializedName("auto_absent_count")
    val autoAbsentCount: Int? = 0,
    @SerializedName("already_recorded_count")
    val alreadyRecordedCount: Int? = 0,
    @SerializedName("already_finalized")
    val alreadyFinalized: Boolean? = false
)

data class ManualAttendanceSession(
    val date: String? = null,
    @SerializedName("has_draft")
    val hasDraft: Boolean? = false,
    @SerializedName("is_finalized")
    val isFinalized: Boolean? = false,
    @SerializedName("session_started_at")
    val sessionStartedAt: String? = null,
    @SerializedName("finalized_at")
    val finalizedAt: String? = null,
    @SerializedName("draft_saved_count")
    val draftSavedCount: Int? = 0,
    @SerializedName("eligible_student_count")
    val eligibleStudentCount: Int? = 0,
    @SerializedName("unfilled_student_count")
    val unfilledStudentCount: Int? = 0
)

data class ScheduleStudentAttendance(
    val id: Int? = null,
    val status: String? = null,
    @SerializedName("status_label")
    val statusLabel: String? = null,
    @SerializedName("checked_in_at")
    val checkedInAt: String? = null,
    val reason: String? = null,
    @SerializedName("is_draft")
    val isDraft: Boolean? = null,
    @SerializedName("finalized_at")
    val finalizedAt: String? = null,
    val source: String? = null,
    @SerializedName("auto_late")
    val autoLate: Boolean? = null
)

data class TeacherScheduleStudentItem(
    val id: Int? = null,
    val name: String? = null,
    val nis: String? = null,
    val nisn: String? = null,
    val attendance: ScheduleStudentAttendance? = null
)

data class TeacherScheduleDetailResponse(
    @SerializedName("manual_attendance_session")
    val manualAttendanceSession: ManualAttendanceSession? = null,
    val students: List<TeacherScheduleStudentItem> = emptyList()
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

data class UpdateAttendanceExcuseResponse(
    val message: String? = null,
    val attendance: AttendanceResource? = null
)
