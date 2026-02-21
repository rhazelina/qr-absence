package com.example.ritamesa

import android.app.Dialog
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.inputmethod.EditorInfo
import android.widget.*
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView

class TotalSiswa : AppCompatActivity() {

    // ===== DATA CLASS =====
    data class ModelSiswa(
        val nisn: String,
        val nama: String,
        val kelas: String
    )

    // ===== ADAPTER =====
    inner class SiswaAdapter(
        private var listSiswa: List<ModelSiswa>,
        private val onEditClick: (ModelSiswa, Int) -> Unit,
        private val onDeleteClick: (ModelSiswa, Int) -> Unit
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

            holder.btnEdit.setOnClickListener {
                val actualPosition = listSiswaDummy.indexOfFirst { it.nisn == siswa.nisn }
                if (actualPosition != -1) onEditClick(siswa, actualPosition)
            }

            holder.btnHapus.setOnClickListener {
                val actualPosition = listSiswaDummy.indexOfFirst { it.nisn == siswa.nisn }
                if (actualPosition != -1) onDeleteClick(siswa, actualPosition)
            }
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

    // ===== DATA DUMMY =====
    private val listSiswaDummy = arrayListOf(
        ModelSiswa("3078207819", "ABRORY AKBAR AL BATAMI", "XI RPL 1"),
        ModelSiswa("0086659776", "AFIF FIRMANSYAH", "XI RPL 1"),
        ModelSiswa("0087441890", "AGIES WIDYAWATI", "XI RPL 1"),
        ModelSiswa("0071026334", "AGIL RIFATUL HAQ", "XI RPL 1"),
        ModelSiswa("0078492418", "AKH. SEPTIAN FIO RAMADHAN", "XI RPL 1"),
        ModelSiswa("0077521428", "Alya Fitri Larasati", "XI RPL 1"),
        ModelSiswa("0084302867", "ANASTASYA DYAH AYU PROBONINGRUM", "XI RPL 1"),
        ModelSiswa("0079564039", "ANISA PUSPITASARI", "XI RPL 1"),
        ModelSiswa("0087599872", "Anissa Prissilvia Tahara", "XI RPL 1"),
        ModelSiswa("0084701495", "AQILLA MAULIDDYAH", "XI RPL 1"),
        ModelSiswa("0079518058", "AQILNA FAILLA LILFARA AIZANI", "XI RPL 1"),
        ModelSiswa("0076823738", "Aristia Faren Rafaela", "XI RPL 1"),
        ModelSiswa("0088840490", "ASYHARIL KAHFI DEWANDA", "XI RPL 1"),
        ModelSiswa("0086920055", "Athaar Putra Ruhenda", "XI RPL 1"),
        ModelSiswa("0088032174", "AVRILIANA ANJANI", "XI RPL 1"),
        ModelSiswa("0089732684", "AZHAR ANISATUL JANNAH", "XI RPL 1"),
        ModelSiswa("0086246127", "BINTANG FIRMAN ARDANA", "XI RPL 1"),
        ModelSiswa("3079461424", "CALLISTA SHAFA RAMADHANI", "XI RPL 1"),
        ModelSiswa("0077372447", "CHEVY APRILIA HUTABARAT", "XI RPL 1"),
        ModelSiswa("0073851099", "CINDI TRI PRASETYO", "XI RPL 1"),
        ModelSiswa("0082111423", "CINTYA KARINA PUTRI", "XI RPL 1"),
        ModelSiswa("0078343685", "DHIA MIRZA HANDHIONO", "XI RPL 1"),
        ModelSiswa("0081555900", "DIANDHIKA DWI PRANATA", "XI RPL 1"),
        ModelSiswa("0081936855", "FAIRUZ QUDS ZAHRAN FIRDAUS", "XI RPL 1"),
        ModelSiswa("0079300540", "FARDAN RASYAH ISLAMI", "XI RPL 1"),
        ModelSiswa("0088713839", "FATCHUR ROHMAN ROFIAN", "XI RPL 1"),
        ModelSiswa("0087853322", "FIDATUL AVIVA", "XI RPL 1"),
        ModelSiswa("0088560011", "FIRLI ZULFA AZZAHRA", "XI RPL 1"),
        ModelSiswa("0062756939", "HAPSARI ISMARTOYO", "XI RPL 1"),
        ModelSiswa("0087538918", "HAVID ABDILAH SURAHMAD", "XI RPL 1"),
        ModelSiswa("0072226999", "IGNACIA ZANDRA", "XI RPL 1"),
        ModelSiswa("0074853632", "IQBAL LAZUARDI", "XI RPL 1"),
        ModelSiswa("0089462835", "IQLIMAHDA TANZILLA FINAN DIVA", "XI RPL 1"),
        ModelSiswa("0077181841", "IRDINA MARSYA MAZARINA", "XI RPL 1"),
        ModelSiswa("0086237279", "ISABEL CAHAYA HATI", "XI RPL 1"),
        ModelSiswa("0074316703", "KHOIRUN NI'MAH NURUL HIDAYAH", "XI RPL 1"),
        ModelSiswa("0074182519", "LAURA LAVIDA LOCA", "XI RPL 2"),
        ModelSiswa("0074320819", "LELY SAGITA", "XI RPL 2"),
        ModelSiswa("0078658367", "MAYA MELINDA WIJAYANTI", "XI RPL 2"),
        ModelSiswa("0079292238", "MOCH. ABYL GUSTIAN", "XI RPL 2"),
        ModelSiswa("0084421457", "MUHAMMAD AMINULLAH", "XI RPL 2"),
        ModelSiswa("0089104721", "Muhammad Azka Fadli Atthaya", "XI RPL 2"),
        ModelSiswa("0087917739", "MUHAMMAD HADI FIRMANSYAH", "XI RPL 2"),
        ModelSiswa("0074704843", "MUHAMMAD HARRIS MAULANA SAPUTRA", "XI RPL 2"),
        ModelSiswa("0077192596", "MUHAMMAD IBNU RAFFI AHDAN", "XI RPL 2"),
        ModelSiswa("0075024492", "MUHAMMAD REYHAN ATHADIANSYAH", "XI RPL 2"),
        ModelSiswa("0141951182", "MUHAMMAD WISNU DEWANDARU", "XI RPL 2"),
        ModelSiswa("0072504970", "NABILA RAMADHAN", "XI RPL 2"),
        ModelSiswa("0061631562", "NADIA SINTA DEVI OKTAVIA", "XI RPL 2"),
        ModelSiswa("0081112175", "NADJWA KIRANA FIRDAUS", "XI RPL 2"),
        ModelSiswa("0089965810", "NINDI NARITA MAULIDYA", "XI RPL 2"),
        ModelSiswa("0085834363", "NISWATUL KHOIRIYAH", "XI RPL 2"),
        ModelSiswa("0087884391", "NOVERITA PASCALIA RAHMA", "XI RPL 2"),
        ModelSiswa("0078285764", "NOVITA ANDRIANI", "XI RPL 2"),
        ModelSiswa("0078980482", "NOVITA AZZAHRA", "XI RPL 2"),
        ModelSiswa("0078036100", "NURUL KHASANAH", "XI RPL 2"),
        ModelSiswa("0081838771", "RACHEL ALUNA MEIZHA", "XI RPL 2"),
        ModelSiswa("0079312790", "RAENA WESTI DHEANOFA HERLIANI", "XI RPL 2"),
        ModelSiswa("0084924963", "RAYHANUN", "XI RPL 2"),
        ModelSiswa("0077652198", "RAYYAN DAFFA AL AFFANI", "XI RPL 2"),
        ModelSiswa("0087959211", "RHAMEYZHA ALEA CHALILA PUTRI EDWARD", "XI RPL 2"),
        ModelSiswa("0089530132", "RHEISYA MAULIDDIVA PUTRI", "XI RPL 2"),
        ModelSiswa("0089479412", "RHEYVAN RAMADHAN I.P", "XI RPL 2"),
        ModelSiswa("0073540571", "RISKY RAMADHANI", "XI RPL 2"),
        ModelSiswa("0076610748", "RITA AURA AGUSTINA", "XI RPL 2"),
        ModelSiswa("0077493253", "RIZKY RAMADHANI", "XI RPL 2"),
        ModelSiswa("0076376703", "SA'IDHATUL HASANA", "XI RPL 2"),
        ModelSiswa("0072620559", "SHISILIA ISMU PUTRI", "XI RPL 2"),
        ModelSiswa("0072336597", "SUCI RAMADANI INDRIANSYAH", "XI RPL 2"),
        ModelSiswa("0075802873", "TALITHA NUDIA RISMATULLAH", "XI RPL 2")
    )

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.total_siswa)

        initView()
        setupRecyclerView()
        setupPaginationLayout()
        setupActions()
        updatePagination()
    }

    private fun initView() {
        recyclerView = findViewById(R.id.rvSiswa)
        btnTambahContainer = findViewById(R.id.btnTambahSiswa)
        editTextSearch = findViewById(R.id.etSearchSiswa)
        ivSearch = findViewById(R.id.ivSearch)
        btnBack = findViewById(R.id.btnBack)
        editTextSearch.hint = "Cari nama/NISN/kelas"

        filteredList = ArrayList(listSiswaDummy)
        calculateTotalPages()
    }

    private fun setupRecyclerView() {
        recyclerView.layoutManager = LinearLayoutManager(this)
        recyclerView.setHasFixedSize(true)

        siswaAdapter = SiswaAdapter(
            currentDisplayList,
            onEditClick = { siswa, position -> showEditDialog(siswa, position) },
            onDeleteClick = { siswa, position -> showDeleteDialog(siswa.nama, position) }
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
            ArrayList(listSiswaDummy)
        } else {
            ArrayList(listSiswaDummy.filter {
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

    private fun isNisnExist(nisn: String, currentNisn: String? = null): Boolean {
        return listSiswaDummy.any { it.nisn == nisn && it.nisn != currentNisn }
    }

    private fun isSiswaExist(nama: String, kelas: String, currentNisn: String? = null): Boolean {
        return listSiswaDummy.any {
            it.nama.equals(nama, ignoreCase = true) &&
                    it.kelas == kelas &&
                    it.nisn != currentNisn
        }
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

            btnArrowKelas?.setOnClickListener { showKelasDropdown(inputKelas) }
            inputKelas?.setOnClickListener { showKelasDropdown(inputKelas) }
            btnBatal?.setOnClickListener { dialog.dismiss() }

            btnSimpan?.setOnClickListener {
                val nama = inputNama?.text.toString().trim()
                val nisn = inputNisn?.text.toString().trim()
                val kelas = inputKelas?.text.toString().trim()

                if (nama.isEmpty() || nisn.isEmpty() || kelas.isEmpty()) {
                    Toast.makeText(this, "Harap isi semua field!", Toast.LENGTH_SHORT).show()
                    return@setOnClickListener
                }

                if (isNisnExist(nisn)) {
                    Toast.makeText(this, "NISN $nisn sudah terdaftar!", Toast.LENGTH_LONG).show()
                    return@setOnClickListener
                }

                if (isSiswaExist(nama, kelas)) {
                    Toast.makeText(this, "Siswa dengan nama $nama kelas $kelas sudah terdaftar!", Toast.LENGTH_LONG).show()
                    return@setOnClickListener
                }

                showSaveConfirmation("Tambah") {
                    listSiswaDummy.add(ModelSiswa(nisn, nama, kelas))
                    currentPage = 1
                    searchSiswa()
                    Toast.makeText(this, "Data siswa berhasil ditambahkan", Toast.LENGTH_SHORT).show()
                    dialog.dismiss()
                }
            }

            dialog.show()
        } catch (e: Exception) {
            Toast.makeText(this, "Error: ${e.message}", Toast.LENGTH_SHORT).show()
        }
    }

    private fun showEditDialog(siswa: ModelSiswa, position: Int) {
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

            btnArrowKelas?.setOnClickListener { showKelasDropdown(inputKelas) }
            inputKelas?.setOnClickListener { showKelasDropdown(inputKelas) }

            inputNama?.setText(siswa.nama)
            inputNisn?.setText(siswa.nisn)
            inputKelas?.setText(siswa.kelas)
            btnSimpan?.text = "Update"
            btnBatal?.setOnClickListener { dialog.dismiss() }

            btnSimpan?.setOnClickListener {
                val nama = inputNama?.text.toString().trim()
                val nisn = inputNisn?.text.toString().trim()
                val kelas = inputKelas?.text.toString().trim()

                if (nama.isEmpty() || nisn.isEmpty() || kelas.isEmpty()) {
                    Toast.makeText(this, "Harap isi semua field!", Toast.LENGTH_SHORT).show()
                    return@setOnClickListener
                }

                val isDataChanged = nama != siswa.nama || nisn != siswa.nisn || kelas != siswa.kelas
                if (!isDataChanged) {
                    Toast.makeText(this, "Tidak ada perubahan data", Toast.LENGTH_SHORT).show()
                    dialog.dismiss()
                    return@setOnClickListener
                }

                if (isNisnExist(nisn, siswa.nisn)) {
                    Toast.makeText(this, "NISN $nisn sudah digunakan oleh siswa lain!", Toast.LENGTH_LONG).show()
                    return@setOnClickListener
                }

                if (isSiswaExist(nama, kelas, siswa.nisn)) {
                    Toast.makeText(this, "Siswa dengan nama $nama kelas $kelas sudah terdaftar!", Toast.LENGTH_LONG).show()
                    return@setOnClickListener
                }

                showSaveConfirmation("Update") {
                    listSiswaDummy[position] = ModelSiswa(nisn, nama, kelas)
                    searchSiswa()
                    Toast.makeText(this, "Data siswa berhasil diupdate", Toast.LENGTH_SHORT).show()
                    dialog.dismiss()
                }
            }

            dialog.show()
        } catch (e: Exception) {
            Toast.makeText(this, "Error: ${e.message}", Toast.LENGTH_SHORT).show()
        }
    }

    private fun showDeleteDialog(namaSiswa: String, position: Int) {
        AlertDialog.Builder(this)
            .setTitle("Konfirmasi Hapus")
            .setMessage("Apakah Anda yakin ingin menghapus data siswa:\n$namaSiswa?")
            .setPositiveButton("Hapus") { _, _ ->
                listSiswaDummy.removeAt(position)
                searchSiswa()
                Toast.makeText(this, "Data siswa berhasil dihapus", Toast.LENGTH_SHORT).show()
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

    private fun showKelasDropdown(editText: EditText?) {
        val kelasList = arrayOf("X RPL 1", "X RPL 2", "XI RPL 1", "XI RPL 2", "XII RPL 1", "XII RPL 2")
        AlertDialog.Builder(this)
            .setTitle("Pilih Kelas")
            .setItems(kelasList) { _, which -> editText?.setText(kelasList[which]) }
            .show()
    }
}