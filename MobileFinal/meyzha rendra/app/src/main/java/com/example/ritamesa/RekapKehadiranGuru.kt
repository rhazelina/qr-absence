package com.example.ritamesa

import android.content.Intent
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView

class RekapKehadiranGuru : AppCompatActivity() {

    private lateinit var recyclerView: RecyclerView
    private lateinit var adapter: GuruAdapter
    private lateinit var editTextSearch: EditText
    private lateinit var btnBack: ImageButton
    private lateinit var btnMenu: ImageButton

    // ===== DATA GURU DARI CSV =====
    private val guruList = listOf(
        Guru("1", "TRIANA ARDIANI, S.Pd", "0918415784", "Wali Kelas - 12 Rekayasa Perangkat Lunak 2"),
        Guru("2", "SOLIKAH, S.Pd", "0918417765", "Guru Matematika"),
        Guru("3", "WIWIN WINANGSIH, S.Pd, M.Pd", "0918415785", "Guru Matematika"),
        Guru("4", "FAJAR NINGTYAS, S.Pd", "0918775542", "Guru Bahasa Inggris"),
        Guru("5", "Hj. TITIK MARIYATI, S.Pd", "0919765542", "Guru Bahasa Indonesia")
    )

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.rekap_kehadiran_guru)

        initView()
        setupRecyclerView()
        setupActions()
        setupBottomNavigation()
        setupSearch()
    }

    private fun initView() {
        recyclerView = findViewById(R.id.recyclerViewGuru)
        editTextSearch = findViewById(R.id.editTextText5)
        btnBack = findViewById(R.id.btnBack)
        btnMenu = findViewById(R.id.buttonmenu)
        editTextSearch.hint = "Cari nama guru / NIP / mapel"
    }

    private fun setupRecyclerView() {
        recyclerView.layoutManager = LinearLayoutManager(this)

        adapter = GuruAdapter(guruList) { guru ->
            showPopupDetailGuru(guru)
        }
        recyclerView.adapter = adapter
    }

    private fun showPopupDetailGuru(guru: Guru) {
        val inflater = LayoutInflater.from(this)
        val popupView = inflater.inflate(R.layout.popup_guru_detail, null)

        // Set data guru
        popupView.findViewById<TextView>(R.id.tvPopupNama).text = guru.nama
        popupView.findViewById<TextView>(R.id.tvPopupNip).text = guru.nip
        popupView.findViewById<TextView>(R.id.tvPopupMapel).text = guru.mataPelajaran

        val container = popupView.findViewById<LinearLayout>(R.id.containerKehadiran)
        setupDataKehadiranGuru(container, guru)

        val popupWindow = PopupWindow(
            popupView,
            LinearLayout.LayoutParams.WRAP_CONTENT,
            LinearLayout.LayoutParams.WRAP_CONTENT,
            true
        )

        popupWindow.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
        popupWindow.elevation = 20f
        popupWindow.isOutsideTouchable = true

        val popupContainer = popupView.findViewById<View>(R.id.popupContainer)
        popupContainer.alpha = 0.95f

        popupView.findViewById<Button>(R.id.btnTutupPopup).setOnClickListener {
            popupWindow.dismiss()
        }

        val backgroundView = View(this)
        backgroundView.setBackgroundColor(Color.parseColor("#80000000"))
        val rootView = window.decorView.rootView as ViewGroup
        rootView.addView(backgroundView)

        popupWindow.showAtLocation(window.decorView.rootView, android.view.Gravity.CENTER, 0, 0)

        popupWindow.setOnDismissListener {
            rootView.removeView(backgroundView)
        }
    }

    private fun setupDataKehadiranGuru(container: LinearLayout, guru: Guru) {
        container.removeAllViews()

        getGuruKehadiranData(guru).forEach { kehadiran ->
            val itemView = LayoutInflater.from(this)
                .inflate(R.layout.item_kehadiran_popup, container, false)

            itemView.findViewById<TextView>(R.id.tvTanggal).text = kehadiran.tanggal
            itemView.findViewById<TextView>(R.id.tvMapelKelas).text = kehadiran.mataPelajaranKelas
            itemView.findViewById<TextView>(R.id.tvJam).text = kehadiran.jam
            itemView.findViewById<TextView>(R.id.tvStatus).text = kehadiran.status
            itemView.findViewById<TextView>(R.id.tvKeterangan).text = kehadiran.keterangan

            val tvStatus = itemView.findViewById<TextView>(R.id.tvStatus)
            when (kehadiran.status.lowercase()) {
                "hadir" -> tvStatus.setTextColor(Color.parseColor("#4CAF50"))
                "sakit" -> tvStatus.setTextColor(Color.parseColor("#FF9800"))
                "izin" -> tvStatus.setTextColor(Color.parseColor("#2196F3"))
                "alpha" -> tvStatus.setTextColor(Color.parseColor("#F44336"))
                "terlambat" -> tvStatus.setTextColor(Color.parseColor("#FF9800"))
            }

            container.addView(itemView)
        }
    }

    private fun getGuruKehadiranData(guru: Guru): List<KehadiranGuru> {
        return when (guru.nomor) {
            "1" -> listOf( // TRIANA ARDIANI - Wali Kelas 12 RPL 2
                KehadiranGuru("Senin, 10 Februari 2026", "Wali Kelas / XII RPL 2", "07:00 - 08:30", "Hadir", "Pendampingan kelas"),
                KehadiranGuru("Selasa, 11 Februari 2026", "Wali Kelas / XII RPL 2", "08:45 - 10:15", "Hadir", "Rapat wali kelas"),
                KehadiranGuru("Rabu, 12 Februari 2026", "Wali Kelas / XII RPL 2", "10:30 - 12:00", "Izin", "Izin dinas luar"),
                KehadiranGuru("Kamis, 13 Februari 2026", "Wali Kelas / XII RPL 2", "07:00 - 08:30", "Hadir", "Pendampingan kelas"),
                KehadiranGuru("Jumat, 14 Februari 2026", "Wali Kelas / XII RPL 2", "13:15 - 14:45", "Hadir", "Evaluasi siswa")
            )
            "2" -> listOf( // SOLIKAH - Matematika
                KehadiranGuru("Senin, 10 Februari 2026", "Matematika / XI RPL 1", "07:00 - 08:30", "Hadir", "Mengajar sesuai jadwal"),
                KehadiranGuru("Selasa, 11 Februari 2026", "Matematika / XI RPL 2", "08:45 - 10:15", "Hadir", "Mengajar dengan baik"),
                KehadiranGuru("Rabu, 12 Februari 2026", "Matematika / X RPL 1", "10:30 - 12:00", "Sakit", "Izin sakit"),
                KehadiranGuru("Kamis, 13 Februari 2026", "Matematika / X RPL 2", "07:00 - 08:30", "Hadir", "Mengajar sesuai jadwal"),
                KehadiranGuru("Jumat, 14 Februari 2026", "Matematika / XI RPL 1", "13:15 - 14:45", "Hadir", "Remedial siswa")
            )
            "3" -> listOf( // WIWIN WINANGSIH - Matematika
                KehadiranGuru("Senin, 10 Februari 2026", "Matematika / XII RPL 1", "08:45 - 10:15", "Hadir", "Mengajar sesuai jadwal"),
                KehadiranGuru("Selasa, 11 Februari 2026", "Matematika / XII RPL 2", "10:30 - 12:00", "Hadir", "Mengajar dengan baik"),
                KehadiranGuru("Rabu, 12 Februari 2026", "Matematika / XI RPL 1", "07:00 - 08:30", "Hadir", "Mengajar sesuai jadwal"),
                KehadiranGuru("Kamis, 13 Februari 2026", "Matematika / XI RPL 2", "13:15 - 14:45", "Terlambat", "Terlambat 15 menit"),
                KehadiranGuru("Jumat, 14 Februari 2026", "Matematika / X RPL 1", "08:45 - 10:15", "Hadir", "Mengajar dengan baik")
            )
            "4" -> listOf( // FAJAR NINGTYAS - Bahasa Inggris
                KehadiranGuru("Senin, 10 Februari 2026", "Bahasa Inggris / XII RPL 1", "10:30 - 12:00", "Hadir", "Mengajar sesuai jadwal"),
                KehadiranGuru("Selasa, 11 Februari 2026", "Bahasa Inggris / XII RPL 2", "13:15 - 14:45", "Hadir", "Mengajar dengan baik"),
                KehadiranGuru("Rabu, 12 Februari 2026", "Bahasa Inggris / XI RPL 1", "07:00 - 08:30", "Izin", "Izin pelatihan"),
                KehadiranGuru("Kamis, 13 Februari 2026", "Bahasa Inggris / XI RPL 2", "08:45 - 10:15", "Hadir", "Mengajar sesuai jadwal"),
                KehadiranGuru("Jumat, 14 Februari 2026", "Bahasa Inggris / X RPL 1", "10:30 - 12:00", "Hadir", "Mengajar dengan baik")
            )
            "5" -> listOf( // Hj. TITIK MARIYATI - Bahasa Indonesia
                KehadiranGuru("Senin, 10 Februari 2026", "Bahasa Indonesia / XII RPL 1", "13:15 - 14:45", "Hadir", "Mengajar sesuai jadwal"),
                KehadiranGuru("Selasa, 11 Februari 2026", "Bahasa Indonesia / XII RPL 2", "07:00 - 08:30", "Hadir", "Mengajar dengan baik"),
                KehadiranGuru("Rabu, 12 Februari 2026", "Bahasa Indonesia / XI RPL 1", "08:45 - 10:15", "Hadir", "Mengajar sesuai jadwal"),
                KehadiranGuru("Kamis, 13 Februari 2026", "Bahasa Indonesia / XI RPL 2", "10:30 - 12:00", "Hadir", "Mengajar dengan baik"),
                KehadiranGuru("Jumat, 14 Februari 2026", "Bahasa Indonesia / X RPL 1", "07:00 - 08:30", "Alpha", "Tidak hadir tanpa keterangan")
            )
            else -> listOf(
                KehadiranGuru("Senin, 10 Februari 2026", "${guru.mataPelajaran} / XII RPL 1", "07:00 - 08:30", "Hadir", "Mengajar sesuai jadwal"),
                KehadiranGuru("Selasa, 11 Februari 2026", "${guru.mataPelajaran} / XII RPL 2", "08:45 - 10:15", "Hadir", "Mengajar dengan baik"),
                KehadiranGuru("Rabu, 12 Februari 2026", "${guru.mataPelajaran} / XI RPL 1", "10:30 - 12:00", "Hadir", "Mengajar sesuai jadwal"),
                KehadiranGuru("Kamis, 13 Februari 2026", "${guru.mataPelajaran} / XI RPL 2", "13:15 - 14:45", "Hadir", "Mengajar sesuai jadwal"),
                KehadiranGuru("Jumat, 14 Februari 2026", "${guru.mataPelajaran} / X RPL 1", "07:00 - 08:30", "Hadir", "Mengajar dengan baik")
            )
        }
    }

    private fun setupActions() {
        btnBack.setOnClickListener {
            finish()
        }

        btnMenu.setOnClickListener {
            showPopupMenu(it)
        }
    }

    private fun setupSearch() {
        editTextSearch.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}

            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                performSearch(s.toString().trim())
            }

            override fun afterTextChanged(s: Editable?) {}
        })

        findViewById<ImageButton>(R.id.imageButton17).setOnClickListener {
            editTextSearch.text.clear()
            editTextSearch.requestFocus()
            adapter.filter("")
            Toast.makeText(this, "Menampilkan semua data guru", Toast.LENGTH_SHORT).show()
        }
    }

    private fun performSearch(query: String) {
        adapter.filter(query)

        if (query.isNotEmpty() && adapter.itemCount == 0) {
            Toast.makeText(this, "Tidak ditemukan guru dengan kata kunci '$query'", Toast.LENGTH_SHORT).show()
        }
    }

    private fun showPopupMenu(view: View) {
        val popup = PopupMenu(this, view)
        popup.menuInflater.inflate(R.menu.menu_rekap_switch, popup.menu)

        popup.setOnMenuItemClickListener { menuItem ->
            when (menuItem.itemId) {
                R.id.menu_guru -> {
                    Toast.makeText(this, "Sudah di halaman Guru", Toast.LENGTH_SHORT).show()
                    true
                }
                R.id.menu_siswa -> {
                    val intent = Intent(this, RekapKehadiranSiswa::class.java)
                    startActivity(intent)
                    finish()
                    true
                }
                else -> false
            }
        }
        popup.show()
    }

    private fun setupBottomNavigation() {
        findViewById<ImageButton>(R.id.imageButton2).setOnClickListener {
            val intent = Intent(this, Dashboard::class.java)
            startActivity(intent)
            finish()
        }

        findViewById<ImageButton>(R.id.imageButton3).setOnClickListener {
            val intent = Intent(this, RekapKehadiranSiswa::class.java)
            startActivity(intent)
            finish()
        }

        findViewById<ImageButton>(R.id.imageButton5).setOnClickListener {
            val intent = Intent(this, StatistikKehadiran::class.java)
            startActivity(intent)
            finish()
        }
    }

    // Data class untuk guru
    data class Guru(
        val nomor: String,
        val nama: String,
        val nip: String,
        val mataPelajaran: String
    )

    // Data class untuk kehadiran guru
    data class KehadiranGuru(
        val tanggal: String,
        val mataPelajaranKelas: String,
        val jam: String,
        val status: String,
        val keterangan: String
    )

    // ===== ADAPTER YANG SESUAI DENGAN XML item_rekap_guru.xml =====
    class GuruAdapter(
        private var guruList: List<Guru>,
        private val onLihatClickListener: (Guru) -> Unit
    ) : RecyclerView.Adapter<GuruAdapter.GuruViewHolder>() {

        private var filteredList: List<Guru> = guruList

        inner class GuruViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
            val tvNo: TextView = itemView.findViewById(R.id.tvNo)
            val tvNamaGuru: TextView = itemView.findViewById(R.id.tvNamaGuru)
            val tvNIP: TextView = itemView.findViewById(R.id.tvNIP)
            val tvMapel: TextView = itemView.findViewById(R.id.tvMapel)
            val btnLihat: ImageButton = itemView.findViewById(R.id.btnLihat)

            init {
                btnLihat.setOnClickListener {
                    val position = adapterPosition
                    if (position != RecyclerView.NO_POSITION) {
                        onLihatClickListener(filteredList[position])
                    }
                }
            }
        }

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): GuruViewHolder {
            val view = LayoutInflater.from(parent.context)
                .inflate(R.layout.item_rekap_guru, parent, false)
            return GuruViewHolder(view)
        }

        override fun onBindViewHolder(holder: GuruViewHolder, position: Int) {
            val guru = filteredList[position]
            holder.tvNo.text = guru.nomor
            holder.tvNamaGuru.text = guru.nama
            holder.tvNIP.text = guru.nip
            holder.tvMapel.text = guru.mataPelajaran
        }

        override fun getItemCount(): Int = filteredList.size

        fun filter(query: String) {
            filteredList = if (query.isEmpty()) {
                guruList
            } else {
                val lowercaseQuery = query.lowercase()
                guruList.filter {
                    it.nama.lowercase().contains(lowercaseQuery) ||
                            it.nip.contains(query) ||
                            it.mataPelajaran.lowercase().contains(lowercaseQuery)
                }
            }
            notifyDataSetChanged()
        }
    }
}