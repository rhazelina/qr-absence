package com.example.ritamesa.api.models

import com.google.gson.annotations.SerializedName

// ===== CLASS MODELS =====
data class Classes(
    val id: Int?,
    val name: String?,
    val major: MajorInfo?,
    @SerializedName("homeroom_teacher")
    val homeroomTeacher: TeacherInfo?,
    @SerializedName("student_count")
    val studentCount: Int?,
    val students: List<StudentInfo>? = null,
    @SerializedName("created_at")
    val createdAt: String?
)

data class ClassPayload(
    val name: String,
    @SerializedName("major_id")
    val majorId: Int,
    @SerializedName("homeroom_teacher_id")
    val homeroomTeacherId: Int? = null,
    val capacity: Int? = null
)

data class MajorInfo(
    val id: Int?,
    val name: String?
)

// ===== SCHEDULE MODELS =====
data class Schedule(
    val id: Int?,
    val `class`: ClassInfo?,
    val teacher: TeacherInfo?,
    @SerializedName("subject_name")
    val subjectName: String?,
    val day: String?,
    @SerializedName("start_time")
    val startTime: String?,
    @SerializedName("end_time")
    val endTime: String?,
    val room: String?,
    val semester: Int?,
    val year: Int?,
    @SerializedName("created_at")
    val createdAt: String?
)

data class StoreScheduleRequest(
    val day: String,
    @SerializedName("start_time")
    val startTime: String,
    @SerializedName("end_time")
    val endTime: String,
    val title: String? = null,
    @SerializedName("subject_name")
    val subjectName: String? = null,
    @SerializedName("subject_id")
    val subjectId: Int? = null,
    @SerializedName("teacher_id")
    val teacherId: Int,
    @SerializedName("class_id")
    val classId: Int,
    val room: String? = null,
    val semester: Int,
    val year: Int
)

data class UpdateScheduleRequest(
    val day: String? = null,
    @SerializedName("start_time")
    val startTime: String? = null,
    @SerializedName("end_time")
    val endTime: String? = null,
    @SerializedName("subject_name")
    val subjectName: String? = null,
    @SerializedName("teacher_id")
    val teacherId: Int? = null,
    @SerializedName("class_id")
    val classId: Int? = null,
    val room: String? = null,
    val semester: Int? = null,
    val year: Int? = null
)

data class BulkScheduleRequest(
    val day: String,
    val schedules: List<StoreScheduleRequest>
)

data class TeacherInfo(
    val id: Int?,
    val name: String?
)

data class ClassInfo(
    val id: Int?,
    val name: String?
)

data class StudentInfo(
    val id: Int?,
    val name: String?,
    val nisn: String?,
    val nis: String? = null,
    @SerializedName("class_id")
    val classId: Int? = null,
    @SerializedName("date_of_birth")
    val dateOfBirth: String? = null
)

// ===== ROOM MODELS =====
data class Room(
    val id: Int?,
    val name: String?,
    val capacity: Int?,
    val building: String?,
    @SerializedName("created_at")
    val createdAt: String?
)

data class CreateRoomRequest(
    val name: String,
    val capacity: Int? = null,
    val building: String? = null
)

// ===== SUBJECT MODELS =====
data class Subject(
    val id: Int?,
    val name: String?,
    val code: String?,
    @SerializedName("created_at")
    val createdAt: String?
)

data class CreateSubjectRequest(
    val name: String,
    val code: String
)

// ===== TIME SLOT MODELS =====
data class TimeSlot(
    val id: Int?,
    val name: String?,
    @SerializedName("start_time")
    val startTime: String?,
    @SerializedName("end_time")
    val endTime: String?,
    @SerializedName("created_at")
    val createdAt: String?
)

data class CreateTimeSlotRequest(
    val name: String,
    @SerializedName("start_time")
    val startTime: String,
    @SerializedName("end_time")
    val endTime: String
)

// ===== MAJOR MODELS =====
data class Major(
    val id: Int?,
    val name: String?,
    val code: String?,
    val description: String? = null,
    @SerializedName("created_at")
    val createdAt: String?
)

data class CreateMajorRequest(
    val name: String,
    val code: String,
    val description: String? = null
)

// ===== SCHOOL YEAR & SEMESTER =====
data class SchoolYear(
    val id: Int?,
    val year: String?,
    @SerializedName("is_active")
    val isActive: Boolean? = false,
    @SerializedName("created_at")
    val createdAt: String?
)

data class Semester(
    val id: Int?,
    val semester: Int?,
    @SerializedName("school_year_id")
    val schoolYearId: Int?,
    @SerializedName("start_date")
    val startDate: String?,
    @SerializedName("end_date")
    val endDate: String?,
    @SerializedName("created_at")
    val createdAt: String?
)
