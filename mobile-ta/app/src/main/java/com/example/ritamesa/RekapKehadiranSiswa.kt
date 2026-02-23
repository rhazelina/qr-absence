package com.example.ritamesa

import android.content.Intent
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import kotlinx.coroutines.launch

class RekapKehadiranSiswa : BaseNetworkActivity() {

    private lateinit var recyclerView: RecyclerView
    private lateinit var rekapAdapter: RekapSiswaAdapter
    private lateinit var editTextSearch: EditText
    private lateinit var btnBack: ImageButton
    private lateinit var btnMenu: ImageButton

    // ===== DATA SISWA DARI EXCEL =====
    private val siswaList = mutableListOf(
        // XI RPL 1 (No 1-36)
        SiswaRekap(1, "ABRORY AKBAR AL BATAMI", "3078207819", "XI RPL 1"),
        SiswaRekap(2, "AFIF FIRMANSYAH", "0086659776", "XI RPL 1"),
        SiswaRekap(3, "AGIES WIDYAWATI", "0087441890", "XI RPL 1"),
        SiswaRekap(4, "AGIL RIFATUL HAQ", "0071026334", "XI RPL 1"),
        SiswaRekap(5, "AKH. SEPTIAN FIO RAMADHAN", "0078492418", "XI RPL 1"),
        SiswaRekap(6, "Alya Fitri Larasati", "0077521428", "XI RPL 1"),
        SiswaRekap(7, "ANASTASYA DYAH AYU PROBONINGRUM", "0084302867", "XI RPL 1"),
        SiswaRekap(8, "ANISA PUSPITASARI", "0079564039", "XI RPL 1"),
        SiswaRekap(9, "Anissa Prissilvia Tahara", "0087599872", "XI RPL 1"),
        SiswaRekap(10, "AQILLA MAULIDDYAH", "0084701495", "XI RPL 1"),
        SiswaRekap(11, "AQILNA FAILLA LILFARA AIZANI", "0079518058", "XI RPL 1"),
        SiswaRekap(12, "Aristia Faren Rafaela", "0076823738", "XI RPL 1"),
        SiswaRekap(13, "ASYHARIL KAHFI DEWANDA", "0088840490", "XI RPL 1"),
        SiswaRekap(14, "Athaar Putra Ruhenda", "0086920055", "XI RPL 1"),
        SiswaRekap(15, "AVRILIANA ANJANI", "0088032174", "XI RPL 1"),
        SiswaRekap(16, "AZHAR ANISATUL JANNAH", "0089732684", "XI RPL 1"),
        SiswaRekap(17, "BINTANG FIRMAN ARDANA", "0086246127", "XI RPL 1"),
        SiswaRekap(18, "CALLISTA SHAFA RAMADHANI", "3079461424", "XI RPL 1"),
        SiswaRekap(19, "CHEVY APRILIA HUTABARAT", "0077372447", "XI RPL 1"),
        SiswaRekap(20, "CINDI TRI PRASETYO", "0073851099", "XI RPL 1"),
        SiswaRekap(21, "CINTYA KARINA PUTRI", "0082111423", "XI RPL 1"),
        SiswaRekap(22, "DHIA MIRZA HANDHIONO", "0078343685", "XI RPL 1"),
        SiswaRekap(23, "DIANDHIKA DWI PRANATA", "0081555900", "XI RPL 1"),
        SiswaRekap(24, "FAIRUZ QUDS ZAHRAN FIRDAUS", "0081936855", "XI RPL 1"),
        SiswaRekap(25, "FARDAN RASYAH ISLAMI", "0079300540", "XI RPL 1"),
        SiswaRekap(26, "FATCHUR ROHMAN ROFIAN", "0088713839", "XI RPL 1"),
        SiswaRekap(27, "FIDATUL AVIVA", "0087853322", "XI RPL 1"),
        SiswaRekap(28, "FIRLI ZULFA AZZAHRA", "0088560011", "XI RPL 1"),
        SiswaRekap(29, "HAPSARI ISMARTOYO", "0062756939", "XI RPL 1"),
        SiswaRekap(30, "HAVID ABDILAH SURAHMAD", "0087538918", "XI RPL 1"),
        SiswaRekap(31, "IGNACIA ZANDRA", "0072226999", "XI RPL 1"),
        SiswaRekap(32, "IQBAL LAZUARDI", "0074853632", "XI RPL 1"),
        SiswaRekap(33, "IQLIMAHDA TANZILLA FINAN DIVA", "0089462835", "XI RPL 1"),
        SiswaRekap(34, "IRDINA MARSYA MAZARINA", "0077181841", "XI RPL 1"),
        SiswaRekap(35, "ISABEL CAHAYA HATI", "0086237279", "XI RPL 1"),
        SiswaRekap(36, "KHOIRUN NI'MAH NURUL HIDAYAH", "0074316703", "XI RPL 1"),

        // XI RPL 2 (No 37-70)
        SiswaRekap(37, "LAURA LAVIDA LOCA", "0074182519", "XI RPL 2"),
        SiswaRekap(38, "LELY SAGITA", "0074320819", "XI RPL 2"),
        SiswaRekap(39, "MAYA MELINDA WIJAYANTI", "0078658367", "XI RPL 2"),
        SiswaRekap(40, "MOCH. ABYL GUSTIAN", "0079292238", "XI RPL 2"),
        SiswaRekap(41, "MUHAMMAD AMINULLAH", "0084421457", "XI RPL 2"),
        SiswaRekap(42, "Muhammad Azka Fadli Atthaya", "0089104721", "XI RPL 2"),
        SiswaRekap(43, "MUHAMMAD HADI FIRMANSYAH", "0087917739", "XI RPL 2"),
        SiswaRekap(44, "MUHAMMAD HARRIS MAULANA SAPUTRA", "0074704843", "XI RPL 2"),
        SiswaRekap(45, "MUHAMMAD IBNU RAFFI AHDAN", "0077192596", "XI RPL 2"),
        SiswaRekap(46, "MUHAMMAD REYHAN ATHADIANSYAH", "0075024492", "XI RPL 2"),
        SiswaRekap(47, "MUHAMMAD WISNU DEWANDARU", "0141951182", "XI RPL 2"),
        SiswaRekap(48, "NABILA RAMADHAN", "0072504970", "XI RPL 2"),
        SiswaRekap(49, "NADIA SINTA DEVI OKTAVIA", "0061631562", "XI RPL 2"),
        SiswaRekap(50, "NADJWA KIRANA FIRDAUS", "0081112175", "XI RPL 2"),
        SiswaRekap(51, "NINDI NARITA MAULIDYA", "0089965810", "XI RPL 2"),
        SiswaRekap(52, "NISWATUL KHOIRIYAH", "0085834363", "XI RPL 2"),
        SiswaRekap(53, "NOVERITA PASCALIA RAHMA", "0087884391", "XI RPL 2"),
        SiswaRekap(54, "NOVITA ANDRIANI", "0078285764", "XI RPL 2"),
        SiswaRekap(55, "NOVITA AZZAHRA", "0078980482", "XI RPL 2"),
        SiswaRekap(56, "NURUL KHASANAH", "0078036100", "XI RPL 2"),
        SiswaRekap(57, "RACHEL ALUNA MEIZHA", "0081838771", "XI RPL 2"),
        SiswaRekap(58, "RAENA WESTI DHEANOFA HERLIANI", "0079312790", "XI RPL 2"),
        SiswaRekap(59, "RAYHANUN", "0084924963", "XI RPL 2"),
        SiswaRekap(60, "RAYYAN DAFFA AL AFFANI", "0077652198", "XI RPL 2"),
        SiswaRekap(61, "RHAMEYZHA ALEA CHALILA PUTRI EDWARD", "0087959211", "XI RPL 2"),
        SiswaRekap(62, "RHEISYA MAULIDDIVA PUTRI", "0089530132", "XI RPL 2"),
        SiswaRekap(63, "RHEYVAN RAMADHAN I.P", "0089479412", "XI RPL 2"),
        SiswaRekap(64, "RISKY RAMADHANI", "0073540571", "XI RPL 2"),
        SiswaRekap(65, "RITA AURA AGUSTINA", "0076610748", "XI RPL 2"),
        SiswaRekap(66, "RIZKY RAMADHANI", "0077493253", "XI RPL 2"),
        SiswaRekap(67, "SA'IDHATUL HASANA", "0076376703", "XI RPL 2"),
        SiswaRekap(68, "SHISILIA ISMU PUTRI", "0072620559", "XI RPL 2"),
        SiswaRekap(69, "SUCI RAMADANI INDRIANSYAH", "0072336597", "XI RPL 2"),
        SiswaRekap(70, "TALITHA NUDIA RISMATULLAH", "0075802873", "XI RPL 2")
    )

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.rekap_kehadiran_siswa)

        initView()
        setupRecyclerView()
        setupActions()
        setupBottomNavigation()
        setupSearch()
    }

    private fun initView() {
        recyclerView = findViewById(R.id.rvKehadiran)
        editTextSearch = findViewById(R.id.editTextText5)
        btnBack = findViewById(R.id.btnBack)
        btnMenu = findViewById(R.id.buttonmenu)
    }

    private fun setupRecyclerView() {
        recyclerView.layoutManager = LinearLayoutManager(this)
        recyclerView.setHasFixedSize(true)

        rekapAdapter = RekapSiswaAdapter(
            siswaList,
            onLihatClickListener = { siswa ->
                showPopupDetailSiswa(siswa)
            }
        )
        recyclerView.adapter = rekapAdapter
    }

    private fun showPopupDetailSiswa(siswa: SiswaRekap) {
        val inflater = LayoutInflater.from(this)
        val popupView = inflater.inflate(R.layout.popup_siswa_detail, null)

        // Set data siswa
        popupView.findViewById<TextView>(R.id.tvPopupNama).text = siswa.nama
        popupView.findViewById<TextView>(R.id.tvPopupNisn).text = siswa.nisn
        popupView.findViewById<TextView>(R.id.tvPopupKelas).text = siswa.kelas

        val container = popupView.findViewById<LinearLayout>(R.id.containerKehadiran)
        setupDataKehadiranSiswa(container, siswa)

        val popupWindow = PopupWindow(
            popupView,
            LinearLayout.LayoutParams.WRAP_CONTENT,
            LinearLayout.LayoutParams.WRAP_CONTENT,
            true
        )

        popupWindow.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
        popupWindow.elevation = 20f
        popupWindow.isOutsideTouchable = true

        val popupContainer = popupView.findViewById<View>(R.id.popupContainer)
        popupContainer.alpha = 0.95f

        popupView.findViewById<Button>(R.id.btnTutupPopup).setOnClickListener {
            popupWindow.dismiss()
        }

        val backgroundView = View(this)
        backgroundView.setBackgroundColor(Color.parseColor("#80000000"))
        val rootView = window.decorView.rootView as ViewGroup
        rootView.addView(backgroundView)

        popupWindow.showAtLocation(window.decorView.rootView, android.view.Gravity.CENTER, 0, 0)

        popupWindow.setOnDismissListener {
            rootView.removeView(backgroundView)
        }
    }

    private fun setupDataKehadiranSiswa(container: LinearLayout, siswa: SiswaRekap) {
        container.removeAllViews()

        siswa.getDataKehadiran().forEach { kehadiran ->
            val itemView = LayoutInflater.from(this)
                .inflate(R.layout.item_kehadiran_popup, container, false)

            itemView.findViewById<TextView>(R.id.tvTanggal).text = kehadiran.tanggal
            itemView.findViewById<TextView>(R.id.tvMapelKelas).text = kehadiran.mataPelajaran
            itemView.findViewById<TextView>(R.id.tvJam).text = kehadiran.jam
            itemView.findViewById<TextView>(R.id.tvStatus).text = kehadiran.status
            itemView.findViewById<TextView>(R.id.tvKeterangan).text = kehadiran.keterangan

            val tvStatus = itemView.findViewById<TextView>(R.id.tvStatus)
            when (kehadiran.status.lowercase()) {
                "hadir" -> tvStatus.setTextColor(Color.parseColor("#4CAF50"))
                "sakit" -> tvStatus.setTextColor(Color.parseColor("#FF9800"))
                "izin" -> tvStatus.setTextColor(Color.parseColor("#2196F3"))
                "alpha" -> tvStatus.setTextColor(Color.parseColor("#F44336"))
                "terlambat" -> tvStatus.setTextColor(Color.parseColor("#FF9800"))
            }

            container.addView(itemView)
        }
    }

    private fun setupActions() {
        btnBack.setOnClickListener {
            finish()
        }

        btnMenu.setOnClickListener {
            showPopupMenu(it)
        }
    }

    private fun setupSearch() {
        editTextSearch.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}

            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                filterData(s.toString().trim())
            }

            override fun afterTextChanged(s: Editable?) {}
        })

        findViewById<ImageButton>(R.id.imageButton17).setOnClickListener {
            editTextSearch.text.clear()
            editTextSearch.requestFocus()
            rekapAdapter.filter("")
            Toast.makeText(this, "Menampilkan semua data siswa", Toast.LENGTH_SHORT).show()
        }
    }

    private fun filterData(query: String) {
        rekapAdapter.filter(query)

        if (query.isNotEmpty() && rekapAdapter.itemCount == 0) {
            Toast.makeText(this, "Tidak ditemukan siswa dengan kata kunci '$query'", Toast.LENGTH_SHORT).show()
        }
    }

    private fun showPopupMenu(view: View) {
        val popup = PopupMenu(this, view)
        popup.menuInflater.inflate(R.menu.menu_rekap_switch, popup.menu)

        popup.setOnMenuItemClickListener { menuItem ->
            when (menuItem.itemId) {
                R.id.menu_guru -> {
                    val intent = Intent(this, RekapKehadiranGuru::class.java)
                    startActivity(intent)
                    finish()
                    true
                }
                R.id.menu_siswa -> {
                    Toast.makeText(this, "Sudah di halaman Siswa", Toast.LENGTH_SHORT).show()
                    true
                }
                else -> false
            }
        }
        popup.show()
    }

    private fun setupBottomNavigation() {
        findViewById<ImageButton>(R.id.imageButton2).setOnClickListener {
            val intent = Intent(this, Dashboard::class.java)
            startActivity(intent)
            finish()
        }

        findViewById<ImageButton>(R.id.imageButton3).setOnClickListener {
            Toast.makeText(this, "Sudah di halaman Data Rekap", Toast.LENGTH_SHORT).show()
        }

        findViewById<ImageButton>(R.id.imageButton5).setOnClickListener {
            try {
                val intent = Intent(this, StatistikKehadiran::class.java)
                startActivity(intent)
                finish()
            } catch (e: Exception) {
                Toast.makeText(this, "Halaman belum tersedia", Toast.LENGTH_SHORT).show()
            }
        }
    }

    // ===== DATA CLASS SISWA =====
    data class SiswaRekap(
        val id: Int,
        val nama: String,
        val nisn: String,
        val kelas: String
    ) {
        fun getDataKehadiran(): List<Kehadiran> {
            return listOf(
                Kehadiran("Senin, 13 Feb 2026", "Pemrograman Dasar / $kelas", "07:00-08:30", "Hadir", "Tepat waktu"),
                Kehadiran("Selasa, 14 Feb 2026", "Basis Data / $kelas", "08:45-10:15", "Hadir", "Tepat waktu"),
                Kehadiran("Rabu, 15 Feb 2026", "Pemrograman Web / $kelas", "10:30-12:00", "Hadir", "Tepat waktu"),
                Kehadiran("Kamis, 16 Feb 2026", "Mobile / $kelas", "13:15-14:45", "Sakit", "Izin sakit"),
                Kehadiran("Jumat, 17 Feb 2026", "UI/UX / $kelas", "07:00-08:30", "Hadir", "Tepat waktu")
            )
        }
    }

    data class Kehadiran(
        val tanggal: String,
        val mataPelajaran: String,
        val jam: String,
        val status: String,
        val keterangan: String
    )

    // ===== ADAPTER =====
    class RekapSiswaAdapter(
        private var dataList: List<SiswaRekap>,
        private val onLihatClickListener: (SiswaRekap) -> Unit
    ) : RecyclerView.Adapter<RekapSiswaAdapter.SiswaViewHolder>() {

        private var filteredList: List<SiswaRekap> = dataList

        inner class SiswaViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
            val tvNomor: TextView = itemView.findViewById(R.id.tvNomor)
            val tvNama: TextView = itemView.findViewById(R.id.tvNama)
            val tvNisn: TextView = itemView.findViewById(R.id.tvTelepon)
            val tvKelasJurusan: TextView = itemView.findViewById(R.id.tvMataPelajaran)
            val btnLihat: ImageButton = itemView.findViewById(R.id.btnLihat)

            init {
                btnLihat.setOnClickListener {
                    val position = adapterPosition
                    if (position != RecyclerView.NO_POSITION) {
                        onLihatClickListener(filteredList[position])
                    }
                }
            }
        }

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): SiswaViewHolder {
            val view = LayoutInflater.from(parent.context)
                .inflate(R.layout.item_lihat_rekap_guru, parent, false)
            return SiswaViewHolder(view)
        }

        override fun onBindViewHolder(holder: SiswaViewHolder, position: Int) {
            val siswa = filteredList[position]
            holder.tvNomor.text = (position + 1).toString()
            holder.tvNama.text = siswa.nama
            holder.tvNisn.text = siswa.nisn
            holder.tvKelasJurusan.text = siswa.kelas
        }

        override fun getItemCount(): Int = filteredList.size

        fun filter(query: String) {
            filteredList = if (query.isEmpty()) {
                dataList
            } else {
                val lowercaseQuery = query.lowercase()
                dataList.filter { siswa ->
                    siswa.nama.lowercase().contains(lowercaseQuery) ||
                            siswa.nisn.contains(query) ||
                            siswa.kelas.lowercase().contains(lowercaseQuery)
                }
            }
            notifyDataSetChanged()
        }

        fun updateData(newData: List<SiswaRekap>) {
            dataList = newData
            filteredList = newData
            notifyDataSetChanged()
        }
    }
}