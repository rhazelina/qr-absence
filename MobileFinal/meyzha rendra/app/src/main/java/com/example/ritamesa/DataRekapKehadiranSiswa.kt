package com.example.ritamesa

import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.Gravity
import android.view.LayoutInflater
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import android.widget.PopupMenu
import android.content.Intent

class DataRekapkehadiranSiswa : AppCompatActivity() {

    private lateinit var rvSiswa: RecyclerView
    private lateinit var editTextSearch: EditText
    private lateinit var siswaAdapter: SiswaAdapterWaka
    private val allSiswaList = mutableListOf<Siswa>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.data_rekapkehadiran_siswa)

        rvSiswa = findViewById(R.id.rvKehadiran)
        editTextSearch = findViewById(R.id.editTextText5)

        setupNavigation()
        createSiswaData()
        setupRecyclerView()
        setupSearch()
        setupBackPressHandler()
    }

    private fun createSiswaData() {
        allSiswaList.clear()
        allSiswaList.addAll(listOf(
            Siswa(1, "Nindi Narita M", "0012345678", "XII RPL 2"),
            Siswa(2, "Lely Sagita", "0012345679", "XII RPL 2"),
            Siswa(3, "Noverita Pascalia R", "0012345680", "XII RPL 2"),
            Siswa(4, "Nurul Khasanah", "0012345681", "XII RPL 2"),
            Siswa(5, "Saidhatul Hasana", "0012345682", "XII RPL 2"),
            Siswa(6, "Rachel Aluna", "0012345683", "XII RPL 2"),
            Siswa(7, "Rayhanun", "0012345684", "XII RPL 2"),
            Siswa(8, "Fidatul Aviva", "0012345685", "XII RPL 1"),
            Siswa(9, "Novita Azzahra", "0012345686", "XII RPL 2"),
            Siswa(10, "Niswatul Khoiriyah", "0012345687", "XII RPL 2"),
            Siswa(11, "M. Hadi Firmansyah", "0012345688", "XII RPL 2"),
            Siswa(12, "Reyvan Ramadhan", "0012345689", "XII RPL 2"),
            Siswa(13, "M. Abyl Gustian", "0012345690", "XII RPL 2"),
            Siswa(14, "Talitha Nudia", "0012345691", "XII RPL 2"),
            Siswa(15, "Raena Westi", "0012345692", "XII RPL 2")
        ))
    }

    private fun setupRecyclerView() {
        rvSiswa.layoutManager = LinearLayoutManager(this)
        rvSiswa.setHasFixedSize(true)

        siswaAdapter = SiswaAdapterWaka(allSiswaList) { siswa ->
            showPopupDetailSiswa(siswa)
        }
        rvSiswa.adapter = siswaAdapter
    }

    private fun showPopupDetailSiswa(siswa: Siswa) {
        try {
            val inflater = LayoutInflater.from(this)
            val popupView = inflater.inflate(R.layout.popup_siswa_detail, null)

            popupView.findViewById<TextView>(R.id.tvPopupNama).text = siswa.nama
            popupView.findViewById<TextView>(R.id.tvPopupNisn).text = siswa.nisn
            popupView.findViewById<TextView>(R.id.tvPopupKelas).text = siswa.kelas

            val container = popupView.findViewById<LinearLayout>(R.id.containerKehadiran)
            setupDataKehadiranSiswa(container, siswa)

            val popupWindow = PopupWindow(
                popupView,
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT,
                true
            )

            popupWindow.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
            popupWindow.elevation = 20f
            popupWindow.isOutsideTouchable = true

            val btnTutup = popupView.findViewById<Button>(R.id.btnTutupPopup)
            btnTutup.setOnClickListener {
                popupWindow.dismiss()
            }

            popupWindow.showAtLocation(window.decorView.rootView, Gravity.CENTER, 0, 0)
        } catch (e: Exception) {
            e.printStackTrace()
            Toast.makeText(this, "Error: ${e.message}", Toast.LENGTH_SHORT).show()
        }
    }

    private fun setupDataKehadiranSiswa(container: LinearLayout, siswa: Siswa) {
        container.removeAllViews()

        siswa.getDataKehadiran().forEach { kehadiran ->
            val itemView = LayoutInflater.from(this)
                .inflate(R.layout.item_kehadiran_popup, container, false)

            itemView.findViewById<TextView>(R.id.tvTanggal).text = kehadiran.tanggal
            itemView.findViewById<TextView>(R.id.tvMapelKelas).text =
                "${kehadiran.mataPelajaran} / ${kehadiran.kelas}"
            itemView.findViewById<TextView>(R.id.tvJam).text = kehadiran.jam
            itemView.findViewById<TextView>(R.id.tvStatus).text = kehadiran.status
            itemView.findViewById<TextView>(R.id.tvKeterangan).text = kehadiran.keterangan

            val tvStatus = itemView.findViewById<TextView>(R.id.tvStatus)
            when (kehadiran.status.lowercase()) {
                "hadir" -> tvStatus.setTextColor(Color.parseColor("#4CAF50"))
                "sakit" -> tvStatus.setTextColor(Color.parseColor("#FF9800"))
                "izin" -> tvStatus.setTextColor(Color.parseColor("#2196F3"))
                "alfa" -> tvStatus.setTextColor(Color.parseColor("#F44336"))
            }

            container.addView(itemView)
        }
    }

    private fun setupSearch() {
        editTextSearch.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                filterData(s.toString().trim())
            }
            override fun afterTextChanged(s: Editable?) {}
        })

        val btnSearch = findViewById<ImageButton>(R.id.imageButton17)
        btnSearch.setOnClickListener {
            editTextSearch.text.clear()
            editTextSearch.requestFocus()
            resetAdapter()
            Toast.makeText(this, "Menampilkan semua data siswa", Toast.LENGTH_SHORT).show()
        }
    }

    private fun resetAdapter() {
        siswaAdapter = SiswaAdapterWaka(allSiswaList) { siswa ->
            showPopupDetailSiswa(siswa)
        }
        rvSiswa.adapter = siswaAdapter
    }

    private fun filterData(query: String) {
        val filteredList = if (query.isEmpty()) {
            allSiswaList
        } else {
            val lowercaseQuery = query.lowercase()
            allSiswaList.filter { siswa ->
                siswa.nama.lowercase().contains(lowercaseQuery) ||
                        siswa.nisn.lowercase().contains(lowercaseQuery) ||
                        siswa.kelas.lowercase().contains(lowercaseQuery)
            }
        }

        siswaAdapter = SiswaAdapterWaka(filteredList) { siswa ->
            showPopupDetailSiswa(siswa)
        }
        rvSiswa.adapter = siswaAdapter

        if (query.isNotEmpty() && filteredList.isEmpty()) {
            Toast.makeText(this, "Tidak ditemukan siswa dengan kata kunci '$query'", Toast.LENGTH_SHORT).show()
        }
    }

    private fun setupNavigation() {
        setupMoreVertButton()
        setupHomeButton()
        setupDataRekapButton()
        setupJadwalButton()
        setupStatistikButton()
        setupBackButton()
    }

    private fun setupBackButton() {
        val btnBack = findViewById<ImageButton>(R.id.btnBack)
        btnBack.setOnClickListener {
            navigateToDashboardWaka()
        }
    }

    // 🔥 PERBAIKAN UTAMA: Casting TextView -> ImageButton
    private fun setupMoreVertButton() {
        val btnMoreVert = findViewById<ImageButton>(R.id.imageButton5)
        btnMoreVert.setOnClickListener { view ->
            val popupMenu = PopupMenu(this, view)
            popupMenu.menuInflater.inflate(R.menu.menu_data_rekap, popupMenu.menu)

            popupMenu.setOnMenuItemClickListener { menuItem ->
                when (menuItem.itemId) {
                    R.id.menu_guru -> {
                        val intent = Intent(this, DataRekapKehadiranGuru::class.java)
                        startActivity(intent)
                        true
                    }
                    R.id.menu_siswa -> {
                        Toast.makeText(this, "Sudah di halaman Siswa", Toast.LENGTH_SHORT).show()
                        true
                    }
                    else -> false
                }
            }
            popupMenu.show()
        }
    }

    private fun setupHomeButton() {
        val btnHome = findViewById<ImageButton>(R.id.imageButton2)
        btnHome.setOnClickListener {
            navigateToDashboardWaka()
        }
    }

    private fun setupDataRekapButton() {
        val btnDataRekap = findViewById<ImageButton>(R.id.imageButton3)
        btnDataRekap.setOnClickListener {
            Toast.makeText(this, "Sudah di halaman Data Rekap", Toast.LENGTH_SHORT).show()
        }
    }

    private fun setupJadwalButton() {
        val btnJadwal = findViewById<ImageButton>(R.id.imageButton4)
        btnJadwal.setOnClickListener {
            try {
                val intent = Intent(this, JadwalPembelajaranGuru::class.java)
                startActivity(intent)
            } catch (e: Exception) {
                Toast.makeText(this, "Halaman Jadwal belum tersedia", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun setupStatistikButton() {
        // 🔥 PERBAIKAN: Menggunakan ID imageButton55 untuk navigation bar
        val btnStatistik = findViewById<ImageButton>(R.id.imageButton55)
        btnStatistik.setOnClickListener {
            try {
                val intent = Intent(this, StatistikWakaa::class.java)
                startActivity(intent)
            } catch (e: Exception) {
                Toast.makeText(this, "Halaman Statistik belum tersedia", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun setupBackPressHandler() {
        onBackPressedDispatcher.addCallback(this, object : androidx.activity.OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                navigateToDashboardWaka()
            }
        })
    }

    private fun navigateToDashboardWaka() {
        val intent = Intent(this, DashboardWaka::class.java)
        startActivity(intent)
        finish()
    }
}