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
import com.example.ritamesa.api.models.TeacherAttendanceHistoryResponse
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

class DataRekapKehadiranGuru : BaseNetworkActivity() {

    private lateinit var rvGuru: RecyclerView
    private lateinit var etSearch: EditText

    private var adapter: GuruAdapterWaka? = null
    private val allGuruList = mutableListOf<GuruRekap>()

    // ─── LIFECYCLE ────────────────────────────────────────────────

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.data_rekapkehadiran_guru)
        initViews()
        setupNavigation()
        setupSearch()
        setupBackPressHandler()
        loadGuruFromApi()
    }

    private fun initViews() {
        rvGuru   = findViewById(R.id.rvGuru)
        etSearch = findViewById(R.id.editTextText)
        rvGuru.layoutManager = LinearLayoutManager(this)
        rvGuru.setHasFixedSize(true)
    }

    // ─── LOAD DATA GURU ───────────────────────────────────────────

    private fun loadGuruFromApi() {
        rvGuru.visibility = View.GONE
        lifecycleScope.launch {
            handleResult(
                teacherRepository.getTeachers(perPage = 200),
                onSuccess = { teachers ->
                    allGuruList.clear()
                    allGuruList.addAll(teachers.mapIndexed { i, t ->
                        GuruRekap(
                            id      = t.id ?: 0,
                            nomor   = i + 1,
                            nama    = t.name ?: "-",
                            nip     = t.nip ?: "-",
                            jabatan = t.jabatan.ifBlank { "Guru" }
                        )
                    })
                    rvGuru.visibility = View.VISIBLE
                    if (allGuruList.isEmpty()) showToast("Tidak ada data guru")
                    else rebuildAdapter(allGuruList)
                },
                onError = { _, msg ->
                    rvGuru.visibility = View.VISIBLE
                    showError(msg ?: "Gagal memuat data guru")
                }
            )
        }
    }

    private fun rebuildAdapter(list: List<GuruRekap>) {
        adapter = GuruAdapterWaka(list) { guru -> openGuruDetail(guru) }
        rvGuru.adapter = adapter
    }

    // ─── DETAIL POPUP ─────────────────────────────────────────────

    private fun openGuruDetail(guru: GuruRekap) {
        if (guru.id == 0) { showError("ID guru tidak valid"); return }

        val popupView = LayoutInflater.from(this)
            .inflate(R.layout.popup_guru_detail, null)

        popupView.findViewById<TextView>(R.id.tvPopupNama).text  = guru.nama
        popupView.findViewById<TextView>(R.id.tvPopupNip).text   = guru.nip
        popupView.findViewById<TextView>(R.id.tvPopupMapel).text = guru.jabatan

        val container = popupView.findViewById<LinearLayout>(R.id.containerKehadiran)
        container.removeAllViews()
        container.addView(buildLabel("Memuat riwayat kehadiran…"))

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

        // FIX: showAtLocation dengan post agar window sudah siap
        rvGuru.post {
            if (!isFinishing && !isDestroyed) {
                popup.showAtLocation(window.decorView.rootView, Gravity.CENTER, 0, 0)
            }
        }

        lifecycleScope.launch {
            fetchAndRenderGuruHistory(guru.id, guru.nama, container, popup)
        }
    }

    /**
     * Fetch riwayat kehadiran guru dari:
     *   GET /api/teachers/{teacher}/attendance-history
     *
     * FIX: TeacherRepository.getTeacherAttendanceHistory() mengembalikan
     *      Result<TeacherAttendanceHistoryResponse> — akses .history langsung.
     * FIX: Guard isFinishing / isDestroyed agar tidak crash saat Activity mati.
     */
    private suspend fun fetchAndRenderGuruHistory(
        teacherId: Int,
        namaGuru: String,
        container: LinearLayout,
        popup: PopupWindow
    ) {
        val result = teacherRepository.getTeacherAttendanceHistory(teacherId)

        if (!popup.isShowing || isFinishing || isDestroyed) return

        when (result) {
            is com.example.ritamesa.api.Result.Success -> {
                renderGuruHistoryItems(container, result.data, namaGuru)
            }
            is com.example.ritamesa.api.Result.Error -> {
                container.removeAllViews()
                container.addView(
                    buildLabel(
                        "Gagal memuat: ${result.message ?: "Error tidak diketahui"}",
                        Color.parseColor("#F44336")
                    )
                )
            }
            else -> {}
        }
    }

    private fun renderGuruHistoryItems(
        container: LinearLayout,
        historyResponse: TeacherAttendanceHistoryResponse,
        namaGuru: String = ""
    ) {
        container.removeAllViews()
        val items = historyResponse.history

        if (items.isEmpty()) {
            container.addView(buildLabel("Belum ada riwayat kehadiran untuk $namaGuru"))
            return
        }

        // Urutkan dari terbaru
        val sorted = items.sortedByDescending { it.date ?: "" }

        sorted.forEach { item ->
            val mapel     = item.schedule?.subject?.name ?: "-"
            val kelas     = item.schedule?.dailySchedule?.classSchedule?.classData?.name ?: "-"
            val startTime = item.schedule?.startTime
            val endTime   = item.schedule?.endTime
            val date      = item.date
            val status    = item.status
            val reason    = item.reason

            val row = LayoutInflater.from(this)
                .inflate(R.layout.item_kehadiran_popup, container, false)

            row.findViewById<TextView>(R.id.tvTanggal).text    = fmtDate(date)
            row.findViewById<TextView>(R.id.tvMapelKelas).text = "$mapel / Kelas $kelas"
            row.findViewById<TextView>(R.id.tvJam).text        =
                "${fmtTime(startTime)} – ${fmtTime(endTime)}"
            row.findViewById<TextView>(R.id.tvKeterangan).text =
                reason?.trim()?.takeIf { it.isNotEmpty() } ?: "-"

            val tvStatus = row.findViewById<TextView>(R.id.tvStatus)
            tvStatus.text = statusLabel(status)
            tvStatus.setTextColor(statusColor(status))

            container.addView(row)
        }

        // Ringkasan statistik
        container.addView(buildSummaryView(items.map { it.status }))
    }

    /** Ringkasan jumlah per status */
    private fun buildSummaryView(statuses: List<String?>): View {
        val counts = statuses.groupBy { it?.lowercase() }
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
        findViewById<ImageButton?>(R.id.imageButton12)?.setOnClickListener {
            etSearch.text.clear()
        }
    }

    private fun filterList(query: String) {
        val filtered = if (query.isEmpty()) {
            allGuruList
        } else {
            val q = query.lowercase(Locale.getDefault())
            allGuruList.filter { g ->
                g.nama.lowercase().contains(q) ||
                        g.nip.lowercase().contains(q)  ||
                        g.jabatan.lowercase().contains(q)
            }
        }
        if (filtered.isEmpty() && query.isNotEmpty()) {
            showToast("Guru \"$query\" tidak ditemukan")
        }
        rebuildAdapter(filtered)
    }

    // ─── NAVIGASI ─────────────────────────────────────────────────

    private fun setupNavigation() {
        findViewById<ImageButton?>(R.id.btnBack)?.setOnClickListener { goToDashboard() }
        findViewById<ImageButton?>(R.id.imageButton2)?.setOnClickListener { goToDashboard() }
        findViewById<ImageButton?>(R.id.imageButton3)?.setOnClickListener {
            Toast.makeText(this, "Sudah di halaman Data Rekap Guru", Toast.LENGTH_SHORT).show()
        }
        findViewById<ImageButton?>(R.id.imageButton4)?.setOnClickListener {
            safeStart { Intent(this, JadwalPembelajaranGuru::class.java) }
        }
        findViewById<ImageButton?>(R.id.imageButton5)?.setOnClickListener {
            safeStart { Intent(this, StatistikWakaa::class.java) }
        }
        // Menu dropdown pilih halaman Guru / Siswa
        findViewById<ImageButton?>(R.id.imageButton20)?.setOnClickListener { view ->
            PopupMenu(this, view).apply {
                menuInflater.inflate(R.menu.menu_data_rekap, menu)
                setOnMenuItemClickListener { item ->
                    when (item.itemId) {
                        R.id.menu_guru  -> {
                            Toast.makeText(this@DataRekapKehadiranGuru, "Sudah di halaman Guru", Toast.LENGTH_SHORT).show()
                            true
                        }
                        R.id.menu_siswa -> {
                            startActivity(Intent(this@DataRekapKehadiranGuru, DataRekapkehadiranSiswa::class.java))
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

    private fun fmtDate(d: String?): String {
        if (d.isNullOrBlank()) return "-"
        return try {
            val sdfIn  = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
            val sdfOut = SimpleDateFormat("dd MMM yyyy", Locale.forLanguageTag("id-ID"))
            sdfOut.format(sdfIn.parse(d)!!)
        } catch (e: Exception) { d }
    }

    /** Format waktu dari berbagai format API */
    private fun fmtTime(t: String?): String {
        if (t.isNullOrBlank()) return "-"
        return when {
            t.contains("T") -> t.substringAfter("T").take(5)
            t.contains(" ") -> t.substringAfter(" ").take(5)
            else            -> t.take(5)
        }
    }
}

// ─── MODEL LOKAL ──────────────────────────────────────────────────

data class GuruRekap(
    val id: Int,
    val nomor: Int = 0,
    val nama: String,
    val nip: String,
    val jabatan: String
)