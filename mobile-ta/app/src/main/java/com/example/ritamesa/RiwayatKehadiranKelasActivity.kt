package com.example.ritamesa

import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.widget.ImageButton
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class RiwayatKehadiranKelasActivity : BaseNetworkActivity() {
    private lateinit var recyclerView: RecyclerView
    private lateinit var txtJumlahSiswa: TextView
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
    private lateinit var adapter: SimpleSiswaAdapter
    
    private val allData = mutableListOf<Map<String, Any>>()
    private val filteredData = mutableListOf<Map<String, Any>>()
    private var filterActive: String? = null
    private var isLoading = false
    private val handler = Handler(Looper.getMainLooper())
    private val textColorActive = android.graphics.Color.WHITE
    private val textColorNormal = android.graphics.Color.parseColor("#4B5563")
    private val textColorDefault = android.graphics.Color.BLACK
    private val TOTAL_SISWA = 25
    
    companion object {
        private const val TAG = "RiwayatKehadiranKelasActivity"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.riwayat_kehadiran_kelas_pengurus)
        
        if (!initializeViews()) {
            showError("Gagal inisialisasi layout")
            finish()
            return
        }
        
        updateTanggalDisplay()
        setupRecyclerView()
        setupFilterButtons()
        setupFooterNavigation()
    }

    private fun initializeViews(): Boolean {
        return try {
            recyclerView = findViewById(R.id.recycler_riwayat)
                ?: throw NullPointerException("recycler_riwayat not found")
            txtJumlahSiswa = findViewById(R.id.text_jumlah_siswa)
                ?: throw NullPointerException("text_jumlah_siswa not found")
            txtHadirCount = findViewById(R.id.txt_hadir_count)
                ?: throw NullPointerException("txt_hadir_count not found")
            txtSakitCount = findViewById(R.id.txt_sakit_count)
                ?: throw NullPointerException("txt_sakit_count not found")
            txtIzinCount = findViewById(R.id.txt_izin_count)
                ?: throw NullPointerException("txt_izin_count not found")
            txtAlphaCount = findViewById(R.id.txt_alpha_count)
                ?: throw NullPointerException("txt_alpha_count not found")
            txtFilterTanggal = findViewById(R.id.text_filter_tanggal)
                ?: throw NullPointerException("text_filter_tanggal not found")
            btnHadir = findViewById(R.id.button_hadir)
                ?: throw NullPointerException("button_hadir not found")
            btnSakit = findViewById(R.id.button_sakit)
                ?: throw NullPointerException("button_sakit not found")
            btnIzin = findViewById(R.id.button_izin)
                ?: throw NullPointerException("button_izin not found")
            btnAlpha = findViewById(R.id.button_alpha)
                ?: throw NullPointerException("button_alpha not found")
            iconCalendar = findViewById(R.id.icon_calendar)
                ?: throw NullPointerException("icon_calendar not found")
            btnHome = findViewById(R.id.btnHome) ?: ImageButton(this)
            btnChart = findViewById(R.id.btnChart) ?: ImageButton(this)
            btnNotif = findViewById(R.id.btnNotif) ?: ImageButton(this)
            Log.d(TAG, "Views initialized successfully")
            true
        } catch (e: Exception) {
            Log.e(TAG, "Error initializeViews: ${e.message}", e)
            false
        }
    }

    private fun setupCalendarButton() {
        try {
            // ImageView hanya untuk display
            iconCalendar.setOnClickListener {
                Toast.makeText(
                    this,
                    "Riwayat kehadiran siswa XII RPL 2 hari ini",
                    Toast.LENGTH_SHORT
                ).show()
            }
            Log.d(TAG, "Calendar button setup complete")
        } catch (e: Exception) {
            Log.e(TAG, "Error setupCalendarButton: ${e.message}")
        }
    }

    private fun updateTanggalDisplay() {
        try {
            val sdf = SimpleDateFormat("EEEE, dd MMMM yyyy", Locale.forLanguageTag("id-ID"))
            val formatted = sdf.format(Date())

            val finalDate = if (formatted.isNotEmpty()) {
                formatted[0].uppercaseChar() + formatted.substring(1)
            } else {
                formatted
            }

            txtFilterTanggal.text = finalDate
        } catch (e: Exception) {
            Log.e(TAG, "Error updateTanggalDisplay: ${e.message}")
            val sdf = SimpleDateFormat("dd/MM/yyyy", Locale.getDefault())
            txtFilterTanggal.text = sdf.format(Date())
        }
    }

    private fun setupRecyclerView() {
        try {
            adapter = SimpleSiswaAdapter(this, filteredData)
            recyclerView.layoutManager = LinearLayoutManager(this)
            recyclerView.adapter = adapter
            recyclerView.setHasFixedSize(true)
            Log.d(TAG, "RecyclerView setup complete")
        } catch (e: Exception) {
            Log.e(TAG, "Error setupRecyclerView: ${e.message}")
        }
    }

    private fun setupFooterNavigation() {
        try {
            btnHome.setOnClickListener {
                safeNavigateTo(DashboardWaliKelasActivity::class.java, "Dashboard Wali Kelas")
            }

            // btnAssigment untuk refresh data dan reset filter
            findViewById<ImageButton>(R.id.btnAssigment)?.setOnClickListener {
                filterActive = null
                resetFilter()
                resetTextColors()
                updateTombolAktif()
                Toast.makeText(this, "Filter direset", Toast.LENGTH_SHORT).show()
            }

            btnChart.setOnClickListener {
                safeNavigateTo(TindakLanjutWaliKelasActivity::class.java, "Tindak Lanjut")
            }

            btnNotif.setOnClickListener {
                safeNavigateTo(NotifikasiWaliKelasActivity::class.java, "Notifikasi")
            }

            Log.d(TAG, "Footer navigation setup complete")
        } catch (e: Exception) {
            Log.e(TAG, "Error setupFooterNavigation: ${e.message}")
        }
    }

    private fun safeNavigateTo(activityClass: Class<*>, pageName: String) {
        try {
            val intent = Intent(this, activityClass)
            startActivity(intent)
        } catch (e: Exception) {
            Log.e(TAG, "Error navigating to $pageName: ${e.message}")
            Toast.makeText(this, "Gagal membuka $pageName", Toast.LENGTH_SHORT).show()
        }
    }

    private fun loadDataAsync() {
        if (isLoading) return
        isLoading = true

        lifecycleScope.launch {
            try {
                val result = attendanceRepository.getClassAttendanceByDate(classId = 0, date = "")
                handleResult(result,
                    onSuccess = { records ->
                        allData.clear()
                        records.forEachIndexed { index, record ->
                            val recordMap = record as? Map<String, Any> ?: emptyMap()
                            val status = recordMap["status"]?.toString()?.lowercase() ?: "hadir"
                            allData.add(mapOf(
                                "id" to (index + 1),
                                "nama" to (recordMap["name"]?.toString() ?: "-"),
                                "nisn" to (recordMap["nisn"]?.toString() ?: "-"),
                                "kelas" to (recordMap["className"]?.toString() ?: "XII RPL 2"),
                                "status" to status,
                                "status_type" to status,
                                "jam" to (recordMap["time"]?.toString() ?: "-"),
                                "tanggal" to (recordMap["date"]?.toString() ?: "-")
                            ))
                        }
                        
                        adapter.notifyDataSetChanged()
                        updateAngkaTombol()
                        updateTotalSiswa()
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

    private fun loadDataAsyncOld() {
        try {
            allData.clear()

            // Nama siswa kelas XII RPL 2 (25 siswa)
            val namaSiswa = listOf(
                "Rayhanun", "Saidatul Hasanah", "Nurul Khasanah", "Lely Sagita",
                "Noverita Pascalia", "Nindi Narita", "Rita Aura", "Raena Westi",
                "Abyl Gustian", "Ibnu Rafi", "Hadi Firmansyah", "Rayyan Dava",
                "Maya Melinda", "Niswatul Khoiriyah", "Reisya Maulidiva", "Novita Andriani",
                "Rizki Ramadhani", "Laura Lavidaloca", "Rhameizha Alea", "Novita Andriani",
                "Suci Ramadani", "Rachel Aluna", "Talitha Nudia", "Nadia Sinta",
                "Muh Wisnu"
            )

            // Mapel yang diajar di XII RPL 2
            val mapelList = listOf("PKDK", "MPP", "Matematika")

            // Guru yang mengajar (termasuk wali kelas sendiri)
            val guruList = listOf(
                "Pak Darmawan", "Bu Sri", "Pak Ahmad", "Bu Rina", "Pak Bambang"
            )

            // Distribusi status: 20 hadir, 2 izin, 1 sakit, 2 alpha
            val statusDistribution = mutableListOf<String>().apply {
                repeat(20) { add("hadir") }
                repeat(2) { add("izin") }
                repeat(1) { add("sakit") }
                repeat(2) { add("alpha") }
            }.shuffled()

            for (i in 0 until TOTAL_SISWA) {
                val nama = namaSiswa[i]
                val jurusan = "XII RPL 2"  // Semua siswa dari kelas yang sama
                val mapel = mapelList[i % mapelList.size]
                val guru = guruList[i % guruList.size]
                val statusType = statusDistribution[i]

                val keterangan = when (statusType) {
                    "hadir" -> "Siswa Hadir di Kelas"
                    "sakit" -> "Siswa Tidak Hadir (Sakit)"
                    "izin" -> "Siswa Izin Tidak Hadir"
                    "alpha" -> "Siswa Tidak Hadir Tanpa Keterangan"
                    else -> "Status Tidak Diketahui"
                }

                allData.add(mapOf(
                    "id" to i + 1,
                    "nama" to nama,
                    "jurusan" to jurusan,
                    "mapelGuru" to "$mapel,[$guru]",
                    "keterangan" to keterangan,
                    "statusType" to statusType
                ))
            }

            filteredData.addAll(allData)
            Log.d(TAG, "Data siswa XII RPL 2 dibuat: ${allData.size} item")
        } catch (e: Exception) {
            Log.e(TAG, "Error buatDataDummySiswaXIIRPL2: ${e.message}", e)
            throw e
        }
    }

    private fun setupFilterButtons() {
        try {
            btnHadir.setOnClickListener { runOnUiThread { toggleFilter("hadir") } }
            btnSakit.setOnClickListener { runOnUiThread { toggleFilter("sakit") } }
            btnIzin.setOnClickListener { runOnUiThread { toggleFilter("izin") } }
            btnAlpha.setOnClickListener { runOnUiThread { toggleFilter("alpha") } }
            Log.d(TAG, "Filter buttons setup complete")
        } catch (e: Exception) {
            Log.e(TAG, "Error setupFilterButtons: ${e.message}")
        }
    }

    private fun toggleFilter(status: String) {
        try {
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
        } catch (e: Exception) {
            Log.e(TAG, "Error toggleFilter: ${e.message}", e)
        }
    }

    private fun applyFilter(status: String) {
        try {
            filteredData.clear()
            filteredData.addAll(allData.filter { it["statusType"] == status })
            adapter.notifyDataSetChanged()
            // Jumlah total siswa TETAP TOTAL_SISWA, tidak berubah
            updateTotalSiswa()
        } catch (e: Exception) {
            Log.e(TAG, "Error applyFilter: ${e.message}", e)
        }
    }

    private fun resetFilter() {
        try {
            filteredData.clear()
            filteredData.addAll(allData)
            adapter.notifyDataSetChanged()
            // Saat reset, hitung ulang statistik
            updateAngkaTombol()
            updateTotalSiswa()
        } catch (e: Exception) {
            Log.e(TAG, "Error resetFilter: ${e.message}", e)
        }
    }

    private fun updateTombolAktif() {
        try {
            // Reset semua tombol ke state normal
            try {
                btnHadir.setImageResource(R.drawable.btn_guru_hadir)
                btnSakit.setImageResource(R.drawable.btn_guru_sakit)
                btnIzin.setImageResource(R.drawable.btn_guru_izin)
                btnAlpha.setImageResource(R.drawable.btn_guru_alpha)
            } catch (e: Exception) {
                Log.w(TAG, "Using default button images: ${e.message}")
                val defaultDrawable = android.R.drawable.ic_menu_save
                btnHadir.setImageResource(defaultDrawable)
                btnSakit.setImageResource(defaultDrawable)
                btnIzin.setImageResource(defaultDrawable)
                btnAlpha.setImageResource(defaultDrawable)
            }

            // Set aktif
            try {
                when (filterActive) {
                    "hadir" -> btnHadir.setImageResource(R.drawable.btn_guru_hadir_active)
                    "sakit" -> btnSakit.setImageResource(R.drawable.btn_guru_sakit_active)
                    "izin" -> btnIzin.setImageResource(R.drawable.btn_guru_izin_active)
                    "alpha" -> btnAlpha.setImageResource(R.drawable.btn_guru_alpha_active)
                }
            } catch (e: Exception) {
                Log.w(TAG, "Cannot set active button images: ${e.message}")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error updateTombolAktif: ${e.message}", e)
        }
    }

    private fun updateTextColors(activeStatus: String) {
        try {
            // Reset semua teks ke warna normal
            resetTextColors()

            // Set teks aktif menjadi putih
            when (activeStatus) {
                "hadir" -> txtHadirCount.setTextColor(textColorActive)
                "sakit" -> txtSakitCount.setTextColor(textColorActive)
                "izin" -> txtIzinCount.setTextColor(textColorActive)
                "alpha" -> txtAlphaCount.setTextColor(textColorActive)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error updateTextColors: ${e.message}", e)
        }
    }

    private fun resetTextColors() {
        try {
            // Set semua teks ke warna normal
            txtHadirCount.setTextColor(textColorNormal)
            txtSakitCount.setTextColor(textColorNormal)
            txtIzinCount.setTextColor(textColorNormal)
            txtAlphaCount.setTextColor(textColorNormal)
        } catch (e: Exception) {
            Log.e(TAG, "Error resetTextColors: ${e.message}", e)
            // Fallback ke warna default
            txtHadirCount.setTextColor(textColorDefault)
            txtSakitCount.setTextColor(textColorDefault)
            txtIzinCount.setTextColor(textColorDefault)
            txtAlphaCount.setTextColor(textColorDefault)
        }
    }

    private fun updateAngkaTombol() {
        try {
            var hadir = 0
            var sakit = 0
            var izin = 0
            var alpha = 0

            // Hitung dari allData, karena ini adalah statistik total hari ini
            synchronized(allData) {
                for (data in allData) {
                    when (data["statusType"]) {
                        "hadir" -> hadir++
                        "sakit" -> sakit++
                        "izin" -> izin++
                        "alpha" -> alpha++
                    }
                }
            }

            runOnUiThread {
                txtHadirCount.text = hadir.toString()
                txtSakitCount.text = sakit.toString()
                txtIzinCount.text = izin.toString()
                txtAlphaCount.text = alpha.toString()
            }

            Log.d(TAG, "XII RPL 2 - Status counts: Hadir=$hadir, Sakit=$sakit, Izin=$izin, Alpha=$alpha")
        } catch (e: Exception) {
            Log.e(TAG, "Error updateAngkaTombol: ${e.message}", e)
        }
    }

    private fun updateTotalSiswa() {
        try {
            // Total siswa TETAP 25, tidak berubah meskipun difilter
            txtJumlahSiswa.text = "Total Jumlah Siswa XII RPL 2 : $TOTAL_SISWA"
        } catch (e: Exception) {
            Log.e(TAG, "Error updateTotalSiswa: ${e.message}", e)
        }
    }

    private fun showErrorAndExit(message: String) {
        Toast.makeText(this, message, Toast.LENGTH_LONG).show()
        handler.postDelayed({
            finish()
        }, 3000)
    }

    override fun onDestroy() {
        super.onDestroy()
        handler.removeCallbacksAndMessages(null)
        Log.d(TAG, "=== RiwayatKehadiranKelasActivity XII RPL 2 DESTROYED ===")
    }
}