package com.example.ritamesa

import android.content.Intent
import android.graphics.Color
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.util.Log
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

class DashboardWaka : BaseNetworkActivity() {

    companion object {
        private const val TAG = "DashboardWaka"
        private const val REFRESH_INTERVAL_MS = 30_000L
    }

    // ─── VIEWS ────────────────────────────────────────────────────
    private lateinit var tvTanggal: TextView
    private lateinit var tvJam: TextView

    private var tvTotalSiswa:   TextView? = null
    private var tvTotalGuru:    TextView? = null
    private var tvTotalKelas:   TextView? = null
    private var tvTotalJurusan: TextView? = null

    private var tvHadir:     TextView? = null
    private var tvTerlambat: TextView? = null
    private var tvIzin:      TextView? = null
    private var tvSakit:     TextView? = null
    private var tvAlpha:     TextView? = null
    private var tvPulang:    TextView? = null

    private var barChart: BarChart? = null

    private val handler   = Handler(Looper.getMainLooper())
    private var isRunning = true
    private var lastRefresh = 0L

    // ─── LIFECYCLE ────────────────────────────────────────────────

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.dashboard_waka)

        initViews()
        setupNavigation()
        setupProfile()
        startClock()
        loadAllData()
    }

    override fun onResume() {
        super.onResume()
        loadAllData()
    }

    override fun onDestroy() {
        super.onDestroy()
        isRunning = false
        handler.removeCallbacksAndMessages(null)
    }

    // ─── INIT VIEWS ───────────────────────────────────────────────

    private fun initViews() {
        tvTanggal = findViewById(R.id.textView9)
        tvJam     = findViewById(R.id.textView21)

        tvTotalSiswa   = safeFind(R.id.textView12)
        tvTotalGuru    = safeFind(R.id.textView16)
        tvTotalJurusan = safeFind(R.id.textView17)
        tvTotalKelas   = safeFind(R.id.textView18)

        tvHadir     = safeFind(R.id.tvTepatWaktuDashboard)
        tvTerlambat = safeFind(R.id.tvTerlambatDashboard)
        tvIzin      = safeFind(R.id.tvIzinDashboard)
        tvSakit     = safeFind(R.id.tvSakitDashboard)
        tvAlpha     = safeFind(R.id.tvAlphaDashboard)
        tvPulang    = safeFind(R.id.tvPulang)

        barChart    = safeFind(R.id.barChartBulanan)
        lastRefresh = System.currentTimeMillis()
    }

    private fun <T : android.view.View> safeFind(id: Int): T? = try { findViewById(id) } catch (_: Exception) { null }

    // ─── LOAD DATA ────────────────────────────────────────────────

    private fun loadAllData() {
        lifecycleScope.launch {
            loadTotalStats()
            loadAttendanceToday()
        }
    }

    /**
     * Total siswa / guru / kelas / jurusan dari GET /api/admin/summary
     */
    private suspend fun loadTotalStats() {
        when (val result = dashboardRepository.getAdminDashboard()) {
            is com.example.ritamesa.api.Result.Success -> {
                val d = result.data
                tvTotalSiswa?.text   = (d.totalStudents ?: 0).toString()
                tvTotalGuru?.text    = (d.totalTeachers ?: 0).toString()
                tvTotalKelas?.text   = (d.totalClasses  ?: 0).toString()
                tvTotalJurusan?.text = (d.majorsCount   ?: 0).toString()
                Log.d(TAG, "Stats: siswa=${d.totalStudents} guru=${d.totalTeachers}")
            }
            is com.example.ritamesa.api.Result.Error -> {
                Log.e(TAG, "Gagal load stats: ${result.message}")
                listOf(tvTotalSiswa, tvTotalGuru, tvTotalKelas, tvTotalJurusan).forEach { it?.text = "0" }
            }
            else -> {}
        }
    }

    /**
     * Statistik kehadiran hari ini dari GET /api/waka/attendance/summary
     *
     * FIX: dashboardRepository.getWakaAttendanceSummary() sekarang memanggil
     * endpoint dengan return type WakaAttendanceSummaryResponse (FLAT),
     * lalu dikonversi ke AttendanceSummary via .toAttendanceSummary().
     * Sebelumnya selalu 0 karena mismatch tipe Response<ApiResponse<AttendanceSummary>>.
     */
    private suspend fun loadAttendanceToday() {
        val today = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())

        when (val result = dashboardRepository.getWakaAttendanceSummary(startDate = today, endDate = today)) {
            is com.example.ritamesa.api.Result.Success -> {
                val s = result.data
                val hadir     = s.present ?: 0
                val terlambat = s.late    ?: 0
                val izin      = s.excused ?: 0
                val sakit     = s.sick    ?: 0
                val alpha     = s.absent  ?: 0

                tvHadir?.text     = hadir.toString()
                tvTerlambat?.text = terlambat.toString()
                tvIzin?.text      = izin.toString()
                tvSakit?.text     = sakit.toString()
                tvAlpha?.text     = alpha.toString()
                tvPulang?.text    = "0"

                Log.d(TAG, "Attendance: hadir=$hadir telat=$terlambat izin=$izin sakit=$sakit alpha=$alpha")
                setupBarChart(hadir, terlambat, izin, sakit, alpha)
            }
            is com.example.ritamesa.api.Result.Error -> {
                Log.e(TAG, "Gagal load attendance: ${result.message}")
                listOf(tvHadir, tvTerlambat, tvIzin, tvSakit, tvAlpha, tvPulang).forEach { it?.text = "0" }
                setupBarChart(0, 0, 0, 0, 0)
            }
            else -> {}
        }
    }

    // ─── BAR CHART ────────────────────────────────────────────────

    private fun setupBarChart(hadir: Int, terlambat: Int, izin: Int, sakit: Int, alpha: Int) {
        val chart = barChart ?: return

        val labels  = arrayOf("Hadir", "Izin", "Pulang", "Alpha", "Sakit")
        val entries = listOf(
            BarEntry(0f, hadir.toFloat()),
            BarEntry(1f, izin.toFloat()),
            BarEntry(2f, 0f),
            BarEntry(3f, alpha.toFloat()),
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

        val maxVal = maxOf(hadir, izin, alpha, sakit)

        chart.apply {
            data = BarData(dataSet).apply { barWidth = 0.5f }
            description.isEnabled = false

            xAxis.apply {
                valueFormatter = object : ValueFormatter() {
                    override fun getFormattedValue(value: Float) = labels.getOrNull(value.toInt()) ?: ""
                }
                position        = XAxis.XAxisPosition.BOTTOM
                granularity     = 1f
                labelCount      = labels.size
                setDrawGridLines(false)
                axisMinimum     = -0.5f
                axisMaximum     = labels.size - 0.5f
                textSize        = 10f
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
        handler.post(object : Runnable {
            override fun run() {
                if (!isRunning) return
                val now = Date()
                tvTanggal.text = SimpleDateFormat("EEEE, dd MMMM yyyy", Locale.forLanguageTag("id-ID")).format(now)
                tvJam.text     = SimpleDateFormat("HH:mm:ss", Locale.getDefault()).format(now)
                try { safeFind<TextView>(R.id.textView20)?.text = tvTanggal.text } catch (_: Exception) {}

                val nowMs = System.currentTimeMillis()
                if (nowMs - lastRefresh >= REFRESH_INTERVAL_MS) {
                    loadAllData()
                    lastRefresh = nowMs
                }
                handler.postDelayed(this, 1000)
            }
        })
    }

    // ─── NAVIGASI ─────────────────────────────────────────────────

    private fun setupNavigation() {
        safeFind<ImageButton>(R.id.imageButton2)?.setOnClickListener {
            Toast.makeText(this, "Sudah di Dashboard Waka", Toast.LENGTH_SHORT).show()
        }
        safeNav(R.id.imageButton3) { Intent(this, DataRekapKehadiranGuru::class.java) }
        safeNav(R.id.imageButton4) { Intent(this, JadwalPembelajaranGuru::class.java) }
        safeNav(R.id.imageButton5) { Intent(this, StatistikWakaa::class.java) }
        safeNav(R.id.imageButton87) { Intent(this, RiwayatKehadiranGuru1::class.java) }
        safeNav(R.id.btnLihatDispen) { Intent(this, PersetujuanDispensasi::class.java) }
    }

    private fun safeNav(id: Int, block: () -> Intent) {
        safeFind<ImageButton>(id)?.setOnClickListener {
            try { startActivity(block()) }
            catch (_: Exception) { Toast.makeText(this, "Halaman belum tersedia", Toast.LENGTH_SHORT).show() }
        }
    }

    private fun setupProfile() {
        safeFind<ImageButton>(R.id.profile)?.setOnClickListener { view ->
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
                        R.id.menu_cancel     -> { Toast.makeText(this@DashboardWaka, "Dibatalkan", Toast.LENGTH_SHORT).show(); true }
                        R.id.menu_ganti_foto -> { safeNav(0) { Intent(this@DashboardWaka, EditLogin::class.java) }; true }
                        else -> false
                    }
                }
                show()
            }
        }
    }

    private fun showLogoutConfirmation() {
        android.app.AlertDialog.Builder(this)
            .setTitle("Konfirmasi Logout")
            .setMessage("Yakin ingin logout dari akun Wakil Kepala Sekolah?")
            .setPositiveButton("Ya, Logout") { _, _ ->
                startActivity(Intent(this, LoginAwal::class.java).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                })
                finish()
            }
            .setNegativeButton("Batal", null)
            .show()
    }
}