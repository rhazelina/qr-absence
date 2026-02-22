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
import com.example.ritamesa.model.Guru
import android.content.Intent
import android.widget.PopupMenu

class DataRekapKehadiranGuru : AppCompatActivity() {

    private lateinit var recyclerView: RecyclerView
    private lateinit var editTextSearch: EditText
    private lateinit var adapter: GuruAdapterWaka
    private val allGuruList = mutableListOf<Guru>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.data_rekapkehadiran_guru)

        // 🔥 PERBAIKAN: ID diganti dari rvSiswa menjadi rvGuru
        recyclerView = findViewById(R.id.rvGuru)
        editTextSearch = findViewById(R.id.editTextText)

        setupAllNavigation()
        createGuruData()
        setupRecyclerView()
        setupSearch()
        setupBackPressHandler()
    }

    private fun createGuruData() {
        allGuruList.clear()
        allGuruList.addAll(listOf(
            Guru("Wiwin Winangsih", "2006041001", "Matematika"),
            Guru("Zulkifli Abdillah", "2001121002", "MPKK"),
            Guru("Devi Arveni", "2012052003", "Bhs. Indonesia"),
            Guru("RR Hening", "1987031004", "MPKK"),
            Guru("Ewit Irniyah", "2005012005", "MPP"),
            Guru("Fajar Ningtiyas", "2010082006", "Bhs. Inggris"),
            Guru("Samaodin", "2015031007", "PKN"),
            Guru("Moch. Bachrudin", "2017082008", "Bhs. Jawa"),
            Guru("Roudhotul Husna", "2009041009", "BK"),
            ))
    }

    private fun setupRecyclerView() {
        recyclerView.layoutManager = LinearLayoutManager(this)
        recyclerView.setHasFixedSize(true)

        adapter = GuruAdapterWaka(allGuruList) { guru ->
            showPopupDetailGuru(guru)
        }
        recyclerView.adapter = adapter
    }

    private fun showPopupDetailGuru(guru: Guru) {
        try {
            val inflater = LayoutInflater.from(this)
            val popupView = inflater.inflate(R.layout.popup_guru_detail, null)

            popupView.findViewById<TextView>(R.id.tvPopupNama).text = guru.nama
            popupView.findViewById<TextView>(R.id.tvPopupNip).text = guru.nip
            popupView.findViewById<TextView>(R.id.tvPopupMapel).text = guru.mataPelajaran

            val container = popupView.findViewById<LinearLayout>(R.id.containerKehadiran)
            setupDataKehadiran(container, guru)

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

    private fun setupDataKehadiran(container: LinearLayout, guru: Guru) {
        container.removeAllViews()

        guru.getDataKehadiran().forEach { kehadiran ->
            val itemView = LayoutInflater.from(this)
                .inflate(R.layout.item_kehadiran_popup, container, false)

            itemView.findViewById<TextView>(R.id.tvTanggal).text = kehadiran.tanggal
            itemView.findViewById<TextView>(R.id.tvMapelKelas).text =
                "${kehadiran.mataPelajaran} / Kelas ${kehadiran.kelas}"
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

        val btnClear = findViewById<ImageButton>(R.id.imageButton12)
        btnClear.setOnClickListener {
            editTextSearch.text.clear()
            editTextSearch.requestFocus()
            resetAdapter()
            Toast.makeText(this, "Menampilkan semua data", Toast.LENGTH_SHORT).show()
        }
    }

    private fun resetAdapter() {
        adapter = GuruAdapterWaka(allGuruList) { guru ->
            showPopupDetailGuru(guru)
        }
        recyclerView.adapter = adapter
    }

    private fun filterData(query: String) {
        val filteredList = if (query.isEmpty()) {
            allGuruList
        } else {
            val lowercaseQuery = query.lowercase()
            allGuruList.filter { guru ->
                guru.nama.lowercase().contains(lowercaseQuery) ||
                        guru.nip.lowercase().contains(lowercaseQuery) ||
                        guru.mataPelajaran.lowercase().contains(lowercaseQuery)
            }
        }

        adapter = GuruAdapterWaka(filteredList) { guru ->
            showPopupDetailGuru(guru)
        }
        recyclerView.adapter = adapter

        if (query.isNotEmpty() && filteredList.isEmpty()) {
            Toast.makeText(this, "Tidak ditemukan guru dengan kata kunci '$query'", Toast.LENGTH_SHORT).show()
        }
    }

    private fun setupAllNavigation() {
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

    private fun setupMoreVertButton() {
        val btnMoreVert = findViewById<ImageButton>(R.id.imageButton20)
        btnMoreVert.setOnClickListener { view ->
            val popupMenu = PopupMenu(this, view)
            popupMenu.menuInflater.inflate(R.menu.menu_data_rekap, popupMenu.menu)

            popupMenu.setOnMenuItemClickListener { menuItem ->
                when (menuItem.itemId) {
                    R.id.menu_guru -> {
                        Toast.makeText(this, "Sudah di halaman Guru", Toast.LENGTH_SHORT).show()
                        true
                    }
                    R.id.menu_siswa -> {
                        val intent = Intent(this, DataRekapkehadiranSiswa::class.java)
                        startActivity(intent)
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
        val btnStatistik = findViewById<ImageButton>(R.id.imageButton5)
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