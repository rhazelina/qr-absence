package com.example.ritamesa

import android.content.Intent
import android.graphics.Color
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.View
import android.widget.ImageButton
import android.widget.PopupMenu
import android.widget.TextView
import android.widget.Toast
import androidx.lifecycle.lifecycleScope
import com.github.mikephil.charting.charts.BarChart
import com.github.mikephil.charting.components.XAxis
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
        private const val REFRESH_INTERVAL_MS = 30_000L
    }

    private lateinit var tvTanggal:     TextView
    private lateinit var tvJam:         TextView
    private lateinit var tvTotalSiswa:  TextView
    private lateinit var tvTotalGuru:   TextView
    private lateinit var tvTotalJurusan:TextView
    private lateinit var tvTotalKelas:  TextView
    private lateinit var tvHadir:       TextView
    private lateinit var tvTerlambat:   TextView
    private lateinit var tvIzin:        TextView
    private lateinit var tvSakit:       TextView
    private lateinit var tvAlpha:       TextView
    private lateinit var tvPulang:      TextView
    private lateinit var barChart:      BarChart
    private lateinit var tvDateCard:    TextView

    private val handler   = Handler(Looper.getMainLooper())
    private var isRunning = true
    private var lastRefresh = 0L

    // ─── LIFECYCLE ────────────────────────────────────────────────

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.dashboard)

        initViews()
        startClock()
        loadAllData()
        setupClickListeners()
    }

    override fun onResume() {
        super.onResume()
        // Tidak auto-reload di onResume agar tidak dobel dengan clock ticker
    }

    override fun onDestroy() {
        super.onDestroy()
        isRunning = false
        handler.removeCallbacksAndMessages(null)
    }

    // ─── INIT VIEWS ───────────────────────────────────────────────

    private fun initViews() {
        tvTanggal      = findViewById(R.id.textView9)
        tvJam          = findViewById(R.id.textView21)
        tvTotalSiswa   = findViewById(R.id.textView12)
        tvTotalGuru    = findViewById(R.id.textView16)
        tvTotalJurusan = findViewById(R.id.textView17)
        tvTotalKelas   = findViewById(R.id.textView18)
        tvDateCard     = findViewById(R.id.textView20)

        tvHadir     = findViewById(R.id.tvTepatWaktuDashboard)
        tvTerlambat = findViewById(R.id.tvTerlambatDashboard)
        tvIzin      = findViewById(R.id.tvIzinDashboard)
        tvSakit     = findViewById(R.id.tvSakitDashboard)
        tvAlpha     = findViewById(R.id.tvAlphaDashboard)
        tvPulang    = findViewById(R.id.tvPulang)

        barChart    = findViewById(R.id.barChartBulanan)
        lastRefresh = System.currentTimeMillis()
    }

    // ─── LOAD DATA ────────────────────────────────────────────────

    private fun loadAllData() {
        lifecycleScope.launch {
            loadTotalStats()
            loadAttendanceSummary()
        }
    }

    private suspend fun loadTotalStats() {
        when (val result = dashboardRepository.getAdminDashboard()) {
            is com.example.ritamesa.api.Result.Success -> {
                val d = result.data
                tvTotalSiswa.text   = (d.totalStudents ?: 0).toString()
                tvTotalGuru.text    = (d.totalTeachers ?: 0).toString()
                tvTotalKelas.text   = (d.totalClasses  ?: 0).toString()
                tvTotalJurusan.text = (d.majorsCount   ?: 0).toString()
            }
            is com.example.ritamesa.api.Result.Error -> {
                Log.e(TAG, "Gagal load stats: ${result.message}")
                tvTotalSiswa.text   = "0"
                tvTotalGuru.text    = "0"
                tvTotalKelas.text   = "0"
                tvTotalJurusan.text = "0"
            }
            else -> {}
        }
    }

    /**
     * Statistik kehadiran hari ini via GET /api/attendance/summary
     * Endpoint ini return ApiResponse<AttendanceSummary> — normal wrapper.
     */
    private suspend fun loadAttendanceSummary() {
        val today = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())

        // FIX: gunakan getAttendanceSummaryRaw() yang parse FLAT response
        when (val result = attendanceRepository.getAttendanceSummaryRaw(startDate = today, endDate = today)) {
            is com.example.ritamesa.api.Result.Success -> {
                val s = result.data
                tvHadir.text     = (s.present ?: 0).toString()
                tvTerlambat.text = (s.late    ?: 0).toString()
                tvIzin.text      = (s.excused ?: 0).toString()
                tvSakit.text     = (s.sick    ?: 0).toString()
                tvAlpha.text     = (s.absent  ?: 0).toString()
                tvPulang.text    = "0"

                setupChartHariIni(
                    hadir      = s.present ?: 0,
                    izin       = s.excused ?: 0,
                    pulang     = 0,
                    tidakHadir = s.absent  ?: 0,
                    sakit      = s.sick    ?: 0
                )
            }
            is com.example.ritamesa.api.Result.Error -> {
                Log.e(TAG, "Gagal load attendance: ${result.message}")
                resetAttendanceViews()
            }
            else -> {}
        }
    }

    private fun resetAttendanceViews() {
        tvHadir.text = "0"; tvTerlambat.text = "0"; tvIzin.text = "0"
        tvSakit.text = "0"; tvAlpha.text = "0"; tvPulang.text = "0"
        setupChartHariIni(0, 0, 0, 0, 0)
    }

    // ─── BAR CHART ────────────────────────────────────────────────

    private fun setupChartHariIni(
        hadir: Int, izin: Int, pulang: Int, tidakHadir: Int, sakit: Int
    ) {
        val labels  = arrayOf("Hadir", "Izin", "Pulang", "Alpha", "Sakit")
        val entries = listOf(
            BarEntry(0f, hadir.toFloat()),
            BarEntry(1f, izin.toFloat()),
            BarEntry(2f, pulang.toFloat()),
            BarEntry(3f, tidakHadir.toFloat()),
            BarEntry(4f, sakit.toFloat())
        )
        val colors = listOf(
            Color.parseColor("#4CAF50"),
            Color.parseColor("#A1B324"),
            Color.parseColor("#1976D2"),
            Color.parseColor("#B1170F"),
            Color.parseColor("#741781")
        )

        val dataSet = BarDataSet(entries, "Kehadiran Hari Ini").apply {
            this.colors    = colors
            valueTextSize  = 12f
            valueTextColor = Color.BLACK
            setValueFormatter(object : ValueFormatter() {
                override fun getFormattedValue(value: Float) =
                    if (value > 0) value.toInt().toString() else ""
            })
        }

        val maxVal = maxOf(hadir, izin, pulang, tidakHadir, sakit)

        barChart.apply {
            data = BarData(dataSet).apply { barWidth = 0.5f }
            description.isEnabled = false

            xAxis.apply {
                valueFormatter = object : ValueFormatter() {
                    override fun getFormattedValue(value: Float) = labels.getOrNull(value.toInt()) ?: ""
                }
                position        = XAxis.XAxisPosition.BOTTOM
                granularity     = 1f
                setDrawGridLines(false)
                labelCount      = labels.size
                textSize        = 10f
                axisMinimum     = -0.5f
                axisMaximum     = labels.size - 0.5f
            }

            axisLeft.apply {
                axisMinimum = 0f
                axisMaximum = (maxVal + 10).toFloat().coerceAtLeast(10f)
                granularity = 1f
                setDrawGridLines(true)
                textSize    = 10f
                setValueFormatter(object : ValueFormatter() {
                    override fun getFormattedValue(value: Float) = value.toInt().toString()
                })
            }

            axisRight.isEnabled = false
            legend.isEnabled    = true
            legend.textSize     = 10f

            setTouchEnabled(true)
            setPinchZoom(false)
            setScaleEnabled(false)
            setDrawGridBackground(false)
            setDrawBarShadow(false)
            setDrawValueAboveBar(true)
            setDragEnabled(false)
            setDoubleTapToZoomEnabled(false)

            animateY(800)
            invalidate()
        }
    }

    // ─── JAM & TANGGAL ────────────────────────────────────────────

    private fun startClock() {
        isRunning = true
        val sdfTanggal = SimpleDateFormat("EEEE, dd MMMM yyyy", Locale.forLanguageTag("id-ID"))
        val sdfJam     = SimpleDateFormat("HH:mm:ss", Locale.getDefault())

        handler.post(object : Runnable {
            override fun run() {
                if (!isRunning) return
                val now = Date()
                tvTanggal.text  = sdfTanggal.format(now)
                tvJam.text      = sdfJam.format(now)
                tvDateCard.text = tvTanggal.text

                val nowMs = System.currentTimeMillis()
                if (nowMs - lastRefresh >= REFRESH_INTERVAL_MS) {
                    loadAllData()
                    lastRefresh = nowMs
                }
                handler.postDelayed(this, 1000)
            }
        })
    }

    // ─── CLICK LISTENERS ──────────────────────────────────────────

    private fun setupClickListeners() {
        safeNav(R.id.profile) { showProfileMenu(it); null }

        safeClick(R.id.imageButton2) {
            Toast.makeText(this, "Dashboard", Toast.LENGTH_SHORT).show()
        }
        safeNav(R.id.imageButton3)  { startActivity(Intent(this, RekapKehadiranSiswa::class.java)); null }
        safeNav(R.id.imageButton4)  { startActivity(Intent(this, StatistikKehadiran::class.java)); null }
        safeNav(R.id.imageButton87) { startActivity(Intent(this, RiwayatKehadiranSiswa::class.java)); null }
        safeNav(R.id.imageView16)   { startActivity(Intent(this, TotalGuru::class.java)); null }
        safeNav(R.id.imageView17)   { startActivity(Intent(this, TotalJurusan::class.java)); null }
        safeNav(R.id.imageView18)   { startActivity(Intent(this, TotalKelas::class.java)); null }
        safeNav(R.id.imageView6)    { startActivity(Intent(this, TotalSiswa::class.java)); null }
    }

    private fun safeClick(id: Int, action: () -> Unit) {
        try { findViewById<View>(id)?.setOnClickListener { action() } } catch (_: Exception) {}
    }

    private fun safeNav(id: Int, action: (View) -> Unit?) {
        try { findViewById<View>(id)?.setOnClickListener { action(it) } } catch (_: Exception) {}
    }

    // ─── PROFILE MENU ─────────────────────────────────────────────

    private fun showProfileMenu(view: View) {
        PopupMenu(this, view).apply {
            menuInflater.inflate(R.menu.profile_simple, menu)
            try {
                val f = PopupMenu::class.java.getDeclaredField("mPopup")
                f.isAccessible = true
                f.get(this).javaClass.getDeclaredMethod("setForceShowIcon", Boolean::class.java)
                    .invoke(f.get(this), true)
            } catch (_: Exception) {}
            setOnMenuItemClickListener { item ->
                when (item.itemId) {
                    R.id.menu_logout     -> { showLogoutConfirmation(); true }
                    R.id.menu_cancel     -> { Toast.makeText(this@Dashboard, "Dibatalkan", Toast.LENGTH_SHORT).show(); true }
                    R.id.menu_ganti_foto -> { startActivity(Intent(this@Dashboard, EditLogin::class.java)); true }
                    else -> false
                }
            }
            show()
        }
    }

    private fun showLogoutConfirmation() {
        android.app.AlertDialog.Builder(this)
            .setTitle("Konfirmasi untuk keluar?")
            .setMessage("Yakin ingin keluar dari akun Admin?")
            .setPositiveButton("Ya, keluar") { _, _ ->
                startActivity(Intent(this, LoginAwal::class.java).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                })
                finish()
                Toast.makeText(this, "Berhasil Keluar", Toast.LENGTH_SHORT).show()
            }
            .setNegativeButton("Batal", null)
            .show()
    }
}