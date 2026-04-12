package com.example.ritamesa

data class Kelas(
    val id: Int,
    val namaKelas: String = "",
    val konsentrasiKeahlian: String = "",
    val waliKelas: String = "",
    val grade: String = "",
    val label: String = "",
    val majorId: Int = 0,
    val homeroomTeacherId: Int? = null
) {
    fun getNamaKelasLengkap(): String = namaKelas
    fun getKonsentrasi(): String = konsentrasiKeahlian
    fun getWali(): String = waliKelas
}