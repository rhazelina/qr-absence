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
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.ritamesa.api.models.AttendanceResource
import kotlinx.coroutines.launch

class RekapKehadiranGuru : BaseNetworkActivity() {

    private lateinit var recyclerView: RecyclerView
    private lateinit var adapter: GuruAdapter
    private lateinit var editTextSearch: EditText
    private lateinit var btnBack: ImageButton
    private lateinit var btnMenu: ImageButton

    // FIX: nullable agar tidak crash jika ID tidak ada di layout XML
    private var progressBar: ProgressBar? = null

    private var guruList = mutableListOf<Guru>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.rekap_kehadiran_guru)

        initView()            // 1. init semua view dulu
        setupRecyclerView()   // 2. setup adapter
        setupActions()
        setupBottomNavigation()
        setupSearch()
        loadTeachersFromApi() // 3. baru load data (progressBar sudah diinit)
    }

    private fun initView() {
        recyclerView   = findViewById(R.id.recyclerViewGuru)
        editTextSearch = findViewById(R.id.editTextText5)
        btnBack        = findViewById(R.id.btnBack)
        btnMenu        = findViewById(R.id.buttonmenu)
        editTextSearch.hint = "Cari nama guru / NIP / jabatan"
        // Nullable — tidak crash jika progressBar tidak ada di layout
        progressBar = findViewById(R.id.progressBar)
    }

    private fun setupRecyclerView() {
        recyclerView.layoutManager = LinearLayoutManager(this)
        adapter = GuruAdapter(guruList) { guru -> loadAndShowPopupDetailGuru(guru) }
        recyclerView.adapter = adapter
    }

    // ===== LOAD TEACHERS FROM API =====
    private fun loadTeachersFromApi() {
        showLoading(true)
        lifecycleScope.launch {
            try {
                val result = teacherRepository.getTeachers()
                handleResult(
                    result,
                    onSuccess = { teachers ->
                        guruList.clear()
                        guruList.addAll(teachers.mapIndexed { index, t ->
                            Guru(
                                id            = t.id ?: 0,
                                nomor         = (index + 1).toString(),
                                nama          = t.name ?: "-",
                                nip           = t.nip ?: "-",
                                mataPelajaran = t.jabatan ?: "Guru"
                            )
                        })
                        adapter.updateData(guruList)
                        showLoading(false)
                    },
                    onError = { _, msg ->
                        showLoading(false)
                        Toast.makeText(
                            this@RekapKehadiranGuru,
                            "Gagal memuat data: ${msg ?: "Cek koneksi internet"}",
                            Toast.LENGTH_LONG
                        ).show()
                    }
                )
            } catch (e: Exception) {
                showLoading(false)
                Toast.makeText(this@RekapKehadiranGuru, "Error: ${e.message}", Toast.LENGTH_LONG).show()
            }
        }
    }

    // ===== LOAD ATTENDANCE PER GURU =====
    private fun loadAndShowPopupDetailGuru(guru: Guru) {
        lifecycleScope.launch {
            try {
                val result = teacherRepository.getTeacherAttendance(guru.id)
                handleResult(
                    result,
                    onSuccess = { attendances -> showPopupDetailGuru(guru, attendances) },
                    onError = { _, _ -> showPopupDetailGuru(guru, emptyList()) }
                )
            } catch (e: Exception) {
                showPopupDetailGuru(guru, emptyList())
            }
        }
    }

    private fun showPopupDetailGuru(guru: Guru, attendances: List<AttendanceResource>) {
        val inflater  = LayoutInflater.from(this)
        val popupView = inflater.inflate(R.layout.popup_guru_detail, null)

        popupView.findViewById<TextView>(R.id.tvPopupNama).text  = guru.nama
        popupView.findViewById<TextView>(R.id.tvPopupNip).text   = guru.nip
        popupView.findViewById<TextView>(R.id.tvPopupMapel).text = guru.mataPelajaran

        val container = popupView.findViewById<LinearLayout>(R.id.containerKehadiran)
        setupDataKehadiranGuru(container, attendances)

        val popupWindow = PopupWindow(
            popupView,
            LinearLayout.LayoutParams.WRAP_CONTENT,
            LinearLayout.LayoutParams.WRAP_CONTENT,
            true
        )
        popupWindow.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
        popupWindow.elevation    = 20f
        popupWindow.isOutsideTouchable = true
        popupView.findViewById<View>(R.id.popupContainer).alpha = 0.95f

        popupView.findViewById<Button>(R.id.btnTutupPopup).setOnClickListener {
            popupWindow.dismiss()
        }

        val backgroundView = View(this)
        backgroundView.setBackgroundColor(Color.parseColor("#80000000"))
        val rootView = window.decorView.rootView as ViewGroup
        rootView.addView(backgroundView)

        popupWindow.showAtLocation(window.decorView.rootView, android.view.Gravity.CENTER, 0, 0)
        popupWindow.setOnDismissListener { rootView.removeView(backgroundView) }
    }

    private fun setupDataKehadiranGuru(container: LinearLayout, attendances: List<AttendanceResource>) {
        container.removeAllViews()

        if (attendances.isEmpty()) {
            val tvEmpty = TextView(this)
            tvEmpty.text = "Belum ada data kehadiran"
            tvEmpty.setPadding(16, 32, 16, 32)
            container.addView(tvEmpty)
            return
        }

        attendances.forEach { attendance ->
            val itemView = LayoutInflater.from(this)
                .inflate(R.layout.item_kehadiran_popup, container, false)

            val tanggal = attendance.schedule?.date
                ?: attendance.timestamp?.take(10)
                ?: "-"

            val mataPelajaranKelas = buildString {
                append(attendance.schedule?.subjectName ?: "-")
                attendance.schedule?.className?.let { append(" / $it") }
            }

            val jam = attendance.timestamp?.let {
                if (it.length >= 16) it.substring(11, 16) else "-"
            } ?: "-"

            itemView.findViewById<TextView>(R.id.tvTanggal).text     = tanggal
            itemView.findViewById<TextView>(R.id.tvMapelKelas).text  = mataPelajaranKelas
            itemView.findViewById<TextView>(R.id.tvJam).text         = jam
            itemView.findViewById<TextView>(R.id.tvKeterangan).text  = attendance.reason ?: "-"

            val tvStatus = itemView.findViewById<TextView>(R.id.tvStatus)
            tvStatus.text = mapStatusToIndonesian(attendance.status)
            tvStatus.setTextColor(getStatusColor(attendance.status))

            container.addView(itemView)
        }
    }

    private fun mapStatusToIndonesian(status: String?): String = when (status?.lowercase()) {
        "present"         -> "Hadir"
        "late"            -> "Terlambat"
        "absent"          -> "Alpha"
        "excused", "izin" -> "Izin"
        "sick"            -> "Sakit"
        "dinas"           -> "Dinas"
        else              -> status ?: "-"
    }

    private fun getStatusColor(status: String?): Int = when (status?.lowercase()) {
        "present"         -> Color.parseColor("#4CAF50")
        "late", "sick"    -> Color.parseColor("#FF9800")
        "excused", "izin" -> Color.parseColor("#2196F3")
        "absent"          -> Color.parseColor("#F44336")
        "dinas"           -> Color.parseColor("#9C27B0")
        else              -> Color.parseColor("#757575")
    }

    // FIX: semua akses pakai ?. sehingga tidak crash jika progressBar null
    private fun showLoading(show: Boolean) {
        progressBar?.visibility = if (show) View.VISIBLE else View.GONE
    }

    private fun setupActions() {
        btnBack.setOnClickListener { finish() }
        btnMenu.setOnClickListener { showPopupMenu(it) }
    }

    private fun setupSearch() {
        editTextSearch.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                performSearch(s.toString().trim())
            }
            override fun afterTextChanged(s: Editable?) {}
        })

        // Nullable: tidak crash jika tombol tidak ada di layout
        findViewById<ImageButton>(R.id.imageButton17)?.setOnClickListener {
            editTextSearch.text.clear()
            adapter.filter("")
            Toast.makeText(this, "Menampilkan semua data guru", Toast.LENGTH_SHORT).show()
        }
    }

    private fun performSearch(query: String) {
        adapter.filter(query)
        if (query.isNotEmpty() && adapter.itemCount == 0) {
            Toast.makeText(this, "Tidak ditemukan: '$query'", Toast.LENGTH_SHORT).show()
        }
    }

    private fun showPopupMenu(view: View) {
        val popup = PopupMenu(this, view)
        popup.menuInflater.inflate(R.menu.menu_rekap_switch, popup.menu)
        popup.setOnMenuItemClickListener { menuItem ->
            when (menuItem.itemId) {
                R.id.menu_guru -> {
                    Toast.makeText(this, "Sudah di halaman Guru", Toast.LENGTH_SHORT).show()
                    true
                }
                R.id.menu_siswa -> {
                    startActivity(Intent(this, RekapKehadiranSiswa::class.java))
                    finish()
                    true
                }
                else -> false
            }
        }
        popup.show()
    }

    private fun setupBottomNavigation() {
        findViewById<ImageButton>(R.id.imageButton2)?.setOnClickListener {
            startActivity(Intent(this, Dashboard::class.java))
            finish()
        }
        findViewById<ImageButton>(R.id.imageButton3)?.setOnClickListener {
            startActivity(Intent(this, RekapKehadiranSiswa::class.java))
            finish()
        }
        findViewById<ImageButton>(R.id.imageButton5)?.setOnClickListener {
            startActivity(Intent(this, StatistikKehadiran::class.java))
            finish()
        }
    }

    // ===== DATA CLASS =====
    data class Guru(
        val id: Int,
        val nomor: String,
        val nama: String,
        val nip: String,
        val mataPelajaran: String
    )

    // ===== ADAPTER =====
    class GuruAdapter(
        private var guruList: List<Guru>,
        private val onLihatClickListener: (Guru) -> Unit
    ) : RecyclerView.Adapter<GuruAdapter.GuruViewHolder>() {

        private var filteredList: List<Guru> = guruList

        inner class GuruViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
            val tvNo: TextView      = itemView.findViewById(R.id.tvNo)
            val tvNamaGuru: TextView = itemView.findViewById(R.id.tvNamaGuru)
            val tvNIP: TextView     = itemView.findViewById(R.id.tvNIP)
            val tvMapel: TextView   = itemView.findViewById(R.id.tvMapel)
            val btnLihat: ImageButton = itemView.findViewById(R.id.btnLihat)

            init {
                btnLihat.setOnClickListener {
                    val pos = adapterPosition
                    if (pos != RecyclerView.NO_POSITION) onLihatClickListener(filteredList[pos])
                }
            }
        }

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): GuruViewHolder {
            val view = LayoutInflater.from(parent.context)
                .inflate(R.layout.item_rekap_guru, parent, false)
            return GuruViewHolder(view)
        }

        override fun onBindViewHolder(holder: GuruViewHolder, position: Int) {
            val guru = filteredList[position]
            holder.tvNo.text       = guru.nomor
            holder.tvNamaGuru.text = guru.nama
            holder.tvNIP.text      = guru.nip
            holder.tvMapel.text    = guru.mataPelajaran
        }

        override fun getItemCount(): Int = filteredList.size

        fun filter(query: String) {
            filteredList = if (query.isEmpty()) guruList
            else {
                val q = query.lowercase()
                guruList.filter {
                    it.nama.lowercase().contains(q) ||
                            it.nip.contains(query) ||
                            it.mataPelajaran.lowercase().contains(q)
                }
            }
            notifyDataSetChanged()
        }

        fun updateData(newData: List<Guru>) {
            guruList     = newData
            filteredList = newData
            notifyDataSetChanged()
        }
    }
}