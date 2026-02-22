package com.example.ritamesa

import android.app.DatePickerDialog
import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.widget.ImageButton
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import java.text.SimpleDateFormat
import java.util.*

class RiwayatKehadiranGuruActivity : AppCompatActivity() {

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

    private val handler = Handler(Looper.getMainLooper())
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
        setContentView(R.layout.riwayat_kehadiran_guru_fix)

        if (!initializeViews()) {
            Toast.makeText(this, "Gagal memuat tampilan", Toast.LENGTH_LONG).show()
            finish()
            return
        }

        setupRecyclerView()
        setupFooterNavigation()
        setupFilterButtons()
        setupCalendarButton()
        updateTanggalDisplay()
        resetTextColors()
        loadDataAsync()
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
        val sdf = SimpleDateFormat("EEEE, dd MMMM yyyy", Locale("id", "ID"))
        val formatted = sdf.format(selectedDate.time)
        txtFilterTanggal.text = formatted[0].uppercaseChar() + formatted.substring(1)
    }

    private fun applyDateFilter() {
        if (isLoading) return
        isLoading = true

        Thread {
            try {
                val dateFormat = SimpleDateFormat(DATE_FORMAT, Locale.getDefault())
                val selectedDateStr = dateFormat.format(selectedDate.time)

                val tempFilteredData = allData.filter {
                    (it["tanggal"] as? String ?: "").contains(selectedDateStr)
                }

                handler.post {
                    filteredData.clear()
                    filteredData.addAll(tempFilteredData)

                    if (filterActive != null) {
                        applyFilter(filterActive!!)
                    } else {
                        adapter.notifyDataSetChanged()
                    }
                    updateAngkaTombol()
                    isLoading = false
                }
            } catch (e: Exception) {
                handler.post { isLoading = false }
            }
        }.start()
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

    // ============= DATA DUMMY SESUAI GURU RPL =============
    private fun loadDataAsync() {
        isLoading = true

        Thread {
            try {
                allData.clear()
                filteredData.clear()

                // KELAS: XII RPL 2, XII RPL 1, XI RPL 1, XI RPL 2, XI RPL 3, X RPL 1, X RPL 2
                val kelasList = listOf(
                    "XII RPL 2", "XII RPL 1",
                    "XI RPL 1", "XI RPL 2", "XI RPL 3",
                    "X RPL 1", "X RPL 2"
                )

                // MAPEL: MPKK, PKDK, MPP (untuk XI & XII), Informatika (hanya X)
                val mapelKelasXII_XI = listOf("MPKK", "PKDK", "MPP")
                val mapelKelasX = "Informatika"

                val calendar = Calendar.getInstance()
                val dateFormat = SimpleDateFormat(DATE_FORMAT, Locale.getDefault())

                // Data 7 hari terakhir
                for (dayOffset in 0..6) {
                    calendar.time = Date()
                    calendar.add(Calendar.DAY_OF_YEAR, -dayOffset)
                    val tanggal = dateFormat.format(calendar.time)

                    repeat((3..5).random()) { entryIndex ->
                        val kelas = kelasList[entryIndex % kelasList.size]

                        // Tentukan mapel berdasarkan tingkat kelas
                        val mapel = if (kelas.startsWith("X ")) {
                            // Untuk kelas X, gunakan Informatika
                            mapelKelasX
                        } else {
                            // Untuk kelas XI dan XII, rotasi mapel MPKK, PKDK, MPP
                            mapelKelasXII_XI[(entryIndex + dayOffset) % mapelKelasXII_XI.size]
                        }

                        val statusRand = (1..100).random()
                        val statusType = when {
                            statusRand <= 70 -> "hadir"
                            statusRand <= 80 -> "sakit"
                            statusRand <= 90 -> "izin"
                            else -> "alpha"
                        }

                        val statusText = when (statusType) {
                            "hadir" -> if (entryIndex % 4 == 0) "Hadir Terlambat" else "Hadir Tepat Waktu"
                            "sakit" -> "Tidak Bisa Mengajar (Sakit)"
                            "izin" -> "Tidak Bisa Mengajar (Izin)"
                            "alpha" -> "Tanpa Keterangan"
                            else -> "Tidak Mengajar"
                        }

                        val jamList = listOf("07:30", "08:15", "09:00", "09:45", "10:30", "11:15")
                        val jam = jamList[entryIndex % jamList.size]

                        allData.add(mapOf(
                            "id" to (dayOffset * 10 + entryIndex),
                            "mapel" to mapel,
                            "kelas" to kelas,
                            "status" to statusText,
                            "tanggal" to "$tanggal $jam",
                            "statusType" to statusType
                        ))
                    }
                }

                // Urutkan terbaru
                allData.sortByDescending { it["tanggal"] as? String ?: "" }

                // Tampilkan hari ini
                val todayStr = dateFormat.format(Date())
                filteredData.addAll(allData.filter {
                    (it["tanggal"] as? String ?: "").contains(todayStr)
                })

                handler.post {
                    updateAngkaTombol()
                    adapter.notifyDataSetChanged()
                    isLoading = false
                }
            } catch (e: Exception) {
                handler.post { isLoading = false }
            }
        }.start()
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