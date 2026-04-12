package com.example.ritamesa

import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.widget.ImageButton
import android.widget.PopupMenu
import android.widget.TextView
import android.widget.Toast
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone
import java.util.concurrent.Executors

class DashboardWaliKelasActivity : BaseNetworkActivity() {
    companion object {
        private const val TAG = "DashboardWaliKelas"
    }

    private lateinit var txtTanggalSekarang: TextView
    private lateinit var txtWaktuLive: TextView
    private lateinit var txtJamMasuk: TextView
    private lateinit var txtJamPulang: TextView
    private lateinit var txtTanggalDiJamLayout: TextView
    private lateinit var txtNominalSiswa: TextView
    private lateinit var txtHadirCount: TextView
    private lateinit var txtIzinCount: TextView
    private lateinit var txtSakitCount: TextView
    private lateinit var txtAlphaCount: TextView

    private val handler = Handler(Looper.getMainLooper())
    private lateinit var runnable: Runnable

    private var totalSiswa = 0
    private var hadirCount = 0
    private var izinCount  = 0
    private var sakitCount = 0
    private var alphaCount = 0

    private lateinit var recyclerJadwal: RecyclerView

    private val executor = Executors.newSingleThreadScheduledExecutor()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // Redirect ke fragment-based navigation activity
        startActivity(Intent(this, WaliKelasNavigationActivity::class.java))
        finish()
    }

    private fun initViews() {
        txtTanggalSekarang    = findViewById(R.id.txtTanggalSekarang)
        txtWaktuLive          = findViewById(R.id.txtWaktuLive)
        txtJamMasuk           = findViewById(R.id.txtJamMasuk)
        txtJamPulang          = findViewById(R.id.txtJamPulang)
        txtTanggalDiJamLayout = findViewById(R.id.txtTanggalDiJamLayout)
        txtNominalSiswa       = findViewById(R.id.nominal_siswa)
        txtHadirCount         = findViewById(R.id.txt_hadir_count)
        txtIzinCount          = findViewById(R.id.txt_izin_count)
        txtSakitCount         = findViewById(R.id.txt_sakit_count)
        txtAlphaCount         = findViewById(R.id.txt_alpha_count)
        recyclerJadwal        = findViewById(R.id.recyclerJadwal)
    }

    private fun showProfileMenu(view: android.view.View) {
        val popupMenu = PopupMenu(this, view)
        popupMenu.menuInflater.inflate(R.menu.profile_simple, popupMenu.menu)
        popupMenu.setOnMenuItemClickListener { menuItem ->
            when (menuItem.itemId) {
                R.id.menu_logout -> { showLogoutConfirmation(); true }
                R.id.menu_cancel -> { Toast.makeText(this, "Menu dibatalkan", Toast.LENGTH_SHORT).show(); true }
                else -> false
            }
        }
        popupMenu.show()
    }

    private fun showLogoutConfirmation() {
        android.app.AlertDialog.Builder(this)
            .setTitle("Keluar Wali Kelas")
            .setMessage("Yakin ingin Keluar?")
            .setPositiveButton("Ya, Keluar") { _, _ -> performLogout() }
            .setNegativeButton("Batal", null)
            .show()
    }

    private fun performLogout() {
        val intent = Intent(this, LoginAwal::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        startActivity(intent)
        finish()
        Toast.makeText(this, "Keluar berhasil", Toast.LENGTH_SHORT).show()
    }

    private fun setupDateTime() {
        val dateFormat  = SimpleDateFormat("EEEE, d MMMM yyyy", Locale.forLanguageTag("id-ID"))
        val tanggal     = dateFormat.format(Date()).uppercase(Locale.forLanguageTag("id-ID"))
        txtTanggalSekarang.text    = tanggal
        txtTanggalDiJamLayout.text = tanggal
        txtJamMasuk.text  = "07:00:00"
        txtJamPulang.text = "15:00:00"

        runnable = object : Runnable {
            override fun run() {
                val timeFormat = SimpleDateFormat("HH:mm", Locale.getDefault())
                timeFormat.timeZone = TimeZone.getTimeZone("Asia/Jakarta")
                txtWaktuLive.text = timeFormat.format(Date())
                handler.postDelayed(this, 1000)
            }
        }
        handler.post(runnable)
    }

    private fun setupKehadiranData() {
        lifecycleScope.launch {
            val result = dashboardRepository.getHomeroomDashboard()
            when (result) {
                is com.example.ritamesa.api.Result.Success -> {
                    val dashboard = result.data
                    Log.d(TAG, "Homeroom dashboard loaded: $dashboard")
                    val summary = dashboard.todaySummary
                    totalSiswa = summary?.totalStudents ?: 0
                    hadirCount = summary?.present ?: 0
                    izinCount  = summary?.excused ?: 0
                    sakitCount = summary?.sick ?: 0
                    alphaCount = summary?.absent ?: 0
                    updateKehadiranDisplay()
                }
                is com.example.ritamesa.api.Result.Error -> {
                    Log.e(TAG, "Failed to load homeroom dashboard: ${result.message}")
                    showError(result.message ?: "Gagal memuat dashboard")
                    totalSiswa = 0; hadirCount = 0; izinCount = 0; sakitCount = 0; alphaCount = 0
                    updateKehadiranDisplay()
                }
                is com.example.ritamesa.api.Result.Loading -> {}
            }
        }
    }

    private fun updateKehadiranDisplay() {
        txtNominalSiswa.text = totalSiswa.toString()
        txtHadirCount.text   = hadirCount.toString()
        txtIzinCount.text    = izinCount.toString()
        txtSakitCount.text   = sakitCount.toString()
        txtAlphaCount.text   = alphaCount.toString()
    }

    private fun setupRecyclerView() {
        // Load jadwal
        lifecycleScope.launch {
            val result = teacherRepository.getMyHomeroomSchedules()
            when (result) {
                is com.example.ritamesa.api.Result.Success -> {
                    val schedules = result.data
                    val jadwalList = schedules.mapIndexed { index, schedule ->
                        DashboardGuruActivity.JadwalItem(
                            id             = schedule.id ?: (index + 1),
                            mataPelajaran  = schedule.subjectName ?: "",
                            waktuPelajaran = "Jam ke-${index + 1}",
                            // Akses nama kelas via backtick karena 'class' adalah reserved keyword Kotlin
                            kelas          = schedule.`class` ?: "",
                            jam            = "${schedule.startTime ?: ""} - ${schedule.endTime ?: ""}",
                            idKelas        = "0",
                            idMapel        = (schedule.id ?: 0).toString()
                        )
                    }
                    val adapter = JadwalAdapter(jadwalList) { jadwal -> navigateToDetailJadwalWakel(jadwal) }
                    recyclerJadwal.layoutManager = LinearLayoutManager(this@DashboardWaliKelasActivity)
                    recyclerJadwal.adapter = adapter
                    recyclerJadwal.setHasFixedSize(true)
                }
                is com.example.ritamesa.api.Result.Error -> {
                    Log.e(TAG, "Failed to load schedules: ${result.message}")
                    recyclerJadwal.layoutManager = LinearLayoutManager(this@DashboardWaliKelasActivity)
                    recyclerJadwal.adapter = JadwalAdapter(emptyList()) {}
                }
                is com.example.ritamesa.api.Result.Loading -> {}
            }
        }

    }

    private fun navigateToDetailJadwalWakel(jadwal: DashboardGuruActivity.JadwalItem) {
        val intent = Intent(this, DetailJadwalWakelActivity::class.java).apply {
            putExtra("JADWAL_DATA", DashboardGuruActivity.JadwalData(
                mataPelajaran  = jadwal.mataPelajaran,
                kelas          = jadwal.kelas,
                jam            = jadwal.jam,
                waktuPelajaran = jadwal.waktuPelajaran
            ))
        }
        startActivity(intent)
    }

    private fun setupFooterNavigation() {
        findViewById<ImageButton>(R.id.btnHome).setOnClickListener { refreshDashboard() }
        findViewById<ImageButton>(R.id.btnCalendar).setOnClickListener {
            startActivity(Intent(this, RiwayatKehadiranKelasActivity::class.java))
        }
        findViewById<ImageButton>(R.id.btnChart).setOnClickListener {
            startActivity(Intent(this, TindakLanjutWaliKelasActivity::class.java))
        }
    }

    private fun setupKehadiranButtons() {
        findViewById<ImageButton>(R.id.button_hadir).setOnClickListener {
            Toast.makeText(this, "Siswa hadir: $hadirCount", Toast.LENGTH_SHORT).show()
        }
        findViewById<ImageButton>(R.id.button_sakit).setOnClickListener {
            Toast.makeText(this, "Detail kehadiran kelas", Toast.LENGTH_SHORT).show()
        }
        findViewById<ImageButton>(R.id.jumlah_siswa_wakel).setOnClickListener {
            Toast.makeText(this, "Total siswa: $totalSiswa", Toast.LENGTH_SHORT).show()
        }
    }

    private fun refreshDashboard() {
        setupKehadiranData()
        setupRecyclerView()
    }

    override fun onDestroy() {
        super.onDestroy()
        handler.removeCallbacks(runnable)
        executor.shutdownNow()
    }
}
