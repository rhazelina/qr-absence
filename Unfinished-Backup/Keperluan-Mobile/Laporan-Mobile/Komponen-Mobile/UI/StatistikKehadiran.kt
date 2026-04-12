package com.example.ritamesa

import android.content.Intent
import android.graphics.Color
import android.os.Bundle
import android.widget.ImageButton
import android.widget.PopupMenu
import android.widget.TextView
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.lifecycle.lifecycleScope
import com.github.mikephil.charting.charts.BarChart
import com.github.mikephil.charting.charts.PieChart
import com.github.mikephil.charting.components.XAxis
import com.github.mikephil.charting.data.*
import com.github.mikephil.charting.formatter.IndexAxisValueFormatter
import com.github.mikephil.charting.formatter.ValueFormatter
import com.github.mikephil.charting.highlight.Highlight
import com.github.mikephil.charting.listener.OnChartValueSelectedListener
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

class StatistikKehadiran : BaseNetworkActivity() {

    private lateinit var barChart: BarChart
    private lateinit var pieChart: PieChart

    private var selectedRole = "Semua"
    private var selectedTime = "Bulanan"

    // Data 6 kategori (jumlah, bukan persentase)
    private var hadir     = 0f
    private var terlambat = 0f
    private var izin      = 0f
    private var sakit     = 0f
    private var pulang    = 0f  // API belum ada "pulang" — set 0
    private var alpha     = 0f

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.statistik_kehadiran)

        barChart = findViewById(R.id.barChart)
        pieChart = findViewById(R.id.pieChart)

        val txtRole = try { findViewById<TextView>(R.id.textView2) } catch (_: Exception) { null }
        val btnRole = try { findViewById<ImageButton>(R.id.imageButton1) } catch (_: Exception) { null }
        val txtTime = try { findViewById<TextView>(R.id.textView3) } catch (_: Exception) { null }
        val btnTime = try { findViewById<ImageButton>(R.id.imageButton2) } catch (_: Exception) { null }

        val tvHadirPercent     = try { findViewById<TextView>(R.id.textView20) } catch (_: Exception) { null }
        val tvTerlambatPercent = try { findViewById<TextView>(R.id.textView78) } catch (_: Exception) { null }
        val tvIzinPercent      = try { findViewById<TextView>(R.id.textView90) } catch (_: Exception) { null }
        val tvAlphaPercent     = try { findViewById<TextView>(R.id.textView50) } catch (_: Exception) { null }

        // Navigasi
        try { findViewById<ImageButton>(R.id.imageButton27).setOnClickListener {
            startActivity(Intent(this, Dashboard::class.java)); finish()
        } } catch (_: Exception) {}

        try { findViewById<ImageButton>(R.id.imageButton3).setOnClickListener {
            startActivity(Intent(this, RekapKehadiranSiswa::class.java)); finish()
        } } catch (_: Exception) {}

        try { findViewById<ImageButton>(R.id.imageButton4).setOnClickListener {
            Toast.makeText(this, "Sudah di halaman Statistik", Toast.LENGTH_SHORT).show()
        } } catch (_: Exception) {}

        // Dropdown Role
        btnRole?.setOnClickListener {
            PopupMenu(this, btnRole).apply {
                menu.add("Semua"); menu.add("Guru"); menu.add("Siswa")
                setOnMenuItemClickListener {
                    selectedRole = it.title.toString()
                    txtRole?.text = selectedRole
                    loadAttendanceData()
                    true
                }
                show()
            }
        }

        // Dropdown Waktu
        btnTime?.setOnClickListener {
            PopupMenu(this, btnTime).apply {
                menu.add("Harian"); menu.add("Mingguan"); menu.add("Bulanan"); menu.add("Tahunan")
                setOnMenuItemClickListener {
                    selectedTime = it.title.toString()
                    txtTime?.text = selectedTime
                    loadAttendanceData()
                    true
                }
                show()
            }
        }

        setupBarChart()
        setupPieChart()

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val sys = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(sys.left, sys.top, sys.right, sys.bottom)
            insets
        }

        loadAttendanceData()
    }

    // ─── SETUP CHART STYLE ────────────────────────────────────────

    private fun setupBarChart() {
        barChart.apply {
            description.isEnabled = false
            legend.isEnabled      = true
            legend.textSize       = 11f
            axisRight.isEnabled   = false
            setDrawGridBackground(false)
            setScaleEnabled(false)
            setPinchZoom(false)
            setDoubleTapToZoomEnabled(false)

            xAxis.apply {
                position       = XAxis.XAxisPosition.BOTTOM
                valueFormatter = IndexAxisValueFormatter(listOf("Hadir","Terlambat","Izin","Sakit","Pulang","Alpha"))
                granularity    = 1f
                setDrawGridLines(false)
                labelCount     = 6
                textSize       = 10f
                axisMinimum    = -0.5f
                axisMaximum    = 5.5f
            }
            axisLeft.apply {
                axisMinimum = 0f
                granularity = 1f
                valueFormatter = object : ValueFormatter() {
                    override fun getFormattedValue(value: Float) = value.toInt().toString()
                }
            }

            setOnChartValueSelectedListener(object : OnChartValueSelectedListener {
                override fun onValueSelected(e: Entry?, h: Highlight?) {
                    e ?: return
                    val labels = listOf("Hadir","Terlambat","Izin","Sakit","Pulang","Alpha")
                    val label  = labels.getOrNull(e.x.toInt()) ?: "Data"
                    Toast.makeText(this@StatistikKehadiran, "$label: ${e.y.toInt()}", Toast.LENGTH_SHORT).show()
                }
                override fun onNothingSelected() {}
            })
        }
    }

    private fun setupPieChart() {
        pieChart.apply {
            description.isEnabled = false
            isDrawHoleEnabled     = true
            holeRadius            = 45f
            setEntryLabelColor(Color.BLACK)
            setEntryLabelTextSize(10f)
            setDrawEntryLabels(false)
            legend.isEnabled  = true
            legend.textSize   = 11f
            legend.formSize   = 11f
        }
    }

    // ─── LOAD DATA ────────────────────────────────────────────────

    private fun loadAttendanceData() {
        setLoadingState(true)

        val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        val cal = Calendar.getInstance()
        val endDate = sdf.format(cal.time)

        when (selectedTime) {
            "Harian"   -> { /* same day */ }
            "Mingguan" -> cal.add(Calendar.DAY_OF_YEAR, -7)
            "Bulanan"  -> cal.add(Calendar.MONTH, -1)
            "Tahunan"  -> cal.add(Calendar.YEAR, -1)
        }
        val startDate = sdf.format(cal.time)

        lifecycleScope.launch {
            // FIX: gunakan getAttendanceSummaryRaw() yang parse FLAT response
            when (val result = attendanceRepository.getAttendanceSummaryRaw(
                startDate = startDate,
                endDate   = endDate
            )) {
                is com.example.ritamesa.api.Result.Success -> {
                    val summary = result.data
                    hadir     = (summary.present  ?: 0).toFloat()
                    terlambat = (summary.late     ?: 0).toFloat()
                    izin      = (summary.excused  ?: 0).toFloat()
                    sakit     = (summary.sick     ?: 0).toFloat()
                    alpha     = (summary.absent   ?: 0).toFloat()
                    pulang    = 0f

                    setLoadingState(false)
                    updateBarChart()
                    updatePieChart()
                    updateStatistikCards()
                }
                is com.example.ritamesa.api.Result.Error -> {
                    setLoadingState(false)
                    zeroCachedData()
                    updateBarChart()
                    updatePieChart()
                    updateStatistikCards()
                    Toast.makeText(this@StatistikKehadiran,
                        "Gagal memuat statistik: ${result.message ?: "Error"}", Toast.LENGTH_SHORT).show()
                }
                else -> {
                    setLoadingState(false)
                    zeroCachedData()
                    updateBarChart()
                    updatePieChart()
                    updateStatistikCards()
                }
            }
        }
    }

    private fun zeroCachedData() {
        hadir = 0f; terlambat = 0f; izin = 0f; sakit = 0f; pulang = 0f; alpha = 0f
    }

    // ─── UPDATE CHARTS ────────────────────────────────────────────

    private fun updateBarChart() {
        val values = listOf(hadir, terlambat, izin, sakit, pulang, alpha)
        val entries = values.mapIndexed { i, v -> BarEntry(i.toFloat(), v) }

        val dataSet = BarDataSet(entries, "Statistik Kehadiran — $selectedRole").apply {
            colors = listOf(
                Color.parseColor("#4CAF50"),
                Color.parseColor("#FF9800"),
                Color.parseColor("#2196F3"),
                Color.parseColor("#9C27B0"),
                Color.parseColor("#00BCD4"),
                Color.parseColor("#F44336")
            )
            valueTextSize  = 11f
            valueTextColor = Color.BLACK
            setValueFormatter(object : ValueFormatter() {
                override fun getFormattedValue(value: Float) =
                    if (value > 0) value.toInt().toString() else ""
            })
        }

        // FIX: Y axis max otomatis
        val maxVal = values.maxOrNull() ?: 10f
        barChart.axisLeft.axisMaximum = (maxVal * 1.2f).coerceAtLeast(10f)

        barChart.data = BarData(dataSet).apply { barWidth = 0.5f }
        barChart.animateY(800)
        barChart.invalidate()
    }

    private fun updatePieChart() {
        // FIX: filter slice kosong agar tidak crash
        data class Slice(val label: String, val value: Float, val color: String)
        val allSlices = listOf(
            Slice("Hadir",     hadir,     "#4CAF50"),
            Slice("Terlambat", terlambat, "#FF9800"),
            Slice("Izin",      izin,      "#2196F3"),
            Slice("Sakit",     sakit,     "#9C27B0"),
            Slice("Pulang",    pulang,    "#00BCD4"),
            Slice("Alpha",     alpha,     "#F44336")
        ).filter { it.value > 0 }

        if (allSlices.isEmpty()) {
            val placeholder = PieDataSet(listOf(PieEntry(1f, "Tidak ada data")), "")
            placeholder.colors         = listOf(Color.parseColor("#BDBDBD"))
            placeholder.valueTextColor = Color.TRANSPARENT
            pieChart.data = PieData(placeholder)
            pieChart.centerText = "Tidak ada\ndata"
            pieChart.invalidate()
            return
        }

        val total   = allSlices.sumOf { it.value.toDouble() }.toFloat()
        val entries = allSlices.map { PieEntry(it.value, it.label) }
        val colors  = allSlices.map { Color.parseColor(it.color) }

        val dataSet = PieDataSet(entries, "").apply {
            this.colors    = colors
            valueTextSize  = 11f
            valueTextColor = Color.WHITE
            setValueFormatter(object : ValueFormatter() {
                override fun getFormattedValue(value: Float): String {
                    val pct = if (total > 0) value / total * 100f else 0f
                    return "${"%.1f".format(pct)}%"
                }
            })
        }

        pieChart.centerText = "Total\n${total.toInt()}"
        pieChart.setCenterTextSize(13f)
        pieChart.setCenterTextColor(Color.BLACK)
        pieChart.data = PieData(dataSet)
        pieChart.animateY(800)
        pieChart.invalidate()
    }

    // ─── KARTU STATISTIK ──────────────────────────────────────────

    private fun updateStatistikCards() {
        val tvHadir     = try { findViewById<TextView>(R.id.textView20) } catch (_: Exception) { null }
        val tvTerlambat = try { findViewById<TextView>(R.id.textView78) } catch (_: Exception) { null }
        val tvIzin      = try { findViewById<TextView>(R.id.textView90) } catch (_: Exception) { null }
        val tvAlpha     = try { findViewById<TextView>(R.id.textView50) } catch (_: Exception) { null }

        val total = hadir + terlambat + izin + sakit + pulang + alpha

        tvHadir?.text     = if (total > 0) "${"%.1f".format(hadir / total * 100)}%" else "0%"
        tvTerlambat?.text = if (total > 0) "${"%.1f".format(terlambat / total * 100)}%" else "0%"
        tvIzin?.text      = if (total > 0) "${"%.1f".format(izin / total * 100)}%" else "0%"
        tvAlpha?.text     = if (total > 0) "${"%.1f".format(alpha / total * 100)}%" else "0%"
    }

    private fun setLoadingState(loading: Boolean) {
        // progressBarStatistik tidak ada di layout, skip
    }
}