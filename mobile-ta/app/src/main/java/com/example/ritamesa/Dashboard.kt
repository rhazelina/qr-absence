package com.example.ritamesa

import android.content.Intent
import android.graphics.Color
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.Gravity
import android.view.View
import android.widget.ImageButton
import android.widget.PopupMenu
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.lifecycle.lifecycleScope
import com.github.mikephil.charting.charts.BarChart
import com.github.mikephil.charting.components.XAxis
import com.github.mikephil.charting.components.YAxis
import com.github.mikephil.charting.data.BarData
import com.github.mikephil.charting.data.BarDataSet
import com.github.mikephil.charting.data.BarEntry
import com.github.mikephil.charting.formatter.ValueFormatter
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

class Dashboard : BaseNetworkActivity() {

    companion object {
        private const val TAG = "DashboardAdmin"
    }

    private lateinit var tvTanggal: TextView
    private lateinit var tvJam: TextView
    private lateinit var tvTotalSiswa: TextView
    private lateinit var tvTotalGuru: TextView
    private lateinit var tvTotalJurusan: TextView
    private lateinit var tvTotalKelas: TextView
    private lateinit var tvHadir: TextView
    private lateinit var tvTerlambat: TextView
    private lateinit var tvIzin: TextView
    private lateinit var tvSakit: TextView
    private lateinit var tvAlpha: TextView
    private lateinit var tvPulang: TextView
    private lateinit var barChart: BarChart
    private lateinit var tvDateCard: TextView

    private val handler = Handler(Looper.getMainLooper())
    private var isRunning = true
    private var lastUpdateTime: Long = 0

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.dashboard)

        // ===== INISIALISASI VIEW =====
        tvTanggal = findViewById(R.id.textView9)
        tvJam = findViewById(R.id.textView21)
        tvTotalSiswa = findViewById(R.id.textView12)
        tvTotalGuru = findViewById(R.id.textView16)
        tvTotalJurusan = findViewById(R.id.textView17)
        tvTotalKelas = findViewById(R.id.textView18)
        tvDateCard = findViewById(R.id.textView20)

        tvHadir = findViewById(R.id.tvTepatWaktuDashboard)
        tvTerlambat = findViewById(R.id.tvTerlambatDashboard)
        tvIzin = findViewById(R.id.tvIzinDashboard)
        tvSakit = findViewById(R.id.tvSakitDashboard)
        tvAlpha = findViewById(R.id.tvAlphaDashboard)
        tvPulang = findViewById(R.id.tvPulang)

        barChart = findViewById(R.id.barChartBulanan)

        updateTanggalJam()
        updateDataStatistik()

        // ===== PROFILE POPUP MENU =====
        findViewById<ImageButton>(R.id.profile).setOnClickListener { view ->
            showProfileMenu(view)
        }

        // ===== NAVIGASI LAINNYA =====
        findViewById<ImageButton>(R.id.imageButton2).setOnClickListener {
            // HOME - sudah di dashboard
            Toast.makeText(this, "Dashboard", Toast.LENGTH_SHORT).show()
        }

        findViewById<ImageButton>(R.id.imageButton3).setOnClickListener {
            startActivity(Intent(this, RekapKehadiranSiswa::class.java))
        }

        findViewById<ImageButton>(R.id.imageButton4).setOnClickListener {
            startActivity(Intent(this, StatistikKehadiran::class.java))
        }

        findViewById<ImageButton>(R.id.imageButton87).setOnClickListener {
            startActivity(Intent(this, RiwayatKehadiranSiswa::class.java))
        }

        findViewById<ImageButton>(R.id.imageView16).setOnClickListener {
            startActivity(Intent(this, TotalGuru::class.java))
        }

        findViewById<ImageButton>(R.id.imageView17).setOnClickListener {
            startActivity(Intent(this, TotalJurusan::class.java))
        }

        findViewById<ImageButton>(R.id.imageView18).setOnClickListener {
            startActivity(Intent(this, TotalKelas::class.java))
        }

        findViewById<ImageButton>(R.id.imageView6).setOnClickListener {
            startActivity(Intent(this, TotalSiswa::class.java))
        }
    }

    // ===== PROFILE MENU DENGAN 3 PILIHAN =====
    private fun showProfileMenu(view: android.view.View) {
        val popupMenu = PopupMenu(this, view)
        popupMenu.menuInflater.inflate(R.menu.profile_simple, popupMenu.menu)

        // Custom background untuk menu
        try {
            val fieldMPopup = PopupMenu::class.java.getDeclaredField("mPopup")
            fieldMPopup.isAccessible = true
            val mPopup = fieldMPopup.get(popupMenu)
            mPopup.javaClass
                .getDeclaredMethod("setForceShowIcon", Boolean::class.java)
                .invoke(mPopup, true)
        } catch (e: Exception) {
            e.printStackTrace()
        }

        popupMenu.setOnMenuItemClickListener { menuItem ->
            when (menuItem.itemId) {
                R.id.menu_logout -> {
                    showLogoutConfirmation()
                    true
                }
                R.id.menu_cancel -> {
                    Toast.makeText(this, "Dibatalkan", Toast.LENGTH_SHORT).show()
                    true
                }
                R.id.menu_ganti_foto -> {
                    // BUKA HALAMAN EDIT TAMPILAN LOGIN
                    val intent = Intent(this, EditLogin::class.java)
                    startActivity(intent)
                    true
                }
                else -> false
            }
        }

        popupMenu.show()
    }

    private fun showLogoutConfirmation() {
        android.app.AlertDialog.Builder(this)
            .setTitle("Konfirmasi Logout")
            .setMessage("Yakin ingin logout dari akun Admin?")
            .setPositiveButton("Ya, Logout") { _, _ ->
                performLogout()
            }
            .setNegativeButton("Batal", null)
            .show()
    }

    private fun performLogout() {
        val intent = Intent(this, LoginAwal::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        startActivity(intent)
        finish()
        Toast.makeText(this, "Logout berhasil", Toast.LENGTH_SHORT).show()
    }

    // ===== FUNGSI LAINNYA =====
    private fun loadDashboardData() {
        lifecycleScope.launch {
            val result = dashboardRepository.getAdminDashboard()
            
            when (result) {
                is com.example.ritamesa.api.Result.Success -> {
                    val dashboard = result.data
                    Log.d(TAG, "Admin dashboard loaded: $dashboard")
                    
                    // Update totals from API
                    tvTotalSiswa.text = (dashboard.totalStudents ?: 0).toString()
                    tvTotalGuru.text = (dashboard.totalTeachers ?: 0).toString()
                    tvTotalKelas.text = (dashboard.totalClasses ?: 0).toString()
                    tvTotalJurusan.text = (dashboard.majorsCount ?: 0).toString()
                }
                is com.example.ritamesa.api.Result.Error -> {
                    Log.e(TAG, "Failed to load dashboard: ${result.message}")
                    showError(result.message ?: "Gagal memuat dashboard")
                    tvTotalSiswa.text = "0"
                    tvTotalGuru.text = "0"
                    tvTotalKelas.text = "0"
                    tvTotalJurusan.text = "0"
                }
                is com.example.ritamesa.api.Result.Loading -> { }
            }

            // Load attendance summary for today
            loadAttendanceSummary()
        }
    }

    private fun loadAttendanceSummary() {
        lifecycleScope.launch {
            val today = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
            val result = attendanceRepository.getAttendanceSummary(startDate = today, endDate = today)

            when (result) {
                is com.example.ritamesa.api.Result.Success -> {
                    val summary = result.data
                    tvHadir.text = (summary.present ?: 0).toString()
                    tvTerlambat.text = (summary.late ?: 0).toString()
                    tvIzin.text = (summary.excused ?: 0).toString()
                    tvSakit.text = (summary.sick ?: 0).toString()
                    tvAlpha.text = (summary.absent ?: 0).toString()
                    tvPulang.text = "0"

                    setupChartHariIni()
                }
                is com.example.ritamesa.api.Result.Error -> {
                    Log.e(TAG, "Failed to load attendance summary: ${result.message}")
                    tvHadir.text = "0"
                    tvTerlambat.text = "0"
                    tvIzin.text = "0"
                    tvSakit.text = "0"
                    tvAlpha.text = "0"
                    tvPulang.text = "0"
                    setupChartHariIni()
                }
                is com.example.ritamesa.api.Result.Loading -> { }
            }
        }
    }

    private fun updateDataStatistik() {
        loadDashboardData()
    }

    private fun setupChartHariIni() {
        val hadir = tvHadir.text.toString().toIntOrNull() ?: 0
        val izin = tvIzin.text.toString().toIntOrNull() ?: 0
        val pulang = tvPulang.text.toString().toIntOrNull() ?: 0
        val tidakHadir = tvAlpha.text.toString().toIntOrNull() ?: 0
        val sakit = tvSakit.text.toString().toIntOrNull() ?: 0

        val labels = arrayOf("Hadir", "Izin", "Pulang", "Alfa", "Sakit")
        val entries = mutableListOf<BarEntry>()
        entries.add(BarEntry(0f, hadir.toFloat()))
        entries.add(BarEntry(1f, izin.toFloat()))
        entries.add(BarEntry(2f, pulang.toFloat()))
        entries.add(BarEntry(3f, tidakHadir.toFloat()))
        entries.add(BarEntry(4f, sakit.toFloat()))

        val warnaStatus = listOf(
            Color.parseColor("#4CAF50"),
            Color.parseColor("#A1B324"),
            Color.parseColor("#1976D2"),
            Color.parseColor("#B1170F"),
            Color.parseColor("#741781")
        )

        val dataSet = BarDataSet(entries, "Kehadiran Hari Ini").apply {
            colors = warnaStatus
            valueTextSize = 12f
            valueTextColor = Color.BLACK
        }

        val barData = BarData(dataSet).apply {
            barWidth = 0.5f
            setValueFormatter(object : ValueFormatter() {
                override fun getFormattedValue(value: Float): String {
                    return value.toInt().toString()
                }
            })
        }

        barChart.apply {
            data = barData
            description.isEnabled = false

            xAxis.apply {
                valueFormatter = object : ValueFormatter() {
                    override fun getFormattedValue(value: Float): String {
                        return labels.getOrNull(value.toInt()) ?: ""
                    }
                }
                position = XAxis.XAxisPosition.BOTTOM
                granularity = 1f
                setDrawGridLines(false)
                labelCount = labels.size
                textSize = 10f
                axisMinimum = -0.5f
                axisMaximum = labels.size - 0.5f
            }

            axisLeft.apply {
                axisMinimum = 0f
                granularity = 10f
                setDrawGridLines(true)
                textSize = 10f
                val maxValue = maxOf(hadir, izin, pulang, tidakHadir, sakit)
                axisMaximum = (maxValue + 10).toFloat()
            }

            axisRight.isEnabled = false
            legend.isEnabled = true
            legend.textSize = 10f
            legend.formSize = 10f

            setTouchEnabled(true)
            setPinchZoom(false)
            setDrawGridBackground(false)
            setDrawBarShadow(false)
            setDrawValueAboveBar(true)
            setDragEnabled(false)
            setScaleEnabled(false)
            setDoubleTapToZoomEnabled(false)

            animateY(1000)
            invalidate()
        }
    }

    private fun updateTanggalJam() {
        isRunning = true
        handler.post(object : Runnable {
            override fun run() {
                if (!isRunning) return

                val tanggalFormat = SimpleDateFormat(
                    "EEEE, dd MMMM yyyy",
                    Locale.forLanguageTag("id-ID")
                )
                val jamFormat = SimpleDateFormat(
                    "HH:mm:ss",
                    Locale.getDefault()
                )

                val now = Date()
                val tanggal = tanggalFormat.format(now)
                val jam = jamFormat.format(now)

                tvTanggal.text = tanggal
                tvJam.text = jam
                tvDateCard.text = tanggal

                val currentTime = System.currentTimeMillis()
                if (currentTime - lastUpdateTime >= 30000) {
                    updateDataStatistik()
                    lastUpdateTime = currentTime
                }

                handler.postDelayed(this, 1000)
            }
        })
    }

    override fun onDestroy() {
        super.onDestroy()
        isRunning = false
        handler.removeCallbacksAndMessages(null)
    }

    override fun onResume() {
        super.onResume()
        updateDataStatistik()
    }
}