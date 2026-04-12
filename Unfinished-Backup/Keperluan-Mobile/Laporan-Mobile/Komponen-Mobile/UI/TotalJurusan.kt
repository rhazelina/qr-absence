package com.example.ritamesa

import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.widget.Button
import android.widget.EditText
import android.widget.ImageButton
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.ritamesa.api.Result
import com.example.ritamesa.api.models.CreateMajorRequest
import kotlinx.coroutines.launch

class TotalJurusan : BaseNetworkActivity() {

    private lateinit var rvJurusan: RecyclerView
    private lateinit var etSearch: EditText
    private lateinit var btnBack: ImageButton
    private lateinit var btnTambah: LinearLayout
    private lateinit var btnSearch: ImageButton
    private lateinit var tvHeaderKonsentrasi: TextView
    private lateinit var tvHeaderKode: TextView
    private lateinit var tvHeaderAksi: TextView

    private lateinit var jurusanAdapter: JurusanAdapter

    private val jurusanList = mutableListOf<Jurusan>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.total_jurusan)

        initViews()
        setupRecyclerView()
        setupListeners()
        loadData()
    }

    private fun initViews() {
        rvJurusan            = findViewById(R.id.rvJurusan)
        etSearch             = findViewById(R.id.et_search_jurusan)
        btnBack              = findViewById(R.id.btn_back)
        btnTambah            = findViewById(R.id.btn_tambah_container)
        btnSearch            = findViewById(R.id.btn_search)
        tvHeaderKonsentrasi  = findViewById(R.id.tv_header_konsentrasi)
        tvHeaderKode         = findViewById(R.id.tv_header_kode)
        tvHeaderAksi         = findViewById(R.id.tv_header_aksi)
    }

    private fun setupRecyclerView() {
        rvJurusan.layoutManager = LinearLayoutManager(this)
        rvJurusan.setHasFixedSize(true)

        jurusanAdapter = JurusanAdapter(
            onEditClick   = { jurusan -> showEditDialog(jurusan) },
            onDeleteClick = { jurusan -> showDeleteConfirmation(jurusan) }
        )
        rvJurusan.adapter = jurusanAdapter
    }

    private fun loadData(search: String? = null) {
        lifecycleScope.launch {
            when (val result = administrationRepository.getMajors(search = search)) {
                is Result.Success -> {
                    jurusanList.clear()
                    for (m in result.data) {
                        jurusanList.add(Jurusan(
                            id              = m.id ?: 0,
                            code            = m.code ?: "",
                            name            = m.name ?: "",
                            programKeahlian = m.programKeahlian ?: "",
                            bidangKeahlian  = m.bidangKeahlian ?: ""
                        ))
                    }
                    jurusanAdapter.updateData(jurusanList)
                }
                is Result.Error -> showError(result.message ?: result.exception.message ?: "Gagal memuat data")
                else -> {}
            }
        }
    }

    private fun setupListeners() {
        btnBack.setOnClickListener   { finish() }
        btnTambah.setOnClickListener { showAddDialog() }
        btnSearch.setOnClickListener { performSearch() }

        etSearch.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {}
        })
        etSearch.setOnEditorActionListener { _, actionId, _ ->
            if (actionId == android.view.inputmethod.EditorInfo.IME_ACTION_SEARCH) {
                performSearch(); true
            } else false
        }
    }

    private fun performSearch() {
        val query = etSearch.text.toString().trim()
        loadData(search = query.ifEmpty { null })
    }

    private fun showAddDialog() {
        val dialogView = layoutInflater.inflate(R.layout.pop_up_tambah_jurusan, null)
        // FIX: setCancelable(true) — jangan false, bisa memicu masalah saat back button
        val dialog = AlertDialog.Builder(this)
            .setView(dialogView)
            .setCancelable(true)
            .create()
        dialog.show()
        dialog.window?.setBackgroundDrawableResource(android.R.color.transparent)

        val etNama    = dialogView.findViewById<EditText>(R.id.et_nama_jurusan)
        val etKode    = dialogView.findViewById<EditText>(R.id.et_kode_jurusan)
        val etProgram = dialogView.findViewById<EditText>(R.id.et_program_keahlian)
        val etBidang  = dialogView.findViewById<EditText>(R.id.et_bidang_keahlian)
        val btnBatal  = dialogView.findViewById<Button>(R.id.btn_batal)
        val btnSimpan = dialogView.findViewById<Button>(R.id.btn_simpan)

        etNama.hint = "Konsentrasi Keahlian"
        btnBatal.setOnClickListener { dialog.dismiss() }

        btnSimpan.setOnClickListener {
            val konsentrasi = etNama.text.toString().trim()
            val kode        = etKode.text.toString().trim()
            val program     = etProgram.text.toString().trim()
            val bidang      = etBidang.text.toString().trim()

            if (!validateInput(konsentrasi, kode, program, bidang)) return@setOnClickListener

            val request = CreateMajorRequest(
                code            = kode,
                name            = konsentrasi,
                programKeahlian = program,
                bidangKeahlian  = bidang
            )

            // FIX: nonaktifkan tombol agar tidak double-submit
            btnSimpan.isEnabled = false
            btnBatal.isEnabled  = false

            lifecycleScope.launch {
                when (val result = administrationRepository.createMajor(request)) {
                    is Result.Success -> {
                        // FIX: dismiss SEBELUM loadData — ini kunci mencegah force close
                        dialog.dismiss()
                        Toast.makeText(this@TotalJurusan, "Data berhasil ditambahkan", Toast.LENGTH_SHORT).show()
                        loadData()
                    }
                    is Result.Error -> {
                        btnSimpan.isEnabled = true
                        btnBatal.isEnabled  = true
                        showError(result.message ?: result.exception.message ?: "Gagal menambahkan data")
                    }
                    else -> {
                        btnSimpan.isEnabled = true
                        btnBatal.isEnabled  = true
                    }
                }
            }
        }
    }

    private fun showEditDialog(jurusan: Jurusan) {
        val dialogView = layoutInflater.inflate(R.layout.pop_up_edit_jurusan, null)
        val dialog = AlertDialog.Builder(this)
            .setView(dialogView)
            .setCancelable(true)
            .create()
        dialog.show()
        dialog.window?.setBackgroundDrawableResource(android.R.color.transparent)

        val etNama    = dialogView.findViewById<EditText>(R.id.et_nama_jurusan)
        val etKode    = dialogView.findViewById<EditText>(R.id.et_kode_jurusan)
        val etProgram = dialogView.findViewById<EditText>(R.id.et_program_keahlian)
        val etBidang  = dialogView.findViewById<EditText>(R.id.et_bidang_keahlian)
        val btnBatal  = dialogView.findViewById<Button>(R.id.btn_batal)
        val btnSimpan = dialogView.findViewById<Button>(R.id.btn_simpan)

        etNama.hint = "Konsentrasi Keahlian"
        etNama.setText(jurusan.name)
        etKode.setText(jurusan.code)
        etProgram.setText(jurusan.programKeahlian)
        etBidang.setText(jurusan.bidangKeahlian)
        btnBatal.setOnClickListener { dialog.dismiss() }

        btnSimpan.setOnClickListener {
            val konsentrasi = etNama.text.toString().trim()
            val kode        = etKode.text.toString().trim()
            val program     = etProgram.text.toString().trim()
            val bidang      = etBidang.text.toString().trim()

            if (!validateInput(konsentrasi, kode, program, bidang)) return@setOnClickListener

            val request = CreateMajorRequest(
                code            = kode,
                name            = konsentrasi,
                programKeahlian = program,
                bidangKeahlian  = bidang
            )

            // FIX: nonaktifkan tombol saat proses
            btnSimpan.isEnabled = false
            btnBatal.isEnabled  = false

            lifecycleScope.launch {
                when (val result = administrationRepository.updateMajor(jurusan.id, request)) {
                    is Result.Success -> {
                        // FIX: dismiss SEBELUM loadData
                        dialog.dismiss()
                        Toast.makeText(this@TotalJurusan, "Data berhasil diupdate", Toast.LENGTH_SHORT).show()
                        loadData()
                    }
                    is Result.Error -> {
                        btnSimpan.isEnabled = true
                        btnBatal.isEnabled  = true
                        showError(result.message ?: result.exception.message ?: "Gagal mengupdate data")
                    }
                    else -> {
                        btnSimpan.isEnabled = true
                        btnBatal.isEnabled  = true
                    }
                }
            }
        }
    }

    private fun showDeleteConfirmation(jurusan: Jurusan) {
        AlertDialog.Builder(this)
            .setTitle("Hapus Data")
            .setMessage("Apakah Anda yakin ingin menghapus ${jurusan.name}?")
            .setPositiveButton("Hapus") { _, _ ->
                lifecycleScope.launch {
                    when (val result = administrationRepository.deleteMajor(jurusan.id)) {
                        is Result.Success -> {
                            Toast.makeText(this@TotalJurusan, "Data berhasil dihapus", Toast.LENGTH_SHORT).show()
                            loadData()
                        }
                        is Result.Error -> showError(result.message ?: result.exception.message ?: "Gagal menghapus data")
                        else -> {}
                    }
                }
            }
            .setNegativeButton("Batal", null)
            .show()
    }

    private fun validateInput(vararg inputs: String): Boolean {
        inputs.forEach { input ->
            if (input.isEmpty()) {
                Toast.makeText(this, "Semua field harus diisi", Toast.LENGTH_SHORT).show()
                return false
            }
        }
        return true
    }
}