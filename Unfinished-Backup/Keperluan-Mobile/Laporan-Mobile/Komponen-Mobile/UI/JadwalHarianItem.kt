package com.example.ritamesa

data class JadwalHarianItem(
    val mataPelajaran: String,
    val sesi: String,
    val namaGuru: String? = null,
    val scheduleId: Int = 0,
    val startTime: String? = null,
    val endTime: String? = null,
    val room: String? = null,
    val subjectName: String? = null,
    val teacherName: String? = null,
    val status: String = "none"
)