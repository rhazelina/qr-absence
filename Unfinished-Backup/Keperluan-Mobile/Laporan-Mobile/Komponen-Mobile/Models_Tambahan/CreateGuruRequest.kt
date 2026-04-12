package com.example.ritamesa.api.models

import com.google.gson.annotations.SerializedName

// CreateGuruRequest digunakan oleh UI/form admin untuk membuat guru baru.
// StoreTeacherRequest di TeacherStudentModels.kt adalah versi yang dikirim ke API.
// Keduanya dipertahankan karena CreateGuruRequest bisa dipakai di layer UI
// sebelum dikonversi ke StoreTeacherRequest.

data class CreateGuruRequest(
    val name: String,
    val nip: String? = null,
    val phone: String? = null,
    // jabatan menentukan sub-role: "Guru" | "Waka" | "Wali Kelas"
    val jabatan: String = "Guru",
    @SerializedName("kode_guru")
    val kodeGuru: String? = null,
    val email: String? = null,
    @SerializedName("major_id")
    val majorId: Int? = null,
    @SerializedName("homeroom_class_id")
    val homeroomClassId: Int? = null    // wajib diisi jika jabatan == "Wali Kelas"
)

data class UpdateGuruRequest(
    val name: String? = null,
    val nip: String? = null,
    val phone: String? = null,
    val jabatan: String? = null,
    @SerializedName("kode_guru")
    val kodeGuru: String? = null,
    val email: String? = null,
    @SerializedName("major_id")
    val majorId: Int? = null,
    @SerializedName("homeroom_class_id")
    val homeroomClassId: Int? = null
)

// Response dari API GET /teachers/{id}
// Gunakan TeacherResource (TeacherStudentModels.kt) untuk response list/detail.
// GuruResponse ini bisa dipakai untuk display di UI admin jika perlu field berbeda.
data class GuruResponse(
    val id: Int?,
    val name: String?,
    val nip: String? = null,
    val phone: String? = null,
    val jabatan: String = "Guru",
    @SerializedName("kode_guru")
    val kodeGuru: String? = null,
    val email: String? = null,
    @SerializedName("major_id")
    val majorId: Int? = null,
    val major: MajorInfo? = null,
    @SerializedName("homeroom_class_id")
    val homeroomClassId: Int? = null,
    @SerializedName("created_at")
    val createdAt: String? = null
)