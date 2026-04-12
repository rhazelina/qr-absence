package com.example.ritamesa.api.models

import com.google.gson.annotations.SerializedName

data class CreateJurusanRequest(
    val code: String,                    // kode jurusan
    val name: String,                    // konsentrasi keahlian
    @SerializedName("program_keahlian")
    val programKeahlian: String,         // program keahlian
    @SerializedName("bidang_keahlian")
    val bidangKeahlian: String,          // bidang keahlian
    val category: String? = null,        // opsional, dari API
    val bidang: String? = null            // opsional, dari API
)

data class UpdateJurusanRequest(
    val code: String? = null,
    val name: String? = null,
    @SerializedName("program_keahlian")
    val programKeahlian: String? = null,
    @SerializedName("bidang_keahlian")
    val bidangKeahlian: String? = null,
    val category: String? = null,
    val bidang: String? = null
)

// Response dari API GET majors
data class MajorResponse(
    val id: Int,
    val code: String,
    val name: String,
    @SerializedName("program_keahlian")
    val programKeahlian: String?,
    @SerializedName("bidang_keahlian")
    val bidangKeahlian: String?,
    val category: String?,
    val bidang: String?,
    @SerializedName("created_at")
    val createdAt: String?,
    @SerializedName("updated_at")
    val updatedAt: String?
)