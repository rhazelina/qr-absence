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

class NotifikasiGuruActivity : BaseNetworkActivity() {
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
        startActivity(Intent(this, GuruNavigationActivity::class.java))
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
        val calendar = Calendar.getInstance(TimeZone.getTimeZone("Asia/Jakarta"))
        val sdf = SimpleDateFormat("EEEE, dd MMMM yyyy", Locale.forLanguageTag("id-ID"))
        sdf.timeZone = TimeZone.getTimeZone("Asia/Jakarta")
        val formattedDate = sdf.format(calendar.time)
        tvHariTanggal.text = formattedDate[0].uppercaseChar() + formattedDate.substring(1)
    }

    private fun setupFooterNavigation() {
        btnHome.setOnClickListener {
            startActivity(Intent(this, DashboardGuruActivity::class.java))
        }
        btnCalendar.setOnClickListener {
            startActivity(Intent(this, RiwayatKehadiranGuruActivity::class.java))
        }
        btnChart.setOnClickListener {
            startActivity(Intent(this, TindakLanjutGuruActivity::class.java))
        }
        btnNotif.setOnClickListener {
            refreshNotifications()
        }
    }

    private fun refreshNotifications() {
        updateTanggalRealTime()
        loadNotificationsFromApi()
        Toast.makeText(this, "Notifikasi direfresh", Toast.LENGTH_SHORT).show()
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
        adapterHariIni = NotifikasiAdapter(dataHariIni, true)
        rvHariIni.layoutManager = LinearLayoutManager(this)
        rvHariIni.adapter = adapterHariIni
    }



    private fun getCurrentFormattedDate(): String {
        val calendar = Calendar.getInstance(TimeZone.getTimeZone("Asia/Jakarta"))
        val dateFormat = SimpleDateFormat("dd MMMM yyyy", Locale.forLanguageTag("id-ID"))
        dateFormat.timeZone = TimeZone.getTimeZone("Asia/Jakarta")
        return dateFormat.format(calendar.time)
    }

    private fun loadDataToAdapter() {
        adapterHariIni.notifyDataSetChanged()
    }
}