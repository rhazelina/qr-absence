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

class DashboardWaliKelasActivity : AppCompatActivity() {

    private lateinit var txtTanggalSekarang: TextView
    private lateinit var txtWaktuLive: TextView
    private lateinit var txtJamMasuk: TextView
    private lateinit var txtJamPulang: TextView
    private lateinit var txtTanggalDiJamLayout: TextView
    private lateinit var txtNominalSiswa: TextView
    private lateinit var txtHadirCount: TextView
    private lateinit var txtIzinCount: TextView
    private lateinit var txtSakitCount: TextView
    private lateinit var txtAlphaCount: TextView

    private val handler = Handler(Looper.getMainLooper())
    private lateinit var runnable: Runnable

    // Data kehadiran kelas XII RPL 2 (wali kelas)
    private var totalSiswa = 25  // Total siswa di XII RPL 2
    private var hadirCount = 20
    private var izinCount = 2
    private var sakitCount = 1
    private var alphaCount = 2

    private lateinit var recyclerJadwal: RecyclerView
    private lateinit var recyclerRiwayat: RecyclerView

    private val executor = Executors.newSingleThreadScheduledExecutor()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.dashboard_wali_kelas)

        initViews()
        setupDateTime()
        setupKehadiranData()
        setupRecyclerView()
        setupFooterNavigation()
        setupKehadiranButtons()

        // ===== TAMBAHKAN POPUP MENU DI PROFILE =====
        findViewById<ImageButton>(R.id.profile).setOnClickListener { view ->
            showProfileMenu(view)
        }
    }

    private fun initViews() {
        txtTanggalSekarang = findViewById(R.id.txtTanggalSekarang)
        txtWaktuLive = findViewById(R.id.txtWaktuLive)
        txtJamMasuk = findViewById(R.id.txtJamMasuk)
        txtJamPulang = findViewById(R.id.txtJamPulang)
        txtTanggalDiJamLayout = findViewById(R.id.txtTanggalDiJamLayout)
        txtNominalSiswa = findViewById(R.id.nominal_siswa)
        txtHadirCount = findViewById(R.id.txt_hadir_count)
        txtIzinCount = findViewById(R.id.txt_izin_count)
        txtSakitCount = findViewById(R.id.txt_sakit_count)
        txtAlphaCount = findViewById(R.id.txt_alpha_count)
        recyclerJadwal = findViewById(R.id.recyclerJadwal)
        recyclerRiwayat = findViewById(R.id.recyclerJadwal1)
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
            .setTitle("Logout Wali Kelas")
            .setMessage("Yakin ingin logout dari akun wali kelas XII RPL 2?")
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
        Toast.makeText(this, "Logout wali kelas berhasil", Toast.LENGTH_SHORT).show()
    }

    private fun setupDateTime() {
        val dateFormat = SimpleDateFormat("EEEE, d MMMM yyyy", Locale.forLanguageTag("id-ID"))
        val currentDate = Date()
        val tanggalHariIni = dateFormat.format(currentDate)

        val tanggalFormatBesar = tanggalHariIni.toUpperCase(Locale.forLanguageTag("id-ID"))

        txtTanggalSekarang.text = tanggalFormatBesar
        txtTanggalDiJamLayout.text = tanggalFormatBesar
        txtJamMasuk.text = "07:00:00"
        txtJamPulang.text = "15:00:00"

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

    private fun setupKehadiranData() {
        updateKehadiranDisplay()

        executor.schedule({
            runOnUiThread {
                hadirCount += (0..2).random()
                izinCount += (0..1).random()
                sakitCount += (0..1).random()
                alphaCount += (0..1).random()
                updateKehadiranDisplay()
            }
        }, 30, TimeUnit.SECONDS)
    }

    private fun updateKehadiranDisplay() {
        txtNominalSiswa.text = totalSiswa.toString()
        txtHadirCount.text = hadirCount.toString()
        txtIzinCount.text = izinCount.toString()
        txtSakitCount.text = sakitCount.toString()
        txtAlphaCount.text = alphaCount.toString()
    }

    private fun setupRecyclerView() {
        val jadwalList = generateDummyJadwal()
        val jadwalAdapter = JadwalAdapter(jadwalList) { jadwal ->
            navigateToDetailJadwalWakel(jadwal)
        }

        recyclerJadwal.layoutManager = LinearLayoutManager(this)
        recyclerJadwal.adapter = jadwalAdapter
        recyclerJadwal.setHasFixedSize(true)

        val riwayatList = generateDummyRiwayat()
        val riwayatAdapter = RiwayatAbsenAdapter(riwayatList)

        recyclerRiwayat.layoutManager = LinearLayoutManager(this)
        recyclerRiwayat.adapter = riwayatAdapter
        recyclerRiwayat.setHasFixedSize(true)
    }

    private fun generateDummyJadwal(): List<DashboardGuruActivity.JadwalItem> {
        // Kelas yang diajar: XI RPL 1, XI RPL 2, XII RPL 2, X RPL 1
        val kelasList = listOf(
            "XII RPL 2",  // Wali kelas
            "XI RPL 1",
            "XI RPL 2",
            "X RPL 1"
        )

        // Mapel yang diajar: PKDK, MPP, Matematika
        val mapelList = listOf(
            "PKDK",
            "MPP",
            "Matematika",
            "PKDK"
        )

        val jadwalList = mutableListOf<DashboardGuruActivity.JadwalItem>()
        val waktuMulai = listOf(
            "07:30", "08:15", "09:00", "09:45"
        )
        val waktuSelesai = listOf(
            "08:15", "09:00", "09:45", "10:30"
        )

        for (i in 0 until 4) {
            jadwalList.add(
                DashboardGuruActivity.JadwalItem(
                    id = i + 1,
                    mataPelajaran = mapelList[i],
                    waktuPelajaran = "Jam ke-${i + 1}",
                    kelas = kelasList[i],
                    jam = "${waktuMulai[i]} - ${waktuSelesai[i]}",
                    idKelas = kelasList[i].replace(" ", ""),
                    idMapel = mapelList[i].take(3).uppercase()
                )
            )
        }

        return jadwalList
    }

    private fun generateDummyRiwayat(): List<RiwayatAbsenItem> {
        // Nama siswa dari kelas XII RPL 2 (wali kelas)
        val siswaList = listOf(
            "Agus Santoso", "Budi Setiawan", "Cindy Anggraini",
            "Dedi Kurniawan", "Eka Wulandari", "Fajar Nugroho",
            "Gita Maharani", "Hendra Pratama", "Indah Sari",
            "Joko Prabowo"
        )

        val riwayatList = mutableListOf<RiwayatAbsenItem>()

        for (i in 0 until 10) {
            riwayatList.add(
                RiwayatAbsenItem(
                    id = i + 1,
                    namaSiswa = siswaList[i],
                    jurusan = "XII RPL 2",  // Semua dari kelas wali
                    tanggal = "12-Februari-2026",
                    waktu = "07:${String.format("%02d", (i * 3) % 60)}",
                    status = if (i < 8) "hadir" else if (i == 8) "izin" else "sakit"
                )
            )
        }

        return riwayatList
    }

    private fun navigateToDetailJadwalWakel(jadwal: DashboardGuruActivity.JadwalItem) {
        val intent = Intent(this, DetailJadwalWakelActivity::class.java).apply {
            putExtra("JADWAL_DATA", DashboardGuruActivity.JadwalData(
                mataPelajaran = jadwal.mataPelajaran,
                kelas = jadwal.kelas,
                jam = jadwal.jam,
                waktuPelajaran = jadwal.waktuPelajaran
            ))
        }
        startActivity(intent)
    }

    private fun setupFooterNavigation() {
        findViewById<ImageButton>(R.id.btnHome).setOnClickListener {
            refreshDashboard()
        }

        findViewById<ImageButton>(R.id.btnCalendar).setOnClickListener {
            startActivity(Intent(this, RiwayatKehadiranKelasActivity::class.java))
        }

        findViewById<ImageButton>(R.id.btnChart).setOnClickListener {
            startActivity(Intent(this, TindakLanjutWaliKelasActivity::class.java))
        }

        findViewById<ImageButton>(R.id.btnNotif).setOnClickListener {
            startActivity(Intent(this, NotifikasiWaliKelasActivity::class.java))
        }
    }

    private fun setupKehadiranButtons() {
        findViewById<ImageButton>(R.id.button_hadir).setOnClickListener {
            Toast.makeText(this, "Siswa hadir XII RPL 2: $hadirCount", Toast.LENGTH_SHORT).show()
        }

        findViewById<ImageButton>(R.id.button_sakit).setOnClickListener {
            Toast.makeText(this, "Detail kehadiran XII RPL 2", Toast.LENGTH_SHORT).show()
        }

        findViewById<ImageButton>(R.id.jumlah_siswa_wakel).setOnClickListener {
            Toast.makeText(this, "Total siswa XII RPL 2: $totalSiswa", Toast.LENGTH_SHORT).show()
        }
    }

    private fun refreshDashboard() {
        totalSiswa = 25
        hadirCount = 20
        izinCount = 2
        sakitCount = 1
        alphaCount = 2
        updateKehadiranDisplay()

        val jadwalList = generateDummyJadwal()
        val jadwalAdapter = JadwalAdapter(jadwalList) { jadwal ->
            navigateToDetailJadwalWakel(jadwal)
        }
        recyclerJadwal.adapter = jadwalAdapter

        val riwayatList = generateDummyRiwayat()
        val riwayatAdapter = RiwayatAbsenAdapter(riwayatList)
        recyclerRiwayat.adapter = riwayatAdapter
    }

    override fun onDestroy() {
        super.onDestroy()
        handler.removeCallbacks(runnable)
        executor.shutdownNow()
    }
}