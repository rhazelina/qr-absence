package com.example.ritamesa

import android.content.Intent
import android.graphics.Color
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.view.View
import android.widget.ImageButton
import android.widget.PopupMenu
import android.widget.TextView
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.core.content.FileProvider
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.lifecycle.lifecycleScope
import com.github.mikephil.charting.charts.BarChart
import com.github.mikephil.charting.charts.PieChart
import com.github.mikephil.charting.components.Legend
import com.github.mikephil.charting.components.XAxis
import com.github.mikephil.charting.data.BarData
import com.github.mikephil.charting.data.BarDataSet
import com.github.mikephil.charting.data.BarEntry
import com.github.mikephil.charting.data.PieData
import com.github.mikephil.charting.data.PieDataSet
import com.github.mikephil.charting.data.PieEntry
import com.github.mikephil.charting.formatter.IndexAxisValueFormatter
import com.github.mikephil.charting.formatter.ValueFormatter
import kotlinx.coroutines.launch
import java.io.File
import java.io.FileWriter
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale

class StatistikWakaa : BaseNetworkActivity() {

    private lateinit var barChart: BarChart
    private lateinit var pieChart: PieChart

    private var currentMode: String      = "SEMUA"
    private var currentTimeRange: String = "HARIAN"

    // ─── Data cache ───────────────────────────────────────────────
    private var cachedHadir       = 0f
    private var cachedTerlambat   = 0f
    private var cachedIzin        = 0f
    private var cachedSakit       = 0f
    private var cachedAlpha       = 0f
    private var cachedTotal       = 0
    private var cachedAttendanceRate = 0f

    // ─── LIFECYCLE ────────────────────────────────────────────────

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.statistik_wakaa)

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val sys = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(sys.left, sys.top, sys.right, sys.bottom)
            insets
        }

        barChart = findViewById(R.id.barChart)
        pieChart = findViewById(R.id.pieChart)

        setupBarChartStyle()
        setupPieChartStyle()
        setupNavigation()
        setupFilterDropdown()
        setupTimeFilterDropdown()
        setupExportButton()

        // Load data saat pertama buka
        loadAttendanceDataFromApi()
    }

    // ─── CHART SETUP (style saja, tidak load data) ────────────────

    private fun setupBarChartStyle() {
        barChart.apply {
            description.isEnabled = false
            setDrawGridBackground(false)
            setDrawBarShadow(false)
            setDrawValueAboveBar(true)
            setFitBars(true)
            setScaleEnabled(false)
            setPinchZoom(false)
            setDoubleTapToZoomEnabled(false)
            extraBottomOffset = 15f
            extraTopOffset    = 15f

            xAxis.apply {
                position         = XAxis.XAxisPosition.BOTTOM
                granularity      = 1f
                axisMinimum      = -0.5f
                axisMaximum      = 5.5f
                setDrawGridLines(false)
                valueFormatter   = IndexAxisValueFormatter(arrayOf("Hadir","Terlambat","Izin","Sakit","Alpha","—"))
                textSize         = 10f
                textColor        = Color.BLACK
                labelRotationAngle = -15f
            }

            axisLeft.apply {
                axisMinimum  = 0f
                granularity  = 1f
                textSize     = 11f
                textColor    = Color.BLACK
                setDrawGridLines(true)
                gridColor    = Color.parseColor("#E0E0E0")
                // Formatter: tampilkan angka bulat (jumlah orang, bukan persen)
                valueFormatter = object : ValueFormatter() {
                    override fun getFormattedValue(value: Float) = value.toInt().toString()
                }
            }

            axisRight.isEnabled = false

            legend.apply {
                isEnabled           = true
                verticalAlignment   = Legend.LegendVerticalAlignment.TOP
                horizontalAlignment = Legend.LegendHorizontalAlignment.CENTER
                orientation         = Legend.LegendOrientation.HORIZONTAL
                setDrawInside(false)
                textSize  = 10f
                textColor = Color.BLACK
                form      = Legend.LegendForm.SQUARE
                formSize  = 9f
            }
        }
    }

    private fun setupPieChartStyle() {
        pieChart.apply {
            description.isEnabled    = false
            isRotationEnabled        = true
            setDrawHoleEnabled(true)
            setHoleColor(Color.WHITE)
            holeRadius               = 40f
            transparentCircleRadius  = 45f
            setDrawCenterText(true)
            setEntryLabelColor(Color.BLACK)
            setEntryLabelTextSize(10f)

            legend.apply {
                isEnabled           = true
                verticalAlignment   = Legend.LegendVerticalAlignment.CENTER
                horizontalAlignment = Legend.LegendHorizontalAlignment.RIGHT
                orientation         = Legend.LegendOrientation.VERTICAL
                setDrawInside(false)
                textSize  = 10f
                textColor = Color.BLACK
                form      = Legend.LegendForm.CIRCLE
                formSize  = 9f
            }
        }
    }

    // ─── LOAD DATA FROM API ───────────────────────────────────────

    /**
     * FIX UTAMA: dashboardRepository.getWakaAttendanceSummary() sekarang
     * memanggil endpoint yang mengembalikan WakaAttendanceSummaryResponse (FLAT),
     * lalu dikonversi ke AttendanceSummary via .toAttendanceSummary().
     *
     * Sebelumnya selalu null karena mismatch tipe response.
     */
    private fun loadAttendanceDataFromApi() {
        setLoadingState(true)

        val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        val cal = Calendar.getInstance()
        val endDate = sdf.format(cal.time)

        when (currentTimeRange) {
            "MINGGUAN" -> cal.add(Calendar.DAY_OF_YEAR, -7)
            "BULANAN"  -> cal.add(Calendar.MONTH, -1)
            // HARIAN: startDate = endDate (hari ini)
        }
        val startDate = sdf.format(cal.time)

        lifecycleScope.launch {
            try {
                val result = dashboardRepository.getWakaAttendanceSummary(
                    startDate = startDate,
                    endDate   = endDate
                )

                handleResult(result,
                    onSuccess = { summary ->
                        // FIX: simpan nilai JUMLAH (count), bukan persentase
                        cachedHadir     = (summary.present  ?: 0).toFloat()
                        cachedTerlambat = (summary.late     ?: 0).toFloat()
                        cachedIzin      = (summary.excused  ?: 0).toFloat()
                        cachedSakit     = (summary.sick     ?: 0).toFloat()
                        cachedAlpha     = (summary.absent   ?: 0).toFloat()
                        cachedTotal     = summary.totalStudents ?: 0
                        cachedAttendanceRate = summary.attendanceRate?.toFloat() ?: 0f

                        setLoadingState(false)
                        updateChartsWithCachedData()
                        updateStatsCards()
                    },
                    onError = { _, msg ->
                        setLoadingState(false)
                        showEmptyCharts()
                        // Jangan crash — tampilkan pesan ke user
                        Toast.makeText(this@StatistikWakaa,
                            "Gagal memuat statistik: ${msg ?: "Error"}", Toast.LENGTH_SHORT).show()
                    }
                )
            } catch (e: Exception) {
                setLoadingState(false)
                showEmptyCharts()
                Toast.makeText(this@StatistikWakaa,
                    "Error: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    // ─── UPDATE UI ────────────────────────────────────────────────

    private fun updateChartsWithCachedData() {
        val modeLabel = when (currentMode) {
            "GURU"  -> "Guru"
            "SISWA" -> "Siswa"
            else    -> "Semua"
        }
        updateBarChart(modeLabel)
        updatePieChart(modeLabel)
    }

    private fun updateBarChart(modeLabel: String) {
        val entries = listOf(
            BarEntry(0f, cachedHadir),
            BarEntry(1f, cachedTerlambat),
            BarEntry(2f, cachedIzin),
            BarEntry(3f, cachedSakit),
            BarEntry(4f, cachedAlpha),
            BarEntry(5f, 0f) // slot kosong (dulu "Pulang")
        )

        val dataSet = BarDataSet(entries, "Kehadiran $modeLabel").apply {
            colors = listOf(
                Color.parseColor("#4CAF50"), // Hadir
                Color.parseColor("#FF9800"), // Terlambat
                Color.parseColor("#2196F3"), // Izin
                Color.parseColor("#9C27B0"), // Sakit
                Color.parseColor("#F44336"), // Alpha
                Color.parseColor("#BDBDBD")  // —
            )
            valueTextColor = Color.BLACK
            valueTextSize  = 11f
            setValueFormatter(object : ValueFormatter() {
                override fun getFormattedValue(value: Float) =
                    if (value > 0) value.toInt().toString() else ""
            })
        }

        // FIX: Y axis maks otomatis dari data, bukan hardcode 100
        val maxVal = listOf(cachedHadir, cachedTerlambat, cachedIzin, cachedSakit, cachedAlpha).maxOrNull() ?: 10f
        barChart.axisLeft.axisMaximum = (maxVal * 1.2f).coerceAtLeast(10f)

        barChart.data = BarData(dataSet).apply { barWidth = 0.5f }

        val timeText = timeRangeLabel()
        try { findViewById<TextView>(R.id.textViewGrafikTitle).text = "Grafik $modeLabel $timeText" } catch (_: Exception) {}

        barChart.animateY(800)
        barChart.invalidate()
    }

    private fun updatePieChart(modeLabel: String) {
        // FIX: filter entry dengan value > 0 agar PieChart tidak crash dengan slice kosong
        data class Slice(val label: String, val value: Float, val color: String)
        val slices = listOf(
            Slice("Hadir",     cachedHadir,     "#4CAF50"),
            Slice("Terlambat", cachedTerlambat, "#FF9800"),
            Slice("Izin",      cachedIzin,      "#2196F3"),
            Slice("Sakit",     cachedSakit,     "#9C27B0"),
            Slice("Alpha",     cachedAlpha,     "#F44336")
        ).filter { it.value > 0 }

        if (slices.isEmpty()) {
            // Tidak ada data — tampilkan satu slice placeholder
            val placeholder = PieDataSet(listOf(PieEntry(1f, "Tidak ada data")), "")
            placeholder.colors = listOf(Color.parseColor("#BDBDBD"))
            placeholder.valueTextColor = Color.TRANSPARENT
            pieChart.data = PieData(placeholder)
            pieChart.centerText = "Tidak ada\ndata"
            pieChart.invalidate()
            return
        }

        val entries = slices.map { PieEntry(it.value, it.label) }
        val colors  = slices.map { Color.parseColor(it.color) }

        val total = slices.sumOf { it.value.toDouble() }.toFloat()

        val dataSet = PieDataSet(entries, "Status Kehadiran $modeLabel").apply {
            this.colors    = colors
            valueTextSize  = 11f
            valueTextColor = Color.BLACK
            sliceSpace     = 2f
            setValueFormatter(object : ValueFormatter() {
                override fun getFormattedValue(value: Float): String {
                    val pct = if (total > 0) value / total * 100f else 0f
                    return "${"%.1f".format(pct)}%"
                }
            })
        }

        val timeText = timeRangeLabel()
        pieChart.centerText = "$modeLabel\n$timeText"
        pieChart.setCenterTextSize(11f)
        pieChart.setCenterTextColor(Color.BLACK)

        try { findViewById<TextView>(R.id.textViewPieTitle).text = "Status Kehadiran $modeLabel $timeText" } catch (_: Exception) {}

        pieChart.data = PieData(dataSet).apply {
            setValueTextSize(11f)
            setValueTextColor(Color.BLACK)
        }
        pieChart.animateY(800)
        pieChart.invalidate()
    }

    private fun updateStatsCards() {
        try { findViewById<TextView>(R.id.textView13).text = "${cachedAttendanceRate.toInt()}%" } catch (_: Exception) {}
        try { findViewById<TextView>(R.id.textView14).text = cachedTotal.toString() } catch (_: Exception) {}
        try { findViewById<TextView>(R.id.textView15).text = (cachedIzin + cachedSakit).toInt().toString() } catch (_: Exception) {}
        try { findViewById<TextView>(R.id.textView16).text = cachedAlpha.toInt().toString() } catch (_: Exception) {}
    }

    private fun showEmptyCharts() {
        cachedHadir = 0f; cachedTerlambat = 0f; cachedIzin = 0f
        cachedSakit = 0f; cachedAlpha = 0f; cachedTotal = 0; cachedAttendanceRate = 0f
        updateChartsWithCachedData()
        updateStatsCards()
    }

    // FIX: Tidak lagi memakai R.id.progressBarStatistik yang tidak ada di layout.
    // Gunakan visibility chart sebagai indikator loading.
    private fun setLoadingState(loading: Boolean) {
        try {
            barChart.visibility = if (loading) View.INVISIBLE else View.VISIBLE
            pieChart.visibility = if (loading) View.INVISIBLE else View.VISIBLE
        } catch (_: Exception) {}
    }

    private fun timeRangeLabel() = when (currentTimeRange) {
        "MINGGUAN" -> "Minggu Ini"
        "BULANAN"  -> "Bulan Ini"
        else       -> "Hari Ini"
    }

    // ─── FILTER DROPDOWNS ─────────────────────────────────────────

    private fun setupFilterDropdown() {
        // FIX: gunakan try-catch agar tidak crash jika view tidak ditemukan
        val filterButton = try { findViewById<ImageButton>(R.id.imageButton8) } catch (_: Exception) { null }
        filterButton?.setOnClickListener { view ->
            PopupMenu(this, view).apply {
                // FIX: gunakan menu yang punya item semua/guru/siswa
                // Jika menu_data_rekap tidak punya menu_semua, tambahkan secara programmatic
                try {
                    menuInflater.inflate(R.menu.menu_data_rekap, menu)
                } catch (_: Exception) {
                    menu.add(0, R.id.menu_semua, 0, "Semua")
                    menu.add(0, R.id.menu_guru,  1, "Guru")
                    menu.add(0, R.id.menu_siswa, 2, "Siswa")
                }
                setOnMenuItemClickListener { item ->
                    when (item.itemId) {
                        R.id.menu_semua -> { setMode("SEMUA", "Semua"); true }
                        R.id.menu_guru  -> { setMode("GURU",  "Guru");  true }
                        R.id.menu_siswa -> { setMode("SISWA", "Siswa"); true }
                        else -> {
                            // Fallback by title
                            when (item.title.toString()) {
                                "Semua" -> setMode("SEMUA", "Semua")
                                "Guru"  -> setMode("GURU",  "Guru")
                                "Siswa" -> setMode("SISWA", "Siswa")
                            }
                            true
                        }
                    }
                }
                show()
            }
        }
    }

    private fun setupTimeFilterDropdown() {
        val btn = try { findViewById<ImageButton>(R.id.imageButton9) } catch (_: Exception) { null }
        btn?.setOnClickListener { view ->
            PopupMenu(this, view).apply {
                try {
                    menuInflater.inflate(R.menu.menu_filter_time, menu)
                } catch (_: Exception) {
                    menu.add(0, R.id.menu_harian,   0, "Harian")
                    menu.add(0, R.id.menu_mingguan, 1, "Mingguan")
                    menu.add(0, R.id.menu_bulanan,  2, "Bulanan")
                }
                setOnMenuItemClickListener { item ->
                    val range = when (item.itemId) {
                        R.id.menu_harian   -> "HARIAN"
                        R.id.menu_mingguan -> "MINGGUAN"
                        R.id.menu_bulanan  -> "BULANAN"
                        else -> when (item.title.toString()) {
                            "Harian"   -> "HARIAN"
                            "Mingguan" -> "MINGGUAN"
                            "Bulanan"  -> "BULANAN"
                            else       -> "HARIAN"
                        }
                    }
                    setTimeRange(range)
                    true
                }
                show()
            }
        }
    }

    private fun setMode(mode: String, label: String) {
        currentMode = mode
        try { findViewById<TextView>(R.id.textView11).text = label } catch (_: Exception) {}
        // Catatan: mode Guru/Siswa saat ini memakai endpoint yang sama (waka summary).
        // Jika backend sudah pisahkan endpoint per role, bisa dikembangkan di sini.
        loadAttendanceDataFromApi()
        Toast.makeText(this, "Menampilkan statistik $label", Toast.LENGTH_SHORT).show()
    }

    private fun setTimeRange(range: String) {
        currentTimeRange = range
        val label = when (range) {
            "MINGGUAN" -> "Mingguan"
            "BULANAN"  -> "Bulanan"
            else       -> "Harian"
        }
        try { findViewById<TextView>(R.id.textView12).text = label } catch (_: Exception) {}
        loadAttendanceDataFromApi()
        Toast.makeText(this, "Menampilkan data $label", Toast.LENGTH_SHORT).show()
    }

    // ─── EXPORT CSV ───────────────────────────────────────────────

    private fun setupExportButton() {
        val btn = try { findViewById<android.widget.Button>(R.id.button3) } catch (_: Exception) { null }
        btn?.setOnClickListener { exportDataToCSV() }
    }

    private fun exportDataToCSV() {
        try {
            val ts       = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(Date())
            val fileName = "Statistik_${currentMode}_${currentTimeRange}_$ts.csv"

            val dir  = getExternalFilesDir(Environment.DIRECTORY_DOCUMENTS)
                ?: filesDir  // fallback ke internal storage jika external tidak tersedia
            val file = File(dir, fileName)

            FileWriter(file).use { w ->
                w.append("Laporan Statistik Kehadiran\n")
                w.append("Mode,$currentMode\n")
                w.append("Periode,$currentTimeRange (${timeRangeLabel()})\n")
                w.append("Tanggal Ekspor,${SimpleDateFormat("dd/MM/yyyy HH:mm:ss", Locale.getDefault()).format(Date())}\n")
                w.append("\n")
                w.append("Kategori,Jumlah\n")
                w.append("Hadir,${cachedHadir.toInt()}\n")
                w.append("Terlambat,${cachedTerlambat.toInt()}\n")
                w.append("Izin,${cachedIzin.toInt()}\n")
                w.append("Sakit,${cachedSakit.toInt()}\n")
                w.append("Alpha,${cachedAlpha.toInt()}\n")
                w.append("\n")
                w.append("Total,${cachedTotal}\n")
                w.append("Tingkat Kehadiran,${cachedAttendanceRate.toInt()}%\n")
            }

            val uri: Uri = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                FileProvider.getUriForFile(this, "${packageName}.provider", file)
            } else {
                Uri.fromFile(file)
            }

            val shareIntent = Intent(Intent.ACTION_SEND).apply {
                type = "text/csv"
                putExtra(Intent.EXTRA_STREAM, uri)
                putExtra(Intent.EXTRA_SUBJECT, "Statistik Kehadiran - $currentMode ($currentTimeRange)")
                putExtra(Intent.EXTRA_TEXT, "Data statistik kehadiran terlampir.")
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            }
            startActivity(Intent.createChooser(shareIntent, "Ekspor Data ke…"))
            Toast.makeText(this, "Diekspor ke $fileName", Toast.LENGTH_LONG).show()

        } catch (e: Exception) {
            Toast.makeText(this, "Gagal ekspor: ${e.message}", Toast.LENGTH_LONG).show()
        }
    }

    // ─── NAVIGASI ─────────────────────────────────────────────────

    private fun setupNavigation() {
        safeNav(R.id.imageButton2) { Intent(this, DashboardWaka::class.java) }
        safeNav(R.id.imageButton3) { Intent(this, DataRekapKehadiranGuru::class.java) }
        safeNav(R.id.imageButton4) { Intent(this, JadwalPembelajaranGuru::class.java) }
        try {
            findViewById<ImageButton?>(R.id.imageButton50)?.setOnClickListener {
                Toast.makeText(this, "Sudah di halaman Statistik", Toast.LENGTH_SHORT).show()
            }
        } catch (_: Exception) {}
    }

    private fun safeNav(btnId: Int, intentBlock: () -> Intent) {
        try {
            findViewById<ImageButton?>(btnId)?.setOnClickListener {
                try { startActivity(intentBlock()) }
                catch (_: Exception) { Toast.makeText(this, "Halaman belum tersedia", Toast.LENGTH_SHORT).show() }
            }
        } catch (_: Exception) {}
    }

    @Suppress("OVERRIDE_DEPRECATION")
    override fun onBackPressed() {
        onBackPressedDispatcher.onBackPressed()
        startActivity(Intent(this, DashboardWaka::class.java))
        finish()
    }
}