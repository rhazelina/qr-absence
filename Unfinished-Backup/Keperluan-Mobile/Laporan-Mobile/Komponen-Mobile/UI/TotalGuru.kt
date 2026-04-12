package com.example.ritamesa

import android.app.AlertDialog
import android.app.Dialog
import android.os.Bundle
import android.util.Log
import android.view.View
import android.view.ViewGroup
import android.view.inputmethod.EditorInfo
import android.widget.*
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.ritamesa.api.Result
import com.example.ritamesa.api.models.StoreTeacherRequest
import com.example.ritamesa.api.models.UpdateTeacherRequest
import kotlinx.coroutines.launch

class TotalGuru : BaseNetworkActivity() {

    companion object {
        private const val TAG = "TOTAL_GURU"
    }

    // FIX: Role lengkap sesuai jabatan yang ada di backend
    private val roleOptions = listOf(
        "Guru",
        "Wali Kelas",
        "Waka Kurikulum",
        "Waka Kesiswaan",
        "Waka Humas",
        "Waka Sarpras",
        "Kapro RPL",
        "Kapro TKJ",
        "Kapro TEI",
        "Kapro TMT",
        "Kapro AN",
        "Kapro BC",
        "Kapro TAV",
        "Kapro DKV"
    )

    private lateinit var recyclerView: RecyclerView
    private lateinit var guruAdapter: GuruAdapter
    private lateinit var editTextSearch: EditText
    private lateinit var btnBack: ImageButton
    private lateinit var btnTambah: LinearLayout
    private lateinit var btnSearch: ImageButton
    private var progressBar: ProgressBar? = null
    private var emptyStateContainer: LinearLayout? = null

    private val guruList = mutableListOf<Guru>()
    private var majorList = listOf<com.example.ritamesa.api.models.Major>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Log.d(TAG, "onCreate() dipanggil")
        setContentView(R.layout.total_guru)

        if (!initView()) {
            Log.e(TAG, "initView() gagal")
            showError("Terjadi kesalahan saat memuat halaman")
            return
        }

        setupRecyclerView()
        setupActions()

        lifecycleScope.launch {
            loadMajorsAsync()
            loadData()
        }
    }

    private fun initView(): Boolean {
        return try {
            recyclerView        = findViewById(R.id.rvGuru)
            editTextSearch      = findViewById(R.id.editTextText7)
            btnBack             = findViewById(R.id.imageView36)
            btnTambah           = findViewById(R.id.imageButton23)
            btnSearch           = findViewById(R.id.imageButton17)
            progressBar         = findViewById(R.id.progress_bar)
            emptyStateContainer = findViewById(R.id.empty_state_container)

            editTextSearch.hint     = "Cari Nama Guru"
            progressBar?.visibility     = View.GONE
            // FIX: RecyclerView mulai VISIBLE (bukan GONE) agar wrap_content bisa di-measure
            recyclerView.visibility     = View.VISIBLE
            emptyStateContainer?.visibility = View.GONE

            Log.d(TAG, "initView() berhasil")
            true
        } catch (e: Exception) {
            Log.e(TAG, "initView() exception: ${e.message}", e)
            false
        }
    }

    private fun setupRecyclerView() {
        Log.d(TAG, "setupRecyclerView()")
        recyclerView.layoutManager = LinearLayoutManager(this)
        // FIX: setHasFixedSize(false) karena list dinamis
        // FIX: isNestedScrollingEnabled=false agar scroll dihandle ScrollView parent
        recyclerView.setHasFixedSize(false)
        recyclerView.isNestedScrollingEnabled = false
        guruAdapter = GuruAdapter(
            guruList,
            onEditClick   = { guru, _ -> showEditDialog(guru) },
            onDeleteClick = { guru, _ -> showDeleteConfirmation(guru) }
        )
        recyclerView.adapter = guruAdapter
    }

    private suspend fun loadMajorsAsync() {
        when (val result = administrationRepository.getMajors()) {
            is Result.Success -> {
                majorList = result.data
                Log.d(TAG, "majorList berisi ${majorList.size} item")
            }
            is Result.Error -> Log.e(TAG, "Gagal memuat jurusan: ${result.message ?: result.exception.message}")
            else -> {}
        }
    }

    // FIX: loadData adalah suspend fun — dipanggil dari dalam lifecycleScope.launch
    // JANGAN panggil lifecycleScope.launch lagi di dalamnya (nested launch = race condition)
    private suspend fun loadData(search: String? = null) {
        Log.d(TAG, "loadData() dipanggil, search=$search")
        progressBar?.visibility          = View.VISIBLE
        emptyStateContainer?.visibility  = View.GONE
        recyclerView.visibility          = View.VISIBLE

        try {
            when (val result = teacherRepository.getTeachers(search = search)) {
                is Result.Success -> {
                    Log.d(TAG, "getTeachers sukses: ${result.data.size} item")

                    val newGuruList = result.data.map { t ->
                        Guru(
                            id      = t.id ?: 0,
                            name    = t.name ?: "Unknown",
                            nip     = t.nip,
                            phone   = t.phone,
                            // FIX: jabatan di backend disimpan sebagai JSON array,
                            // JabatanDeserializer sudah mengubahnya ke String,
                            // tapi jika masih berformat "[\"Guru\"]" bersihkan di sini
                            jabatan = t.jabatan.trim('[', ']', '"').ifBlank { "Guru" },
                            majorId = t.major?.id,
                            email   = t.email
                        )
                    }

                    guruList.clear()
                    guruList.addAll(newGuruList)
                    // FIX: updateData langsung dengan list baru, bukan guruList
                    guruAdapter.updateData(newGuruList)

                    if (newGuruList.isEmpty()) {
                        recyclerView.visibility          = View.GONE
                        emptyStateContainer?.visibility  = View.VISIBLE
                        showToast("Tidak ada data guru ditemukan")
                    } else {
                        emptyStateContainer?.visibility  = View.GONE
                        recyclerView.visibility          = View.VISIBLE
                        // Paksa re-layout agar wrap_content dihitung ulang
                        recyclerView.post { recyclerView.requestLayout() }
                    }
                }
                is Result.Error -> {
                    Log.e(TAG, "ERROR getTeachers: ${result.message}")
                    showError("Gagal memuat data guru: ${result.message ?: result.exception.message}")
                    if (guruList.isEmpty()) {
                        recyclerView.visibility          = View.GONE
                        emptyStateContainer?.visibility  = View.VISIBLE
                    }
                }
                else -> {}
            }
        } catch (e: Exception) {
            Log.e(TAG, "EXCEPTION loadData: ${e.message}", e)
            showError("Gagal memuat data: ${e.message}")
            if (guruList.isEmpty()) {
                recyclerView.visibility          = View.GONE
                emptyStateContainer?.visibility  = View.VISIBLE
            }
        } finally {
            progressBar?.visibility = View.GONE
            Log.d(TAG, "loadData() selesai")
        }
    }

    private fun setupActions() {
        btnBack.setOnClickListener   { finish() }
        btnTambah.setOnClickListener { showAddDialog() }
        btnSearch.setOnClickListener { performSearch() }
        editTextSearch.setOnEditorActionListener { _, actionId, _ ->
            if (actionId == EditorInfo.IME_ACTION_SEARCH) {
                performSearch()
                true
            } else false
        }
    }

    // FIX: performSearch harus launch coroutine karena loadData sekarang suspend
    private fun performSearch() {
        val query = editTextSearch.text.toString().trim()
        lifecycleScope.launch {
            loadData(search = query.ifEmpty { null })
        }
    }

    private fun showAddDialog() {
        val dialog = Dialog(this)
        dialog.setContentView(R.layout.pop_up_tambah_data_guru)
        dialog.window?.setLayout(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT)
        dialog.setCancelable(true)

        val inputNama        = dialog.findViewById<EditText>(R.id.input_keterangan_nama)
        val inputNip         = dialog.findViewById<EditText>(R.id.input_keterangan_nip)
        val inputNomorHp     = dialog.findViewById<EditText>(R.id.input_keterangan_kode)
        val inputRole        = dialog.findViewById<EditText>(R.id.input_keterangan_role)
        val btnDropdownRole  = dialog.findViewById<ImageButton>(R.id.imageButton9)
        val inputBidang      = dialog.findViewById<EditText>(R.id.input_bidang)
        val inputKonsentrasi = dialog.findViewById<EditText>(R.id.input_konsentrasi)
        val etJurusan        = dialog.findViewById<EditText>(R.id.et_jurusan)
        val arrowJurusan     = dialog.findViewById<ImageButton>(R.id.arrow_jurusan)
        val btnBatal         = dialog.findViewById<Button>(R.id.btn_batal)
        val btnSimpan        = dialog.findViewById<Button>(R.id.btn_simpan)

        var selectedMajorId: Int? = null

        // Setup Jurusan dropdown
        etJurusan?.isFocusable = false
        etJurusan?.isClickable = true

        val showMajorDropdown: () -> Unit = {
            val majorNames = majorList.map { it.name ?: "-" }.toTypedArray()
            if (majorNames.isNotEmpty()) {
                AlertDialog.Builder(this)
                    .setTitle("Pilih Jurusan")
                    .setItems(majorNames) { _, i ->
                        selectedMajorId = majorList[i].id
                        etJurusan?.setText(majorNames[i])
                    }
                    .show()
            } else {
                showToast("Data jurusan tidak tersedia")
            }
        }
        etJurusan?.setOnClickListener    { showMajorDropdown() }
        arrowJurusan?.setOnClickListener { showMajorDropdown() }

        // Setup Role dropdown
        val roleClickListener = View.OnClickListener {
            AlertDialog.Builder(this)
                .setTitle("Pilih Role")
                .setItems(roleOptions.toTypedArray()) { _, which ->
                    inputRole.setText(roleOptions[which])
                }
                .show()
        }
        inputRole.isFocusable   = false
        inputRole.isClickable   = true
        inputRole.setOnClickListener(roleClickListener)
        btnDropdownRole.setOnClickListener(roleClickListener)

        btnBatal.setOnClickListener { dialog.dismiss() }

        btnSimpan.setOnClickListener {
            val nama        = inputNama.text.toString().trim()
            val nip         = inputNip.text.toString().trim()
            val nomorHp     = inputNomorHp.text.toString().trim()
            val role        = inputRole.text.toString().trim()
            val bidang      = inputBidang?.text?.toString()?.trim()?.ifEmpty { null }
            val konsentrasi = inputKonsentrasi?.text?.toString()?.trim()?.ifEmpty { null }

            if (nama.isEmpty() || nip.isEmpty() || role.isEmpty()) {
                Toast.makeText(this, "Harap isi nama, NIP, dan role", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            // Email auto-generate dari NIP (tidak ada field email di form)
            val email = "$nip@guru.sch.id"

            val request = StoreTeacherRequest(
                name                = nama,
                nip                 = nip,
                phone               = nomorHp.ifEmpty { null },
                email               = email,
                jabatan             = role,
                majorId             = selectedMajorId,
                bidang              = bidang,
                konsentrasiKeahlian = konsentrasi
            )

            btnSimpan.isEnabled = false
            btnBatal.isEnabled  = false

            lifecycleScope.launch {
                when (val result = teacherRepository.createTeacher(request)) {
                    is Result.Success -> {
                        dialog.dismiss()
                        showSuccess("Data berhasil ditambahkan")
                        loadData()
                    }
                    is Result.Error -> {
                        btnSimpan.isEnabled = true
                        btnBatal.isEnabled  = true
                        showError(result.message ?: result.exception.message ?: "Gagal menambahkan data")
                    }
                    else -> {}
                }
            }
        }

        dialog.show()
    }

    private fun showEditDialog(guru: Guru) {
        val dialog = Dialog(this)
        dialog.setContentView(R.layout.pop_up_edit_guru)
        dialog.window?.setLayout(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT)
        dialog.setCancelable(true)

        val inputNama        = dialog.findViewById<EditText>(R.id.input_keterangan_nama)
        val inputNip         = dialog.findViewById<EditText>(R.id.input_keterangan_nip)
        val inputNomorHp     = dialog.findViewById<EditText>(R.id.input_keterangan_kode)
        val inputRole        = dialog.findViewById<EditText>(R.id.input_keterangan_role)
        val btnDropdownRole  = dialog.findViewById<ImageButton>(R.id.imageButton9)
        val inputBidang      = dialog.findViewById<EditText>(R.id.input_bidang)
        val inputKonsentrasi = dialog.findViewById<EditText>(R.id.input_konsentrasi)
        val etJurusan        = dialog.findViewById<EditText>(R.id.et_jurusan)
        val arrowJurusan     = dialog.findViewById<ImageButton>(R.id.arrow_jurusan)
        val btnBatal         = dialog.findViewById<Button>(R.id.btn_batal)
        val btnSimpan        = dialog.findViewById<Button>(R.id.btn_simpan)

        // Pre-fill data existing
        inputNama.setText(guru.name)
        inputNip.setText(guru.nip)
        inputNomorHp.setText(guru.phone)
        inputRole.setText(guru.jabatan)

        var selectedMajorId: Int? = guru.majorId

        // Setup Jurusan dropdown + pre-fill nama dari majorId
        etJurusan?.isFocusable = false
        etJurusan?.isClickable = true

        if (guru.majorId != null) {
            val major = majorList.find { it.id == guru.majorId }
            etJurusan?.setText(major?.name ?: "")
        }

        val showMajorDropdown: () -> Unit = {
            val majorNames = majorList.map { it.name ?: "-" }.toTypedArray()
            if (majorNames.isNotEmpty()) {
                AlertDialog.Builder(this)
                    .setTitle("Pilih Jurusan")
                    .setItems(majorNames) { _, i ->
                        selectedMajorId = majorList[i].id
                        etJurusan?.setText(majorNames[i])
                    }
                    .show()
            } else {
                showToast("Data jurusan tidak tersedia")
            }
        }
        etJurusan?.setOnClickListener    { showMajorDropdown() }
        arrowJurusan?.setOnClickListener { showMajorDropdown() }

        // Setup Role dropdown
        val roleClickListener = View.OnClickListener {
            AlertDialog.Builder(this)
                .setTitle("Pilih Role")
                .setItems(roleOptions.toTypedArray()) { _, which ->
                    inputRole.setText(roleOptions[which])
                }
                .show()
        }
        inputRole.isFocusable   = false
        inputRole.isClickable   = true
        inputRole.setOnClickListener(roleClickListener)
        btnDropdownRole.setOnClickListener(roleClickListener)

        btnBatal.setOnClickListener { dialog.dismiss() }

        btnSimpan.setOnClickListener {
            val nama        = inputNama.text.toString().trim()
            val nip         = inputNip.text.toString().trim()
            val nomorHp     = inputNomorHp.text.toString().trim()
            val role        = inputRole.text.toString().trim()
            val bidang      = inputBidang?.text?.toString()?.trim()?.ifEmpty { null }
            val konsentrasi = inputKonsentrasi?.text?.toString()?.trim()?.ifEmpty { null }

            if (nama.isEmpty() || nip.isEmpty() || role.isEmpty()) {
                Toast.makeText(this, "Harap isi nama, NIP, dan role", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val request = UpdateTeacherRequest(
                name                = nama,
                nip                 = nip,
                phone               = nomorHp.ifEmpty { null },
                jabatan             = role,
                majorId             = selectedMajorId,
                bidang              = bidang,
                konsentrasiKeahlian = konsentrasi
            )

            btnSimpan.isEnabled = false
            btnBatal.isEnabled  = false

            lifecycleScope.launch {
                when (val result = teacherRepository.updateTeacher(guru.id, request)) {
                    is Result.Success -> {
                        dialog.dismiss()
                        showSuccess("Data berhasil diupdate")
                        loadData()
                    }
                    is Result.Error -> {
                        btnSimpan.isEnabled = true
                        btnBatal.isEnabled  = true
                        showError(result.message ?: result.exception.message ?: "Gagal mengupdate data")
                    }
                    else -> {}
                }
            }
        }

        dialog.show()
    }

    private fun showDeleteConfirmation(guru: Guru) {
        AlertDialog.Builder(this)
            .setTitle("Konfirmasi Hapus")
            .setMessage("Apakah Anda yakin akan menghapus data ${guru.name}?")
            .setPositiveButton("Ya") { _, _ ->
                lifecycleScope.launch {
                    when (val result = teacherRepository.deleteTeacher(guru.id)) {
                        is Result.Success -> {
                            showSuccess("Data berhasil dihapus")
                            loadData() // suspend, aman di sini karena sudah dalam launch
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