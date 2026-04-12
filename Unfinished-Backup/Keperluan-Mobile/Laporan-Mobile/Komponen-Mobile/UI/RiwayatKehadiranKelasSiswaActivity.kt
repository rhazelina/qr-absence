package com.example.ritamesa

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageButton
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.ritamesa.api.Result
import com.example.ritamesa.api.models.AttendanceResource
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

class RiwayatKehadiranKelasSiswaActivity : BaseNetworkActivity() {

    private lateinit var recyclerRiwayat: RecyclerView
    private lateinit var txtHadirCount: TextView
    private lateinit var txtIzinCount: TextView
    private lateinit var txtSakitCount: TextView
    private lateinit var txtAlphaCount: TextView
    private lateinit var txtFilterTanggal: TextView
    private lateinit var btnCalendar: ImageButton
    private lateinit var txtJumlah: TextView

    private val riwayatList = mutableListOf<RiwayatSiswaItem>()
    private var selectedDate = Calendar.getInstance()
    private var totalHadir = 0
    private var totalIzin = 0
    private var totalSakit = 0
    private var totalAlpha = 0

    companion object {
        private const val TAG = "RiwayatSiswa"
    }

    data class RiwayatSiswaItem(
        val id: String,
        val mataPelajaran: String,
        val keterangan: String,
        val status: String,
        val jam: String? = null,
        val scheduleId: Int = 0
    )

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.riwayat_kehadiran_kelas_siswa)

        initViews()
        setupButtonListeners()
        setupBackPressedHandler()
        loadData()
    }

    private fun initViews() {
        txtHadirCount = findViewById(R.id.txt_hadir_count)
        txtIzinCount = findViewById(R.id.txt_izin_count)
        txtSakitCount = findViewById(R.id.txt_sakit_count)
        txtAlphaCount = findViewById(R.id.txt_alpha_count)
        txtJumlah = findViewById(R.id.text_jumlah_siswa)
        txtFilterTanggal = findViewById(R.id.text_filter_tanggal)
        btnCalendar = findViewById(R.id.icon_calendar)
        recyclerRiwayat = findViewById(R.id.recycler_riwayat)

        btnCalendar.visibility = View.VISIBLE
        btnCalendar.setOnClickListener { showDatePicker() }

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
                loadData()
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

    private fun loadData() {
        lifecycleScope.launch {
            val calendar = selectedDate
            val dateStr = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(calendar.time)
            val isToday = isSameDay(calendar, Calendar.getInstance())

            // Step 1: Get schedules for the selected date
            // getTodaysSchedule() only works for the current day.
            // For other dates, filter by day of week from the full week schedule.
            val schedulesResult: Result<List<com.example.ritamesa.api.models.Schedule>> = if (isToday) {
                scheduleRepository.getTodaysSchedule()
            } else {
                val dayOfWeek = getDayOfWeek(calendar)
                scheduleRepository.getMySchedules(date = dateStr).map { pagedSchedules ->
                    // getMySchedules may return all schedules; filter to selected day
                    pagedSchedules.filter { it.day.equals(dayOfWeek, ignoreCase = true) }
                        .ifEmpty {
                            // fallback: return all if day filter yields nothing (API may already filter)
                            pagedSchedules
                        }
                }
            }

            if (schedulesResult is Result.Success) {
                val allSchedules = schedulesResult.data

                // Step 2: Get attendance records for the selected date
                val attendanceResult = attendanceRepository.getMyAttendance(
                    startDate = dateStr,
                    endDate = dateStr
                )

                // Build attendance map keyed by schedule_id
                val attendanceMap = mutableMapOf<Int, AttendanceResource>()
                if (attendanceResult is Result.Success) {
                    attendanceResult.data.forEach { attendance ->
                        attendance.schedule?.id?.let { scheduleId ->
                            attendanceMap[scheduleId] = attendance
                        }
                    }
                }

                // Reset counters
                riwayatList.clear()
                totalHadir = 0
                totalIzin = 0
                totalSakit = 0
                totalAlpha = 0

                // Step 3: Merge schedules + attendance
                allSchedules.forEachIndexed { index, schedule ->
                    val attendance = attendanceMap[schedule.id]
                    // Only count as hadir/alpha/etc if attendance record exists.
                    // "none" = no record = belum absen = alpha untuk keperluan counter.
                    val status = attendance?.status?.lowercase() ?: "none"

                    val jam = when {
                        attendance?.checkedInAt != null && attendance.checkedInAt!!.length >= 5 ->
                            attendance.checkedInAt!!.substring(0, minOf(5, attendance.checkedInAt!!.length))
                        attendance?.timestamp != null && attendance.timestamp!!.length >= 5 ->
                            attendance.timestamp!!.substring(11, minOf(16, attendance.timestamp!!.length))
                        else -> null
                    }

                    riwayatList.add(
                        RiwayatSiswaItem(
                            id = (index + 1).toString(),
                            mataPelajaran = schedule.subjectName ?: "Mata Pelajaran",
                            keterangan = attendance?.reason ?: "-",
                            status = status,
                            jam = jam,
                            scheduleId = schedule.id ?: 0
                        )
                    )

                    when (status) {
                        "present" -> totalHadir++
                        "late" -> totalHadir++ // late = hadir (terlambat)
                        "excused", "permission", "izin" -> totalIzin++
                        "sick" -> totalSakit++
                        "absent" -> totalAlpha++
                        // "none" = belum ada record absensi = dianggap alpha di counter
                        else -> totalAlpha++
                    }
                }

                txtHadirCount.text = totalHadir.toString()
                txtIzinCount.text = totalIzin.toString()
                txtSakitCount.text = totalSakit.toString()
                txtAlphaCount.text = totalAlpha.toString()
                txtJumlah.text = "Total Mata Pelajaran: ${riwayatList.size}"

                setupRecyclerView()
            } else if (schedulesResult is Result.Error) {
                Log.e(TAG, "Error loading schedules: ${schedulesResult.message}")
                showError("Gagal memuat jadwal: ${schedulesResult.message}")
                resetToZero()
            }
        }
    }

    private fun isSameDay(a: Calendar, b: Calendar): Boolean =
        a.get(Calendar.YEAR) == b.get(Calendar.YEAR) &&
                a.get(Calendar.DAY_OF_YEAR) == b.get(Calendar.DAY_OF_YEAR)

    private fun getDayOfWeek(calendar: Calendar): String = when (calendar.get(Calendar.DAY_OF_WEEK)) {
        Calendar.MONDAY -> "Monday"
        Calendar.TUESDAY -> "Tuesday"
        Calendar.WEDNESDAY -> "Wednesday"
        Calendar.THURSDAY -> "Thursday"
        Calendar.FRIDAY -> "Friday"
        Calendar.SATURDAY -> "Saturday"
        else -> "Sunday"
    }

    private fun resetToZero() {
        txtHadirCount.text = "0"
        txtIzinCount.text = "0"
        txtSakitCount.text = "0"
        txtAlphaCount.text = "0"
        txtJumlah.text = "Total Mata Pelajaran: 0"
        riwayatList.clear()
        setupRecyclerView()
    }

    private fun setupRecyclerView() {
        recyclerRiwayat.layoutManager = LinearLayoutManager(this)
        recyclerRiwayat.setHasFixedSize(true)
        recyclerRiwayat.adapter = RiwayatSiswaAdapter(riwayatList)
    }

    private inner class RiwayatSiswaAdapter(
        private val riwayatList: List<RiwayatSiswaItem>
    ) : RecyclerView.Adapter<RiwayatSiswaAdapter.RiwayatViewHolder>() {

        inner class RiwayatViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
            val txtSession: TextView = itemView.findViewById(R.id.Session)
            val txtMataPelajaran: TextView = itemView.findViewById(R.id.MataPelajaran)
            val txtKeterangan: TextView = itemView.findViewById(R.id.TextKeteranganAbsen)
            val imgBadge: ImageView = itemView.findViewById(R.id.BadgeKehadiran)
        }

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RiwayatViewHolder {
            val view = LayoutInflater.from(parent.context)
                .inflate(R.layout.item_riwayat_kehadiran_siswa, parent, false)
            return RiwayatViewHolder(view)
        }

        override fun onBindViewHolder(holder: RiwayatViewHolder, position: Int) {
            val riwayat = riwayatList[position]

            holder.txtSession.text = "Jam ${riwayat.id}"
            holder.txtMataPelajaran.text = riwayat.mataPelajaran
            holder.txtKeterangan.text = riwayat.keterangan.ifEmpty { "-" }

            when (riwayat.status.lowercase(Locale.getDefault())) {
                "present", "hadir" -> {
                    holder.imgBadge.setImageResource(R.drawable.siswa_hadir_wakel)
                    holder.txtKeterangan.text = "Hadir ${riwayat.jam?.let { "($it)" } ?: ""}"
                }
                "late", "terlambat" -> {
                    holder.imgBadge.setImageResource(R.drawable.siswa_hadir_wakel)
                    holder.txtKeterangan.text = "Terlambat ${riwayat.jam?.let { "($it)" } ?: ""}"
                }
                "excused", "izin" -> {
                    holder.imgBadge.setImageResource(R.drawable.siswa_izin_wakel)
                    holder.txtKeterangan.text = "Izin"
                }
                "sick", "sakit" -> {
                    holder.imgBadge.setImageResource(R.drawable.siswa_sakit_wakel)
                    holder.txtKeterangan.text = "Sakit"
                }
                "absent", "alpha", "alfa" -> {
                    holder.imgBadge.setImageResource(R.drawable.siswa_alpha_wakel)
                    holder.txtKeterangan.text = "Alpha"
                }
                else -> {
                    holder.imgBadge.setImageResource(R.drawable.siswa_alpha_wakel)
                    holder.txtKeterangan.text = "Belum Absen"
                }
            }
        }

        override fun getItemCount(): Int = riwayatList.size
    }

    private fun setupButtonListeners() {
        val btnHome: View = findViewById(R.id.btnHome)
        val btnAssignment: View = findViewById(R.id.btnAssignment)
        val textNavigasi: TextView = findViewById(R.id.text_navigasi)

        btnHome.setOnClickListener { navigateToDashboard() }
        btnAssignment.setOnClickListener {
            Toast.makeText(this, "Anda sudah di Riwayat Kehadiran", Toast.LENGTH_SHORT).show()
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
        startActivity(Intent(this, DashboardSiswaActivity::class.java))
        finish()
    }

    private fun navigateToJadwalHarian() {
        startActivity(Intent(this, JadwalHarianSiswaActivity::class.java).apply {
            putExtra("IS_PENGURUS", false)
        })
    }
}