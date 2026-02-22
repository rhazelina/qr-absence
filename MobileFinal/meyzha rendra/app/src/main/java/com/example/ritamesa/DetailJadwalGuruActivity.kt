package com.example.ritamesa

import android.app.Dialog
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.View
import android.widget.*
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import java.text.SimpleDateFormat
import java.util.*

class DetailJadwalGuruActivity : AppCompatActivity() {

    private lateinit var currentJadwal: DashboardGuruActivity.JadwalData
    private var statusIzinGuru: String? = null

    // Tombol utama
    private lateinit var btnAbsensi: ImageButton
    private lateinit var btnTidakMengajar: ImageButton
    private lateinit var btnIzinSakit: ImageButton
    private lateinit var btnAjukanDispen: ImageButton
    private lateinit var btnInfoHadir: ImageButton

    // File picker
    private var selectedFileUri: Uri? = null
    private lateinit var currentNamaFileTextView: TextView

    // QR Scanner
    private val qrScannerLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == RESULT_OK) {
            val data = result.data
            val isSuccess = data?.getBooleanExtra(CameraQRActivity.EXTRA_QR_RESULT, false) ?: false

            if (isSuccess) {
                val kelas = data.getStringExtra(CameraQRActivity.EXTRA_KELAS) ?: "-"
                val mapel = data.getStringExtra(CameraQRActivity.EXTRA_MAPEL) ?: "-"
                val tanggal = data.getStringExtra("tanggal") ?: "-"
                val jam = data.getStringExtra("jam") ?: "-"

                Toast.makeText(
                    this,
                    "Absensi berhasil!\n$mapel - $kelas\n$tanggal $jam",
                    Toast.LENGTH_LONG
                ).show()

                val intent = Intent(this, AbsensiSiswaActivity::class.java).apply {
                    putExtra(CameraQRActivity.EXTRA_MAPEL, mapel)
                    putExtra(CameraQRActivity.EXTRA_KELAS, kelas)
                    putExtra("tanggal", tanggal)
                    putExtra("jam", jam)
                }
                startActivity(intent)
            } else {
                Toast.makeText(this, "Gagal scan QR", Toast.LENGTH_SHORT).show()
            }
        }
    }

    // File picker
    private val filePickerLauncher = registerForActivityResult(
        ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        if (uri != null) {
            selectedFileUri = uri
            val fileName = getFileName(uri)
            if (::currentNamaFileTextView.isInitialized) {
                currentNamaFileTextView.text = fileName
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.detail_jadwal_guru)

        val jadwalData = intent.getSerializableExtra("JADWAL_DATA") as? DashboardGuruActivity.JadwalData

        // Inisialisasi view utama
        initMainViews(jadwalData)

        // Set click listeners
        setClickListeners()
    }

    private fun initMainViews(jadwalData: DashboardGuruActivity.JadwalData?) {
        val tvNamaMapel: TextView = findViewById(R.id.text_nama_mapel)
        val tvKelas: TextView = findViewById(R.id.title_kelas)
        val tvTanggalWaktu: TextView = findViewById(R.id.tanggal_waktu_mulai)
        val tvMapelDetail: TextView = findViewById(R.id.txt_end_1)
        val tvKelasDetail: TextView = findViewById(R.id.txt_end_2)
        val btnBack: ImageButton = findViewById(R.id.btn_back)

        // Tombol aksi
        btnAbsensi = findViewById(R.id.btn_absensi)
        btnTidakMengajar = findViewById(R.id.btn_tidak_mengajar)
        btnIzinSakit = findViewById(R.id.btn_izin_sakit)
        btnAjukanDispen = findViewById(R.id.btn_ajukan_dispen)
        btnInfoHadir = findViewById(R.id.btn_info_hadir)

        btnBack.setOnClickListener { finish() }

        jadwalData?.let {
            currentJadwal = it
            tvNamaMapel.text = it.mataPelajaran
            tvKelas.text = it.kelas
            tvTanggalWaktu.text = formatTanggalWaktu(it.jam)
            tvMapelDetail.text = it.mataPelajaran
            tvKelasDetail.text = it.kelas

            val txtJumlahSiswa: TextView = findViewById(R.id.txt_end_3)
            txtJumlahSiswa.text = when {
                it.kelas.contains("XII RPL") -> "25"
                it.kelas.contains("XI RPL") -> (30..32).random().toString()
                it.kelas.contains("X RPL") -> (28..30).random().toString()
                else -> "30"
            }
        }
    }

    private fun setClickListeners() {
        btnAbsensi.setOnClickListener { showAbsensiPopup() }
        btnTidakMengajar.setOnClickListener { showTidakMengajarPopup() }
        btnIzinSakit.setOnClickListener { showIzinSakitPopup() }
        btnAjukanDispen.setOnClickListener { showDispensasiPopup() }

        // Long click untuk testing
        btnAbsensi.setOnLongClickListener {
            val intent = Intent(this, AbsensiSiswaActivity::class.java).apply {
                putExtra("MATA_PELAJARAN", currentJadwal.mataPelajaran)
                putExtra("KELAS", currentJadwal.kelas)
                putExtra("JAM", currentJadwal.jam)
                putExtra("TANGGAL", SimpleDateFormat("dd-MM-yyyy", Locale.getDefault()).format(Date()))
            }
            startActivity(intent)
            true
        }
    }

    private fun terapkanStatusIzinGuru(tipeIzin: String) {
        statusIzinGuru = tipeIzin

        btnAbsensi.visibility = View.GONE
        btnTidakMengajar.visibility = View.GONE
        btnIzinSakit.visibility = View.GONE
        btnAjukanDispen.visibility = View.GONE

        val drawable = when (tipeIzin) {
            "sakit" -> R.drawable.siswa_sakit_wakel
            else    -> R.drawable.siswa_izin_wakel
        }
        btnInfoHadir.setImageResource(drawable)
        btnInfoHadir.visibility = View.VISIBLE
    }

    private fun formatTanggalWaktu(jam: String): String {
        val sdf = SimpleDateFormat("dd-MM-yyyy", Locale.getDefault())
        val tanggalSekarang = sdf.format(Date())
        return "$jam $tanggalSekarang"
    }

    private fun getFileName(uri: Uri): String {
        var result = "file_selected.jpg"
        val cursor = contentResolver.query(uri, null, null, null, null)
        cursor?.use {
            if (it.moveToFirst()) {
                val nameIndex = it.getColumnIndex(android.provider.OpenableColumns.DISPLAY_NAME)
                if (nameIndex >= 0) {
                    result = it.getString(nameIndex)
                }
            }
        }
        return result
    }

    // ==================== DAFTAR SISWA ====================
    private fun getSiswaByKelas(): Array<String> {
        return when {
            currentJadwal.kelas.contains("XII RPL") -> arrayOf(
                "Ahmad Rizki", "Bella Safira", "Cahya Wardana", "Dimas Pratama",
                "Elisa Ramadhani", "Fariz Maulana", "Gina Pertiwi", "Hana Kusuma",
                "Irwan Fauzi", "Julia Santika", "Kevin Pratama", "Lita Andriani",
                "Muhamad Rifai", "Nita Ariyanti", "Oscar Hidayat", "Putri Rahayu",
                "Qori Wahyuni", "Reza Firmansyah", "Salsabila Dewi", "Taufik Hidayat",
                "Umi Kalsum", "Vino Alamsyah", "Wulandari", "Xena Maharani",
                "Yoga Pratama"
            )
            currentJadwal.kelas.contains("XI RPL") -> arrayOf(
                "Agus Santoso", "Bimo Wicaksono", "Citra Melani", "Dwi Lestari",
                "Eko Susanto", "Fani Rahmawati", "Galang Pratama", "Hesti Novianti",
                "Imam Fauzan", "Jihan Nabila", "Kurnia Adi", "Laras Setyawati",
                "Mira Handayani", "Nanda Putra", "Okta Widiawan", "Pipit Anggraini",
                "Qirani Salsabila", "Rizky Maulana", "Sinta Oktavia", "Teguh Prasetyo",
                "Ulfa Mardiana", "Valdi Rahman", "Widya Astuti", "Xandra Wibowo",
                "Yogi Pratama", "Zahro Amalia", "Adi Nugroho", "Bella Oktaviani",
                "Candra Wijaya", "Deni Firmansyah", "Erik Setiawan", "Fitria Handayani"
            )
            currentJadwal.kelas.contains("X RPL") -> arrayOf(
                "Aldi Saputra", "Bunga Permata", "Cahyo Nugroho", "Desi Wulandari",
                "Eri Prayogo", "Fika Amalia", "Ganda Kusuma", "Hana Pratiwi",
                "Ilham Syahputra", "Jodi Firmansyah", "Kartika Nuraini", "Lutfi Hasan",
                "Mega Kurniawati", "Naufal Hakim", "Oky Setiawan", "Pita Rahmawati",
                "Qana Salsabila", "Rian Maulana", "Salsa Aulia", "Toni Wibowo",
                "Ulfah Ramadhani", "Vega Pratama", "Widy Lestari", "Xena Putri",
                "Yohana Dewi", "Zaky Ramadhan", "Amir Fatoni", "Bagas Pamungkas",
                "Cici Melani", "Dafa Alfiyan"
            )
            else -> arrayOf(
                "Ahmad Fauzi", "Budi Santoso", "Citra Dewi", "Dian Pratama",
                "Eko Prasetyo", "Fitriani", "Gunawan", "Hendra Wijaya",
                "Indah Permata", "Joko Susilo", "Kartika Sari", "Lukman Hakim",
                "Maya Indah", "Nurhayati", "Oktaviani", "Puji Astuti",
                "Rahmat Hidayat", "Siti Aisyah", "Teguh Wijaya", "Umar Said",
                "Vina Melati", "Wahyu Ramadhan", "Yuniarti", "Zainal Abidin"
            )
        }
    }

    // ==================== POPUP ABSENSI ====================
    private fun showAbsensiPopup() {
        val dialog = Dialog(this)
        dialog.setContentView(R.layout.pop_up_absensi)
        dialog.window?.setBackgroundDrawableResource(android.R.color.transparent)

        val btnPindaiQr: Button = dialog.findViewById(R.id.btn_pindaiqr)
        val btnKembali: Button = dialog.findViewById(R.id.btn_kembali)

        btnPindaiQr.setOnClickListener {
            dialog.dismiss()
            val intent = Intent(this, CameraQRActivity::class.java).apply {
                putExtra(CameraQRActivity.EXTRA_MAPEL, currentJadwal.mataPelajaran)
                putExtra(CameraQRActivity.EXTRA_KELAS, currentJadwal.kelas)
                putExtra(CameraQRActivity.EXTRA_IS_TEACHER, true)
            }
            qrScannerLauncher.launch(intent)
        }

        btnKembali.setOnClickListener { dialog.dismiss() }
        dialog.show()
    }

    // ==================== POPUP TIDAK MENGAJAR (IZIN GURU) ====================
    private fun showTidakMengajarPopup() {
        val dialog = Dialog(this)
        dialog.setContentView(R.layout.pop_up_tidak_mengajar)
        dialog.window?.setBackgroundDrawableResource(android.R.color.transparent)

        val tvNamaMapel: TextView = dialog.findViewById(R.id.tv_nama_mapel)
        val tvKelas: TextView = dialog.findViewById(R.id.tv_kelas)
        val inputKeterangan: EditText = dialog.findViewById(R.id.input_keterangan)
        val btnDropdownKeterangan: LinearLayout = dialog.findViewById(R.id.btn_dropdown_keterangan)
        val inputMapel: EditText = dialog.findViewById(R.id.input_mapel)
        val btnDropdownMapel: LinearLayout = dialog.findViewById(R.id.btn_dropdown_mapel)
        val inputTanggal: EditText = dialog.findViewById(R.id.input_tanggal)
        val etCatatan: EditText = dialog.findViewById(R.id.et_catatan)
        val btnKirimIzin: Button = dialog.findViewById(R.id.btn_kirim_izin)
        val btnBatalIzin: Button = dialog.findViewById(R.id.btn_batal_izin)

        // Set data
        tvNamaMapel.text = "${currentJadwal.mataPelajaran} - "
        tvKelas.text = currentJadwal.kelas
        inputMapel.setText(currentJadwal.jam)

        val sdf = SimpleDateFormat("dd-MM-yyyy", Locale.getDefault())
        inputTanggal.setText(sdf.format(Date()))

        // Setup dropdown keterangan (hanya Izin dan Sakit)
        inputKeterangan.isFocusable = false
        inputKeterangan.isClickable = true
        inputKeterangan.setOnClickListener { showKeteranganDropdownTidakMengajar(inputKeterangan) }
        btnDropdownKeterangan.setOnClickListener { showKeteranganDropdownTidakMengajar(inputKeterangan) }

        // Setup dropdown jam mapel
        inputMapel.isFocusable = false
        inputMapel.isClickable = true
        inputMapel.setOnClickListener { showJamMapelDropdown(inputMapel) }
        btnDropdownMapel.setOnClickListener { showJamMapelDropdown(inputMapel) }

        // Setup tanggal
        inputTanggal.setOnClickListener { showDatePickerDialog(inputTanggal) }

        btnKirimIzin.setOnClickListener {
            val keterangan = inputKeterangan.text.toString()
            val jamMapel = inputMapel.text.toString()
            val catatan = etCatatan.text.toString()

            if (keterangan.isEmpty()) {
                Toast.makeText(this, "Harap pilih keterangan", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val tipeIzin = when {
                keterangan.contains("Sakit", ignoreCase = true) -> "sakit"
                else -> "izin"
            }

            showSuccessDialog(
                title = "Sukses",
                message = """
                    Izin tidak mengajar berhasil dikirim!
                    
                    Mata Pelajaran: ${currentJadwal.mataPelajaran}
                    Kelas: ${currentJadwal.kelas}
                    Keterangan: $keterangan
                    Jadwal: $jamMapel
                    Tanggal: ${inputTanggal.text}
                    ${if (catatan.isNotEmpty()) "Catatan: $catatan" else ""}
                """.trimIndent()
            ) {
                dialog.dismiss()
                terapkanStatusIzinGuru(tipeIzin)
            }
        }

        btnBatalIzin.setOnClickListener { dialog.dismiss() }
        dialog.show()
    }

    // ==================== POPUP IZIN/SAKIT SISWA (DENGAN FILE) ====================
    private fun showIzinSakitPopup() {
        val dialog = Dialog(this)
        dialog.setContentView(R.layout.pop_up_izin)
        dialog.window?.setBackgroundDrawableResource(android.R.color.transparent)

        // SESUAIKAN DENGAN ID DI pop_up_izin.xml
        val inputNamaSiswa: EditText = dialog.findViewById(R.id.input_nama_siswa)
        val btnDropdownSiswa: ImageButton = dialog.findViewById(R.id.btn_dropdown_siswa)

        // Box bukti surat
        val boxBuktiSurat: LinearLayout = dialog.findViewById(R.id.box_bukti_surat)
        val namaFileTextView: TextView = dialog.findViewById(R.id.namafile)
        val btnTambahkanFile: ImageButton = dialog.findViewById(R.id.btn_tambahkanfile)
        currentNamaFileTextView = namaFileTextView

        // Jam section
        val layoutJamSection: LinearLayout = dialog.findViewById(R.id.layout_jam_section)
        val inputJam: EditText = dialog.findViewById(R.id.input_jam)
        val btnSetClock: ImageView = dialog.findViewById(R.id.btn_set_clock)
        val btnDropdownJam: LinearLayout = dialog.findViewById(R.id.btn_dropdown_jam)
        val inputJamSelesai: EditText = dialog.findViewById(R.id.input_jam_selesai)
        val btnSetClockSelesai: ImageView = dialog.findViewById(R.id.btn_set_clock_selesai)
        val btnDropdownJamSelesai: LinearLayout = dialog.findViewById(R.id.btn_dropdown_jam_selesai)

        // Tanggal dan catatan
        val inputTanggal: EditText = dialog.findViewById(R.id.input_tanggal)
        val etCatatan: EditText = dialog.findViewById(R.id.et_catatan)

        // Tombol
        val btnKirimIzin: Button = dialog.findViewById(R.id.btn_kirim_izin)
        val btnBatalIzin: Button = dialog.findViewById(R.id.btn_batal_izin)

        // Set tanggal default
        val sdf = SimpleDateFormat("dd-MM-yyyy", Locale.getDefault())
        inputTanggal.setText(sdf.format(Date()))

        // Reset state
        selectedFileUri = null
        namaFileTextView.text = "Masukkan Bukti Surat (izin/sakit)"
        boxBuktiSurat.visibility = View.VISIBLE
        layoutJamSection.visibility = View.GONE

        // Setup dropdown siswa dengan keterangan
        inputNamaSiswa.isFocusable = false
        inputNamaSiswa.isClickable = true
        inputNamaSiswa.setOnClickListener {
            showSiswaWithKeteranganDropdown(inputNamaSiswa, boxBuktiSurat, layoutJamSection)
        }
        btnDropdownSiswa.setOnClickListener {
            showSiswaWithKeteranganDropdown(inputNamaSiswa, boxBuktiSurat, layoutJamSection)
        }

        // Setup file picker
        btnTambahkanFile.setOnClickListener {
            filePickerLauncher.launch("image/*")
        }

        // Setup jam
        inputJam.isFocusable = false
        inputJam.isClickable = true
        inputJam.setOnClickListener { showTimePickerDialog(inputJam) }
        btnSetClock.setOnClickListener { showTimePickerDialog(inputJam) }
        btnDropdownJam.setOnClickListener { showTimePickerDialog(inputJam) }

        inputJamSelesai.isFocusable = false
        inputJamSelesai.isClickable = true
        inputJamSelesai.setOnClickListener { showTimePickerDialog(inputJamSelesai) }
        btnSetClockSelesai.setOnClickListener { showTimePickerDialog(inputJamSelesai) }
        btnDropdownJamSelesai.setOnClickListener { showTimePickerDialog(inputJamSelesai) }

        // Setup tanggal
        inputTanggal.setOnClickListener { showDatePickerDialog(inputTanggal) }

        btnKirimIzin.setOnClickListener {
            val namaSiswaWithKeterangan = inputNamaSiswa.text.toString()
            val jamMulai = inputJam.text.toString()
            val jamSelesai = inputJamSelesai.text.toString()
            val catatan = etCatatan.text.toString()

            // Validasi
            val validationError = validateIzinSakitInput(
                namaSiswaWithKeterangan,
                jamMulai,
                jamSelesai
            )
            if (validationError != null) {
                Toast.makeText(this, validationError, Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val parts = namaSiswaWithKeterangan.split(" - ")
            val namaSiswa = parts[0]
            val keterangan = parts[1]

            // Validasi file untuk Izin/Sakit
            if ((keterangan == "Izin" || keterangan == "Sakit") && selectedFileUri == null) {
                Toast.makeText(this, "Harap masukkan bukti surat untuk $keterangan", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val jamRange = if (keterangan == "Izin Pulang") "$jamMulai - $jamSelesai" else "-"
            val fileName = if (selectedFileUri != null) getFileName(selectedFileUri!!) else "-"

            showSuccessDialog(
                title = "Sukses",
                message = """
                    Izin/Sakit berhasil diajukan!
                    
                    Nama Siswa: $namaSiswa
                    Keterangan: $keterangan
                    Mata Pelajaran: ${currentJadwal.mataPelajaran}
                    Kelas: ${currentJadwal.kelas}
                    ${if (keterangan == "Izin Pulang") "Jam: $jamRange" else ""}
                    Tanggal Berlaku: ${inputTanggal.text}
                    ${if (selectedFileUri != null) "File: $fileName" else ""}
                    ${if (catatan.isNotEmpty()) "Catatan: $catatan" else ""}
                """.trimIndent()
            ) {
                dialog.dismiss()
            }
        }

        btnBatalIzin.setOnClickListener { dialog.dismiss() }
        dialog.show()
    }

    // ==================== POPUP DISPENSASI SISWA (TANPA FILE) ====================
    // FIXED: TIDAK ADA input_keterangan, HANYA nama, jam, tanggal, catatan
    private fun showDispensasiPopup() {
        val dialog = Dialog(this)
        dialog.setContentView(R.layout.pop_up_dispensasi)
        dialog.window?.setBackgroundDrawableResource(android.R.color.transparent)

        // SESUAIKAN DENGAN ID DI pop_up_dispensasi.xml
        // HANYA view yang ADA di XML dispensasi
        val inputNamaSiswa: EditText = dialog.findViewById(R.id.input_nama_siswa)
        val btnDropdownSiswa: ImageButton = dialog.findViewById(R.id.btn_dropdown_siswa)

        // Jam
        val inputJam: EditText = dialog.findViewById(R.id.input_jam)
        val btnSetClock: ImageView = dialog.findViewById(R.id.btn_set_clock)
        val btnDropdownJam: LinearLayout = dialog.findViewById(R.id.btn_dropdown_jam)
        val inputJamSelesai: EditText = dialog.findViewById(R.id.input_jam_selesai)
        val btnSetClockSelesai: ImageView = dialog.findViewById(R.id.btn_set_clock_selesai)
        val btnDropdownJamSelesai: LinearLayout = dialog.findViewById(R.id.btn_dropdown_jam_selesai)

        // Tanggal dan catatan
        val inputTanggal: EditText = dialog.findViewById(R.id.input_tanggal)
        val etCatatan: EditText = dialog.findViewById(R.id.et_catatan)

        // Tombol - PERHATIKAN ID NYA BERBEDA!
        val btnKirimDispen: Button = dialog.findViewById(R.id.btn_kirim_dispen)
        val btnBatal: Button = dialog.findViewById(R.id.btn_batal)

        // Set tanggal default
        val sdf = SimpleDateFormat("dd-MM-yyyy", Locale.getDefault())
        inputTanggal.setText(sdf.format(Date()))

        // Setup dropdown siswa - LANGSUNG, tanpa fungsi helper
        inputNamaSiswa.isFocusable = false
        inputNamaSiswa.isClickable = true
        inputNamaSiswa.setOnClickListener { showSiswaByKelasDropdown(inputNamaSiswa) }
        btnDropdownSiswa.setOnClickListener { showSiswaByKelasDropdown(inputNamaSiswa) }

        // Setup jam - LANGSUNG, tanpa fungsi helper
        inputJam.isFocusable = false
        inputJam.isClickable = true
        inputJam.setOnClickListener { showTimePickerDialog(inputJam) }
        btnSetClock.setOnClickListener { showTimePickerDialog(inputJam) }
        btnDropdownJam.setOnClickListener { showTimePickerDialog(inputJam) }

        inputJamSelesai.isFocusable = false
        inputJamSelesai.isClickable = true
        inputJamSelesai.setOnClickListener { showTimePickerDialog(inputJamSelesai) }
        btnSetClockSelesai.setOnClickListener { showTimePickerDialog(inputJamSelesai) }
        btnDropdownJamSelesai.setOnClickListener { showTimePickerDialog(inputJamSelesai) }

        // Setup tanggal
        inputTanggal.setOnClickListener { showDatePickerDialog(inputTanggal) }

        btnKirimDispen.setOnClickListener {
            val namaSiswa = inputNamaSiswa.text.toString()
            val jamMulai = inputJam.text.toString()
            val jamSelesai = inputJamSelesai.text.toString()
            val catatan = etCatatan.text.toString()

            // Validasi - HANYA nama dan jam (TIDAK ADA keterangan)
            if (namaSiswa.isEmpty()) {
                Toast.makeText(this, "Harap pilih nama siswa", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            if (jamMulai.isEmpty()) {
                Toast.makeText(this, "Harap atur jam mulai dispensasi", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            if (jamSelesai.isEmpty()) {
                Toast.makeText(this, "Harap atur jam selesai dispensasi", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val jamRange = "$jamMulai - $jamSelesai"

            showSuccessDialog(
                title = "Sukses",
                message = """
                    Dispensasi berhasil diajukan!
                    
                    Nama Siswa: $namaSiswa
                    Mata Pelajaran: ${currentJadwal.mataPelajaran}
                    Kelas: ${currentJadwal.kelas}
                    Jam: $jamRange
                    Tanggal Berlaku: ${inputTanggal.text}
                    ${if (catatan.isNotEmpty()) "Catatan: $catatan" else ""}
                """.trimIndent()
            ) {
                dialog.dismiss()
            }
        }

        btnBatal.setOnClickListener { dialog.dismiss() }
        dialog.show()
    }

    // ==================== HELPER FUNCTIONS ====================

    private fun showSiswaByKelasDropdown(editText: EditText) {
        val siswaList = getSiswaByKelas()
        AlertDialog.Builder(this)
            .setTitle("Pilih Siswa - ${currentJadwal.kelas}")
            .setItems(siswaList) { _, which ->
                editText.setText(siswaList[which])
            }
            .show()
    }

    private fun showSiswaWithKeteranganDropdown(
        editText: EditText,
        boxBuktiSurat: LinearLayout,
        layoutJamSection: LinearLayout
    ) {
        val siswaList = getSiswaByKelas()
        val keteranganList = arrayOf("Izin", "Sakit", "Izin Pulang")

        AlertDialog.Builder(this)
            .setTitle("Pilih Siswa - ${currentJadwal.kelas}")
            .setItems(siswaList) { _, siswaIndex ->
                val namaSiswa = siswaList[siswaIndex]

                AlertDialog.Builder(this)
                    .setTitle("Pilih Keterangan")
                    .setItems(keteranganList) { _, keteranganIndex ->
                        val keterangan = keteranganList[keteranganIndex]
                        editText.setText("$namaSiswa - $keterangan")

                        when (keterangan) {
                            "Izin Pulang" -> {
                                boxBuktiSurat.visibility = View.GONE
                                layoutJamSection.visibility = View.VISIBLE
                            }
                            else -> {
                                boxBuktiSurat.visibility = View.VISIBLE
                                layoutJamSection.visibility = View.GONE
                            }
                        }
                    }
                    .show()
            }
            .show()
    }

    private fun validateIzinSakitInput(
        namaSiswaWithKeterangan: String,
        jamMulai: String,
        jamSelesai: String
    ): String? {
        if (namaSiswaWithKeterangan.isEmpty()) {
            return "Harap pilih nama siswa"
        }

        val parts = namaSiswaWithKeterangan.split(" - ")
        if (parts.size < 2) {
            return "Format nama siswa tidak valid"
        }

        val keterangan = parts[1]

        if (keterangan == "Izin Pulang") {
            if (jamMulai.isEmpty()) return "Harap atur jam mulai"
            if (jamSelesai.isEmpty()) return "Harap atur jam selesai"
        }

        return null
    }

    private fun showKeteranganDropdownTidakMengajar(editText: EditText) {
        val items = arrayOf("Izin", "Sakit")
        AlertDialog.Builder(this)
            .setTitle("Pilih Keterangan")
            .setItems(items) { _, which -> editText.setText(items[which]) }
            .show()
    }

    private fun showJamMapelDropdown(editText: EditText) {
        val items = arrayOf(
            currentJadwal.jam,
            "Tukar jam dengan guru lain",
            "Jam pengganti"
        )
        AlertDialog.Builder(this)
            .setTitle("Pilih Jadwal")
            .setItems(items) { _, which -> editText.setText(items[which]) }
            .show()
    }

    private fun showDatePickerDialog(editText: EditText) {
        val calendar = Calendar.getInstance()
        android.app.DatePickerDialog(
            this,
            { _, selectedYear, selectedMonth, selectedDay ->
                editText.setText(
                    String.format(Locale.getDefault(), "%02d-%02d-%04d",
                        selectedDay, selectedMonth + 1, selectedYear)
                )
            },
            calendar.get(Calendar.YEAR),
            calendar.get(Calendar.MONTH),
            calendar.get(Calendar.DAY_OF_MONTH)
        ).show()
    }

    private fun showTimePickerDialog(editText: EditText) {
        val calendar = Calendar.getInstance()
        android.app.TimePickerDialog(
            this,
            { _, hourOfDay, minute ->
                editText.setText(
                    String.format(Locale.getDefault(), "%02d:%02d", hourOfDay, minute)
                )
            },
            calendar.get(Calendar.HOUR_OF_DAY),
            calendar.get(Calendar.MINUTE),
            true
        ).show()
    }

    private fun showSuccessDialog(title: String, message: String, onOk: () -> Unit) {
        AlertDialog.Builder(this)
            .setTitle(title)
            .setMessage(message)
            .setPositiveButton("OK") { _, _ -> onOk() }
            .show()
    }
}