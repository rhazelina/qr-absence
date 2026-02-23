package com.example.ritamesa.api.models

import com.google.gson.annotations.SerializedName

// ===== TEACHER MODELS =====
data class TeacherResource(
    val id: Int?,
    val name: String?,
    val nip: String?,
    @SerializedName("kode_guru")
    val kodeGuru: String?,
    val email: String?,
    val phone: String?,
    val major: MajorInfo?,
    @SerializedName("created_at")
    val createdAt: String?
)

// TeacherProfile is defined in AuthModels.kt

data class StoreTeacherRequest(
    val name: String,
    val nip: String,
    @SerializedName("kode_guru")
    val kodeGuru: String? = null,
    val email: String,
    val phone: String? = null,
    @SerializedName("major_id")
    val majorId: Int
)

data class UpdateTeacherRequest(
    val name: String? = null,
    val nip: String? = null,
    @SerializedName("kode_guru")
    val kodeGuru: String? = null,
    val email: String? = null,
    val phone: String? = null,
    @SerializedName("major_id")
    val majorId: Int? = null
)

data class TeacherImportRequest(
    val file: String
)

data class TeacherImportResponse(
    val imported: Int? = null,
    val skipped: Int? = null,
    val errors: List<String>? = null
)

// ===== STUDENT MODELS =====
data class StudentResource(
    val id: Int?,
    val name: String?,
    val nisn: String?,
    val nis: String?,
    val `class`: ClassInfo?,
    @SerializedName("date_of_birth")
    val dateOfBirth: String?,
    @SerializedName("created_at")
    val createdAt: String?
)

data class StoreStudentRequest(
    val name: String,
    val nisn: String,
    val nis: String? = null,
    val email: String? = null,
    @SerializedName("class_id")
    val classId: Int,
    @SerializedName("date_of_birth")
    val dateOfBirth: String? = null
)

data class UpdateStudentRequest(
    val name: String? = null,
    val nisn: String? = null,
    val nis: String? = null,
    val email: String? = null,
    @SerializedName("class_id")
    val classId: Int? = null,
    @SerializedName("date_of_birth")
    val dateOfBirth: String? = null
)

data class StudentImportRequest(
    val file: String
)

data class StudentImportResponse(
    val imported: Int? = null,
    val skipped: Int? = null,
    val errors: List<String>? = null
)

// ===== LEAVE PERMISSION MODELS =====
data class StudentLeavePermission(
    val id: Int?,
    val student: StudentInfo?,
    val `class`: ClassInfo?,
    val type: String?,  // full_day|early_leave
    @SerializedName("start_time")
    val startTime: String?,
    @SerializedName("end_time")
    val endTime: String?,
    val reason: String?,
    val status: String?,  // active|returned|absent|cancelled
    @SerializedName("created_at")
    val createdAt: String?,
    @SerializedName("returned_at")
    val returnedAt: String?
)

data class CreateLeavePermissionRequest(
    @SerializedName("student_id")
    val studentId: Int,
    val type: String,  // full_day|early_leave
    val reason: String,
    @SerializedName("start_time")
    val startTime: String? = null,
    @SerializedName("end_time")
    val endTime: String? = null
)

data class UpdateLeavePermissionRequest(
    val reason: String? = null,
    val status: String? = null
)
