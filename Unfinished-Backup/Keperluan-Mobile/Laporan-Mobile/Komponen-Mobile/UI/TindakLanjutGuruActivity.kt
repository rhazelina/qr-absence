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
import com.example.ritamesa.api.models.StudentFollowUpUiModel
import kotlinx.coroutines.launch

class TindakLanjutGuruActivity : BaseNetworkActivity() {
    private lateinit var recyclerView: RecyclerView
    private lateinit var etSearchKelas: EditText
    private lateinit var adapter: SiswaTindakLanjutAdapter

    private lateinit var btnHome: ImageButton
    private lateinit var btnCalendar: ImageButton
    private lateinit var btnChart: ImageButton
    private lateinit var btnNotif: ImageButton

    private val allSiswaData = mutableListOf<StudentFollowUpUiModel>()
    private val filteredSiswaData = mutableListOf<StudentFollowUpUiModel>()

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
            // Refresh data dari API
            loadFollowUpDataFromApi()
            Toast.makeText(this, "Memuat ulang data tindak lanjut...", Toast.LENGTH_SHORT).show()
        }
        btnNotif.setOnClickListener {
            startActivity(Intent(this, NotifikasiGuruActivity::class.java))
        }
    }

    private fun loadFollowUpDataFromApi() {
        lifecycleScope.launch {
            try {
                val result = teacherRepository.getStudentsFollowUpUiModels(problemOnly = true)
                handleResult(result,
                    onSuccess = { students: List<StudentFollowUpUiModel> ->
                        allSiswaData.clear()
                        allSiswaData.addAll(students)
                        filteredSiswaData.clear()
                        filteredSiswaData.addAll(allSiswaData)
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
            filteredSiswaData.addAll(allSiswaData)
        } else {
            val lowerQuery = query.lowercase()
            filteredSiswaData.addAll(
                allSiswaData.filter { siswa ->
                    siswa.studentName.lowercase().contains(lowerQuery) ||
                            siswa.classLabel.lowercase().contains(lowerQuery)
                }
            )
        }

        adapter.notifyDataSetChanged()
    }
}
