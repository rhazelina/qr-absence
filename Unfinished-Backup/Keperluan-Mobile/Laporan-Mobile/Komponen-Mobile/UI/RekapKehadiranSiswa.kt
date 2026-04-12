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
import android.widget.Button
import android.widget.EditText
import android.widget.ImageButton
import android.widget.LinearLayout
import android.widget.PopupMenu
import android.widget.PopupWindow
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.ritamesa.api.models.AttendanceResource
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONObject

class RekapKehadiranSiswa : BaseNetworkActivity() {

    private lateinit var recyclerView: RecyclerView
    private lateinit var rekapAdapter: RekapSiswaAdapter
    private lateinit var editTextSearch: EditText
    private lateinit var btnBack: ImageButton
    private lateinit var btnMenu: ImageButton
    private var progressBar: ProgressBar? = null

    private var siswaList = mutableListOf<SiswaRekap>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.rekap_kehadiran_siswa)

        initView()
        setupRecyclerView()
        setupActions()
        setupBottomNavigation()
        setupSearch()
        loadAllStudents()
    }

    private fun initView() {
        recyclerView   = findViewById(R.id.rvKehadiran)
        editTextSearch = findViewById(R.id.editTextText5)
        btnBack        = findViewById(R.id.btnBack)
        btnMenu        = findViewById(R.id.buttonmenu)
        progressBar    = findViewById(R.id.progressBar)
    }

    private fun setupRecyclerView() {
        recyclerView.layoutManager = LinearLayoutManager(this)
        recyclerView.setHasFixedSize(true)
        rekapAdapter = RekapSiswaAdapter(siswaList) { siswa ->
            loadAndShowPopupDetailSiswa(siswa)
        }
        recyclerView.adapter = rekapAdapter
    }

    // ===== LOAD SEMUA SISWA — gunakan per_page=-1 untuk ambil semua sekaligus =====
    private fun loadAllStudents() {
        showLoading(true)
        lifecycleScope.launch {
            try {
                val baseUrl  = com.example.ritamesa.AppPreferences.API_BASE_URL
                // Ambil token dari AppPreferences
                val prefs    = AppPreferences(this@RekapKehadiranSiswa)
                val token    = prefs.getAuthTokenSync() ?: ""

                val allSiswa = mutableListOf<SiswaRekap>()

                withContext(Dispatchers.IO) {
                    val client  = OkHttpClient()
                    var page    = 1
                    var lastPage = 1

                    do {
                        val url = "${baseUrl}students?page=$page&per_page=100"
                        val request = Request.Builder()
                            .url(url)
                            .addHeader("Authorization", "Bearer $token")
                            .addHeader("Accept", "application/json")
                            .build()

                        val response = client.newCall(request).execute()
                        if (!response.isSuccessful) break

                        val bodyStr = response.body?.string() ?: break
                        val json    = JSONObject(bodyStr)

                        // Parse last_page dari meta
                        val meta = json.optJSONObject("meta")
                        lastPage = meta?.optInt("last_page", 1) ?: 1

                        val dataArray = json.optJSONArray("data") ?: break
                        for (i in 0 until dataArray.length()) {
                            val obj = dataArray.getJSONObject(i)
                            val id        = obj.optInt("id", 0)
                            val nama      = obj.optString("name", "-")
                            val nisn      = obj.optString("nisn").ifEmpty { obj.optString("nis", "-") }
                            val className = obj.optString("class_name", "-")

                            allSiswa.add(
                                SiswaRekap(
                                    id    = id,
                                    nomor = allSiswa.size + 1,
                                    nama  = nama,
                                    nisn  = nisn,
                                    kelas = className
                                )
                            )
                        }
                        page++
                    } while (page <= lastPage)
                }

                siswaList.clear()
                siswaList.addAll(allSiswa)
                rekapAdapter.updateData(siswaList)
                showLoading(false)

                if (allSiswa.isEmpty()) {
                    Toast.makeText(this@RekapKehadiranSiswa, "Tidak ada data siswa", Toast.LENGTH_SHORT).show()
                }

            } catch (e: Exception) {
                showLoading(false)
                Toast.makeText(
                    this@RekapKehadiranSiswa,
                    "Gagal memuat data: ${e.message}",
                    Toast.LENGTH_LONG
                ).show()
            }
        }
    }

    // ===== LOAD ATTENDANCE HISTORY LALU TAMPILKAN POPUP =====
    private fun loadAndShowPopupDetailSiswa(siswa: SiswaRekap) {
        lifecycleScope.launch {
            try {
                val result = studentRepository.getStudentAttendanceHistory(siswa.id)
                handleResult(
                    result,
                    onSuccess = { attendances -> showPopupDetailSiswa(siswa, attendances) },
                    onError   = { _, _        -> showPopupDetailSiswa(siswa, emptyList()) }
                )
            } catch (e: Exception) {
                showPopupDetailSiswa(siswa, emptyList())
            }
        }
    }

    private fun showPopupDetailSiswa(siswa: SiswaRekap, attendances: List<AttendanceResource>) {
        val popupView = LayoutInflater.from(this).inflate(R.layout.popup_siswa_detail, null)

        popupView.findViewById<TextView>(R.id.tvPopupNama).text  = siswa.nama
        popupView.findViewById<TextView>(R.id.tvPopupNisn).text  = siswa.nisn
        popupView.findViewById<TextView>(R.id.tvPopupKelas).text = siswa.kelas

        val container = popupView.findViewById<LinearLayout>(R.id.containerKehadiran)
        setupDataKehadiranSiswa(container, attendances)

        val popupWindow = PopupWindow(
            popupView,
            LinearLayout.LayoutParams.WRAP_CONTENT,
            LinearLayout.LayoutParams.WRAP_CONTENT,
            true
        )
        popupWindow.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
        popupWindow.elevation      = 20f
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

    private fun setupDataKehadiranSiswa(
        container: LinearLayout,
        attendances: List<AttendanceResource>
    ) {
        container.removeAllViews()

        if (attendances.isEmpty()) {
            val tvEmpty = TextView(this)
            tvEmpty.text = "Belum ada data kehadiran"
            tvEmpty.setPadding(16, 32, 16, 32)
            container.addView(tvEmpty)
            return
        }

        for (attendance in attendances) {
            val itemView = LayoutInflater.from(this)
                .inflate(R.layout.item_kehadiran_popup, container, false)

            val tanggal = attendance.schedule?.date
                ?: attendance.timestamp?.take(10)
                ?: "-"

            val mapelKelas = buildString {
                append(attendance.schedule?.subjectName ?: "-")
                val kls = attendance.schedule?.className
                if (!kls.isNullOrEmpty()) append(" / $kls")
            }

            val jam = attendance.timestamp?.let { ts ->
                if (ts.length >= 16) ts.substring(11, 16) else "-"
            } ?: "-"

            itemView.findViewById<TextView>(R.id.tvTanggal).text    = tanggal
            itemView.findViewById<TextView>(R.id.tvMapelKelas).text = mapelKelas
            itemView.findViewById<TextView>(R.id.tvJam).text        = jam
            itemView.findViewById<TextView>(R.id.tvKeterangan).text = attendance.reason ?: "-"

            val tvStatus = itemView.findViewById<TextView>(R.id.tvStatus)
            tvStatus.text = mapStatusToIndonesian(attendance.status)
            tvStatus.setTextColor(getStatusColor(attendance.status))

            container.addView(itemView)
        }
    }

    private fun mapStatusToIndonesian(status: String?): String {
        return when (status?.lowercase()) {
            "present"          -> "Hadir"
            "late"             -> "Terlambat"
            "absent"           -> "Alpha"
            "excused", "izin"  -> "Izin"
            "sick"             -> "Sakit"
            else               -> status ?: "-"
        }
    }

    private fun getStatusColor(status: String?): Int {
        return when (status?.lowercase()) {
            "present"          -> Color.parseColor("#4CAF50")
            "late", "sick"     -> Color.parseColor("#FF9800")
            "excused", "izin"  -> Color.parseColor("#2196F3")
            "absent"           -> Color.parseColor("#F44336")
            else               -> Color.parseColor("#757575")
        }
    }

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
                filterData(s.toString().trim())
            }
            override fun afterTextChanged(s: Editable?) {}
        })

        findViewById<ImageButton>(R.id.imageButton17)?.setOnClickListener {
            editTextSearch.text.clear()
            rekapAdapter.filter("")
            Toast.makeText(this, "Menampilkan semua data siswa", Toast.LENGTH_SHORT).show()
        }
    }

    private fun filterData(query: String) {
        rekapAdapter.filter(query)
        if (query.isNotEmpty() && rekapAdapter.itemCount == 0) {
            Toast.makeText(this, "Tidak ditemukan: '$query'", Toast.LENGTH_SHORT).show()
        }
    }

    private fun showPopupMenu(view: View) {
        val popup = PopupMenu(this, view)
        popup.menuInflater.inflate(R.menu.menu_rekap_switch, popup.menu)
        popup.setOnMenuItemClickListener { menuItem ->
            when (menuItem.itemId) {
                R.id.menu_guru -> {
                    startActivity(Intent(this, RekapKehadiranGuru::class.java))
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
        findViewById<ImageButton>(R.id.imageButton2)?.setOnClickListener {
            startActivity(Intent(this, Dashboard::class.java))
            finish()
        }
        findViewById<ImageButton>(R.id.imageButton3)?.setOnClickListener {
            Toast.makeText(this, "Sudah di halaman Data Rekap", Toast.LENGTH_SHORT).show()
        }
        findViewById<ImageButton>(R.id.imageButton5)?.setOnClickListener {
            try {
                startActivity(Intent(this, StatistikKehadiran::class.java))
                finish()
            } catch (e: Exception) {
                Toast.makeText(this, "Halaman belum tersedia", Toast.LENGTH_SHORT).show()
            }
        }
    }

    // ===== DATA CLASS =====
    data class SiswaRekap(
        val id: Int,
        val nomor: Int,
        val nama: String,
        val nisn: String,
        val kelas: String
    )

    // ===== ADAPTER =====
    class RekapSiswaAdapter(
        private var dataList: List<SiswaRekap>,
        private val onLihatClickListener: (SiswaRekap) -> Unit
    ) : RecyclerView.Adapter<RekapSiswaAdapter.SiswaViewHolder>() {

        private var filteredList: List<SiswaRekap> = dataList

        inner class SiswaViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
            val tvNomor: TextView        = itemView.findViewById(R.id.tvNomor)
            val tvNama: TextView         = itemView.findViewById(R.id.tvNama)
            val tvNisn: TextView         = itemView.findViewById(R.id.tvTelepon)
            val tvKelasJurusan: TextView = itemView.findViewById(R.id.tvMataPelajaran)
            val btnLihat: ImageButton    = itemView.findViewById(R.id.btnLihat)

            init {
                btnLihat.setOnClickListener {
                    val pos = adapterPosition
                    if (pos != RecyclerView.NO_POSITION) onLihatClickListener(filteredList[pos])
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
            holder.tvNomor.text        = siswa.nomor.toString()
            holder.tvNama.text         = siswa.nama
            holder.tvNisn.text         = siswa.nisn
            holder.tvKelasJurusan.text = siswa.kelas
        }

        override fun getItemCount(): Int = filteredList.size

        fun filter(query: String) {
            filteredList = if (query.isEmpty()) {
                dataList
            } else {
                val q = query.lowercase()
                dataList.filter {
                    it.nama.lowercase().contains(q) ||
                            it.nisn.contains(query) ||
                            it.kelas.lowercase().contains(q)
                }
            }
            notifyDataSetChanged()
        }

        fun updateData(newData: List<SiswaRekap>) {
            dataList     = newData
            filteredList = newData
            notifyDataSetChanged()
        }
    }
}