package com.example.ritamesa

import android.app.AlertDialog
import android.app.Dialog
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.inputmethod.EditorInfo
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.ritamesa.data.api.ApiClient
import com.example.ritamesa.data.api.ApiService
import com.example.ritamesa.data.dto.TeacherDto
import kotlinx.coroutines.launch

class TotalGuru : AppCompatActivity() {

    // ===== DATA CLASS =====
    data class Guru(
        val id: String,
        val nama: String,
        val kode: String,
        val nip: String,
        val mapel: String,
        val keterangan: String
    )

    // ===== ADAPTER =====
    inner class GuruAdapter(
        private var listGuru: List<Guru>,
        private val onEditClick: (Guru) -> Unit,
        private val onDeleteClick: (Guru) -> Unit
    ) : RecyclerView.Adapter<GuruAdapter.GuruViewHolder>() {

        private var currentPage = 1
        private val itemsPerPage = 10

        inner class GuruViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
            val tvNo: TextView = itemView.findViewById(R.id.tvNo)
            val tvNama: TextView = itemView.findViewById(R.id.tvNama)
            val tvKode: TextView = itemView.findViewById(R.id.tvKode)
            val tvNip: TextView = itemView.findViewById(R.id.tvNIP)
            val tvMapel: TextView = itemView.findViewById(R.id.tvMapel)
            val tvRole: TextView = itemView.findViewById(R.id.tvKeterangan)
            val btnEdit: LinearLayout = itemView.findViewById(R.id.btnEdit)
            val btnHapus: LinearLayout = itemView.findViewById(R.id.btnHapus)
        }

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): GuruViewHolder {
            val view = LayoutInflater.from(parent.context)
                .inflate(R.layout.item_crud_guru, parent, false)
            return GuruViewHolder(view)
        }

        override fun onBindViewHolder(holder: GuruViewHolder, position: Int) {
            val guru = listGuru[position]
            val nomorUrut = ((currentPage - 1) * itemsPerPage) + position + 1

            holder.tvNo.text = nomorUrut.toString()
            holder.tvNama.text = guru.nama
            holder.tvKode.text = guru.kode
            holder.tvNip.text = guru.nip
            holder.tvMapel.text = guru.mapel
            holder.tvRole.text = guru.keterangan

            holder.btnEdit.setOnClickListener { onEditClick(guru) }
            holder.btnHapus.setOnClickListener { onDeleteClick(guru) }
        }

        override fun getItemCount(): Int = listGuru.size

        fun updateData(newList: List<Guru>, page: Int) {
            listGuru = newList
            currentPage = page
            notifyDataSetChanged()
        }
    }

    // ===== COMPONENTS =====
    private lateinit var recyclerView: RecyclerView
    private lateinit var guruAdapter: GuruAdapter
    private lateinit var btnTambahContainer: View
    private lateinit var editTextSearch: EditText
    private lateinit var ivSearch: ImageButton
    private lateinit var btnBack: ImageButton

    // ===== API =====
    private lateinit var apiService: ApiService
    private val masterGuru = arrayListOf<Guru>()

    // ===== PAGINATION =====
    private var currentPage = 1
    private val itemsPerPage = 10
    private var totalPages = 1
    private var filteredList = arrayListOf<Guru>()
    private var currentDisplayList = arrayListOf<Guru>()

    // ===== PAGINATION UI =====
    private lateinit var paginationContainer: LinearLayout
    private lateinit var tvPageInfo: TextView
    private lateinit var btnPrev: ImageButton
    private lateinit var btnNext: ImageButton
    private lateinit var etGoToPage: EditText
    private lateinit var btnGo: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.total_guru)

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
                val response = apiService.getTeachers()
                if (response.isSuccessful && response.body() != null) {
                    val dtos = response.body()?.data ?: emptyList()
                    masterGuru.clear()
                    masterGuru.addAll(dtos.map { 
                        Guru(
                            id = """${it.id}""", 
                            nama = it.name ?: "", 
                            kode = it.code ?: "", 
                            nip = it.nip ?: "", 
                            mapel = it.subjectName ?: it.subject ?: "", 
                            keterangan = it.role ?: ""
                        ) 
                    })
                    searchGuru()
                } else {
                    Toast.makeText(this@TotalGuru, "Gagal mengambil data guru", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Log.e("TotalGuru", "Error fetching data", e)
                Toast.makeText(this@TotalGuru, "Koneksi bermasalah: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun initView() {
        recyclerView = findViewById(R.id.rvGuru)
        btnTambahContainer = findViewById(R.id.imageButton23)
        editTextSearch = findViewById(R.id.editTextText7)
        ivSearch = findViewById(R.id.imageButton17)
        btnBack = findViewById(R.id.imageView36)
        editTextSearch.hint = "Cari nama guru"

        filteredList = ArrayList(masterGuru)
        calculateTotalPages()
    }

    private fun setupRecyclerView() {
        recyclerView.layoutManager = LinearLayoutManager(this)
        recyclerView.setHasFixedSize(true)

        guruAdapter = GuruAdapter(
            currentDisplayList,
            onEditClick = { guru -> showEditDialog(guru) },
            onDeleteClick = { guru -> showDeleteConfirmation(guru) }
        )
        recyclerView.adapter = guruAdapter
    }

    private fun setupPaginationLayout() {
        val constraintLayout = findViewById<androidx.constraintlayout.widget.ConstraintLayout>(R.id.main)

        paginationContainer = LinearLayout(this).apply {
            id = View.generateViewId()
            layoutParams = androidx.constraintlayout.widget.ConstraintLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            ).apply {
                topToBottom = R.id.rvGuru
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
            searchGuru()
        }

        editTextSearch.setOnEditorActionListener { _, actionId, _ ->
            if (actionId == EditorInfo.IME_ACTION_SEARCH || actionId == EditorInfo.IME_ACTION_DONE) {
                currentPage = 1
                searchGuru()
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

        guruAdapter.updateData(currentDisplayList, currentPage)
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

    private fun searchGuru() {
        val query = editTextSearch.text.toString().trim().lowercase()
        filteredList = if (query.isEmpty()) {
            ArrayList(masterGuru)
        } else {
            ArrayList(masterGuru.filter {
                it.nama.lowercase().contains(query) ||
                        it.nip.contains(query, true) ||
                        it.mapel.lowercase().contains(query) ||
                        it.kode.contains(query, true) ||
                        it.keterangan.lowercase().contains(query)
            })
        }

        if (filteredList.isEmpty() && query.isNotEmpty()) {
            Toast.makeText(this, "Tidak ditemukan guru dengan kata kunci '$query'", Toast.LENGTH_SHORT).show()
        }

        currentPage = 1
        updatePagination()
    }

    private fun validateInput(nama: String, nip: String, kode: String, mapel: String, keterangan: String): Boolean {
        return nama.isNotEmpty() && nip.isNotEmpty() && kode.isNotEmpty() &&
                mapel.isNotEmpty() && keterangan.isNotEmpty()
    }

    private fun showAddDialog() {
        try {
            val dialog = Dialog(this)
            dialog.setContentView(R.layout.pop_up_tambah_data_guru)
            dialog.window?.setBackgroundDrawableResource(android.R.color.transparent)
            dialog.window?.setLayout(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            )
            dialog.setCancelable(true)

            val inputNama = dialog.findViewById<EditText>(R.id.input_keterangan_nama)
            val inputNip = dialog.findViewById<EditText>(R.id.input_keterangan_nip)
            val inputKode = dialog.findViewById<EditText>(R.id.input_keterangan_kode)
            val inputMapel = dialog.findViewById<EditText>(R.id.input_keterangan_mapel)
            val inputKeterangan = dialog.findViewById<EditText>(R.id.input_keterangan_role)
            val btnArrowMapel = dialog.findViewById<ImageButton>(R.id.imageButton8)
            val btnArrowRole = dialog.findViewById<ImageButton>(R.id.imageButton9)
            val btnBatal = dialog.findViewById<Button>(R.id.btn_batal)
            val btnSimpan = dialog.findViewById<Button>(R.id.btn_simpan)

            btnArrowMapel?.setOnClickListener { showMapelDropdown(inputMapel) }
            btnArrowRole?.setOnClickListener { showKeteranganDropdown(inputKeterangan) }
            btnBatal?.setOnClickListener { dialog.dismiss() }

            btnSimpan?.setOnClickListener {
                val nama = inputNama?.text?.toString()?.trim() ?: ""
                val nip = inputNip?.text?.toString()?.trim() ?: ""
                val kode = inputKode?.text?.toString()?.trim() ?: ""
                val mapel = inputMapel?.text?.toString()?.trim() ?: ""
                val keterangan = inputKeterangan?.text?.toString()?.trim() ?: ""

                if (!validateInput(nama, nip, kode, mapel, keterangan)) {
                    Toast.makeText(this, "Semua field harus diisi!", Toast.LENGTH_SHORT).show()
                    return@setOnClickListener
                }

                showSaveConfirmation("Tambah") {
                    val newTeacher = TeacherDto(
                        id = null,
                        name = nama,
                        nip = nip,
                        code = kode,
                        subject = null,
                        subjectName = mapel,
                        role = keterangan,
                        wakaField = null,
                        majorExpertise = null,
                        email = null,
                        phone = null,
                        photoUrl = null,
                        classesCount = null,
                        homeroomClassId = null
                    )

                    lifecycleScope.launch {
                        try {
                            val response = apiService.createTeacher(newTeacher)
                            if (response.isSuccessful) {
                                Toast.makeText(this@TotalGuru, "Data guru berhasil ditambahkan", Toast.LENGTH_SHORT).show()
                                fetchData()
                                dialog.dismiss()
                            } else {
                                Toast.makeText(this@TotalGuru, "Gagal menambahkan: ${response.message()}", Toast.LENGTH_LONG).show()
                            }
                        } catch (e: Exception) {
                            Toast.makeText(this@TotalGuru, "Error: ${e.message}", Toast.LENGTH_LONG).show()
                        }
                    }
                }
            }

            dialog.show()

        } catch (e: Exception) {
            Toast.makeText(this, "Error: ${e.message}", Toast.LENGTH_SHORT).show()
        }
    }

    private fun showEditDialog(guru: Guru) {
        try {
            val dialog = Dialog(this)
            dialog.setContentView(R.layout.pop_up_edit_guru)
            dialog.window?.setBackgroundDrawableResource(android.R.color.transparent)
            dialog.window?.setLayout(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            )
            dialog.setCancelable(true)

            val inputNama = dialog.findViewById<EditText>(R.id.input_keterangan_nama)
            val inputNip = dialog.findViewById<EditText>(R.id.input_keterangan_nip)
            val inputKode = dialog.findViewById<EditText>(R.id.input_keterangan_kode)
            val inputMapel = dialog.findViewById<EditText>(R.id.input_keterangan_mapel)
            val inputKeterangan = dialog.findViewById<EditText>(R.id.input_keterangan_role)
            val btnArrowMapel = dialog.findViewById<ImageButton>(R.id.imageButton8)
            val btnArrowRole = dialog.findViewById<ImageButton>(R.id.imageButton9)
            val btnBatal = dialog.findViewById<Button>(R.id.btn_batal)
            val btnSimpan = dialog.findViewById<Button>(R.id.btn_simpan)

            inputNama?.setText(guru.nama)
            inputNip?.setText(guru.nip)
            inputKode?.setText(guru.kode)
            inputMapel?.setText(guru.mapel)
            inputKeterangan?.setText(guru.keterangan)

            btnArrowMapel?.setOnClickListener { showMapelDropdown(inputMapel) }
            btnArrowRole?.setOnClickListener { showKeteranganDropdown(inputKeterangan) }
            btnBatal?.setOnClickListener { dialog.dismiss() }

            btnSimpan?.setOnClickListener {
                val nama = inputNama?.text?.toString()?.trim() ?: ""
                val nip = inputNip?.text?.toString()?.trim() ?: ""
                val kode = inputKode?.text?.toString()?.trim() ?: ""
                val mapel = inputMapel?.text?.toString()?.trim() ?: ""
                val keterangan = inputKeterangan?.text?.toString()?.trim() ?: ""

                if (!validateInput(nama, nip, kode, mapel, keterangan)) {
                    Toast.makeText(this, "Semua field harus diisi!", Toast.LENGTH_SHORT).show()
                    return@setOnClickListener
                }

                showSaveConfirmation("Edit") {
                    val editTeacher = TeacherDto(
                        id = guru.id,
                        name = nama,
                        nip = nip,
                        code = kode,
                        subject = null,
                        subjectName = mapel,
                        role = keterangan,
                        wakaField = null,
                        majorExpertise = null,
                        email = null,
                        phone = null,
                        photoUrl = null,
                        classesCount = null,
                        homeroomClassId = null
                    )

                    lifecycleScope.launch {
                        try {
                            val response = apiService.updateTeacher(guru.id, editTeacher)
                            if (response.isSuccessful) {
                                Toast.makeText(this@TotalGuru, "Data guru berhasil diupdate", Toast.LENGTH_SHORT).show()
                                fetchData()
                                dialog.dismiss()
                            } else {
                                Toast.makeText(this@TotalGuru, "Gagal update: ${response.message()}", Toast.LENGTH_LONG).show()
                            }
                        } catch (e: Exception) {
                            Toast.makeText(this@TotalGuru, "Error: ${e.message}", Toast.LENGTH_LONG).show()
                        }
                    }
                }
            }

            dialog.show()

        } catch (e: Exception) {
            Toast.makeText(this, "Error: ${e.message}", Toast.LENGTH_SHORT).show()
        }
    }

    private fun showDeleteConfirmation(guru: Guru) {
        AlertDialog.Builder(this)
            .setTitle("Konfirmasi Hapus")
            .setMessage("Apakah Anda yakin akan menghapus data ${guru.nama}?")
            .setPositiveButton("Ya, Hapus") { _, _ ->
                lifecycleScope.launch {
                    try {
                        val response = apiService.deleteTeacher(guru.id)
                        if (response.isSuccessful) {
                            Toast.makeText(this@TotalGuru, "Data berhasil dihapus", Toast.LENGTH_SHORT).show()
                            fetchData()
                        } else {
                            Toast.makeText(this@TotalGuru, "Gagal menghapus: ${response.message()}", Toast.LENGTH_LONG).show()
                        }
                    } catch (e: Exception) {
                        Toast.makeText(this@TotalGuru, "Error: ${e.message}", Toast.LENGTH_LONG).show()
                    }
                }
            }
            .setNegativeButton("Batal", null)
            .show()
    }

    private fun showSaveConfirmation(action: String, onConfirm: () -> Unit) {
        AlertDialog.Builder(this)
            .setTitle("Konfirmasi")
            .setMessage("Yakin akan ${action.lowercase()} data?")
            .setPositiveButton("Ya, Simpan") { _, _ ->
                onConfirm()
            }
            .setNegativeButton("Batal", null)
            .show()
    }

    private fun showMapelDropdown(editText: EditText?) {
        val mapelList = arrayOf(
            "Matematika", "Bahasa Indonesia", "Bahasa Inggris",
            "IPAS", "Bahasa Jawa", "PKN", "PAI", "Olahraga",
            "Informatika", "BK", "MPP", "MPKK", "PKDK",
            "Sejarah", "Bahasa Jepang",
            "10 Rekayasa Perangkat Lunak 1", "10 Rekayasa Perangkat Lunak 2",
            "11 Rekayasa Perangkat Lunak 1", "11 Rekayasa Perangkat Lunak 2",
            "12 Rekayasa Perangkat Lunak 1", "12 Rekayasa Perangkat Lunak 2"
        )

        AlertDialog.Builder(this)
            .setTitle("Pilih Mapel / Kelas")
            .setItems(mapelList) { _, which ->
                editText?.setText(mapelList[which])
            }
            .show()
    }

    private fun showKeteranganDropdown(editText: EditText?) {
        val keteranganList = arrayOf("Guru", "Wali Kelas", "Waka", "Admin", "Kepsek")

        AlertDialog.Builder(this)
            .setTitle("Pilih Peran")
            .setItems(keteranganList) { _, which ->
                editText?.setText(keteranganList[which])
            }
            .show()
    }
}