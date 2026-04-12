package com.example.ritamesa

import android.content.Intent
import android.os.Bundle
import android.widget.ImageButton
import android.widget.TextView
import android.widget.Toast
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale
import java.util.TimeZone

class NotifikasiWaliKelasActivity : BaseNetworkActivity() {
    private lateinit var rvHariIni: RecyclerView
    private lateinit var tvHariTanggal: TextView
    private lateinit var btnHome: ImageButton
    private lateinit var btnCalendar: ImageButton
    private lateinit var btnChart: ImageButton
    private lateinit var btnNotif: ImageButton
    private lateinit var adapterHariIni: NotifikasiAdapter
    private val dataHariIni = mutableListOf<Map<String, Any>>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        startActivity(Intent(this, WaliKelasNavigationActivity::class.java))
        finish()
    }

    private fun initViews() {
        rvHariIni = findViewById(R.id.rvNotifHariIni)
        tvHariTanggal = findViewById(R.id.tvharitanggal)
        btnHome = findViewById(R.id.btnHome)
        btnCalendar = findViewById(R.id.btnCalendar)
        btnChart = findViewById(R.id.btnChart)
        btnNotif = findViewById(R.id.btnNotif)
    }

    private fun updateTanggalRealTime() {
        try {
            // Format Indonesia Barat (WIB) - TimeZone Asia/Jakarta
            val calendar = Calendar.getInstance(TimeZone.getTimeZone("Asia/Jakarta"))

            // Format: "Senin, 20 Januari 2025"
            val sdf = SimpleDateFormat("EEEE, dd MMMM yyyy", Locale("id", "ID"))
            sdf.timeZone = TimeZone.getTimeZone("Asia/Jakarta")

            val formattedDate = sdf.format(calendar.time)

            // Kapital huruf pertama
            val finalDate = if (formattedDate.isNotEmpty()) {
                formattedDate[0].uppercaseChar() + formattedDate.substring(1)
            } else {
                formattedDate
            }

            tvHariTanggal.text = finalDate
        } catch (e: Exception) {
            // Fallback jika error
            val calendar = Calendar.getInstance()
            val fallback = "${calendar.get(Calendar.DAY_OF_MONTH)} ${getMonthName(calendar.get(Calendar.MONTH))} ${calendar.get(Calendar.YEAR)}"
            tvHariTanggal.text = fallback
        }
    }

    private fun getMonthName(month: Int): String {
        return when (month) {
            0 -> "Januari"
            1 -> "Februari"
            2 -> "Maret"
            3 -> "April"
            4 -> "Mei"
            5 -> "Juni"
            6 -> "Juli"
            7 -> "Agustus"
            8 -> "September"
            9 -> "Oktober"
            10 -> "November"
            11 -> "Desember"
            else -> ""
        }
    }

    private fun setupFooterNavigation() {
        // Navigasi untuk WALI KELAS

        btnHome.setOnClickListener {
            val intent = Intent(this, DashboardWaliKelasActivity::class.java)
            startActivity(intent)
        }

        btnCalendar.setOnClickListener {
            val intent = Intent(this, RiwayatKehadiranKelasActivity::class.java)
            startActivity(intent)
        }

        btnChart.setOnClickListener {
            val intent = Intent(this, TindakLanjutWaliKelasActivity::class.java)
            startActivity(intent)
        }

        btnNotif.setOnClickListener {
            // Sudah di halaman Notifikasi Wali Kelas, refresh saja
            refreshNotifications()
        }
    }

    private fun refreshNotifications() {
        // Refresh data notifikasi DAN tanggal
        updateTanggalRealTime()
        loadNotificationsFromApi()
        Toast.makeText(this, "Notifikasi Wali Kelas direfresh", Toast.LENGTH_SHORT).show()
    }

    private fun loadNotificationsFromApi() {
        lifecycleScope.launch {
            try {
                val result = administrationRepository.getMyNotifications()
                handleResult(result,
                    onSuccess = { notifications ->
                        dataHariIni.clear()
                        dataHariIni.addAll(notifications.map { notif ->
                            mapOf<String, Any>(
                                "type" to (notif.type ?: "reminder"),
                                "message" to (notif.message ?: ""),
                                "detail" to (notif.title ?: ""),
                                "time" to (notif.createdAt ?: "-"),
                                "date" to getCurrentFormattedDate()
                            )
                        })
                        loadDataToAdapter()
                    },
                    onError = { _, msg ->
                        showError(msg ?: "Gagal memuat notifikasi")
                    }
                )
            } catch (e: Exception) {
                showError("Error: ${e.message}")
            }
        }
    }

    private fun setupRecyclerView() {
        // Setup untuk Wali Kelas (role: false)
        adapterHariIni = NotifikasiAdapter(dataHariIni, false)
        rvHariIni.layoutManager = LinearLayoutManager(this)
        rvHariIni.adapter = adapterHariIni
    }

    private fun getCurrentFormattedDate(): String {
        val calendar = Calendar.getInstance(TimeZone.getTimeZone("Asia/Jakarta"))
        val dateFormat = SimpleDateFormat("dd MMMM yyyy", Locale("id", "ID"))
        dateFormat.timeZone = TimeZone.getTimeZone("Asia/Jakarta")
        return dateFormat.format(calendar.time)
    }

    private fun loadDataToAdapter() {
        adapterHariIni.notifyDataSetChanged()
    }
}