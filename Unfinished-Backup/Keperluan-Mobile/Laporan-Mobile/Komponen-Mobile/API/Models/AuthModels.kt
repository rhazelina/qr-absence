package com.example.ritamesa.api.models

import com.google.gson.annotations.SerializedName

// ===== LOGIN REQUEST =====
data class LoginRequest(
    val login: String,
    val password: String? = null
)

// ===== USER PROFILE =====
// Backend mengembalikan field "role" dan "is_class_officer" langsung di object user.
// Gunakan field ini untuk navigasi — jangan andalkan teacherProfile.jabatan
// karena backend TIDAK mengembalikannya di response login.
//
// Nilai "role" dari backend:
//   "admin"          → Dashboard Admin
//   "waka"           → Dashboard Waka
//   "wakel"          → Dashboard Wali Kelas
//   "guru"           → Dashboard Guru
//   "pengurus_kelas" → Dashboard Siswa (IS_PENGURUS = true)
//   "siswa"          → Dashboard Siswa (IS_PENGURUS = false)
data class UserProfile(
    val id: Int?,
    val name: String?,
    val username: String?,
    val email: String?,
    @SerializedName("user_type")
    val userType: String?,
    // role = nilai presisi dari backend untuk navigasi UI
    val role: String? = null,
    // is_class_officer = true jika siswa adalah pengurus kelas
    @SerializedName("is_class_officer")
    val isClassOfficer: Boolean? = false,
    @SerializedName("created_at")
    val createdAt: String?,
    @SerializedName("profile")
    val profile: ProfileData? = null
) {
    val studentProfile: StudentProfile? get() = profile?.toStudentProfile()
    val teacherProfile: TeacherProfile? get() = profile?.toTeacherProfile()
}

// Menampung semua field profil karena di backend student dan teacher
// masuk ke key "profile" yang sama.
data class ProfileData(
    val id: Int?, // Berlaku untuk keduanya
    // === Student Fields ===
    val nisn: String? = null,
    val nis: String? = null,
    @SerializedName("class_id")
    val classId: Int? = null,
    @SerializedName("date_of_birth")
    val dateOfBirth: String? = null,
    // === Teacher Fields ===
    val nip: String? = null,
    @SerializedName("kode_guru")
    val kodeGuru: String? = null,
    val jabatan: String? = null,
    @SerializedName("homeroom_class_id")
    val homeroomClassId: Int? = null
) {
    // Helper untuk kompatibilitas dengan repository yang sudah ada
    fun toTeacherProfile() = TeacherProfile(
        id = id, nip = nip, kodeGuru = kodeGuru,
        jabatan = jabatan, homeroomClassId = homeroomClassId
    )
    fun toStudentProfile() = StudentProfile(
        id = id, nisn = nisn, nis = nis,
        classId = classId, dateOfBirth = dateOfBirth
    )
}

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
    val kodeGuru: String?,
    val jabatan: String? = null,
    @SerializedName("homeroom_class_id")
    val homeroomClassId: Int? = null
)

// ===== LOGIN RESPONSE =====
// Backend mengembalikan "user" sebagai object langsung (bukan nested dalam "data")
data class LoginResponse(
    val user: UserProfile?,
    val token: String?,
    @SerializedName("token_type")
    val tokenType: String?
)

// ===== ME ENDPOINT RESPONSE =====
data class MeResponse(
    val id: Int?,
    val name: String?,
    val username: String?,
    val email: String?,
    @SerializedName("user_type")
    val userType: String?,
    val role: String? = null,
    @SerializedName("is_class_officer")
    val isClassOfficer: Boolean? = false,
    @SerializedName("profile")
    val profile: ProfileData? = null,
    @SerializedName("created_at")
    val createdAt: String?
) {
    // Helper properties agar repo yang masih pakai .studentProfile / .teacherProfile tetap jalan
    val studentProfile: StudentProfile? get() = profile?.toStudentProfile()
    val teacherProfile: TeacherProfile? get() = profile?.toTeacherProfile()
}

// ===== GENERIC API RESPONSE =====
data class ApiResponse<T>(
    val data: T? = null,
    val message: String? = null,
    val status: Boolean? = null,
    val success: Boolean? = null,
    val errors: Map<String, List<String>>? = null
)

// ===== PAGINATION RESPONSE =====
// Laravel bisa return dua format berbeda:
//
// Format A — paginate() langsung (field di root):
// { "data": [...], "current_page": 1, "total": 70, "per_page": 15, "last_page": 5 }
//
// Format B — Resource Collection dengan meta:
// { "data": [...], "links": {...}, "meta": { "current_page": 1, "total": 70, ... } }
//
// Kelas ini support KEDUANYA sekaligus.
data class PaginatedResponse<T>(
    @SerializedName("data")
    val data: List<T>? = null,
    @SerializedName("items")
    val items: List<T>? = null,

    @SerializedName("current_page")
    val currentPage: Int? = null,
    @SerializedName("per_page")
    val perPage: Int? = null,
    val total: Int? = null,
    @SerializedName("last_page")
    val lastPage: Int? = null,

    val meta: PaginationMeta? = null,

    val message: String? = null,
    val status: Boolean? = null,
    val success: Boolean? = null
) {
    fun resolvedItems(): List<T> = items ?: data ?: emptyList()
    fun getTotal(): Int = total ?: meta?.total ?: 0
    fun getCurrentPage(): Int = currentPage ?: meta?.currentPage ?: 1
    fun getLastPage(): Int = lastPage ?: meta?.lastPage ?: 1
}


data class PaginationMeta(
    @SerializedName("current_page")
    val currentPage: Int? = null,
    @SerializedName("per_page")
    val perPage: Int? = null,
    val total: Int? = null,
    @SerializedName("last_page")
    val lastPage: Int? = null
)

data class ErrorResponse(
    val message: String? = null,
    val status: Boolean? = null,
    val errors: Map<String, List<String>>? = null
)
