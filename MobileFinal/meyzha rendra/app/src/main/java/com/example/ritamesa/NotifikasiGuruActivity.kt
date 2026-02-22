package com.example.ritamesa

import android.content.Intent
import android.os.Bundle
import android.widget.ImageButton
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import java.text.SimpleDateFormat
import java.util.*

class NotifikasiGuruActivity : AppCompatActivity() {

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
        setContentView(R.layout.notifikasi_guru)

        initViews()
        setupFooterNavigation()
        setupRecyclerView()
        generateDummyDataRPL()
        loadDataToAdapter()
        updateTanggalRealTime()
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
        val sdf = SimpleDateFormat("EEEE, dd MMMM yyyy", Locale("id", "ID"))
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
        generateDummyDataRPL()
        loadDataToAdapter()
        Toast.makeText(this, "Notifikasi direfresh", Toast.LENGTH_SHORT).show()
    }

    private fun setupRecyclerView() {
        adapterHariIni = NotifikasiAdapter(dataHariIni, true)
        rvHariIni.layoutManager = LinearLayoutManager(this)
        rvHariIni.adapter = adapterHariIni
    }

    // ============= DATA DUMMY NOTIFIKASI GURU RPL =============
    private fun generateDummyDataRPL() {
        dataHariIni.clear()
        val currentDate = getCurrentFormattedDate()

        dataHariIni.addAll(listOf(
            mapOf(
                "type" to "tepat_waktu",
                "message" to "Anda mengajar tepat waktu pada",
                "detail" to "MPKK - XII RPL 2",
                "time" to "07:30",
                "date" to currentDate
            ),
            mapOf(
                "type" to "tepat_waktu",
                "message" to "Anda mengajar tepat waktu pada",
                "detail" to "PKDK - XII RPL 1",
                "time" to "08:15",
                "date" to currentDate
            ),
            mapOf(
                "type" to "terlambat",
                "message" to "Anda terlambat mengajar pada",
                "detail" to "MPP - XI RPL 1",
                "time" to "09:10",
                "date" to currentDate
            ),
            mapOf(
                "type" to "alpha_siswa",
                "message" to "Ada siswa alpha pada kelas",
                "detail" to "XI RPL 2 - Mapel MPKK",
                "time" to "08:15",
                "date" to currentDate
            ),
            mapOf(
                "type" to "tindak_lanjut",
                "message" to "Perlu tindak lanjut untuk siswa",
                "detail" to "Ahmad Fauzi - XII RPL 2",
                "time" to "10:30",
                "date" to currentDate
            ),
            mapOf(
                "type" to "izin_siswa",
                "message" to "Ada permohonan izin dari",
                "detail" to "Citra Dewi - XI RPL 3",
                "time" to "07:45",
                "date" to currentDate
            ),
            mapOf(
                "type" to "reminder",
                "message" to "Reminder: Anda mengajar besok pada",
                "detail" to "Informatika - X RPL 1 jam 09:45",
                "time" to "16:00",
                "date" to currentDate
            )
        ))
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