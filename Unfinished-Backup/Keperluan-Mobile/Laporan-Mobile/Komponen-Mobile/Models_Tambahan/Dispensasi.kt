package com.example.ritamesa

data class Dispensasi(
    val id: Int = -1, // ID dari API, diperlukan untuk approve/reject
    val namaSiswa: String,
    val kelas: String,
    val mataPelajaran: String,
    val hari: String,
    val tanggal: String,
    val jamKe: String,
    val guruPengajar: String,
    val catatan: String,
    val status: StatusDispensasi,
    val studentId: Int = -1 // ID siswa dari API
)

enum class StatusDispensasi {
    MENUNGGU,
    DISETUJUI,
    DITOLAK
}