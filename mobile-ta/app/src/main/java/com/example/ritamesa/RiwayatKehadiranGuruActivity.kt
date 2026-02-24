package com.example.ritamesa

import android.app.DatePickerDialog
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.ImageButton
import android.widget.ImageView
import android.widget.TextView
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import kotlinx.coroutines.launch
import java.text.ParseException
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Collections
import java.util.Date
import java.util.Locale

class RiwayatKehadiranGuruActivity : BaseNetworkActivity() {
    private lateinit var recyclerView: RecyclerView
    private lateinit var txtHadirCount: TextView
    private lateinit var txtSakitCount: TextView
    private lateinit var txtIzinCount: TextView
    private lateinit var txtAlphaCount: TextView
    private lateinit var txtFilterTanggal: TextView

    private lateinit var btnHadir: ImageButton
    private lateinit var btnSakit: ImageButton
    private lateinit var btnIzin: ImageButton
    private lateinit var btnAlpha: ImageButton
    private lateinit var iconCalendar: ImageView

    private lateinit var btnHome: ImageButton
    private lateinit var btnChart: ImageButton
    private lateinit var btnNotif: ImageButton

    private val allData = Collections.synchronizedList(mutableListOf<Map<String, Any>>())
    private val filteredData = Collections.synchronizedList(mutableListOf<Map<String, Any>>())
    private lateinit var adapter: SimpleGuruAdapter
    private var filterActive: String? = null
    private var dateFilterActive: Boolean = false

    private var isLoading = false
    private var selectedDate = Calendar.getInstance()

    private val textColorActive = android.graphics.Color.WHITE
    private val textColorNormal = android.graphics.Color.parseColor("#4B5563")

    companion object {
        private const val TAG = "RiwayatGuruActivity"
        private const val DATE_FORMAT = "dd-MM-yyyy"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.riwayat_kehadiran_guru1)
        
        if (!initializeViews()) {
            showError("Gagal inisialisasi layout")
            finish()
            return
        }
        
        updateTanggalDisplay()
        setupFilterButtons()
        setupCalendarButton()
        setupRecyclerView()
        setupFooterNavigation()
        loadDataAsync()
    }

    override fun onResume() {
        super.onResume()
        if (!isLoading) {
            loadDataAsync()
        }
    }

    private fun initializeViews(): Boolean {
        return try {
            recyclerView = findViewById(R.id.recycler_riwayat)
            txtHadirCount = findViewById(R.id.txt_hadir_count)
            txtSakitCount = findViewById(R.id.txt_sakit_count)
            txtIzinCount = findViewById(R.id.txt_izin_count)
            txtAlphaCount = findViewById(R.id.txt_alpha_count)
            txtFilterTanggal = findViewById(R.id.text_filter_tanggal)
            btnHadir = findViewById(R.id.button_hadir)
            btnSakit = findViewById(R.id.button_sakit)
            btnIzin = findViewById(R.id.button_izin)
            btnAlpha = findViewById(R.id.button_alpha)
            iconCalendar = findViewById(R.id.icon_calendar)
            btnHome = findViewById(R.id.btnHome)
            btnChart = findViewById(R.id.btnChart)
            btnNotif = findViewById(R.id.btnNotif)
            true
        } catch (e: Exception) {
            Log.e(TAG, "Error initializeViews: ${e.message}")
            false
        }
    }

    private fun setupCalendarButton() {
        iconCalendar.setOnClickListener { showDatePicker() }
    }

    private fun showDatePicker() {
        val year = selectedDate.get(Calendar.YEAR)
        val month = selectedDate.get(Calendar.MONTH)
        val day = selectedDate.get(Calendar.DAY_OF_MONTH)

        DatePickerDialog(
            this,
            { _, selectedYear, selectedMonth, selectedDay ->
                selectedDate.set(selectedYear, selectedMonth, selectedDay)
                dateFilterActive = true
                updateTanggalDisplay()
                applyDateFilter()
                filterActive = null
                updateTombolAktif()
                resetTextColors()
            },
            year, month, day
        ).show()
    }

    private fun updateTanggalDisplay() {
        val sdf = SimpleDateFormat("EEEE, dd MMMM yyyy", Locale.forLanguageTag("id-ID"))
        val formatted = sdf.format(selectedDate.time)
        txtFilterTanggal.text = formatted[0].uppercaseChar() + formatted.substring(1)
    }

    private fun applyDateFilter() {
        if (isLoading) return
        val dateFormat = SimpleDateFormat(DATE_FORMAT, Locale.getDefault())
        val selectedDateStr = dateFormat.format(selectedDate.time)

        filteredData.clear()
        filteredData.addAll(allData.filter {
            (it["tanggal"] as? String ?: "").contains(selectedDateStr)
        })

        if (filterActive != null) {
            applyFilter(filterActive!!)
        } else {
            adapter.notifyDataSetChanged()
        }
        updateAngkaTombol()
    }

    private fun setupRecyclerView() {
        adapter = SimpleGuruAdapter(this, filteredData)
        recyclerView.layoutManager = LinearLayoutManager(this)
        recyclerView.adapter = adapter
    }

    private fun setupFooterNavigation() {
        btnHome.setOnClickListener {
            startActivity(Intent(this, DashboardGuruActivity::class.java))
        }

        findViewById<ImageButton>(R.id.btnAssigment).setOnClickListener {
            filterActive = null
            dateFilterActive = false
            selectedDate = Calendar.getInstance()
            updateTanggalDisplay()
            resetFilter()
            updateTombolAktif()
            resetTextColors()
        }

        btnChart.setOnClickListener {
            startActivity(Intent(this, TindakLanjutGuruActivity::class.java))
        }

        btnNotif.setOnClickListener {
            startActivity(Intent(this, NotifikasiGuruActivity::class.java))
        }
    }

    private fun setupFilterButtons() {
        btnHadir.setOnClickListener { toggleFilter("hadir") }
        btnSakit.setOnClickListener { toggleFilter("sakit") }
        btnIzin.setOnClickListener { toggleFilter("izin") }
        btnAlpha.setOnClickListener { toggleFilter("alpha") }
    }

    private fun loadDataAsync() {
        isLoading = true
        lifecycleScope.launch {
            try {
                val result = attendanceRepository.getMyTeachingAttendance()
                handleResult(result,
                    onSuccess = { attendanceRecords ->
                        allData.clear()
                        filteredData.clear()
                        
                        attendanceRecords.forEachIndexed { index, record ->
                            val statusType = toStatusType(record.status)
                            val statusText = toStatusLabel(record.status, record.statusLabel)
                            val mapel = record.schedule?.subjectName ?: "Kehadiran Guru"
                            val kelas = buildTimeRange(record.schedule?.startTime, record.schedule?.endTime)
                            val tanggalDisplay = buildTanggalDisplay(
                                record.date ?: record.createdAt,
                                record.checkedInAt ?: record.timestamp
                            )
                            val sortKey = buildSortKey(
                                record.date ?: record.createdAt,
                                record.checkedInAt ?: record.timestamp
                            )

                            val mapOfRecord: MutableMap<String, Any> = mutableMapOf<String, Any>().apply {
                                this["id"] = index
                                this["mapel"] = mapel
                                this["kelas"] = kelas
                                this["status"] = statusText
                                this["tanggal"] = tanggalDisplay
                                this["statusType"] = statusType
                                this["sortKey"] = sortKey
                            }
                            allData.add(mapOfRecord)
                        }

                        allData.sortByDescending { it["sortKey"] as? String ?: "" }

                        val todayStr = SimpleDateFormat(DATE_FORMAT, Locale.getDefault()).format(Date())
                        filteredData.addAll(allData.filter {
                            (it["tanggal"] as? String ?: "").contains(todayStr)
                        })

                        updateAngkaTombol()
                        adapter.notifyDataSetChanged()
                        isLoading = false
                    },
                    onError = { _, message ->
                        showError(message ?: "Error loading data")
                        isLoading = false
                    }
                )
            } catch (e: Exception) {
                showError("Error: ${e.message}")
                isLoading = false
            }
        }
    }

    private fun toStatusType(status: String?): String {
        return when (status?.lowercase()) {
            "present", "late", "return", "pulang" -> "hadir"
            "sick" -> "sakit"
            "permission", "excused", "izin" -> "izin"
            "absent", "alpha" -> "alpha"
            else -> "hadir"
        }
    }

    private fun toStatusLabel(status: String?, statusLabel: String?): String {
        if (!statusLabel.isNullOrBlank()) return statusLabel
        return when (status?.lowercase()) {
            "present" -> "Hadir Tepat Waktu"
            "late" -> "Hadir Terlambat"
            "sick" -> "Sakit"
            "permission", "excused", "izin" -> "Izin"
            "absent", "alpha" -> "Tanpa Keterangan"
            "return", "pulang" -> "Pulang"
            else -> "Belum Ada Status"
        }
    }

    private fun buildTimeRange(start: String?, end: String?): String {
        val cleanStart = start?.take(5).orEmpty()
        val cleanEnd = end?.take(5).orEmpty()
        if (cleanStart.isNotBlank() && cleanEnd.isNotBlank()) {
            return "$cleanStart - $cleanEnd"
        }
        if (cleanStart.isNotBlank()) return cleanStart
        return "-"
    }

    private fun normalizeDate(rawDate: String?): String {
        if (rawDate.isNullOrBlank()) return "-"

        val normalized = when {
            rawDate.contains("T") -> rawDate.substring(0, 10)
            rawDate.contains(" ") && rawDate.length >= 10 -> rawDate.substring(0, 10)
            rawDate.length >= 10 -> rawDate.substring(0, 10)
            else -> rawDate
        }

        return try {
            val input = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
            val output = SimpleDateFormat(DATE_FORMAT, Locale.getDefault())
            output.format(input.parse(normalized) ?: return rawDate)
        } catch (_: ParseException) {
            rawDate
        }
    }

    private fun normalizeTime(rawTime: String?): String {
        if (rawTime.isNullOrBlank()) return ""
        return when {
            rawTime.contains("T") && rawTime.length >= 16 -> rawTime.substring(11, 16)
            rawTime.contains(" ") && rawTime.length >= 16 -> rawTime.substring(11, 16)
            rawTime.length >= 5 -> rawTime.take(5)
            else -> ""
        }
    }

    private fun buildTanggalDisplay(rawDate: String?, rawTime: String?): String {
        val displayDate = normalizeDate(rawDate)
        val displayTime = normalizeTime(rawTime)
        if (displayDate == "-") return "-"
        return if (displayTime.isNotBlank()) "$displayDate $displayTime" else displayDate
    }

    private fun buildSortKey(rawDate: String?, rawTime: String?): String {
        val normalizedDate = when {
            rawDate.isNullOrBlank() -> "0000-00-00"
            rawDate.contains("T") -> rawDate.substring(0, 10)
            rawDate.contains(" ") && rawDate.length >= 10 -> rawDate.substring(0, 10)
            rawDate.length >= 10 -> rawDate.substring(0, 10)
            else -> rawDate
        }
        val normalizedTime = when {
            rawTime.isNullOrBlank() -> "00:00:00"
            rawTime.contains("T") && rawTime.length >= 19 -> rawTime.substring(11, 19)
            rawTime.contains(" ") && rawTime.length >= 19 -> rawTime.substring(11, 19)
            rawTime.length >= 8 -> rawTime.take(8)
            rawTime.length >= 5 -> "${rawTime.take(5)}:00"
            else -> "00:00:00"
        }
        return "$normalizedDate $normalizedTime"
    }

    private fun toggleFilter(status: String) {
        if (filterActive == status) {
            filterActive = null
            resetFilter()
            resetTextColors()
        } else {
            filterActive = status
            applyFilter(status)
            updateTextColors(status)
        }
        updateTombolAktif()
    }

    private fun applyFilter(status: String) {
        filteredData.clear()

        if (dateFilterActive) {
            val dateFormat = SimpleDateFormat(DATE_FORMAT, Locale.getDefault())
            val selectedDateStr = dateFormat.format(selectedDate.time)

            filteredData.addAll(allData.filter {
                it["statusType"] == status &&
                        (it["tanggal"] as? String ?: "").contains(selectedDateStr)
            })
        } else {
            filteredData.addAll(allData.filter { it["statusType"] == status })
        }

        adapter.notifyDataSetChanged()
        updateAngkaTombol()
    }

    private fun resetFilter() {
        filteredData.clear()

        if (dateFilterActive) {
            val dateFormat = SimpleDateFormat(DATE_FORMAT, Locale.getDefault())
            val selectedDateStr = dateFormat.format(selectedDate.time)
            filteredData.addAll(allData.filter {
                (it["tanggal"] as? String ?: "").contains(selectedDateStr)
            })
        } else {
            filteredData.addAll(allData)
        }

        adapter.notifyDataSetChanged()
        updateAngkaTombol()
    }

    private fun updateTombolAktif() {
        btnHadir.setImageResource(R.drawable.btn_guru_hadir)
        btnSakit.setImageResource(R.drawable.btn_guru_sakit)
        btnIzin.setImageResource(R.drawable.btn_guru_izin)
        btnAlpha.setImageResource(R.drawable.btn_guru_alpha)

        when (filterActive) {
            "hadir" -> btnHadir.setImageResource(R.drawable.btn_guru_hadir_active)
            "sakit" -> btnSakit.setImageResource(R.drawable.btn_guru_sakit_active)
            "izin" -> btnIzin.setImageResource(R.drawable.btn_guru_izin_active)
            "alpha" -> btnAlpha.setImageResource(R.drawable.btn_guru_alpha_active)
        }
    }

    private fun updateTextColors(activeStatus: String) {
        resetTextColors()
        when (activeStatus) {
            "hadir" -> txtHadirCount.setTextColor(textColorActive)
            "sakit" -> txtSakitCount.setTextColor(textColorActive)
            "izin" -> txtIzinCount.setTextColor(textColorActive)
            "alpha" -> txtAlphaCount.setTextColor(textColorActive)
        }
    }

    private fun resetTextColors() {
        txtHadirCount.setTextColor(textColorNormal)
        txtSakitCount.setTextColor(textColorNormal)
        txtIzinCount.setTextColor(textColorNormal)
        txtAlphaCount.setTextColor(textColorNormal)
    }

    private fun updateAngkaTombol() {
        var hadir = 0; var sakit = 0; var izin = 0; var alpha = 0

        // Hitung dari data yang sesuai dengan filter tanggal
        val dataToCount = if (dateFilterActive) {
            val dateFormat = SimpleDateFormat(DATE_FORMAT, Locale.getDefault())
            val selectedDateStr = dateFormat.format(selectedDate.time)
            allData.filter {
                (it["tanggal"] as? String ?: "").contains(selectedDateStr)
            }
        } else {
            allData
        }

        dataToCount.forEach {
            when (it["statusType"]) {
                "hadir" -> hadir++
                "sakit" -> sakit++
                "izin" -> izin++
                "alpha" -> alpha++
            }
        }

        txtHadirCount.text = hadir.toString()
        txtSakitCount.text = sakit.toString()
        txtIzinCount.text = izin.toString()
        txtAlphaCount.text = alpha.toString()
    }
}
