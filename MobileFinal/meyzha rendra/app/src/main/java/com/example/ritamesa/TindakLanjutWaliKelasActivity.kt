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

class TindakLanjutWaliKelasActivity : AppCompatActivity() {

    private lateinit var recyclerView: RecyclerView
    private lateinit var etSearchKelas: EditText
    private lateinit var adapter: SiswaTindakLanjutAdapter

    // Tombol navigasi footer
    private lateinit var btnHome: ImageButton
    private lateinit var btnCalendar: ImageButton
    private lateinit var btnChart: ImageButton
    private lateinit var btnNotif: ImageButton

    // Data siswa khusus kelas XII RPL 2
    private val allSiswaData = mutableListOf<Map<String, Any>>()
    private val filteredSiswaData = mutableListOf<Map<String, Any>>()
    private val totalSiswa = 25 // Total siswa di kelas XII RPL 2

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        try {
            setContentView(R.layout.tindak_lanjut_guru) // ✅ PAKAI LAYOUT YANG SAMA

            initViews()
            setupFooterNavigation()
            setupRecyclerView()
            generateDataKelasXIIRPL2()
            setupSearchFilter()

            Toast.makeText(this, "Tindak Lanjut Wali Kelas XII RPL 2 dimuat", Toast.LENGTH_SHORT).show()
        } catch (e: Exception) {
            Toast.makeText(this, "Error: ${e.message}", Toast.LENGTH_LONG).show()
            e.printStackTrace()
            finish()
        }
    }

    private fun initViews() {
        recyclerView = findViewById(R.id.rvSiswaAbsensi)
        etSearchKelas = findViewById(R.id.etSearchKelas)

        // Inisialisasi tombol navigasi footer
        btnHome = findViewById(R.id.btnHome)
        btnCalendar = findViewById(R.id.btnCalendar)
        btnChart = findViewById(R.id.btnChart)
        btnNotif = findViewById(R.id.btnNotif)
    }

    private fun setupFooterNavigation() {
        // ✅ NAVIGASI KHUSUS WALI KELAS
        btnHome.setOnClickListener {
            val intent = Intent(this, DashboardWaliKelasActivity::class.java)
            startActivity(intent)
        }

        btnCalendar.setOnClickListener {
            val intent = Intent(this, RiwayatKehadiranKelasActivity::class.java)
            startActivity(intent)
        }

        btnChart.setOnClickListener {
            refreshData()
            Toast.makeText(this, "Halaman Tindak Lanjut Wali Kelas", Toast.LENGTH_SHORT).show()
        }

        btnNotif.setOnClickListener {
            val intent = Intent(this, NotifikasiWaliKelasActivity::class.java)
            startActivity(intent)
        }
    }

    private fun refreshData() {
        generateDataKelasXIIRPL2()
        Toast.makeText(this, "Data Tindak Lanjut direfresh", Toast.LENGTH_SHORT).show()
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
            // Tampilkan hanya siswa yang bermasalah
            filteredSiswaData.addAll(allSiswaData.filter { it["showBadge"] as Boolean })
        } else {
            val lowerQuery = query.lowercase()
            // Filter berdasarkan query (nama ATAU kelas/jurusan) dan hanya yang bermasalah
            filteredSiswaData.addAll(allSiswaData.filter {
                val showBadge = it.getOrDefault("showBadge", true) as? Boolean ?: true
                if (!showBadge) return@filter false

                val nama = it.getOrDefault("nama", "") as String
                val kelasJurusan = it.getOrDefault("kelasJurusan", "") as String
                nama.lowercase().contains(lowerQuery) ||
                        kelasJurusan.lowercase().contains(lowerQuery)
            })
        }

        adapter.notifyDataSetChanged()
    }

    private fun generateDataKelasXIIRPL2() {
        allSiswaData.clear()

        // ✅ DATA KHUSUS KELAS XII RPL 2
        val namaSiswaKelas = listOf(
            "Rayhanun", "Saidatul Hasanah", "Nurul Khasanah", "Lely Sagita",
            "Noverita Pascalia", "Nindi Narita", "Rita Aura", "Raena Westi",
            "Abyl Gustian", "Ibnu Rafi", "Hadi Firmansyah", "Rayyan Dava",
            "Maya Melinda", "Niswatul Khoiriyah", "Reisya Maulidiva", "Novita Andriani",
            "Rizki Ramadhani", "Laura Lavidaloca", "Rhameizha Alea", "Novita Andriani",
            "Suci Ramadani", "Rachel Aluna", "Talitha Nudia", "Nadia Sinta",
            "Muh Wisnu"
        )

        // ✅ KONDISI KHUSUS KELAS XII RPL 2
        val kondisiSiswa = listOf(
            Triple(5, 2, 1),  // 1. Agus - Alpha 5, Izin 2, Sakit 1
            Triple(1, 0, 0),  // 2. Budi - Alpha 1
            Triple(0, 8, 0),  // 3. Cindy - Izin 8 (>5)
            Triple(0, 3, 2),  // 4. Dedi - Izin 3, Sakit 2
            Triple(0, 0, 0),  // 5. Eka - Aman total
            Triple(2, 0, 0),  // 6. Fajar - Alpha 2
            Triple(0, 6, 0),  // 7. Gita - Izin 6 (>5)
            Triple(0, 0, 1),  // 8. Hendra - Sakit 1 (aman)
            Triple(1, 1, 1),  // 9. Indah - Alpha 1, Izin 1, Sakit 1
            Triple(0, 0, 0),  // 10. Joko - Aman total
            Triple(0, 4, 0),  // 11. Kartika - Izin 4 (aman)
            Triple(3, 0, 1),  // 12. Lukman - Alpha 3, Sakit 1
            Triple(0, 10, 0), // 13. Maya - Izin 10 (>5)
            Triple(0, 0, 2),  // 14. Nurhayati - Sakit 2 (aman)
            Triple(2, 3, 0),  // 15. Oki - Alpha 2, Izin 3
            Triple(0, 1, 0),  // 16. Putri - Izin 1 (aman)
            Triple(4, 0, 0),  // 17. Rizki - Alpha 4
            Triple(0, 5, 1),  // 18. Sari - Izin 5 (aman), Sakit 1
            Triple(1, 0, 0),  // 19. Toni - Alpha 1
            Triple(0, 7, 0),  // 20. Umi - Izin 7 (>5)
            Triple(0, 0, 0),  // 21. Vina - Aman total
            Triple(0, 2, 1),  // 22. Wahyu - Izin 2, Sakit 1 (aman)
            Triple(2, 0, 0),  // 23. Yuni - Alpha 2
            Triple(0, 0, 1),  // 24. Zainal - Sakit 1 (aman)
            Triple(0, 9, 0)   // 25. Andi - Izin 9 (>5)
        )

        // Generate data untuk semua siswa di kelas XII RPL 2
        for (i in 0 until totalSiswa) {
            val nama = namaSiswaKelas.getOrNull(i) ?: "Siswa ${i+1}"
            val kelasJurusan = "XII RPL 2"
            val (alphaCount, izinCount, sakitCount) = kondisiSiswa[i]

            val badgeInfo = determineBadgeInfo(alphaCount, izinCount, sakitCount)

            allSiswaData.add(mapOf(
                "id" to i + 1,
                "nama" to nama,
                "kelasJurusan" to kelasJurusan,
                "alphaCount" to alphaCount,
                "izinCount" to izinCount,
                "sakitCount" to sakitCount,
                "badgeDrawable" to badgeInfo["drawable"] as Int,
                "badgeText" to badgeInfo["text"] as String,
                "showBadge" to badgeInfo["show"] as Boolean,
                "severityScore" to badgeInfo["severityScore"] as Int
            ))
        }

        // ✅ URUTKAN: Alpha terbanyak → Izin terbanyak → Sakit terbanyak
        allSiswaData.sortWith(
            compareByDescending<Map<String, Any>> { it["alphaCount"] as Int }
                .thenByDescending { it["izinCount"] as Int }
                .thenByDescending { it["sakitCount"] as Int }
        )

        filteredSiswaData.clear()
        // HANYA tampilkan siswa yang bermasalah (showBadge = true)
        filteredSiswaData.addAll(allSiswaData.filter { it["showBadge"] as Boolean })
        adapter.notifyDataSetChanged()

        val perluTindakLanjut = filteredSiswaData.size
        Toast.makeText(this, "Ditemukan $perluTindakLanjut siswa perlu ditindak lanjuti", Toast.LENGTH_SHORT).show()
    }

    private fun determineBadgeInfo(alpha: Int, izin: Int, sakit: Int): Map<String, Any> {
        val totalCount = alpha + izin + sakit

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
            totalCount > 0 -> mapOf(
                "drawable" to R.drawable.box_success,
                "text" to "Aman",
                "show" to false,
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