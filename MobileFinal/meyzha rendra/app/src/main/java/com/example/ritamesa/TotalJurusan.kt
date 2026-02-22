package com.example.ritamesa

import android.app.AlertDialog
import android.app.Dialog
import android.os.Bundle
import android.util.Log
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.ritamesa.data.api.ApiClient
import com.example.ritamesa.data.api.ApiService
import com.example.ritamesa.data.dto.MajorDto
import kotlinx.coroutines.launch

class TotalJurusan : AppCompatActivity() {

    // ===== COMPONENTS =====
    private lateinit var recyclerView: RecyclerView
    private lateinit var jurusanAdapter: JurusanAdapter
    private lateinit var editTextSearch: EditText

    // ===== API =====
    private lateinit var apiService: ApiService
    private val masterJurusan = arrayListOf<Jurusan>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.total_jurusan)

        apiService = ApiClient.getService(this)

        initView()
        setupRecyclerView()
        setupActions()

        fetchData()
    }

    private fun fetchData() {
        lifecycleScope.launch {
            try {
                val response = apiService.getMajors()
                if (response.isSuccessful && response.body() != null) {
                    val dtos = response.body()?.data ?: emptyList()
                    masterJurusan.clear()
                    masterJurusan.addAll(dtos.map {
                        Jurusan(
                            id = it.id ?: "",
                            KonsentrasiKeahlian = it.name ?: "",
                            Kodejurusan = it.code ?: ""
                        )
                    })
                    searchJurusan()
                } else {
                    Toast.makeText(this@TotalJurusan, "Gagal mengambil data jurusan", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Log.e("TotalJurusan", "Error fetching data", e)
                Toast.makeText(this@TotalJurusan, "Koneksi bermasalah: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun initView() {
        recyclerView = findViewById(R.id.rvJurusan)
        editTextSearch = findViewById(R.id.editTextText7)
        editTextSearch.hint = "Cari jurusan"
    }

    private fun setupRecyclerView() {
        recyclerView.layoutManager = LinearLayoutManager(this)
        recyclerView.setHasFixedSize(true)

        jurusanAdapter = JurusanAdapter(
            masterJurusan,
            onEditClickListener = { jurusan -> showEditDialog(jurusan) },
            onDeleteClickListener = { jurusan -> showDeleteConfirmation(jurusan) }
        )
        recyclerView.adapter = jurusanAdapter
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
            searchJurusan()
        }

        // ENTER KEY LISTENER UNTUK SEARCH
        editTextSearch.setOnEditorActionListener { _, actionId, _ ->
            if (actionId == android.view.inputmethod.EditorInfo.IME_ACTION_SEARCH ||
                actionId == android.view.inputmethod.EditorInfo.IME_ACTION_DONE) {
                searchJurusan()
                true
            } else {
                false
            }
        }
    }

    private fun searchJurusan() {
        val query = editTextSearch.text.toString().trim()
        val filteredList = if (query.isEmpty()) {
            masterJurusan
        } else {
            masterJurusan.filter {
                it.KonsentrasiKeahlian.contains(query, true) ||
                        it.Kodejurusan.contains(query, true)
            }
        }

        if (filteredList.isEmpty() && query.isNotEmpty()) {
            Toast.makeText(this, "Tidak ditemukan jurusan dengan kata kunci '$query'", Toast.LENGTH_SHORT).show()
        }

        jurusanAdapter.updateData(filteredList)
    }

    private fun showAddDialog() {
        try {
            val dialog = Dialog(this)
            dialog.setContentView(R.layout.pop_up_tambah_jurusan)
            dialog.window?.setBackgroundDrawableResource(android.R.color.transparent)
            dialog.setCancelable(true)

            dialog.window?.setLayout(
                (resources.displayMetrics.widthPixels * 0.9).toInt(),
                android.view.WindowManager.LayoutParams.WRAP_CONTENT
            )

            val inputNama = dialog.findViewById<EditText>(R.id.et_nama_jurusan)
            val inputKode = dialog.findViewById<EditText>(R.id.et_kode_jurusan)
            val btnBatal = dialog.findViewById<Button>(R.id.btn_batal)
            val btnSimpan = dialog.findViewById<Button>(R.id.btn_simpan)

            btnBatal.setOnClickListener {
                dialog.dismiss()
            }

            btnSimpan.setOnClickListener {
                val namaJurusan = inputNama.text.toString().trim()
                val kodeJurusan = inputKode.text.toString().trim()

                if (namaJurusan.isEmpty() || kodeJurusan.isEmpty()) {
                    Toast.makeText(this, "Harap isi semua field!", Toast.LENGTH_SHORT).show()
                    return@setOnClickListener
                }

                val newMajorDto = MajorDto(
                    id = null,
                    name = namaJurusan,
                    code = kodeJurusan,
                    category = null
                )

                lifecycleScope.launch {
                    try {
                        val response = apiService.createMajor(newMajorDto)
                        if (response.isSuccessful) {
                            Toast.makeText(this@TotalJurusan, "Data jurusan berhasil ditambahkan", Toast.LENGTH_SHORT).show()
                            fetchData()
                            dialog.dismiss()
                        } else {
                            Toast.makeText(this@TotalJurusan, "Gagal menambahkan: ${response.message()}", Toast.LENGTH_LONG).show()
                        }
                    } catch (e: Exception) {
                        Toast.makeText(this@TotalJurusan, "Error: ${e.message}", Toast.LENGTH_LONG).show()
                    }
                }
            }

            dialog.show()
        } catch (e: Exception) {
            Toast.makeText(this, "Error: ${e.message}", Toast.LENGTH_SHORT).show()
            e.printStackTrace()
        }
    }

    private fun showEditDialog(jurusan: Jurusan) {
        try {
            val dialog = Dialog(this)
            dialog.setContentView(R.layout.pop_up_edit_jurusan)
            dialog.window?.setBackgroundDrawableResource(android.R.color.transparent)
            dialog.setCancelable(true)

            dialog.window?.setLayout(
                (resources.displayMetrics.widthPixels * 0.9).toInt(),
                android.view.WindowManager.LayoutParams.WRAP_CONTENT
            )

            val inputNama = dialog.findViewById<EditText>(R.id.et_nama_jurusan)
            val inputKode = dialog.findViewById<EditText>(R.id.et_kode_jurusan)
            val btnBatal = dialog.findViewById<Button>(R.id.btn_batal)
            val btnSimpan = dialog.findViewById<Button>(R.id.btn_simpan)

            inputNama.setText(jurusan.KonsentrasiKeahlian)
            inputKode.setText(jurusan.Kodejurusan)

            btnBatal.setOnClickListener {
                dialog.dismiss()
            }

            btnSimpan.setOnClickListener {
                val namaJurusan = inputNama.text.toString().trim()
                val kodeJurusan = inputKode.text.toString().trim()

                if (namaJurusan.isEmpty() || kodeJurusan.isEmpty()) {
                    Toast.makeText(this, "Harap isi semua field!", Toast.LENGTH_SHORT).show()
                    return@setOnClickListener
                }

                val currentMajorDto = MajorDto(
                    id = jurusan.id,
                    name = namaJurusan,
                    code = kodeJurusan,
                    category = null
                )

                lifecycleScope.launch {
                    try {
                        val response = apiService.updateMajor(jurusan.id, currentMajorDto)
                        if (response.isSuccessful) {
                            Toast.makeText(this@TotalJurusan, "Data jurusan berhasil diperbarui", Toast.LENGTH_SHORT).show()
                            fetchData()
                            dialog.dismiss()
                        } else {
                            Toast.makeText(this@TotalJurusan, "Gagal update: ${response.message()}", Toast.LENGTH_LONG).show()
                        }
                    } catch (e: Exception) {
                        Toast.makeText(this@TotalJurusan, "Error: ${e.message}", Toast.LENGTH_LONG).show()
                    }
                }
            }

            dialog.show()
        } catch (e: Exception) {
            Toast.makeText(this, "Error: ${e.message}", Toast.LENGTH_SHORT).show()
            e.printStackTrace()
        }
    }

    private fun showDeleteConfirmation(jurusan: Jurusan) {
        AlertDialog.Builder(this)
            .setTitle("Konfirmasi Hapus")
            .setMessage("Apakah Anda yakin akan menghapus data jurusan ${jurusan.KonsentrasiKeahlian}?")
            .setPositiveButton("Ya, Hapus") { _, _ ->
                lifecycleScope.launch {
                    try {
                        val response = apiService.deleteMajor(jurusan.id)
                        if (response.isSuccessful) {
                            Toast.makeText(this@TotalJurusan, "Data jurusan berhasil dihapus", Toast.LENGTH_SHORT).show()
                            fetchData()
                        } else {
                            Toast.makeText(this@TotalJurusan, "Gagal menghapus: ${response.message()}", Toast.LENGTH_LONG).show()
                        }
                    } catch (e: Exception) {
                        Toast.makeText(this@TotalJurusan, "Error: ${e.message}", Toast.LENGTH_LONG).show()
                    }
                }
            }
            .setNegativeButton("Batal", null)
            .show()
    }
}