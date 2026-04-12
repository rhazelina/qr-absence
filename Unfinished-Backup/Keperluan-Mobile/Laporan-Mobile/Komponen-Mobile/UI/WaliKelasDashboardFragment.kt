package com.example.ritamesa

import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageButton
import android.widget.PopupMenu
import android.widget.TextView
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone
import com.google.gson.Gson


class WaliKelasDashboardFragment : Fragment() {

    companion object {
        private const val TAG = "WaliKelasDashboardFrag"
        private const val HARDCODED_TOTAL_STUDENTS = 34
        fun newInstance() = WaliKelasDashboardFragment()
    }

    private var txtTanggalSekarang: TextView? = null
    private var txtWaktuLive: TextView? = null
    private var txtJamMasuk: TextView? = null
    private var txtJamPulang: TextView? = null
    private var txtTanggalDiJamLayout: TextView? = null
    private var txtNominalSiswa: TextView? = null
    private var btnJumlahSiswa: ImageButton? = null
    private var txtHadirCount: TextView? = null
    private var txtIzinCount: TextView? = null
    private var txtSakitCount: TextView? = null
    private var txtAlphaCount: TextView? = null
    private var recyclerJadwal: RecyclerView? = null

    private val handler = Handler(Looper.getMainLooper())
    private var clockRunnable: Runnable? = null

    private var totalSiswa = 0
    private var hadirCount = 0
    private var izinCount  = 0
    private var sakitCount = 0
    private var alphaCount = 0

    private var navigationCallback: ((String) -> Unit)? = null

    // ── Lifecycle ─────────────────────────────────────────────────────────

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? = try {
        inflater.inflate(R.layout.dashboard_wali_kelas, container, false)
    } catch (e: Exception) {
        Log.e(TAG, "inflate error: ${e.message}", e); null
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        initViews(view)
        setupDateTime()
        setupRecyclerViews()
        setupFooterNavigation()
        setupKehadiranButtons()
        setupTotalSiswaPopup()

        try {
            view.findViewById<ImageButton>(R.id.profile)?.setOnClickListener { showProfileMenu(it) }
        } catch (e: Exception) {
            Log.e(TAG, "Profile button error: ${e.message}", e)
        }

        loadDashboardFromApi()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        clockRunnable?.let { handler.removeCallbacks(it) }
        clockRunnable         = null
        txtTanggalSekarang    = null
        txtWaktuLive          = null
        txtJamMasuk           = null
        txtJamPulang          = null
        txtTanggalDiJamLayout = null
        txtNominalSiswa       = null
        btnJumlahSiswa        = null
        txtHadirCount         = null
        txtIzinCount          = null
        txtSakitCount         = null
        txtAlphaCount         = null
        recyclerJadwal        = null
    }

    // ── Init ──────────────────────────────────────────────────────────────

    private fun initViews(view: View) {
        try {
            txtTanggalSekarang    = view.findViewById(R.id.txtTanggalSekarang)
            txtWaktuLive          = view.findViewById(R.id.txtWaktuLive)
            txtJamMasuk           = view.findViewById(R.id.txtJamMasuk)
            txtJamPulang          = view.findViewById(R.id.txtJamPulang)
            txtTanggalDiJamLayout = view.findViewById(R.id.txtTanggalDiJamLayout)
            txtNominalSiswa       = view.findViewById(R.id.nominal_siswa)
            btnJumlahSiswa        = view.findViewById(R.id.jumlah_siswa_wakel)
            txtHadirCount         = view.findViewById(R.id.txt_hadir_count)
            txtIzinCount          = view.findViewById(R.id.txt_izin_count)
            txtSakitCount         = view.findViewById(R.id.txt_sakit_count)
            txtAlphaCount         = view.findViewById(R.id.txt_alpha_count)
            recyclerJadwal        = view.findViewById(R.id.recyclerJadwal)
        } catch (e: Exception) {
            Log.e(TAG, "initViews error: ${e.message}", e)
        }
    }

    private fun setupRecyclerViews() {
        recyclerJadwal?.apply  { layoutManager = LinearLayoutManager(requireContext()); setHasFixedSize(true) }
    }

    // ── API ───────────────────────────────────────────────────────────────

    private fun loadDashboardFromApi() {
        val baseActivity = activity as? BaseNetworkActivity ?: run {
            Log.w(TAG, "activity bukan BaseNetworkActivity, skip"); return
        }
        loadProfileData(baseActivity)
        loadKehadiranSummary(baseActivity)
        loadJadwalMengajar(baseActivity)
    }

    private val combinedSchedules = mutableListOf<DashboardGuruActivity.JadwalItem>()

    private fun loadJadwalMengajar(baseActivity: BaseNetworkActivity) {
        lifecycleScope.launch {
            try {
                // Wali kelas juga seorang guru, jadi kita muat jadwal mengajarnya sendiri
                val result = baseActivity.dashboardRepository.getTeacherDashboard()
                if (!isAdded) return@launch

                if (result is com.example.ritamesa.api.Result.Success) {
                    val schedules = result.data.todaySchedules
                    if (!schedules.isNullOrEmpty()) {
                        val teachingList = schedules.mapIndexed { index, s ->
                            DashboardGuruActivity.JadwalItem(
                                id             = s.id ?: 0,
                                mataPelajaran  = s.resolvedSubjectName() ?: "Mata Pelajaran Tidak Ada",
                                waktuPelajaran = s.timeSlot ?: "Jam Ke-${index + 1}",
                                kelas          = s.className ?: s.`class` ?: "-",
                                jam            = formatJam(s.startTime, s.endTime),
                                idKelas        = (s.classId ?: 0).toString(),
                                idMapel        = (s.id ?: 0).toString(),
                                studentCount   = s.studentCount ?: 0
                            )
                        }
                        updateCombinedJadwal(teachingList, isTeacherSource = true)
                    }
                }
                // Selalu coba muat jadwal wakel (pasti ada jika dia wakel)
                loadJadwalWakel(baseActivity)
            } catch (e: Exception) {
                Log.e(TAG, "loadJadwalMengajar error: ${e.message}")
                loadJadwalWakel(baseActivity)
            }
        }
    }

    private fun loadJadwalWakel(baseActivity: BaseNetworkActivity) {
        lifecycleScope.launch {
            try {
                val result = baseActivity.teacherRepository.getMyHomeroomSchedules()
                if (!isAdded) return@launch
                when (result) {
                    is com.example.ritamesa.api.Result.Success -> {
                        Log.d("DashboardResponse", "Wakel Schedules: ${Gson().toJson(result.data)}")
                        val jadwalList = result.data.mapIndexed { index, s ->
                            DashboardGuruActivity.JadwalItem(
                                id             = s.id ?: 0,
                                mataPelajaran  = s.subjectName ?: "Mata Pelajaran Tidak Ada",
                                waktuPelajaran = s.timeSlot?.session?.let { "Jam Ke-$it" } ?: "Jam Ke-${index + 1}",
                                kelas          = s.className ?: s.`class` ?: "-",
                                jam            = formatJam(s.startTime, s.endTime),
                                idKelas        = (s.classId ?: 0).toString(),
                                idMapel        = (s.id ?: 0).toString(),
                                studentCount   = s.studentCount ?: 0
                            )
                        }
                        updateCombinedJadwal(jadwalList, isTeacherSource = false)
                    }
                    is com.example.ritamesa.api.Result.Error -> {
                        Log.e(TAG, "Gagal load jadwal wakel: ${result.message}")
                    }
                    else -> { }
                }
            } catch (e: Exception) {
                Log.e(TAG, "loadJadwalWakel exception: ${e.message}", e)
            }
        }
    }

    private fun loadProfileData(baseActivity: BaseNetworkActivity) {
        lifecycleScope.launch {
            try {
                val result = baseActivity.authRepository.getMe()
                if (!isAdded) return@launch
                when (result) {
                    is com.example.ritamesa.api.Result.Success -> {
                        val profile = result.data
                        val v = view
                        try {
                            val ctx = requireContext()

                            // Safe dynamic ID lookup for profile name (tvNamaWakel or tv_nama_wakel)
                            val tvNamaId1 = resources.getIdentifier("tvNamaWakel", "id", ctx.packageName)
                            val tvNamaId2 = resources.getIdentifier("tv_nama_wakel", "id", ctx.packageName)
                            val tvNamaId = if (tvNamaId1 != 0) tvNamaId1 else tvNamaId2

                            if (tvNamaId != 0) {
                                v?.findViewById<TextView>(tvNamaId)?.text = profile.name ?: "Nama Tidak Tersedia"
                            }

                            // Safe dynamic ID lookup for class name (tvNamaKelas or tv_nama_kelas)
                            val tvKelasId1 = resources.getIdentifier("tvNamaKelas", "id", ctx.packageName)
                            val tvKelasId2 = resources.getIdentifier("tv_nama_kelas", "id", ctx.packageName)
                            val tvKelasId = if (tvKelasId1 != 0) tvKelasId1 else tvKelasId2

                            if (tvKelasId != 0) {
                                val className = profile.teacherProfile?.homeroomClassId?.let { "Kelas $it" }
                                v?.findViewById<TextView>(tvKelasId)?.text = className ?: "Kelas Belum Diatur"
                            }
                        } catch (e: Exception) {
                            Log.e(TAG, "Gagal update profile UI: ${e.message}")
                        }
                    }
                    is com.example.ritamesa.api.Result.Error -> {
                        Log.w(TAG, "Gagal load profile: ${result.message}")
                    }
                    else -> {}
                }
            } catch (e: Exception) {
                Log.e(TAG, "Exception loadProfileData: ${e.message}", e)
            }
        }
    }

    private fun loadKehadiranSummary(baseActivity: BaseNetworkActivity) {
        lifecycleScope.launch {
            try {
                val result = baseActivity.dashboardRepository.getHomeroomDashboard()
                if (!isAdded) return@launch
                when (result) {
                    is com.example.ritamesa.api.Result.Success -> {
                        Log.d("DashboardResponse", "Wakel Summary: ${Gson().toJson(result.data)}")
                        val s  = result.data.todaySummary
                        totalSiswa = HARDCODED_TOTAL_STUDENTS
                        hadirCount = s?.present       ?: 0
                        izinCount  = s?.excused       ?: 0
                        sakitCount = s?.sick          ?: 0
                        alphaCount = s?.absent        ?: 0
                        updateKehadiranDisplay()
                    }
                    is com.example.ritamesa.api.Result.Error -> {
                        Log.w(TAG, "Homeroom dashboard gagal: ${result.message}")
                        if (isAdded) updateKehadiranDisplay()
                    }
                    else -> { }
                }
            } catch (e: Exception) {
                Log.e(TAG, "loadKehadiranSummary exception: ${e.message}", e)
                if (isAdded) updateKehadiranDisplay()
            }
        }
    }

    @Synchronized
    private fun updateCombinedJadwal(newList: List<DashboardGuruActivity.JadwalItem>, isTeacherSource: Boolean) {
        if (!isAdded) return

        // Sederhana: jika list kosong dari salah satu sumber, jangan hapus yang sudah ada
        if (newList.isEmpty()) return

        // Gunakan set untuk menghindari duplikasi berdasarkan ID
        val currentIds = combinedSchedules.map { it.id }.toSet()
        val filteredNewList = newList.filter { it.id !in currentIds }

        combinedSchedules.addAll(filteredNewList)

        // Urutkan berdasarkan waktu (start time / jam jika memungkinkan, atau id)
        combinedSchedules.sortBy { it.jam }

        handler.post {
            if (isAdded) {
                recyclerJadwal?.adapter = JadwalAdapter(combinedSchedules.toList()) { navigateToDetailJadwalWakel(it) }
            }
        }
    }

    // ── UI Helpers ────────────────────────────────────────────────────────

    private fun updateKehadiranDisplay() {
        if (!isAdded) return
        txtNominalSiswa?.text = HARDCODED_TOTAL_STUDENTS.toString()
        txtHadirCount?.text   = hadirCount.toString()
        txtIzinCount?.text    = izinCount.toString()
        txtSakitCount?.text   = sakitCount.toString()
        txtAlphaCount?.text   = alphaCount.toString()
    }

    private fun setupTotalSiswaPopup() {
        val clickListener = View.OnClickListener {
            if (!isAdded) return@OnClickListener
            android.app.AlertDialog.Builder(requireContext())
                .setTitle("Total Siswa")
                .setMessage("Total Siswa : $HARDCODED_TOTAL_STUDENTS")
                .setPositiveButton("OK", null)
                .show()
        }
        btnJumlahSiswa?.setOnClickListener(clickListener)
        txtNominalSiswa?.setOnClickListener(clickListener)
    }

    private fun formatJam(start: String?, end: String?) = when {
        !start.isNullOrEmpty() && !end.isNullOrEmpty() -> "${start.take(5)} - ${end.take(5)}"
        !start.isNullOrEmpty() -> start.take(5)
        else -> "-"
    }

    private fun navigateToDetailJadwalWakel(jadwal: DashboardGuruActivity.JadwalItem) {
        try {
            requireContext().startActivity(
                Intent(requireContext(), DetailJadwalWakelActivity::class.java).apply {
                    putExtra("JADWAL_DATA", DashboardGuruActivity.JadwalData(
                        id             = jadwal.id,
                        idKelas        = jadwal.idKelas.toIntOrNull() ?: 0,
                        mataPelajaran  = jadwal.mataPelajaran,
                        kelas          = jadwal.kelas,
                        jam            = jadwal.jam,
                        waktuPelajaran = jadwal.waktuPelajaran
                    ))
                }
            )
        } catch (e: Exception) {
            if (isAdded) Toast.makeText(requireContext(), "Error membuka detail jadwal", Toast.LENGTH_SHORT).show()
        }
    }

    // ── DateTime ──────────────────────────────────────────────────────────

    private fun setupDateTime() {
        try {
            val localeId = Locale.forLanguageTag("id-ID")
            val tanggal  = SimpleDateFormat("EEEE, d MMMM yyyy", localeId).format(Date())
                .replaceFirstChar { if (it.isLowerCase()) it.titlecase(localeId) else it.toString() }
            txtTanggalSekarang?.text    = tanggal
            txtTanggalDiJamLayout?.text = tanggal
            txtJamMasuk?.text           = "07:00"
            txtJamPulang?.text          = "15:00"

            clockRunnable = object : Runnable {
                override fun run() {
                    if (!isAdded || txtWaktuLive == null) return
                    val tf = SimpleDateFormat("HH:mm", Locale.getDefault()).apply {
                        timeZone = TimeZone.getTimeZone("Asia/Jakarta")
                    }
                    txtWaktuLive?.text = tf.format(Date())
                    handler.postDelayed(this, 60_000L)
                }
            }
            handler.post(clockRunnable!!)
        } catch (e: Exception) {
            Log.e(TAG, "setupDateTime error: ${e.message}", e)
        }
    }

    // ── Footer Navigation ─────────────────────────────────────────────────

    private fun setupFooterNavigation() {
        try {
            val v = view
            v?.findViewById<ImageButton>(R.id.btnHome)?.setOnClickListener {
                val base = activity as? BaseNetworkActivity ?: return@setOnClickListener
                loadProfileData(base)
                loadKehadiranSummary(base)
                loadJadwalWakel(base)
                Toast.makeText(requireContext(), "Dashboard diperbarui", Toast.LENGTH_SHORT).show()
            }
            v?.findViewById<ImageButton>(R.id.btnCalendar)?.setOnClickListener { navigationCallback?.invoke("riwayat") }
            v?.findViewById<ImageButton>(R.id.btnChart)?.setOnClickListener { navigationCallback?.invoke("tindak_lanjut") }
        } catch (e: Exception) {
            Log.e(TAG, "setupFooterNavigation error: ${e.message}", e)
        }
    }

    // ── Kehadiran Buttons ─────────────────────────────────────────────────

    private fun setupKehadiranButtons() {
        try {
            val v = view
            v?.findViewById<ImageButton>(R.id.jumlah_siswa_wakel)?.setOnClickListener {
                showToastKehadiran("Total siswa", totalSiswa)
            }
            v?.findViewById<ImageButton>(R.id.button_hadir)?.setOnClickListener {
                showToastKehadiran("Hadir", hadirCount)
            }
            v?.findViewById<ImageButton>(R.id.button_sakit)?.setOnClickListener {
                startActivity(Intent(requireContext(), PersetujuanIzinWakelActivity::class.java))
            }
            v?.findViewById<ImageButton>(R.id.button_izin)?.setOnClickListener {
                startActivity(Intent(requireContext(), PersetujuanIzinWakelActivity::class.java))
            }
            v?.findViewById<ImageButton>(R.id.button_alpha)?.setOnClickListener {
                showToastKehadiran("Alpha", alphaCount)
            }
        } catch (e: Exception) {
            Log.e(TAG, "setupKehadiranButtons error: ${e.message}", e)
        }
    }

    private fun showToastKehadiran(label: String, count: Int) {
        if (!isAdded) return
        Toast.makeText(requireContext(), "Siswa $label: $count orang", Toast.LENGTH_SHORT).show()
    }

    // ── Profile & Logout ──────────────────────────────────────────────────

    private fun showProfileMenu(view: View) {
        try {
            val popup = PopupMenu(requireContext(), view)
            popup.menuInflater.inflate(R.menu.profile_simple, popup.menu)
            popup.setOnMenuItemClickListener {
                when (it.itemId) {
                    R.id.menu_logout -> { showLogoutConfirmation(); true }
                    R.id.menu_cancel -> true
                    else -> false
                }
            }
            popup.show()
        } catch (e: Exception) {
            Log.e(TAG, "showProfileMenu error: ${e.message}", e)
        }
    }

    private fun showLogoutConfirmation() {
        if (!isAdded) return
        android.app.AlertDialog.Builder(requireContext())
            .setTitle("Logout Wali Kelas")
            .setMessage("Yakin ingin logout dari akun wali kelas?")
            .setPositiveButton("Ya, Logout") { _, _ -> performLogout() }
            .setNegativeButton("Batal", null)
            .show()
    }

    private fun performLogout() {
        val baseActivity = activity as? BaseNetworkActivity ?: return
        lifecycleScope.launch {
            try { baseActivity.authRepository.logout() } catch (e: Exception) {
                Log.w(TAG, "Logout API gagal: ${e.message}")
            }
            try { AppPreferences(requireContext()).clearAuth() } catch (ignored: Exception) { }
            if (isAdded) {
                requireActivity().startActivity(
                    Intent(requireContext(), LoginAwal::class.java).apply {
                        flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                    }
                )
                requireActivity().finish()
            }
        }
    }

    fun setNavigationCallback(callback: (String) -> Unit) { navigationCallback = callback }
}


//package com.example.ritamesa
//
//import android.content.Intent
//import android.os.Bundle
//import android.os.Handler
//import android.os.Looper
//import android.util.Log
//import android.view.LayoutInflater
//import android.view.View
//import android.view.ViewGroup
//import android.widget.ImageButton
//import android.widget.PopupMenu
//import android.widget.TextView
//import android.widget.Toast
//import androidx.fragment.app.Fragment
//import androidx.lifecycle.lifecycleScope
//import androidx.recyclerview.widget.LinearLayoutManager
//import androidx.recyclerview.widget.RecyclerView
//import kotlinx.coroutines.launch
//import java.text.SimpleDateFormat
//import java.util.Date
//import java.util.Locale
//import java.util.TimeZone
//import com.google.gson.Gson
//
//
//class WaliKelasDashboardFragment : Fragment() {
//
//    companion object {
//        private const val TAG = "WaliKelasDashboardFrag"
//        private const val HARDCODED_TOTAL_STUDENTS = 34
//        fun newInstance() = WaliKelasDashboardFragment()
//    }
//
//    private var txtTanggalSekarang: TextView? = null
//    private var txtWaktuLive: TextView? = null
//    private var txtJamMasuk: TextView? = null
//    private var txtJamPulang: TextView? = null
//    private var txtTanggalDiJamLayout: TextView? = null
//    private var txtNominalSiswa: TextView? = null
//    private var btnJumlahSiswa: ImageButton? = null
//    private var txtHadirCount: TextView? = null
//    private var txtIzinCount: TextView? = null
//    private var txtSakitCount: TextView? = null
//    private var txtAlphaCount: TextView? = null
//    private var recyclerJadwal: RecyclerView? = null
//    private var recyclerRiwayat: RecyclerView? = null
//
//    private val handler = Handler(Looper.getMainLooper())
//    private var clockRunnable: Runnable? = null
//
//    private var totalSiswa = 0
//    private var hadirCount = 0
//    private var izinCount  = 0
//    private var sakitCount = 0
//    private var alphaCount = 0
//
//    private var navigationCallback: ((String) -> Unit)? = null
//
//    // ── Lifecycle ─────────────────────────────────────────────────────────
//
//    override fun onCreateView(
//        inflater: LayoutInflater, container: ViewGroup?,
//        savedInstanceState: Bundle?
//    ): View? = try {
//        inflater.inflate(R.layout.dashboard_wali_kelas, container, false)
//    } catch (e: Exception) {
//        Log.e(TAG, "inflate error: ${e.message}", e); null
//    }
//
//    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
//        super.onViewCreated(view, savedInstanceState)
//        initViews(view)
//        setupDateTime()
//        setupRecyclerViews()
//        setupFooterNavigation()
//        setupKehadiranButtons()
//        setupTotalSiswaPopup()
//
//        try {
//            view.findViewById<ImageButton>(R.id.profile)?.setOnClickListener { showProfileMenu(it) }
//        } catch (e: Exception) {
//            Log.e(TAG, "Profile button error: ${e.message}", e)
//        }
//
//        loadDashboardFromApi()
//    }
//
//    override fun onDestroyView() {
//        super.onDestroyView()
//        clockRunnable?.let { handler.removeCallbacks(it) }
//        clockRunnable         = null
//        txtTanggalSekarang    = null
//        txtWaktuLive          = null
//        txtJamMasuk           = null
//        txtJamPulang          = null
//        txtTanggalDiJamLayout = null
//        txtNominalSiswa       = null
//        btnJumlahSiswa        = null
//        txtHadirCount         = null
//        txtIzinCount          = null
//        txtSakitCount         = null
//        txtAlphaCount         = null
//        recyclerJadwal        = null
//        recyclerRiwayat       = null
//    }
//
//    // ── Init ──────────────────────────────────────────────────────────────
//
//    private fun initViews(view: View) {
//        try {
//            txtTanggalSekarang    = view.findViewById(R.id.txtTanggalSekarang)
//            txtWaktuLive          = view.findViewById(R.id.txtWaktuLive)
//            txtJamMasuk           = view.findViewById(R.id.txtJamMasuk)
//            txtJamPulang          = view.findViewById(R.id.txtJamPulang)
//            txtTanggalDiJamLayout = view.findViewById(R.id.txtTanggalDiJamLayout)
//            txtNominalSiswa       = view.findViewById(R.id.nominal_siswa)
//            btnJumlahSiswa        = view.findViewById(R.id.jumlah_siswa_wakel)
//            txtHadirCount         = view.findViewById(R.id.txt_hadir_count)
//            txtIzinCount          = view.findViewById(R.id.txt_izin_count)
//            txtSakitCount         = view.findViewById(R.id.txt_sakit_count)
//            txtAlphaCount         = view.findViewById(R.id.txt_alpha_count)
//            recyclerJadwal        = view.findViewById(R.id.recyclerJadwal)
//            recyclerRiwayat       = view.findViewById(R.id.recyclerJadwal1)
//        } catch (e: Exception) {
//            Log.e(TAG, "initViews error: ${e.message}", e)
//        }
//    }
//
//    private fun setupRecyclerViews() {
//        recyclerJadwal?.apply  { layoutManager = LinearLayoutManager(requireContext()); setHasFixedSize(true) }
//        recyclerRiwayat?.apply { layoutManager = LinearLayoutManager(requireContext()); setHasFixedSize(true) }
//    }
//
//    // ── API ───────────────────────────────────────────────────────────────
//
//    private fun loadDashboardFromApi() {
//        val baseActivity = activity as? BaseNetworkActivity ?: run {
//            Log.w(TAG, "activity bukan BaseNetworkActivity, skip"); return
//        }
//        loadProfileData(baseActivity)
//        loadKehadiranSummary(baseActivity)
//        loadJadwalMengajar(baseActivity)
//        loadRiwayatAbsensi(baseActivity)
//    }
//
//    private val combinedSchedules = mutableListOf<DashboardGuruActivity.JadwalItem>()
//
//    private fun loadJadwalMengajar(baseActivity: BaseNetworkActivity) {
//        lifecycleScope.launch {
//            try {
//                // Wali kelas juga seorang guru, jadi kita muat jadwal mengajarnya sendiri
//                val result = baseActivity.dashboardRepository.getTeacherDashboard()
//                if (!isAdded) return@launch
//
//                if (result is com.example.ritamesa.api.Result.Success) {
//                    val schedules = result.data.todaySchedules
//                    if (!schedules.isNullOrEmpty()) {
//                        val teachingList = schedules.mapIndexed { index, s ->
//                            DashboardGuruActivity.JadwalItem(
//                                id             = s.id ?: 0,
//                                mataPelajaran  = s.resolvedSubjectName() ?: "Mata Pelajaran Tidak Ada",
//                                waktuPelajaran = s.timeSlot ?: "Jam Ke-${index + 1}",
//                                kelas          = s.className ?: s.`class` ?: "-",
//                                jam            = formatJam(s.startTime, s.endTime),
//                                idKelas        = (s.classId ?: 0).toString(),
//                                idMapel        = (s.id ?: 0).toString(),
//                                studentCount   = s.studentCount ?: 0
//                            )
//                        }
//                        updateCombinedJadwal(teachingList, isTeacherSource = true)
//                    }
//                }
//                // Selalu coba muat jadwal wakel (pasti ada jika dia wakel)
//                loadJadwalWakel(baseActivity)
//            } catch (e: Exception) {
//                Log.e(TAG, "loadJadwalMengajar error: ${e.message}")
//                loadJadwalWakel(baseActivity)
//            }
//        }
//    }
//
//    private fun loadJadwalWakel(baseActivity: BaseNetworkActivity) {
//        lifecycleScope.launch {
//            try {
//                val result = baseActivity.teacherRepository.getMyHomeroomSchedules()
//                if (!isAdded) return@launch
//                when (result) {
//                    is com.example.ritamesa.api.Result.Success -> {
//                        Log.d("DashboardResponse", "Wakel Schedules: ${Gson().toJson(result.data)}")
//                        val jadwalList = result.data.mapIndexed { index, s ->
//                            DashboardGuruActivity.JadwalItem(
//                                id             = s.id ?: 0,
//                                mataPelajaran  = s.subjectName ?: "Mata Pelajaran Tidak Ada",
//                                waktuPelajaran = s.timeSlot?.session?.let { "Jam Ke-$it" } ?: "Jam Ke-${index + 1}",
//                                kelas          = s.className ?: s.`class` ?: "-",
//                                jam            = formatJam(s.startTime, s.endTime),
//                                idKelas        = (s.classId ?: 0).toString(),
//                                idMapel        = (s.id ?: 0).toString(),
//                                studentCount   = s.studentCount ?: 0
//                            )
//                        }
//                        updateCombinedJadwal(jadwalList, isTeacherSource = false)
//                    }
//                    is com.example.ritamesa.api.Result.Error -> {
//                        Log.e(TAG, "Gagal load jadwal wakel: ${result.message}")
//                    }
//                    else -> { }
//                }
//            } catch (e: Exception) {
//                Log.e(TAG, "loadJadwalWakel exception: ${e.message}", e)
//            }
//        }
//    }
//
//    private fun loadProfileData(baseActivity: BaseNetworkActivity) {
//        lifecycleScope.launch {
//            try {
//                val result = baseActivity.authRepository.getMe()
//                if (!isAdded) return@launch
//                when (result) {
//                    is com.example.ritamesa.api.Result.Success -> {
//                        val profile = result.data
//                        val v = view
//                        try {
//                            val ctx = requireContext()
//
//                            // Safe dynamic ID lookup for profile name (tvNamaWakel or tv_nama_wakel)
//                            val tvNamaId1 = resources.getIdentifier("tvNamaWakel", "id", ctx.packageName)
//                            val tvNamaId2 = resources.getIdentifier("tv_nama_wakel", "id", ctx.packageName)
//                            val tvNamaId = if (tvNamaId1 != 0) tvNamaId1 else tvNamaId2
//
//                            if (tvNamaId != 0) {
//                                v?.findViewById<TextView>(tvNamaId)?.text = profile.name ?: "Nama Tidak Tersedia"
//                            }
//
//                            // Safe dynamic ID lookup for class name (tvNamaKelas or tv_nama_kelas)
//                            val tvKelasId1 = resources.getIdentifier("tvNamaKelas", "id", ctx.packageName)
//                            val tvKelasId2 = resources.getIdentifier("tv_nama_kelas", "id", ctx.packageName)
//                            val tvKelasId = if (tvKelasId1 != 0) tvKelasId1 else tvKelasId2
//
//                            if (tvKelasId != 0) {
//                                val className = profile.teacherProfile?.homeroomClassId?.let { "Kelas $it" }
//                                v?.findViewById<TextView>(tvKelasId)?.text = className ?: "Kelas Belum Diatur"
//                            }
//                        } catch (e: Exception) {
//                            Log.e(TAG, "Gagal update profile UI: ${e.message}")
//                        }
//                    }
//                    is com.example.ritamesa.api.Result.Error -> {
//                        Log.w(TAG, "Gagal load profile: ${result.message}")
//                    }
//                    else -> {}
//                }
//            } catch (e: Exception) {
//                Log.e(TAG, "Exception loadProfileData: ${e.message}", e)
//            }
//        }
//    }
//
//    private fun loadKehadiranSummary(baseActivity: BaseNetworkActivity) {
//        lifecycleScope.launch {
//            try {
//                val result = baseActivity.dashboardRepository.getHomeroomDashboard()
//                if (!isAdded) return@launch
//                when (result) {
//                    is com.example.ritamesa.api.Result.Success -> {
//                        Log.d("DashboardResponse", "Wakel Summary: ${Gson().toJson(result.data)}")
//                        val s  = result.data.todaySummary
//                        totalSiswa = HARDCODED_TOTAL_STUDENTS
//                        hadirCount = s?.present       ?: 0
//                        izinCount  = s?.excused       ?: 0
//                        sakitCount = s?.sick          ?: 0
//                        alphaCount = s?.absent        ?: 0
//                        updateKehadiranDisplay()
//                    }
//                    is com.example.ritamesa.api.Result.Error -> {
//                        Log.w(TAG, "Homeroom dashboard gagal: ${result.message}")
//                        if (isAdded) updateKehadiranDisplay()
//                    }
//                    else -> { }
//                }
//            } catch (e: Exception) {
//                Log.e(TAG, "loadKehadiranSummary exception: ${e.message}", e)
//                if (isAdded) updateKehadiranDisplay()
//            }
//        }
//    }
//
//    @Synchronized
//    private fun updateCombinedJadwal(newList: List<DashboardGuruActivity.JadwalItem>, isTeacherSource: Boolean) {
//        if (!isAdded) return
//
//        // Sederhana: jika list kosong dari salah satu sumber, jangan hapus yang sudah ada
//        if (newList.isEmpty()) return
//
//        // Gunakan set untuk menghindari duplikasi berdasarkan ID
//        val currentIds = combinedSchedules.map { it.id }.toSet()
//        val filteredNewList = newList.filter { it.id !in currentIds }
//
//        combinedSchedules.addAll(filteredNewList)
//
//        // Urutkan berdasarkan waktu (start time / jam jika memungkinkan, atau id)
//        combinedSchedules.sortBy { it.jam }
//
//        handler.post {
//            if (isAdded) {
//                recyclerJadwal?.adapter = JadwalAdapter(combinedSchedules.toList()) { navigateToDetailJadwalWakel(it) }
//            }
//        }
//    }
//
//    private fun loadRiwayatAbsensi(baseActivity: BaseNetworkActivity) {
//        lifecycleScope.launch {
//            try {
//                val classId = resolveTargetClassId()
//                if (classId == null || classId <= 0) {
//                    Log.w(TAG, "loadRiwayatAbsensi: classId tidak ditemukan")
//                    if (isAdded) recyclerRiwayat?.adapter = RiwayatAbsenAdapter(emptyList())
//                    return@launch
//                }
//                val today = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
//                    .format(Date())
//                val result = baseActivity.attendanceRepository
//                    .getClassAttendanceByDate(classId, today)
//                if (!isAdded) return@launch
//                when (result) {
//                    is com.example.ritamesa.api.Result.Success -> {
//                        val list = result.data.mapIndexed { index, att ->
//                            RiwayatAbsenItem(
//                                id        = att.id ?: (index + 1),
//                                namaSiswa = att.student?.name ?: "-",
//                                jurusan   = att.schedule?.className ?: "-",
//                                tanggal   = formatTanggal(att.schedule?.date ?: att.timestamp),
//                                waktu     = formatWaktu(att.timestamp),
//                                status    = att.status ?: "unknown",
//                                reason    = att.reason
//                            )
//                        }
//                        if (isAdded) recyclerRiwayat?.adapter = RiwayatAbsenAdapter(list)
//                    }
//                    is com.example.ritamesa.api.Result.Error -> {
//                        Log.e(TAG, "Gagal load riwayat: ${result.message}")
//                        if (isAdded) recyclerRiwayat?.adapter = RiwayatAbsenAdapter(emptyList())
//                    }
//                    else -> { }
//                }
//            } catch (e: Exception) {
//                Log.e(TAG, "loadRiwayatAbsensi exception: ${e.message}", e)
//                if (isAdded) recyclerRiwayat?.adapter = RiwayatAbsenAdapter(emptyList())
//            }
//        }
//    }
//
//    private fun resolveTargetClassId(): Int? {
//        val fromSchedules = combinedSchedules
//            .mapNotNull { it.idKelas.toIntOrNull() }
//            .firstOrNull { it > 0 }
//        if (fromSchedules != null) return fromSchedules
//        return try {
//            AppPreferences(requireContext()).getHomeroomClassIdIntSync()
//        } catch (e: Exception) {
//            Log.w(TAG, "resolveTargetClassId: gagal baca prefs: ${e.message}")
//            null
//        }
//    }
//
//    // ── UI Helpers ────────────────────────────────────────────────────────
//
//    private fun updateKehadiranDisplay() {
//        if (!isAdded) return
//        txtNominalSiswa?.text = HARDCODED_TOTAL_STUDENTS.toString()
//        txtHadirCount?.text   = hadirCount.toString()
//        txtIzinCount?.text    = izinCount.toString()
//        txtSakitCount?.text   = sakitCount.toString()
//        txtAlphaCount?.text   = alphaCount.toString()
//    }
//
//    private fun setupTotalSiswaPopup() {
//        val clickListener = View.OnClickListener {
//            if (!isAdded) return@OnClickListener
//            android.app.AlertDialog.Builder(requireContext())
//                .setTitle("Total Siswa")
//                .setMessage("Total Siswa : $HARDCODED_TOTAL_STUDENTS")
//                .setPositiveButton("OK", null)
//                .show()
//        }
//        btnJumlahSiswa?.setOnClickListener(clickListener)
//        txtNominalSiswa?.setOnClickListener(clickListener)
//    }
//
//    private fun formatJam(start: String?, end: String?) = when {
//        !start.isNullOrEmpty() && !end.isNullOrEmpty() -> "${start.take(5)} - ${end.take(5)}"
//        !start.isNullOrEmpty() -> start.take(5)
//        else -> "-"
//    }
//
//    private fun formatTanggal(raw: String?): String {
//        if (raw.isNullOrBlank()) return "-"
//        return try {
//            val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
//            val out = SimpleDateFormat("d MMM yyyy", Locale.forLanguageTag("id-ID"))
//            out.format(sdf.parse(raw.take(10))!!)
//        } catch (e: Exception) { raw }
//    }
//
//    private fun formatWaktu(raw: String?): String {
//        if (raw.isNullOrBlank()) return "-"
//        return when {
//            raw.contains('T') -> raw.substringAfter('T').take(5)
//            raw.contains(' ') -> raw.substringAfter(' ').take(5)
//            else              -> raw.take(5)
//        }
//    }
//
//    private fun navigateToDetailJadwalWakel(jadwal: DashboardGuruActivity.JadwalItem) {
//        try {
//            requireContext().startActivity(
//                Intent(requireContext(), DetailJadwalWakelActivity::class.java).apply {
//                    putExtra("JADWAL_DATA", DashboardGuruActivity.JadwalData(
//                        id             = jadwal.id,
//                        idKelas        = jadwal.idKelas.toIntOrNull() ?: 0,
//                        mataPelajaran  = jadwal.mataPelajaran,
//                        kelas          = jadwal.kelas,
//                        jam            = jadwal.jam,
//                        waktuPelajaran = jadwal.waktuPelajaran
//                    ))
//                }
//            )
//        } catch (e: Exception) {
//            if (isAdded) Toast.makeText(requireContext(), "Error membuka detail jadwal", Toast.LENGTH_SHORT).show()
//        }
//    }
//
//    // ── DateTime ──────────────────────────────────────────────────────────
//
//    private fun setupDateTime() {
//        try {
//            val localeId = Locale.forLanguageTag("id-ID")
//            val tanggal  = SimpleDateFormat("EEEE, d MMMM yyyy", localeId).format(Date())
//                .replaceFirstChar { if (it.isLowerCase()) it.titlecase(localeId) else it.toString() }
//            txtTanggalSekarang?.text    = tanggal
//            txtTanggalDiJamLayout?.text = tanggal
//            txtJamMasuk?.text           = "07:00"
//            txtJamPulang?.text          = "15:00"
//
//            clockRunnable = object : Runnable {
//                override fun run() {
//                    if (!isAdded || txtWaktuLive == null) return
//                    val tf = SimpleDateFormat("HH:mm", Locale.getDefault()).apply {
//                        timeZone = TimeZone.getTimeZone("Asia/Jakarta")
//                    }
//                    txtWaktuLive?.text = tf.format(Date())
//                    handler.postDelayed(this, 60_000L)
//                }
//            }
//            handler.post(clockRunnable!!)
//        } catch (e: Exception) {
//            Log.e(TAG, "setupDateTime error: ${e.message}", e)
//        }
//    }
//
//    // ── Footer Navigation ─────────────────────────────────────────────────
//
//    private fun setupFooterNavigation() {
//        try {
//            val v = view
//            v?.findViewById<ImageButton>(R.id.btnHome)?.setOnClickListener {
//                val base = activity as? BaseNetworkActivity ?: return@setOnClickListener
//                loadProfileData(base)
//                loadKehadiranSummary(base)
//                loadJadwalWakel(base)
//                loadRiwayatAbsensi(base)
//                Toast.makeText(requireContext(), "Dashboard diperbarui", Toast.LENGTH_SHORT).show()
//            }
//            v?.findViewById<ImageButton>(R.id.btnCalendar)?.setOnClickListener { navigationCallback?.invoke("riwayat") }
//            v?.findViewById<ImageButton>(R.id.btnChart)?.setOnClickListener { navigationCallback?.invoke("tindak_lanjut") }
//            v?.findViewById<ImageButton>(R.id.btnNotif)?.setOnClickListener { navigationCallback?.invoke("notifikasi") }
//        } catch (e: Exception) {
//            Log.e(TAG, "setupFooterNavigation error: ${e.message}", e)
//        }
//    }
//
//    // ── Kehadiran Buttons ─────────────────────────────────────────────────
//
//    private fun setupKehadiranButtons() {
//        try {
//            val v = view
//            v?.findViewById<ImageButton>(R.id.jumlah_siswa_wakel)?.setOnClickListener {
//                showToastKehadiran("Total siswa", totalSiswa)
//            }
//            v?.findViewById<ImageButton>(R.id.button_hadir)?.setOnClickListener {
//                showToastKehadiran("Hadir", hadirCount)
//            }
//            v?.findViewById<ImageButton>(R.id.button_sakit)?.setOnClickListener {
//                startActivity(Intent(requireContext(), PersetujuanIzinWakelActivity::class.java))
//            }
//            v?.findViewById<ImageButton>(R.id.button_izin)?.setOnClickListener {
//                startActivity(Intent(requireContext(), PersetujuanIzinWakelActivity::class.java))
//            }
//            v?.findViewById<ImageButton>(R.id.button_alpha)?.setOnClickListener {
//                showToastKehadiran("Alpha", alphaCount)
//            }
//        } catch (e: Exception) {
//            Log.e(TAG, "setupKehadiranButtons error: ${e.message}", e)
//        }
//    }
//
//    private fun showToastKehadiran(label: String, count: Int) {
//        if (!isAdded) return
//        Toast.makeText(requireContext(), "Siswa $label: $count orang", Toast.LENGTH_SHORT).show()
//    }
//
//    // ── Profile & Logout ──────────────────────────────────────────────────
//
//    private fun showProfileMenu(view: View) {
//        try {
//            val popup = PopupMenu(requireContext(), view)
//            popup.menuInflater.inflate(R.menu.profile_simple, popup.menu)
//            popup.setOnMenuItemClickListener {
//                when (it.itemId) {
//                    R.id.menu_logout -> { showLogoutConfirmation(); true }
//                    R.id.menu_cancel -> true
//                    else -> false
//                }
//            }
//            popup.show()
//        } catch (e: Exception) {
//            Log.e(TAG, "showProfileMenu error: ${e.message}", e)
//        }
//    }
//
//    private fun showLogoutConfirmation() {
//        if (!isAdded) return
//        android.app.AlertDialog.Builder(requireContext())
//            .setTitle("Logout Wali Kelas")
//            .setMessage("Yakin ingin logout dari akun wali kelas?")
//            .setPositiveButton("Ya, Logout") { _, _ -> performLogout() }
//            .setNegativeButton("Batal", null)
//            .show()
//    }
//
//    private fun performLogout() {
//        val baseActivity = activity as? BaseNetworkActivity ?: return
//        lifecycleScope.launch {
//            try { baseActivity.authRepository.logout() } catch (e: Exception) {
//                Log.w(TAG, "Logout API gagal: ${e.message}")
//            }
//            try { AppPreferences(requireContext()).clearAuth() } catch (ignored: Exception) { }
//            if (isAdded) {
//                requireActivity().startActivity(
//                    Intent(requireContext(), LoginAwal::class.java).apply {
//                        flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
//                    }
//                )
//                requireActivity().finish()
//            }
//        }
//    }
//
//    fun setNavigationCallback(callback: (String) -> Unit) { navigationCallback = callback }
//}
