package com.example.ritamesa

import android.app.Dialog
import android.app.ProgressDialog
import android.content.Intent
import android.graphics.BitmapFactory
import android.net.Uri
import android.os.Bundle
import android.provider.MediaStore
import android.text.Editable
import android.text.TextWatcher
import android.view.View
import android.view.ViewGroup
import android.view.Window
import android.widget.*
import androidx.appcompat.app.AlertDialog
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.toRequestBody

class JadwalPembelajaranGuru : BaseNetworkActivity() {

    private lateinit var recyclerView: RecyclerView
    private lateinit var adapter: JadwalScheduleImageAdapter
    private lateinit var searchEditText: EditText
    private lateinit var btnTambah: ImageButton
    private lateinit var btnHome: ImageButton
    private lateinit var btnRekap: ImageButton
    private lateinit var btnStatistik: ImageButton
    private lateinit var btnTugas: ImageButton

    // Daftar kelas dari API (id → nama)
    private val allKelasItems = mutableListOf<KelasOption>()
    private val jadwalList = mutableListOf<JadwalImageItem>()
    private val filteredList = mutableListOf<JadwalImageItem>()

    private var selectedImageUri: Uri? = null
    private var selectedKelasId: Int = -1
    private var selectedKelasName: String = ""
    private val REQUEST_PICK_IMAGE = 101
    private var currentDialog: Dialog? = null

    data class KelasOption(val id: Int, val name: String)

    data class JadwalImageItem(
        val classId: Int,
        val namaKelas: String,
        val imageUrl: String? // URL gambar dari server
    )

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.jadwal_pembelajaran_guru)

        initViews()
        setupRecyclerView()
        setupNavigation()
        setupSearch()
        // Load kelas dari API lalu tampilkan jadwal
        loadKelasFromApi()
    }

    private fun initViews() {
        recyclerView = findViewById(R.id.recyclerViewSchedule)
        searchEditText = findViewById(R.id.editTextText)
        btnTambah = findViewById(R.id.btnTambah)
        btnHome = findViewById(R.id.imageButton2)
        btnRekap = findViewById(R.id.imageButton3)
        btnStatistik = findViewById(R.id.imageButton5)
        btnTugas = findViewById(R.id.imageButton13)

        btnTambah.setOnClickListener { showTambahJadwalDialog() }
    }

    private fun setupRecyclerView() {
        adapter = JadwalScheduleImageAdapter(
            filteredList,
            onViewClick = { item -> showImageDialog(item) },
            onMenuClick = { item, anchor -> showPopupMenu(item, anchor) }
        )
        recyclerView.layoutManager = LinearLayoutManager(this)
        recyclerView.adapter = adapter
    }

    private fun setupNavigation() {
        btnHome.setOnClickListener {
            startActivity(Intent(this, DashboardWaka::class.java))
            finish()
        }
        btnRekap.setOnClickListener {
            startActivity(Intent(this, DataRekapKehadiranGuru::class.java))
            finish()
        }
        btnStatistik.setOnClickListener {
            startActivity(Intent(this, StatistikWakaa::class.java))
            finish()
        }
        btnTugas.setOnClickListener {
            Toast.makeText(this, "Anda sudah berada di Jadwal", Toast.LENGTH_SHORT).show()
        }
    }

    private fun setupSearch() {
        searchEditText.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) { filterJadwal(s.toString()) }
        })
    }

    /**
     * STEP 1: Load semua kelas dari GET /classes (per_page=100 agar semua termuat)
     * STEP 2: Cek kelas mana yang sudah punya gambar jadwal via GET /classes/{id}/schedule-image
     */
    private fun loadKelasFromApi() {
        lifecycleScope.launch {
            try {
                val result = classRepository.getClasses(perPage = 100)
                handleResult(result,
                    onSuccess = { classes ->
                        allKelasItems.clear()
                        allKelasItems.addAll(classes.map { KelasOption(it.id ?: -1, it.name ?: "-") }
                            .filter { it.id > 0 })

                        // Inisialisasi list dulu dengan imageUrl=null (belum diketahui)
                        jadwalList.clear()
                        jadwalList.addAll(allKelasItems.map { kelas ->
                            JadwalImageItem(classId = kelas.id, namaKelas = kelas.name, imageUrl = null)
                        })
                        filterJadwal(searchEditText.text.toString())

                        // Kemudian cek satu-satu mana yang sudah ada gambarnya
                        // (tidak block UI, update secara background)
                        checkExistingScheduleImages()
                    },
                    onError = { _, msg ->
                        showError("Gagal memuat kelas: $msg")
                    }
                )
            } catch (e: Exception) {
                showError("Error: ${e.message}")
            }
        }
    }

    /**
     * Cek gambar jadwal untuk semua kelas secara parallel.
     * Kelas yang sudah ada gambar akan ditandai (alpha penuh + centang) di list.
     */
    private fun checkExistingScheduleImages() {
        lifecycleScope.launch(Dispatchers.IO) {
            jadwalList.toList().forEach { item ->
                try {
                    val result = classRepository.getClassScheduleImage(item.classId)
                    withContext(Dispatchers.Main) {
                        when (result) {
                            is com.example.ritamesa.api.Result.Success -> {
                                val url = result.data
                                if (!url.isNullOrBlank()) {
                                    val index = jadwalList.indexOfFirst { it.classId == item.classId }
                                    if (index != -1) {
                                        jadwalList[index] = jadwalList[index].copy(imageUrl = url)
                                        // Sync ke filteredList juga
                                        val fi = filteredList.indexOfFirst { it.classId == item.classId }
                                        if (fi != -1) filteredList[fi] = jadwalList[index]
                                        adapter.notifyItemChanged(fi.coerceAtLeast(0))
                                    }
                                }
                            }
                            else -> { /* tidak ada gambar, biarkan null */ }
                        }
                    }
                } catch (_: Exception) { /* skip */ }
            }
        }
    }

    private fun filterJadwal(query: String) {
        filteredList.clear()
        val source = jadwalList
        if (query.isEmpty()) {
            filteredList.addAll(source)
        } else {
            val q = query.lowercase()
            source.filterTo(filteredList) { it.namaKelas.lowercase().contains(q) }
        }
        adapter.updateList(filteredList)
    }

    // ─────────────────────────────────────────────
    //  DIALOG TAMBAH JADWAL
    // ─────────────────────────────────────────────
    private fun showTambahJadwalDialog() {
        selectedImageUri = null
        selectedKelasId = -1
        selectedKelasName = ""

        val dialog = Dialog(this)
        currentDialog = dialog
        dialog.requestWindowFeature(Window.FEATURE_NO_TITLE)
        dialog.setContentView(R.layout.pop_up_tambah_jadwal)
        dialog.window?.setLayout(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT)
        dialog.window?.setBackgroundDrawableResource(android.R.color.transparent)

        val btnUpload = dialog.findViewById<Button>(R.id.btn_upload)
        val btnBatal = dialog.findViewById<Button>(R.id.btn_batal)
        val btnPilihFile = dialog.findViewById<ImageButton>(R.id.btn_tambahkanfile)
        val tvNamaFile = dialog.findViewById<TextView>(R.id.namafile)
        val btnDropdown = dialog.findViewById<ImageButton>(R.id.btn_dropdown_arrow2)
        val etKelasJurusan = dialog.findViewById<EditText>(R.id.input_kelasjurusan)

        tvNamaFile.text = "Masukkan (png/jpg)"
        etKelasJurusan.setText("")
        btnUpload.text = "Upload"

        // Pilih gambar dari galeri
        btnPilihFile.setOnClickListener { openImagePicker() }

        // Dropdown kelas dari API
        btnDropdown.setOnClickListener { showKelasDropdown(etKelasJurusan) }
        etKelasJurusan.setOnClickListener { showKelasDropdown(etKelasJurusan) }

        btnUpload.setOnClickListener {
            val kelasNama = etKelasJurusan.text.toString().trim()
            if (selectedKelasId <= 0) {
                Toast.makeText(this, "Pilih kelas/jurusan terlebih dahulu", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            if (selectedImageUri == null) {
                Toast.makeText(this, "Pilih file gambar terlebih dahulu", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            uploadScheduleImage(selectedKelasId, kelasNama, selectedImageUri!!, dialog)
        }

        btnBatal.setOnClickListener { dialog.dismiss() }
        dialog.show()
    }

    // ─────────────────────────────────────────────
    //  DIALOG EDIT JADWAL
    // ─────────────────────────────────────────────
    private fun showEditJadwalDialog(item: JadwalImageItem) {
        selectedImageUri = null
        selectedKelasId = item.classId
        selectedKelasName = item.namaKelas

        val dialog = Dialog(this)
        currentDialog = dialog
        dialog.requestWindowFeature(Window.FEATURE_NO_TITLE)
        dialog.setContentView(R.layout.pop_up_tambah_jadwal)
        dialog.window?.setLayout(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT)
        dialog.window?.setBackgroundDrawableResource(android.R.color.transparent)

        val btnUpload = dialog.findViewById<Button>(R.id.btn_upload)
        val btnBatal = dialog.findViewById<Button>(R.id.btn_batal)
        val btnPilihFile = dialog.findViewById<ImageButton>(R.id.btn_tambahkanfile)
        val tvNamaFile = dialog.findViewById<TextView>(R.id.namafile)
        val btnDropdown = dialog.findViewById<ImageButton>(R.id.btn_dropdown_arrow2)
        val etKelasJurusan = dialog.findViewById<EditText>(R.id.input_kelasjurusan)

        etKelasJurusan.setText(item.namaKelas)
        // Kelas tidak bisa diganti saat edit (sudah terikat ke classId)
        etKelasJurusan.isEnabled = false
        btnDropdown.isEnabled = false
        tvNamaFile.text = if (item.imageUrl != null) "Gambar terpasang" else "Masukkan (png/jpg)"
        btnUpload.text = "Update"

        btnPilihFile.setOnClickListener { openImagePicker() }

        btnUpload.setOnClickListener {
            if (selectedImageUri == null) {
                Toast.makeText(this, "Pilih file gambar baru terlebih dahulu", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            uploadScheduleImage(item.classId, item.namaKelas, selectedImageUri!!, dialog)
        }

        btnBatal.setOnClickListener { dialog.dismiss() }
        dialog.show()
    }

    // ─────────────────────────────────────────────
    //  UPLOAD GAMBAR → POST /classes/{id}/schedule-image (Multipart)
    // ─────────────────────────────────────────────
    private fun uploadScheduleImage(classId: Int, namaKelas: String, uri: Uri, dialog: Dialog) {
        lifecycleScope.launch {
            try {
                // Baca bytes dari URI
                val inputStream = contentResolver.openInputStream(uri)
                    ?: run { showError("Tidak dapat membaca file"); return@launch }
                val bytes = inputStream.readBytes()
                inputStream.close()

                // Tentukan MIME type
                val mimeType = contentResolver.getType(uri) ?: "image/jpeg"
                val extension = when {
                    mimeType.contains("png") -> "png"
                    mimeType.contains("jpg") || mimeType.contains("jpeg") -> "jpg"
                    else -> "jpg"
                }
                val fileName = "jadwal_${classId}.$extension"

                // FIX: Backend mengharapkan field bernama "file" bukan "image"
                val requestBody = bytes.toRequestBody(mimeType.toMediaTypeOrNull())
                val filePart = MultipartBody.Part.createFormData("file", fileName, requestBody)

                // Panggil API: POST /classes/{id}/schedule-image
                val result = classRepository.uploadClassScheduleImageMultipart(classId, filePart)
                handleResult(result,
                    onSuccess = { _ ->
                        // Update list lokal dengan imageUrl placeholder (gambar sudah di server)
                        val index = jadwalList.indexOfFirst { it.classId == classId }
                        if (index != -1) {
                            jadwalList[index] = jadwalList[index].copy(imageUrl = uri.toString())
                        } else {
                            // Kelas baru ditambahkan (seharusnya sudah ada, tapi antisipasi)
                            jadwalList.add(JadwalImageItem(classId, namaKelas, uri.toString()))
                        }
                        filterJadwal(searchEditText.text.toString())
                        Toast.makeText(
                            this@JadwalPembelajaranGuru,
                            "Jadwal berhasil diupload",
                            Toast.LENGTH_SHORT
                        ).show()
                        dialog.dismiss()
                    },
                    onError = { _, msg ->
                        showError("Gagal upload: $msg")
                    }
                )
            } catch (e: Exception) {
                showError("Error upload: ${e.message}")
            }
        }
    }

    // ─────────────────────────────────────────────
    //  HAPUS GAMBAR → DELETE /classes/{id}/schedule-image
    // ─────────────────────────────────────────────
    private fun deleteScheduleImage(item: JadwalImageItem) {
        AlertDialog.Builder(this)
            .setTitle("Konfirmasi Hapus")
            .setMessage("Hapus gambar jadwal kelas ${item.namaKelas}?")
            .setPositiveButton("Hapus") { _, _ ->
                lifecycleScope.launch {
                    try {
                        val result = classRepository.deleteClassScheduleImage(item.classId)
                        handleResult(result,
                            onSuccess = { _ ->
                                val index = jadwalList.indexOfFirst { it.classId == item.classId }
                                if (index != -1) {
                                    jadwalList[index] = jadwalList[index].copy(imageUrl = null)
                                    filterJadwal(searchEditText.text.toString())
                                }
                                Toast.makeText(
                                    this@JadwalPembelajaranGuru,
                                    "Gambar jadwal dihapus",
                                    Toast.LENGTH_SHORT
                                ).show()
                            },
                            onError = { _, msg ->
                                showError("Gagal hapus: $msg")
                            }
                        )
                    } catch (e: Exception) {
                        showError("Error: ${e.message}")
                    }
                }
            }
            .setNegativeButton("Batal", null)
            .show()
    }

    // ─────────────────────────────────────────────
    //  LIHAT GAMBAR → GET /classes/{id}/schedule-image lalu tampilkan
    // ─────────────────────────────────────────────
    // ─────────────────────────────────────────────
    //  LIHAT GAMBAR → GET /classes/{id}/schedule-image
    // ─────────────────────────────────────────────
    private fun showImageDialog(item: JadwalImageItem) {
        // Tampilkan dialog loading dulu
        val loadingDialog = android.app.ProgressDialog(this).apply {
            setMessage("Memuat gambar jadwal...")
            setCancelable(false)
            show()
        }

        lifecycleScope.launch {
            try {
                val result = classRepository.getClassScheduleImage(item.classId)
                loadingDialog.dismiss()
                handleResult(result,
                    onSuccess = { imageUrl ->
                        displayImageInDialog(item.namaKelas, imageUrl)
                    },
                    onError = { _, _ ->
                        Toast.makeText(
                            this@JadwalPembelajaranGuru,
                            "Belum ada gambar jadwal untuk kelas ${item.namaKelas}",
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                )
            } catch (e: Exception) {
                loadingDialog.dismiss()
                Toast.makeText(this@JadwalPembelajaranGuru, "Error: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun displayImageInDialog(namaKelas: String, imageUrl: String?) {
        val dialog = Dialog(this)
        dialog.requestWindowFeature(Window.FEATURE_NO_TITLE)
        dialog.setContentView(R.layout.dialog_image_viewer)
        dialog.window?.setLayout(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT)
        dialog.window?.setBackgroundDrawableResource(android.R.color.transparent)

        val imageView = dialog.findViewById<ImageView>(R.id.imageView)
        val tvFileName = dialog.findViewById<TextView>(R.id.tvFileName)
        val btnClose = dialog.findViewById<Button>(R.id.btnClose)

        tvFileName.text = "Jadwal - $namaKelas"

        if (!imageUrl.isNullOrBlank()) {
            // Load gambar dari URL HTTP di background thread
            lifecycleScope.launch(kotlinx.coroutines.Dispatchers.IO) {
                try {
                    val url = java.net.URL(imageUrl)
                    val connection = url.openConnection() as java.net.HttpURLConnection
                    connection.doInput = true
                    connection.connect()
                    val inputStream = connection.inputStream
                    val bitmap = android.graphics.BitmapFactory.decodeStream(inputStream)
                    inputStream.close()

                    // Update UI di main thread
                    withContext(kotlinx.coroutines.Dispatchers.Main) {
                        if (bitmap != null) {
                            imageView.setImageBitmap(bitmap)
                        } else {
                            imageView.setImageResource(R.drawable.rectangle_247)
                            Toast.makeText(this@JadwalPembelajaranGuru, "Gagal decode gambar", Toast.LENGTH_SHORT).show()
                        }
                    }
                } catch (e: Exception) {
                    withContext(kotlinx.coroutines.Dispatchers.Main) {
                        imageView.setImageResource(R.drawable.rectangle_247)
                        Toast.makeText(this@JadwalPembelajaranGuru, "Gagal load gambar: ${e.message}", Toast.LENGTH_SHORT).show()
                    }
                }
            }
        } else {
            imageView.setImageResource(R.drawable.rectangle_247)
        }

        btnClose.setOnClickListener { dialog.dismiss() }
        dialog.show()
    }

    // ─────────────────────────────────────────────
    //  POPUP MENU (Edit / Hapus)
    // ─────────────────────────────────────────────
    private fun showPopupMenu(item: JadwalImageItem, anchorView: View) {
        val popupMenu = PopupMenu(this, anchorView)
        popupMenu.menuInflater.inflate(R.menu.menu_jadwal, popupMenu.menu)
        popupMenu.setOnMenuItemClickListener { menuItem ->
            when (menuItem.itemId) {
                R.id.menu_edit -> { showEditJadwalDialog(item); true }
                R.id.menu_hapus -> { deleteScheduleImage(item); true }
                else -> false
            }
        }
        popupMenu.show()
    }

    // ─────────────────────────────────────────────
    //  DROPDOWN KELAS dari API
    // ─────────────────────────────────────────────
    private fun showKelasDropdown(etKelasJurusan: EditText) {
        if (allKelasItems.isEmpty()) {
            Toast.makeText(this, "Data kelas belum tersedia", Toast.LENGTH_SHORT).show()
            return
        }
        val names = allKelasItems.map { it.name }.toTypedArray()
        AlertDialog.Builder(this)
            .setTitle("Pilih Kelas/Jurusan")
            .setItems(names) { _, which ->
                val selected = allKelasItems[which]
                selectedKelasId = selected.id
                selectedKelasName = selected.name
                etKelasJurusan.setText(selected.name)
                // Update dialog saat ini
                currentDialog?.findViewById<TextView>(R.id.namafile)
                // (tidak perlu, sudah diambil dari etKelasJurusan saat submit)
            }
            .setNegativeButton("Batal", null)
            .show()
    }

    // ─────────────────────────────────────────────
    //  IMAGE PICKER
    // ─────────────────────────────────────────────
    private fun openImagePicker() {
        val intent = Intent(Intent.ACTION_GET_CONTENT).apply {
            type = "image/*"
            addCategory(Intent.CATEGORY_OPENABLE)
        }
        try {
            startActivityForResult(Intent.createChooser(intent, "Pilih Gambar Jadwal"), REQUEST_PICK_IMAGE)
        } catch (e: Exception) {
            Toast.makeText(this, "Tidak ada aplikasi file manager", Toast.LENGTH_SHORT).show()
        }
    }

    @Deprecated("Use registerForActivityResult instead")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == REQUEST_PICK_IMAGE && resultCode == RESULT_OK) {
            data?.data?.let { uri ->
                selectedImageUri = uri
                val fileName = getFileNameFromUri(uri) ?: "gambar_terpilih"
                currentDialog?.findViewById<TextView>(R.id.namafile)?.text = fileName
            }
        }
    }

    private fun getFileNameFromUri(uri: Uri): String? {
        var result: String? = null
        if (uri.scheme == "content") {
            try {
                contentResolver.query(uri, null, null, null, null)?.use { cursor ->
                    if (cursor.moveToFirst()) {
                        val idx = cursor.getColumnIndex(MediaStore.MediaColumns.DISPLAY_NAME)
                        if (idx != -1) result = cursor.getString(idx)
                    }
                }
            } catch (e: SecurityException) {
                Toast.makeText(this, "Izin akses file diperlukan", Toast.LENGTH_SHORT).show()
            }
        }
        if (result == null) {
            result = uri.path?.substringAfterLast('/')
        }
        return result
    }

    // ─────────────────────────────────────────────
    //  ADAPTER (menggunakan item_mapel_kelas yang sudah ada di project)
    // ─────────────────────────────────────────────
    class JadwalScheduleImageAdapter(
        private var items: List<JadwalImageItem>,
        private val onViewClick: (JadwalImageItem) -> Unit,
        private val onMenuClick: (JadwalImageItem, View) -> Unit
    ) : RecyclerView.Adapter<JadwalScheduleImageAdapter.ViewHolder>() {

        class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
            val tvMataPelajaran: TextView = view.findViewById(R.id.tvMataPelajaran)
            val ivSegment: ImageButton = view.findViewById(R.id.ivSegment)
            val btnBackground: ImageButton = view.findViewById(R.id.btnBackground)
        }

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
            val view = android.view.LayoutInflater.from(parent.context)
                .inflate(R.layout.item_mapel_kelas, parent, false)
            return ViewHolder(view)
        }

        override fun onBindViewHolder(holder: ViewHolder, position: Int) {
            val item = items[position]

            // Tampilkan nama kelas + indikator jika sudah ada gambar
            if (item.imageUrl != null) {
                holder.tvMataPelajaran.text = "✓ ${item.namaKelas}"
                holder.tvMataPelajaran.alpha = 1.0f
            } else {
                holder.tvMataPelajaran.text = item.namaKelas
                holder.tvMataPelajaran.alpha = 0.5f
            }

            holder.btnBackground.setOnClickListener { onViewClick(item) }
            holder.ivSegment.setOnClickListener { view -> onMenuClick(item, view) }
        }

        override fun getItemCount(): Int = items.size

        fun updateList(newList: List<JadwalImageItem>) {
            items = ArrayList(newList)
            notifyDataSetChanged()
        }
    }
}