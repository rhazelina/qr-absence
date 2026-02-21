package com.example.ritamesa

import android.content.Intent
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.widget.EditText
import android.widget.ImageButton
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView

class TindakLanjutGuruActivity : AppCompatActivity() {

    private lateinit var recyclerView: RecyclerView
    private lateinit var etSearchKelas: EditText
    private lateinit var adapter: SiswaTindakLanjutAdapter

    private lateinit var btnHome: ImageButton
    private lateinit var btnCalendar: ImageButton
    private lateinit var btnChart: ImageButton
    private lateinit var btnNotif: ImageButton

    private val allSiswaData = mutableListOf<Map<String, Any>>()
    private val filteredSiswaData = mutableListOf<Map<String, Any>>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.tindak_lanjut_guru)

        initViews()
        setupFooterNavigation()
        setupRecyclerView()
        generateDummyDataRPL()
        setupSearchFilter()
    }

    private fun initViews() {
        recyclerView = findViewById(R.id.rvSiswaAbsensi)
        etSearchKelas = findViewById(R.id.etSearchKelas)
        btnHome = findViewById(R.id.btnHome)
        btnCalendar = findViewById(R.id.btnCalendar)
        btnChart = findViewById(R.id.btnChart)
        btnNotif = findViewById(R.id.btnNotif)
    }

    private fun setupFooterNavigation() {
        btnHome.setOnClickListener {
            startActivity(Intent(this, DashboardGuruActivity::class.java))
        }
        btnCalendar.setOnClickListener {
            startActivity(Intent(this, RiwayatKehadiranGuruActivity::class.java))
        }
        btnChart.setOnClickListener {
            generateDummyDataRPL()
            Toast.makeText(this, "Data Tindak Lanjut direfresh", Toast.LENGTH_SHORT).show()
        }
        btnNotif.setOnClickListener {
            startActivity(Intent(this, NotifikasiGuruActivity::class.java))
        }
    }

    private fun setupRecyclerView() {
        adapter = SiswaTindakLanjutAdapter(filteredSiswaData)
        recyclerView.layoutManager = LinearLayoutManager(this)
        recyclerView.adapter = adapter
    }

    private fun setupSearchFilter() {
        etSearchKelas.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                filterData(s.toString())
            }
        })
    }

    private fun filterData(query: String) {
        filteredSiswaData.clear()

        if (query.isEmpty()) {
            filteredSiswaData.addAll(allSiswaData.filter { it["showBadge"] as Boolean })
        } else {
            val lowerQuery = query.lowercase()
            filteredSiswaData.addAll(allSiswaData.filter {
                val showBadge = it["showBadge"] as? Boolean ?: true
                if (!showBadge) return@filter false

                val nama = it["nama"] as String
                val kelasJurusan = it["kelasJurusan"] as String
                nama.lowercase().contains(lowerQuery) ||
                        kelasJurusan.lowercase().contains(lowerQuery)
            })
        }
        adapter.notifyDataSetChanged()
    }

    // ============= DATA DUMMY SISWA RPL =============
    private fun generateDummyDataRPL() {
        allSiswaData.clear()

        // Nama siswa RPL
        val namaSiswaRPL = listOf(
            "Ahmad Fauzi", "Budi Santoso", "Citra Dewi", "Dian Pratama",
            "Eko Prasetyo", "Fitriani", "Gunawan", "Hendra Wijaya",
            "Indah Permata", "Joko Susilo", "Kartika Sari", "Lukman Hakim",
            "Maya Indah", "Nurhayati", "Oktaviani", "Puji Astuti",
            "Rahmat Hidayat", "Siti Aisyah", "Teguh Wijaya", "Umar Said",
            "Vina Melati", "Wahyu Ramadhan", "Yuniarti", "Zainal Abidin"
        )

        // Kelas RPL sesuai guru
        val kelasRPL = listOf(
            "XII RPL 2", "XII RPL 1",
            "XI RPL 1", "XI RPL 2", "XI RPL 3",
            "X RPL 1", "X RPL 2"
        )

        // Generate 24 siswa
        for (i in 0 until 24) {
            val nama = namaSiswaRPL[i]
            val kelasJurusan = kelasRPL[i % kelasRPL.size]

            // Distribusi untuk testing
            val alphaCount = when (i % 7) {
                0, 1, 2 -> 0
                3 -> 1
                4 -> 2
                5 -> 3
                6 -> 0
                else -> 0
            }

            val izinCount = when (i % 5) {
                0 -> 0
                1 -> 2
                2 -> 4
                3 -> 7
                4 -> 1
                else -> 0
            }

            val sakitCount = when (i % 4) {
                0 -> 0
                1 -> 1
                2 -> 2
                3 -> 0
                else -> 0
            }

            val badgeInfo = determineBadgeInfo(alphaCount, izinCount, sakitCount)

            allSiswaData.add(mapOf(
                "id" to i + 1,
                "nama" to nama,
                "kelasJurusan" to kelasJurusan,
                "alphaCount" to alphaCount,
                "izinCount" to izinCount,
                "sakitCount" to sakitCount,
                "badgeDrawable" to (badgeInfo["drawable"] as Int),
                "badgeText" to (badgeInfo["text"] as String),
                "showBadge" to (badgeInfo["show"] as Boolean),
                "severityScore" to (badgeInfo["severityScore"] as Int)
            ))
        }

        // Urutkan berdasarkan severity
        allSiswaData.sortByDescending { it["severityScore"] as Int }

        filteredSiswaData.clear()
        filteredSiswaData.addAll(allSiswaData.filter { it["showBadge"] as Boolean })
        adapter.notifyDataSetChanged()
    }

    private fun determineBadgeInfo(alpha: Int, izin: Int, sakit: Int): Map<String, Any> {
        return when {
            alpha >= 1 -> mapOf(
                "drawable" to R.drawable.box_danger,
                "text" to "Sering Absensi",
                "show" to true,
                "severityScore" to (alpha * 100 + izin * 10 + sakit)
            )
            izin > 5 -> mapOf(
                "drawable" to R.drawable.box_warning,
                "text" to "Perlu Diperhatikan",
                "show" to true,
                "severityScore" to (alpha * 100 + izin * 10 + sakit)
            )
            else -> mapOf(
                "drawable" to R.drawable.box_success,
                "text" to "Aman",
                "show" to false,
                "severityScore" to 0
            )
        }
    }
}