package com.example.ritamesa

import android.app.AlertDialog
import android.content.Intent
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.LayoutInflater
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.EditText
import android.widget.ImageButton
import android.widget.Spinner
import android.widget.Toast
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.ritamesa.api.models.StudentFollowUpUiModel
import com.example.ritamesa.api.models.StudentResource
import com.google.android.material.floatingactionbutton.FloatingActionButton
import kotlinx.coroutines.launch

class TindakLanjutWaliKelasActivity : BaseNetworkActivity() {
    private lateinit var recyclerView: RecyclerView
    private lateinit var etSearchKelas: EditText
    private lateinit var adapter: SiswaTindakLanjutAdapter
    private lateinit var btnHome: ImageButton
    private lateinit var btnCalendar: ImageButton
    private lateinit var btnChart: ImageButton
    private lateinit var fabAddFollowUp: FloatingActionButton

    private val allSiswaData = mutableListOf<StudentFollowUpUiModel>()
    private val filteredSiswaData = mutableListOf<StudentFollowUpUiModel>()
    private val homeroomStudents = mutableListOf<StudentResource>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.tindak_lanjut_guru)

        initViews()
        setupRecyclerView()
        setupSearchFilter()
        setupFooterNavigation()
        loadFollowUpDataForClassFromApi()
        loadHomeroomStudentsForDialog()
        setupFab()
    }

    private fun initViews() {
        recyclerView = findViewById(R.id.rvSiswaAbsensi)
        etSearchKelas = findViewById(R.id.etSearchKelas)
        btnHome = findViewById(R.id.btnHome)
        btnCalendar = findViewById(R.id.btnCalendar)
        btnChart = findViewById(R.id.btnChart)
//        fabAddFollowUp = findViewById(R.id.fabAddFollowUp)
    }

    private fun setupFab() {
        fabAddFollowUp.setOnClickListener { showTambahTindakLanjutDialog() }
    }

    private fun loadHomeroomStudentsForDialog() {
        lifecycleScope.launch {
            try {
                val result = teacherRepository.getMyHomeroomStudents()
                handleResult(result,
                    onSuccess = { students: List<StudentResource> ->
                        homeroomStudents.clear()
                        homeroomStudents.addAll(students)
                    },
                    onError = { _, msg ->
                        android.util.Log.w("TindakLanjutWakel", "Gagal muat siswa homeroom: $msg")
                    }
                )
            } catch (e: Exception) {
                android.util.Log.e("TindakLanjutWakel", "loadHomeroomStudentsForDialog error: ${e.message}", e)
            }
        }
    }

    private fun showTambahTindakLanjutDialog() {
        try {
            val dialogView = LayoutInflater.from(this)
                .inflate(R.layout.dialog_tambah_tindak_lanjut, null)

            val spinnerSiswa = dialogView.findViewById<Spinner>(R.id.spinner_siswa)
            val etCatatan = dialogView.findViewById<EditText>(R.id.et_catatan_follow_up)
            val etAksi = dialogView.findViewById<EditText>(R.id.et_aksi_follow_up)
            val btnBatal = dialogView.findViewById<Button>(R.id.btn_batal_follow_up)
            val btnSimpan = dialogView.findViewById<Button>(R.id.btn_simpan_follow_up)

            val studentNames = homeroomStudents.map { it.name ?: "Siswa Tidak Diketahui" }
            if (studentNames.isEmpty()) {
                Toast.makeText(this, "Daftar siswa perwalian belum termuat. Coba lagi.", Toast.LENGTH_SHORT).show()
                return
            }

            val spinnerAdapter = ArrayAdapter(this, android.R.layout.simple_spinner_item, studentNames)
            spinnerAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
            spinnerSiswa.adapter = spinnerAdapter

            val dialog = AlertDialog.Builder(this)
                .setView(dialogView)
                .setCancelable(true)
                .create()

            btnBatal.setOnClickListener { dialog.dismiss() }

            btnSimpan.setOnClickListener {
                val selectedPosition = spinnerSiswa.selectedItemPosition
                val selectedStudent = homeroomStudents.getOrNull(selectedPosition)
                val studentId = selectedStudent?.id
                val note = etCatatan.text?.toString()?.trim().orEmpty()
                val action = etAksi.text?.toString()?.trim()?.ifEmpty { null }

                if (studentId == null || studentId <= 0) {
                    Toast.makeText(this, "Pilih siswa terlebih dahulu.", Toast.LENGTH_SHORT).show()
                    return@setOnClickListener
                }
                if (note.isEmpty()) {
                    etCatatan.error = "Catatan tidak boleh kosong"
                    return@setOnClickListener
                }

                btnSimpan.isEnabled = false
                btnSimpan.text = "Menyimpan..."

                lifecycleScope.launch {
                    try {
                        val result = teacherRepository.createStudentFollowUp(
                            studentId = studentId,
                            note = note,
                            action = action
                        )
                        handleResult(result,
                            onSuccess = { _ ->
                                dialog.dismiss()
                                Toast.makeText(
                                    this@TindakLanjutWaliKelasActivity,
                                    "Tindak lanjut disimpan!",
                                    Toast.LENGTH_SHORT
                                ).show()
                                loadFollowUpDataForClassFromApi()
                            },
                            onError = { _, msg ->
                                btnSimpan.isEnabled = true
                                btnSimpan.text = "Simpan"
                                showError("Gagal menyimpan ke database: $msg")
                            }
                        )
                    } catch (e: Exception) {
                        btnSimpan.isEnabled = true
                        btnSimpan.text = "Simpan"
                        showError("Error: ${e.message}")
                    }
                }
            }

            dialog.show()
        } catch (e: Exception) {
            showError("Gagal membuka form tindak lanjut: ${e.message}")
        }
    }

    private fun setupFooterNavigation() {
        btnHome.setOnClickListener {
            startActivity(Intent(this, DashboardWaliKelasActivity::class.java))
        }

        btnCalendar.setOnClickListener {
            startActivity(Intent(this, RiwayatKehadiranKelasActivity::class.java))
        }

        btnChart.setOnClickListener {
            refreshData()
            Toast.makeText(this, "Halaman Tindak Lanjut Wali Kelas", Toast.LENGTH_SHORT).show()
        }

    }

    private fun refreshData() {
        loadFollowUpDataForClassFromApi()
        Toast.makeText(this, "Data Tindak Lanjut direfresh", Toast.LENGTH_SHORT).show()
    }

    private fun loadFollowUpDataForClassFromApi() {
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
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) = Unit
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) = Unit
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
                allSiswaData.filter {
                    it.studentName.lowercase().contains(lowerQuery) ||
                            it.classLabel.lowercase().contains(lowerQuery)
                }
            )
        }

        adapter.notifyDataSetChanged()
    }
}