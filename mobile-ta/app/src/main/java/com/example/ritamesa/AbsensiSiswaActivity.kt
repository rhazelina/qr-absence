package com.example.ritamesa

import android.os.Bundle
import android.util.Log
import android.widget.ImageButton
import android.widget.TextView
import android.widget.Toast
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.ritamesa.AbsensiAdapter.SiswaData
import com.example.ritamesa.api.Result
import com.example.ritamesa.api.models.BulkAttendanceItem
import kotlinx.coroutines.launch
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
    private lateinit var btnSimpan: ImageButton
    private lateinit var btnBatal: ImageButton

    private var mapel: String = ""
    private var kelas: String = ""
    private var tanggal: String = ""
    private var jam: String = ""
    private var scheduleId: Int = 0
    private var classId: Int = 0
    private var attendeeStatus: String = ""
    private var scanTime: String = ""

    companion object {
        private const val TAG = "AbsensiSiswa"
        const val EXTRA_SCHEDULE_ID = "schedule_id"
        const val EXTRA_CLASS_ID = "class_id"
    }

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
        btnSimpan = findViewById(R.id.btn_simpan_kehadiran)
        btnBatal = findViewById(R.id.btn_batal_absensi)
        rvListAbsen = findViewById(R.id.rvListAbsen)
    }

    private fun getDataFromIntent() {
        mapel = intent.getStringExtra(CameraQRActivity.EXTRA_MAPEL) ?:
                intent.getStringExtra("MATA_PELAJARAN") ?: ""

        kelas = intent.getStringExtra(CameraQRActivity.EXTRA_KELAS) ?:
                intent.getStringExtra("KELAS") ?: ""

        tanggal = intent.getStringExtra("tanggal") ?:
                intent.getStringExtra("TANGGAL") ?: getCurrentDate()

        jam = intent.getStringExtra("jam") ?:
                intent.getStringExtra("JAM") ?: ""

        scheduleId = intent.getIntExtra(EXTRA_SCHEDULE_ID, 0)
        classId = intent.getIntExtra(EXTRA_CLASS_ID, 0)
        attendeeStatus = intent.getStringExtra("status") ?: ""
        scanTime = intent.getStringExtra("scanned_at") ?: ""

        tvNamaMapel.text = mapel
        tvKelas.text = kelas
        tvTanggalWaktu.text = if (jam.isNotEmpty()) "$jam $tanggal" else tanggal

        loadStudentsFromApi()
    }

    /**
     * Load students from real API based on available data:
     * 1. If scheduleId available → GET /me/schedules/{schedule}/students
     * 2. If classId available → GET /students?class_id={classId}
     * 3. If single attendee from QR scan → show that student
     */
    private fun loadStudentsFromApi() {
        // If from QR scan with single student result
        if (attendeeStatus.isNotEmpty()) {
            val studentName = intent.getStringExtra("attendee_name") ?: "Unknown"
            val studentId = intent.getIntExtra("student_id", 0)
            val singleStudent = SiswaData(
                id = studentId,
                nomor = 1,
                nisn = intent.getStringExtra("nisn") ?: "",
                nama = studentName,
                status = attendeeStatus.lowercase()
            )
            setupRecyclerView(listOf(singleStudent))
            return
        }

        lifecycleScope.launch {
            if (scheduleId > 0) {
                // Load students for this schedule via API
                val result = teacherRepository.getMyScheduleStudents(scheduleId)
                handleResult(result,
                    onSuccess = { students ->
                        val siswaList = students.mapIndexed { index, student ->
                            SiswaData(
                                id = student.id ?: 0,
                                nomor = index + 1,
                                nisn = student.nisn ?: "",
                                nama = student.name ?: "",
                                status = "none"
                            )
                        }
                        if (siswaList.isEmpty()) {
                            showToast("Tidak ada siswa ditemukan untuk jadwal ini")
                        }
                        setupRecyclerView(siswaList)
                    },
                    onError = { _, msg ->
                        Log.e(TAG, "Failed to load schedule students: $msg")
                        // Fallback: try loading by class
                        loadStudentsByClass()
                    }
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
            val result = studentRepository.getStudents(classId = classId)
            handleResult(result,
                onSuccess = { students ->
                    val siswaList = students.mapIndexed { index, student ->
                        SiswaData(
                            id = student.id ?: 0,
                            nomor = index + 1,
                            nisn = student.nisn ?: "",
                            nama = student.name ?: "",
                            status = "none"
                        )
                    }
                    if (siswaList.isEmpty()) {
                        showToast("Tidak ada siswa ditemukan untuk kelas ini")
                    }
                    setupRecyclerView(siswaList)
                },
                onError = { _, msg ->
                    Log.e(TAG, "Failed to load class students: $msg")
                    showError("Gagal memuat data siswa: $msg")
                    setupRecyclerView(emptyList())
                }
            )
        }
    }

    private fun getCurrentDate(): String {
        val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        return sdf.format(Date())
    }

    private fun setupRecyclerView(siswaList: List<SiswaData>) {
        adapter = AbsensiAdapter(siswaList.toMutableList())
        rvListAbsen.layoutManager = LinearLayoutManager(this)
        rvListAbsen.adapter = adapter
    }

    private fun setupClickListeners() {
        btnBack.setOnClickListener { finish() }
        btnSimpan.setOnClickListener { simpanAbsensi() }
        btnBatal.setOnClickListener { batalAbsensi() }
    }

    /**
     * Save attendance via POST /attendance/bulk-manual
     * Uses BulkAttendanceItem records per the API spec
     */
    private fun simpanAbsensi() {
        val absensiData = adapter.getAbsensiData()

        var totalHadir = 0
        var totalIzin = 0
        var totalSakit = 0
        var totalAlpha = 0

        absensiData.forEach { siswa ->
            when (siswa.status) {
                "hadir" -> totalHadir++
                "izin" -> totalIzin++
                "sakit" -> totalSakit++
                "alpha" -> totalAlpha++
            }
        }

        val records = absensiData.map { siswa ->
            BulkAttendanceItem(
                attendeeType = "student",
                scheduleId = scheduleId.takeIf { it > 0 } ?: 1,
                status = when (siswa.status) {
                    "hadir" -> "present"
                    "izin" -> "excused"
                    "sakit" -> "sick"
                    "alpha" -> "absent"
                    else -> "absent"
                },
                date = tanggal,
                studentId = siswa.id,
                teacherId = null,
                reason = null
            )
        }

        lifecycleScope.launch {
            val result = attendanceRepository.recordBulkManualAttendance(records)

            when (result) {
                is Result.Success -> {
                    Log.d(TAG, "Attendance saved successfully")
                    showToast(
                        "Absensi disimpan! Hadir: $totalHadir, Izin: $totalIzin, " +
                        "Sakit: $totalSakit, Alpha: $totalAlpha"
                    )
                    finish()
                }
                is Result.Error -> {
                    Log.e(TAG, "Failed to save attendance: ${result.message}")
                    showError("Gagal menyimpan: ${result.message}")
                }
                is Result.Loading -> { /* loading */ }
            }
        }
    }

    private fun batalAbsensi() {
        adapter.resetAllStatus()
        showToast("Absensi dibatalkan, status direset")
    }
}