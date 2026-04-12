package com.example.ritamesa

data class Jurusan(
    val id: Int,
    val code: String,
    val name: String,
    val programKeahlian: String = "",
    val bidangKeahlian: String = "",
    val category: String? = null,
    val bidang: String? = null
)