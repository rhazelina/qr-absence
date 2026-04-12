package com.example.ritamesa

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.EditText
import android.widget.ImageButton
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.Spinner
import android.widget.TextView
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.asRequestBody
import kotlinx.coroutines.launch
import java.io.File
import java.io.FileOutputStream
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
    private var selectedDate: String = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
    private val handler = Handler(Looper.getMainLooper())
    private val textColorActive = android.graphics.Color.WHITE
    private val textColorNormal = android.graphics.Color.parseColor("#4B5563")
    private val textColorDefault = android.graphics.Color.BLACK
    private var selectedAttachmentUri: Uri? = null
    private var currentAttachmentNameView: TextView? = null

    private val filePickerLauncher = registerForActivityResult(
        ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        selectedAttachmentUri = uri
        currentAttachmentNameView?.text = if (uri != null) getFileName(uri) else "Masukkan Bukti Surat"
    }

    companion object {
        private const val TAG = "RiwayatKehadiranKelasActivity"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.riwayat_kehadiran_kelas)

        if (!initializeViews()) {
            showError("Gagal inisialisasi layout")
            finish()
            return
        }

        updateTanggalDisplay()
        setupCalendarButton()
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
            iconCalendar.setOnClickListener {
                val now = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).parse(selectedDate) ?: Date()
                val cal = java.util.Calendar.getInstance().apply { time = now }
                android.app.DatePickerDialog(
                    this,
                    { _, year, month, dayOfMonth ->
                        selectedDate = String.format("%04d-%02d-%02d", year, month + 1, dayOfMonth)
                        updateTanggalDisplay()
                        loadDataAsync()
                    },
                    cal.get(java.util.Calendar.YEAR),
                    cal.get(java.util.Calendar.MONTH),
                    cal.get(java.util.Calendar.DAY_OF_MONTH)
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
            val parsed = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).parse(selectedDate) ?: Date()
            val formatted = sdf.format(parsed)

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
            adapter = SimpleSiswaAdapter(
                this,
                filteredData,
                onMarkPresent = { item -> updateAttendanceStatus(item, "present") },
                onMarkAbsent = { item -> updateAttendanceStatus(item, "absent") },
                onOpenExcuseDialog = { item -> showExcuseDialog(item) }
            )
            recyclerView.layoutManager = LinearLayoutManager(this)
            recyclerView.adapter = adapter
            recyclerView.setHasFixedSize(true)
            Log.d(TAG, "RecyclerView setup complete")

            // Trigger load data setelah setup selesai
            loadDataAsync()
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
                val classId = resolveHomeroomClassId()
                if (classId == null || classId == 0) {
                    showError("ID Kelas tidak ditemukan. Silakan login ulang.")
                    txtJumlahSiswa.text = "Data Kelas Belum Diatur"
                    isLoading = false
                    return@launch
                }

                val studentsResult = teacherRepository.getMyHomeroomStudents()
                val attendanceResult = attendanceRepository.getClassAttendanceByDate(classId = classId, date = selectedDate)

                handleResult(
                    studentsResult,
                    onSuccess = { students ->
                        handleResult(
                            attendanceResult,
                            onSuccess = { records ->
                                val attendanceByStudentId = records
                                    .filter { it.student?.id != null }
                                    .groupBy { it.student?.id!! }
                                    .mapValues { (_, studentRecords) -> selectRepresentativeAttendance(studentRecords) }

                                allData.clear()
                                students.forEach { student ->
                                    val record = attendanceByStudentId[student.id]
                                    val fallbackClassName = student.getKelasName()
                                    allData.add(
                                        mapOf(
                                            "attendanceId" to (record?.id ?: 0),
                                            "studentId" to (student.id ?: 0),
                                            "nama" to (student.name ?: "-"),
                                            "nisn" to (student.nisn ?: student.nis ?: "-"),
                                            "kelas" to fallbackClassName,
                                            "status" to normalizeStatusForRow(record?.status),
                                            "source" to (record?.source ?: ""),
                                            "reason" to (record?.reason ?: ""),
                                            "attachmentUrl" to (record?.reasonFileUrl ?: ""),
                                            "latestAttachmentUrl" to (record?.latestAttachmentUrl ?: "")
                                        )
                                    )
                                }

                                filteredData.clear()
                                filteredData.addAll(allData)
                                adapter.notifyDataSetChanged()
                                updateAngkaTombol()
                                updateTotalSiswa(allData.size)
                                isLoading = false

                                Log.d(TAG, "loadDataAsync: ${students.size} siswa, ${records.size} attendance, ${allData.size} rows")

                                if (allData.isEmpty()) {
                                    Toast.makeText(this@RiwayatKehadiranKelasActivity, "Belum ada siswa di kelas wali", Toast.LENGTH_SHORT).show()
                                }
                            },
                            onError = { _, message ->
                                showError(message ?: "Gagal memuat data absensi")
                                isLoading = false
                            }
                        )
                    },
                    onError = { _, message ->
                        handleResult(
                            attendanceResult,
                            onSuccess = { records ->
                                allData.clear()
                                records.forEach { record ->
                                    allData.add(
                                        mapOf(
                                            "attendanceId" to (record.id ?: 0),
                                            "studentId" to (record.student?.id ?: 0),
                                            "nama" to (record.student?.name ?: "-"),
                                            "nisn" to (record.student?.nisn ?: "-"),
                                            "kelas" to (record.schedule?.className ?: "-"),
                                            "status" to normalizeStatusForRow(record.status),
                                            "source" to (record.source ?: ""),
                                            "reason" to (record.reason ?: ""),
                                            "attachmentUrl" to (record.reasonFileUrl ?: ""),
                                            "latestAttachmentUrl" to (record.latestAttachmentUrl ?: "")
                                        )
                                    )
                                }

                                filteredData.clear()
                                filteredData.addAll(allData)
                                adapter.notifyDataSetChanged()
                                updateAngkaTombol()
                                updateTotalSiswa(allData.size)
                                isLoading = false
                            },
                            onError = { _, attendanceMessage ->
                                showError(
                                    attendanceMessage
                                        ?: message
                                        ?: "Gagal memuat daftar siswa wali kelas"
                                )
                                isLoading = false
                            }
                        )
                    }
                )
            } catch (e: Exception) {
                showError("Error: ${e.message}")
                isLoading = false
            }
        }
    }

    private suspend fun resolveHomeroomClassId(): Int? {
        val prefsClassId = AppPreferences(this).getHomeroomClassIdSync()?.toIntOrNull()
        if (prefsClassId != null && prefsClassId > 0) {
            return prefsClassId
        }

        return when (val result = teacherRepository.getMyHomeroom()) {
            is com.example.ritamesa.api.Result.Success -> result.data.id
            else -> null
        }
    }

    private fun selectRepresentativeAttendance(records: List<com.example.ritamesa.api.models.AttendanceResource>): com.example.ritamesa.api.models.AttendanceResource? {
        if (records.isEmpty()) return null

        fun priority(status: String?): Int = when (status?.lowercase()) {
            "sick", "sakit" -> 5
            "excused", "permission", "izin" -> 4
            "absent", "alpha", "alfa" -> 3
            "late", "terlambat" -> 2
            "present", "hadir" -> 1
            else -> 0
        }

        return records.maxWithOrNull(
            compareBy<com.example.ritamesa.api.models.AttendanceResource> { priority(it.status) }
                .thenBy { it.id ?: 0 }
        )
    }

    private fun normalizeStatusForRow(status: String?): String {
        return when (status?.lowercase()) {
            "present", "hadir", "late", "terlambat" -> "present"
            "sick", "sakit" -> "sick"
            "excused", "permission", "izin" -> "excused"
            "absent", "alpha", "alfa" -> "absent"
            else -> "absent"
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
            filteredData.addAll(allData.filter { it["status_type"] == status || it["status"] == status })
            adapter.notifyDataSetChanged()
            // Jumlah total siswa TETAP size dari allData
            updateTotalSiswa(allData.size)
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
            updateTotalSiswa(allData.size)
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
                    val st = when (data["status"]?.toString()?.lowercase()) {
                        "present", "hadir", "late", "terlambat" -> "hadir"
                        "sick", "sakit" -> "sakit"
                        "excused", "permission", "izin" -> "izin"
                        else -> "alpha"
                    }
                    when (st) {
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

    private fun updateTotalSiswa(actualTotal: Int) {
        try {
            txtJumlahSiswa.text = "Total Jumlah Siswa Kelas : $actualTotal"
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

    private fun updateAttendanceStatus(item: Map<String, Any>, status: String) {
        val attendanceId = item["attendanceId"] as? Int ?: 0
        val source = item["source"]?.toString().orEmpty()

        if (attendanceId <= 0) {
            showError("Belum ada record absensi pada tanggal ini untuk siswa tersebut")
            return
        }

        if (source == "system_close" && status == "present") {
            showError("Alpha otomatis tidak dapat diubah menjadi hadir oleh wali kelas")
            return
        }

        lifecycleScope.launch {
            val result = attendanceRepository.markAttendanceExcuse(
                attendanceId,
                mapOf(
                    "status" to status,
                    "reason" to if (status == "absent") "Ditetapkan ulang sebagai alfa" else ""
                )
            )
            handleResult(
                result,
                onSuccess = {
                    showSuccess("Status berhasil diperbarui")
                    loadDataAsync()
                },
                onError = { _, msg ->
                    showError(msg ?: "Gagal memperbarui status")
                }
            )
        }
    }

    private fun showExcuseDialog(item: Map<String, Any>) {
        val attendanceId = item["attendanceId"] as? Int ?: 0
        val studentName = item["nama"]?.toString().orEmpty()
        val source = item["source"]?.toString().orEmpty()

        if (attendanceId <= 0) {
            showError("Belum ada record absensi pada tanggal ini untuk siswa tersebut")
            return
        }

        selectedAttachmentUri = null
        val dialogView = LayoutInflater.from(this).inflate(R.layout.pop_up_izin, null)
        val rootLayout = dialogView as LinearLayout
        val inputNamaSiswa = dialogView.findViewById<EditText>(R.id.input_nama_siswa)
        val btnDropdownSiswa = dialogView.findViewById<ImageButton>(R.id.btn_dropdown_siswa)
        val inputTanggal = dialogView.findViewById<EditText>(R.id.input_tanggal)
        val etCatatan = dialogView.findViewById<EditText>(R.id.et_catatan)
        val namaFile = dialogView.findViewById<TextView>(R.id.namafile)
        val btnFile = dialogView.findViewById<ImageButton>(R.id.btn_tambahkanfile)
        val btnKirim = dialogView.findViewById<Button>(R.id.btn_kirim_izin)
        val btnBatal = dialogView.findViewById<Button>(R.id.btn_batal_izin)
        val boxBuktiSurat = dialogView.findViewById<LinearLayout>(R.id.box_bukti_surat)
        val layoutJamSection = dialogView.findViewById<LinearLayout>(R.id.layout_jam_section)

        val statusLabel = TextView(this).apply {
            text = "Jenis Perizinan"
            textSize = 16f
            setTextColor(android.graphics.Color.parseColor("#303030"))
            setTypeface(typeface, android.graphics.Typeface.BOLD)
        }
        val statusSpinner = Spinner(this)
        val statusAdapter = ArrayAdapter(
            this,
            android.R.layout.simple_spinner_item,
            listOf("Sakit", "Izin")
        )
        statusAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        statusSpinner.adapter = statusAdapter
        rootLayout.addView(statusLabel, 4)
        rootLayout.addView(statusSpinner, 5)

        boxBuktiSurat.visibility = View.VISIBLE
        layoutJamSection.visibility = View.GONE
        inputNamaSiswa.setText(studentName)
        inputNamaSiswa.isEnabled = false
        btnDropdownSiswa.visibility = View.GONE
        inputTanggal.setText(SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date()))
        namaFile.text = "Masukkan Bukti Surat"
        currentAttachmentNameView = namaFile
        if (source == "system_close") {
            etCatatan.hint = "Alasan wajib diisi untuk koreksi alpha otomatis"
        }

        val dialog = androidx.appcompat.app.AlertDialog.Builder(this)
            .setView(dialogView)
            .create()

        btnFile.setOnClickListener { filePickerLauncher.launch("image/*") }
        btnBatal.setOnClickListener { dialog.dismiss() }
        btnKirim.setOnClickListener {
            val selectedStatus = if (statusSpinner.selectedItemPosition == 0) "sick" else "excused"
            val reason = etCatatan.text?.toString()?.trim().orEmpty()

            if (reason.isBlank()) {
                showError("Keterangan wajib diisi")
                return@setOnClickListener
            }
            if (selectedAttachmentUri == null) {
                showError("Bukti surat wajib diunggah")
                return@setOnClickListener
            }

            val file = getFileFromUri(selectedAttachmentUri!!)
            if (file == null) {
                showError("Gagal membaca file bukti")
                return@setOnClickListener
            }

            val attachment = MultipartBody.Part.createFormData(
                "attachment",
                file.name,
                file.asRequestBody("image/*".toMediaTypeOrNull())
            )

            lifecycleScope.launch {
                val result = attendanceRepository.updateAttendanceExcuse(
                    attendanceId = attendanceId,
                    status = selectedStatus,
                    reason = reason,
                    attachment = attachment
                )
                handleResult(
                    result,
                    onSuccess = {
                        dialog.dismiss()
                        showSuccess("Koreksi presensi berhasil")
                        loadDataAsync()
                    },
                    onError = { _, msg ->
                        showError(msg ?: "Gagal memperbarui presensi")
                    }
                )
            }
        }

        dialog.show()
    }

    private fun getFileName(uri: Uri): String {
        var result = "bukti_surat.jpg"
        val cursor = contentResolver.query(uri, null, null, null, null)
        cursor?.use {
            if (it.moveToFirst()) {
                val nameIndex = it.getColumnIndex(android.provider.OpenableColumns.DISPLAY_NAME)
                if (nameIndex >= 0) {
                    result = it.getString(nameIndex)
                }
            }
        }
        return result
    }

    private fun getFileFromUri(uri: Uri): File? {
        val tempFile = File(cacheDir, getFileName(uri))
        return try {
            val inputStream = contentResolver.openInputStream(uri) ?: return null
            val outputStream = FileOutputStream(tempFile)
            val buffer = ByteArray(4 * 1024)
            var read: Int
            while (inputStream.read(buffer).also { read = it } != -1) {
                outputStream.write(buffer, 0, read)
            }
            outputStream.flush()
            outputStream.close()
            inputStream.close()
            tempFile
        } catch (e: Exception) {
            Log.e(TAG, "Gagal membuat file sementara", e)
            null
        }
    }
}
