package com.example.ritamesa

data class Kelas(
    val id: String,
    val namaJurusan: String,
    val namaKelas: String,
    val waliKelas: String,
    val majorId: String? = null,
    val homeroomTeacherId: String? = null
)