package com.example.ritamesa

import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.widget.ImageButton
import android.widget.PopupMenu
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit

class DashboardGuruActivity : AppCompatActivity() {

    private lateinit var txtTanggalSekarang: TextView
    private lateinit var txtWaktuLive: TextView
    private lateinit var txtJamMasuk: TextView
    private lateinit var txtJamPulang: TextView
    private lateinit var txtTanggalDiJamLayout: TextView
    private lateinit var txtHadirCount: TextView
    private lateinit var txtIzinCount: TextView
    private lateinit var txtSakitCount: TextView
    private lateinit var txtAlphaCount: TextView
    private lateinit var recyclerJadwal: RecyclerView

    private val handler = Handler(Looper.getMainLooper())
    private lateinit var runnable: Runnable
    private val jadwalHariIni = mutableListOf<JadwalItem>()

    private val jamMasukDatabase = "07:00:00"
    private val jamPulangDatabase = "15:00:00"

    private var hadirCount = 0
    private var izinCount = 0
    private var sakitCount = 0
    private var alphaCount = 0

    private val executor = Executors.newSingleThreadScheduledExecutor()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.dashboard_guru)

        initViews()
        setupDateTime()
        setupKehadiran()
        setupRecyclerView()
        setupFooterNavigation()
        setupKehadiranButtons()
    }

    private fun initViews() {
        try {
            txtTanggalSekarang = findViewById(R.id.txtTanggalSekarang)
            txtWaktuLive = findViewById(R.id.txtWaktuLive)
            txtJamMasuk = findViewById(R.id.txtJamMasuk)
            txtJamPulang = findViewById(R.id.txtJamPulang)
            txtTanggalDiJamLayout = findViewById(R.id.txtTanggalDiJamLayout)
            txtHadirCount = findViewById(R.id.txt_hadir_count)
            txtIzinCount = findViewById(R.id.txt_izin_count)
            txtSakitCount = findViewById(R.id.txt_sakit_count)
            txtAlphaCount = findViewById(R.id.txt_alpha_count)
            recyclerJadwal = findViewById(R.id.recyclerJadwal)

            // TAMBAHKAN POPUP MENU DI PROFILE
            findViewById<ImageButton>(R.id.profile).setOnClickListener { view ->
                showProfileMenu(view)
            }
        } catch (e: Exception) {
            Toast.makeText(this, "Error initViews: ${e.message}", Toast.LENGTH_LONG).show()
            e.printStackTrace()
        }
    }

    // ===== PROFILE MENU DENGAN 2 PILIHAN =====
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
                    Toast.makeText(this, "Menu dibatalkan", Toast.LENGTH_SHORT).show()
                    true
                }
                else -> false
            }
        }

        popupMenu.show()
    }

    private fun showLogoutConfirmation() {
        android.app.AlertDialog.Builder(this)
            .setTitle("Logout Guru")
            .setMessage("Yakin ingin logout dari akun guru?")
            .setPositiveButton("Ya, Logout") { _, _ ->
                performLogout()
            }
            .setNegativeButton("Batal", null)
            .show()
    }

    private fun performLogout() {
        val intent = Intent(this, LoginAwal::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        startActivity(intent)
        finish()
        Toast.makeText(this, "Logout guru berhasil", Toast.LENGTH_SHORT).show()
    }

    // ===== FUNGSI LAINNYA TETAP SAMA =====
    private fun setupDateTime() {
        try {
            val dateFormat = SimpleDateFormat("EEEE, d MMMM yyyy", Locale.forLanguageTag("id-ID"))
            val currentDate = Date()
            val tanggalHariIni = dateFormat.format(currentDate)

            txtTanggalSekarang.text = tanggalHariIni
            txtTanggalDiJamLayout.text = tanggalHariIni
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
            Toast.makeText(this, "Error setupDateTime: ${e.message}", Toast.LENGTH_LONG).show()
        }
    }

    private fun setupKehadiran() {
        try {
            hadirCount = 25
            izinCount = 1
            sakitCount = 1
            alphaCount = 3

            updateKehadiranCount()

            executor.schedule({
                runOnUiThread {
                    hadirCount += (0..2).random()
                    izinCount += (0..1).random()
                    sakitCount += (0..1).random()
                    alphaCount += (0..1).random()
                    updateKehadiranCount()
                }
            }, 30, TimeUnit.SECONDS)
        } catch (e: Exception) {
            Toast.makeText(this, "Error setupKehadiran: ${e.message}", Toast.LENGTH_LONG).show()
        }
    }

    private fun updateKehadiranCount() {
        try {
            txtHadirCount.text = hadirCount.toString()
            txtIzinCount.text = izinCount.toString()
            txtSakitCount.text = sakitCount.toString()
            txtAlphaCount.text = alphaCount.toString()
        } catch (e: Exception) {
            // Log error
        }
    }

    private fun setupRecyclerView() {
        try {
            jadwalHariIni.clear()
            jadwalHariIni.addAll(generateDummyJadwal())

            val jadwalAdapter = JadwalAdapter(jadwalHariIni) { jadwal ->
                navigateToDetailJadwalGuru(jadwal)
            }

            recyclerJadwal.layoutManager = LinearLayoutManager(this).apply {
                orientation = LinearLayoutManager.VERTICAL
            }

            recyclerJadwal.adapter = jadwalAdapter
            recyclerJadwal.setHasFixedSize(true)
        } catch (e: Exception) {
            Toast.makeText(this, "Error setupRecyclerView: ${e.message}", Toast.LENGTH_LONG).show()
            e.printStackTrace()
        }
    }

    private fun generateDummyJadwal(): List<JadwalItem> {
        // Kelas yang diajar: XII RPL 2, XII RPL 1, XI RPL 1, XI RPL 2, XI RPL 3, X RPL 1, X RPL 2
        val kelasList = listOf(
            "XII RPL 2", "XII RPL 1",
            "XI RPL 1", "XI RPL 2", "XI RPL 3",
            "X RPL 1", "X RPL 2"
        )

        // Mapel: MPKK, PKDK, MPP (untuk XI & XII), Informatika (hanya X)
        val mapelKelasXII_XI = listOf("MPKK", "PKDK", "MPP")
        val mapelKelasX = listOf("Informatika")

        val waktuPelajaranList = listOf(
            "Mapel 1", "Mapel 2", "Mapel 3",
            "Mapel 4", "Mapel 5", "Mapel 6",
            "Mapel 7"
        )

        val jadwalList = mutableListOf<JadwalItem>()
        val waktuMulai = listOf(
            "07:30", "08:15", "09:00", "09:45", "10:30",
            "11:15", "12:00"
        )
        val waktuSelesai = listOf(
            "08:15", "09:00", "09:45", "10:30", "11:15",
            "12:00", "12:45"
        )

        // Generate jadwal untuk setiap kelas
        for (i in 0 until 7) {
            val kelas = kelasList[i]

            // Tentukan mapel berdasarkan tingkat kelas
            val mapel = if (kelas.startsWith("X ")) {
                // Untuk kelas X, gunakan Informatika
                mapelKelasX[0]
            } else {
                // Untuk kelas XI dan XII, rotasi mapel MPKK, PKDK, MPP
                mapelKelasXII_XI[i % mapelKelasXII_XI.size]
            }

            jadwalList.add(
                JadwalItem(
                    id = i + 1,
                    mataPelajaran = mapel,
                    waktuPelajaran = waktuPelajaranList[i],
                    kelas = kelas,
                    jam = "${waktuMulai[i]} - ${waktuSelesai[i]}",
                    idKelas = kelas.replace(" ", ""),
                    idMapel = mapel.take(3).uppercase()
                )
            )
        }

        return jadwalList
    }

    private fun navigateToDetailJadwalGuru(jadwal: JadwalItem) {
        try {
            val intent = Intent(this, DetailJadwalGuruActivity::class.java).apply {
                putExtra("JADWAL_DATA", JadwalData(
                    mataPelajaran = jadwal.mataPelajaran,
                    kelas = jadwal.kelas,
                    jam = jadwal.jam,
                    waktuPelajaran = jadwal.waktuPelajaran
                ))
            }
            startActivity(intent)
            Toast.makeText(this, "Membuka detail: ${jadwal.mataPelajaran}", Toast.LENGTH_SHORT).show()
        } catch (e: Exception) {
            Toast.makeText(this, "Error navigate: ${e.message}", Toast.LENGTH_LONG).show()
        }
    }

    private fun setupFooterNavigation() {
        try {
            val btnHome: ImageButton = findViewById(R.id.btnHome)
            val btnCalendar: ImageButton = findViewById(R.id.btnCalendar)
            val btnChart: ImageButton = findViewById(R.id.btnChart)
            val btnNotif: ImageButton = findViewById(R.id.btnNotif)

            btnHome.setOnClickListener {
                refreshDashboard()
                Toast.makeText(this, "Dashboard Guru direfresh", Toast.LENGTH_SHORT).show()
            }

            btnCalendar.setOnClickListener {
                val intent = Intent(this, RiwayatKehadiranGuruActivity::class.java)
                startActivity(intent)
            }

            btnChart.setOnClickListener {
                val intent = Intent(this, TindakLanjutGuruActivity::class.java)
                startActivity(intent)
            }

            btnNotif.setOnClickListener {
                val intent = Intent(this, NotifikasiGuruActivity::class.java)
                startActivity(intent)
            }
        } catch (e: Exception) {
            Toast.makeText(this, "Error footer nav: ${e.message}", Toast.LENGTH_LONG).show()
        }
    }

    private fun setupKehadiranButtons() {
        try {
            val btnHadir: ImageButton = findViewById(R.id.button_hadir)
            val btnIzin: ImageButton = findViewById(R.id.button_izin)
            val btnSakit: ImageButton = findViewById(R.id.button_sakit)
            val btnAlpha: ImageButton = findViewById(R.id.button_alpha)

            btnHadir.setOnClickListener {
                Toast.makeText(this, "Lihat siswa Hadir", Toast.LENGTH_SHORT).show()
            }

            btnIzin.setOnClickListener {
                Toast.makeText(this, "Lihat siswa Izin", Toast.LENGTH_SHORT).show()
            }

            btnSakit.setOnClickListener {
                Toast.makeText(this, "Lihat siswa Sakit", Toast.LENGTH_SHORT).show()
            }

            btnAlpha.setOnClickListener {
                Toast.makeText(this, "Lihat siswa Alpha", Toast.LENGTH_SHORT).show()
            }
        } catch (e: Exception) {
            Toast.makeText(this, "Error kehadiran buttons: ${e.message}", Toast.LENGTH_LONG).show()
        }
    }

    private fun refreshDashboard() {
        hadirCount = 25
        izinCount = 1
        sakitCount = 1
        alphaCount = 3
        updateKehadiranCount()

        jadwalHariIni.clear()
        jadwalHariIni.addAll(generateDummyJadwal())

        val adapter = recyclerJadwal.adapter
        adapter?.notifyItemRangeChanged(0, jadwalHariIni.size)
    }

    override fun onDestroy() {
        super.onDestroy()
        handler.removeCallbacks(runnable)
        executor.shutdownNow()
    }

    data class JadwalItem(
        val id: Int,
        val mataPelajaran: String,
        val waktuPelajaran: String,
        val kelas: String,
        val jam: String,
        val idKelas: String,
        val idMapel: String
    )

    data class JadwalData(
        val mataPelajaran: String,
        val kelas: String,
        val jam: String,
        val waktuPelajaran: String
    ) : java.io.Serializable
}