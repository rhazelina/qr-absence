package com.example.ritamesa

data class SiswaRekap(
    val id: Int,
    val nomor: Int = 0,
    val nama: String,
    val nisn: String,
    val kelas: String,
    val jurusan: String = ""
) {
    fun getKelasJurusan(): String {
        return if (jurusan.isNotBlank()) "$kelas $jurusan" else kelas
    }
}