package com.example.ritamesa

import android.annotation.SuppressLint
import android.app.Dialog
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.*
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AlertDialog
import androidx.lifecycle.lifecycleScope
import com.example.ritamesa.api.models.StudentResource
import com.example.ritamesa.api.Result
import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.asRequestBody
import java.io.File
import java.io.FileOutputStream
import java.text.SimpleDateFormat
import java.util.*

@SuppressLint("SetTextI18n")
class DetailJadwalWakelActivity : BaseNetworkActivity() {
    companion object {
        private const val TAG_DROPDOWN = "SiswaDropdown"
    }

    private lateinit var currentJadwal: DashboardGuruActivity.JadwalData
    private var statusIzinGuru: String? = null
    private val loadedStudentNames = mutableListOf<String>()
    private lateinit var siswaNameAdapter: ArrayAdapter<String>
    private var selectedStudentIdFromDropdown: Int? = null
    private var selectedStudentNameFromDropdown: String? = null
    private val studentToAttendanceIdMap = mutableMapOf<Int, Int>()

    // Tombol utama
    private lateinit var btnAbsensi: ImageButton
    private lateinit var btnTidakMengajar1: ImageButton
    private lateinit var btnIzinSakit: ImageButton
    private lateinit var btnAjukanDispen: ImageButton
    private lateinit var btnInfoHadir: ImageButton

    // File picker
    private var selectedFileUri: Uri? = null
    private lateinit var currentNamaFileTextView: TextView

    // QR Scanner
    private val qrScannerLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == RESULT_OK) {
            val data = result.data
            val isSuccess = data?.getBooleanExtra(CameraQRActivity.EXTRA_QR_RESULT, false) ?: false

            if (isSuccess) {
                val kelas = data.getStringExtra(CameraQRActivity.EXTRA_KELAS) ?: "-"
                val mapel = data.getStringExtra(CameraQRActivity.EXTRA_MAPEL) ?: "-"
                val tanggal = data.getStringExtra("tanggal") ?: "-"
                val jam = data.getStringExtra("jam") ?: "-"

                Toast.makeText(
                    this,
                    "Absensi berhasil!\n$mapel - $kelas\n$tanggal $jam",
                    Toast.LENGTH_LONG
                ).show()

                val intent = Intent(this, AbsensiSiswaActivity::class.java).apply {
                    putExtra(CameraQRActivity.EXTRA_MAPEL, mapel)
                    putExtra(CameraQRActivity.EXTRA_KELAS, kelas)
                    putExtra("tanggal", tanggal)
                    putExtra("jam", jam)
                    putExtra(AbsensiSiswaActivity.EXTRA_SCHEDULE_ID, currentJadwal.id)
                    putExtra(AbsensiSiswaActivity.EXTRA_CLASS_ID, currentJadwal.idKelas)
                }
                startActivity(intent)
            } else {
                Toast.makeText(this, "Gagal scan QR", Toast.LENGTH_SHORT).show()
            }
        }
    }

    // File picker
    private val filePickerLauncher = registerForActivityResult(
        ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        if (uri != null) {
            selectedFileUri = uri
            val fileName = getFileName(uri)
            if (::currentNamaFileTextView.isInitialized) {
                currentNamaFileTextView.text = fileName
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.detail_jadwal_wakel)

        siswaNameAdapter = ArrayAdapter(
            this,
            android.R.layout.simple_spinner_item,
            loadedStudentNames
        )
        siswaNameAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)

        val jadwalData = getJadwalDataFromIntent()
        if (jadwalData == null) {
            Toast.makeText(this, "Data jadwal tidak ditemukan", Toast.LENGTH_SHORT).show()
            finish()
            return
        }

        // Inisialisasi view utama
        initMainViews(jadwalData)

        // Set click listeners
        setClickListeners()

        // Load students from API
        loadStudentsFromApi()
    }

    private fun initMainViews(jadwalData: DashboardGuruActivity.JadwalData) {
        val tvNamaMapel: TextView = findViewById(R.id.text_nama_mapel)
        val tvKelas: TextView = findViewById(R.id.title_kelas)
        val tvTanggalWaktu: TextView = findViewById(R.id.tanggal_waktu_mulai)
        val tvMapelDetail: TextView = findViewById(R.id.txt_end_1)
        val tvKelasDetail: TextView = findViewById(R.id.txt_end_2)
        val btnBack: ImageButton = findViewById(R.id.btn_back)

        // Tombol aksi - SESUAIKAN DENGAN ID DI XML
        btnAbsensi = findViewById(R.id.btn_absensi)
        btnTidakMengajar1 = findViewById(R.id.btn_tidak_mengajar_1)
        btnIzinSakit = findViewById(R.id.btn_izin_sakit)
        btnAjukanDispen = findViewById(R.id.btn_ajukan_dispen)
        btnInfoHadir = findViewById(R.id.btn_info_hadir)

        btnBack.setOnClickListener { finish() }

        currentJadwal = jadwalData
        tvNamaMapel.text = jadwalData.mataPelajaran
        tvKelas.text = jadwalData.kelas
        tvTanggalWaktu.text = formatTanggalWaktu(jadwalData.jam)
        tvMapelDetail.text = jadwalData.mataPelajaran
        tvKelasDetail.text = jadwalData.kelas

        val txtJumlahSiswa: TextView = findViewById(R.id.txt_end_3)
        txtJumlahSiswa.text = if (jadwalData.studentCount > 0) jadwalData.studentCount.toString() else "-"
    }

    private fun getJadwalDataFromIntent(): DashboardGuruActivity.JadwalData? {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            intent.getSerializableExtra("JADWAL_DATA", DashboardGuruActivity.JadwalData::class.java)
        } else {
            @Suppress("DEPRECATION")
            intent.getSerializableExtra("JADWAL_DATA") as? DashboardGuruActivity.JadwalData
        }
    }

    private fun setClickListeners() {
        btnAbsensi.setOnClickListener { showAbsensiPopup() }
        btnTidakMengajar1.setOnClickListener { showTidakMengajarPopup() }
        btnIzinSakit.setOnClickListener { showIzinSakitPopup() }
        btnAjukanDispen.setOnClickListener { showDispensasiPopup() }

        // Long click untuk testing
        btnAbsensi.setOnLongClickListener {
            val intent = Intent(this, AbsensiSiswaActivity::class.java).apply {
                putExtra("MATA_PELAJARAN", currentJadwal.mataPelajaran)
                putExtra("KELAS", currentJadwal.kelas)
                putExtra("JAM", currentJadwal.jam)
                putExtra("TANGGAL", SimpleDateFormat("dd-MM-yyyy", Locale.getDefault()).format(Date()))
                putExtra(AbsensiSiswaActivity.EXTRA_SCHEDULE_ID, currentJadwal.id)
                putExtra(AbsensiSiswaActivity.EXTRA_CLASS_ID, currentJadwal.idKelas)
            }
            startActivity(intent)
            true
        }
    }

    private fun terapkanStatusIzinGuru(tipeIzin: String) {
        statusIzinGuru = tipeIzin

        btnAbsensi.visibility = View.GONE
        btnTidakMengajar1.visibility = View.GONE
        btnIzinSakit.visibility = View.GONE
        btnAjukanDispen.visibility = View.GONE

        val drawable = when (tipeIzin) {
            "sakit" -> R.drawable.siswa_sakit_wakel
            else -> R.drawable.siswa_izin_wakel
        }
        btnInfoHadir.setImageResource(drawable)
        btnInfoHadir.visibility = View.VISIBLE
    }

    private fun formatTanggalWaktu(jam: String): String {
        val sdf = SimpleDateFormat("dd-MM-yyyy", Locale.getDefault())
        val tanggalSekarang = sdf.format(Date())
        return "$jam $tanggalSekarang"
    }

    private fun getFileName(uri: Uri): String {
        var result = "file_selected.jpg"
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

    // ==================== HELPER URI TO FILE ====================
    private fun getFileFromUri(uri: Uri): File? {
        val contentResolver = contentResolver
        val tempFile = File(cacheDir, getFileName(uri))
        try {
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
            return tempFile
        } catch (e: Exception) {
            e.printStackTrace()
            return null
        }
    }

    // ==================== LOAD STUDENTS FROM API ====================
    private fun loadStudentsFromApi() {
        val scheduleId = currentJadwal.id
        val classId = currentJadwal.idKelas

        lifecycleScope.launch {
            try {
                Log.d(TAG_DROPDOWN, "Load siswa start: scheduleId=$scheduleId classId=$classId")

                var students: List<StudentResource> = emptyList()
                var source = "none"
                var lastError: String? = null

                // 1) Paling spesifik: siswa pada jadwal aktif
                if (scheduleId > 0) {
                    when (val bySchedule = teacherRepository.getMyScheduleStudents(scheduleId)) {
                        is Result.Success -> {
                            students = bySchedule.data
                            source = "schedule_students"
                            Log.d(TAG_DROPDOWN, "By schedule: ${students.size}")
                        }
                        is Result.Error -> {
                            lastError = bySchedule.message
                            Log.w(TAG_DROPDOWN, "By schedule gagal: ${bySchedule.message}")
                        }
                        is Result.Loading -> Unit
                    }
                }

                // 2) Fallback: seluruh siswa homeroom
                if (students.isEmpty()) {
                    when (val byHomeroom = teacherRepository.getMyHomeroomStudents()) {
                        is Result.Success -> {
                            students = byHomeroom.data
                            source = "homeroom_students"
                            Log.d(TAG_DROPDOWN, "By homeroom: ${students.size}")
                        }
                        is Result.Error -> {
                            lastError = byHomeroom.message
                            Log.w(TAG_DROPDOWN, "By homeroom gagal: ${byHomeroom.message}")
                        }
                        is Result.Loading -> Unit
                    }
                }

                // 3) Fallback: berdasarkan class_id
                if (students.isEmpty()) {
                    val resolvedClassId = resolveBestClassId(classId)
                    if (resolvedClassId > 0) {
                        when (val byClass = studentRepository.getStudents(classId = resolvedClassId)) {
                            is Result.Success -> {
                                students = byClass.data
                                source = "class_students"
                                Log.d(TAG_DROPDOWN, "By class($resolvedClassId): ${students.size}")
                            }
                            is Result.Error -> {
                                lastError = byClass.message
                                Log.w(TAG_DROPDOWN, "By class gagal: ${byClass.message}")
                            }
                            is Result.Loading -> Unit
                        }
                    }
                }

                // 4) Fallback terakhir: semua siswa (untuk mencegah dropdown kosong total)
                if (students.isEmpty()) {
                    when (val all = studentRepository.getStudents()) {
                        is Result.Success -> {
                            students = all.data
                            source = "all_students"
                            Log.d(TAG_DROPDOWN, "By all students: ${students.size}")
                        }
                        is Result.Error -> {
                            lastError = all.message
                            Log.w(TAG_DROPDOWN, "By all students gagal: ${all.message}")
                        }
                        is Result.Loading -> Unit
                    }
                }

                loadedStudentsList = students
                loadedStudentNames.clear()
                loadedStudentNames.addAll(
                    students.map { it.name?.takeIf(String::isNotBlank) ?: "Tanpa Nama" }
                )
                siswaNameAdapter.notifyDataSetChanged()

                Log.d(TAG_DROPDOWN, "Jumlah siswa: ${loadedStudentNames.size} (source=$source)")

                val txtJumlahSiswa: TextView = findViewById(R.id.txt_end_3)
                txtJumlahSiswa.text = loadedStudentsList.size.toString()

                if (scheduleId > 0) {
                    fetchAttendanceMap(scheduleId)
                } else {
                    studentToAttendanceIdMap.clear()
                }

                if (loadedStudentsList.isEmpty() && !lastError.isNullOrBlank()) {
                    showError(lastError)
                }
            } catch (e: Exception) {
                showError("Gagal memuat data siswa: ${e.message}")
                loadedStudentsList = emptyList()
                loadedStudentNames.clear()
                siswaNameAdapter.notifyDataSetChanged()
                Log.e(TAG_DROPDOWN, "Exception load siswa: ${e.message}", e)
            }
        }
    }

    private suspend fun fetchAttendanceMap(scheduleId: Int) {
        when (val attendanceResult = attendanceRepository.getAttendanceBySchedule(scheduleId)) {
            is Result.Success -> {
                studentToAttendanceIdMap.clear()
                attendanceResult.data.forEach { attendance ->
                    val studentId = attendance.student?.id
                    val attendanceId = attendance.id
                    if (studentId != null && attendanceId != null) {
                        studentToAttendanceIdMap[studentId] = attendanceId
                    }
                }
            }
            is Result.Error -> {
                Log.w(TAG_DROPDOWN, "Gagal memuat map absensi: ${attendanceResult.message}")
            }
            is Result.Loading -> Unit
        }
    }

    private suspend fun resolveBestClassId(initialClassId: Int): Int {
        if (initialClassId > 0) return initialClassId
        return when (val myClass = teacherRepository.getMyHomeroom()) {
            is Result.Success -> myClass.data.id ?: 0
            else -> 0
        }
    }

    private var loadedStudentsList: List<com.example.ritamesa.api.models.StudentResource> = emptyList()

    private fun getSiswaByKelasList(): List<com.example.ritamesa.api.models.StudentResource> {
        return loadedStudentsList
    }

    private fun getSiswaByKelas(): Array<String> {
        return loadedStudentNames.toTypedArray()
    }

    // ==================== POPUP ABSENSI ====================
    private fun showAbsensiPopup() {
        val dialog = Dialog(this)
        dialog.setContentView(R.layout.pop_up_absensi)
        dialog.window?.setBackgroundDrawableResource(android.R.color.transparent)

        val btnPindaiQr: Button = dialog.findViewById(R.id.btn_pindaiqr)
        val btnKembali: Button = dialog.findViewById(R.id.btn_kembali)

        btnPindaiQr.setOnClickListener {
            dialog.dismiss()
            val intent = Intent(this, CameraQRActivity::class.java).apply {
                putExtra(CameraQRActivity.EXTRA_MAPEL, currentJadwal.mataPelajaran)
                putExtra(CameraQRActivity.EXTRA_KELAS, currentJadwal.kelas)
            }
            qrScannerLauncher.launch(intent)
        }

        btnKembali.setOnClickListener { dialog.dismiss() }
        dialog.show()
    }

    // ==================== POPUP TIDAK MENGAJAR (IZIN GURU) ====================
    private fun showTidakMengajarPopup() {
        val dialog = Dialog(this)
        dialog.setContentView(R.layout.pop_up_tidak_mengajar)
        dialog.window?.setBackgroundDrawableResource(android.R.color.transparent)

        val tvNamaMapel: TextView = dialog.findViewById(R.id.tv_nama_mapel)
        val tvKelas: TextView = dialog.findViewById(R.id.tv_kelas)
        val inputKeterangan: EditText = dialog.findViewById(R.id.input_keterangan)
        val btnDropdownKeterangan: LinearLayout = dialog.findViewById(R.id.btn_dropdown_keterangan)
        val inputMapel: EditText = dialog.findViewById(R.id.input_mapel)
        val btnDropdownMapel: LinearLayout = dialog.findViewById(R.id.btn_dropdown_mapel)
        val inputTanggal: EditText = dialog.findViewById(R.id.input_tanggal)
        val etCatatan: EditText = dialog.findViewById(R.id.et_catatan)
        val btnKirimIzin: Button = dialog.findViewById(R.id.btn_kirim_izin)
        val btnBatalIzin: Button = dialog.findViewById(R.id.btn_batal_izin)

        // Set data
        tvNamaMapel.text = "${currentJadwal.mataPelajaran} - "
        tvKelas.text = currentJadwal.kelas
        inputMapel.setText(currentJadwal.jam)

        val sdf = SimpleDateFormat("dd-MM-yyyy", Locale.getDefault())
        inputTanggal.setText(sdf.format(Date()))

        // Setup dropdown keterangan (hanya Izin dan Sakit)
        inputKeterangan.isFocusable = false
        inputKeterangan.isClickable = true
        inputKeterangan.setOnClickListener { showKeteranganDropdownTidakMengajar(inputKeterangan) }
        btnDropdownKeterangan.setOnClickListener { showKeteranganDropdownTidakMengajar(inputKeterangan) }

        // Setup dropdown jam mapel
        inputMapel.isFocusable = false
        inputMapel.isClickable = true
        inputMapel.setOnClickListener { showJamMapelDropdown(inputMapel) }
        btnDropdownMapel.setOnClickListener { showJamMapelDropdown(inputMapel) }

        // Setup tanggal
        inputTanggal.setOnClickListener { showDatePickerDialog(inputTanggal) }

        btnKirimIzin.setOnClickListener {
            val keterangan = inputKeterangan.text.toString()
            val jamMapel = inputMapel.text.toString()
            val catatan = etCatatan.text.toString()

            if (keterangan.isEmpty()) {
                Toast.makeText(this, "Harap pilih keterangan", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val tipeIzin = when {
                keterangan.contains("Sakit", ignoreCase = true) -> "sakit"
                else -> "izin"
            }

            showSuccessDialog(
                title = "Sukses",
                message = """
                    Izin tidak mengajar berhasil dikirim!
                    
                    Mata Pelajaran: ${currentJadwal.mataPelajaran}
                    Kelas: ${currentJadwal.kelas}
                    Keterangan: $keterangan
                    Jadwal: $jamMapel
                    Tanggal: ${inputTanggal.text}
                    ${if (catatan.isNotEmpty()) "Catatan: $catatan" else ""}
                """.trimIndent()
            ) {
                dialog.dismiss()
                terapkanStatusIzinGuru(tipeIzin)
            }
        }

        btnBatalIzin.setOnClickListener { dialog.dismiss() }
        dialog.show()
    }

    // ==================== POPUP IZIN/SAKIT SISWA (DENGAN FILE) ====================
    private fun showIzinSakitPopup() {
        loadStudentsFromApi()
        val dialog = Dialog(this)
        dialog.setContentView(R.layout.pop_up_izin)
        dialog.window?.setBackgroundDrawableResource(android.R.color.transparent)

        // SESUAIKAN DENGAN ID DI pop_up_izin.xml
        val inputNamaSiswa: EditText = dialog.findViewById(R.id.input_nama_siswa)
        val btnDropdownSiswa: ImageButton = dialog.findViewById(R.id.btn_dropdown_siswa)

        // Box bukti surat
        val boxBuktiSurat: LinearLayout = dialog.findViewById(R.id.box_bukti_surat)
        val namaFileTextView: TextView = dialog.findViewById(R.id.namafile)
        val btnTambahkanFile: ImageButton = dialog.findViewById(R.id.btn_tambahkanfile)
        currentNamaFileTextView = namaFileTextView

        // Jam section
        val layoutJamSection: LinearLayout = dialog.findViewById(R.id.layout_jam_section)
        val inputJam: EditText = dialog.findViewById(R.id.input_jam)
        val btnSetClock: ImageView = dialog.findViewById(R.id.btn_set_clock)
        val btnDropdownJam: LinearLayout = dialog.findViewById(R.id.btn_dropdown_jam)
        val inputJamSelesai: EditText = dialog.findViewById(R.id.input_jam_selesai)
        val btnSetClockSelesai: ImageView = dialog.findViewById(R.id.btn_set_clock_selesai)
        val btnDropdownJamSelesai: LinearLayout = dialog.findViewById(R.id.btn_dropdown_jam_selesai)

        // Tanggal dan catatan
        val inputTanggal: EditText = dialog.findViewById(R.id.input_tanggal)
        val etCatatan: EditText = dialog.findViewById(R.id.et_catatan)

        // Tombol
        val btnKirimIzin: Button = dialog.findViewById(R.id.btn_kirim_izin)
        val btnBatalIzin: Button = dialog.findViewById(R.id.btn_batal_izin)

        // Set tanggal default
        val sdf = SimpleDateFormat("dd-MM-yyyy", Locale.getDefault())
        inputTanggal.setText(sdf.format(Date()))

        // Reset state
        selectedFileUri = null
        namaFileTextView.text = "Masukkan Bukti Surat (izin/sakit)"
        boxBuktiSurat.visibility = View.VISIBLE
        layoutJamSection.visibility = View.GONE

        // Setup dropdown siswa dengan keterangan
        inputNamaSiswa.isFocusable = false
        inputNamaSiswa.isClickable = true
        selectedStudentIdFromDropdown = null
        selectedStudentNameFromDropdown = null
        inputNamaSiswa.setOnClickListener {
            lifecycleScope.launch {
                showSiswaWithKeteranganDropdown(inputNamaSiswa, boxBuktiSurat, layoutJamSection)
            }
        }
        btnDropdownSiswa.setOnClickListener {
            lifecycleScope.launch {
                showSiswaWithKeteranganDropdown(inputNamaSiswa, boxBuktiSurat, layoutJamSection)
            }
        }

        // Setup file picker
        btnTambahkanFile.setOnClickListener {
            filePickerLauncher.launch("image/*")
        }

        // Setup jam
        inputJam.isFocusable = false
        inputJam.isClickable = true
        inputJam.setOnClickListener { showTimePickerDialog(inputJam) }
        btnSetClock.setOnClickListener { showTimePickerDialog(inputJam) }
        btnDropdownJam.setOnClickListener { showTimePickerDialog(inputJam) }

        inputJamSelesai.isFocusable = false
        inputJamSelesai.isClickable = true
        inputJamSelesai.setOnClickListener { showTimePickerDialog(inputJamSelesai) }
        btnSetClockSelesai.setOnClickListener { showTimePickerDialog(inputJamSelesai) }
        btnDropdownJamSelesai.setOnClickListener { showTimePickerDialog(inputJamSelesai) }

        // Setup tanggal
        inputTanggal.setOnClickListener { showDatePickerDialog(inputTanggal) }

        btnKirimIzin.setOnClickListener {
            val namaSiswaWithKeterangan = inputNamaSiswa.text.toString()
            val jamMulai = inputJam.text.toString()
            val jamSelesai = inputJamSelesai.text.toString()
            val catatan = etCatatan.text.toString()

            // Validasi
            val validationError = validateIzinSakitInput(
                namaSiswaWithKeterangan,
                jamMulai,
                jamSelesai
            )
            if (validationError != null) {
                Toast.makeText(this, validationError, Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val parts = namaSiswaWithKeterangan.split(" - ")
            val namaSiswa = parts[0]
            val keterangan = parts[1]

            // Validasi file untuk Izin/Sakit
            if ((keterangan == "Izin" || keterangan == "Sakit") && selectedFileUri == null) {
                Toast.makeText(this, "Harap masukkan bukti surat untuk $keterangan", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val jamRange = if (keterangan == "Izin Pulang") "$jamMulai - $jamSelesai" else "-"
            val fileName = if (selectedFileUri != null) getFileName(selectedFileUri!!) else "-"

            // GET STUDENT ID
            val selectedStudentName = selectedStudentNameFromDropdown ?: namaSiswa
            val selectedStudentId = selectedStudentIdFromDropdown
                ?: getSiswaByKelasList().find { (it.name ?: "").trim() == selectedStudentName.trim() }?.id

            if (selectedStudentId == null) {
                Toast.makeText(this@DetailJadwalWakelActivity, "ID Siswa tidak ditemukan", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val isNewLeave = currentJadwal.id == 0 // Menentukan apakah ini izin baru atau update absen

            lifecycleScope.launch {
                try {
                    btnKirimIzin.isEnabled = false
                    btnKirimIzin.text = "Mengirim..."

                    if (isNewLeave) {
                        // Mengajukan Izin Baru
                        val req = com.example.ritamesa.api.models.CreateLeavePermissionRequest(
                            studentId = selectedStudentId,
                            type = if (keterangan == "Sakit") "sick" else "excused",
                            reason = if (catatan.isNotEmpty()) catatan else keterangan,
                            startTime = if (keterangan == "Izin Pulang") jamMulai else null,
                            endTime = if (keterangan == "Izin Pulang") jamSelesai else null
                        )
                        val result = leavePermissionRepository.createLeavePermission(req)
                        handleResult(result, onSuccess = {
                            uploadBuktiAndFinish(it.id ?: 0, keterangan, selectedStudentName, dialog, jamRange, catatan, inputTanggal.text.toString(), fileName)
                        }, onError = { _, msg ->
                            showError("Gagal mengajukan izin: $msg")
                            resetButton(btnKirimIzin)
                        })
                    } else {
                        // Merevisi/Update Absen
                        val attendanceId = ensureAttendanceId(
                            studentId = selectedStudentId,
                            tanggalDisplay = inputTanggal.text.toString(),
                            status = if (keterangan == "Sakit") "sick" else "excused",
                            reason = if (catatan.isNotEmpty()) catatan else keterangan
                        )
                        val attachmentPart = selectedFileUri
                            ?.let { getFileFromUri(it) }
                            ?.let { file ->
                                val requestFile = file.asRequestBody("image/*".toMediaTypeOrNull())
                                MultipartBody.Part.createFormData("attachment", file.name, requestFile)
                            }
                        val result = attendanceRepository.updateAttendanceExcuse(
                            attendanceId = attendanceId,
                            status = if (keterangan == "Sakit") "sick" else "excused",
                            reason = if (catatan.isNotEmpty()) catatan else keterangan,
                            attachment = attachmentPart
                        )
                        handleResult(result, onSuccess = {
                            studentToAttendanceIdMap[selectedStudentId] = it.id ?: attendanceId
                            showSuccessPesan(
                                selectedStudentName,
                                keterangan,
                                jamRange,
                                inputTanggal.text.toString(),
                                fileName,
                                catatan,
                                dialog
                            )
                        }, onError = { _, msg ->
                            showError("Gagal update absen: $msg")
                            resetButton(btnKirimIzin)
                        })
                    }

                } catch (e: Exception) {
                    showError("Terjadi kesalahan: ${e.message}")
                    resetButton(btnKirimIzin)
                }
            }
        }

        btnBatalIzin.setOnClickListener { dialog.dismiss() }
        dialog.show()
    }

    private fun resetButton(btn: Button) {
        btn.isEnabled = true
        btn.text = "Kirim"
    }

    private suspend fun ensureAttendanceId(
        studentId: Int,
        tanggalDisplay: String,
        status: String,
        reason: String
    ): Int {
        studentToAttendanceIdMap[studentId]?.takeIf { it > 0 }?.let { return it }

        val request = com.example.ritamesa.api.models.ManualAttendanceRequest(
            attendeeType = "student",
            scheduleId = currentJadwal.id,
            status = status,
            date = toApiDate(tanggalDisplay),
            studentId = studentId,
            reason = reason,
            isEarlyLeave = false
        )

        return when (val result = attendanceRepository.recordManualAttendance(request)) {
            is Result.Success -> {
                val attendanceId = result.data.id
                    ?: throw IllegalStateException("attendance_id kosong dari server")
                studentToAttendanceIdMap[studentId] = attendanceId
                attendanceId
            }
            is Result.Error -> {
                throw IllegalStateException(result.message ?: "Gagal membuat absensi manual")
            }
            is Result.Loading -> {
                throw IllegalStateException("State loading tidak valid")
            }
        }
    }

    private fun toApiDate(displayDate: String): String {
        val inputFormat = SimpleDateFormat("dd-MM-yyyy", Locale.getDefault()).apply {
            isLenient = false
        }
        val outputFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        val parsed = inputFormat.parse(displayDate)
            ?: throw IllegalArgumentException("Format tanggal tidak valid")
        return outputFormat.format(parsed)
    }

    private fun uploadBuktiAndFinish(
        attendanceId: Int, keterangan: String, namaSiswa: String, dialog: Dialog,
        jamRange: String, catatan: String, tanggal: String, fileName: String
    ) {
        if (selectedFileUri != null && attendanceId > 0) {
            val file = getFileFromUri(selectedFileUri!!)
            if (file != null) {
                val requestFile = file.asRequestBody("image/*".toMediaTypeOrNull())
                val body = MultipartBody.Part.createFormData("file", file.name, requestFile)

                lifecycleScope.launch {
                    val uploadResult = attendanceRepository.addAttendanceAttachment(attendanceId, body)
                    handleResult(uploadResult, onSuccess = {
                        showSuccessPesan(namaSiswa, keterangan, jamRange, tanggal, fileName, catatan, dialog)
                    }, onError = { _, _ ->
                        showSuccessPesan(namaSiswa, keterangan, jamRange, tanggal, "Gagal upload file", catatan, dialog)
                    })
                }
            } else {
                showSuccessPesan(namaSiswa, keterangan, jamRange, tanggal, fileName, catatan, dialog)
            }
        } else {
            showSuccessPesan(namaSiswa, keterangan, jamRange, tanggal, fileName, catatan, dialog)
        }
    }

    private fun showSuccessPesan(
        namaSiswa: String, keterangan: String, jamRange: String, tanggal: String, fileName: String, catatan: String, dialog: Dialog
    ) {
        showSuccessDialog(
            title = "Sukses",
            message = """
                Izin/Sakit berhasil diajukan!
                
                Nama Siswa: $namaSiswa
                Keterangan: $keterangan
                Mata Pelajaran: ${currentJadwal.mataPelajaran}
                Kelas: ${currentJadwal.kelas}
                ${if (keterangan == "Izin Pulang") "Jam: $jamRange" else ""}
                Tanggal Berlaku: $tanggal
                ${if (fileName != "-") "File: $fileName" else ""}
                ${if (catatan.isNotEmpty()) "Catatan: $catatan" else ""}
            """.trimIndent()
        ) {
            dialog.dismiss()
        }
    }

    // ==================== POPUP DISPENSASI SISWA (TANPA FILE) ====================
    // FIXED: TIDAK ADA input_keterangan, HANYA nama, jam, tanggal, catatan
    private fun showDispensasiPopup() {
        loadStudentsFromApi()
        val dialog = Dialog(this)
        dialog.setContentView(R.layout.pop_up_dispensasi)
        dialog.window?.setBackgroundDrawableResource(android.R.color.transparent)

        // SESUAIKAN DENGAN ID DI pop_up_dispensasi.xml
        // HANYA view yang ADA di XML dispensasi
        val inputNamaSiswa: EditText = dialog.findViewById(R.id.input_nama_siswa)
        val btnDropdownSiswa: ImageButton = dialog.findViewById(R.id.btn_dropdown_siswa)

        // Jam
        val inputJam: EditText = dialog.findViewById(R.id.input_jam)
        val btnSetClock: ImageView = dialog.findViewById(R.id.btn_set_clock)
        val btnDropdownJam: LinearLayout = dialog.findViewById(R.id.btn_dropdown_jam)
        val inputJamSelesai: EditText = dialog.findViewById(R.id.input_jam_selesai)
        val btnSetClockSelesai: ImageView = dialog.findViewById(R.id.btn_set_clock_selesai)
        val btnDropdownJamSelesai: LinearLayout = dialog.findViewById(R.id.btn_dropdown_jam_selesai)

        // Tanggal dan catatan
        val inputTanggal: EditText = dialog.findViewById(R.id.input_tanggal)
        val etCatatan: EditText = dialog.findViewById(R.id.et_catatan)

        // Tombol - PERHATIKAN ID NYA BERBEDA!
        val btnKirimDispen: Button = dialog.findViewById(R.id.btn_kirim_dispen)
        val btnBatal: Button = dialog.findViewById(R.id.btn_batal)

        // Set tanggal default
        val sdf = SimpleDateFormat("dd-MM-yyyy", Locale.getDefault())
        inputTanggal.setText(sdf.format(Date()))

        // Setup dropdown siswa - LANGSUNG, tanpa fungsi helper
        inputNamaSiswa.isFocusable = false
        inputNamaSiswa.isClickable = true
        selectedStudentIdFromDropdown = null
        selectedStudentNameFromDropdown = null
        inputNamaSiswa.setOnClickListener { showSiswaByKelasDropdown(inputNamaSiswa) }
        btnDropdownSiswa.setOnClickListener { showSiswaByKelasDropdown(inputNamaSiswa) }

        // Setup jam - LANGSUNG, tanpa fungsi helper
        inputJam.isFocusable = false
        inputJam.isClickable = true
        inputJam.setOnClickListener { showTimePickerDialog(inputJam) }
        btnSetClock.setOnClickListener { showTimePickerDialog(inputJam) }
        btnDropdownJam.setOnClickListener { showTimePickerDialog(inputJam) }

        inputJamSelesai.isFocusable = false
        inputJamSelesai.isClickable = true
        inputJamSelesai.setOnClickListener { showTimePickerDialog(inputJamSelesai) }
        btnSetClockSelesai.setOnClickListener { showTimePickerDialog(inputJamSelesai) }
        btnDropdownJamSelesai.setOnClickListener { showTimePickerDialog(inputJamSelesai) }

        // Setup tanggal
        inputTanggal.setOnClickListener { showDatePickerDialog(inputTanggal) }

        btnKirimDispen.setOnClickListener {
            val namaSiswa = inputNamaSiswa.text.toString()
            val jamMulai = inputJam.text.toString()
            val jamSelesai = inputJamSelesai.text.toString()
            val catatan = etCatatan.text.toString()

            // Validasi - HANYA nama dan jam (TIDAK ADA keterangan)
            if (namaSiswa.isEmpty()) {
                Toast.makeText(this, "Harap pilih nama siswa", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            if (jamMulai.isEmpty()) {
                Toast.makeText(this, "Harap atur jam mulai dispensasi", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            if (jamSelesai.isEmpty()) {
                Toast.makeText(this, "Harap atur jam selesai dispensasi", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            // GET STUDENT ID
            val selectedStudentName = selectedStudentNameFromDropdown ?: namaSiswa
            val selectedStudentId = selectedStudentIdFromDropdown
                ?: getSiswaByKelasList().find { (it.name ?: "").trim() == selectedStudentName.trim() }?.id

            if (selectedStudentId == null) {
                Toast.makeText(this@DetailJadwalWakelActivity, "ID Siswa tidak ditemukan", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            lifecycleScope.launch {
                try {
                    btnKirimDispen.isEnabled = false
                    btnKirimDispen.text = "Mengirim..."

                    val req = com.example.ritamesa.api.models.CreateLeavePermissionRequest(
                        studentId = selectedStudentId,
                        type = "dispensation",
                        reason = if (catatan.isNotEmpty()) catatan else "Dispensasi",
                        startTime = jamMulai,
                        endTime = jamSelesai
                    )

                    val result = leavePermissionRepository.createLeavePermission(req)
                    handleResult(result, onSuccess = {
                        val jamRange = "$jamMulai - $jamSelesai"
                        showSuccessDialog(
                            title = "Sukses",
                            message = """
                                Dispensasi berhasil diajukan!
                                
                                Nama Siswa: $namaSiswa
                                Mata Pelajaran: ${currentJadwal.mataPelajaran}
                                Kelas: ${currentJadwal.kelas}
                                Jam: $jamRange
                                Tanggal Berlaku: ${inputTanggal.text}
                                ${if (catatan.isNotEmpty()) "Catatan: $catatan" else ""}
                            """.trimIndent()
                        ) {
                            dialog.dismiss()
                        }
                    }, onError = { _, msg ->
                        showError("Gagal mengajukan dispensasi: $msg")
                        btnKirimDispen.isEnabled = true
                        btnKirimDispen.text = "Kirim"
                    })

                } catch (e: Exception) {
                    showError("Terjadi kesalahan: ${e.message}")
                    btnKirimDispen.isEnabled = true
                    btnKirimDispen.text = "Kirim"
                }
            }
        }

        btnBatal.setOnClickListener { dialog.dismiss() }
        dialog.show()
    }

    // ==================== HELPER FUNCTIONS ====================

    private fun showSiswaByKelasDropdown(editText: EditText) {
        val siswaList = getSiswaByKelas()
        if (siswaList.isEmpty()) {
            Toast.makeText(this, "Daftar siswa sedang dimuat...", Toast.LENGTH_SHORT).show()
            loadStudentsFromApi()
            Log.d(TAG_DROPDOWN, "Dropdown siswa kosong saat dibuka")
            return
        }
        AlertDialog.Builder(this)
            .setTitle("Pilih Siswa - ${currentJadwal.kelas}")
            .setItems(siswaList) { _, which ->
                editText.setText(siswaList[which])
                val selected = loadedStudentsList.getOrNull(which)
                selectedStudentIdFromDropdown = selected?.id
                selectedStudentNameFromDropdown = selected?.name ?: siswaList[which]
                Log.d(
                    TAG_DROPDOWN,
                    "Selected siswa: name=${selectedStudentNameFromDropdown}, id=${selectedStudentIdFromDropdown}"
                )
            }
            .show()
    }

    private fun showSiswaWithKeteranganDropdown(
        editText: EditText,
        boxBuktiSurat: LinearLayout,
        layoutJamSection: LinearLayout
    ) {
        val siswaList = getSiswaByKelas()
        if (siswaList.isEmpty()) {
            Toast.makeText(this, "Daftar siswa sedang dimuat...", Toast.LENGTH_SHORT).show()
            loadStudentsFromApi()
            Log.d(TAG_DROPDOWN, "Dropdown siswa+keterangan kosong saat dibuka")
            return
        }
        val keteranganList = arrayOf("Izin", "Sakit", "Izin Pulang")

        AlertDialog.Builder(this)
            .setTitle("Pilih Siswa - ${currentJadwal.kelas}")
            .setItems(siswaList) { _, siswaIndex ->
                val namaSiswa = siswaList[siswaIndex]
                val selected = loadedStudentsList.getOrNull(siswaIndex)
                selectedStudentIdFromDropdown = selected?.id
                selectedStudentNameFromDropdown = selected?.name ?: namaSiswa
                Log.d(
                    TAG_DROPDOWN,
                    "Selected siswa (izin): name=${selectedStudentNameFromDropdown}, id=${selectedStudentIdFromDropdown}"
                )

                AlertDialog.Builder(this)
                    .setTitle("Pilih Keterangan")
                    .setItems(keteranganList) { _, keteranganIndex ->
                        val keterangan = keteranganList[keteranganIndex]
                        editText.setText("$namaSiswa - $keterangan")

                        when (keterangan) {
                            "Izin Pulang" -> {
                                boxBuktiSurat.visibility = View.GONE
                                layoutJamSection.visibility = View.VISIBLE
                            }
                            else -> {
                                boxBuktiSurat.visibility = View.VISIBLE
                                layoutJamSection.visibility = View.GONE
                            }
                        }
                    }
                    .show()
            }
            .show()
    }

    private fun validateIzinSakitInput(
        namaSiswaWithKeterangan: String,
        jamMulai: String,
        jamSelesai: String
    ): String? {
        if (namaSiswaWithKeterangan.isEmpty()) {
            return "Harap pilih nama siswa"
        }

        val parts = namaSiswaWithKeterangan.split(" - ")
        if (parts.size < 2) {
            return "Format nama siswa tidak valid"
        }

        val keterangan = parts[1]

        if (keterangan == "Izin Pulang") {
            if (jamMulai.isEmpty()) return "Harap atur jam mulai"
            if (jamSelesai.isEmpty()) return "Harap atur jam selesai"
        }

        return null
    }

    private fun showKeteranganDropdownTidakMengajar(editText: EditText) {
        val items = arrayOf("Izin", "Sakit")
        AlertDialog.Builder(this)
            .setTitle("Pilih Keterangan")
            .setItems(items) { _, which -> editText.setText(items[which]) }
            .show()
    }

    private fun showJamMapelDropdown(editText: EditText) {
        val items = arrayOf(
            currentJadwal.jam,
            "Tukar jam dengan guru lain",
            "Jam pengganti"
        )
        AlertDialog.Builder(this)
            .setTitle("Pilih Jadwal")
            .setItems(items) { _, which -> editText.setText(items[which]) }
            .show()
    }

    private fun showDatePickerDialog(editText: EditText) {
        val calendar = Calendar.getInstance()
        android.app.DatePickerDialog(
            this,
            { _, selectedYear, selectedMonth, selectedDay ->
                editText.setText(
                    String.format(Locale.getDefault(), "%02d-%02d-%04d",
                        selectedDay, selectedMonth + 1, selectedYear)
                )
            },
            calendar.get(Calendar.YEAR),
            calendar.get(Calendar.MONTH),
            calendar.get(Calendar.DAY_OF_MONTH)
        ).show()
    }

    private fun showTimePickerDialog(editText: EditText) {
        val calendar = Calendar.getInstance()
        android.app.TimePickerDialog(
            this,
            { _, hourOfDay, minute ->
                editText.setText(
                    String.format(Locale.getDefault(), "%02d:%02d", hourOfDay, minute)
                )
            },
            calendar.get(Calendar.HOUR_OF_DAY),
            calendar.get(Calendar.MINUTE),
            true
        ).show()
    }

    private fun showSuccessDialog(title: String, message: String, onOk: () -> Unit) {
        AlertDialog.Builder(this)
            .setTitle(title)
            .setMessage(message)
            .setPositiveButton("OK") { _, _ -> onOk() }
            .show()
    }
}
