package com.example.ritamesa

import android.app.Dialog
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.Window
import android.widget.*
import androidx.activity.enableEdgeToEdge
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.ritamesa.api.models.UpdateLeavePermissionRequest
import kotlinx.coroutines.launch

class PersetujuanDispensasi : BaseNetworkActivity() {

    private lateinit var recyclerView: RecyclerView
    private lateinit var adapter: DispensasiAdapter
    // FIX: inisialisasi dengan list kosong agar setupRecyclerView tidak crash sebelum data tiba
    private var allDispensasiList: MutableList<Dispensasi> = mutableListOf()
    private var currentFilter: StatusDispensasi? = null
    private lateinit var searchEditText: EditText
    private lateinit var kelasDropdown: TextView

    private val kelasList = listOf(
        "Semua Kelas",
        "10 Rekayasa Perangkat Lunak 1", "10 Rekayasa Perangkat Lunak 2", "10 Rekayasa Perangkat Lunak 3",
        "10 Teknik Komputer Jaringan 1", "10 Teknik Komputer Jaringan 2", "10 Teknik Komputer Jaringan 3",
        "10 Desain Komunikasi Visual 1", "10 Desain Komunikasi Visual 2", "10 Desain Komunikasi Visual 3",
        "11 Rekayasa Perangkat Lunak 1", "11 Rekayasa Perangkat Lunak 2", "11 Rekayasa Perangkat Lunak 3",
        "11 Teknik Komputer Jaringan 1", "11 Teknik Komputer Jaringan 2", "11 Teknik Komputer Jaringan 3",
        "11 Desain Komunikasi Visual 1", "11 Desain Komunikasi Visual 2", "11 Desain Komunikasi Visual 3",
        "12 Rekayasa Perangkat Lunak 1", "12 Rekayasa Perangkat Lunak 2", "12 Rekayasa Perangkat Lunak 3",
        "12 Teknik Komputer Jaringan 1", "12 Teknik Komputer Jaringan 2", "12 Teknik Komputer Jaringan 3",
        "12 Desain Komunikasi Visual 1", "12 Desain Komunikasi Visual 2", "12 Desain Komunikasi Visual 3"
    )

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.persetujuan_dispensasi)
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        // FIX: setup UI dulu dengan list kosong, baru load data
        setupRecyclerView()
        setupFilterButtons()
        setupBackButton()
        setupSearch()
        setupKelasDropdown()
        loadAllDispensasi()
    }

    /**
     * FIX: Load semua leave-permissions tanpa filter status agar
     * semua tab (Semua/Menunggu/Disetujui/Ditolak) bisa tampil.
     * FIX: Hanya gunakan field yang ada di StudentLeavePermission:
     * id, student, studentClass, createdAt, startTime, endTime, reason, status
     */
    private fun loadAllDispensasi() {
        lifecycleScope.launch {
            try {
                // Check if user is Wali Kelas
                val prefs = AppPreferences(this@PersetujuanDispensasi)
                val homeroomClassIdStr = prefs.getHomeroomClassIdSync()
                val classId = homeroomClassIdStr?.toIntOrNull()

                // If classId exists, fetch specific class permissions, else handle universally or show error
                val result = if (classId != null && classId > 0) {
                    teacherRepository.getClassLeavePermissions(classId)
                } else {
                    // Fallback to general fetch if no homeroom class is bound
                    leavePermissionRepository.getLeavePermissions(status = null)
                }

                handleResult(result,
                    onSuccess = { permissions ->
                        allDispensasiList = permissions.map { permission ->
                            Dispensasi(
                                id = permission.id ?: -1,
                                namaSiswa = permission.student?.name ?: "-",
                                kelas = permission.studentClass?.name ?: "-",
                                mataPelajaran = "-",
                                hari = getDayName(permission.createdAt),
                                tanggal = formatDate(permission.createdAt ?: "-"),
                                jamKe = "${permission.startTime ?: "-"} - ${permission.endTime ?: "-"}",
                                guruPengajar = "-",
                                catatan = permission.reason ?: "-",
                                status = mapStatus(permission.status),
                                studentId = permission.student?.id ?: -1
                            )
                        }.toMutableList()
                        adapter.updateList(allDispensasiList)
                    },
                    onError = { _, msg ->
                        showError("Gagal memuat dispensasi: $msg")
                        allDispensasiList = mutableListOf()
                        adapter.updateList(allDispensasiList)
                    }
                )
            } catch (e: Exception) {
                showError("Error: ${e.message}")
                allDispensasiList = mutableListOf()
                adapter.updateList(allDispensasiList)
            }
        }
    }

    private fun mapStatus(statusStr: String?): StatusDispensasi = when (statusStr?.lowercase()) {
        "approved" -> StatusDispensasi.DISETUJUI
        "rejected" -> StatusDispensasi.DITOLAK
        else -> StatusDispensasi.MENUNGGU
    }

    private fun getDayName(dateStr: String?): String {
        if (dateStr.isNullOrEmpty()) return "-"
        return try {
            val sdf = java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale("id", "ID"))
            val date = sdf.parse(dateStr.take(10)) ?: return "-"
            val cal = java.util.Calendar.getInstance()
            cal.time = date
            val days = arrayOf("Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu")
            days[cal.get(java.util.Calendar.DAY_OF_WEEK) - 1]
        } catch (e: Exception) { "-" }
    }

    private fun formatDate(dateStr: String): String {
        return try {
            val sdfIn = java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.getDefault())
            val sdfOut = java.text.SimpleDateFormat("dd MMM yyyy", java.util.Locale("id", "ID"))
            val date = sdfIn.parse(dateStr.take(10)) ?: return dateStr
            sdfOut.format(date)
        } catch (e: Exception) { dateStr }
    }

    private fun setupRecyclerView() {
        recyclerView = findViewById(R.id.recyclerViewDispensasi)
        recyclerView.layoutManager = LinearLayoutManager(this)
        adapter = DispensasiAdapter(allDispensasiList) { dispensasi ->
            showDetailDialog(dispensasi)
        }
        recyclerView.adapter = adapter
    }

    private fun setupFilterButtons() {
        val buttonSemua: Button = findViewById(R.id.buttonSemua)
        val buttonMenunggu: Button = findViewById(R.id.buttonMenunggu)
        val buttonDisetujui: Button = findViewById(R.id.buttonDisetujui)
        val buttonDitolak: Button = findViewById(R.id.buttonDitolak)

        buttonSemua.setOnClickListener { currentFilter = null; applyFilters(); highlightButton(buttonSemua) }
        buttonMenunggu.setOnClickListener { currentFilter = StatusDispensasi.MENUNGGU; applyFilters(); highlightButton(buttonMenunggu) }
        buttonDisetujui.setOnClickListener { currentFilter = StatusDispensasi.DISETUJUI; applyFilters(); highlightButton(buttonDisetujui) }
        buttonDitolak.setOnClickListener { currentFilter = StatusDispensasi.DITOLAK; applyFilters(); highlightButton(buttonDitolak) }

        highlightButton(buttonSemua)
    }

    private fun highlightButton(selectedButton: Button) {
        listOf(
            findViewById<Button>(R.id.buttonSemua),
            findViewById(R.id.buttonMenunggu),
            findViewById(R.id.buttonDisetujui),
            findViewById(R.id.buttonDitolak)
        ).forEach { btn ->
            btn.setBackgroundResource(R.drawable.button_filter_unselected)
            btn.setTextColor(Color.BLACK)
        }
        selectedButton.setBackgroundResource(R.drawable.button_filter_selected)
        selectedButton.setTextColor(Color.WHITE)
    }

    private fun applyFilters() {
        val searchQuery = if (::searchEditText.isInitialized) searchEditText.text.toString() else ""
        val selectedKelas = if (::kelasDropdown.isInitialized) kelasDropdown.text.toString() else "Semua Kelas"
        filterList(currentFilter, searchQuery, selectedKelas)
    }

    private fun filterList(status: StatusDispensasi?, searchQuery: String, selectedKelas: String) {
        val filteredList = allDispensasiList.filter { dispensasi ->
            val statusMatch = status == null || dispensasi.status == status
            val nameMatch = searchQuery.isEmpty() ||
                    dispensasi.namaSiswa.contains(searchQuery, ignoreCase = true)
            val kelasMatch = selectedKelas == "Semua Kelas" ||
                    selectedKelas == "Kelas/jurusan" ||
                    dispensasi.kelas.contains(selectedKelas, ignoreCase = true)
            statusMatch && nameMatch && kelasMatch
        }
        adapter.updateList(filteredList)
    }

    private fun setupBackButton() {
        findViewById<ImageButton>(R.id.imageButton2).setOnClickListener { finish() }
    }

    private fun setupSearch() {
        searchEditText = findViewById(R.id.searchEditText)
        searchEditText.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) { applyFilters() }
        })
    }

    private fun setupKelasDropdown() {
        kelasDropdown = findViewById(R.id.textView45)
        val dropdownButton: ImageButton = findViewById(R.id.imageButton4)
        dropdownButton.setOnClickListener { showKelasDropdownDialog() }
        kelasDropdown.setOnClickListener { showKelasDropdownDialog() }
    }

    private fun showKelasDropdownDialog() {
        try {
            val dialog = Dialog(this)
            dialog.requestWindowFeature(Window.FEATURE_NO_TITLE)
            dialog.setContentView(R.layout.dropdown_kelas_layout)
            dialog.window?.setBackgroundDrawable(ColorDrawable(Color.WHITE))
            dialog.window?.setLayout(
                (resources.displayMetrics.widthPixels * 0.8).toInt(),
                (resources.displayMetrics.heightPixels * 0.6).toInt()
            )
            val listView = dialog.findViewById<ListView>(R.id.listViewKelas)
            val adapter = ArrayAdapter(this, R.layout.dropdown_kelas, kelasList)
            listView.adapter = adapter
            listView.setOnItemClickListener { _, _, position, _ ->
                kelasDropdown.text = kelasList[position]
                applyFilters()
                dialog.dismiss()
            }
            dialog.show()
        } catch (e: Exception) {
            Toast.makeText(this, "Error: ${e.message}", Toast.LENGTH_LONG).show()
        }
    }

    private fun showDetailDialog(dispensasi: Dispensasi) {
        val dialog = Dialog(this)
        dialog.requestWindowFeature(Window.FEATURE_NO_TITLE)
        dialog.setContentView(R.layout.detail_persetujuan_dispensasi)
        dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
        dialog.window?.setLayout(
            (resources.displayMetrics.widthPixels * 0.95).toInt(),
            (resources.displayMetrics.heightPixels * 0.85).toInt()
        )

        dialog.findViewById<TextView>(R.id.textView)?.text = dispensasi.namaSiswa
        dialog.findViewById<TextView>(R.id.textView2)?.text = dispensasi.hari
        dialog.findViewById<TextView>(R.id.textView3)?.text = dispensasi.tanggal
        dialog.findViewById<TextView>(R.id.textView19)?.text = dispensasi.jamKe
        dialog.findViewById<TextView>(R.id.textView20)?.text = dispensasi.kelas
        dialog.findViewById<TextView>(R.id.textView21)?.text = dispensasi.mataPelajaran
        dialog.findViewById<TextView>(R.id.textView22)?.text = dispensasi.guruPengajar
        dialog.findViewById<TextView>(R.id.textView24)?.text = dispensasi.catatan

        val btnSetujui = dialog.findViewById<Button>(R.id.button)
        val btnTolak = dialog.findViewById<Button>(R.id.button6)

        // FIX: sembunyikan tombol jika bukan status MENUNGGU
        if (dispensasi.status != StatusDispensasi.MENUNGGU) {
            btnSetujui?.visibility = android.view.View.GONE
            btnTolak?.visibility = android.view.View.GONE
        }

        // FIX: Setujui → panggil API, update list lokal
        btnSetujui?.setOnClickListener {
            if (dispensasi.id <= 0) { showError("ID dispensasi tidak valid"); return@setOnClickListener }
            updateDispensasiStatus(dispensasi, "approved", dialog)
        }

        // FIX: Tolak → panggil API, update list lokal
        btnTolak?.setOnClickListener {
            if (dispensasi.id <= 0) { showError("ID dispensasi tidak valid"); return@setOnClickListener }
            updateDispensasiStatus(dispensasi, "rejected", dialog)
        }

        dialog.show()
    }

    private fun updateDispensasiStatus(dispensasi: Dispensasi, newStatus: String, dialog: Dialog) {
        lifecycleScope.launch {
            try {
                val request = UpdateLeavePermissionRequest(status = newStatus)
                val result = leavePermissionRepository.updateLeavePermission(dispensasi.id, request)
                handleResult(result,
                    onSuccess = { updatedPermission ->
                        val index = allDispensasiList.indexOfFirst { it.id == dispensasi.id }
                        if (index != -1) {
                            allDispensasiList[index] = dispensasi.copy(
                                status = mapStatus(updatedPermission.status)
                            )
                            applyFilters()
                        }
                        val msg = if (newStatus == "approved")
                            "Dispensasi ${dispensasi.namaSiswa} disetujui"
                        else
                            "Dispensasi ${dispensasi.namaSiswa} ditolak"
                        showSuccess(msg)
                        dialog.dismiss()
                    },
                    onError = { _, msg ->
                        showError("Gagal update status: $msg")
                    }
                )
            } catch (e: Exception) {
                showError("Error: ${e.message}")
            }
        }
    }
}