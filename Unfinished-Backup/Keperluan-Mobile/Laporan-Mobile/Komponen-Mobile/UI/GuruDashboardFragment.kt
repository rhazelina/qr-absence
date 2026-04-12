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


class GuruDashboardFragment : Fragment() {

    companion object {
        private const val TAG = "DashboardGuruFrag"
        fun newInstance() = GuruDashboardFragment()
    }

    private var txtTanggalSekarang: TextView? = null
    private var txtWaktuLive: TextView? = null
    private var txtJamMasuk: TextView? = null
    private var txtJamPulang: TextView? = null
    private var txtTanggalDiJamLayout: TextView? = null
    private var txtHadirCount: TextView? = null
    private var txtIzinCount: TextView? = null
    private var txtSakitCount: TextView? = null
    private var txtAlphaCount: TextView? = null
    private var recyclerJadwal: RecyclerView? = null

    private val handler = Handler(Looper.getMainLooper())
    private var clockRunnable: Runnable? = null

    private var hadirCount = 0
    private var izinCount  = 0
    private var sakitCount = 0
    private var alphaCount = 0

    private val jadwalHariIni = mutableListOf<DashboardGuruActivity.JadwalItem>()
    private var navigationCallback: ((String) -> Unit)? = null

    // ── Lifecycle ─────────────────────────────────────────────────────────

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? = try {
        inflater.inflate(R.layout.dashboard_guru, container, false)
    } catch (e: Exception) {
        Log.e(TAG, "inflate error: ${e.message}", e); null
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        initViews(view)
        setupDateTime()
        setupRecyclerView()
        setupFooterNavigation()
        setupKehadiranButtons()
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
            txtHadirCount         = view.findViewById(R.id.txt_hadir_count)
            txtIzinCount          = view.findViewById(R.id.txt_izin_count)
            txtSakitCount         = view.findViewById(R.id.txt_sakit_count)
            txtAlphaCount         = view.findViewById(R.id.txt_alpha_count)
            recyclerJadwal        = view.findViewById(R.id.recyclerJadwal)
            view.findViewById<ImageButton>(R.id.profile)?.setOnClickListener { showProfileMenu(it) }
        } catch (e: Exception) {
            Log.e(TAG, "initViews error: ${e.message}", e)
        }
    }

    private fun setupRecyclerView() {
        recyclerJadwal?.apply {
            layoutManager = LinearLayoutManager(requireContext())
            adapter       = JadwalAdapter(jadwalHariIni) { navigateToDetailJadwal(it) }
            setHasFixedSize(true)
        }
    }

    // ── API ───────────────────────────────────────────────────────────────

    private fun loadDashboardFromApi() {
        val baseActivity = activity as? BaseNetworkActivity ?: run {
            Log.w(TAG, "activity bukan BaseNetworkActivity, skip"); return
        }
        lifecycleScope.launch {
            try {
                val result = baseActivity.dashboardRepository.getTeacherDashboard()
                if (!isAdded) return@launch
                when (result) {
                    is com.example.ritamesa.api.Result.Success -> {
                        Log.d("DashboardResponse", "Guru Dashboard: ${Gson().toJson(result.data)}")
                        val schoolSummary = result.data.schoolAttendanceSummaryToday
                        val fallback = result.data.attendanceSummary.orEmpty()
                        hadirCount = schoolSummary?.present ?: (fallback["present"] ?: 0)
                        izinCount = schoolSummary?.excused
                            ?: (fallback["excused"] ?: fallback["izin"] ?: 0)
                        sakitCount = schoolSummary?.sick ?: (fallback["sick"] ?: 0)
                        alphaCount = schoolSummary?.absent ?: (fallback["absent"] ?: 0)
                        updateKehadiranCount()
                        val schedules = result.data.todaySchedules
                        if (!schedules.isNullOrEmpty()) {
                            fillJadwal(schedules)
                        } else {
                            loadJadwalFallback(baseActivity)
                        }
                    }
                    is com.example.ritamesa.api.Result.Error -> {
                        Log.e(TAG, "Teacher dashboard error: ${result.message}")
                        updateKehadiranCount()
                        loadJadwalFallback(baseActivity)
                    }
                    is com.example.ritamesa.api.Result.Loading -> { }
                }
            } catch (e: Exception) {
                Log.e(TAG, "loadDashboardFromApi exception: ${e.message}", e)
                if (isAdded) { updateKehadiranCount(); loadJadwalFallback(baseActivity) }
            }
        }
    }

    private fun fillJadwal(schedules: List<com.example.ritamesa.api.models.TeachingScheduleItem>) {
        jadwalHariIni.clear()
        schedules.forEachIndexed { index, s ->
            jadwalHariIni.add(DashboardGuruActivity.JadwalItem(
                id             = s.id ?: (index + 1),
                mataPelajaran  = s.resolvedSubjectName() ?: "Mata Pelajaran Tidak Ada",
                waktuPelajaran = s.timeSlot ?: "Jam Ke-${index + 1}",
                kelas          = s.className ?: s.`class` ?: "-",
                jam            = formatJam(s.startTime, s.endTime),
                idKelas        = (s.classId ?: 0).toString(),
                idMapel        = (s.id ?: 0).toString(),
                studentCount   = s.studentCount ?: 0
            ))
        }
        recyclerJadwal?.adapter?.notifyDataSetChanged()
    }

    private fun loadJadwalFallback(baseActivity: BaseNetworkActivity) {
        lifecycleScope.launch {
            try {
                val result = baseActivity.scheduleRepository.getTodaysSchedule()
                if (!isAdded) return@launch
                if (result is com.example.ritamesa.api.Result.Success && result.data.isNotEmpty()) {
                    jadwalHariIni.clear()
                    result.data.forEachIndexed { index, s ->
                        jadwalHariIni.add(DashboardGuruActivity.JadwalItem(
                            id              = s.id ?: 0,
                            mataPelajaran   = s.subjectName ?: "Mata Pelajaran Tidak Ada",
                            waktuPelajaran  = s.timeSlot?.session?.let { "Jam Ke-$it" } ?: "Jam Ke-${index + 1}",
                            kelas           = s.className ?: s.`class` ?: "-",
                            jam             = formatJam(s.startTime, s.endTime),
                            idKelas         = (s.classId ?: 0).toString(),
                            idMapel         = (s.id ?: 0).toString(),
                            studentCount    = s.studentCount ?: 0
                        ))
                    }
                    recyclerJadwal?.adapter?.notifyDataSetChanged()
                }
            } catch (e: Exception) {
                Log.e(TAG, "loadJadwalFallback exception: ${e.message}", e)
            }
        }
    }

    // ── UI Helpers ────────────────────────────────────────────────────────

    private fun updateKehadiranCount() {
        if (!isAdded) return
        txtHadirCount?.text = hadirCount.toString()
        txtAlphaCount?.text = alphaCount.toString()
        txtIzinCount?.text  = izinCount.toString()
        txtSakitCount?.text = sakitCount.toString()
    }

    private fun formatJam(start: String?, end: String?) = when {
        !start.isNullOrEmpty() && !end.isNullOrEmpty() -> "${start.take(5)} - ${end.take(5)}"
        !start.isNullOrEmpty() -> start.take(5)
        else -> "-"
    }

    private fun navigateToDetailJadwal(jadwal: DashboardGuruActivity.JadwalItem) {
        try {
            requireContext().startActivity(
                Intent(requireContext(), DetailJadwalGuruActivity::class.java).apply {
                    putExtra("JADWAL_DATA", DashboardGuruActivity.JadwalData(
                        id             = jadwal.id,
                        idKelas        = jadwal.idKelas.toIntOrNull() ?: 0,
                        mataPelajaran  = jadwal.mataPelajaran,
                        kelas          = jadwal.kelas,
                        jam            = jadwal.jam,
                        waktuPelajaran = jadwal.waktuPelajaran,
                        studentCount   = jadwal.studentCount
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
            val v = requireView()
            v.findViewById<ImageButton>(R.id.btnHome)?.setOnClickListener {
                jadwalHariIni.clear()
                recyclerJadwal?.adapter?.notifyDataSetChanged()
                loadDashboardFromApi()
                Toast.makeText(requireContext(), "Dashboard diperbarui", Toast.LENGTH_SHORT).show()
            }
            v.findViewById<ImageButton>(R.id.btnCalendar)?.setOnClickListener { navigationCallback?.invoke("riwayat") }
        } catch (e: Exception) {
            Log.e(TAG, "setupFooterNavigation error: ${e.message}", e)
        }
    }

    // ── Kehadiran Buttons ─────────────────────────────────────────────────

    private fun setupKehadiranButtons() {
        try {
            val v = requireView()
            v.findViewById<ImageButton>(R.id.button_hadir)?.setOnClickListener {
                navigateOrToast("hadir", "Hadir", hadirCount)
            }
            v.findViewById<ImageButton>(R.id.button_izin)?.setOnClickListener {
                navigateOrToast("izin", "Izin", izinCount)
            }
            v.findViewById<ImageButton>(R.id.button_sakit)?.setOnClickListener {
                navigateOrToast("sakit", "Sakit", sakitCount)
            }
            v.findViewById<ImageButton>(R.id.button_alpha)?.setOnClickListener {
                navigateOrToast("alpha", "Alpha", alphaCount)
            }
        } catch (e: Exception) {
            Log.e(TAG, "setupKehadiranButtons error: ${e.message}", e)
        }
    }

    private fun navigateOrToast(statusFilter: String, label: String, count: Int) {
        if (!isAdded) return
        try {
            requireContext().startActivity(
                Intent(requireContext(), RiwayatKehadiranGuruActivity::class.java).apply {
                    putExtra("STATUS_FILTER", statusFilter)
                }
            )
        } catch (e: Exception) {
            Toast.makeText(requireContext(), "Siswa $label hari ini: $count orang", Toast.LENGTH_SHORT).show()
        }
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
            .setTitle("Logout Guru")
            .setMessage("Yakin ingin logout dari akun guru?")
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
//class GuruDashboardFragment : Fragment() {
//
//    companion object {
//        private const val TAG = "DashboardGuruFrag"
//        fun newInstance() = GuruDashboardFragment()
//    }
//
//    private var txtTanggalSekarang: TextView? = null
//    private var txtWaktuLive: TextView? = null
//    private var txtJamMasuk: TextView? = null
//    private var txtJamPulang: TextView? = null
//    private var txtTanggalDiJamLayout: TextView? = null
//    private var txtHadirCount: TextView? = null
//    private var txtIzinCount: TextView? = null
//    private var txtSakitCount: TextView? = null
//    private var txtAlphaCount: TextView? = null
//    private var recyclerJadwal: RecyclerView? = null
//
//    private val handler = Handler(Looper.getMainLooper())
//    private var clockRunnable: Runnable? = null
//
//    private var hadirCount = 0
//    private var izinCount  = 0
//    private var sakitCount = 0
//    private var alphaCount = 0
//
//    private val jadwalHariIni = mutableListOf<DashboardGuruActivity.JadwalItem>()
//    private var navigationCallback: ((String) -> Unit)? = null
//
//    // ── Lifecycle ─────────────────────────────────────────────────────────
//
//    override fun onCreateView(
//        inflater: LayoutInflater, container: ViewGroup?,
//        savedInstanceState: Bundle?
//    ): View? = try {
//        inflater.inflate(R.layout.dashboard_guru, container, false)
//    } catch (e: Exception) {
//        Log.e(TAG, "inflate error: ${e.message}", e); null
//    }
//
//    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
//        super.onViewCreated(view, savedInstanceState)
//        initViews(view)
//        setupDateTime()
//        setupRecyclerView()
//        setupFooterNavigation()
//        setupKehadiranButtons()
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
//        txtHadirCount         = null
//        txtIzinCount          = null
//        txtSakitCount         = null
//        txtAlphaCount         = null
//        recyclerJadwal        = null
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
//            txtHadirCount         = view.findViewById(R.id.txt_hadir_count)
//            txtIzinCount          = view.findViewById(R.id.txt_izin_count)
//            txtSakitCount         = view.findViewById(R.id.txt_sakit_count)
//            txtAlphaCount         = view.findViewById(R.id.txt_alpha_count)
//            recyclerJadwal        = view.findViewById(R.id.recyclerJadwal)
//            view.findViewById<ImageButton>(R.id.profile)?.setOnClickListener { showProfileMenu(it) }
//        } catch (e: Exception) {
//            Log.e(TAG, "initViews error: ${e.message}", e)
//        }
//    }
//
//    private fun setupRecyclerView() {
//        recyclerJadwal?.apply {
//            layoutManager = LinearLayoutManager(requireContext())
//            adapter       = JadwalAdapter(jadwalHariIni) { navigateToDetailJadwal(it) }
//            setHasFixedSize(true)
//        }
//    }
//
//    // ── API ───────────────────────────────────────────────────────────────
//
//    private fun loadDashboardFromApi() {
//        val baseActivity = activity as? BaseNetworkActivity ?: run {
//            Log.w(TAG, "activity bukan BaseNetworkActivity, skip"); return
//        }
//        loadTeachingSummary(baseActivity)
//        lifecycleScope.launch {
//            try {
//                val result = baseActivity.dashboardRepository.getTeacherDashboard()
//                if (!isAdded) return@launch
//                when (result) {
//                    is com.example.ritamesa.api.Result.Success -> {
//                        Log.d("DashboardResponse", "Guru Dashboard: ${Gson().toJson(result.data)}")
//                        val stats = result.data.todayStatistics
//                        hadirCount = stats?.totalStudentsPresent ?: 0
//                        alphaCount = stats?.totalStudentsAbsent  ?: 0
//                        izinCount  = 0
//                        sakitCount = 0
//                        updateKehadiranCount()
//                        val schedules = result.data.todaySchedules
//                        if (!schedules.isNullOrEmpty()) {
//                            fillJadwal(schedules)
//                        } else {
//                            loadJadwalFallback(baseActivity)
//                        }
//                    }
//                    is com.example.ritamesa.api.Result.Error -> {
//                        Log.e(TAG, "Teacher dashboard error: ${result.message}")
//                        updateKehadiranCount()
//                        loadJadwalFallback(baseActivity)
//                    }
//                    is com.example.ritamesa.api.Result.Loading -> { }
//                }
//            } catch (e: Exception) {
//                Log.e(TAG, "loadDashboardFromApi exception: ${e.message}", e)
//                if (isAdded) { updateKehadiranCount(); loadJadwalFallback(baseActivity) }
//            }
//        }
//    }
//
//    private fun loadTeachingSummary(baseActivity: BaseNetworkActivity) {
//        lifecycleScope.launch {
//            try {
//                val today = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).apply {
//                    timeZone = TimeZone.getTimeZone("Asia/Jakarta")
//                }.format(Date())
//                val result = baseActivity.attendanceRepository.getMyTeachingAttendanceSummary(today, today)
//                when (result) {
//                    is com.example.ritamesa.api.Result.Success -> {
//                        val summary = result.data
//                        hadirCount = (summary.present ?: 0) + (summary.late ?: 0)
//                        alphaCount = summary.absent ?: 0
//                        izinCount = summary.excused ?: 0
//                        sakitCount = summary.sick ?: 0
//                        updateKehadiranCount()
//                    }
//                    is com.example.ritamesa.api.Result.Error -> {
//                        Log.w(TAG, "Teaching summary error: ${result.message}")
//                    }
//                    is com.example.ritamesa.api.Result.Loading -> Unit
//                }
//            } catch (e: Exception) {
//                Log.e(TAG, "loadTeachingSummary exception: ${e.message}", e)
//            }
//        }
//    }
//
//    private fun fillJadwal(schedules: List<com.example.ritamesa.api.models.TeachingScheduleItem>) {
//        jadwalHariIni.clear()
//        schedules.forEachIndexed { index, s ->
//            jadwalHariIni.add(DashboardGuruActivity.JadwalItem(
//                id             = s.id ?: (index + 1),
//                mataPelajaran  = s.resolvedSubjectName() ?: "Mata Pelajaran Tidak Ada",
//                waktuPelajaran = s.timeSlot ?: "Jam Ke-${index + 1}",
//                kelas          = s.className ?: s.`class` ?: "-",
//                jam            = formatJam(s.startTime, s.endTime),
//                idKelas        = (s.classId ?: 0).toString(),
//                idMapel        = (s.id ?: 0).toString(),
//                studentCount   = s.studentCount ?: 0
//            ))
//        }
//        recyclerJadwal?.adapter?.notifyDataSetChanged()
//    }
//
//    private fun loadJadwalFallback(baseActivity: BaseNetworkActivity) {
//        lifecycleScope.launch {
//            try {
//                val result = baseActivity.scheduleRepository.getTodaysSchedule()
//                if (!isAdded) return@launch
//                if (result is com.example.ritamesa.api.Result.Success && result.data.isNotEmpty()) {
//                    jadwalHariIni.clear()
//                    result.data.forEachIndexed { index, s ->
//                        jadwalHariIni.add(DashboardGuruActivity.JadwalItem(
//                            id              = s.id ?: 0,
//                            mataPelajaran   = s.subjectName ?: "Mata Pelajaran Tidak Ada",
//                            waktuPelajaran  = s.timeSlot?.session?.let { "Jam Ke-$it" } ?: "Jam Ke-${index + 1}",
//                            kelas           = s.className ?: s.`class` ?: "-",
//                            jam             = formatJam(s.startTime, s.endTime),
//                            idKelas         = (s.classId ?: 0).toString(),
//                            idMapel         = (s.id ?: 0).toString(),
//                            studentCount    = s.studentCount ?: 0
//                        ))
//                    }
//                    recyclerJadwal?.adapter?.notifyDataSetChanged()
//                }
//            } catch (e: Exception) {
//                Log.e(TAG, "loadJadwalFallback exception: ${e.message}", e)
//            }
//        }
//    }
//
//    // ── UI Helpers ────────────────────────────────────────────────────────
//
//    private fun updateKehadiranCount() {
//        if (!isAdded) return
//        txtHadirCount?.text = hadirCount.toString()
//        txtAlphaCount?.text = alphaCount.toString()
//        txtIzinCount?.text  = izinCount.toString()
//        txtSakitCount?.text = sakitCount.toString()
//    }
//
//    private fun formatJam(start: String?, end: String?) = when {
//        !start.isNullOrEmpty() && !end.isNullOrEmpty() -> "${start.take(5)} - ${end.take(5)}"
//        !start.isNullOrEmpty() -> start.take(5)
//        else -> "-"
//    }
//
//    private fun navigateToDetailJadwal(jadwal: DashboardGuruActivity.JadwalItem) {
//        try {
//            requireContext().startActivity(
//                Intent(requireContext(), DetailJadwalGuruActivity::class.java).apply {
//                    putExtra("JADWAL_DATA", DashboardGuruActivity.JadwalData(
//                        id             = jadwal.id,
//                        idKelas        = jadwal.idKelas.toIntOrNull() ?: 0,
//                        mataPelajaran  = jadwal.mataPelajaran,
//                        kelas          = jadwal.kelas,
//                        jam            = jadwal.jam,
//                        waktuPelajaran = jadwal.waktuPelajaran,
//                        studentCount   = jadwal.studentCount
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
//
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
//            val v = requireView()
//            v.findViewById<ImageButton>(R.id.btnHome)?.setOnClickListener {
//                jadwalHariIni.clear()
//                recyclerJadwal?.adapter?.notifyDataSetChanged()
//                loadDashboardFromApi()
//                Toast.makeText(requireContext(), "Dashboard diperbarui", Toast.LENGTH_SHORT).show()
//            }
//            v.findViewById<ImageButton>(R.id.btnCalendar)?.setOnClickListener { navigationCallback?.invoke("riwayat") }
//            v.findViewById<ImageButton>(R.id.btnChart)?.setOnClickListener { navigationCallback?.invoke("tindak_lanjut") }
//            v.findViewById<ImageButton>(R.id.btnNotif)?.setOnClickListener { navigationCallback?.invoke("notifikasi") }
//        } catch (e: Exception) {
//            Log.e(TAG, "setupFooterNavigation error: ${e.message}", e)
//        }
//    }
//
//    // ── Kehadiran Buttons ─────────────────────────────────────────────────
//
//    private fun setupKehadiranButtons() {
//        try {
//            val v = requireView()
//            v.findViewById<ImageButton>(R.id.button_hadir)?.setOnClickListener {
//                navigateOrToast("hadir", "Hadir", hadirCount)
//            }
//            v.findViewById<ImageButton>(R.id.button_izin)?.setOnClickListener {
//                navigateOrToast("izin", "Izin", izinCount)
//            }
//            v.findViewById<ImageButton>(R.id.button_sakit)?.setOnClickListener {
//                navigateOrToast("sakit", "Sakit", sakitCount)
//            }
//            v.findViewById<ImageButton>(R.id.button_alpha)?.setOnClickListener {
//                navigateOrToast("alpha", "Alpha", alphaCount)
//            }
//        } catch (e: Exception) {
//            Log.e(TAG, "setupKehadiranButtons error: ${e.message}", e)
//        }
//    }
//
//    private fun navigateOrToast(statusFilter: String, label: String, count: Int) {
//        if (!isAdded) return
//        try {
//            requireContext().startActivity(
//                Intent(requireContext(), RiwayatKehadiranGuruActivity::class.java).apply {
//                    putExtra("STATUS_FILTER", statusFilter)
//                }
//            )
//        } catch (e: Exception) {
//            Toast.makeText(requireContext(), "Siswa $label hari ini: $count orang", Toast.LENGTH_SHORT).show()
//        }
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
//            .setTitle("Logout Guru")
//            .setMessage("Yakin ingin logout dari akun guru?")
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
//
//
//
////package com.example.ritamesa
////
////import android.content.Intent
////import android.os.Bundle
////import android.os.Handler
////import android.os.Looper
////import android.util.Log
////import android.view.LayoutInflater
////import android.view.View
////import android.view.ViewGroup
////import android.widget.ImageButton
////import android.widget.PopupMenu
////import android.widget.TextView
////import android.widget.Toast
////import androidx.fragment.app.Fragment
////import androidx.lifecycle.lifecycleScope
////import androidx.recyclerview.widget.LinearLayoutManager
////import androidx.recyclerview.widget.RecyclerView
////import com.google.gson.Gson
////import kotlinx.coroutines.launch
////import java.text.SimpleDateFormat
////import java.util.Date
////import java.util.Locale
////import java.util.TimeZone
////
////class GuruDashboardFragment : Fragment() {
////
////    companion object {
////        private const val TAG = "DashboardGuruFrag"
////        fun newInstance() = GuruDashboardFragment()
////    }
////
////    private var txtTanggalSekarang: TextView? = null
////    private var txtWaktuLive: TextView? = null
////    private var txtJamMasuk: TextView? = null
////    private var txtJamPulang: TextView? = null
////    private var txtTanggalDiJamLayout: TextView? = null
////    private var txtHadirCount: TextView? = null
////    private var txtIzinCount: TextView? = null
////    private var txtSakitCount: TextView? = null
////    private var txtAlphaCount: TextView? = null
////    private var recyclerJadwal: RecyclerView? = null
////
////    private val handler = Handler(Looper.getMainLooper())
////    private var clockRunnable: Runnable? = null
////
////    private var hadirCount = 0
////    private var izinCount = 0
////    private var sakitCount = 0
////    private var alphaCount = 0
////
////    private val jadwalHariIni = mutableListOf<DashboardGuruActivity.JadwalItem>()
////    private var navigationCallback: ((String) -> Unit)? = null
////
////    override fun onCreateView(
////        inflater: LayoutInflater,
////        container: ViewGroup?,
////        savedInstanceState: Bundle?
////    ): View? = try {
////        inflater.inflate(R.layout.dashboard_guru, container, false)
////    } catch (e: Exception) {
////        Log.e(TAG, "inflate error: ${e.message}", e)
////        null
////    }
////
////    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
////        super.onViewCreated(view, savedInstanceState)
////        initViews(view)
////        setupDateTime()
////        setupRecyclerView()
////        setupFooterNavigation()
////        setupKehadiranButtons()
////        loadDashboardFromApi()
////    }
////
////    override fun onDestroyView() {
////        super.onDestroyView()
////        clockRunnable?.let { handler.removeCallbacks(it) }
////        clockRunnable = null
////        txtTanggalSekarang = null
////        txtWaktuLive = null
////        txtJamMasuk = null
////        txtJamPulang = null
////        txtTanggalDiJamLayout = null
////        txtHadirCount = null
////        txtIzinCount = null
////        txtSakitCount = null
////        txtAlphaCount = null
////        recyclerJadwal = null
////    }
////
////    private fun initViews(view: View) {
////        try {
////            txtTanggalSekarang = view.findViewById(R.id.txtTanggalSekarang)
////            txtWaktuLive = view.findViewById(R.id.txtWaktuLive)
////            txtJamMasuk = view.findViewById(R.id.txtJamMasuk)
////            txtJamPulang = view.findViewById(R.id.txtJamPulang)
////            txtTanggalDiJamLayout = view.findViewById(R.id.txtTanggalDiJamLayout)
////            txtHadirCount = view.findViewById(R.id.txt_hadir_count)
////            txtIzinCount = view.findViewById(R.id.txt_izin_count)
////            txtSakitCount = view.findViewById(R.id.txt_sakit_count)
////            txtAlphaCount = view.findViewById(R.id.txt_alpha_count)
////            recyclerJadwal = view.findViewById(R.id.recyclerJadwal)
////            view.findViewById<ImageButton>(R.id.profile)
////                ?.setOnClickListener { showProfileMenu(it) }
////        } catch (e: Exception) {
////            Log.e(TAG, "initViews error: ${e.message}", e)
////        }
////    }
////
////    private fun setupRecyclerView() {
////        recyclerJadwal?.apply {
////            layoutManager = LinearLayoutManager(requireContext())
////            adapter = JadwalAdapter(jadwalHariIni) { navigateToDetailJadwal(it) }
////            setHasFixedSize(true)
////        }
////    }
////
////    // helper jam-pembelajaran
////    private fun resolveWaktuPelajaran(item: com.example.ritamesa.api.models.TeachingScheduleItem, index: Int): String {
////        val raw = item.timeSlot?.trim().orEmpty()
////
////        if (raw.isNotEmpty()) {
////            val normalized = raw.lowercase(Locale.getDefault())
////
////            if (normalized.contains("jam")) {
////                return raw
////            }
////
////            if (raw.contains("-")) {
////                return "Jam Ke $raw"
////            }
////
////            val numeric = raw.toIntOrNull()
////            if (numeric != null && numeric in 1..20) {
////                return "Jam Ke $numeric"
////            }
////        }
////
////        return if (!item.startTime.isNullOrEmpty() && !item.endTime.isNullOrEmpty()) {
////            "${item.startTime.take(5)} - ${item.endTime.take(5)}"
////        } else {
////            "Jam Ke ${index + 1}"
////        }
////    }
////
////    private fun resolveWaktuPelajaran(
////        item: com.example.ritamesa.api.models.Schedule,
////        index: Int
////    ): String {
////        val session = item.timeSlot?.session
////        if (session != null && session in 1..20) {
////            return "Jam Ke $session"
////        }
////
////        return if (!item.startTime.isNullOrEmpty() && !item.endTime.isNullOrEmpty()) {
////            "${item.startTime.take(5)} - ${item.endTime.take(5)}"
////        } else {
////            "Jam Ke ${index + 1}"
////        }
////    }
////
////    private fun loadDashboardFromApi() {
////        val baseActivity = activity as? BaseNetworkActivity ?: run {
////            Log.w(TAG, "activity bukan BaseNetworkActivity, skip")
////            return
////        }
////
////        lifecycleScope.launch {
////            try {
////                val result = baseActivity.dashboardRepository.getTeacherDashboard()
////                if (!isAdded) return@launch
////
////                when (result) {
////                    is com.example.ritamesa.api.Result.Success -> {
////                        Log.d("DashboardResponse", "Guru Dashboard: ${Gson().toJson(result.data)}")
////                        val stats = result.data.todayStatistics
////                        hadirCount = stats?.totalStudentsPresent ?: 0
////                        alphaCount = stats?.totalStudentsAbsent ?: 0
////                        izinCount = stats?.totalStudentsExcused ?: 0
////                        sakitCount = stats?.totalStudentsSick ?: 0
////                        updateKehadiranCount()
////
////                        val schedules = result.data.todaySchedules
////                        if (!schedules.isNullOrEmpty()) {
////                            fillJadwal(schedules)
////                        } else {
////                            loadJadwalFallback(baseActivity)
////                        }
////                    }
////                    is com.example.ritamesa.api.Result.Error -> {
////                        Log.e(TAG, "Teacher dashboard error: ${result.message}")
////                        updateKehadiranCount()
////                        loadJadwalFallback(baseActivity)
////                    }
////                    is com.example.ritamesa.api.Result.Loading -> Unit
////                }
////            } catch (e: Exception) {
////                Log.e(TAG, "loadDashboardFromApi exception: ${e.message}", e)
////                if (isAdded) {
////                    updateKehadiranCount()
////                    loadJadwalFallback(baseActivity)
////                }
////            }
////        }
////    }
////
////    private fun fillJadwal(schedules: List<com.example.ritamesa.api.models.TeachingScheduleItem>) {
////        jadwalHariIni.clear()
////        schedules.forEachIndexed { index, s ->
////            jadwalHariIni.add(
////                DashboardGuruActivity.JadwalItem(
////                    id = s.id ?: (index + 1),
////                    mataPelajaran = s.resolvedSubjectName() ?: "Mata Pelajaran Tidak Ada",
////                    waktuPelajaran = s.timeSlot ?: "Jam Ke-${index + 1}",
////                    kelas = s.className ?: s.`class` ?: "-",
////                    jam = formatJam(s.startTime, s.endTime),
////                    idKelas = (s.classId ?: 0).toString(),
////                    idMapel = (s.id ?: 0).toString(),
////                    studentCount = s.studentCount ?: 0
////                )
////            )
////        }
////        recyclerJadwal?.adapter?.notifyDataSetChanged()
////    }
////
////    private fun loadJadwalFallback(baseActivity: BaseNetworkActivity) {
////        lifecycleScope.launch {
////            try {
////                val result = baseActivity.scheduleRepository.getTodaysSchedule()
////                if (!isAdded) return@launch
////
////                if (result is com.example.ritamesa.api.Result.Success && result.data.isNotEmpty()) {
////                    jadwalHariIni.clear()
////                    result.data.forEachIndexed { index, s ->
////                        jadwalHariIni.add(
////                            DashboardGuruActivity.JadwalItem(
////                                id = s.id ?: 0,
////                                mataPelajaran = s.subjectName ?: "Mata Pelajaran Tidak Ada",
////                                waktuPelajaran = s.timeSlot?.session?.let { "Jam Ke-$it" } ?: "Jam Ke-${index + 1}",
////                                kelas = s.className ?: s.`class` ?: "-",
////                                jam = formatJam(s.startTime, s.endTime),
////                                idKelas = (s.classId ?: 0).toString(),
////                                idMapel = (s.id ?: 0).toString(),
////                                studentCount = s.studentCount ?: 0
////                            )
////                        )
////                    }
////                    recyclerJadwal?.adapter?.notifyDataSetChanged()
////                }
////            } catch (e: Exception) {
////                Log.e(TAG, "loadJadwalFallback exception: ${e.message}", e)
////            }
////        }
////    }
////
////
////    private fun updateKehadiranCount() {
////        if (!isAdded) return
////        txtHadirCount?.text = hadirCount.toString()
////        txtAlphaCount?.text = alphaCount.toString()
////        txtIzinCount?.text = izinCount.toString()
////        txtSakitCount?.text = sakitCount.toString()
////    }
////
////    private fun formatJam(start: String?, end: String?): String = when {
////        !start.isNullOrEmpty() && !end.isNullOrEmpty() -> "${start.take(5)} - ${end.take(5)}"
////        !start.isNullOrEmpty() -> start.take(5)
////        else -> "-"
////    }
////
////    private fun navigateToDetailJadwal(jadwal: DashboardGuruActivity.JadwalItem) {
////        try {
////            requireContext().startActivity(
////                Intent(requireContext(), DetailJadwalGuruActivity::class.java).apply {
////                    putExtra(
////                        "JADWAL_DATA",
////                        DashboardGuruActivity.JadwalData(
////                            id = jadwal.id,
////                            idKelas = jadwal.idKelas.toIntOrNull() ?: 0,
////                            mataPelajaran = jadwal.mataPelajaran,
////                            kelas = jadwal.kelas,
////                            jam = jadwal.jam,
////                            waktuPelajaran = jadwal.waktuPelajaran,
////                            studentCount = jadwal.studentCount
////                        )
////                    )
////                }
////            )
////        } catch (e: Exception) {
////            if (isAdded) {
////                Toast.makeText(requireContext(), "Error membuka detail jadwal", Toast.LENGTH_SHORT).show()
////            }
////        }
////    }
////
////    private fun setupDateTime() {
////        try {
////            val localeId = Locale.forLanguageTag("id-ID")
////            val tanggal = SimpleDateFormat("EEEE, d MMMM yyyy", localeId).format(Date())
////                .replaceFirstChar { if (it.isLowerCase()) it.titlecase(localeId) else it.toString() }
////
////            txtTanggalSekarang?.text = tanggal
////            txtTanggalDiJamLayout?.text = tanggal
////            txtJamMasuk?.text = "07:00"
////            txtJamPulang?.text = "15:00"
////
////            clockRunnable = object : Runnable {
////                override fun run() {
////                    if (!isAdded || txtWaktuLive == null) return
////                    val tf = SimpleDateFormat("HH:mm", Locale.getDefault()).apply {
////                        timeZone = TimeZone.getTimeZone("Asia/Jakarta")
////                    }
////                    txtWaktuLive?.text = tf.format(Date())
////                    handler.postDelayed(this, 60_000L)
////                }
////            }
////            handler.post(clockRunnable!!)
////        } catch (e: Exception) {
////            Log.e(TAG, "setupDateTime error: ${e.message}", e)
////        }
////    }
////
////    private fun setupFooterNavigation() {
////        try {
////            val v = requireView()
////            v.findViewById<ImageButton>(R.id.btnHome)?.setOnClickListener {
////                jadwalHariIni.clear()
////                recyclerJadwal?.adapter?.notifyDataSetChanged()
////                loadDashboardFromApi()
////                Toast.makeText(requireContext(), "Dashboard diperbarui", Toast.LENGTH_SHORT).show()
////            }
////            v.findViewById<ImageButton>(R.id.btnCalendar)?.setOnClickListener {
////                navigationCallback?.invoke("riwayat")
////            }
////            v.findViewById<ImageButton>(R.id.btnChart)?.setOnClickListener {
////                navigationCallback?.invoke("tindak_lanjut")
////            }
////            v.findViewById<ImageButton>(R.id.btnNotif)?.setOnClickListener {
////                navigationCallback?.invoke("notifikasi")
////            }
////        } catch (e: Exception) {
////            Log.e(TAG, "setupFooterNavigation error: ${e.message}", e)
////        }
////    }
////
////    private fun setupKehadiranButtons() {
////        try {
////            val v = requireView()
////            v.findViewById<ImageButton>(R.id.button_hadir)?.setOnClickListener {
////                navigateOrToast("hadir", "Hadir", hadirCount)
////            }
////            v.findViewById<ImageButton>(R.id.button_izin)?.setOnClickListener {
////                navigateOrToast("izin", "Izin", izinCount)
////            }
////            v.findViewById<ImageButton>(R.id.button_sakit)?.setOnClickListener {
////                navigateOrToast("sakit", "Sakit", sakitCount)
////            }
////            v.findViewById<ImageButton>(R.id.button_alpha)?.setOnClickListener {
////                navigateOrToast("alpha", "Alpha", alphaCount)
////            }
////        } catch (e: Exception) {
////            Log.e(TAG, "setupKehadiranButtons error: ${e.message}", e)
////        }
////    }
////
////    private fun navigateOrToast(statusFilter: String, label: String, count: Int) {
////        if (!isAdded) return
////        try {
////            requireContext().startActivity(
////                Intent(requireContext(), RiwayatKehadiranGuruActivity::class.java).apply {
////                    putExtra("STATUS_FILTER", statusFilter)
////                }
////            )
////        } catch (e: Exception) {
////            Toast.makeText(requireContext(), "Siswa $label hari ini: $count orang", Toast.LENGTH_SHORT).show()
////        }
////    }
////
////    private fun showProfileMenu(view: View) {
////        try {
////            val popup = PopupMenu(requireContext(), view)
////            popup.menuInflater.inflate(R.menu.profile_simple, popup.menu)
////            popup.setOnMenuItemClickListener {
////                when (it.itemId) {
////                    R.id.menu_logout -> {
////                        showLogoutConfirmation()
////                        true
////                    }
////                    R.id.menu_cancel -> true
////                    else -> false
////                }
////            }
////            popup.show()
////        } catch (e: Exception) {
////            Log.e(TAG, "showProfileMenu error: ${e.message}", e)
////        }
////    }
////
////    private fun showLogoutConfirmation() {
////        if (!isAdded) return
////        android.app.AlertDialog.Builder(requireContext())
////            .setTitle("Logout Guru")
////            .setMessage("Yakin ingin logout dari akun guru?")
////            .setPositiveButton("Ya, Logout") { _, _ -> performLogout() }
////            .setNegativeButton("Batal", null)
////            .show()
////    }
////
////    private fun performLogout() {
////        val baseActivity = activity as? BaseNetworkActivity ?: return
////        lifecycleScope.launch {
////            try {
////                baseActivity.authRepository.logout()
////            } catch (e: Exception) {
////                Log.w(TAG, "Logout API gagal: ${e.message}")
////            }
////
////            try {
////                AppPreferences(requireContext()).clearAuth()
////            } catch (_: Exception) {
////            }
////
////            if (isAdded) {
////                requireActivity().startActivity(
////                    Intent(requireContext(), LoginAwal::class.java).apply {
////                        flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
////                    }
////                )
////                requireActivity().finish()
////            }
////        }
////    }
////
////    fun setNavigationCallback(callback: (String) -> Unit) {
////        navigationCallback = callback
////    }
////}
