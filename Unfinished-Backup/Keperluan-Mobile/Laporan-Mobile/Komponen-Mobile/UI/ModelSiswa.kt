package com.example.ritamesa.model

data class ModelSiswa(
    val id: Int? = null,
    val name: String = "",
    val nisn: String = "",
    val nis: String? = null,
    val gender: String = "",
    val class_id: Int? = null,
    val class_name: String = "",
    val major_id: Int? = null,
    val major_name: String = "",
    val parent_phone: String = ""
    // enrollment_year dihapus
) {
    fun getGenderForApi(): String = when(gender.lowercase()) {
        "laki-laki" -> "L"
        "perempuan" -> "P"
        else -> gender
    }
}