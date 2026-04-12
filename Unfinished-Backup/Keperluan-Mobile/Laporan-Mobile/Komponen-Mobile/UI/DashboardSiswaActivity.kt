package com.example.ritamesa

import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageButton
import android.widget.ImageView
import android.widget.PopupMenu
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.ritamesa.api.Result
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

class DashboardSiswaActivity : BaseNetworkActivity() {

    private lateinit var txtTanggalSekarang: TextView
    private lateinit var txtWaktuLive: TextView
    private lateinit var txtJamMasuk: TextView
    private lateinit var txtJamPulang: TextView
    private lateinit var recyclerJadwal: RecyclerView
    private lateinit var btnHome: ImageButton
    private lateinit var btnAssignment: ImageButton
    private lateinit var profileSiswa: ImageView
    private lateinit var profileOverlay: ImageView
    private lateinit var txtTanggalDiJamLayout: TextView
    private lateinit var progressBar: ProgressBar

    private val handler = Handler(Looper.getMainLooper())
    private lateinit var runnable: Runnable
    private val jadwalHariIni = mutableListOf<JadwalSiswaItem>()
    private var isPengurus = false

    companion object {
        private const val TAG = "DashboardSiswa"
    }

    data class JadwalSiswaItem(
        val id: Int,
        val sesi: String,
        val mataPelajaran: String,
        val status: String,
        val jam: String,
        val keterangan: String,
        val room: String? = null,
        val teacherName: String? = null,
        val scheduleId: Int = 0
    )

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Log.d(TAG, "=== DASHBOARD SISWA ACTIVITY START ===")

        isPengurus = intent.getBooleanExtra("IS_PENGURUS", false)
        Log.d(TAG, "isPengurus = $isPengurus")

        setContentView(R.layout.dashboard_siswa)

        initViews()
        setupDateTime()
        setupProfileImage()
        setupRecyclerView()
        setupButtonListeners()
        updateRoleUI()
        loadStudentDashboard()
    }

    private fun initViews() {
        txtTanggalSekarang = findViewById(R.id.txtTanggalSekarang)
        txtWaktuLive = findViewById(R.id.txtWaktuLive)
        txtJamMasuk = findViewById(R.id.txtJamMasuk)
        txtJamPulang = findViewById(R.id.txtJamPulang)
        recyclerJadwal = findViewById(R.id.recyclerJadwal)
        btnHome = findViewById(R.id.btnHome)
        btnAssignment = findViewById(R.id.btnAssignment)
        profileSiswa = findViewById(R.id.profile_siswa)
        profileOverlay = findViewById(R.id.profile)
        txtTanggalDiJamLayout = findViewById(R.id.txtTanggalDiJamLayout)
        progressBar = findViewById(R.id.progressBar) ?: ProgressBar(this).also {
            Log.w(TAG, "progressBar not found in layout")
        }

        findViewById<ImageButton>(R.id.profile).setOnClickListener { view ->
            showProfileMenu(view)
        }
    }

    override fun showLoading() {
        progressBar.visibility = View.VISIBLE
        recyclerJadwal.visibility = View.GONE
    }

    override fun hideLoading() {
        progressBar.visibility = View.GONE
        recyclerJadwal.visibility = View.VISIBLE
    }

    private fun loadStudentDashboard() {
        showLoading()
        lifecycleScope.launch {
            try {
                val result = dashboardRepository.getStudentDashboard()

                when (result) {
                    is Result.Success -> {
                        val dashboard = result.data
                        Log.d(TAG, "Student dashboard loaded")

                        jadwalHariIni.clear()

                        dashboard.todaySchedules?.let { schedules ->
                            schedules.forEach { schedule ->
                                val status = schedule.attendanceStatus ?: "none"
                                val displayStatus = when (status.lowercase(Locale.getDefault())) {
                                    "present" -> "Hadir"
                                    "late" -> "Terlambat"
                                    "sick" -> "Sakit"
                                    "excused", "izin" -> "Izin"
                                    "absent" -> "Alpha"
                                    else -> "Belum Absen"
                                }

                                jadwalHariIni.add(
                                    JadwalSiswaItem(
                                        id = schedule.id ?: 0,
                                        sesi = formatJam(schedule.startTime, schedule.endTime),
                                        mataPelajaran = schedule.subjectName ?: "-",
                                        status = status,
                                        jam = formatJam(schedule.startTime, schedule.endTime),
                                        keterangan = displayStatus,
                                        room = schedule.room,
                                        teacherName = schedule.teacher?.name ?: "Guru",
                                        scheduleId = schedule.id ?: 0
                                    )
                                )
                            }
                        }

                        // Set default jam masuk/pulang
                        txtJamMasuk.text = "07:00"
                        txtJamPulang.text = "15:00"

                        updateRecyclerView()
                        hideLoading()
                    }
                    is Result.Error -> {
                        Log.e(TAG, "Failed to load dashboard: ${result.message}")
                        showError("Gagal memuat dashboard: ${result.message}")
                        jadwalHariIni.clear()
                        updateRecyclerView()
                        hideLoading()
                    }
                    else -> hideLoading()
                }
            } catch (e: Exception) {
                Log.e(TAG, "Exception loading dashboard", e)
                showError("Error: ${e.message}")
                hideLoading()
            }
        }
    }

    private fun formatJam(startTime: String?, endTime: String?): String {
        return when {
            !startTime.isNullOrEmpty() && !endTime.isNullOrEmpty() ->
                "${startTime.substring(0, minOf(5, startTime.length))} - ${endTime.substring(0, minOf(5, endTime.length))}"
            !startTime.isNullOrEmpty() -> startTime.substring(0, minOf(5, startTime.length))
            else -> "-"
        }
    }

    private fun updateRecyclerView() {
        if (jadwalHariIni.isEmpty()) {
            recyclerJadwal.visibility = View.GONE
            // Tampilkan pesan kosong jika perlu
        } else {
            recyclerJadwal.visibility = View.VISIBLE
            recyclerJadwal.layoutManager = LinearLayoutManager(this)
            recyclerJadwal.setHasFixedSize(true)
            recyclerJadwal.adapter = JadwalSiswaAdapter(jadwalHariIni)
        }
    }

    private fun showProfileMenu(view: View) {
        val popupMenu = PopupMenu(this, view)
        popupMenu.menuInflater.inflate(R.menu.profile_simple, popupMenu.menu)

        popupMenu.setOnMenuItemClickListener { menuItem ->
            when (menuItem.itemId) {
                R.id.menu_logout -> {
                    showLogoutConfirmation()
                    true
                }
                R.id.menu_cancel -> {
                    Toast.makeText(this, "Menu dibatalkan", Toast.LENGTH_SHORT).show()
                    true
                }
                else -> false
            }
        }
        popupMenu.show()
    }

    private fun showLogoutConfirmation() {
        val role = if (isPengurus) "Pengurus Kelas" else "Siswa"
        AlertDialog.Builder(this)
            .setTitle("Logout $role")
            .setMessage("Yakin ingin logout dari akun $role?")
            .setPositiveButton("Ya, Logout") { _, _ ->
                performLogout()
            }
            .setNegativeButton("Batal", null)
            .show()
    }

    private fun performLogout() {
        lifecycleScope.launch {
            val result = authRepository.logout()
            when (result) {
                is Result.Success -> {
                    val intent = Intent(this@DashboardSiswaActivity, LoginAwal::class.java)
                    intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                    startActivity(intent)
                    finish()
                }
                is Result.Error -> {
                    showError("Gagal logout: ${result.message}")
                }
                else -> {}
            }
        }
    }

    private fun setupDateTime() {
        val localeId = Locale("id", "ID")
        val dateFormat = SimpleDateFormat("EEEE, d MMMM yyyy", localeId)
        val currentDate = Date()
        val tanggalHariIni = dateFormat.format(currentDate)

        val tanggalFormatBesar = tanggalHariIni.replaceFirstChar {
            if (it.isLowerCase()) it.titlecase(localeId) else it.toString()
        }

        txtTanggalSekarang.text = tanggalFormatBesar
        txtTanggalDiJamLayout.text = tanggalFormatBesar

        runnable = object : Runnable {
            override fun run() {
                val timeFormat = SimpleDateFormat("HH:mm", Locale.getDefault())
                timeFormat.timeZone = TimeZone.getTimeZone("Asia/Jakarta")
                val currentTime = timeFormat.format(Date())
                txtWaktuLive.text = currentTime
                handler.postDelayed(this, 1000)
            }
        }
        handler.post(runnable)
    }

    private fun setupProfileImage() {
        if (isPengurus) {
            profileSiswa.setImageResource(R.drawable.profile_pengurus)
            profileOverlay.setImageResource(R.drawable.profile_p)
        } else {
            profileSiswa.setImageResource(R.drawable.profile_siswa)
            profileOverlay.setImageResource(R.drawable.profile_p)
        }
    }

    private fun setupRecyclerView() {
        recyclerJadwal.layoutManager = LinearLayoutManager(this)
        recyclerJadwal.setHasFixedSize(true)
    }

    private fun setupButtonListeners() {
        btnHome.setOnClickListener {
            Toast.makeText(this, "Anda sudah di Dashboard", Toast.LENGTH_SHORT).show()
        }

        btnAssignment.setOnClickListener {
            if (isPengurus) {
                val intent = Intent(this, RiwayatKehadiranKelasPengurusActivity::class.java)
                intent.putExtra("IS_PENGURUS", true)
                startActivity(intent)
            } else {
                val intent = Intent(this, RiwayatKehadiranKelasSiswaActivity::class.java)
                startActivity(intent)
            }
        }
    }

    private fun updateRoleUI() {
        val role = if (isPengurus) "Pengurus Kelas" else "Siswa"
        Toast.makeText(this, "Selamat datang, $role!", Toast.LENGTH_SHORT).show()
    }

    override fun onDestroy() {
        super.onDestroy()
        handler.removeCallbacks(runnable)
    }

    // ========== ADAPTER FIX SESUAI XML ==========
    private inner class JadwalSiswaAdapter(
        private val jadwalList: List<JadwalSiswaItem>
    ) : RecyclerView.Adapter<JadwalSiswaAdapter.JadwalViewHolder>() {

        inner class JadwalViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
            // FIX: Sesuaikan dengan ID yang ADA di XML
            val txtMataPelajaran: TextView = itemView.findViewById(R.id.MataPelajaran)      // Untuk sesi/jam ke
            val txtMapelDetail: TextView = itemView.findViewById(R.id.Mata_pelajaran)       // Untuk nama mapel
            val txtKeterangan: TextView = itemView.findViewById(R.id.Text_keterangan_hadir) // Untuk status/keterangan
            val txtJam: TextView = itemView.findViewById(R.id.tvJam_1)                      // Untuk jam

            // HAPUS txtGuru karena TIDAK ADA di XML
            // val txtGuru: TextView = itemView.findViewById(R.id.tvGuru_1)
        }

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): JadwalViewHolder {
            val view = LayoutInflater.from(parent.context)
                .inflate(R.layout.item_dashboard_siswa, parent, false)
            return JadwalViewHolder(view)
        }

        override fun onBindViewHolder(holder: JadwalViewHolder, position: Int) {
            val jadwal = jadwalList[position]

            // FIX: Mapping data ke View
            holder.txtMataPelajaran.text = jadwal.sesi              // "Jam Ke 1-2"
            holder.txtMapelDetail.text = jadwal.mataPelajaran       // "B. Indonesia"
            holder.txtKeterangan.text = jadwal.keterangan           // "Hadir" / "Alpha" / dll
            holder.txtJam.text = jadwal.jam                         // "07:00 - 08:30"

            // HAPUS baris ini karena tidak ada view untuk teacherName
            // holder.txtGuru.text = jadwal.teacherName ?: "-"

            // Set warna berdasarkan status
            val colorRes = when (jadwal.status.lowercase(Locale.getDefault())) {
                "present", "hadir" -> android.R.color.holo_green_dark
                "late", "terlambat" -> android.R.color.holo_orange_dark
                "sick", "sakit" -> android.R.color.holo_blue_dark
                "excused", "izin" -> android.R.color.holo_blue_dark
                "absent", "alpha" -> android.R.color.holo_red_dark
                else -> android.R.color.black
            }

            holder.txtKeterangan.setTextColor(
                ContextCompat.getColor(holder.itemView.context, colorRes)
            )
        }

        override fun getItemCount(): Int = jadwalList.size
    }
}