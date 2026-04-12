package com.example.ritamesa

import android.app.AlertDialog
import android.app.Dialog
import android.os.Bundle
import android.view.ViewGroup
import android.widget.*
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.ritamesa.api.Result
import com.example.ritamesa.api.models.CreateKelasRequest
import com.example.ritamesa.api.models.UpdateKelasRequest
import com.example.ritamesa.api.models.Major
import kotlinx.coroutines.launch

class TotalKelas : BaseNetworkActivity() {

    private val listKelas   = arrayListOf<Kelas>()
    private val listTingkat = listOf("10", "11", "12")

    private var majorList = listOf<Major>()

    private data class GuruDropdown(val id: Int, val name: String)
    private var guruDropdownList = listOf<GuruDropdown>()

    private lateinit var recyclerView: RecyclerView
    private lateinit var kelasAdapter: KelasAdapter
    private lateinit var editTextSearch: EditText
    private lateinit var btnBack: ImageButton
    private lateinit var btnTambah: LinearLayout
    private lateinit var btnSearch: ImageButton

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.total_kelas)

        initView()
        setupRecyclerView()
        setupActions()
        loadDropdownData()
    }

    private fun initView() {
        recyclerView   = findViewById(R.id.rvKelas)
        editTextSearch = findViewById(R.id.editTextText7)
        btnBack        = findViewById(R.id.imageView36)
        btnTambah      = findViewById(R.id.imageButton23)
        btnSearch      = findViewById(R.id.imageButton17)
        editTextSearch.hint = "Cari Nama Kelas"
    }

    private fun setupRecyclerView() {
        recyclerView.layoutManager = LinearLayoutManager(this)
        recyclerView.setHasFixedSize(true)
        kelasAdapter = KelasAdapter(
            listKelas,
            onEditClickListener   = { kelas -> showEditDialog(kelas) },
            onDeleteClickListener = { kelas -> showDeleteConfirmation(kelas) }
        )
        recyclerView.adapter = kelasAdapter
    }

    private fun loadDropdownData() {
        lifecycleScope.launch {
            when (val r = administrationRepository.getMajors()) {
                is Result.Success -> majorList = r.data
                is Result.Error   -> showError("Gagal memuat jurusan: ${r.message ?: r.exception.message}")
                else -> {}
            }

            try {
                val allGuru = PaginationHelper.loadAll(this@TotalKelas, "teachers")
                val list = mutableListOf<GuruDropdown>()
                for (i in 0 until allGuru.length()) {
                    val obj = allGuru.getJSONObject(i)
                    list.add(GuruDropdown(
                        id   = obj.optInt("id", 0),
                        name = obj.optString("name", "-")
                    ))
                }
                guruDropdownList = list
            } catch (e: Exception) {
                showError("Gagal memuat guru: ${e.message}")
            }

            loadKelas()
        }
    }

    private fun loadKelas(search: String? = null) {
        lifecycleScope.launch {
            try {
                val extra   = if (!search.isNullOrEmpty()) "&search=$search" else ""
                val allData = PaginationHelper.loadAll(this@TotalKelas, "classes", extraParams = extra)

                listKelas.clear()
                for (i in 0 until allData.length()) {
                    val obj = allData.getJSONObject(i)

                    // FIX: major_name bisa flat atau nested dalam "major" object
                    val majorNameRaw = obj.opt("major_name")
                    val majorName: String = when {
                        majorNameRaw is String && majorNameRaw.isNotEmpty() -> majorNameRaw
                        obj.has("major") && !obj.isNull("major") ->
                            obj.optJSONObject("major")?.optString("name", "-") ?: "-"
                        else -> "-"
                    }

                    // FIX: homeroom_teacher_name bisa flat atau nested
                    val waliRaw = obj.opt("homeroom_teacher_name")
                    val waliKelas: String = when {
                        waliRaw is String && waliRaw.isNotEmpty() -> waliRaw
                        obj.has("homeroom_teacher") && !obj.isNull("homeroom_teacher") ->
                            obj.optJSONObject("homeroom_teacher")?.optString("name", "-") ?: "-"
                        else -> "-"
                    }

                    val homeroomTeacherId: Int? = obj.optInt("homeroom_teacher_id", 0)
                        .let { if (it == 0) null else it }

                    listKelas.add(Kelas(
                        id                  = obj.optInt("id", 0),
                        namaKelas           = obj.optString("name", ""),
                        grade               = obj.optString("grade", ""),   // FIX: simpan grade dari API
                        label               = obj.optString("label", ""),   // FIX: simpan label dari API
                        konsentrasiKeahlian = majorName,
                        waliKelas           = waliKelas,
                        majorId             = obj.optInt("major_id", 0),
                        homeroomTeacherId   = homeroomTeacherId
                    ))
                }
                kelasAdapter.notifyDataSetChanged()
            } catch (e: Exception) {
                showError("Gagal memuat data kelas: ${e.message}")
            }
        }
    }

    private fun setupActions() {
        btnBack.setOnClickListener   { finish() }
        btnTambah.setOnClickListener { showAddDialog() }
        btnSearch.setOnClickListener { performSearch() }
        editTextSearch.setOnEditorActionListener { _, actionId, _ ->
            if (actionId == android.view.inputmethod.EditorInfo.IME_ACTION_SEARCH) {
                performSearch(); true
            } else false
        }
    }

    private fun performSearch() {
        val query = editTextSearch.text.toString().trim()
        loadKelas(search = query.ifEmpty { null })
    }

    // ─── Dialog Tambah Kelas ──────────────────────────────────────────────────
    private fun showAddDialog() {
        val dialog = Dialog(this)
        dialog.setContentView(R.layout.pop_up_tambah_kelas)
        dialog.window?.setLayout(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT)
        // FIX: setCancelable(true) bukan false
        dialog.setCancelable(true)

        val etNamaKelas         = dialog.findViewById<EditText>(R.id.input_nama_kelas)
        val etKonsentrasi       = dialog.findViewById<EditText>(R.id.input_konsentrasi_keahlian)
        val etTingkat           = dialog.findViewById<EditText>(R.id.input_keterangan_nisn)
        val etWaliKelas         = dialog.findViewById<EditText>(R.id.input_nama_wali_kelas)
        val btnArrowKonsentrasi = dialog.findViewById<ImageButton>(R.id.arrowKonsentrasi)
        val btnArrowTingkat     = dialog.findViewById<ImageButton>(R.id.imageButton9)
        val btnArrowWaliKelas   = dialog.findViewById<ImageButton>(R.id.imageButton10)
        val btnBatal            = dialog.findViewById<Button>(R.id.btn_batal)
        val btnSimpan           = dialog.findViewById<Button>(R.id.btn_simpan)

        var selectedMajorId:   Int? = null
        var selectedTeacherId: Int? = null

        etKonsentrasi.isFocusable = false; etKonsentrasi.isClickable = true
        etTingkat.isFocusable     = false; etTingkat.isClickable     = true
        etWaliKelas.isFocusable   = false; etWaliKelas.isClickable   = true

        val showMajorDropdown: () -> Unit = {
            val names = majorList.map { it.name ?: "-" }.toTypedArray()
            AlertDialog.Builder(this).setTitle("Pilih Konsentrasi Keahlian")
                .setItems(names) { _, i ->
                    selectedMajorId = majorList[i].id
                    etKonsentrasi.setText(names[i])
                }.show()
        }
        btnArrowKonsentrasi.setOnClickListener { showMajorDropdown() }
        etKonsentrasi.setOnClickListener       { showMajorDropdown() }

        val showTingkatDropdown: () -> Unit = {
            AlertDialog.Builder(this).setTitle("Pilih Tingkat Kelas")
                .setItems(listTingkat.toTypedArray()) { _, i ->
                    etTingkat.setText(listTingkat[i])
                }.show()
        }
        btnArrowTingkat.setOnClickListener { showTingkatDropdown() }
        etTingkat.setOnClickListener       { showTingkatDropdown() }

        val showTeacherDropdown: () -> Unit = {
            val names = guruDropdownList.map { it.name }.toTypedArray()
            AlertDialog.Builder(this).setTitle("Pilih Wali Kelas")
                .setItems(names) { _, i ->
                    selectedTeacherId = guruDropdownList[i].id
                    etWaliKelas.setText(names[i])
                }.show()
        }
        btnArrowWaliKelas.setOnClickListener { showTeacherDropdown() }
        etWaliKelas.setOnClickListener       { showTeacherDropdown() }

        btnBatal.setOnClickListener { dialog.dismiss() }

        btnSimpan.setOnClickListener {
            val namaKelas   = etNamaKelas.text.toString().trim()
            val konsentrasi = etKonsentrasi.text.toString().trim()
            val tingkat     = etTingkat.text.toString().trim()

            if (namaKelas.isEmpty()) {
                Toast.makeText(this, "Label kelas tidak boleh kosong", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            if (tingkat.isEmpty()) {
                Toast.makeText(this, "Pilih tingkat kelas (10/11/12)", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            if (!listTingkat.contains(tingkat)) {
                Toast.makeText(this, "Tingkat kelas harus 10, 11, atau 12", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            if (selectedMajorId == null) {
                Toast.makeText(this, "Pilih konsentrasi keahlian terlebih dahulu", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val request = CreateKelasRequest(
                grade             = tingkat,
                label             = namaKelas,
                majorId           = selectedMajorId!!,
                homeroomTeacherId = selectedTeacherId
            )

            // FIX: nonaktifkan tombol agar tidak double-submit
            btnSimpan.isEnabled = false
            btnBatal.isEnabled  = false

            lifecycleScope.launch {
                // FIX: Panggil API langsung via apiService untuk hindari Gson parse error
                // pada response body. Data tetap tersimpan meski Gson gagal parse nested object.
                try {
                    val response = com.example.ritamesa.api.ApiClient
                        .getApiService(this@TotalKelas)
                        .createClassFlat(request)

                    if (response.isSuccessful) {
                        dialog.dismiss()
                        Toast.makeText(this@TotalKelas, "Data berhasil ditambahkan", Toast.LENGTH_LONG).show()
                        loadKelas()
                    } else {
                        btnSimpan.isEnabled = true
                        btnBatal.isEnabled  = true
                        val errBody = response.errorBody()?.string() ?: "Gagal menambahkan data"
                        showError(errBody)
                    }
                } catch (e: Exception) {
                    // Gson parse error = data sudah tersimpan tapi response body tidak bisa di-parse.
                    // Cek apakah ini JsonSyntaxException / EOFException (bukan network error).
                    // Cek parse error dari nama class-nya saja, tanpa import Gson
                    val isParseError = e is java.io.EOFException
                            || e.javaClass.name.contains("JsonSyntax")
                            || e.javaClass.name.contains("JsonParseException")
                            || e.message?.contains("malformed") == true
                            || e.message?.contains("Expected") == true
                            || e.message?.contains("Use JsonReader") == true

                    if (isParseError) {
                        // Data sudah tersimpan di server → anggap sukses, reload list
                        dialog.dismiss()
                        Toast.makeText(this@TotalKelas, "Data berhasil ditambahkan", Toast.LENGTH_LONG).show()
                        loadKelas()
                    } else {
                        btnSimpan.isEnabled = true
                        btnBatal.isEnabled  = true
                        showError(e.message ?: "Gagal menambahkan data")
                    }
                }
            }
        }

        dialog.show()
    }

    // ─── Dialog Edit Kelas ────────────────────────────────────────────────────
    private fun showEditDialog(kelas: Kelas) {
        val dialog = Dialog(this)
        dialog.setContentView(R.layout.pop_up_edit_kelas)
        dialog.window?.setLayout(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT)
        dialog.setCancelable(true)

        val etNamaKelas         = dialog.findViewById<EditText>(R.id.input_nama_kelas)
        val etKonsentrasi       = dialog.findViewById<EditText>(R.id.input_konsentrasi_keahlian)
        val etTingkat           = dialog.findViewById<EditText>(R.id.input_tingkat_kelas)
        val etWaliKelas         = dialog.findViewById<EditText>(R.id.input_nama_wali_kelas)
        val btnArrowKonsentrasi = dialog.findViewById<ImageButton>(R.id.arrowKonsentrasi)
        val btnArrowTingkat     = dialog.findViewById<ImageButton>(R.id.arrowTingkatKelas)
        val btnArrowWaliKelas   = dialog.findViewById<ImageButton>(R.id.arrowWaliKelas)
        val btnBatal            = dialog.findViewById<Button>(R.id.btn_batal)
        val btnSimpan           = dialog.findViewById<Button>(R.id.btn_simpan)

        var selectedMajorId:   Int  = kelas.majorId
        var selectedTeacherId: Int? = kelas.homeroomTeacherId

        etKonsentrasi.isFocusable = false; etKonsentrasi.isClickable = true
        etTingkat.isFocusable     = false; etTingkat.isClickable     = true
        etWaliKelas.isFocusable   = false; etWaliKelas.isClickable   = true

        // FIX: gunakan field grade & label yang sudah tersimpan dari API,
        // bukan parsing namaKelas (yang bisa gagal jika format nama berbeda)
        etTingkat.setText(
            kelas.grade.ifEmpty {
                // fallback: coba parsing namaKelas jika grade belum terisi
                kelas.namaKelas.split(" ").firstOrNull()
                    ?.takeIf { listTingkat.contains(it) } ?: ""
            }
        )
        etNamaKelas.setText(
            kelas.label.ifEmpty {
                // fallback: ambil bagian setelah grade dari namaKelas
                val parts = kelas.namaKelas.split(" ", limit = 2)
                if (parts.size > 1) parts[1] else kelas.namaKelas
            }
        )
        etKonsentrasi.setText(kelas.konsentrasiKeahlian)
        etWaliKelas.setText(kelas.waliKelas)

        val showMajorDropdown: () -> Unit = {
            val names = majorList.map { it.name ?: "-" }.toTypedArray()
            AlertDialog.Builder(this).setTitle("Pilih Konsentrasi Keahlian")
                .setItems(names) { _, i ->
                    selectedMajorId = majorList[i].id ?: selectedMajorId
                    etKonsentrasi.setText(names[i])
                }.show()
        }
        btnArrowKonsentrasi.setOnClickListener { showMajorDropdown() }
        etKonsentrasi.setOnClickListener       { showMajorDropdown() }

        val showTingkatDropdown: () -> Unit = {
            AlertDialog.Builder(this).setTitle("Pilih Tingkat Kelas")
                .setItems(listTingkat.toTypedArray()) { _, i ->
                    etTingkat.setText(listTingkat[i])
                }.show()
        }
        btnArrowTingkat.setOnClickListener { showTingkatDropdown() }
        etTingkat.setOnClickListener       { showTingkatDropdown() }

        val showTeacherDropdown: () -> Unit = {
            val names = guruDropdownList.map { it.name }.toTypedArray()
            AlertDialog.Builder(this).setTitle("Pilih Wali Kelas")
                .setItems(names) { _, i ->
                    selectedTeacherId = guruDropdownList[i].id
                    etWaliKelas.setText(names[i])
                }.show()
        }
        btnArrowWaliKelas.setOnClickListener { showTeacherDropdown() }
        etWaliKelas.setOnClickListener       { showTeacherDropdown() }

        btnBatal.setOnClickListener { dialog.dismiss() }

        btnSimpan.setOnClickListener {
            val namaKelas   = etNamaKelas.text.toString().trim()
            val konsentrasi = etKonsentrasi.text.toString().trim()
            val tingkat     = etTingkat.text.toString().trim()

            if (namaKelas.isEmpty()) {
                Toast.makeText(this, "Label kelas tidak boleh kosong", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            if (tingkat.isEmpty()) {
                Toast.makeText(this, "Pilih tingkat kelas (10/11/12)", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            if (!listTingkat.contains(tingkat)) {
                Toast.makeText(this, "Tingkat kelas harus 10, 11, atau 12", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val request = UpdateKelasRequest(
                grade             = tingkat,
                label             = namaKelas,
                majorId           = selectedMajorId,
                homeroomTeacherId = selectedTeacherId
            )

            // FIX: nonaktifkan tombol saat proses
            btnSimpan.isEnabled = false
            btnBatal.isEnabled  = false

            lifecycleScope.launch {
                // FIX: Sama seperti create — bypass repository untuk hindari Gson parse error
                try {
                    val response = com.example.ritamesa.api.ApiClient
                        .getApiService(this@TotalKelas)
                        .updateClassFlat(kelas.id, request)

                    if (response.isSuccessful) {
                        dialog.dismiss()
                        Toast.makeText(this@TotalKelas, "Data berhasil diupdate", Toast.LENGTH_LONG).show()
                        loadKelas()
                    } else {
                        btnSimpan.isEnabled = true
                        btnBatal.isEnabled  = true
                        val errBody = response.errorBody()?.string() ?: "Gagal mengupdate data"
                        showError(errBody)
                    }
                } catch (e: Exception) {
                    val isParseError = e is java.io.EOFException
                            || e.javaClass.name.contains("JsonSyntax")
                            || e.javaClass.name.contains("JsonParseException")
                            || e.message?.contains("malformed") == true
                            || e.message?.contains("Expected") == true
                            || e.message?.contains("Use JsonReader") == true

                    if (isParseError) {
                        dialog.dismiss()
                        Toast.makeText(this@TotalKelas, "Data berhasil diupdate", Toast.LENGTH_LONG).show()
                        loadKelas()
                    } else {
                        btnSimpan.isEnabled = true
                        btnBatal.isEnabled  = true
                        showError(e.message ?: "Gagal mengupdate data")
                    }
                }
            }
        }

        dialog.show()
    }

    private fun showDeleteConfirmation(kelas: Kelas) {
        AlertDialog.Builder(this)
            .setTitle("Konfirmasi Hapus")
            .setMessage("Apakah Anda yakin akan menghapus data kelas ${kelas.namaKelas}?")
            .setPositiveButton("Ya") { _, _ ->
                lifecycleScope.launch {
                    when (val result = classRepository.deleteClass(kelas.id)) {
                        is Result.Success -> {
                            Toast.makeText(this@TotalKelas, "Data berhasil dihapus", Toast.LENGTH_SHORT).show()
                            loadKelas()
                        }
                        is Result.Error -> showError(result.message ?: result.exception.message ?: "Gagal menghapus data")
                        else -> {}
                    }
                }
            }
            .setNegativeButton("Batal", null)
            .show()
    }
}