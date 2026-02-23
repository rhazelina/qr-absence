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
import com.example.ritamesa.api.models.StudentFollowUp
import kotlinx.coroutines.launch

class TindakLanjutWaliKelasActivity : BaseNetworkActivity() {
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
        startActivity(Intent(this, WaliKelasNavigationActivity::class.java))
        finish()
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
        loadFollowUpDataForClassFromApi()
        Toast.makeText(this, "Data Tindak Lanjut direfresh", Toast.LENGTH_SHORT).show()
    }

    private fun loadFollowUpDataForClassFromApi() {
        lifecycleScope.launch {
            try {
                val result = teacherRepository.getStudentsFollowUp()
                handleResult(result,
                    onSuccess = { students: List<StudentFollowUp> ->
                        allSiswaData.clear()
                        students.forEach { student: StudentFollowUp ->
                            val alphaCount = student.absenceCount ?: 0
                            val izinCount = 0
                            val sakitCount = 0
                            val badgeInfo = determineBadgeInfo(alphaCount, izinCount, sakitCount)
                            
                            allSiswaData.add(mapOf(
                                "id" to (student.studentId ?: 0),
                                "nama" to (student.studentName ?: "-"),
                                "kelasJurusan" to ("-"),
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