package com.example.ritamesa

data class Guru(
    val id: Int,
    val name: String = "",
    val nip: String? = null,
    val phone: String? = null,
    val jabatan: String = "Guru",
    val majorId: Int? = null,
    val email: String? = null
) {
    // Dipakai oleh GuruAdapter: holder.tvRole.text = guru.getRole()
    fun getRole(): String = jabatan
}