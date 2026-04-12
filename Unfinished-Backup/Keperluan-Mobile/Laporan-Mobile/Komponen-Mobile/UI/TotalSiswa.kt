package com.example.ritamesa

import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.util.Log
import android.view.View
import android.view.ViewGroup
import android.view.inputmethod.EditorInfo
import android.widget.*
import androidx.appcompat.app.AlertDialog
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.ritamesa.api.Result
import com.example.ritamesa.api.models.Major
import com.example.ritamesa.api.models.StoreStudentRequest
import com.example.ritamesa.api.models.UpdateStudentRequest
import com.example.ritamesa.model.ModelSiswa
import kotlinx.coroutines.launch
import org.json.JSONArray

class TotalSiswa : BaseNetworkActivity() {

    companion object {
        private const val TAG = "TOTAL_SISWA"
    }

    private lateinit var rvSiswa: RecyclerView
    private lateinit var etSearch: EditText
    private lateinit var btnBack: ImageButton
    private lateinit var btnTambah: LinearLayout
    private lateinit var btnSearch: ImageButton
    private var progressBar: ProgressBar? = null
    private var emptyStateContainer: LinearLayout? = null

    private lateinit var siswaAdapter: SiswaAdapter
    private val siswaList = mutableListOf<ModelSiswa>()
    private var majorList = listOf<Major>()

    private data class KelasDropdown(val id: Int, val name: String)
    private var kelasDropdownList = listOf<KelasDropdown>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Log.d(TAG, "onCreate() dipanggil")
        setContentView(R.layout.total_siswa)

        if (!initViews()) {
            Log.e(TAG, "initViews() gagal — ada view yang tidak ditemukan di layout")
            showError("Terjadi kesalahan saat memuat halaman")
            return
        }

        setupRecyclerView()
        setupListeners()
        loadDropdownData()
    }

    private fun initViews(): Boolean {
        return try {
            rvSiswa = findViewById(R.id.rv_siswa)
            etSearch = findViewById(R.id.et_search_siswa)
            btnBack = findViewById(R.id.btn_back_siswa)
            btnTambah = findViewById(R.id.btn_tambah_siswa)
            btnSearch = findViewById(R.id.btn_search_siswa)
            progressBar = findViewById(R.id.progress_bar)
            emptyStateContainer = findViewById(R.id.empty_state_container)

            Log.d(TAG, "initViews() berhasil")
            true
        } catch (e: Exception) {
            Log.e(TAG, "initViews() exception: ${e.message}", e)
            false
        }
    }

    private fun setupRecyclerView() {
        Log.d(TAG, "setupRecyclerView()")
        rvSiswa.layoutManager = LinearLayoutManager(this)
        rvSiswa.setHasFixedSize(true)
        siswaAdapter = SiswaAdapter(
            onEditClick = { siswa -> showEditDialog(siswa) },
            onDeleteClick = { siswa -> showDeleteConfirmation(siswa) }
        )
        rvSiswa.adapter = siswaAdapter
    }

    private fun loadDropdownData() {
        Log.d(TAG, "loadDropdownData() dipanggil")
        lifecycleScope.launch {
            // Jurusan
            when (val r = administrationRepository.getMajors()) {
                is Result.Success -> {
                    majorList = r.data
                    Log.d(TAG, "majorList berisi ${majorList.size} item")
                }
                is Result.Error -> {
                    showError("Gagal memuat jurusan: ${r.message ?: r.exception.message}")
                }
                else -> {}
            }

            // Kelas
            try {
                Log.d(TAG, "memuat kelas via PaginationHelper")
                val allKelas = PaginationHelper.loadAll(this@TotalSiswa, "classes")
                val list = mutableListOf<KelasDropdown>()
                for (i in 0 until allKelas.length()) {
                    val obj = allKelas.getJSONObject(i)
                    list.add(KelasDropdown(
                        id = obj.optInt("id", 0),
                        name = obj.optString("name", "-")
                    ))
                }
                kelasDropdownList = list
                Log.d(TAG, "kelasDropdownList berisi ${kelasDropdownList.size} item")
            } catch (e: Exception) {
                Log.e(TAG, "Gagal memuat kelas: ${e.message}", e)
                showError("Gagal memuat kelas: ${e.message}")
            }

            loadStudents()
        }
    }

    private fun loadStudents(search: String? = null) {
        Log.d(TAG, "loadStudents() dipanggil, search=$search")
        progressBar?.visibility = View.VISIBLE
        emptyStateContainer?.visibility = View.GONE
        rvSiswa.visibility = View.GONE

        lifecycleScope.launch {
            try {
                val extra = if (!search.isNullOrEmpty()) "&search=${search}" else ""
                Log.d(TAG, "memanggil PaginationHelper untuk endpoint 'students'")

                val allData: JSONArray = PaginationHelper.loadAll(
                    this@TotalSiswa, "students", extraParams = extra
                )

                Log.d(TAG, "PaginationHelper selesai, total item: ${allData.length()}")

                siswaList.clear()
                for (i in 0 until allData.length()) {
                    val obj = allData.getJSONObject(i)

                    val classNameRaw = obj.opt("class_name")
                    val className: String = when {
                        classNameRaw is String && classNameRaw.isNotEmpty() -> classNameRaw
                        obj.has("class") && !obj.isNull("class") -> {
                            obj.optJSONObject("class")?.optString("name", "-") ?: "-"
                        }
                        else -> "-"
                    }

                    val classId: Int = if (obj.has("class_id") && obj.optInt("class_id", 0) != 0) {
                        obj.optInt("class_id", 0)
                    } else {
                        obj.optJSONObject("class")?.optInt("id", 0) ?: 0
                    }

                    val majorNameRaw = obj.opt("major_name")
                    val majorName: String = when {
                        majorNameRaw is String && majorNameRaw.isNotEmpty() -> majorNameRaw
                        obj.has("major") && !obj.isNull("major") -> {
                            obj.optJSONObject("major")?.optString("name", "-") ?: "-"
                        }
                        else -> "-"
                    }

                    val majorId: Int = if (obj.has("major_id") && obj.optInt("major_id", 0) != 0) {
                        obj.optInt("major_id", 0)
                    } else {
                        obj.optJSONObject("major")?.optInt("id", 0) ?: 0
                    }

                    val gender = obj.optString("gender", "")
                    val genderDisplay = when (gender) {
                        "L" -> "Laki-laki"
                        "P" -> "Perempuan"
                        else -> gender
                    }

                    siswaList.add(ModelSiswa(
                        id = obj.optInt("id", 0),
                        name = obj.optString("name", ""),
                        nisn = obj.optString("nisn", ""),
                        nis = obj.optString("nis", "").ifEmpty { null },
                        gender = genderDisplay,
                        class_id = classId,
                        class_name = className,
                        major_id = majorId,
                        major_name = majorName,
                        parent_phone = obj.optString("parent_phone", "")
                    ))
                }

                Log.d(TAG, "siswaList berisi ${siswaList.size} item, memanggil updateData()")
                siswaAdapter.updateData(siswaList)

                if (siswaList.isEmpty()) {
                    emptyStateContainer?.visibility = View.VISIBLE
                    rvSiswa.visibility = View.GONE
                    showToast("Tidak ada data siswa ditemukan")
                } else {
                    emptyStateContainer?.visibility = View.GONE
                    rvSiswa.visibility = View.VISIBLE
                }

            } catch (e: Exception) {
                Log.e(TAG, "ERROR di loadStudents: ${e.message}", e)
                showError("Gagal memuat data siswa: ${e.message}")
                emptyStateContainer?.visibility = View.VISIBLE
                rvSiswa.visibility = View.GONE
            } finally {
                progressBar?.visibility = View.GONE
            }
        }
    }

    private fun setupListeners() {
        btnBack.setOnClickListener { finish() }
        btnTambah.setOnClickListener { showAddDialog() }
        btnSearch.setOnClickListener { performSearch() }

        etSearch.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {}
        })
        etSearch.setOnEditorActionListener { _, actionId, _ ->
            if (actionId == EditorInfo.IME_ACTION_SEARCH) {
                performSearch()
                true
            } else false
        }
    }

    private fun performSearch() {
        val query = etSearch.text.toString().trim()
        loadStudents(search = query.ifEmpty { null })
    }

    private fun showAddDialog() {
        val dialogView = layoutInflater.inflate(R.layout.pop_up_tambah_data_siswa, null)
        val dialog = AlertDialog.Builder(this)
            .setView(dialogView)
            .setCancelable(true)
            .create()
        dialog.show()
        dialog.window?.setBackgroundDrawableResource(android.R.color.transparent)
        dialog.window?.setLayout(
            (resources.displayMetrics.widthPixels * 0.9).toInt(),
            ViewGroup.LayoutParams.WRAP_CONTENT
        )

        val etNama = dialogView.findViewById<EditText>(R.id.et_nama_siswa)
        val etJenisKelamin = dialogView.findViewById<EditText>(R.id.et_jenis_kelamin)
        val btnArrowJk = dialogView.findViewById<ImageButton>(R.id.arrow_jenis_kelamin)
        val etNisn = dialogView.findViewById<EditText>(R.id.et_nisn)
        val etJurusan = dialogView.findViewById<EditText>(R.id.et_jurusan)
        val btnArrowJurusan = dialogView.findViewById<ImageButton>(R.id.arrow_jurusan)
        val etKelas = dialogView.findViewById<EditText>(R.id.et_kelas)
        val btnArrowKelas = dialogView.findViewById<ImageButton>(R.id.arrow_kelas)
        val etNoTelpOrtu = dialogView.findViewById<EditText>(R.id.et_no_telp_ortu)
        val btnBatal = dialogView.findViewById<Button>(R.id.btn_batal)
        val btnSimpan = dialogView.findViewById<Button>(R.id.btn_simpan)

        var selectedClassId: Int? = null
        var selectedMajorId: Int? = null
        var selectedGender = ""

        // Setup Jenis Kelamin dropdown
        etJenisKelamin.isFocusable = false
        etJenisKelamin.isClickable = true
        val showGenderDropdown = {
            val options = arrayOf("Laki-laki", "Perempuan")
            val apiValues = arrayOf("L", "P")
            AlertDialog.Builder(this)
                .setTitle("Pilih Jenis Kelamin")
                .setItems(options) { _, which ->
                    etJenisKelamin.setText(options[which])
                    selectedGender = apiValues[which]
                }
                .show()
        }
        etJenisKelamin.setOnClickListener { showGenderDropdown() }
        btnArrowJk.setOnClickListener { showGenderDropdown() }

        // Setup Jurusan dropdown
        etJurusan.isFocusable = false
        etJurusan.isClickable = true
        val showMajorDropdown: () -> Unit = {
            val names = majorList.map { it.name ?: "-" }.toTypedArray()
            if (names.isNotEmpty()) {
                AlertDialog.Builder(this).setTitle("Pilih Jurusan")
                    .setItems(names) { _, i ->
                        selectedMajorId = majorList[i].id
                        etJurusan.setText(names[i])
                    }.show()
            } else {
                showToast("Data jurusan tidak tersedia")
            }
        }
        etJurusan.setOnClickListener { showMajorDropdown() }
        btnArrowJurusan.setOnClickListener { showMajorDropdown() }

        // Setup Kelas dropdown
        etKelas.isFocusable = false
        etKelas.isClickable = true
        val showClassDropdown: () -> Unit = {
            val names = kelasDropdownList.map { it.name }.toTypedArray()
            if (names.isNotEmpty()) {
                AlertDialog.Builder(this).setTitle("Pilih Kelas")
                    .setItems(names) { _, i ->
                        selectedClassId = kelasDropdownList[i].id
                        etKelas.setText(names[i])
                    }.show()
            } else {
                showToast("Data kelas tidak tersedia")
            }
        }
        etKelas.setOnClickListener { showClassDropdown() }
        btnArrowKelas.setOnClickListener { showClassDropdown() }

        btnBatal.setOnClickListener { dialog.dismiss() }

        btnSimpan.setOnClickListener {
            val nama = etNama.text.toString().trim()
            val nisn = etNisn.text.toString().trim()
            val noTelp = etNoTelpOrtu.text.toString().trim()

            // Validasi
            if (nama.isEmpty()) {
                Toast.makeText(this, "Nama tidak boleh kosong", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            if (nisn.isEmpty()) {
                Toast.makeText(this, "NISN tidak boleh kosong", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            if (selectedGender.isEmpty()) {
                Toast.makeText(this, "Pilih jenis kelamin terlebih dahulu", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            if (selectedMajorId == null) {
                Toast.makeText(this, "Pilih jurusan terlebih dahulu", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            if (selectedClassId == null) {
                Toast.makeText(this, "Pilih kelas terlebih dahulu", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            // Generate email dari NISN
            val email = "$nisn@siswa.sch.id"

            // Parent phone harus null jika kosong, bukan string "null"
            val parentPhone = if (noTelp.isNotEmpty()) noTelp else null

            val request = StoreStudentRequest(
                name = nama,
                nisn = nisn,
                nis = nisn,
                gender = selectedGender.ifEmpty { null },
                email = email,
                classId = selectedClassId!!,
                majorId = selectedMajorId,
                parentPhone = parentPhone,
                address = "-"
            )

            Log.d(TAG, "Sending create request: $request")

            btnSimpan.isEnabled = false
            btnBatal.isEnabled = false

            lifecycleScope.launch {
                when (val result = studentRepository.createStudent(request)) {
                    is Result.Success -> {
                        dialog.dismiss()
                        Toast.makeText(this@TotalSiswa, "Data berhasil ditambahkan", Toast.LENGTH_SHORT).show()
                        loadStudents()
                    }
                    is Result.Error -> {
                        btnSimpan.isEnabled = true
                        btnBatal.isEnabled = true
                        val errorMsg = result.message ?: result.exception.message ?: "Gagal menambahkan data"
                        Log.e(TAG, "Create error: $errorMsg")
                        showError(errorMsg)
                    }
                    else -> {}
                }
            }
        }
    }

    private fun showEditDialog(siswa: ModelSiswa) {
        val dialogView = layoutInflater.inflate(R.layout.pop_up_edit_data_siswa, null)
        val dialog = AlertDialog.Builder(this)
            .setView(dialogView)
            .setCancelable(true)
            .create()
        dialog.show()
        dialog.window?.setBackgroundDrawableResource(android.R.color.transparent)
        dialog.window?.setLayout(
            (resources.displayMetrics.widthPixels * 0.9).toInt(),
            ViewGroup.LayoutParams.WRAP_CONTENT
        )

        val etNama = dialogView.findViewById<EditText>(R.id.et_nama_siswa)
        val etJenisKelamin = dialogView.findViewById<EditText>(R.id.et_jenis_kelamin)
        val btnArrowJk = dialogView.findViewById<ImageButton>(R.id.arrow_jenis_kelamin)
        val etNisn = dialogView.findViewById<EditText>(R.id.et_nisn)
        val etJurusan = dialogView.findViewById<EditText>(R.id.et_jurusan)
        val btnArrowJurusan = dialogView.findViewById<ImageButton>(R.id.arrow_jurusan)
        val etKelas = dialogView.findViewById<EditText>(R.id.et_kelas)
        val btnArrowKelas = dialogView.findViewById<ImageButton>(R.id.arrow_kelas)
        val etNoTelpOrtu = dialogView.findViewById<EditText>(R.id.et_no_telp_ortu)
        val btnBatal = dialogView.findViewById<Button>(R.id.btn_batal)
        val btnSimpan = dialogView.findViewById<Button>(R.id.btn_simpan)

        var selectedClassId: Int? = siswa.class_id
        var selectedMajorId: Int? = siswa.major_id
        var selectedGender = siswa.getGenderForApi()

        etNama.setText(siswa.name)
        etJenisKelamin.setText(siswa.gender)
        etNisn.setText(siswa.nisn)
        etJurusan.setText(siswa.major_name)
        etKelas.setText(siswa.class_name)
        etNoTelpOrtu.setText(siswa.parent_phone)

        // Setup Jenis Kelamin dropdown
        etJenisKelamin.isFocusable = false
        etJenisKelamin.isClickable = true
        val showGenderDropdown = {
            val options = arrayOf("Laki-laki", "Perempuan")
            val apiValues = arrayOf("L", "P")
            AlertDialog.Builder(this)
                .setTitle("Pilih Jenis Kelamin")
                .setItems(options) { _, which ->
                    etJenisKelamin.setText(options[which])
                    selectedGender = apiValues[which]
                }
                .show()
        }
        etJenisKelamin.setOnClickListener { showGenderDropdown() }
        btnArrowJk.setOnClickListener { showGenderDropdown() }

        // Setup Jurusan dropdown
        etJurusan.isFocusable = false
        etJurusan.isClickable = true
        val showMajorDropdown: () -> Unit = {
            val names = majorList.map { it.name ?: "-" }.toTypedArray()
            if (names.isNotEmpty()) {
                AlertDialog.Builder(this).setTitle("Pilih Jurusan")
                    .setItems(names) { _, i ->
                        selectedMajorId = majorList[i].id
                        etJurusan.setText(names[i])
                    }.show()
            } else {
                showToast("Data jurusan tidak tersedia")
            }
        }
        etJurusan.setOnClickListener { showMajorDropdown() }
        btnArrowJurusan.setOnClickListener { showMajorDropdown() }

        // Setup Kelas dropdown
        etKelas.isFocusable = false
        etKelas.isClickable = true
        val showClassDropdown: () -> Unit = {
            val names = kelasDropdownList.map { it.name }.toTypedArray()
            if (names.isNotEmpty()) {
                AlertDialog.Builder(this).setTitle("Pilih Kelas")
                    .setItems(names) { _, i ->
                        selectedClassId = kelasDropdownList[i].id
                        etKelas.setText(names[i])
                    }.show()
            } else {
                showToast("Data kelas tidak tersedia")
            }
        }
        etKelas.setOnClickListener { showClassDropdown() }
        btnArrowKelas.setOnClickListener { showClassDropdown() }

        btnBatal.setOnClickListener { dialog.dismiss() }

        btnSimpan.setOnClickListener {
            val nama = etNama.text.toString().trim()
            val nisn = etNisn.text.toString().trim()
            val noTelp = etNoTelpOrtu.text.toString().trim()

            // Validasi
            if (nama.isEmpty()) {
                Toast.makeText(this, "Nama tidak boleh kosong", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            if (nisn.isEmpty()) {
                Toast.makeText(this, "NISN tidak boleh kosong", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            if (selectedGender.isEmpty()) {
                Toast.makeText(this, "Pilih jenis kelamin terlebih dahulu", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            if (selectedClassId == null) {
                Toast.makeText(this, "Pilih kelas terlebih dahulu", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val siswaId = siswa.id ?: run {
                Toast.makeText(this, "ID siswa tidak valid", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val parentPhone = if (noTelp.isNotEmpty()) noTelp else null

            val request = UpdateStudentRequest(
                name = nama,
                nisn = nisn,
                gender = selectedGender.ifEmpty { null },
                classId = selectedClassId,
                majorId = selectedMajorId,
                parentPhone = parentPhone,
                address = null
            )

            Log.d(TAG, "Sending update request: $request")

            btnSimpan.isEnabled = false
            btnBatal.isEnabled = false

            lifecycleScope.launch {
                when (val result = studentRepository.updateStudent(siswaId, request)) {
                    is Result.Success -> {
                        dialog.dismiss()
                        Toast.makeText(this@TotalSiswa, "Data berhasil diupdate", Toast.LENGTH_SHORT).show()
                        loadStudents()
                    }
                    is Result.Error -> {
                        btnSimpan.isEnabled = true
                        btnBatal.isEnabled = true
                        val errorMsg = result.message ?: result.exception.message ?: "Gagal mengupdate data"
                        Log.e(TAG, "Update error: $errorMsg")
                        showError(errorMsg)
                    }
                    else -> {}
                }
            }
        }
    }

    private fun showDeleteConfirmation(siswa: ModelSiswa) {
        AlertDialog.Builder(this)
            .setTitle("Hapus Data")
            .setMessage("Apakah Anda yakin ingin menghapus data ${siswa.name}?")
            .setPositiveButton("Hapus") { _, _ ->
                val siswaId = siswa.id ?: run {
                    Toast.makeText(this, "ID siswa tidak valid", Toast.LENGTH_SHORT).show()
                    return@setPositiveButton
                }
                lifecycleScope.launch {
                    when (val result = studentRepository.deleteStudent(siswaId)) {
                        is Result.Success -> {
                            Toast.makeText(this@TotalSiswa, "Data berhasil dihapus", Toast.LENGTH_SHORT).show()
                            loadStudents()
                        }
                        is Result.Error -> {
                            val errorMsg = result.message ?: result.exception.message ?: "Gagal menghapus data"
                            Log.e(TAG, "Delete error: $errorMsg")
                            showError(errorMsg)
                        }
                        else -> {}
                    }
                }
            }
            .setNegativeButton("Batal", null)
            .show()
    }
}