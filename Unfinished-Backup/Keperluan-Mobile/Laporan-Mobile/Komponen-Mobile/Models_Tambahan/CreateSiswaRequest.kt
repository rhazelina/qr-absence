package com.example.ritamesa.api.models

import com.google.gson.annotations.SerializedName

data class CreateSiswaRequest(
    val name: String,                          // nama
    val nisn: String,                           // NISN
    val gender: String,                          // "L" atau "P"
    @SerializedName("class_id")
    val classId: Int,                            // id kelas
    @SerializedName("major_id")
    val majorId: Int,                            // id jurusan
    @SerializedName("parent_phone")
    val parentPhone: String? = null,             // no telp orang tua
    // Field opsional dari API:
    val nis: String? = null,                      // NIS (opsional)
    val address: String? = null,                  // alamat (opsional)
    val email: String? = null                    // email (opsional)
    // enrollment_year dihapus
)

data class UpdateSiswaRequest(
    val name: String? = null,
    val nisn: String? = null,
    val gender: String? = null,
    @SerializedName("class_id")
    val classId: Int? = null,
    @SerializedName("major_id")
    val majorId: Int? = null,
    @SerializedName("parent_phone")
    val parentPhone: String? = null,
    val nis: String? = null,
    val address: String? = null,
    val email: String? = null
    // enrollment_year dihapus
)

// Response dari API GET students
data class SiswaResponse(
    val id: Int,
    val name: String,
    val nisn: String,
    val nis: String? = null,
    val gender: String,                          // "L" atau "P"
    @SerializedName("class_id")
    val classId: Int,
    @SerializedName("class_name")
    val className: String,                        // untuk display
    @SerializedName("major_id")
    val majorId: Int,
    @SerializedName("major_name")
    val majorName: String,                        // untuk display
    @SerializedName("parent_phone")
    val parentPhone: String? = null,
    val address: String? = null,
    val email: String? = null,
    val grade: String? = null,                    // tingkat dari kelas
    @SerializedName("is_class_officer")
    val isClassOfficer: Boolean? = null
    // enrollment_year dihapus
)