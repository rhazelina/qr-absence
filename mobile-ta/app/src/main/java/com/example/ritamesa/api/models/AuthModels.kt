package com.example.ritamesa.api.models

import com.google.gson.annotations.SerializedName

// ===== LOGIN REQUEST =====
data class LoginRequest(
    val login: String,  // username, email, NISN, or NIP/Kode Guru
    val password: String? = null  // optional for NISN login
)

// ===== USER PROFILE / LOGIN RESPONSE =====
data class UserProfile(
    val id: Int?,
    val name: String?,
    val username: String?,
    val email: String?,
    @SerializedName("user_type")
    val userType: String?,  // admin|teacher|student
    @SerializedName("created_at")
    val createdAt: String?,
    @SerializedName("studentProfile")
    val studentProfile: StudentProfile? = null,
    @SerializedName("teacherProfile")
    val teacherProfile: TeacherProfile? = null
)

data class StudentProfile(
    val id: Int?,
    val nisn: String?,
    val nis: String?,
    @SerializedName("class_id")
    val classId: Int?,
    @SerializedName("date_of_birth")
    val dateOfBirth: String?
)

data class TeacherProfile(
    val id: Int?,
    val nip: String?,
    @SerializedName("kode_guru")
    val kodeGuru: String?
)

// ===== LOGIN RESPONSE WRAPPER =====
data class LoginResponse(
    val user: UserProfile?,
    val token: String?,
    @SerializedName("token_type")
    val tokenType: String?  // "Bearer"
)

// ===== ME ENDPOINT RESPONSE =====
data class MeResponse(
    val id: Int?,
    val name: String?,
    val username: String?,
    val email: String?,
    @SerializedName("user_type")
    val userType: String?,
    @SerializedName("studentProfile")
    val studentProfile: StudentProfile? = null,
    @SerializedName("teacherProfile")
    val teacherProfile: TeacherProfile? = null,
    @SerializedName("created_at")
    val createdAt: String?
)


// ===== GENERIC API RESPONSE =====
data class ApiResponse<T>(
    val data: T? = null,
    val message: String? = null,
    val status: Boolean? = null,
    val errors: Map<String, List<String>>? = null
)

// ===== PAGINATION RESPONSE =====
data class PaginatedResponse<T>(
    val data: List<T>? = null,
    @SerializedName("current_page")
    val currentPage: Int? = null,
    @SerializedName("per_page")
    val perPage: Int? = null,
    val total: Int? = null,
    @SerializedName("last_page")
    val lastPage: Int? = null,
    val pagination: PaginationMeta? = null,
    val message: String? = null,
    val status: Boolean? = null
)

data class PaginationMeta(
    @SerializedName("current_page")
    val currentPage: Int? = null,
    @SerializedName("per_page")
    val perPage: Int? = null,
    val total: Int? = null,
    @SerializedName("last_page")
    val lastPage: Int? = null
)

// ===== ERROR RESPONSE =====
data class ErrorResponse(
    val message: String? = null,
    val status: Boolean? = null,
    val errors: Map<String, List<String>>? = null
)
