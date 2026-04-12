package com.example.ritamesa

import android.app.Dialog
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.OpenableColumns
import android.util.Log
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.CheckBox
import android.widget.EditText
import android.widget.ImageButton
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AlertDialog
import androidx.lifecycle.lifecycleScope
import com.example.ritamesa.api.Result
import com.example.ritamesa.api.models.CreateLeavePermissionRequest
import com.example.ritamesa.api.models.ManualAttendanceRequest
import com.example.ritamesa.api.models.MarkAttendanceExcuseRequest
import com.example.ritamesa.api.models.StudentResource
import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.asRequestBody
import java.io.File
import java.io.FileOutputStream
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale

class DetailJadwalGuruActivity : BaseNetworkActivity() {

    private lateinit var currentJadwal: DashboardGuruActivity.JadwalData
    private var statusIzinGuru: String? = null
    private var loadedStudentNames: Array<String> = emptyArray()
    private var loadedStudentsList: List<StudentResource> = emptyList()
    private val studentToAttendanceIdMap = mutableMapOf<Int, Int>()

    private lateinit var btnAbsensi: ImageButton
    private lateinit var btnTidakMengajar: ImageButton
    private lateinit var btnIzinSakit: ImageButton
    private lateinit var btnAjukanDispen: ImageButton
    private lateinit var btnInfoHadir: ImageButton

    private var selectedFileUri: Uri? = null
    private var izinDialog: Dialog? = null
    private var izinDialogFileTextView: TextView? = null

    private val qrScannerLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode != RESULT_OK) return@registerForActivityResult

        val data = result.data
        val isSuccess = data?.getBooleanExtra(CameraQRActivity.EXTRA_QR_RESULT, false) ?: false
        if (!isSuccess) {
            Toast.makeText(this, "Gagal scan QR", Toast.LENGTH_SHORT).show()
            return@registerForActivityResult
        }

        val kelas = data.getStringExtra(CameraQRActivity.EXTRA_KELAS) ?: "-"
        val mapel = data.getStringExtra(CameraQRActivity.EXTRA_MAPEL) ?: "-"
        val tanggal = data.getStringExtra("tanggal") ?: "-"
        val jam = data.getStringExtra("jam") ?: "-"

        Toast.makeText(
            this,
            "Absensi berhasil!\n$mapel - $kelas\n$tanggal $jam",
            Toast.LENGTH_LONG
        ).show()

        startActivity(Intent(this, AbsensiSiswaActivity::class.java).apply {
            putExtra(CameraQRActivity.EXTRA_MAPEL, mapel)
            putExtra(CameraQRActivity.EXTRA_KELAS, kelas)
            putExtra("tanggal", tanggal)
            putExtra("jam", jam)
            putExtra(AbsensiSiswaActivity.EXTRA_SCHEDULE_ID, currentJadwal.id)
            putExtra(AbsensiSiswaActivity.EXTRA_CLASS_ID, currentJadwal.idKelas)
        })
    }

    private val filePickerLauncher = registerForActivityResult(
        ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        val activeDialog = izinDialog
        if (uri == null || activeDialog?.isShowing != true) return@registerForActivityResult
        selectedFileUri = uri
        izinDialogFileTextView?.text = getFileName(uri)
    }

    @Suppress("DEPRECATION")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.detail_jadwal_guru)

        val jadwalData = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            intent.getSerializableExtra("JADWAL_DATA", DashboardGuruActivity.JadwalData::class.java)
        } else {
            intent.getSerializableExtra("JADWAL_DATA") as? DashboardGuruActivity.JadwalData
        }

        if (jadwalData == null) {
            showError("Data jadwal tidak ditemukan")
            finish()
            return
        }

        initMainViews(jadwalData)
        setClickListeners()
        loadStudentsFromApi()
    }

    override fun onDestroy() {
        izinDialogFileTextView = null
        izinDialog = null
        super.onDestroy()
    }

    private fun initMainViews(jadwalData: DashboardGuruActivity.JadwalData) {
        val tvNamaMapel: TextView = findViewById(R.id.text_nama_mapel)
        val tvKelas: TextView = findViewById(R.id.title_kelas)
        val tvTanggalWaktu: TextView = findViewById(R.id.tanggal_waktu_mulai)
        val tvMapelDetail: TextView = findViewById(R.id.txt_end_1)
        val tvKelasDetail: TextView = findViewById(R.id.txt_end_2)
        val txtJumlahSiswa: TextView = findViewById(R.id.txt_end_3)
        val btnBack: ImageButton = findViewById(R.id.btn_back)

        btnAbsensi = findViewById(R.id.btn_absensi)
        btnTidakMengajar = findViewById(R.id.btn_tidak_mengajar)
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
        txtJumlahSiswa.text = if (jadwalData.studentCount > 0) {
            jadwalData.studentCount.toString()
        } else {
            "-"
        }
    }

    private fun setClickListeners() {
        btnAbsensi.setOnClickListener { showAbsensiPopup() }
        btnTidakMengajar.setOnClickListener { showTidakMengajarPopup() }
        btnIzinSakit.setOnClickListener { showIzinSakitPopup() }
        btnAjukanDispen.setOnClickListener { showDispensasiPopup() }

        btnAbsensi.setOnLongClickListener {
            startActivity(Intent(this, AbsensiSiswaActivity::class.java).apply {
                putExtra("MATA_PELAJARAN", currentJadwal.mataPelajaran)
                putExtra("KELAS", currentJadwal.kelas)
                putExtra("JAM", currentJadwal.jam)
                putExtra("TANGGAL", SimpleDateFormat("dd-MM-yyyy", Locale.getDefault()).format(Date()))
                putExtra(AbsensiSiswaActivity.EXTRA_SCHEDULE_ID, currentJadwal.id)
                putExtra(AbsensiSiswaActivity.EXTRA_CLASS_ID, currentJadwal.idKelas)
            })
            true
        }
    }

    private fun loadStudentsFromApi() {
        val scheduleId = currentJadwal.id
        val classId = currentJadwal.idKelas

        lifecycleScope.launch {
            try {
                val studentResult = when {
                    scheduleId > 0 -> teacherRepository.getMyScheduleStudents(scheduleId)
                    classId > 0 -> studentRepository.getStudents(classId = classId, perPage = -1)
                    else -> studentRepository.getStudents(perPage = -1)
                }

                handleResult(
                    studentResult,
                    onSuccess = { students ->
                        loadedStudentsList = students
                        loadedStudentNames = students.map { it.name ?: "-" }.toTypedArray()
                        findViewById<TextView>(R.id.txt_end_3).text = students.size.toString()

                        if (scheduleId > 0) {
                            fetchAttendanceMap(scheduleId)
                        }
                    },
                    onError = { _, msg ->
                        showError(msg ?: "Gagal memuat data siswa")
                    }
                )
            } catch (e: Exception) {
                showError("Gagal memuat data siswa: ${e.message}")
            }
        }
    }

    private fun fetchAttendanceMap(scheduleId: Int, displayDate: String? = null) {
        lifecycleScope.launch {
            val apiDate = try {
                displayDate?.takeIf { it.isNotBlank() }?.let { toApiDate(it) }
            } catch (_: Exception) {
                null
            }

            val attendanceResult = attendanceRepository.getAttendanceBySchedule(
                scheduleId = scheduleId,
                date = apiDate,
                perPage = -1
            )

            handleResult(
                attendanceResult,
                onSuccess = { attendances ->
                    studentToAttendanceIdMap.clear()
                    attendances.forEach { attendance ->
                        val studentId = attendance.student?.id
                        val attendanceId = attendance.id
                        if (studentId != null && attendanceId != null && attendanceId > 0) {
                            studentToAttendanceIdMap[studentId] = attendanceId
                        }
                    }
                },
                onError = { _, msg ->
                    Log.e("DetailJadwalGuru", "Gagal mengisi map absensi: $msg")
                }
            )
        }
    }

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
        val btnKirimIzin: Button = dialog.findViewById(R.id.btn_kirim_izin)
        val btnBatalIzin: Button = dialog.findViewById(R.id.btn_batal_izin)

        tvNamaMapel.text = "${currentJadwal.mataPelajaran} - "
        tvKelas.text = currentJadwal.kelas
        inputMapel.setText(currentJadwal.jam)
        inputTanggal.setText(SimpleDateFormat("dd-MM-yyyy", Locale.getDefault()).format(Date()))

        inputKeterangan.isFocusable = false
        inputKeterangan.setOnClickListener { showKeteranganDropdownTidakMengajar(inputKeterangan) }
        btnDropdownKeterangan.setOnClickListener { showKeteranganDropdownTidakMengajar(inputKeterangan) }

        inputMapel.isFocusable = false
        inputMapel.setOnClickListener { showJamMapelDropdown(inputMapel) }
        btnDropdownMapel.setOnClickListener { showJamMapelDropdown(inputMapel) }
        inputTanggal.setOnClickListener { showDatePickerDialog(inputTanggal) }

        btnKirimIzin.setOnClickListener {
            val keterangan = inputKeterangan.text.toString().trim()
            if (keterangan.isEmpty()) {
                Toast.makeText(this, "Harap pilih keterangan", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val tipeIzin = if (keterangan.contains("Sakit", ignoreCase = true)) "sakit" else "izin"
            showSuccessDialog("Sukses", "Izin tidak mengajar berhasil dikirim!") {
                dialog.dismiss()
                terapkanStatusIzinGuru(tipeIzin)
            }
        }

        btnBatalIzin.setOnClickListener { dialog.dismiss() }
        dialog.show()
    }

    private fun showIzinSakitPopup() {
        val dialog = Dialog(this)
        izinDialog = dialog
        dialog.setContentView(R.layout.pop_up_izin)
        dialog.window?.setBackgroundDrawableResource(android.R.color.transparent)

        val inputNamaSiswa: EditText = dialog.findViewById(R.id.input_nama_siswa)
        val btnDropdownSiswa: ImageButton = dialog.findViewById(R.id.btn_dropdown_siswa)
        val boxBuktiSurat: LinearLayout = dialog.findViewById(R.id.box_bukti_surat)
        val namaFileTextView: TextView = dialog.findViewById(R.id.namafile)
        val btnTambahkanFile: ImageButton = dialog.findViewById(R.id.btn_tambahkanfile)
        val layoutJamSection: LinearLayout = dialog.findViewById(R.id.layout_jam_section)
        val inputJam: EditText = dialog.findViewById(R.id.input_jam)
        val inputJamSelesai: EditText = dialog.findViewById(R.id.input_jam_selesai)
        val btnSetClock: ImageView = dialog.findViewById(R.id.btn_set_clock)
        val btnSetClockSelesai: ImageView = dialog.findViewById(R.id.btn_set_clock_selesai)
        val inputTanggal: EditText = dialog.findViewById(R.id.input_tanggal)
        val etCatatan: EditText = dialog.findViewById(R.id.et_catatan)
        val btnKirimIzin: Button = dialog.findViewById(R.id.btn_kirim_izin)
        val btnBatalIzin: Button = dialog.findViewById(R.id.btn_batal_izin)

        izinDialogFileTextView = namaFileTextView
        selectedFileUri = null
        namaFileTextView.text = "Masukkan Bukti Surat"
        inputNamaSiswa.setText("")
        inputJam.setText("")
        inputJamSelesai.setText("")
        inputTanggal.setText(SimpleDateFormat("dd-MM-yyyy", Locale.getDefault()).format(Date()))
        etCatatan.setText("")

        val earlyLeaveCheckBox = attachEarlyLeaveCheckbox(dialog, boxBuktiSurat, layoutJamSection)
        earlyLeaveCheckBox.isChecked = false
        updateEarlyLeaveUi(false, boxBuktiSurat, layoutJamSection, inputJam, inputJamSelesai)

        dialog.setOnDismissListener {
            if (izinDialog === dialog) {
                izinDialog = null
                izinDialogFileTextView = null
                selectedFileUri = null
            }
        }

        inputNamaSiswa.isFocusable = false
        inputNamaSiswa.setOnClickListener { showSiswaWithKeteranganDropdown(inputNamaSiswa) }
        btnDropdownSiswa.setOnClickListener { showSiswaWithKeteranganDropdown(inputNamaSiswa) }
        earlyLeaveCheckBox.setOnCheckedChangeListener { _, isChecked ->
            updateEarlyLeaveUi(isChecked, boxBuktiSurat, layoutJamSection, inputJam, inputJamSelesai)
        }

        btnTambahkanFile.setOnClickListener { filePickerLauncher.launch("image/*") }
        inputJam.setOnClickListener { showTimePickerDialog(inputJam) }
        btnSetClock.setOnClickListener { showTimePickerDialog(inputJam) }
        inputJamSelesai.setOnClickListener { showTimePickerDialog(inputJamSelesai) }
        btnSetClockSelesai.setOnClickListener { showTimePickerDialog(inputJamSelesai) }
        inputTanggal.setOnClickListener { showDatePickerDialog(inputTanggal) }

        btnKirimIzin.setOnClickListener {
            val fullText = inputNamaSiswa.text.toString().trim()
            if (fullText.isEmpty()) {
                Toast.makeText(this, "Harap pilih siswa dan keterangan", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val parts = fullText.split(" - ", limit = 2)
            if (parts.size < 2) {
                Toast.makeText(this, "Format siswa/keterangan tidak valid", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val namaSiswa = parts[0].trim()
            val keterangan = parts[1].trim()
            val studentId = loadedStudentsList.firstOrNull { it.name == namaSiswa }?.id
            if (studentId == null || studentId <= 0) {
                Toast.makeText(this, "Siswa tidak valid", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val isEarlyLeave = earlyLeaveCheckBox.isChecked
            val jamMulai = inputJam.text.toString().trim()
            val jamSelesai = inputJamSelesai.text.toString().trim()
            if (isEarlyLeave && jamMulai.isEmpty()) {
                Toast.makeText(this, "Jam mulai wajib diisi untuk izin pulang", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            if (currentJadwal.id > 0) {
                fetchAttendanceMap(currentJadwal.id, inputTanggal.text.toString())
            }

            val reason = etCatatan.text.toString().trim().ifBlank { keterangan }
            val jamRange = if (isEarlyLeave) {
                if (jamSelesai.isNotEmpty()) "$jamMulai - $jamSelesai" else "$jamMulai - sisa hari"
            } else {
                "-"
            }
            val fileName = selectedFileUri?.let { getFileName(it) } ?: "-"

            lifecycleScope.launch {
                btnKirimIzin.isEnabled = false
                btnKirimIzin.text = "Mengirim..."

                try {
                    val attendanceId = ensureAttendanceId(
                        studentId = studentId,
                        tanggalDisplay = inputTanggal.text.toString(),
                        status = mapStatusFromKeterangan(keterangan),
                        reason = reason
                    )

                    val request = MarkAttendanceExcuseRequest(
                        status = mapStatusFromKeterangan(keterangan),
                        reason = reason,
                        isEarlyLeave = isEarlyLeave
                    )

                    val result = attendanceRepository.markAttendanceExcuse(attendanceId, request)
                    handleResult(
                        result,
                        onSuccess = { resource: com.example.ritamesa.api.models.AttendanceResource ->
                            val resolvedAttendanceId = resource.id ?: attendanceId
                            studentToAttendanceIdMap[studentId] = resolvedAttendanceId

                            if (isEarlyLeave) {
                                val leaveRequest = CreateLeavePermissionRequest(
                                    studentId = studentId,
                                    type = "izin_pulang",
                                    reason = reason,
                                    startTime = jamMulai,
                                    endTime = jamSelesai.ifBlank { null }
                                )

                                lifecycleScope.launch {
                                    val leaveResult = leavePermissionRepository.createLeavePermission(leaveRequest)
                                    handleResult(
                                        leaveResult,
                                        onSuccess = {
                                            uploadBuktiAndFinish(
                                                attendanceId = resolvedAttendanceId,
                                                keterangan = keterangan,
                                                namaSiswa = namaSiswa,
                                                dialog = dialog,
                                                jamRange = jamRange,
                                                catatan = reason,
                                                tanggal = inputTanggal.text.toString(),
                                                fileName = fileName,
                                                button = btnKirimIzin
                                            )
                                        },
                                        onError = { _, msg ->
                                            showError(msg ?: "Gagal membuat izin pulang")
                                            resetButton(btnKirimIzin)
                                        }
                                    )
                                }
                            } else {
                                uploadBuktiAndFinish(
                                    attendanceId = resolvedAttendanceId,
                                    keterangan = keterangan,
                                    namaSiswa = namaSiswa,
                                    dialog = dialog,
                                    jamRange = jamRange,
                                    catatan = reason,
                                    tanggal = inputTanggal.text.toString(),
                                    fileName = fileName,
                                    button = btnKirimIzin
                                )
                            }
                        },
                        onError = { _, msg ->
                            showError("Gagal: $msg")
                            resetButton(btnKirimIzin)
                        }
                    )
                } catch (e: Exception) {
                    showError("Error: ${e.message}")
                    resetButton(btnKirimIzin)
                }
            }
        }

        btnBatalIzin.setOnClickListener { dialog.dismiss() }
        dialog.show()
    }

    private suspend fun ensureAttendanceId(
        studentId: Int,
        tanggalDisplay: String,
        status: String,
        reason: String
    ): Int {
        studentToAttendanceIdMap[studentId]?.takeIf { it > 0 }?.let { return it }

        val request = ManualAttendanceRequest(
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

    private fun showDispensasiPopup() {
        val dialog = Dialog(this)
        dialog.setContentView(R.layout.pop_up_dispensasi)
        dialog.window?.setBackgroundDrawableResource(android.R.color.transparent)

        val inputNamaSiswa: EditText = dialog.findViewById(R.id.input_nama_siswa)
        val btnDropdownSiswa: ImageButton = dialog.findViewById(R.id.btn_dropdown_siswa)
        val inputJam: EditText = dialog.findViewById(R.id.input_jam)
        val inputJamSelesai: EditText = dialog.findViewById(R.id.input_jam_selesai)
        val etCatatan: EditText = dialog.findViewById(R.id.et_catatan)
        val btnKirimDispen: Button = dialog.findViewById(R.id.btn_kirim_dispen)
        val btnBatal: Button = dialog.findViewById(R.id.btn_batal)

        inputNamaSiswa.isFocusable = false
        inputNamaSiswa.setOnClickListener { showSiswaByKelasDropdown(inputNamaSiswa) }
        btnDropdownSiswa.setOnClickListener { showSiswaByKelasDropdown(inputNamaSiswa) }
        inputJam.setOnClickListener { showTimePickerDialog(inputJam) }
        inputJamSelesai.setOnClickListener { showTimePickerDialog(inputJamSelesai) }

        btnKirimDispen.setOnClickListener {
            val namaSiswa = inputNamaSiswa.text.toString().trim()
            val studentId = loadedStudentsList.firstOrNull { it.name == namaSiswa }?.id
            val startTime = inputJam.text.toString().trim()
            if (studentId == null || studentId <= 0) {
                Toast.makeText(this, "Siswa tidak valid", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            if (startTime.isEmpty()) {
                Toast.makeText(this, "Jam mulai wajib diisi", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            lifecycleScope.launch {
                btnKirimDispen.isEnabled = false
                val req = CreateLeavePermissionRequest(
                    studentId = studentId,
                    type = "dispensasi",
                    reason = etCatatan.text.toString().trim().ifBlank { "Dispensasi" },
                    startTime = startTime,
                    endTime = inputJamSelesai.text.toString().trim().ifBlank { null }
                )

                val result = leavePermissionRepository.createLeavePermission(req)
                handleResult(
                    result,
                    onSuccess = {
                        showSuccessDialog("Sukses", "Dispensasi berhasil!") {
                            dialog.dismiss()
                        }
                    },
                    onError = { _, msg ->
                        showError(msg ?: "Gagal")
                        btnKirimDispen.isEnabled = true
                    }
                )
            }
        }

        btnBatal.setOnClickListener { dialog.dismiss() }
        dialog.show()
    }

    private fun uploadBuktiAndFinish(
        attendanceId: Int,
        keterangan: String,
        namaSiswa: String,
        dialog: Dialog,
        jamRange: String,
        catatan: String,
        tanggal: String,
        fileName: String,
        button: Button
    ) {
        val uri = selectedFileUri
        if (uri == null || attendanceId <= 0) {
            showSuccessPesan(namaSiswa, keterangan, jamRange, tanggal, fileName, catatan, dialog)
            resetButton(button)
            return
        }

        val file = getFileFromUri(uri)
        if (file == null) {
            showSuccessPesan(namaSiswa, keterangan, jamRange, tanggal, fileName, catatan, dialog)
            resetButton(button)
            return
        }

        val requestFile = file.asRequestBody("image/*".toMediaTypeOrNull())
        val body = MultipartBody.Part.createFormData("file", file.name, requestFile)

        lifecycleScope.launch {
            val uploadResult = attendanceRepository.addAttendanceAttachment(attendanceId, body)
            handleResult(
                uploadResult,
                onSuccess = {
                    showSuccessPesan(namaSiswa, keterangan, jamRange, tanggal, fileName, catatan, dialog)
                    resetButton(button)
                },
                onError = { _, msg ->
                    showSuccessDialog(
                        "Perhatian",
                        "Status izin tersimpan, tetapi upload bukti gagal: ${msg ?: "-"}"
                    ) {
                        dialog.dismiss()
                    }
                    resetButton(button)
                }
            )
        }
    }

    private fun showSuccessPesan(
        namaSiswa: String,
        keterangan: String,
        jamRange: String,
        tanggal: String,
        fileName: String,
        catatan: String,
        dialog: Dialog
    ) {
        showSuccessDialog(
            "Sukses",
            """
            Izin/Sakit berhasil diajukan${if (jamRange != "-" && fileName == "-") " (Cascading Aktif)" else ""}!
            Siswa: $namaSiswa
            Keterangan: $keterangan
            Jam: $jamRange
            Tanggal: $tanggal
            File: $fileName
            Catatan: $catatan
            """.trimIndent()
        ) {
            dialog.dismiss()
        }
    }

    private fun showSiswaByKelasDropdown(editText: EditText) {
        val siswaList = loadedStudentNames
        if (siswaList.isEmpty()) {
            Toast.makeText(this, "Data siswa belum tersedia", Toast.LENGTH_SHORT).show()
            return
        }

        AlertDialog.Builder(this)
            .setTitle("Pilih Siswa")
            .setItems(siswaList) { _, which -> editText.setText(siswaList[which]) }
            .show()
    }

    private fun showSiswaWithKeteranganDropdown(editText: EditText) {
        val siswaList = loadedStudentNames
        if (siswaList.isEmpty()) {
            Toast.makeText(this, "Data siswa belum tersedia", Toast.LENGTH_SHORT).show()
            return
        }

        val ketList = arrayOf("Izin", "Sakit")
        AlertDialog.Builder(this)
            .setTitle("Pilih Siswa")
            .setItems(siswaList) { _, siswaIndex ->
                val nama = siswaList[siswaIndex]
                AlertDialog.Builder(this)
                    .setTitle("Pilih Keterangan")
                    .setItems(ketList) { _, ketIndex ->
                        editText.setText("$nama - ${ketList[ketIndex]}")
                    }
                    .show()
            }
            .show()
    }

    private fun showKeteranganDropdownTidakMengajar(editText: EditText) {
        val items = arrayOf("Izin", "Sakit")
        AlertDialog.Builder(this)
            .setItems(items) { _, which -> editText.setText(items[which]) }
            .show()
    }

    private fun showJamMapelDropdown(editText: EditText) {
        val items = arrayOf(currentJadwal.jam, "Tukar jam", "Jam pengganti")
        AlertDialog.Builder(this)
            .setItems(items) { _, which -> editText.setText(items[which]) }
            .show()
    }

    private fun attachEarlyLeaveCheckbox(
        dialog: Dialog,
        boxBuktiSurat: View,
        layoutJamSection: View
    ): CheckBox {
        val anchor = dialog.findViewById<LinearLayout>(R.id.btn_dropdown_nama_siswa)
        val root = anchor.parent as? LinearLayout
            ?: throw IllegalStateException("Root popup izin tidak ditemukan")

        val existing = root.findViewWithTag<CheckBox>("dynamic_early_leave_checkbox")
        if (existing != null) return existing

        val checkBox = CheckBox(this).apply {
            tag = "dynamic_early_leave_checkbox"
            text = "Izin Pulang Berlaku Sisa Hari Ini"
            setTextColor(resources.getColor(android.R.color.black, theme))
            layoutParams = LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            ).apply {
                topMargin = 8.dp()
                bottomMargin = 12.dp()
            }
        }

        val insertIndex = root.indexOfChild(boxBuktiSurat)
        root.addView(checkBox, insertIndex)
        updateEarlyLeaveUi(false, boxBuktiSurat, layoutJamSection, null, null)
        return checkBox
    }

    private fun updateEarlyLeaveUi(
        isEarlyLeave: Boolean,
        boxBuktiSurat: View,
        layoutJamSection: View,
        inputJam: EditText?,
        inputJamSelesai: EditText?
    ) {
        boxBuktiSurat.visibility = if (isEarlyLeave) View.GONE else View.VISIBLE
        layoutJamSection.visibility = if (isEarlyLeave) View.VISIBLE else View.GONE
        if (!isEarlyLeave) {
            inputJam?.setText("")
            inputJamSelesai?.setText("")
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

    private fun mapStatusFromKeterangan(keterangan: String): String {
        return if (keterangan.equals("Sakit", ignoreCase = true)) "sick" else "excused"
    }

    private fun showDatePickerDialog(editText: EditText) {
        val calendar = Calendar.getInstance()
        android.app.DatePickerDialog(
            this,
            { _, year, month, day ->
                editText.setText(String.format(Locale.getDefault(), "%02d-%02d-%04d", day, month + 1, year))
            },
            calendar[Calendar.YEAR],
            calendar[Calendar.MONTH],
            calendar[Calendar.DAY_OF_MONTH]
        ).show()
    }

    private fun showTimePickerDialog(editText: EditText) {
        val calendar = Calendar.getInstance()
        android.app.TimePickerDialog(
            this,
            { _, hour, minute ->
                editText.setText(String.format(Locale.getDefault(), "%02d:%02d", hour, minute))
            },
            calendar[Calendar.HOUR_OF_DAY],
            calendar[Calendar.MINUTE],
            true
        ).show()
    }

    private fun formatTanggalWaktu(jam: String): String {
        val sdf = SimpleDateFormat("dd-MM-yyyy", Locale.getDefault())
        return "$jam ${sdf.format(Date())}"
    }

    private fun getFileName(uri: Uri): String {
        var result = "file_selected.jpg"
        val cursor = contentResolver.query(uri, null, null, null, null)
        cursor?.use {
            if (it.moveToFirst()) {
                val nameIndex = it.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                if (nameIndex >= 0) result = it.getString(nameIndex)
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
            Log.e("DetailJadwalGuru", "Gagal membuat file sementara", e)
            null
        }
    }

    private fun resetButton(button: Button) {
        button.isEnabled = true
        button.text = "Kirim"
    }

    private fun terapkanStatusIzinGuru(tipeIzin: String) {
        statusIzinGuru = tipeIzin
        btnAbsensi.visibility = View.GONE
        btnTidakMengajar.visibility = View.GONE
        btnIzinSakit.visibility = View.GONE
        btnAjukanDispen.visibility = View.GONE

        val drawable = if (tipeIzin == "sakit") R.drawable.siswa_sakit_wakel else R.drawable.siswa_izin_wakel
        btnInfoHadir.setImageResource(drawable)
        btnInfoHadir.visibility = View.VISIBLE
    }

    private fun showSuccessDialog(title: String, message: String, onOk: () -> Unit) {
        AlertDialog.Builder(this)
            .setTitle(title)
            .setMessage(message)
            .setPositiveButton("OK") { _, _ -> onOk() }
            .show()
    }

    private fun Int.dp(): Int = (this * resources.displayMetrics.density).toInt()
}
