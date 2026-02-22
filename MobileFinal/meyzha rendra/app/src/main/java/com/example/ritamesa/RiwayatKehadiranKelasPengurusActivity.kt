package com.example.ritamesa

import android.app.Dialog
import android.content.Intent
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageButton
import android.widget.TextView
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import java.text.SimpleDateFormat
import java.util.*

class RiwayatKehadiranKelasPengurusActivity : AppCompatActivity() {

    private lateinit var recyclerRiwayat: RecyclerView
    private lateinit var txtHadirCount: TextView
    private lateinit var txtIzinCount: TextView
    private lateinit var txtSakitCount: TextView
    private lateinit var txtAlphaCount: TextView
    private lateinit var txtFilterTanggal: TextView

    // PERHATIAN: Di layout pengurus, ini adalah ImageButton
    private lateinit var btnCalendar: ImageButton

    private val riwayatList = mutableListOf<RiwayatPengurusItem>()
    private val siswaList = mutableListOf<RiwayatAbsenItem>()

    private var totalHadir = 0
    private var totalIzin = 0
    private var totalSakit = 0
    private var totalAlpha = 0

    private var isPengurus = true

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        isPengurus = intent.getBooleanExtra("IS_PENGURUS", true)
        setContentView(R.layout.riwayat_kehadiran_kelas_pengurus)

        initViews()
        setupStatistik()
        setupSiswaData()
        setupRecyclerView()
        setupButtonListeners()
        setupBackPressedHandler()
    }

    private fun initViews() {
        txtHadirCount = findViewById(R.id.txt_hadir_count)
        txtIzinCount = findViewById(R.id.txt_izin_count)
        txtSakitCount = findViewById(R.id.txt_sakit_count)
        txtAlphaCount = findViewById(R.id.txt_alpha_count)
        txtFilterTanggal = findViewById(R.id.text_filter_tanggal)

        // PERHATIAN: Di layout pengurus, id nya adalah icon_calendar (ImageButton)
        btnCalendar = findViewById(R.id.icon_calendar)

        // Sembunyikan tombol kalender karena tidak ada filter tanggal
        btnCalendar.visibility = View.GONE

        val txtJumlah: TextView = findViewById(R.id.text_jumlah_siswa)
        txtJumlah.text = "Total Mata Pelajaran: 8"

        recyclerRiwayat = findViewById(R.id.recycler_riwayat)

        updateTanggalDisplay()
    }

    private fun updateTanggalDisplay() {
        try {
            val sdf = SimpleDateFormat("EEEE, dd MMMM yyyy", Locale("id", "ID"))
            val currentDate = Date()
            val formatted = sdf.format(currentDate)

            val finalDate = if (formatted.isNotEmpty()) {
                formatted[0].uppercaseChar() + formatted.substring(1)
            } else {
                formatted
            }

            txtFilterTanggal.text = finalDate
        } catch (e: Exception) {
            Toast.makeText(this, "Error format tanggal", Toast.LENGTH_SHORT).show()
        }
    }

    private fun setupStatistik() {
        val dummyData = listOf(
            RiwayatPengurusItem("1", "B. Indonesia", "32 siswa hadir", "hadir"),
            RiwayatPengurusItem("2", "Matematika", "30 siswa hadir, 2 izin", "hadir"),
            RiwayatPengurusItem("3", "BK", "28 siswa hadir, 4 sakit", "hadir"),
            RiwayatPengurusItem("4", "Bahasa Inggris", "25 siswa hadir, 7 alpha", "hadir"),
            RiwayatPengurusItem("5", "Bahasa Jawa", "31 siswa hadir", "hadir"),
            RiwayatPengurusItem("6", "PKDK", "29 siswa hadir, 3 izin", "hadir"),
            RiwayatPengurusItem("7", "MPKK", "33 siswa hadir", "hadir"),
            RiwayatPengurusItem("8", "PAI", "30 siswa hadir, 2 sakit", "hadir")
        )

        totalHadir = dummyData.size
        totalIzin = 2
        totalSakit = 2
        totalAlpha = 1

        txtHadirCount.text = totalHadir.toString()
        txtIzinCount.text = totalIzin.toString()
        txtSakitCount.text = totalSakit.toString()
        txtAlphaCount.text = totalAlpha.toString()

        riwayatList.clear()
        riwayatList.addAll(dummyData)
    }

    private fun setupSiswaData() {
        siswaList.clear()
        siswaList.addAll(listOf(
            RiwayatAbsenItem(1, "LAURA LAVIDA LOCA", "XII RPL 2", "13-Feb-2026", "07:15", "hadir"),
            RiwayatAbsenItem(2, "LELY SAGITA", "XII RPL 2", "13-Feb-2026", "07:20", "hadir"),
            RiwayatAbsenItem(3, "MAYA MELINDA WIJAYANTI", "XII RPL 2", "13-Feb-2026", "07:25", "hadir"),
            RiwayatAbsenItem(4, "MOCH. ABYL GUSTIAN", "XII RPL 2", "13-Feb-2026", "-", "izin"),
            RiwayatAbsenItem(5, "MUHAMMAD AMINULLAH", "XII RPL 2", "13-Feb-2026", "-", "sakit"),
            RiwayatAbsenItem(6, "MUHAMMAD AZKA F.A", "XII RPL 2", "13-Feb-2026", "07:30", "hadir"),
            RiwayatAbsenItem(7, "MUHAMMAD HADI FIRMANSYAH", "XII RPL 2", "13-Feb-2026", "07:10", "hadir"),
            RiwayatAbsenItem(8, "MUHAMMAD HARRIS M,S", "XII RPL 2", "13-Feb-2026", "-", "alfa"),
            RiwayatAbsenItem(9, "MUHAMMAD IBNU RAFFI AHDAN", "XII RPL 2", "13-Feb-2026", "-", "izin"),
            RiwayatAbsenItem(10, "MUHAMMAD REYHAN A", "XII RPL 2", "13-Feb-2026", "-", "alfa"),
            RiwayatAbsenItem(11, "MUHAMMAD WISNU DEWANDARU", "XII RPL 2", "13-Feb-2026", "07:15", "hadir"),
            RiwayatAbsenItem(12, "NABILA RAMADHAN", "XII RPL 2", "13-Feb-2026", "07:20", "hadir"),
            RiwayatAbsenItem(13, "NADIA SINTA DEVI OKTAVIA", "XII RPL 2", "13-Feb-2026", "07:25", "hadir"),
            RiwayatAbsenItem(14, "NADJWA KIRANA FIRDAUS", "XII RPL 2", "13-Feb-2026", "-", "izin"),
            RiwayatAbsenItem(15, "NINDI NARITA MAULIDYA", "XII RPL 2", "13-Feb-2026", "-", "sakit"),
            RiwayatAbsenItem(16, "NISWATUL KHOIRIYAH", "XII RPL 2", "13-Feb-2026", "07:30", "hadir"),
            RiwayatAbsenItem(17, "NOVERITA PASCALIA RAHMA", "XII RPL 2", "13-Feb-2026", "07:10", "hadir"),
            RiwayatAbsenItem(18, "NOVITA ANDRIANI", "XII RPL 2", "13-Feb-2026", "-", "alfa"),
            RiwayatAbsenItem(19, "NOVITA AZZAHRA", "XII RPL 2", "13-Feb-2026", "-", "izin"),
            RiwayatAbsenItem(20, "NURUL KHASANAH", "XII RPL 2", "13-Feb-2026", "-", "alfa"),
            RiwayatAbsenItem(21, "RACHEL ALUNA MEIZHA", "XII RPL 2", "13-Feb-2026", "07:15", "hadir"),
            RiwayatAbsenItem(22, "RAENA WESTI DHEANOFA H", "XII RPL 2", "13-Feb-2026", "07:20", "hadir"),
            RiwayatAbsenItem(23, "RAYHANUN", "XII RPL 2", "13-Feb-2026", "-", "alfa"),
            RiwayatAbsenItem(24, "RAYYAN DAFFA AL AFFANI", "XII RPL 2", "13-Feb-2026", "-", "izin"),
            RiwayatAbsenItem(25, "RHAMEYZHA ALEA C.P.E", "XII RPL 2", "13-Feb-2026", "-", "alfa"),
            RiwayatAbsenItem(26, "RHEISYA MAULIDDIVA PUTRI", "XII RPL 2", "13-Feb-2026", "07:15", "hadir"),
            RiwayatAbsenItem(27, "RHEYVAN RAMADHAN I.P", "XII RPL 2", "13-Feb-2026", "07:20", "hadir"),
            RiwayatAbsenItem(28, "RISKY RAMADHANI", "XII RPL 2", "13-Feb-2026", "07:25", "hadir"),
            RiwayatAbsenItem(29, "RITA AURA AGUSTINA", "XII RPL 2", "13-Feb-2026", "-", "izin"),
            RiwayatAbsenItem(30, "RIZKY RAMADHANI", "XII RPL 2", "13-Feb-2026", "-", "alfa"),
            RiwayatAbsenItem(13, "SA'IDHATUL HASANA", "XII RPL 2", "13-Feb-2026", "07:15", "hadir"),
            RiwayatAbsenItem(32, "SHISILIA ISMU PUTRI", "XII RPL 2", "13-Feb-2026", "07:20", "hadir"),
            RiwayatAbsenItem(33, "SUCI RAMADANI INDRIANSYAH", "XII RPL 2", "13-Feb-2026", "07:25", "hadir"),
            RiwayatAbsenItem(34, "TALITHA NUDIA RISMATULLAH", "XII RPL 2", "13-Feb-2026", "-", "izin"),

            ))
    }

    private fun setupRecyclerView() {
        try {
            recyclerRiwayat.layoutManager = LinearLayoutManager(this)
            recyclerRiwayat.setHasFixedSize(true)

            val adapter = RiwayatPengurusAdapter(riwayatList, object : OnItemClickListener {
                override fun onItemClick(mapel: String) {
                    showDetailPopup(mapel)
                }
            })
            recyclerRiwayat.adapter = adapter

        } catch (e: Exception) {
            Toast.makeText(this, "Error loading data", Toast.LENGTH_SHORT).show()
        }
    }

    private fun showDetailPopup(mapel: String) {
        val dialog = Dialog(this)
        val inflater = layoutInflater
        val dialogView = inflater.inflate(R.layout.pop_up_riwayat_kehadiran_siswa, null)

        val tvJudul = dialogView.findViewById<TextView>(R.id.tv_judul_popup)
        tvJudul.text = "Absensi $mapel"

        val rvSiswa = dialogView.findViewById<RecyclerView>(R.id.rv_riwayat_siswa)
        rvSiswa.layoutManager = LinearLayoutManager(this)
        rvSiswa.setHasFixedSize(true)

        val siswaListAsList: List<RiwayatAbsenItem> = siswaList.toList()
        val adapter = RiwayatAbsenAdapter(siswaListAsList)
        rvSiswa.adapter = adapter

        dialog.setContentView(dialogView)
        dialog.setCancelable(true)

        // INI YANG PERLU DIUBAH:
        // 1. Background dialog window jadi putih
        dialog.window?.setBackgroundDrawable(ColorDrawable(Color.WHITE))
        // 2. Hapus efek dim/darken background jika ada
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

        btnHome.setOnClickListener {
            navigateToDashboard()
        }

        btnAssignment.setOnClickListener {
            Toast.makeText(this, "Anda sudah di Riwayat Kehadiran Kelas (Pengurus)", Toast.LENGTH_SHORT).show()
        }

        textNavigasi.setOnClickListener {
            navigateToJadwalHarian()
        }
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
        intent.putExtra("IS_PENGURUS", isPengurus)
        startActivity(intent)
        finish()
        Toast.makeText(this, "Kembali ke Dashboard (Pengurus)", Toast.LENGTH_SHORT).show()
    }

    private fun navigateToJadwalHarian() {
        val intent = Intent(this, JadwalHarianSiswaActivity::class.java).apply {
            putExtra("IS_PENGURUS", true)
        }
        startActivity(intent)
        Toast.makeText(this, "Melihat Jadwal Harian", Toast.LENGTH_SHORT).show()
    }

    // ========== DATA CLASS LOCAL ==========
    data class RiwayatPengurusItem(
        val id: String,
        val mataPelajaran: String,
        val keterangan: String,
        val status: String
    )

    // ========== INTERFACE ==========
    interface OnItemClickListener {
        fun onItemClick(mapel: String)
    }

    // ========== ADAPTER ==========
    private inner class RiwayatPengurusAdapter(
        private val riwayatList: List<RiwayatPengurusItem>,
        private val listener: OnItemClickListener
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
                listener.onItemClick(riwayat.mataPelajaran)
            }
        }

        override fun getItemCount(): Int = riwayatList.size
    }
}