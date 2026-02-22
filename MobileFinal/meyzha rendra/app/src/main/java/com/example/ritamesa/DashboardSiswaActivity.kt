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
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.ritamesa.data.api.ApiClient
import com.example.ritamesa.data.repository.AuthRepository
import com.example.ritamesa.data.repository.ScheduleRepository
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

class DashboardSiswaActivity : AppCompatActivity() {

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

    private val handler = Handler(Looper.getMainLooper())
    private lateinit var runnable: Runnable
    private val jadwalHariIni = mutableListOf<JadwalSiswaItem>()
    private var isPengurus = false

    private val jamMasukDatabase = "07:00:00"
    private val jamPulangDatabase = "15:00:00"

    private lateinit var scheduleRepo: ScheduleRepository
    private lateinit var authRepo: AuthRepository
    private lateinit var appPreferences: AppPreferences

    companion object {
        private const val TAG = "DashboardSiswa"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        try {
            isPengurus = intent.getBooleanExtra("IS_PENGURUS", false)
            setContentView(R.layout.dashboard_siswa)

            scheduleRepo = ScheduleRepository(ApiClient.getService(this))
            authRepo = AuthRepository(ApiClient.getService(this))
            appPreferences = AppPreferences(this)

            initViews()
            setupDateTime()
            setupProfileImage()
            setupRecyclerView()
            setupButtonListeners()
            
            // FETCH DATA FROM API
            loadApiData()

        } catch (e: Exception) {
            Log.e(TAG, "ERROR in onCreate: ${e.message}", e)
            Toast.makeText(this, "Error: ${e.localizedMessage}", Toast.LENGTH_LONG).show()
        }
    }

    private fun loadApiData() {
        lifecycleScope.launch {
            try {
                // Fetch Profile
                val profileRes = authRepo.getProfile()
                if (profileRes.isSuccessful && profileRes.body()?.data != null) {
                    val user = profileRes.body()?.data!!
                    isPengurus = user.classOfficer == true
                    setupProfileImage() // Update icon accordingly
                    Toast.makeText(this@DashboardSiswaActivity, "Selamat datang, ${user.name}!", Toast.LENGTH_SHORT).show()
                }
                
                // Fetch Schedules
                val schedRes = scheduleRepo.getSchedules()
                if (schedRes.isSuccessful) {
                    val schedules = schedRes.body()?.data ?: emptyList()
                    val converted = schedules.mapIndexed { index, dto ->
                        val mapel = dto.subjectName ?: "Mata Pelajaran"
                        val sesi = "Jam ${dto.startTime ?: "-"} s.d ${dto.endTime ?: "-"}"
                        val jam = dto.startTime ?: "-"
                        
                        val statusDesc = dto.attendance?.status ?: "Belum Absen"
                        val ket = dto.attendance?.excuseReason ?: "Silakan Scan QR"
                        
                        val keteranganAkhir = if (statusDesc == "present") "Siswa Hadir Tepat Waktu" else ket
                        
                        JadwalSiswaItem(
                            id = dto.id ?: index,
                            sesi = sesi,
                            mataPelajaran = mapel,
                            status = statusDesc,
                            jam = jam,
                            keterangan = keteranganAkhir
                        )
                    }
                    jadwalHariIni.clear()
                    jadwalHariIni.addAll(converted)
                    recyclerJadwal.adapter?.notifyDataSetChanged()
                } else {
                    Toast.makeText(this@DashboardSiswaActivity, "Gagal memuat jadwal: HTTP ${schedRes.code()}", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@DashboardSiswaActivity, "Error API Data: ${e.message}", Toast.LENGTH_LONG).show()
                Log.e(TAG, "Error Load API: ", e)
            }
        }
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

        findViewById<ImageButton>(R.id.profile).setOnClickListener { view ->
            showProfileMenu(view)
        }
    }

    private fun showProfileMenu(view: android.view.View) {
        val popupMenu = PopupMenu(this, view)
        popupMenu.menuInflater.inflate(R.menu.profile_simple, popupMenu.menu)

        popupMenu.setOnMenuItemClickListener { menuItem ->
            when (menuItem.itemId) {
                R.id.menu_logout -> {
                    showLogoutConfirmation()
                    true
                }
                R.id.menu_cancel -> {
                    Toast.makeText(this, "Batal", Toast.LENGTH_SHORT).show()
                    true
                }
                else -> false
            }
        }
        popupMenu.show()
    }

    private fun showLogoutConfirmation() {
        android.app.AlertDialog.Builder(this)
            .setTitle("Logout")
            .setMessage("Yakin ingin logout?")
            .setPositiveButton("Ya") { _, _ ->
                performLogout()
            }
            .setNegativeButton("Batal", null)
            .show()
    }

    private fun performLogout() {
        lifecycleScope.launch {
            appPreferences.saveToken("") // clear token
            val intent = Intent(this@DashboardSiswaActivity, LoginAwal::class.java)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            startActivity(intent)
            finish()
        }
    }

    private fun setupDateTime() {
        try {
            val dateFormat = SimpleDateFormat("EEEE, d MMMM yyyy", Locale.forLanguageTag("id-ID"))
            val currentDate = Date()
            val tanggalHariIni = dateFormat.format(currentDate)

            val tanggalFormatBesar = tanggalHariIni.uppercase(Locale.forLanguageTag("id-ID"))

            txtTanggalSekarang.text = tanggalFormatBesar
            txtTanggalDiJamLayout.text = tanggalFormatBesar
            txtJamMasuk.text = jamMasukDatabase
            txtJamPulang.text = jamPulangDatabase

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
        } catch (e: Exception) {
            Log.e(TAG, "Error di setupDateTime: ${e.message}")
        }
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
        val adapter = JadwalSiswaAdapter(jadwalHariIni)
        recyclerJadwal.adapter = adapter
    }

    private fun setupButtonListeners() {
        btnHome.setOnClickListener {
            Toast.makeText(this, "Anda sudah di Dashboard", Toast.LENGTH_SHORT).show()
        }

        btnAssignment.setOnClickListener {
            // Placeholder: Ke Jadwal Pengurus / Siswa History
            Toast.makeText(this, "Membuka Riwayat Kehadiran (API Belum di-setup)", Toast.LENGTH_SHORT).show()
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        handler.removeCallbacks(runnable)
    }

    private inner class JadwalSiswaAdapter(
        private val jadwalList: List<JadwalSiswaItem>
    ) : RecyclerView.Adapter<JadwalSiswaAdapter.JadwalViewHolder>() {

        inner class JadwalViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
            val txtMataPelajaran: TextView = itemView.findViewById(R.id.MataPelajaran)
            val txtMapelDetail: TextView = itemView.findViewById(R.id.Mata_pelajaran)
            val txtKeterangan: TextView = itemView.findViewById(R.id.Text_keterangan_hadir)
            val txtJam: TextView = itemView.findViewById(R.id.tvJam_1)
        }

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): JadwalViewHolder {
            val view = LayoutInflater.from(parent.context)
                .inflate(R.layout.item_dashboard_siswa, parent, false)
            return JadwalViewHolder(view)
        }

        override fun onBindViewHolder(holder: JadwalViewHolder, position: Int) {
            val jadwal = jadwalList[position]
            holder.txtMataPelajaran.text = jadwal.sesi
            holder.txtMapelDetail.text = jadwal.mataPelajaran
            holder.txtKeterangan.text = jadwal.keterangan
            holder.txtJam.text = jadwal.jam
        }

        override fun getItemCount(): Int = jadwalList.size
    }

    data class JadwalSiswaItem(
        val id: Int,
        val sesi: String,
        val mataPelajaran: String,
        val status: String,
        val jam: String,
        val keterangan: String
    )
}