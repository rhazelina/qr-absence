package com.example.ritamesa

import android.app.Dialog
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.inputmethod.EditorInfo
import android.widget.*
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.ritamesa.data.api.ApiClient
import com.example.ritamesa.data.api.ApiService
import com.example.ritamesa.data.dto.ClassRoomDto
import com.example.ritamesa.data.dto.StudentDto
import kotlinx.coroutines.launch

class TotalSiswa : AppCompatActivity() {

    // ===== DATA CLASS =====
    data class ModelSiswa(
        val id: String,
        val nisn: String,
        val nama: String,
        val kelas: String,
        val classId: String
    )

    // ===== ADAPTER =====
    inner class SiswaAdapter(
        private var listSiswa: List<ModelSiswa>,
        private val onEditClick: (ModelSiswa) -> Unit,
        private val onDeleteClick: (ModelSiswa) -> Unit
    ) : RecyclerView.Adapter<SiswaAdapter.SiswaViewHolder>() {

        private var currentPage = 1
        private val itemsPerPage = 10

        inner class SiswaViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
            val tvNo: TextView = itemView.findViewById(R.id.tvNo)
            val tvNama: TextView = itemView.findViewById(R.id.tvNamaSiswa)
            val tvNisn: TextView = itemView.findViewById(R.id.tvNisn)
            val tvKelas: TextView = itemView.findViewById(R.id.tvKode)
            val btnEdit: LinearLayout = itemView.findViewById(R.id.btnEdit)
            val btnHapus: LinearLayout = itemView.findViewById(R.id.btnHapus)
        }

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): SiswaViewHolder {
            val view = LayoutInflater.from(parent.context).inflate(R.layout.item_crud_datasiswa, parent, false)
            return SiswaViewHolder(view)
        }

        override fun onBindViewHolder(holder: SiswaViewHolder, position: Int) {
            val siswa = listSiswa[position]
            val nomorUrut = ((currentPage - 1) * itemsPerPage) + position + 1
            holder.tvNo.text = nomorUrut.toString()
            holder.tvNama.text = siswa.nama
            holder.tvNisn.text = siswa.nisn
            holder.tvKelas.text = siswa.kelas

            holder.btnEdit.setOnClickListener { onEditClick(siswa) }
            holder.btnHapus.setOnClickListener { onDeleteClick(siswa) }
        }

        override fun getItemCount(): Int = listSiswa.size

        fun updateData(newList: List<ModelSiswa>, page: Int) {
            listSiswa = newList
            currentPage = page
            notifyDataSetChanged()
        }
    }

    // ===== COMPONENTS =====
    private lateinit var recyclerView: RecyclerView
    private lateinit var siswaAdapter: SiswaAdapter
    private lateinit var btnTambahContainer: View
    private lateinit var editTextSearch: EditText
    private lateinit var ivSearch: ImageButton
    private lateinit var btnBack: ImageButton

    // ===== API =====
    private lateinit var apiService: ApiService

    // ===== STATE =====
    private val masterSiswa = arrayListOf<ModelSiswa>()
    private val masterKelas = arrayListOf<ClassRoomDto>()

    // ===== PAGINATION =====
    private var currentPage = 1
    private val itemsPerPage = 10
    private var totalPages = 1
    private var filteredList = arrayListOf<ModelSiswa>()
    private var currentDisplayList = arrayListOf<ModelSiswa>()

    // ===== PAGINATION UI =====
    private lateinit var paginationContainer: LinearLayout
    private lateinit var tvPageInfo: TextView
    private lateinit var btnPrev: ImageButton
    private lateinit var btnNext: ImageButton
    private lateinit var etGoToPage: EditText
    private lateinit var btnGo: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.total_siswa)

        apiService = ApiClient.getService(this)

        initView()
        setupRecyclerView()
        setupPaginationLayout()
        setupActions()
        
        // Fetch real data
        fetchData()
    }

    private fun fetchData() {
        lifecycleScope.launch {
            try {
                // Fetch classes for dropdowns
                val classRes = apiService.getClasses()
                if (classRes.isSuccessful && classRes.body()?.data != null) {
                    masterKelas.clear()
                    masterKelas.addAll(classRes.body()!!.data!!)
                }

                // Fetch students
                val response = apiService.getStudents()
                if (response.isSuccessful && response.body() != null) {
                    val dtos = response.body()?.data ?: emptyList()
                    masterSiswa.clear()
                    masterSiswa.addAll(dtos.map { 
                        ModelSiswa(
                            id = """${it.id}""", 
                            nisn = it.nisn ?: "", 
                            nama = it.name ?: "", 
                            kelas = it.className ?: "Unknown",
                            classId = it.classId ?: ""
                        ) 
                    })
                    
                    searchSiswa() // Updates filtered list and paginates
                } else {
                    Toast.makeText(this@TotalSiswa, "Gagal mengambil data siswa", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Log.e("TotalSiswa", "Error fetching data", e)
                Toast.makeText(this@TotalSiswa, "Koneksi bermasalah: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun initView() {
        recyclerView = findViewById(R.id.rvSiswa)
        btnTambahContainer = findViewById(R.id.btnTambahSiswa)
        editTextSearch = findViewById(R.id.etSearchSiswa)
        ivSearch = findViewById(R.id.ivSearch)
        btnBack = findViewById(R.id.btnBack)
        editTextSearch.hint = "Cari nama/NISN/kelas"

        filteredList = ArrayList(masterSiswa)
        calculateTotalPages()
    }

    private fun setupRecyclerView() {
        recyclerView.layoutManager = LinearLayoutManager(this)
        recyclerView.setHasFixedSize(true)

        siswaAdapter = SiswaAdapter(
            currentDisplayList,
            onEditClick = { siswa -> showEditDialog(siswa) },
            onDeleteClick = { siswa -> showDeleteDialog(siswa) }
        )
        recyclerView.adapter = siswaAdapter
    }

    private fun setupPaginationLayout() {
        val constraintLayout = findViewById<androidx.constraintlayout.widget.ConstraintLayout>(R.id.main)

        paginationContainer = LinearLayout(this).apply {
            id = View.generateViewId()
            layoutParams = androidx.constraintlayout.widget.ConstraintLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            ).apply {
                topToBottom = R.id.rvSiswa
                startToStart = androidx.constraintlayout.widget.ConstraintLayout.LayoutParams.PARENT_ID
                endToEnd = androidx.constraintlayout.widget.ConstraintLayout.LayoutParams.PARENT_ID
                bottomToBottom = androidx.constraintlayout.widget.ConstraintLayout.LayoutParams.PARENT_ID
                setMargins(0, 10.dpToPx(), 0, 20.dpToPx())
            }
            orientation = LinearLayout.VERTICAL
            gravity = android.view.Gravity.CENTER
        }

        val navContainer = LinearLayout(this).apply {
            layoutParams = LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            )
            orientation = LinearLayout.HORIZONTAL
            gravity = android.view.Gravity.CENTER
        }

        btnPrev = ImageButton(this).apply {
            layoutParams = LinearLayout.LayoutParams(40.dpToPx(), 40.dpToPx())
            background = resources.getDrawable(R.drawable.rectangle_69, theme)
            setPadding(10.dpToPx(), 10.dpToPx(), 10.dpToPx(), 10.dpToPx())
            setImageResource(R.drawable.arrow_back)
            imageTintList = android.content.res.ColorStateList.valueOf(0xFFFFFFFF.toInt())
            scaleType = ImageView.ScaleType.FIT_CENTER
        }

        tvPageInfo = TextView(this).apply {
            layoutParams = LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            ).apply {
                setMargins(20.dpToPx(), 0, 20.dpToPx(), 0)
            }
            text = "0-0 dari 0 data"
            setTextColor(0xFFFFFFFF.toInt())
            textSize = 14f
            setTypeface(null, android.graphics.Typeface.BOLD)
        }

        btnNext = ImageButton(this).apply {
            layoutParams = LinearLayout.LayoutParams(40.dpToPx(), 40.dpToPx())
            background = resources.getDrawable(R.drawable.rectangle_69, theme)
            setPadding(10.dpToPx(), 10.dpToPx(), 10.dpToPx(), 10.dpToPx())
            setImageResource(R.drawable.arrow_back)
            rotation = 180f
            imageTintList = android.content.res.ColorStateList.valueOf(0xFFFFFFFF.toInt())
            scaleType = ImageView.ScaleType.FIT_CENTER
        }

        navContainer.addView(btnPrev)
        navContainer.addView(tvPageInfo)
        navContainer.addView(btnNext)

        val goToContainer = LinearLayout(this).apply {
            layoutParams = LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            ).apply {
                setMargins(0, 10.dpToPx(), 0, 0)
            }
            orientation = LinearLayout.HORIZONTAL
            gravity = android.view.Gravity.CENTER
        }

        val tvGoTo = TextView(this).apply {
            layoutParams = LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            )
            text = "Ke halaman: "
            setTextColor(0xFFFFFFFF.toInt())
            textSize = 14f
        }

        etGoToPage = EditText(this).apply {
            layoutParams = LinearLayout.LayoutParams(
                60.dpToPx(),
                ViewGroup.LayoutParams.WRAP_CONTENT
            ).apply {
                setMargins(8.dpToPx(), 0, 8.dpToPx(), 0)
            }
            background = resources.getDrawable(R.drawable.rectangle_69, theme)
            setPadding(8.dpToPx(), 4.dpToPx(), 8.dpToPx(), 4.dpToPx())
            inputType = android.text.InputType.TYPE_CLASS_NUMBER
            hint = "1"
            setTextColor(0xFFFFFFFF.toInt())
        }

        btnGo = Button(this).apply {
            layoutParams = LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            )
            text = "Go"
            setBackgroundResource(R.drawable.rectangle_69)
            setTextColor(0xFFFFFFFF.toInt())
            setPadding(16.dpToPx(), 8.dpToPx(), 16.dpToPx(), 8.dpToPx())
        }

        goToContainer.addView(tvGoTo)
        goToContainer.addView(etGoToPage)
        goToContainer.addView(btnGo)

        paginationContainer.addView(navContainer)
        paginationContainer.addView(goToContainer)
        constraintLayout.addView(paginationContainer)
    }

    private fun Int.dpToPx(): Int = (this * resources.displayMetrics.density).toInt()

    private fun setupActions() {
        btnBack.setOnClickListener { finish() }

        btnTambahContainer.setOnClickListener { showAddDialog() }

        ivSearch.setOnClickListener {
            currentPage = 1
            searchSiswa()
        }

        editTextSearch.setOnEditorActionListener { _, actionId, _ ->
            if (actionId == EditorInfo.IME_ACTION_SEARCH || actionId == EditorInfo.IME_ACTION_DONE) {
                currentPage = 1
                searchSiswa()
                true
            } else false
        }

        btnPrev.setOnClickListener {
            if (currentPage > 1) {
                currentPage--
                updateCurrentDisplayList()
            }
        }

        btnNext.setOnClickListener {
            if (currentPage < totalPages) {
                currentPage++
                updateCurrentDisplayList()
            }
        }

        btnGo.setOnClickListener {
            try {
                val page = etGoToPage.text.toString().toInt()
                if (page in 1..totalPages) {
                    currentPage = page
                    updateCurrentDisplayList()
                    etGoToPage.text.clear()
                } else {
                    Toast.makeText(this, "Halaman tidak valid! (1-$totalPages)", Toast.LENGTH_SHORT).show()
                }
            } catch (e: NumberFormatException) {
                Toast.makeText(this, "Masukkan nomor halaman yang valid!", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun calculateTotalPages() {
        totalPages = if (filteredList.isEmpty()) 1 else
            Math.ceil(filteredList.size.toDouble() / itemsPerPage).toInt()
        if (currentPage > totalPages) currentPage = totalPages
        if (currentPage < 1) currentPage = 1
    }

    private fun updateCurrentDisplayList() {
        val startIndex = (currentPage - 1) * itemsPerPage
        var endIndex = startIndex + itemsPerPage
        if (endIndex > filteredList.size) endIndex = filteredList.size

        currentDisplayList.clear()
        if (filteredList.isNotEmpty() && startIndex < filteredList.size) {
            currentDisplayList.addAll(filteredList.subList(startIndex, endIndex))
        }

        siswaAdapter.updateData(currentDisplayList, currentPage)
        updatePaginationInfo()
    }

    private fun updatePaginationInfo() {
        val startItem = if (filteredList.isEmpty()) 0 else ((currentPage - 1) * itemsPerPage) + 1
        val endItem = minOf(currentPage * itemsPerPage, filteredList.size)
        val totalItems = filteredList.size

        tvPageInfo.text = if (totalItems == 0) {
            "0 data"
        } else {
            "Halaman $currentPage dari $totalPages ($startItem-$endItem dari $totalItems)"
        }

        btnPrev.isEnabled = currentPage > 1
        btnNext.isEnabled = currentPage < totalPages
        btnPrev.alpha = if (btnPrev.isEnabled) 1.0f else 0.5f
        btnNext.alpha = if (btnNext.isEnabled) 1.0f else 0.5f
        etGoToPage.hint = "1-$totalPages"

        paginationContainer.visibility = if (totalItems > 0) View.VISIBLE else View.GONE
    }

    private fun updatePagination() {
        calculateTotalPages()
        updateCurrentDisplayList()
    }

    private fun searchSiswa() {
        val query = editTextSearch.text.toString().trim().lowercase()
        filteredList = if (query.isEmpty()) {
            ArrayList(masterSiswa)
        } else {
            ArrayList(masterSiswa.filter {
                it.nama.lowercase().contains(query) ||
                        it.nisn.contains(query) ||
                        it.kelas.lowercase().contains(query)
            })
        }

        if (filteredList.isEmpty() && query.isNotEmpty()) {
            Toast.makeText(this, "Tidak ditemukan siswa dengan kata kunci '$query'", Toast.LENGTH_SHORT).show()
        }

        currentPage = 1
        updatePagination()
    }

    private fun showAddDialog() {
        try {
            val dialog = Dialog(this)
            dialog.setContentView(R.layout.pop_up_tambah_data_siswa)
            dialog.window?.setBackgroundDrawableResource(android.R.color.transparent)
            dialog.window?.setLayout(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT)
            dialog.setCancelable(true)

            val inputNama = dialog.findViewById<EditText>(R.id.input_keterangan_nama)
            val inputNisn = dialog.findViewById<EditText>(R.id.input_keterangan_nisn)
            val inputKelas = dialog.findViewById<EditText>(R.id.input_keterangan_jurusan)
            val btnArrowKelas = dialog.findViewById<ImageButton>(R.id.arrowJurusan)
            val btnBatal = dialog.findViewById<Button>(R.id.btn_batal)
            val btnSimpan = dialog.findViewById<Button>(R.id.btn_simpan)

            inputKelas?.isFocusable = false
            inputKelas?.isClickable = true

            var selectedClassId = ""

            val showKelasDropdown = {
                val names = masterKelas.map { it.name ?: "" }.toTypedArray()
                AlertDialog.Builder(this)
                    .setTitle("Pilih Kelas")
                    .setItems(names) { _, which ->
                        inputKelas?.setText(names[which])
                        selectedClassId = masterKelas[which].id?.toString() ?: ""
                    }
                    .show()
            }

            btnArrowKelas?.setOnClickListener { showKelasDropdown() }
            inputKelas?.setOnClickListener { showKelasDropdown() }
            btnBatal?.setOnClickListener { dialog.dismiss() }

            btnSimpan?.setOnClickListener {
                val nama = inputNama?.text.toString().trim()
                val nisn = inputNisn?.text.toString().trim()

                if (nama.isEmpty() || nisn.isEmpty() || selectedClassId.isEmpty()) {
                    Toast.makeText(this, "Harap isi semua field!", Toast.LENGTH_SHORT).show()
                    return@setOnClickListener
                }

                showSaveConfirmation("Tambah") {
                    val newStudent = StudentDto(
                        id = null,
                        name = nama,
                        nisn = nisn,
                        nis = null,
                        email = null,
                        major = null,
                        majorName = null,
                        classId = selectedClassId,
                        className = null,
                        grade = null,
                        gender = "L",
                        phone = null,
                        address = null,
                        photoUrl = null
                    )

                    lifecycleScope.launch {
                        try {
                            val response = apiService.createStudent(newStudent)
                            if (response.isSuccessful) {
                                Toast.makeText(this@TotalSiswa, "Siswa berhasil ditambahkan", Toast.LENGTH_SHORT).show()
                                fetchData()
                                dialog.dismiss()
                            } else {
                                Toast.makeText(this@TotalSiswa, "Gagal menambahkan: ${response.message()}", Toast.LENGTH_LONG).show()
                            }
                        } catch (e: Exception) {
                            Toast.makeText(this@TotalSiswa, "Error: ${e.message}", Toast.LENGTH_LONG).show()
                        }
                    }
                }
            }

            dialog.show()
        } catch (e: Exception) {
            Toast.makeText(this, "Error: ${e.message}", Toast.LENGTH_SHORT).show()
        }
    }

    private fun showEditDialog(siswa: ModelSiswa) {
        try {
            val dialog = Dialog(this)
            dialog.setContentView(R.layout.pop_up_edit_data_siswa)
            dialog.window?.setBackgroundDrawableResource(android.R.color.transparent)
            dialog.window?.setLayout(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT)
            dialog.setCancelable(true)

            val inputNama = dialog.findViewById<EditText>(R.id.input_keterangan_nama)
            val inputNisn = dialog.findViewById<EditText>(R.id.input_keterangan_nisn)
            val inputKelas = dialog.findViewById<EditText>(R.id.input_keterangan_jurusan)
            val btnArrowKelas = dialog.findViewById<ImageButton>(R.id.arrowJurusan)
            val btnBatal = dialog.findViewById<Button>(R.id.btn_batal)
            val btnSimpan = dialog.findViewById<Button>(R.id.btn_simpan)

            inputKelas?.isFocusable = false
            inputKelas?.isClickable = true

            var selectedClassId = siswa.classId

            val showKelasDropdown = {
                val names = masterKelas.map { it.name ?: "" }.toTypedArray()
                AlertDialog.Builder(this)
                    .setTitle("Pilih Kelas")
                    .setItems(names) { _, which ->
                        inputKelas?.setText(names[which])
                        selectedClassId = masterKelas[which].id?.toString() ?: ""
                    }
                    .show()
            }

            btnArrowKelas?.setOnClickListener { showKelasDropdown() }
            inputKelas?.setOnClickListener { showKelasDropdown() }

            inputNama?.setText(siswa.nama)
            inputNisn?.setText(siswa.nisn)
            inputKelas?.setText(siswa.kelas)
            btnSimpan?.text = "Update"
            btnBatal?.setOnClickListener { dialog.dismiss() }

            btnSimpan?.setOnClickListener {
                val nama = inputNama?.text.toString().trim()
                val nisn = inputNisn?.text.toString().trim()

                if (nama.isEmpty() || nisn.isEmpty() || selectedClassId.isEmpty()) {
                    Toast.makeText(this, "Harap isi semua field!", Toast.LENGTH_SHORT).show()
                    return@setOnClickListener
                }

                showSaveConfirmation("Update") {
                    val updatedStudent = StudentDto(
                        id = siswa.id,
                        name = nama,
                        nisn = nisn,
                        nis = null,
                        email = null,
                        major = null,
                        majorName = null,
                        classId = selectedClassId,
                        className = null,
                        grade = null,
                        gender = "L",
                        phone = null,
                        address = null,
                        photoUrl = null
                    )

                    lifecycleScope.launch {
                        try {
                            val response = apiService.updateStudent(siswa.id, updatedStudent)
                            if (response.isSuccessful) {
                                Toast.makeText(this@TotalSiswa, "Data siswa berhasil diupdate", Toast.LENGTH_SHORT).show()
                                fetchData()
                                dialog.dismiss()
                            } else {
                                Toast.makeText(this@TotalSiswa, "Gagal update: ${response.message()}", Toast.LENGTH_LONG).show()
                            }
                        } catch (e: Exception) {
                            Toast.makeText(this@TotalSiswa, "Error: ${e.message}", Toast.LENGTH_LONG).show()
                        }
                    }
                }
            }

            dialog.show()
        } catch (e: Exception) {
            Toast.makeText(this, "Error: ${e.message}", Toast.LENGTH_SHORT).show()
        }
    }

    private fun showDeleteDialog(siswa: ModelSiswa) {
        AlertDialog.Builder(this)
            .setTitle("Konfirmasi Hapus")
            .setMessage("Apakah Anda yakin ingin menghapus data siswa:\n${siswa.nama}?")
            .setPositiveButton("Hapus") { _, _ ->
                lifecycleScope.launch {
                    try {
                        val response = apiService.deleteStudent(siswa.id)
                        if (response.isSuccessful) {
                            Toast.makeText(this@TotalSiswa, "Data siswa berhasil dihapus", Toast.LENGTH_SHORT).show()
                            fetchData()
                        } else {
                            Toast.makeText(this@TotalSiswa, "Gagal menghapus: ${response.message()}", Toast.LENGTH_LONG).show()
                        }
                    } catch (e: Exception) {
                        Toast.makeText(this@TotalSiswa, "Error: ${e.message}", Toast.LENGTH_LONG).show()
                    }
                }
            }
            .setNegativeButton("Batal", null)
            .show()
    }

    private fun showSaveConfirmation(action: String, onConfirm: () -> Unit) {
        AlertDialog.Builder(this)
            .setTitle("Konfirmasi")
            .setMessage("Yakin akan $action data?")
            .setPositiveButton("Ya, Simpan") { _, _ -> onConfirm() }
            .setNegativeButton("Batal", null)
            .show()
    }
}