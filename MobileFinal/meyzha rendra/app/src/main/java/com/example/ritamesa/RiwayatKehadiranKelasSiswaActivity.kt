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
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import java.text.SimpleDateFormat
import java.util.*

class RiwayatKehadiranKelasSiswaActivity : AppCompatActivity() {

    // ===== COMPONENTS =====
    private lateinit var recyclerRiwayat: RecyclerView
    private lateinit var txtHadirCount: TextView
    private lateinit var txtIzinCount: TextView
    private lateinit var txtSakitCount: TextView
    private lateinit var txtAlphaCount: TextView
    private lateinit var txtFilterTanggal: TextView
    private lateinit var btnCalendar: ImageButton
    private lateinit var txtJumlah: TextView

    // ===== DATA =====
    private val riwayatList = mutableListOf<RiwayatSiswaItem>()
    private var totalHadir = 0
    private var totalIzin = 0
    private var totalSakit = 0
    private var totalAlpha = 0

    // ===== DATA CLASS =====
    data class RiwayatSiswaItem(
        val id: String,
        val mataPelajaran: String,
        val keterangan: String,
        val status: String // hadir, terlambat, izin, sakit, alpha
    )

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.riwayat_kehadiran_kelas_siswa)

        initViews()
        setupStatistik()
        setupRecyclerView()
        setupButtonListeners()
        setupBackPressedHandler()
    }

    // ===== INITIALIZATION =====
    private fun initViews() {
        // TextView statistik
        txtHadirCount = findViewById(R.id.txt_hadir_count)
        txtIzinCount = findViewById(R.id.txt_izin_count)
        txtSakitCount = findViewById(R.id.txt_sakit_count)
        txtAlphaCount = findViewById(R.id.txt_alpha_count)

        // TextView lainnya
        txtJumlah = findViewById(R.id.text_jumlah_siswa)
        txtFilterTanggal = findViewById(R.id.text_filter_tanggal)
        btnCalendar = findViewById(R.id.icon_calendar)
        recyclerRiwayat = findViewById(R.id.recycler_riwayat)

        // Sembunyikan tombol kalender
        btnCalendar.visibility = View.GONE

        // Set teks
        txtJumlah.text = "Total Mata Pelajaran: 6"
        updateTanggalDisplay()
    }

    private fun updateTanggalDisplay() {
        try {
            val sdf = SimpleDateFormat("EEEE, dd MMMM yyyy", Locale("id", "ID"))
            val currentDate = Date()
            val formatted = sdf.format(currentDate)
            txtFilterTanggal.text = formatted.replaceFirstChar { it.uppercase() }
        } catch (e: Exception) {
            txtFilterTanggal.text = "Senin, 7 Januari 2026"
            Toast.makeText(this, "Error format tanggal", Toast.LENGTH_SHORT).show()
        }
    }

    // ===== STATISTICS =====
    private fun setupStatistik() {
        calculateStatistics()
        displayStatistics()
    }

    private fun calculateStatistics() {
        // Reset counter
        totalHadir = 0
        totalIzin = 0
        totalSakit = 0
        totalAlpha = 0

        // ===== DUMMY DATA DENGAN STATUS KONSISTEN =====
        val dummyData = listOf(
            RiwayatSiswaItem("1-3", "Bahasa Indonesia",  "Hadir Tepat Waktu", "hadir"),
            RiwayatSiswaItem("4-5", "Matematika",        "Terlambat 5 menit", "terlambat"),
            RiwayatSiswaItem("6-7", "MPKK",             "Tanpa Keterangan", "alpha"),
            RiwayatSiswaItem("8-9", "Bahasa Inggris",   "Izin Acara Keluarga", "izin"),
            RiwayatSiswaItem("10",  "Bahasa Jawa",      "Sakit Demam", "sakit")
        )

        // Hitung statistik berdasarkan status
        dummyData.forEach { item ->
            when (item.status.lowercase(Locale.ROOT)) {
                "hadir", "terlambat" -> totalHadir++      // Terlambat tetap dihitung hadir
                "izin" -> totalIzin++
                "sakit" -> totalSakit++
                "alpha", "alfa", "alpa", "tanpa keterangan", "tidak hadir" -> totalAlpha++
            }
        }

        // Debug log
        Log.d("RIWAYAT_DEBUG", "Total Hadir: $totalHadir")
        Log.d("RIWAYAT_DEBUG", "Total Izin: $totalIzin")
        Log.d("RIWAYAT_DEBUG", "Total Sakit: $totalSakit")
        Log.d("RIWAYAT_DEBUG", "Total Alpha: $totalAlpha")

        // Simpan ke list
        riwayatList.clear()
        riwayatList.addAll(dummyData)
    }

    private fun displayStatistics() {
        txtHadirCount.text = totalHadir.toString()
        txtIzinCount.text = totalIzin.toString()
        txtSakitCount.text = totalSakit.toString()
        txtAlphaCount.text = totalAlpha.toString()
    }

    // ===== RECYCLERVIEW =====
    private fun setupRecyclerView() {
        recyclerRiwayat.layoutManager = LinearLayoutManager(this)
        recyclerRiwayat.setHasFixedSize(true)
        recyclerRiwayat.adapter = RiwayatSiswaAdapter(riwayatList)
    }

    // ===== ADAPTER =====
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
            holder.txtKeterangan.text = riwayat.keterangan

            // ===== SET BADGE BERDASARKAN STATUS =====
            when (riwayat.status.lowercase(Locale.ROOT)) {
                "hadir" -> {
                    holder.imgBadge.setImageResource(R.drawable.siswa_hadir_wakel)
                    holder.txtKeterangan.setTextColor(resources.getColor(android.R.color.black))
                }
                "terlambat" -> {
                    holder.imgBadge.setImageResource(R.drawable.siswa_hadir_wakel)
                    holder.txtKeterangan.setTextColor(resources.getColor(android.R.color.black))
                }
                "izin" -> {
                    holder.imgBadge.setImageResource(R.drawable.siswa_izin_wakel)
                    holder.txtKeterangan.setTextColor(resources.getColor(android.R.color.black))
                }
                "sakit" -> {
                    holder.imgBadge.setImageResource(R.drawable.siswa_sakit_wakel)
                    holder.txtKeterangan.setTextColor(resources.getColor(android.R.color.black))
                }
                "alpha", "alfa", "alpa", "tanpa keterangan", "tidak hadir" -> {
                    holder.imgBadge.setImageResource(R.drawable.siswa_alpha_wakel)  // ✅ INI YANG MUNCUL
                    holder.txtKeterangan.setTextColor(resources.getColor(android.R.color.black))
                }
                else -> {
                    holder.imgBadge.setImageResource(R.drawable.siswa_alpha_wakel)
                    holder.txtKeterangan.setTextColor(resources.getColor(android.R.color.black))
                }
            }

            // Set onClickListener
            holder.itemView.setOnClickListener {
                Toast.makeText(
                    this@RiwayatKehadiranKelasSiswaActivity,
                    "${riwayat.mataPelajaran}: ${riwayat.keterangan}",
                    Toast.LENGTH_SHORT
                ).show()
            }
        }

        override fun getItemCount(): Int = riwayatList.size
    }

    // ===== NAVIGATION =====
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
        Toast.makeText(this, "Kembali ke Dashboard", Toast.LENGTH_SHORT).show()
    }

    private fun navigateToJadwalHarian() {
        startActivity(Intent(this, JadwalHarianSiswaActivity::class.java).apply {
            putExtra("IS_PENGURUS", false)
        })
        Toast.makeText(this, "Melihat Jadwal Harian", Toast.LENGTH_SHORT).show()
    }
}