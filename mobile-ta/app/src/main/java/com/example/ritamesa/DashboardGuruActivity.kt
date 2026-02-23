package com.example.ritamesa

import android.content.Intent
import android.os.Bundle

class DashboardGuruActivity : BaseNetworkActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        startActivity(Intent(this, GuruNavigationActivity::class.java))
        finish()
    }

    data class JadwalItem(
        val id: Int,
        val mataPelajaran: String,
        val waktuPelajaran: String,
        val kelas: String,
        val jam: String,
        val idKelas: String,
        val idMapel: String
    )

    data class JadwalData(
        val id: Int = 0,
        val idKelas: Int = 0,
        val mataPelajaran: String,
        val kelas: String,
        val jam: String,
        val waktuPelajaran: String
    ) : java.io.Serializable
}