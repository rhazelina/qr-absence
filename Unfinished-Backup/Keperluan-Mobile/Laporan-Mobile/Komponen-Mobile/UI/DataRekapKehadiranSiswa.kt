package com.example.ritamesa

import android.content.Intent
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.Gravity
import android.view.LayoutInflater
import android.view.View
import android.widget.*
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.ritamesa.api.models.AttendanceResource
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

class DataRekapkehadiranSiswa : BaseNetworkActivity() {

    private lateinit var rvSiswa: RecyclerView
    private lateinit var etSearch: EditText

    private var adapter: SiswaAdapterWaka? = null
    private val allSiswaList = mutableListOf<SiswaRekap>()

    // ─── LIFECYCLE ────────────────────────────────────────────────

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.data_rekapkehadiran_siswa)
        initViews()
        setupNavigation()
        setupSearch()
        setupBackPressHandler()
        loadSiswaFromApi()
    }

    private fun initViews() {
        rvSiswa  = findViewById(R.id.rvKehadiran)
        etSearch = findViewById(R.id.editTextText5)
        rvSiswa.layoutManager = LinearLayoutManager(this)
        rvSiswa.setHasFixedSize(true)
    }

    // ─── LOAD DATA SISWA ──────────────────────────────────────────

    private fun loadSiswaFromApi() {
        rvSiswa.visibility = View.GONE
        lifecycleScope.launch {
            // FIX: perPage = 1000 (batas max API Laravel).
            // Total siswa 310 — satu request sudah cukup tanpa pagination.
            handleResult(
                studentRepository.getStudents(perPage = 1000),
                onSuccess = { students ->
                    allSiswaList.clear()
                    allSiswaList.addAll(students.mapIndexed { i, s ->
                        SiswaRekap(
                            id     = s.id ?: 0,
                            nomor  = i + 1,
                            nama   = s.name ?: "-",
                            nisn   = s.nisn ?: "-",
                            kelas  = s.studentClass?.name ?: s.className ?: "-",
                            jurusan = s.studentClass?.major
                                ?: s.displayMajorName().takeIf { it != "-" } ?: ""
                        )
                    })
                    rvSiswa.visibility = View.VISIBLE
                    if (allSiswaList.isEmpty()) showToast("Tidak ada data siswa")
                    else rebuildAdapter(allSiswaList)
                },
                onError = { _, msg ->
                    rvSiswa.visibility = View.VISIBLE
                    showError(msg ?: "Gagal memuat data siswa")
                }
            )
        }
    }

    private fun rebuildAdapter(list: List<SiswaRekap>) {
        adapter = SiswaAdapterWaka(list) { siswa -> openSiswaDetail(siswa) }
        rvSiswa.adapter = adapter
    }

    // ─── DETAIL POPUP ─────────────────────────────────────────────

    private fun openSiswaDetail(siswa: SiswaRekap) {
        if (siswa.id == 0) { showError("ID siswa tidak valid"); return }

        // Inflate popup — pastikan layout popup_siswa_detail ada
        val popupView = LayoutInflater.from(this)
            .inflate(R.layout.popup_siswa_detail, null)

        popupView.findViewById<TextView>(R.id.tvPopupNama).text  = siswa.nama
        popupView.findViewById<TextView>(R.id.tvPopupNisn).text  = siswa.nisn
        popupView.findViewById<TextView>(R.id.tvPopupKelas).text = siswa.getKelasJurusan()

        val container = popupView.findViewById<LinearLayout>(R.id.containerKehadiran)
        container.removeAllViews()
        container.addView(buildLabel("Memuat riwayat kehadiran…"))

        // Ukuran popup: 90% lebar layar, tinggi wrap_content
        val screenWidth = resources.displayMetrics.widthPixels
        val popupWidth  = (screenWidth * 0.92).toInt()

        val popup = PopupWindow(
            popupView,
            popupWidth,
            LinearLayout.LayoutParams.WRAP_CONTENT,
            true
        ).apply {
            setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
            elevation        = 24f
            isOutsideTouchable = true
        }

        popupView.findViewById<Button>(R.id.btnTutupPopup)
            .setOnClickListener { popup.dismiss() }

        // FIX: showAtLocation bisa crash jika window belum siap — gunakan post
        rvSiswa.post {
            if (!isFinishing && !isDestroyed) {
                popup.showAtLocation(window.decorView.rootView, Gravity.CENTER, 0, 0)
            }
        }

        lifecycleScope.launch {
            // Panggil API riwayat kehadiran siswa
            val result = studentRepository.getStudentAttendanceHistory(siswa.id)

            // Guard: jangan update UI jika popup sudah ditutup atau activity mati
            if (!popup.isShowing || isFinishing || isDestroyed) return@launch

            handleResult(
                result,
                onSuccess = { items ->
                    renderHistoryItems(container, items, siswa.nama)
                },
                onError = { _, msg ->
                    container.removeAllViews()
                    container.addView(
                        buildLabel(
                            "Gagal memuat: ${msg ?: "Error tidak diketahui"}",
                            Color.parseColor("#F44336")
                        )
                    )
                }
            )
        }
    }

    /**
     * Render daftar AttendanceResource ke dalam popup.
     *
     * AttendanceResource fields:
     *   .schedule?.subjectName  — nama mata pelajaran
     *   .schedule?.className    — nama kelas
     *   .schedule?.date         — tanggal kehadiran (YYYY-MM-DD)
     *   .status                 — present / absent / late / sick / excused / izin / dinas
     *   .reason                 — keterangan / alasan
     *   .timestamp / .checkedInAt — waktu check-in
     */
    private fun renderHistoryItems(
        container: LinearLayout,
        items: List<AttendanceResource>,
        namaLabel: String = ""
    ) {
        container.removeAllViews()

        if (items.isEmpty()) {
            container.addView(buildLabel("Belum ada riwayat kehadiran untuk $namaLabel"))
            return
        }

        // Urutkan dari terbaru
        val sorted = items.sortedByDescending { it.schedule?.date ?: "" }

        sorted.forEach { item ->
            val row = LayoutInflater.from(this)
                .inflate(R.layout.item_kehadiran_popup, container, false)

            val mapel   = item.schedule?.subjectName ?: "-"
            val kelas   = item.schedule?.className ?: "-"
            val tanggal = fmtDate(item.schedule?.date)

            // FIX: timestamp bisa berupa "HH:mm:ss", "yyyy-MM-dd HH:mm:ss", atau "yyyy-MM-ddTHH:mm:ss"
            val jam = fmtTime(item.timestamp ?: item.checkedInAt)

            row.findViewById<TextView>(R.id.tvTanggal).text    = tanggal
            row.findViewById<TextView>(R.id.tvMapelKelas).text = "$mapel / $kelas"
            row.findViewById<TextView>(R.id.tvJam).text        = if (jam != "-") "Check-in: $jam" else "-"
            row.findViewById<TextView>(R.id.tvKeterangan).text =
                item.reason?.trim()?.takeIf { it.isNotEmpty() } ?: "-"

            val tvStatus = row.findViewById<TextView>(R.id.tvStatus)
            tvStatus.text = statusLabel(item.status)
            tvStatus.setTextColor(statusColor(item.status))

            container.addView(row)
        }

        // Tambah ringkasan statistik di bawah daftar
        container.addView(buildSummaryView(items))
    }

    /** Ringkasan jumlah per status di bagian bawah popup */
    private fun buildSummaryView(items: List<AttendanceResource>): View {
        val counts = items.groupBy { it.status?.lowercase() }
        val hadir  = counts["present"]?.size ?: 0
        val telat  = counts["late"]?.size ?: 0
        val alpha  = counts["absent"]?.size ?: 0
        val sakit  = counts["sick"]?.size ?: 0
        val izin   = (counts["excused"]?.size ?: 0) + (counts["izin"]?.size ?: 0)
        val dinas  = counts["dinas"]?.size ?: 0

        return TextView(this).apply {
            text = "Rekap: Hadir $hadir  •  Telat $telat  •  Alpha $alpha" +
                    "  •  Sakit $sakit  •  Izin $izin" +
                    (if (dinas > 0) "  •  Dinas $dinas" else "")
            textSize = 11f
            setTextColor(Color.parseColor("#616161"))
            setPadding(16, 12, 16, 8)
            gravity = Gravity.CENTER
        }
    }

    // ─── SEARCH ───────────────────────────────────────────────────

    private fun setupSearch() {
        etSearch.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, st: Int, c: Int, a: Int) {}
            override fun afterTextChanged(s: Editable?) {}
            override fun onTextChanged(s: CharSequence?, st: Int, b: Int, c: Int) {
                filterList(s.toString().trim())
            }
        })
        // Tombol clear search (opsional)
        findViewById<ImageButton?>(R.id.imageButton17)?.setOnClickListener {
            etSearch.text.clear()
        }
    }

    private fun filterList(query: String) {
        val filtered = if (query.isEmpty()) {
            allSiswaList
        } else {
            val q = query.lowercase(Locale.getDefault())
            allSiswaList.filter { s ->
                s.nama.lowercase().contains(q) ||
                        s.nisn.lowercase().contains(q) ||
                        s.kelas.lowercase().contains(q) ||
                        s.jurusan.lowercase().contains(q)
            }
        }
        if (filtered.isEmpty() && query.isNotEmpty()) {
            showToast("Siswa \"$query\" tidak ditemukan")
        }
        rebuildAdapter(filtered)
    }

    // ─── NAVIGASI ─────────────────────────────────────────────────

    private fun setupNavigation() {
        findViewById<ImageButton?>(R.id.btnBack)?.setOnClickListener { goToDashboard() }
        findViewById<ImageButton?>(R.id.imageButton2)?.setOnClickListener { goToDashboard() }
        findViewById<ImageButton?>(R.id.imageButton3)?.setOnClickListener {
            Toast.makeText(this, "Sudah di halaman Data Rekap Siswa", Toast.LENGTH_SHORT).show()
        }
        findViewById<ImageButton?>(R.id.imageButton4)?.setOnClickListener {
            safeStart { Intent(this, JadwalPembelajaranGuru::class.java) }
        }
        // imageButton55 = alias imageButton5 di beberapa layout
        (findViewById<ImageButton?>(R.id.imageButton55)
            ?: findViewById(R.id.imageButton5))?.setOnClickListener {
            safeStart { Intent(this, StatistikWakaa::class.java) }
        }
        // Menu dropdown "Data Rekap" — pilih Guru atau Siswa
        findViewById<ImageButton?>(R.id.imageButton5)?.setOnClickListener { view ->
            PopupMenu(this, view).apply {
                menuInflater.inflate(R.menu.menu_data_rekap, menu)
                setOnMenuItemClickListener { item ->
                    when (item.itemId) {
                        R.id.menu_guru  -> {
                            startActivity(Intent(this@DataRekapkehadiranSiswa, DataRekapKehadiranGuru::class.java))
                            true
                        }
                        R.id.menu_siswa -> {
                            Toast.makeText(this@DataRekapkehadiranSiswa, "Sudah di halaman Siswa", Toast.LENGTH_SHORT).show()
                            true
                        }
                        else -> false
                    }
                }
                show()
            }
        }
    }

    private fun setupBackPressHandler() {
        onBackPressedDispatcher.addCallback(
            this,
            object : androidx.activity.OnBackPressedCallback(true) {
                override fun handleOnBackPressed() { goToDashboard() }
            }
        )
    }

    private fun goToDashboard() {
        startActivity(Intent(this, DashboardWaka::class.java))
        finish()
    }

    private fun safeStart(block: () -> Intent) {
        try { startActivity(block()) }
        catch (e: Exception) {
            Toast.makeText(this, "Halaman belum tersedia", Toast.LENGTH_SHORT).show()
        }
    }

    // ─── HELPER ───────────────────────────────────────────────────

    private fun buildLabel(msg: String, color: Int = Color.parseColor("#757575")) =
        TextView(this).apply {
            text      = msg
            textSize  = 13f
            gravity   = Gravity.CENTER
            setTextColor(color)
            setPadding(16, 32, 16, 32)
        }

    private fun statusLabel(s: String?) = when (s?.lowercase()) {
        "present"         -> "Hadir"
        "late"            -> "Terlambat"
        "absent"          -> "Alpha"
        "sick"            -> "Sakit"
        "excused", "izin" -> "Izin"
        "dinas"           -> "Dinas"
        "return"          -> "Pulang"
        else              -> s?.replaceFirstChar { it.uppercase() } ?: "-"
    }

    private fun statusColor(s: String?) = when (s?.lowercase()) {
        "present"         -> Color.parseColor("#4CAF50")
        "late"            -> Color.parseColor("#FF9800")
        "absent"          -> Color.parseColor("#F44336")
        "sick"            -> Color.parseColor("#FF9800")
        "excused", "izin" -> Color.parseColor("#2196F3")
        "dinas"           -> Color.parseColor("#9C27B0")
        "return"          -> Color.parseColor("#607D8B")
        else              -> Color.parseColor("#757575")
    }

    /**
     * Format tanggal dari "yyyy-MM-dd" → "dd MMM yyyy" (Bahasa Indonesia).
     * Aman terhadap null / string kosong.
     */
    private fun fmtDate(d: String?): String {
        if (d.isNullOrBlank()) return "-"
        return try {
            val sdfIn  = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
            val sdfOut = SimpleDateFormat("dd MMM yyyy", Locale.forLanguageTag("id-ID"))
            sdfOut.format(sdfIn.parse(d)!!)
        } catch (e: Exception) { d }
    }

    /**
     * Format waktu check-in.
     * Mendukung: "HH:mm:ss", "yyyy-MM-dd HH:mm:ss", "yyyy-MM-ddTHH:mm:ss", "yyyy-MM-ddTHH:mm:ssZ"
     */
    private fun fmtTime(t: String?): String {
        if (t.isNullOrBlank()) return "-"
        return when {
            t.contains("T") -> t.substringAfter("T").take(5)   // ISO-8601
            t.contains(" ") -> t.substringAfter(" ").take(5)   // "yyyy-MM-dd HH:mm:ss"
            else            -> t.take(5)                        // "HH:mm:ss"
        }
    }
}