package com.example.ritamesa

import android.content.Intent
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.widget.EditText
import android.widget.ImageButton
import android.widget.Toast
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import kotlinx.coroutines.launch

class TindakLanjutGuruActivity : BaseNetworkActivity() {
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
        setupRecyclerView()
        loadFollowUpDataFromApi()
        setupFooterNavigation()
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
            loadFollowUpDataFromApi()
            Toast.makeText(this, "Data Tindak Lanjut direfresh", Toast.LENGTH_SHORT).show()
        }
        btnNotif.setOnClickListener {
            startActivity(Intent(this, NotifikasiGuruActivity::class.java))
        }
    }

    private fun loadFollowUpDataFromApi() {
        lifecycleScope.launch {
            try {
                val result = teacherRepository.getStudentsFollowUp()
                handleResult(result,
                    onSuccess = { students ->
                        allSiswaData.clear()
                        students.forEach { student ->
                            val alphaCount = student.absenceCount ?: 0
                            val izinCount = 0 // API may not have separate values, use absence for now
                            val sakitCount = 0
                            val badgeInfo = determineBadgeInfo(alphaCount, izinCount, sakitCount)
                            
                            allSiswaData.add(mapOf(
                                "id" to (student.studentId ?: 0),
                                "nama" to (student.studentName ?: "-"),
                                "kelasJurusan" to (student.nisn ?: "-"),
                                "alphaCount" to alphaCount,
                                "izinCount" to izinCount,
                                "sakitCount" to sakitCount,
                                "badgeDrawable" to (badgeInfo["drawable"] as Int),
                                "badgeText" to (badgeInfo["text"] as String),
                                "showBadge" to (badgeInfo["show"] as Boolean),
                                "severityScore" to (badgeInfo["severityScore"] as Int)
                            ))
                        }
                        allSiswaData.sortByDescending { it["severityScore"] as Int }
                        filteredSiswaData.clear()
                        filteredSiswaData.addAll(allSiswaData.filter { it["showBadge"] as Boolean })
                        adapter.notifyDataSetChanged()
                    },
                    onError = { _, msg ->
                        showError(msg ?: "Gagal memuat data tindak lanjut")
                        allSiswaData.clear()
                        filteredSiswaData.clear()
                        adapter.notifyDataSetChanged()
                    }
                )
            } catch (e: Exception) {
                showError("Error: ${e.message}")
            }
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