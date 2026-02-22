package com.example.ritamesa

data class JadwalHarianItem(
    val mataPelajaran: String,
    val sesi: String,
    val namaGuru: String? = null // Added teacher name field, optional with default null
)