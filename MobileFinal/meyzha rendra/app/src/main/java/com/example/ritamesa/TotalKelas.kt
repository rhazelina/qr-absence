package com.example.ritamesa

import android.app.AlertDialog
import android.app.Dialog
import android.os.Bundle
import android.util.Log
import android.view.ViewGroup
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.ritamesa.data.api.ApiClient
import com.example.ritamesa.data.api.ApiService
import com.example.ritamesa.data.dto.ClassRoomDto
import com.example.ritamesa.data.dto.MajorDto
import com.example.ritamesa.data.dto.TeacherDto
import kotlinx.coroutines.launch

class TotalKelas : AppCompatActivity() {

    // ===== DATA DROPDOWN =====
    private val listTingkatan = listOf("10", "11", "12")
    private val listRombel = listOf("1", "2", "3", "4", "5", "6")

    private val masterJurusan = arrayListOf<MajorDto>()
    private val listNamaJurusan = arrayListOf<String>()

    private val masterGuru = arrayListOf<TeacherDto>()
    private val listNamaGuru = arrayListOf<String>()

    // ===== COMPONENTS =====
    private lateinit var recyclerView: RecyclerView
    private lateinit var kelasAdapter: KelasAdapter
    private lateinit var editTextSearch: EditText

    // ===== API =====
    private lateinit var apiService: ApiService
    private val masterKelas = arrayListOf<Kelas>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.total_kelas)

        apiService = ApiClient.getService(this)

        initView()
        setupRecyclerView()
        setupActions()

        fetchData()
    }

    private fun fetchData() {
        lifecycleScope.launch {
            try {
                // Fetch Kelas
                val resClass = apiService.getClasses()
                if (resClass.isSuccessful && resClass.body() != null) {
                    val dtos = resClass.body()?.data ?: emptyList()
                    masterKelas.clear()
                    masterKelas.addAll(dtos.map {
                        Kelas(
                            id = it.id ?: "",
                            namaJurusan = it.major?.name ?: "",
                            namaKelas = it.name ?: "",
                            waliKelas = it.homeroomTeacher?.name ?: "-",
                            majorId = it.majorId,
                            homeroomTeacherId = it.homeroomTeacherId
                        )
                    })
                    searchKelas()
                } else {
                    Toast.makeText(this@TotalKelas, "Gagal mengambil data kelas", Toast.LENGTH_SHORT).show()
                }

                // Fetch Jurusan
                val resMajor = apiService.getMajors()
                if (resMajor.isSuccessful && resMajor.body() != null) {
                    val majors = resMajor.body()?.data ?: emptyList()
                    masterJurusan.clear()
                    masterJurusan.addAll(majors)
                    listNamaJurusan.clear()
                    listNamaJurusan.addAll(majors.map { it.name ?: "" })
                }

                // Fetch Guru
                val resTeacher = apiService.getTeachers()
                if (resTeacher.isSuccessful && resTeacher.body() != null) {
                    val teachers = resTeacher.body()?.data ?: emptyList()
                    masterGuru.clear()
                    masterGuru.addAll(teachers)
                    listNamaGuru.clear()
                    listNamaGuru.addAll(teachers.map { it.name ?: "" })
                }

            } catch (e: Exception) {
                Log.e("TotalKelas", "Error fetching data", e)
                Toast.makeText(this@TotalKelas, "Koneksi bermasalah: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun initView() {
        recyclerView = findViewById(R.id.rvKelas)
        editTextSearch = findViewById(R.id.editTextText7)
        editTextSearch.hint = "Cari nama kelas"
    }

    private fun setupRecyclerView() {
        recyclerView.layoutManager = LinearLayoutManager(this)
        recyclerView.setHasFixedSize(true)

        kelasAdapter = KelasAdapter(
            masterKelas,
            onEditClickListener = { kelas -> showEditDialog(kelas) },
            onDeleteClickListener = { kelas -> showDeleteConfirmation(kelas) }
        )
        recyclerView.adapter = kelasAdapter
    }

    private fun setupActions() {
        // BUTTON BACK
        findViewById<ImageButton>(R.id.imageView36).setOnClickListener {
            finish()
        }

        // BUTTON TAMBAH
        val btnTambah = findViewById<LinearLayout>(R.id.imageButton23)
        btnTambah.setOnClickListener {
            showAddDialog()
        }

        // BUTTON SEARCH
        findViewById<ImageButton>(R.id.imageButton17).setOnClickListener {
            searchKelas()
        }

        // ENTER KEY LISTENER UNTUK SEARCH
        editTextSearch.setOnEditorActionListener { _, actionId, _ ->
            if (actionId == android.view.inputmethod.EditorInfo.IME_ACTION_SEARCH ||
                actionId == android.view.inputmethod.EditorInfo.IME_ACTION_DONE) {
                searchKelas()
                true
            } else {
                false
            }
        }
    }

    private fun searchKelas() {
        val query = editTextSearch.text.toString().trim()
        val filteredList = if (query.isEmpty()) {
            masterKelas
        } else {
            masterKelas.filter {
                it.namaJurusan.contains(query, true) ||
                        it.namaKelas.contains(query, true) ||
                        it.waliKelas.contains(query, true)
            }
        }

        if (filteredList.isEmpty() && query.isNotEmpty()) {
            Toast.makeText(this, "Tidak ditemukan kelas dengan kata kunci '$query'", Toast.LENGTH_SHORT).show()
        }

        kelasAdapter.updateData(filteredList)
    }

    private var selectedMajorId: String? = null
    private var selectedTeacherId: String? = null

    private fun showAddDialog() {
        try {
            val dialog = Dialog(this)
            dialog.setContentView(R.layout.pop_up_tambah_kelas)
            dialog.window?.setBackgroundDrawableResource(android.R.color.transparent)
            dialog.window?.setLayout(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT)
            dialog.setCancelable(true)

            val etJurusan = dialog.findViewById<EditText>(R.id.input_keterangan_nama)
            val etKelas = dialog.findViewById<EditText>(R.id.input_keterangan_nisn)
            val etWaliKelas = dialog.findViewById<EditText>(R.id.input_keterangan_jurusan)
            val btnArrowJurusan = dialog.findViewById<ImageButton>(R.id.arrowJurusan)
            val btnArrowKelas = dialog.findViewById<ImageButton>(R.id.imageButton9)
            val btnBatal = dialog.findViewById<Button>(R.id.btn_batal)
            val btnSimpan = dialog.findViewById<Button>(R.id.btn_simpan)

            selectedMajorId = null
            selectedTeacherId = null

            // Dropdown Jurusan
            val setupJurusan = {
                showJurusanDropdown(dialog, etJurusan) { id, name ->
                    selectedMajorId = id
                    etJurusan.setText(name)
                }
            }
            btnArrowJurusan.setOnClickListener { setupJurusan() }
            etJurusan.setOnClickListener { setupJurusan() }

            // Dropdown Kelas (Grade + Rombel)
            val setupKelas = {
                showKelasDropdown(dialog, etKelas) { name ->
                    etKelas.setText(name)
                }
            }
            btnArrowKelas.setOnClickListener { setupKelas() }
            etKelas.setOnClickListener { setupKelas() }

            // Dropdown Wali Kelas (No separate arrow in XML usually, so clicking on EditText)
            val setupWaliKelas = {
                showGuruDropdown(dialog, etWaliKelas) { id, name ->
                    selectedTeacherId = id
                    etWaliKelas.setText(name)
                }
            }
            etWaliKelas.setOnClickListener { setupWaliKelas() }

            btnBatal.setOnClickListener {
                dialog.dismiss()
            }

            btnSimpan.setOnClickListener {
                val jurusan = etJurusan.text.toString().trim()
                val kelas = etKelas.text.toString().trim()
                val waliKelas = etWaliKelas.text.toString().trim()

                if (jurusan.isEmpty() || kelas.isEmpty() || waliKelas.isEmpty()) {
                    Toast.makeText(this, "Harap isi semua field!", Toast.LENGTH_SHORT).show()
                    return@setOnClickListener
                }

                if (selectedMajorId == null || selectedTeacherId == null) {
                    Toast.makeText(this, "Harap pilih dari dropdown!", Toast.LENGTH_SHORT).show()
                    return@setOnClickListener
                }

                val gradeExtract = kelas.split(" ").firstOrNull() ?: "10"

                val newClassDto = ClassRoomDto(
                    id = null,
                    name = kelas,
                    grade = gradeExtract,
                    majorId = selectedMajorId,
                    major = null,
                    homeroomTeacherId = selectedTeacherId,
                    homeroomTeacher = null
                )

                lifecycleScope.launch {
                    try {
                        val response = apiService.createClass(newClassDto)
                        if (response.isSuccessful) {
                            Toast.makeText(this@TotalKelas, "Data kelas berhasil ditambahkan", Toast.LENGTH_SHORT).show()
                            fetchData()
                            dialog.dismiss()
                        } else {
                            Toast.makeText(this@TotalKelas, "Gagal menambahkan: ${response.message()}", Toast.LENGTH_LONG).show()
                        }
                    } catch (e: Exception) {
                        Toast.makeText(this@TotalKelas, "Error: ${e.message}", Toast.LENGTH_LONG).show()
                    }
                }
            }

            dialog.show()
        } catch (e: Exception) {
            Toast.makeText(this, "Error: ${e.message}", Toast.LENGTH_SHORT).show()
            e.printStackTrace()
        }
    }

    private fun showJurusanDropdown(dialog: Dialog, etJurusan: EditText, onSelected: (String, String) -> Unit) {
        if (listNamaJurusan.isEmpty()) {
            Toast.makeText(this, "Data jurusan masih kosong / belum dimuat", Toast.LENGTH_SHORT).show()
            return
        }
        val adapter = ArrayAdapter(this, android.R.layout.simple_dropdown_item_1line, listNamaJurusan)
        AlertDialog.Builder(this)
            .setTitle("Pilih Jurusan")
            .setAdapter(adapter) { _, which ->
                val major = masterJurusan[which]
                onSelected(major.id ?: "", major.name ?: "")
            }
            .setNegativeButton("Batal", null)
            .show()
    }

    private fun showKelasDropdown(dialog: Dialog, etKelas: EditText, onSelected: (String) -> Unit) {
        val kelasOptions = mutableListOf<String>()
        for (tingkat in listTingkatan) {
            for (rombel in listRombel) {
                kelasOptions.add("$tingkat $rombel")
            }
        }
        val adapter = ArrayAdapter(this, android.R.layout.simple_dropdown_item_1line, kelasOptions)
        AlertDialog.Builder(this)
            .setTitle("Pilih Kelas/Rombel (Tanpa Jurusan)")
            .setAdapter(adapter) { _, which ->
                val selectedKelas = kelasOptions[which]
                onSelected(selectedKelas)
            }
            .setNegativeButton("Batal", null)
            .show()
    }

    private fun showGuruDropdown(dialog: Dialog, etWaliKelas: EditText, onSelected: (String, String) -> Unit) {
        if (listNamaGuru.isEmpty()) {
            Toast.makeText(this, "Data guru masih kosong / belum dimuat", Toast.LENGTH_SHORT).show()
            return
        }
        val adapter = ArrayAdapter(this, android.R.layout.simple_dropdown_item_1line, listNamaGuru)
        AlertDialog.Builder(this)
            .setTitle("Pilih Wali Kelas")
            .setAdapter(adapter) { _, which ->
                val teacher = masterGuru[which]
                onSelected(teacher.id ?: "", teacher.name ?: "")
            }
            .setNegativeButton("Batal", null)
            .show()
    }

    private fun showEditDialog(kelas: Kelas) {
        try {
            val dialog = Dialog(this)
            dialog.setContentView(R.layout.pop_up_edit_kelas)
            dialog.window?.setBackgroundDrawableResource(android.R.color.transparent)
            dialog.window?.setLayout(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT)
            dialog.setCancelable(true)

            val etJurusan = dialog.findViewById<EditText>(R.id.input_keterangan_nama)
            val etKelas = dialog.findViewById<EditText>(R.id.input_keterangan_nisn)
            val etWaliKelas = dialog.findViewById<EditText>(R.id.input_keterangan_jurusan)
            val btnArrowJurusan = dialog.findViewById<ImageButton>(R.id.arrowJurusan)
            val btnArrowKelas = dialog.findViewById<ImageButton>(R.id.imageButton9)
            val btnBatal = dialog.findViewById<Button>(R.id.btn_batal)
            val btnSimpan = dialog.findViewById<Button>(R.id.btn_simpan)

            etJurusan.setText(kelas.namaJurusan)
            etKelas.setText(kelas.namaKelas)
            etWaliKelas.setText(kelas.waliKelas)

            selectedMajorId = kelas.majorId
            selectedTeacherId = kelas.homeroomTeacherId

            val setupJurusan = {
                showJurusanDropdown(dialog, etJurusan) { id, name ->
                    selectedMajorId = id
                    etJurusan.setText(name)
                }
            }
            btnArrowJurusan.setOnClickListener { setupJurusan() }
            etJurusan.setOnClickListener { setupJurusan() }

            val setupKelas = {
                showKelasDropdown(dialog, etKelas) { name ->
                    etKelas.setText(name)
                }
            }
            btnArrowKelas.setOnClickListener { setupKelas() }
            etKelas.setOnClickListener { setupKelas() }

            val setupWaliKelas = {
                showGuruDropdown(dialog, etWaliKelas) { id, name ->
                    selectedTeacherId = id
                    etWaliKelas.setText(name)
                }
            }
            etWaliKelas.setOnClickListener { setupWaliKelas() }

            btnBatal.setOnClickListener {
                dialog.dismiss()
            }

            btnSimpan.setOnClickListener {
                val jurusan = etJurusan.text.toString().trim()
                val kelasText = etKelas.text.toString().trim()
                val waliKelas = etWaliKelas.text.toString().trim()

                if (jurusan.isEmpty() || kelasText.isEmpty() || waliKelas.isEmpty()) {
                    Toast.makeText(this, "Harap isi semua field!", Toast.LENGTH_SHORT).show()
                    return@setOnClickListener
                }

                if (selectedMajorId == null || selectedTeacherId == null) {
                    Toast.makeText(this, "Harap pilih dari dropdown jika ada perubahan!", Toast.LENGTH_SHORT).show()
                    return@setOnClickListener
                }

                val gradeExtract = kelasText.split(" ").firstOrNull() ?: "10"

                val editClassDto = ClassRoomDto(
                    id = kelas.id,
                    name = kelasText,
                    grade = gradeExtract,
                    majorId = selectedMajorId,
                    major = null,
                    homeroomTeacherId = selectedTeacherId,
                    homeroomTeacher = null
                )

                lifecycleScope.launch {
                    try {
                        val response = apiService.updateClass(kelas.id, editClassDto)
                        if (response.isSuccessful) {
                            Toast.makeText(this@TotalKelas, "Data kelas berhasil diperbarui", Toast.LENGTH_SHORT).show()
                            fetchData()
                            dialog.dismiss()
                        } else {
                            Toast.makeText(this@TotalKelas, "Gagal update: ${response.message()}", Toast.LENGTH_LONG).show()
                        }
                    } catch (e: Exception) {
                        Toast.makeText(this@TotalKelas, "Error: ${e.message}", Toast.LENGTH_LONG).show()
                    }
                }
            }

            dialog.show()
        } catch (e: Exception) {
            Toast.makeText(this, "Error: ${e.message}", Toast.LENGTH_SHORT).show()
            e.printStackTrace()
        }
    }

    private fun showDeleteConfirmation(kelas: Kelas) {
        AlertDialog.Builder(this)
            .setTitle("Konfirmasi Hapus")
            .setMessage("Apakah Anda yakin akan menghapus data kelas ${kelas.namaKelas}?")
            .setPositiveButton("Ya, Hapus") { _, _ ->
                lifecycleScope.launch {
                    try {
                        val response = apiService.deleteClass(kelas.id)
                        if (response.isSuccessful) {
                            Toast.makeText(this@TotalKelas, "Data kelas berhasil dihapus", Toast.LENGTH_SHORT).show()
                            fetchData()
                        } else {
                            Toast.makeText(this@TotalKelas, "Gagal menghapus: ${response.message()}", Toast.LENGTH_LONG).show()
                        }
                    } catch (e: Exception) {
                        Toast.makeText(this@TotalKelas, "Error: ${e.message}", Toast.LENGTH_LONG).show()
                    }
                }
            }
            .setNegativeButton("Batal", null)
            .show()
    }
}
