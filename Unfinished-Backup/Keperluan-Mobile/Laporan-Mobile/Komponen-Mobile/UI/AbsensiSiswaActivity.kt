package com.example.ritamesa

import android.app.Activity
import android.app.AlertDialog
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.EditText
import android.widget.ImageButton
import android.widget.LinearLayout
import android.widget.Spinner
import android.widget.TextView
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.ritamesa.AbsensiAdapter.SiswaData
import com.example.ritamesa.api.Result
import com.example.ritamesa.api.models.BulkAttendanceItem
import com.example.ritamesa.api.models.BulkManualAttendanceRequest
import com.example.ritamesa.api.models.ManualAttendanceSession
import com.example.ritamesa.api.models.StudentResource
import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.asRequestBody
import java.io.File
import java.io.FileOutputStream
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class AbsensiSiswaActivity : BaseNetworkActivity() {

    private lateinit var adapter: AbsensiAdapter
    private lateinit var rvListAbsen: RecyclerView
    private lateinit var tvNamaMapel: TextView
    private lateinit var tvKelas: TextView
    private lateinit var tvTanggalWaktu: TextView
    private lateinit var btnBack: ImageButton
    private lateinit var btnSimpan: Button
    private lateinit var btnBatal: Button
    private lateinit var tvManualSessionStatus: TextView
    private lateinit var tvManualSessionTime: TextView
    private lateinit var tvManualSessionCounts: TextView

    private var mapel: String = ""
    private var kelas: String = ""
    private var tanggal: String = ""
    private var jam: String = ""
    private var scheduleId: Int = 0
    private var classId: Int = 0
    private var attendeeStatus: String = ""
    private var scanTime: String = ""
    private var currentManualSession: ManualAttendanceSession? = null

    // State attachment untuk popup perizinan (izin & sakit)
    private var selectedAttachmentUri: Uri? = null
    private var currentAttachmentNameView: TextView? = null

    private val filePickerLauncher = registerForActivityResult(
        ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        selectedAttachmentUri = uri
        currentAttachmentNameView?.text = if (uri != null) getFileName(uri) else "Masukkan Bukti Surat"
    }

    companion object {
        private const val TAG = "AbsensiSiswa"
        const val EXTRA_SCHEDULE_ID = "schedule_id"
        const val EXTRA_CLASS_ID = "class_id"
        const val RESULT_ATTENDANCE_SAVED = "attendance_saved"
    }

    // ─────────────────────────────────────────────────────────────────
    // LIFECYCLE
    // ─────────────────────────────────────────────────────────────────

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.absen_kehadiran_siswa)
        initViews()
        getDataFromIntent()
        setupClickListeners()
    }

    private fun initViews() {
        tvNamaMapel = findViewById(R.id.text_nama_mapel)
        tvKelas = findViewById(R.id.title_kelas)
        tvTanggalWaktu = findViewById(R.id.tanggal_waktu_mulai)
        btnBack = findViewById(R.id.btn_back)
        btnSimpan = findViewById(R.id.btn_simpan_sementara)
        btnBatal = findViewById(R.id.btn_batal_absensi)
        rvListAbsen = findViewById(R.id.rvListAbsen)
        tvManualSessionStatus = findViewById(R.id.tv_manual_session_status)
        tvManualSessionTime = findViewById(R.id.tv_manual_session_time)
        tvManualSessionCounts = findViewById(R.id.tv_manual_session_counts)
    }

    // ─────────────────────────────────────────────────────────────────
    // DATA LOADING
    // ─────────────────────────────────────────────────────────────────

    private fun getDataFromIntent() {
        mapel = intent.getStringExtra(CameraQRActivity.EXTRA_MAPEL)
            .takeUnless { it.isNullOrBlank() }
            ?: intent.getStringExtra("MATA_PELAJARAN").takeUnless { it.isNullOrBlank() }
                    ?: "-"

        kelas = intent.getStringExtra(CameraQRActivity.EXTRA_KELAS)
            .takeUnless { it.isNullOrBlank() }
            ?: intent.getStringExtra("KELAS").takeUnless { it.isNullOrBlank() }
                    ?: "-"

        val rawTanggal = intent.getStringExtra("tanggal").takeUnless { it.isNullOrBlank() }
            ?: intent.getStringExtra("TANGGAL").takeUnless { it.isNullOrBlank() }
            ?: getCurrentDate()
        tanggal = normalizeToApiDate(rawTanggal)

        jam = intent.getStringExtra("jam").takeUnless { it.isNullOrBlank() }
            ?: intent.getStringExtra("JAM").takeUnless { it.isNullOrBlank() }
                    ?: "-"

        scheduleId = intent.getIntExtra(EXTRA_SCHEDULE_ID, 0)
        classId = intent.getIntExtra(EXTRA_CLASS_ID, 0)
        attendeeStatus = intent.getStringExtra("status") ?: ""
        scanTime = intent.getStringExtra("scanned_at") ?: ""

        tvNamaMapel.text = mapel
        tvKelas.text = kelas
        tvTanggalWaktu.text = if (jam.isNotEmpty()) "$jam $tanggal" else tanggal

        Log.d(TAG, "Intent: scheduleId=$scheduleId, classId=$classId, tanggal=$tanggal")
        loadStudentsFromApi()
        loadScheduleDetail()
    }

    private fun loadStudentsFromApi() {
        val singleStudentId = intent.getIntExtra("student_id", 0)
        val singleStudentName = intent.getStringExtra("attendee_name").orEmpty()

        if (attendeeStatus.isNotEmpty() && singleStudentId > 0 && singleStudentName.isNotBlank()) {
            setupRecyclerView(listOf(
                SiswaData(
                    id = singleStudentId,
                    nomor = 1,
                    nisn = intent.getStringExtra("nisn").orEmpty(),
                    nama = singleStudentName,
                    status = attendeeStatus.lowercase()
                )
            ))
            return
        }

        lifecycleScope.launch {
            if (scheduleId > 0) {
                val result = teacherRepository.getMyScheduleStudents(scheduleId)
                handleResult(result,
                    onSuccess = { students ->
                        val list = toSiswaData(students)
                        if (list.isNotEmpty()) setupRecyclerView(list)
                        else loadStudentsByClass()
                    },
                    onError = { _, _ -> loadStudentsByClass() }
                )
            } else if (classId > 0) {
                loadStudentsByClass()
            } else {
                showToast("Tidak ada data jadwal atau kelas")
                setupRecyclerView(emptyList())
            }
        }
    }

    private fun loadStudentsByClass() {
        lifecycleScope.launch {
            if (classId <= 0) {
                showError("Class ID tidak valid")
                setupRecyclerView(emptyList())
                return@launch
            }
            val result = studentRepository.getStudents(classId = classId, perPage = -1)
            handleResult(result,
                onSuccess = { students ->
                    val list = toSiswaData(students)
                    if (list.isEmpty()) showToast("Tidak ada siswa ditemukan untuk kelas ini")
                    setupRecyclerView(list)
                },
                onError = { _, msg ->
                    showError("Gagal memuat data siswa: $msg")
                    setupRecyclerView(emptyList())
                }
            )
        }
    }

    private fun toSiswaData(students: List<StudentResource>): List<SiswaData> =
        students.mapIndexedNotNull { index, student ->
            val id = student.id ?: return@mapIndexedNotNull null
            if (id <= 0) return@mapIndexedNotNull null
            SiswaData(
                id = id,
                nomor = index + 1,
                nisn = student.nisn ?: "",
                nama = student.name ?: "Tanpa Nama",
                status = "none"
            )
        }

    private fun setupRecyclerView(siswaList: List<SiswaData>) {
        adapter = AbsensiAdapter(
            siswaList.toMutableList(),
            onPerizinanSelected = { siswa, position ->
                // Popup ini dipakai untuk IZIN maupun SAKIT
                showPerizinanDialog(siswa, position)
            }
        )
        rvListAbsen.layoutManager = LinearLayoutManager(this)
        rvListAbsen.adapter = adapter
        loadScheduleDetail()
    }

    private fun loadScheduleDetail() {
        if (scheduleId <= 0) return
        lifecycleScope.launch {
            val result = teacherRepository.getMyScheduleDetail(scheduleId)
            handleResult(result,
                onSuccess = { detail ->
                    currentManualSession = detail.manualAttendanceSession
                    renderManualSession(detail.manualAttendanceSession)
                    applyAttendanceDraft(detail.students)
                },
                onError = { _, msg -> Log.e(TAG, "Failed to load schedule detail: $msg") }
            )
        }
    }

    private fun applyAttendanceDraft(students: List<com.example.ritamesa.api.models.TeacherScheduleStudentItem>) {
        if (!::adapter.isInitialized) return
        val draftMap = students.associateBy { it.id }
        val merged = adapter.getAbsensiData().map { siswa ->
            val serverStudent = draftMap[siswa.id]
            val mappedStatus = mapBackendStatusToLocal(serverStudent?.attendance?.status)
            siswa.copy(
                status = mappedStatus ?: siswa.status,
                autoLate = serverStudent?.attendance?.autoLate == true,
                isFromDraft = mappedStatus != null  // status dari server → tandai sebagai draft
            )
        }
        adapter.updateData(merged)
    }

    private fun mapBackendStatusToLocal(status: String?): String? = when (status?.lowercase()) {
        "present", "late" -> "hadir"
        "excused", "izin" -> "izin"
        "sick"            -> "sakit"
        "absent"          -> "alpha"
        else              -> null
    }

    // ─────────────────────────────────────────────────────────────────
    // POPUP PERIZINAN  (dipakai untuk IZIN dan SAKIT)
    // ─────────────────────────────────────────────────────────────────

    /**
     * Popup perizinan muncul saat guru memilih tombol Izin ATAU Sakit.
     * Spinner "Jenis Perizinan" di-preselect sesuai tombol yang diklik:
     *   - tombol Izin  → preselect "Izin"
     *   - tombol Sakit → preselect "Sakit"
     * Spinner tetap bisa diubah oleh guru.
     *
     * Validasi:
     *   1. Keterangan tidak boleh kosong
     *   2. Bukti surat wajib diunggah
     *   3. File harus berhasil dibaca
     *
     * Status di adapter hanya diubah setelah semua validasi lolos.
     */
    private fun showPerizinanDialog(siswa: SiswaData, position: Int) {
        selectedAttachmentUri = null

        val dialogView = layoutInflater.inflate(R.layout.pop_up_izin, null)
        val rootLayout = dialogView as LinearLayout

        val inputNamaSiswa  = dialogView.findViewById<EditText>(R.id.input_nama_siswa)
        val btnDropdownSiswa = dialogView.findViewById<ImageButton>(R.id.btn_dropdown_siswa)
        val inputTanggal    = dialogView.findViewById<EditText>(R.id.input_tanggal)
        val etCatatan       = dialogView.findViewById<EditText>(R.id.et_catatan)
        val namaFile        = dialogView.findViewById<TextView>(R.id.namafile)
        val btnFile         = dialogView.findViewById<ImageButton>(R.id.btn_tambahkanfile)
        val btnKirim        = dialogView.findViewById<Button>(R.id.btn_kirim_izin)
        val btnBatal        = dialogView.findViewById<Button>(R.id.btn_batal_izin)
        val boxBuktiSurat   = dialogView.findViewById<LinearLayout>(R.id.box_bukti_surat)
        val layoutJamSection = dialogView.findViewById<LinearLayout>(R.id.layout_jam_section)

        // ── Spinner Jenis Perizinan ──────────────────────────────────
        // Index 0 = Sakit (sick), Index 1 = Izin (excused)
        val jenisOptions = listOf("Sakit", "Izin")
        val statusSpinner = Spinner(this)
        val spinnerAdapter = ArrayAdapter(
            this,
            android.R.layout.simple_spinner_item,
            jenisOptions
        ).also { it.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item) }
        statusSpinner.adapter = spinnerAdapter

        // Pre-select berdasarkan status siswa saat ini atau status sebelumnya
        // Jika siswa sudah pernah isi perizinan, kembalikan pilihan sebelumnya
        val preselect = when {
            siswa.perizinanType == "sick"    -> 0  // Sakit
            siswa.perizinanType == "excused" -> 1  // Izin
            siswa.status == "sakit"          -> 0
            else                             -> 1  // default Izin
        }
        statusSpinner.setSelection(preselect)

        val statusLabel = TextView(this).apply {
            text = "Jenis Perizinan"
            textSize = 16f
            setPadding(0, 24, 0, 8)
            setTextColor(android.graphics.Color.parseColor("#303030"))
            setTypeface(typeface, android.graphics.Typeface.BOLD)
        }
        // Sisipkan label + spinner setelah field tanggal (index 4 & 5)
        rootLayout.addView(statusLabel, 4)
        rootLayout.addView(statusSpinner, 5)

        // ── Konfigurasi field ────────────────────────────────────────
        boxBuktiSurat.visibility = View.VISIBLE
        layoutJamSection.visibility = View.GONE

        inputNamaSiswa.setText(siswa.nama)
        inputNamaSiswa.isEnabled = false
        btnDropdownSiswa.visibility = View.GONE

        inputTanggal.setText(tanggal)
        inputTanggal.isEnabled = false

        // Isi ulang keterangan jika siswa sudah pernah mengisi
        if (siswa.perizinanReason.isNotBlank()) {
            etCatatan.setText(siswa.perizinanReason)
        }

        namaFile.text = if (siswa.pendingAttachmentFile != null)
            siswa.pendingAttachmentFile!!.name
        else
            "Masukkan Bukti Surat"
        currentAttachmentNameView = namaFile

        // ── Buat dialog ──────────────────────────────────────────────
        val dialog = AlertDialog.Builder(this)
            .setView(dialogView)
            .setCancelable(false)
            .create()

        // ── Listener ─────────────────────────────────────────────────
        btnFile.setOnClickListener {
            filePickerLauncher.launch("image/*")
        }

        btnBatal.setOnClickListener {
            // Tidak ubah status — biarkan status sebelumnya tetap
            selectedAttachmentUri = null
            dialog.dismiss()
        }

        btnKirim.setOnClickListener {
            val selectedType = if (statusSpinner.selectedItemPosition == 0) "sick" else "excused"
            val reason = etCatatan.text?.toString()?.trim().orEmpty()

            // ── Validasi 1: keterangan wajib ─────────────────────────
            if (reason.isBlank()) {
                Toast.makeText(
                    this,
                    "Keterangan/alasan wajib diisi",
                    Toast.LENGTH_SHORT
                ).show()
                return@setOnClickListener
            }

            // ── Validasi 2: bukti surat wajib ────────────────────────
            // Izinkan jika sudah ada file sebelumnya (siswa buka popup lagi)
            val existingFile = siswa.pendingAttachmentFile
            val hasNewAttachment = selectedAttachmentUri != null
            val hasExistingFile = existingFile != null && existingFile.exists()

            if (!hasNewAttachment && !hasExistingFile) {
                Toast.makeText(
                    this,
                    "Bukti surat wajib diunggah",
                    Toast.LENGTH_SHORT
                ).show()
                return@setOnClickListener
            }

            // ── Validasi 3: konversi file ─────────────────────────────
            val file: File = if (hasNewAttachment) {
                getFileFromUri(selectedAttachmentUri!!) ?: run {
                    Toast.makeText(this, "Gagal membaca file bukti surat", Toast.LENGTH_SHORT).show()
                    return@setOnClickListener
                }
            } else {
                existingFile!! // sudah dicek di atas
            }

            // ── Semua validasi lolos ──────────────────────────────────
            adapter.confirmPerizinanStatus(position, selectedType, reason, file)

            val jenisLabel = if (selectedType == "sick") "Sakit" else "Izin"
            Toast.makeText(
                this,
                "Perizinan ($jenisLabel) ${siswa.nama} berhasil dicatat",
                Toast.LENGTH_SHORT
            ).show()
            dialog.dismiss()
        }

        dialog.show()
    }

    // ─────────────────────────────────────────────────────────────────
    // SIMPAN ABSENSI
    // ─────────────────────────────────────────────────────────────────

    private fun setupClickListeners() {
        btnBack.setOnClickListener { finish() }
        btnSimpan.setOnClickListener { simpanAbsensi() }
        btnBatal.setOnClickListener { batalAbsensi() }
    }

    private fun simpanAbsensi() {
        if (!::adapter.isInitialized) {
            showError("Daftar siswa belum siap")
            return
        }

        val absensiData = adapter.getAbsensiData()

        var totalHadir = 0
        var totalIzin = 0
        var totalSakit = 0
        var totalAlpha = 0

        absensiData.forEach { siswa ->
            when (siswa.status) {
                "hadir" -> totalHadir++
                "izin"  -> totalIzin++
                "sakit" -> totalSakit++
                "alpha" -> totalAlpha++
            }
        }

        if (absensiData.isEmpty()) {
            Toast.makeText(this, "Tidak ada data siswa untuk disimpan", Toast.LENGTH_LONG).show()
            return
        }

        // Validasi: tidak ada ID siswa invalid
        val invalidStudents = absensiData.filter { it.id <= 0 }
        if (invalidStudents.isNotEmpty()) {
            Log.e(TAG, "Invalid student ids found: ${invalidStudents.map { it.nama to it.id }}")
            showError("Ada siswa dengan ID tidak valid. Muat ulang daftar siswa terlebih dahulu.")
            return
        }

        // Validasi: siswa izin/sakit yang BARU diset user (bukan dari draft server) WAJIB isi detail perizinan
        val perizinanTidakLengkap = absensiData.filter { siswa ->
            (siswa.status == "izin" || siswa.status == "sakit") &&
                    !siswa.isFromDraft &&  // skip validasi jika status berasal dari draft server
                    (siswa.perizinanReason.isBlank() || siswa.pendingAttachmentFile == null)
        }
        if (perizinanTidakLengkap.isNotEmpty()) {
            val namaList = perizinanTidakLengkap.joinToString("\n• ", prefix = "• ") { siswa ->
                val jenis = if (siswa.status == "sakit") "Sakit" else "Izin"
                "${siswa.nama} ($jenis)"
            }
            AlertDialog.Builder(this)
                .setTitle("Data Perizinan Belum Lengkap")
                .setMessage(
                    "Siswa berikut belum melengkapi keterangan dan bukti surat:\n\n$namaList\n\n" +
                            "Klik tombol Izin atau Sakit pada siswa tersebut untuk mengisi."
                )
                .setPositiveButton("OK", null)
                .show()
            return
        }

        // Bangun payload API
        val records = absensiData.mapNotNull { siswa ->
            val apiStatus = when (siswa.status) {
                "hadir" -> "present"
                "izin"  -> "excused"
                "sakit" -> "sick"
                "alpha" -> "absent"
                else    -> null  // "none" → skip
            }
            apiStatus?.let {
                BulkAttendanceItem(
                    studentId = siswa.id,
                    status = it,
                    reason = siswa.perizinanReason.ifBlank { null }
                )
            }
        }

        if (records.isEmpty()) {
            showToast("Belum ada status yang diisi. Simpan sementara hanya mengirim siswa yang sudah dipilih.")
            return
        }

        val unfilledCount = absensiData.count { it.status == "none" }
        val requestPayload = BulkManualAttendanceRequest(
            scheduleId = scheduleId,
            date = normalizeToApiDate(tanggal),
            mode = "final",
            items = records
        )

        lifecycleScope.launch {
            btnSimpan.isEnabled = false
            val result = attendanceRepository.recordBulkManualAttendance(requestPayload)
            when (result) {
                is Result.Success -> {
                    btnSimpan.isEnabled = true
                    val response = result.data
                    currentManualSession = (currentManualSession ?: ManualAttendanceSession()).copy(
                        hasDraft = false,
                        isFinalized = true,
                        sessionStartedAt = response.sessionStartedAt,
                        draftSavedCount = response.finalCount ?: response.savedCount ?: records.size,
                        finalizedAt = response.sessionStartedAt,
                        unfilledStudentCount = unfilledCount
                    )
                    renderManualSession(currentManualSession)
                    Log.d(TAG, "Attendance draft saved successfully")

                    // Upload bukti surat untuk siswa izin & sakit
                    // Ditunggu sebelum dialog tampil agar user tahu hasilnya
                    val uploadErrors = uploadPendingAttachments(absensiData, response)
                    if (uploadErrors.isNotEmpty()) {
                        Log.w(TAG, "Beberapa attachment gagal upload: $uploadErrors")
                    }

                    showSavedDialog(
                        savedCount = response.savedCount ?: records.size,
                        autoLateCount = response.autoLateStudentIds.size,
                        unfilledCount = unfilledCount
                    )
                    setResult(Activity.RESULT_OK, Intent().apply {
                        putExtra(RESULT_ATTENDANCE_SAVED, true)
                        putExtra(EXTRA_SCHEDULE_ID, scheduleId)
                    })
                    loadScheduleDetail()
                }
                is Result.Error -> {
                    btnSimpan.isEnabled = true
                    Log.e(TAG, "Failed to save attendance: ${result.message}")
                    showError("Gagal menyimpan absensi: ${result.message}")
                }
                is Result.Loading -> { /* loading */ }
            }
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // UPLOAD ATTACHMENT (izin & sakit)
    // ─────────────────────────────────────────────────────────────────

    /**
     * Upload bukti surat untuk semua siswa izin/sakit setelah bulk attendance berhasil.
     * Return list nama siswa yang gagal upload (kosong = semua berhasil).
     */
    private suspend fun uploadPendingAttachments(
        absensiData: List<SiswaData>,
        response: com.example.ritamesa.api.models.BulkManualAttendanceResponse
    ): List<String> {
        val failedNames = mutableListOf<String>()

        // Siswa yang perlu upload: izin ATAU sakit, punya file & reason
        val perluUpload = absensiData.filter { siswa ->
            (siswa.status == "izin" || siswa.status == "sakit") &&
                    siswa.pendingAttachmentFile != null &&
                    siswa.perizinanReason.isNotBlank()
        }
        if (perluUpload.isEmpty()) return failedNames

        Log.d(TAG, "uploadPendingAttachments: ${perluUpload.size} siswa perlu upload attachment")

        // Map studentId → attendanceId dari response.data
        val studentToAttendanceId: Map<Int, Int> = response.data
            .mapNotNull { data ->
                val sId = data.studentId ?: return@mapNotNull null
                val aId = data.id         ?: return@mapNotNull null
                sId to aId
            }
            .toMap()

        Log.d(TAG, "studentToAttendanceId map: $studentToAttendanceId")

        for (siswa in perluUpload) {
            val file = siswa.pendingAttachmentFile ?: continue
            val attendanceId = studentToAttendanceId[siswa.id]
            if (attendanceId == null) {
                Log.w(TAG, "attendanceId tidak ditemukan untuk ${siswa.nama} (id=${siswa.id}) — skip upload")
                failedNames.add(siswa.nama)
                continue
            }

            try {
                val attachment = MultipartBody.Part.createFormData(
                    "attachment",
                    file.name,
                    file.asRequestBody("image/*".toMediaTypeOrNull())
                )
                val apiStatus = siswa.perizinanType.ifBlank {
                    if (siswa.status == "sakit") "sick" else "excused"
                }
                Log.d(TAG, "Uploading attachment: siswa=${siswa.nama}, attendanceId=$attendanceId, status=$apiStatus")
                val uploadResult = attendanceRepository.updateAttendanceExcuse(
                    attendanceId = attendanceId,
                    status = apiStatus,
                    reason = siswa.perizinanReason,
                    attachment = attachment
                )
                when (uploadResult) {
                    is Result.Success -> Log.d(TAG, "Attachment berhasil upload: ${siswa.nama}")
                    is Result.Error   -> {
                        Log.e(TAG, "Gagal upload ${siswa.nama}: ${uploadResult.message}")
                        failedNames.add(siswa.nama)
                    }
                    else -> Unit
                }
            } catch (e: Exception) {
                Log.e(TAG, "Exception upload ${siswa.nama}", e)
                failedNames.add(siswa.nama)
            }
        }

        return failedNames
    }

    // ─────────────────────────────────────────────────────────────────
    // UI HELPERS
    // ─────────────────────────────────────────────────────────────────

    private fun showSavedDialog(savedCount: Int, autoLateCount: Int, unfilledCount: Int) {
        val lines = buildList {
            add("Absensi tersimpan: $savedCount siswa")
            if (autoLateCount > 0) add("$autoLateCount siswa baru otomatis ditandai terlambat")
            if (unfilledCount > 0) add("$unfilledCount siswa belum diisi. Sistem akan menangani alpha setelah jam pelajaran berakhir.")
        }
        AlertDialog.Builder(this)
            .setTitle("Simpan")
            .setMessage(lines.joinToString("\n"))
            .setPositiveButton("OK", null)
            .show()
    }

    private fun renderManualSession(session: ManualAttendanceSession?) {
        if (session == null) {
            tvManualSessionStatus.text = "Belum ada absensi tersimpan"
            tvManualSessionTime.text = "Absensi belum disimpan"
            tvManualSessionCounts.text = "0 siswa terisi • 0 siswa belum diisi"
            return
        }
        tvManualSessionStatus.text = when {
            session.isFinalized == true -> "Absensi sudah tersimpan"
            session.hasDraft == true    -> "Draft absensi sedang berjalan"
            else                        -> "Belum ada absensi tersimpan"
        }
        tvManualSessionTime.text = when {
            session.isFinalized == true && !session.finalizedAt.isNullOrBlank() ->
                "Tersimpan: ${session.finalizedAt}"
            !session.sessionStartedAt.isNullOrBlank() ->
                "Draft dimulai: ${session.sessionStartedAt}"
            else -> "Sesi draft belum dimulai"
        }
        val saved    = session.draftSavedCount       ?: 0
        val unfilled = session.unfilledStudentCount  ?: 0
        val eligible = session.eligibleStudentCount  ?: 0
        tvManualSessionCounts.text =
            "$saved siswa terisi • $unfilled siswa belum diisi • $eligible total siswa"
    }

    private fun batalAbsensi() {
        adapter.resetAllStatus()
        showToast("Absensi dibatalkan, status direset")
    }

    // ─────────────────────────────────────────────────────────────────
    // FILE HELPER
    // ─────────────────────────────────────────────────────────────────

    private fun getFileName(uri: Uri): String {
        var result = "bukti_surat.jpg"
        contentResolver.query(uri, null, null, null, null)?.use { cursor ->
            if (cursor.moveToFirst()) {
                val idx = cursor.getColumnIndex(android.provider.OpenableColumns.DISPLAY_NAME)
                if (idx >= 0) result = cursor.getString(idx)
            }
        }
        return result
    }

    private fun getFileFromUri(uri: Uri): File? {
        val tempFile = File(cacheDir, getFileName(uri))
        return try {
            val inputStream = contentResolver.openInputStream(uri) ?: return null
            FileOutputStream(tempFile).use { out ->
                val buf = ByteArray(4 * 1024)
                var read: Int
                while (inputStream.read(buf).also { read = it } != -1) out.write(buf, 0, read)
            }
            inputStream.close()
            tempFile
        } catch (e: Exception) {
            Log.e(TAG, "Gagal membuat file sementara", e)
            null
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // DATE HELPER
    // ─────────────────────────────────────────────────────────────────

    private fun getCurrentDate(): String =
        SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())

    private fun normalizeToApiDate(rawDate: String): String {
        val trimmed = rawDate.trim()
        if (trimmed.isEmpty()) return getCurrentDate()
        val api     = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).apply { isLenient = false }
        val display = SimpleDateFormat("dd-MM-yyyy", Locale.getDefault()).apply { isLenient = false }
        return try { api.format(api.parse(trimmed) ?: Date()) }
        catch (_: Exception) {
            try { api.format(display.parse(trimmed) ?: Date()) }
            catch (_: Exception) { getCurrentDate() }
        }
    }
}