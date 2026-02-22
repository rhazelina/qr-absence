package com.example.ritamesa

import android.os.Bundle
import android.widget.ImageButton
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.ritamesa.AbsensiAdapter.SiswaData

class AbsensiSiswaActivity : AppCompatActivity() {

    private lateinit var adapter: AbsensiAdapter
    private lateinit var rvListAbsen: RecyclerView
    private lateinit var tvNamaMapel: TextView
    private lateinit var tvKelas: TextView
    private lateinit var tvTanggalWaktu: TextView
    private lateinit var btnBack: ImageButton
    private lateinit var btnSimpan: ImageButton
    private lateinit var btnBatal: ImageButton

    private var mapel: String = ""
    private var kelas: String = ""
    private var tanggal: String = ""
    private var jam: String = ""

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.absen_kehadiran_siswa)

        initViews()
        getDataFromIntent()
        setupRecyclerView()
        setupClickListeners()
    }

    private fun initViews() {
        tvNamaMapel = findViewById(R.id.text_nama_mapel)
        tvKelas = findViewById(R.id.title_kelas)
        tvTanggalWaktu = findViewById(R.id.tanggal_waktu_mulai)
        btnBack = findViewById(R.id.btn_back)
        btnSimpan = findViewById(R.id.btn_simpan_kehadiran)
        btnBatal = findViewById(R.id.btn_batal_absensi)
        rvListAbsen = findViewById(R.id.rvListAbsen)
    }

    private fun getDataFromIntent() {
        mapel = intent.getStringExtra(CameraQRActivity.EXTRA_MAPEL) ?:
                intent.getStringExtra("MATA_PELAJARAN") ?:
                "Matematika"

        kelas = intent.getStringExtra(CameraQRActivity.EXTRA_KELAS) ?:
                intent.getStringExtra("KELAS") ?:
                "XI RPL 1"

        tanggal = intent.getStringExtra("tanggal") ?:
                intent.getStringExtra("TANGGAL") ?:
                getCurrentDate()

        jam = intent.getStringExtra("jam") ?:
                intent.getStringExtra("JAM") ?:
                "00:00-00:00"

        tvNamaMapel.text = mapel
        tvKelas.text = kelas
        tvTanggalWaktu.text = "$jam $tanggal"
    }

    private fun getCurrentDate(): String {
        val sdf = java.text.SimpleDateFormat("dd MMMM yyyy", java.util.Locale.getDefault())
        return sdf.format(java.util.Date())
    }

    private fun setupRecyclerView() {
        // Siswa diambil berdasarkan kelas yang diterima dari intent
        val siswaList = getSiswaByKelas(kelas)

        adapter = AbsensiAdapter(siswaList)
        rvListAbsen.layoutManager = LinearLayoutManager(this)
        rvListAbsen.adapter = adapter
    }

    /**
     * Mengembalikan daftar SiswaData sesuai kelas.
     * Data sinkron dengan daftar di DetailJadwalGuruActivity & DetailJadwalWakelActivity.
     */
    private fun getSiswaByKelas(namaKelas: String): List<SiswaData> {
        val namaList: List<String> = when {
            namaKelas.contains("XII RPL") -> listOf(
                "Ahmad Rizki", "Bella Safira", "Cahya Wardana", "Dimas Pratama",
                "Elisa Ramadhani", "Fariz Maulana", "Gina Pertiwi", "Hana Kusuma",
                "Irwan Fauzi", "Julia Santika", "Kevin Pratama", "Lita Andriani",
                "Muhamad Rifai", "Nita Ariyanti", "Oscar Hidayat", "Putri Rahayu",
                "Qori Wahyuni", "Reza Firmansyah", "Salsabila Dewi", "Taufik Hidayat",
                "Umi Kalsum", "Vino Alamsyah", "Wulandari", "Xena Maharani",
                "Yoga Pratama"
            )
            namaKelas.contains("XI RPL") -> listOf(
                "Agus Santoso", "Bimo Wicaksono", "Citra Melani", "Dwi Lestari",
                "Eko Susanto", "Fani Rahmawati", "Galang Pratama", "Hesti Novianti",
                "Imam Fauzan", "Jihan Nabila", "Kurnia Adi", "Laras Setyawati",
                "Mira Handayani", "Nanda Putra", "Okta Widiawan", "Pipit Anggraini",
                "Qirani Salsabila", "Rizky Maulana", "Sinta Oktavia", "Teguh Prasetyo",
                "Ulfa Mardiana", "Valdi Rahman", "Widya Astuti", "Xandra Wibowo",
                "Yogi Pratama", "Zahro Amalia", "Adi Nugroho", "Bella Oktaviani",
                "Candra Wijaya", "Deni Firmansyah", "Erik Setiawan", "Fitria Handayani"
            )
            namaKelas.contains("X RPL") -> listOf(
                "Aldi Saputra", "Bunga Permata", "Cahyo Nugroho", "Desi Wulandari",
                "Eri Prayogo", "Fika Amalia", "Ganda Kusuma", "Hana Pratiwi",
                "Ilham Syahputra", "Jodi Firmansyah", "Kartika Nuraini", "Lutfi Hasan",
                "Mega Kurniawati", "Naufal Hakim", "Oky Setiawan", "Pita Rahmawati",
                "Qana Salsabila", "Rian Maulana", "Salsa Aulia", "Toni Wibowo",
                "Ulfah Ramadhani", "Vega Pratama", "Widy Lestari", "Xena Putri",
                "Yohana Dewi", "Zaky Ramadhan", "Amir Fatoni", "Bagas Pamungkas",
                "Cici Melani", "Dafa Alfiyan"
            )
            else -> listOf(
                // Fallback: daftar umum 32 siswa
                "Ahmad Fauzi", "Budi Santoso", "Citra Dewi", "Dian Pratama",
                "Eko Prasetyo", "Fitriani", "Gunawan", "Hendra Wijaya",
                "Indah Permata", "Joko Susilo", "Kartika Sari", "Lukman Hakim",
                "Maya Indah", "Nurhayati", "Oktaviani", "Puji Astuti",
                "Rahmat Hidayat", "Siti Aisyah", "Teguh Wijaya", "Umar Said",
                "Vina Melati", "Wahyu Ramadhan", "Yuniarti", "Zainal Abidin",
                "Agus Supriyadi", "Bayu Anggara", "Cindy Novita", "Dedi Setiawan",
                "Eka Putri", "Fajar Nugroho", "Galih Pratama", "Hesti Wulandari"
            )
        }

        // Generate NISN dummy: mulai dari 0096785678
        val nisnBase = 96785678L
        return namaList.mapIndexed { index, nama ->
            SiswaData(
                id = index + 1,
                nomor = index + 1,
                nisn = (nisnBase + index).toString().padStart(10, '0'),
                nama = nama,
                status = "none"   // semua mulai dari belum dipilih
            )
        }
    }

    private fun setupClickListeners() {
        btnBack.setOnClickListener {
            finish()
        }

        btnSimpan.setOnClickListener {
            simpanAbsensi()
        }

        btnBatal.setOnClickListener {
            batalAbsensi()
        }
    }

    private fun simpanAbsensi() {
        val absensiData = adapter.getAbsensiData()

        var totalHadir = 0
        var totalIzin = 0
        var totalSakit = 0
        var totalAlpha = 0

        absensiData.forEach { siswa ->
            when (siswa.status) {
                "hadir" -> totalHadir++
                "izin" -> totalIzin++
                "sakit" -> totalSakit++
                "alpha" -> totalAlpha++
            }
        }

        val message = """
            Absensi berhasil disimpan!
            
            Mata Pelajaran: $mapel
            Kelas: $kelas
            Tanggal: $tanggal
            Jam: $jam
            
            Ringkasan:
            - Total Siswa: ${absensiData.size}
            - Hadir: $totalHadir
            - Izin: $totalIzin
            - Sakit: $totalSakit
            - Alpha: $totalAlpha
            - Belum dipilih: ${absensiData.size - totalHadir - totalIzin - totalSakit - totalAlpha}
        """.trimIndent()

        Toast.makeText(this, message, Toast.LENGTH_LONG).show()

        finish()
    }

    private fun batalAbsensi() {
        adapter.resetAllStatus()
        Toast.makeText(this, "Absensi dibatalkan, status direset", Toast.LENGTH_SHORT).show()
    }
}