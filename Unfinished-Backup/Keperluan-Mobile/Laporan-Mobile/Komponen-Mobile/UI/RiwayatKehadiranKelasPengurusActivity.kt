package com.example.ritamesa

import android.app.Dialog
import android.content.Intent
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageButton
import android.widget.ImageView
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.ritamesa.api.Result
import com.example.ritamesa.api.models.AttendanceResource
import com.example.ritamesa.api.models.Classes
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

class RiwayatKehadiranKelasPengurusActivity : BaseNetworkActivity() {

    private lateinit var recyclerRiwayat: RecyclerView
    private lateinit var txtHadirCount: TextView
    private lateinit var txtIzinCount: TextView
    private lateinit var txtSakitCount: TextView
    private lateinit var txtAlphaCount: TextView
    private lateinit var txtFilterTanggal: TextView
    private lateinit var btnCalendar: ImageButton
    private lateinit var txtJumlah: TextView
    private lateinit var progressBar: ProgressBar

    private val riwayatList = mutableListOf<RiwayatMapelItem>()
    private val siswaAttendanceMap = mutableMapOf<Int, MutableList<RiwayatAbsenItem>>()
    private var myClass: Classes? = null
    private var selectedDate = Calendar.getInstance()
    private var classId: Int = 0
    private var isPengurus = true

    companion object {
        private const val TAG = "RiwayatPengurus"
    }

    data class RiwayatMapelItem(
        val id: String,
        val mataPelajaran: String,
        val scheduleId: Int,
        val startTime: String? = null,
        val endTime: String? = null,
        val totalSiswa: Int = 0,
        val hadir: Int = 0,
        val izin: Int = 0,
        val sakit: Int = 0,
        val alpha: Int = 0,
        val keterangan: String = ""
    )

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.riwayat_kehadiran_kelas_pengurus)

        isPengurus = intent.getBooleanExtra("IS_PENGURUS", true)
        initViews()
        setupButtonListeners()
        setupBackPressedHandler()
        loadMyClassInfo()
    }

    private fun initViews() {
        txtHadirCount = findViewById(R.id.txt_hadir_count)
        txtIzinCount = findViewById(R.id.txt_izin_count)
        txtSakitCount = findViewById(R.id.txt_sakit_count)
        txtAlphaCount = findViewById(R.id.txt_alpha_count)
        txtFilterTanggal = findViewById(R.id.text_filter_tanggal)
        btnCalendar = findViewById(R.id.icon_calendar)
        txtJumlah = findViewById(R.id.text_jumlah_siswa)
        recyclerRiwayat = findViewById(R.id.recycler_riwayat)

        // FIX: Inisialisasi progressBar dengan benar
        progressBar = findViewById(R.id.progressBar) ?: ProgressBar(this).apply {
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            )
            visibility = View.GONE
        }

        btnCalendar.visibility = View.VISIBLE
        btnCalendar.setOnClickListener { showDatePicker() }

        txtJumlah.text = "Memuat data..."
        updateTanggalDisplay()
    }

    private fun showDatePicker() {
        val year = selectedDate.get(Calendar.YEAR)
        val month = selectedDate.get(Calendar.MONTH)
        val day = selectedDate.get(Calendar.DAY_OF_MONTH)

        val datePickerDialog = android.app.DatePickerDialog(
            this,
            { _, selectedYear, selectedMonth, selectedDay ->
                selectedDate.set(selectedYear, selectedMonth, selectedDay)
                updateTanggalDisplay()
                loadClassSchedules()
            },
            year,
            month,
            day
        )
        datePickerDialog.show()
    }

    private fun updateTanggalDisplay() {
        try {
            val localeId = Locale("id", "ID")
            val sdf = SimpleDateFormat("EEEE, dd MMMM yyyy", localeId)
            val formatted = sdf.format(selectedDate.time)
            txtFilterTanggal.text = formatted.replaceFirstChar {
                if (it.isLowerCase()) it.titlecase(localeId) else it.toString()
            }
        } catch (e: Exception) {
            txtFilterTanggal.text = "Senin, 7 Januari 2026"
        }
    }

    private fun loadMyClassInfo() {
        lifecycleScope.launch {
            val result = classRepository.getMyClass()

            when (result) {
                is Result.Success -> {
                    myClass = result.data
                    classId = myClass?.id ?: 0
                    Log.d(TAG, "My class: ${myClass?.name} (ID: $classId)")
                    loadClassSchedules()
                }
                is Result.Error -> {
                    Log.e(TAG, "Error loading class: ${result.message}")
                    showError("Gagal memuat info kelas: ${result.message}")
                    txtJumlah.text = "Gagal memuat data"
                    progressBar.visibility = View.GONE
                }
                else -> {}
            }
        }
    }

    private fun loadClassSchedules() {
        lifecycleScope.launch {
            progressBar.visibility = View.VISIBLE
            riwayatList.clear()
            siswaAttendanceMap.clear()

            // Reset counters
            txtHadirCount.text = "0"
            txtIzinCount.text = "0"
            txtSakitCount.text = "0"
            txtAlphaCount.text = "0"

            // For Pengurus we use GET /me/schedules/today to get the class schedule items.
            // This endpoint returns all schedule items for the student's class today.
            // For other days we use GET /me/class/schedules which returns the full week schedule
            // with a `day` field we can filter on.
            val isToday = isSameDay(selectedDate, Calendar.getInstance())

            val schedulesResult: Result<List<com.example.ritamesa.api.models.Schedule>> = if (isToday) {
                scheduleRepository.getTodaysSchedule()
            } else {
                scheduleRepository.getMyClassSchedules(date = null).map { pagedResult ->
                    val dayOfWeek = getDayOfWeek(selectedDate)
                    pagedResult.filter { it.day.equals(dayOfWeek, ignoreCase = true) }
                }
            }

            when (schedulesResult) {
                is Result.Success -> {
                    val schedules = schedulesResult.data
                    Log.d(TAG, "Loaded ${schedules.size} schedules for class")

                    if (schedules.isEmpty()) {
                        txtJumlah.text = "Total Mata Pelajaran: 0"
                        setupRecyclerView()
                        progressBar.visibility = View.GONE
                        return@launch
                    }

                    // Load attendance untuk setiap jadwal
                    var totalHadir = 0
                    var totalIzin = 0
                    var totalSakit = 0
                    var totalAlpha = 0

                    schedules.forEachIndexed { index, schedule ->
                        val scheduleId = schedule.id ?: return@forEachIndexed
                        val subjectName = schedule.subjectName ?: "Mapel ${index + 1}"

                        val attendanceResult = attendanceRepository.getAttendanceBySchedule(scheduleId)

                        when (attendanceResult) {
                            is Result.Success -> {
                                val attendances = attendanceResult.data

                                var hadir = 0
                                var izin = 0
                                var sakit = 0
                                var alpha = 0

                                attendances.forEach { att ->
                                    when (att.status?.lowercase(Locale.getDefault())) {
                                        "present", "hadir", "late", "terlambat" -> hadir++
                                        "excused", "izin" -> izin++
                                        "sick", "sakit" -> sakit++
                                        "absent", "alpha", "alfa" -> alpha++
                                    }

                                    // Simpan untuk popup
                                    val studentId = att.student?.id ?: 0
                                    if (studentId > 0) {
                                        val list = siswaAttendanceMap.getOrPut(studentId) { mutableListOf() }
                                        list.add(
                                            RiwayatAbsenItem(
                                                id = studentId,
                                                namaSiswa = att.student?.name ?: "-",
                                                jurusan = myClass?.name ?: "-",
                                                tanggal = att.timestamp?.substring(0, 10) ?: "-",
                                                waktu = if (att.timestamp?.length ?: 0 >= 16) att.timestamp!!.substring(11, 16) else "-",
                                                status = att.status ?: "alpha"
                                            )
                                        )
                                    }
                                }

                                totalHadir += hadir
                                totalIzin += izin
                                totalSakit += sakit
                                totalAlpha += alpha

                                riwayatList.add(
                                    RiwayatMapelItem(
                                        id = (riwayatList.size + 1).toString(),
                                        mataPelajaran = subjectName,
                                        scheduleId = scheduleId,
                                        hadir = hadir,
                                        izin = izin,
                                        sakit = sakit,
                                        alpha = alpha,
                                        totalSiswa = attendances.size,
                                        keterangan = "Hadir: $hadir, Izin: $izin, Sakit: $sakit, Alpha: $alpha"
                                    )
                                )
                            }
                            is Result.Error -> {
                                Log.e(TAG, "Error loading attendance for schedule $scheduleId: ${attendanceResult.message}")
                                riwayatList.add(
                                    RiwayatMapelItem(
                                        id = (riwayatList.size + 1).toString(),
                                        mataPelajaran = subjectName,
                                        scheduleId = scheduleId,
                                        keterangan = "Gagal memuat data"
                                    )
                                )
                            }
                            else -> {}
                        }
                    }

                    // Update UI
                    txtHadirCount.text = totalHadir.toString()
                    txtIzinCount.text = totalIzin.toString()
                    txtSakitCount.text = totalSakit.toString()
                    txtAlphaCount.text = totalAlpha.toString()
                    txtJumlah.text = "Total Mata Pelajaran: ${schedules.size}"

                    setupRecyclerView()
                    progressBar.visibility = View.GONE
                }
                is Result.Error -> {
                    Log.e(TAG, "Error loading schedules: ${schedulesResult.message}")
                    showError("Gagal memuat jadwal: ${schedulesResult.message}")
                    txtJumlah.text = "Gagal memuat data"
                    progressBar.visibility = View.GONE
                }
                else -> progressBar.visibility = View.GONE
            }
        }
    }

    private fun isSameDay(a: Calendar, b: Calendar): Boolean {
        return a.get(Calendar.YEAR) == b.get(Calendar.YEAR) &&
                a.get(Calendar.DAY_OF_YEAR) == b.get(Calendar.DAY_OF_YEAR)
    }

    private fun getDayOfWeek(calendar: Calendar): String {
        return when (calendar.get(Calendar.DAY_OF_WEEK)) {
            Calendar.MONDAY -> "Monday"
            Calendar.TUESDAY -> "Tuesday"
            Calendar.WEDNESDAY -> "Wednesday"
            Calendar.THURSDAY -> "Thursday"
            Calendar.FRIDAY -> "Friday"
            Calendar.SATURDAY -> "Saturday"
            Calendar.SUNDAY -> "Sunday"
            else -> "Monday"
        }
    }

    private fun setupRecyclerView() {
        val sortedList = riwayatList.sortedBy { it.id.toIntOrNull() ?: 0 }

        recyclerRiwayat.layoutManager = LinearLayoutManager(this)
        recyclerRiwayat.setHasFixedSize(true)

        val adapter = RiwayatPengurusAdapter(sortedList) { mapelItem ->
            showDetailPopup(mapelItem)
        }
        recyclerRiwayat.adapter = adapter
    }

    private fun showDetailPopup(mapelItem: RiwayatMapelItem) {
        val dialog = Dialog(this)
        val dialogView = layoutInflater.inflate(R.layout.pop_up_riwayat_kehadiran_siswa, null)

        val tvJudul = dialogView.findViewById<TextView>(R.id.tv_judul_popup)
        tvJudul.text = "Absensi ${mapelItem.mataPelajaran}"

        val rvSiswa = dialogView.findViewById<RecyclerView>(R.id.rv_riwayat_siswa)
        rvSiswa.layoutManager = LinearLayoutManager(this)
        rvSiswa.setHasFixedSize(true)

        lifecycleScope.launch {
            val result = attendanceRepository.getAttendanceBySchedule(mapelItem.scheduleId)
            when (result) {
                is Result.Success -> {
                    val attendanceList = result.data.map { att ->
                        RiwayatAbsenItem(
                            id = att.student?.id ?: 0,
                            namaSiswa = att.student?.name ?: "-",
                            jurusan = myClass?.name ?: "-",
                            // FIX: Gunakan timestamp, bukan date
                            tanggal = att.timestamp?.substring(0, 10) ?: "-",
                            // FIX: Ambil jam dari timestamp
                            waktu = if (att.timestamp?.length ?: 0 >= 16) att.timestamp!!.substring(11, 16) else "-",
                            status = att.status ?: "alpha"
                        )
                    }
                    val adapter = RiwayatAbsenAdapter(attendanceList)
                    rvSiswa.adapter = adapter
                }
                is Result.Error -> {
                    Toast.makeText(this@RiwayatKehadiranKelasPengurusActivity,
                        "Gagal memuat detail: ${result.message}", Toast.LENGTH_SHORT).show()
                    rvSiswa.adapter = RiwayatAbsenAdapter(emptyList())
                }
                else -> {}
            }
        }

        dialog.setContentView(dialogView)
        dialog.setCancelable(true)

        dialog.window?.setBackgroundDrawable(ColorDrawable(Color.WHITE))
        dialog.window?.clearFlags(android.view.WindowManager.LayoutParams.FLAG_DIM_BEHIND)

        dialog.show()

        dialog.window?.setLayout(
            (resources.displayMetrics.widthPixels * 0.9).toInt(),
            (resources.displayMetrics.heightPixels * 0.8).toInt()
        )
    }

    private fun setupButtonListeners() {
        val btnHome: View = findViewById(R.id.btnHome)
        val btnAssignment: View = findViewById(R.id.btnAssignment)
        val textNavigasi: TextView = findViewById(R.id.text_navigasi)

        btnHome.setOnClickListener { navigateToDashboard() }
        btnAssignment.setOnClickListener {
            Toast.makeText(this, "Anda sudah di Riwayat Kehadiran Kelas", Toast.LENGTH_SHORT).show()
        }
        textNavigasi.setOnClickListener { navigateToJadwalHarian() }
    }

    private fun setupBackPressedHandler() {
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                navigateToDashboard()
            }
        })
    }

    private fun navigateToDashboard() {
        val intent = Intent(this, DashboardSiswaActivity::class.java)
        intent.putExtra("IS_PENGURUS", true)
        startActivity(intent)
        finish()
    }

    private fun navigateToJadwalHarian() {
        val intent = Intent(this, JadwalHarianSiswaActivity::class.java).apply {
            putExtra("IS_PENGURUS", true)
        }
        startActivity(intent)
    }

    // ========== ADAPTER ==========
    private inner class RiwayatPengurusAdapter(
        private val riwayatList: List<RiwayatMapelItem>,
        private val onItemClick: (RiwayatMapelItem) -> Unit
    ) : RecyclerView.Adapter<RiwayatPengurusAdapter.RiwayatViewHolder>() {

        inner class RiwayatViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
            val txtSession: TextView = itemView.findViewById(R.id.Session)
            val txtMataPelajaran: TextView = itemView.findViewById(R.id.MataPelajaran)
            val txtKeterangan: TextView = itemView.findViewById(R.id.TextKeteranganAbsen)
            val btnTampilkan: ImageButton = itemView.findViewById(R.id.BadgeKehadiran)
        }

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RiwayatViewHolder {
            val view = LayoutInflater.from(parent.context)
                .inflate(R.layout.item_riwayat_kehadiran_kelas, parent, false)
            return RiwayatViewHolder(view)
        }

        override fun onBindViewHolder(holder: RiwayatViewHolder, position: Int) {
            val riwayat = riwayatList[position]

            holder.txtSession.text = "Mapel ${riwayat.id}"
            holder.txtMataPelajaran.text = riwayat.mataPelajaran
            holder.txtKeterangan.text = riwayat.keterangan

            holder.btnTampilkan.setOnClickListener {
                onItemClick(riwayat)
            }
        }

        override fun getItemCount(): Int = riwayatList.size
    }
}