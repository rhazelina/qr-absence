package com.example.ritamesa.api.models

import com.google.gson.annotations.SerializedName

// ===== CLASS MODELS =====

data class ClassPayload(
    val name: String,
    @SerializedName("major_id")
    val majorId: Int,
    @SerializedName("homeroom_teacher_id")
    val homeroomTeacherId: Int? = null,
    val grade: String? = null,
    val label: String? = null
)

data class Classes(
    val id: Int?,
    val name: String?,
    val grade: String? = null,
    val label: String? = null,
    // NOTE: The API returns "major" as a plain String (e.g. "RPL"), NOT a JSON object.
    // Using String? here prevents Gson from crashing with
    // "Expected BEGIN_OBJECT but was STRING at $.data.major".
    // The full major object (if needed) is available via majorId + a separate API call.
    val major: String? = null,
    @SerializedName("major_name")
    val majorName: String? = null,
    @SerializedName("major_id")
    val majorId: Int? = null,
    @SerializedName("homeroom_teacher")
    val homeroomTeacher: TeacherInfo? = null,
    @SerializedName("homeroom_teacher_id")
    val homeroomTeacherId: Int? = null,
    @SerializedName("homeroom_teacher_name")
    val homeroomTeacherName: String? = null,
    @SerializedName("class_name")
    val className: String? = null,
    @SerializedName("student_count")
    val studentCount: Int? = null,
    @SerializedName("created_at")
    val createdAt: String? = null
)

// ===== SCHEDULE MODELS =====

data class Schedule(
    val id: Int?,
    val day: String? = null,
    @SerializedName("class_id")
    val classId: Int? = null,

    @SerializedName("start_time")
    val startTime: String?,

    @SerializedName("end_time")
    val endTime: String?,

    @SerializedName("subject_name")
    val subjectName: String?,

    @SerializedName("class")
    val `class`: String? = null,

    @SerializedName("subject")
    val subject: String? = null,
    val teacher: TeacherInfo? = null,
    @SerializedName("room")
    val room: String? = null,

    @SerializedName("time_slot")
    val timeSlot: TimeSlotInfo? = null,

    @SerializedName("created_at")
    val createdAt: String? = null,

    // Tambahan field untuk memudahkan akses
    @SerializedName("teacher_name")
    val teacherName: String? = null,

    @SerializedName("room_name")
    val roomName: String? = null,

    @SerializedName("class_name")
    val className: String? = null,

    @SerializedName("student_count")
    val studentCount: Int? = null
) {
    val scheduleClass: String? get() = `class`

    // Helper function dengan nama berbeda untuk menghindari konflik
    fun getDisplayTeacherName(): String {
        return teacherName ?: teacher?.name ?: "Guru"
    }

    fun getDisplayRoomName(): String {
        return roomName ?: room ?: "-"
    }
}

data class HomeroomSchedulesResponse(
    val status: String? = null,
    @SerializedName(value = "items", alternate = ["data", "schedules"])
    val items: List<Schedule>? = null
)

data class SubjectInfo(
    val id: Int?,
    val name: String?,
    val code: String? = null
)

data class RoomInfo(
    val id: Int?,
    val name: String?,
    val code: String? = null
)

data class TimeSlotInfo(
    val id: Int?,
    @SerializedName("start_time")
    val startTime: String?,
    @SerializedName("end_time")
    val endTime: String?,
    val session: Int? = null
)

data class StoreScheduleRequest(
    @SerializedName("class_id")
    val classId: Int,
    @SerializedName("subject_id")
    val subjectId: Int,
    @SerializedName("teacher_id")
    val teacherId: Int,
    val day: String,
    @SerializedName("time_slot_id")
    val timeSlotId: Int? = null,
    @SerializedName("start_time")
    val startTime: String? = null,
    @SerializedName("end_time")
    val endTime: String? = null,
    @SerializedName("room_id")
    val roomId: Int? = null
)

data class UpdateScheduleRequest(
    @SerializedName("class_id")
    val classId: Int? = null,
    @SerializedName("subject_id")
    val subjectId: Int? = null,
    @SerializedName("teacher_id")
    val teacherId: Int? = null,
    val day: String? = null,
    @SerializedName("time_slot_id")
    val timeSlotId: Int? = null,
    @SerializedName("start_time")
    val startTime: String? = null,
    @SerializedName("end_time")
    val endTime: String? = null,
    @SerializedName("room_id")
    val roomId: Int? = null
)

data class BulkScheduleRequest(
    val schedules: List<StoreScheduleRequest>
)
