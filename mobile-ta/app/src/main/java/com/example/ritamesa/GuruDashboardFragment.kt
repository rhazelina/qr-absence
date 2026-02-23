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
import java.util.concurrent.Executors

class GuruDashboardFragment : Fragment() {

    companion object {
        private const val TAG = "DashboardGuruFrag"
        fun newInstance() = GuruDashboardFragment()
    }

    private lateinit var txtTanggalSekarang: TextView
    private lateinit var txtWaktuLive: TextView
    private lateinit var txtJamMasuk: TextView
    private lateinit var txtJamPulang: TextView
    private lateinit var txtTanggalDiJamLayout: TextView
    private lateinit var txtHadirCount: TextView
    private lateinit var txtIzinCount: TextView
    private lateinit var txtSakitCount: TextView
    private lateinit var txtAlphaCount: TextView
    private lateinit var recyclerJadwal: RecyclerView

    private val handler = Handler(Looper.getMainLooper())
    private lateinit var runnable: Runnable
    private val jadwalHariIni = mutableListOf<DashboardGuruActivity.JadwalItem>()

    private val jamMasukDatabase = "07:00:00"
    private val jamPulangDatabase = "15:00:00"

    private var hadirCount = 0
    private var izinCount = 0
    private var sakitCount = 0
    private var alphaCount = 0

    private val executor = Executors.newSingleThreadScheduledExecutor()
    private var navigationCallback: ((String) -> Unit)? = null

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View? {
        return inflater.inflate(R.layout.dashboard_guru, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        initViews(view)
        setupDateTime()
        setupKehadiran()
        setupRecyclerView()
        setupFooterNavigation()
        setupKehadiranButtons()
    }

    private fun initViews(view: View) {
        try {
            txtTanggalSekarang = view.findViewById(R.id.txtTanggalSekarang)
            txtWaktuLive = view.findViewById(R.id.txtWaktuLive)
            txtJamMasuk = view.findViewById(R.id.txtJamMasuk)
            txtJamPulang = view.findViewById(R.id.txtJamPulang)
            txtTanggalDiJamLayout = view.findViewById(R.id.txtTanggalDiJamLayout)
            txtHadirCount = view.findViewById(R.id.txt_hadir_count)
            txtIzinCount = view.findViewById(R.id.txt_izin_count)
            txtSakitCount = view.findViewById(R.id.txt_sakit_count)
            txtAlphaCount = view.findViewById(R.id.txt_alpha_count)
            recyclerJadwal = view.findViewById(R.id.recyclerJadwal)

            view.findViewById<ImageButton>(R.id.profile).setOnClickListener { profileView ->
                showProfileMenu(profileView)
            }
        } catch (e: Exception) {
            Toast.makeText(requireContext(), "Error initViews: ${e.message}", Toast.LENGTH_LONG).show()
            e.printStackTrace()
        }
    }

    private fun showProfileMenu(view: View) {
        val popupMenu = PopupMenu(requireContext(), view)
        popupMenu.menuInflater.inflate(R.menu.profile_simple, popupMenu.menu)

        popupMenu.setOnMenuItemClickListener { menuItem ->
            when (menuItem.itemId) {
                R.id.menu_logout -> {
                    showLogoutConfirmation()
                    true
                }
                R.id.menu_cancel -> {
                    Toast.makeText(requireContext(), "Menu dibatalkan", Toast.LENGTH_SHORT).show()
                    true
                }
                else -> false
            }
        }

        popupMenu.show()
    }

    private fun showLogoutConfirmation() {
        android.app.AlertDialog.Builder(requireContext())
            .setTitle("Logout Guru")
            .setMessage("Yakin ingin logout dari akun guru?")
            .setPositiveButton("Ya, Logout") { _, _ ->
                performLogout()
            }
            .setNegativeButton("Batal", null)
            .show()
    }

    private fun performLogout() {
        val intent = Intent(requireContext(), LoginAwal::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        requireActivity().startActivity(intent)
        requireActivity().finish()
        Toast.makeText(requireContext(), "Logout guru berhasil", Toast.LENGTH_SHORT).show()
    }

    private fun setupDateTime() {
        try {
            val dateFormat = SimpleDateFormat("EEEE, d MMMM yyyy", Locale.forLanguageTag("id-ID"))
            val currentDate = Date()
            val tanggalHariIni = dateFormat.format(currentDate)

            txtTanggalSekarang.text = tanggalHariIni
            txtTanggalDiJamLayout.text = tanggalHariIni
            txtJamMasuk.text = jamMasukDatabase
            txtJamPulang.text = jamPulangDatabase

            runnable = object : Runnable {
                override fun run() {
                    val timeFormat = SimpleDateFormat("HH:mm", Locale.getDefault())
                    timeFormat.timeZone = TimeZone.getTimeZone("Asia/Jakarta")
                    val currentTime = timeFormat.format(Date())
                    txtWaktuLive.text = currentTime
                    handler.postDelayed(this, 1000)
                }
            }

            handler.post(runnable)
        } catch (e: Exception) {
            Toast.makeText(requireContext(), "Error setupDateTime: ${e.message}", Toast.LENGTH_LONG).show()
        }
    }

    private fun setupKehadiran() {
        lifecycleScope.launch {
            val activity = activity as? BaseNetworkActivity ?: return@launch
            val result = activity.dashboardRepository.getTeacherDashboard()
            
            when (result) {
                is com.example.ritamesa.api.Result.Success -> {
                    val dashboard = result.data
                    Log.d(TAG, "Teacher dashboard loaded: $dashboard")
                    
                    val stats = dashboard.todayStatistics
                    hadirCount = stats?.totalStudentsPresent ?: 0
                    alphaCount = stats?.totalStudentsAbsent ?: 0
                    sakitCount = 0
                    izinCount = 0
                    
                    updateKehadiranCount()
                    
                    if (!dashboard.todaySchedules.isNullOrEmpty()) {
                        jadwalHariIni.clear()
                        jadwalHariIni.addAll(dashboard.todaySchedules.mapIndexed { index, schedule ->
                            DashboardGuruActivity.JadwalItem(
                                id = schedule.id ?: (index + 1),
                                mataPelajaran = schedule.subjectName ?: "",
                                waktuPelajaran = "Mapel ${index + 1}",
                                kelas = schedule.`class`?.name ?: "",
                                jam = "${schedule.startTime ?: ""} - ${schedule.endTime ?: ""}",
                                idKelas = (schedule.`class`?.id ?: 0).toString(),
                                idMapel = (schedule.id ?: 0).toString()
                            )
                        })
                        recyclerJadwal.adapter?.notifyDataSetChanged()
                    }
                }
                is com.example.ritamesa.api.Result.Error -> {
                    Log.e(TAG, "Failed to load teacher dashboard: ${result.message}")
                    hadirCount = 0
                    izinCount = 0
                    sakitCount = 0
                    alphaCount = 0
                    updateKehadiranCount()
                }
                is com.example.ritamesa.api.Result.Loading -> {}
            }
        }
    }

    private fun updateKehadiranCount() {
        try {
            txtHadirCount.text = hadirCount.toString()
            txtIzinCount.text = izinCount.toString()
            txtSakitCount.text = sakitCount.toString()
            txtAlphaCount.text = alphaCount.toString()
        } catch (e: Exception) {}
    }

    private fun setupRecyclerView() {
        try {
            jadwalHariIni.clear()

            val jadwalAdapter = JadwalAdapter(jadwalHariIni) { jadwal ->
                navigateToDetailJadwalGuru(jadwal)
            }

            recyclerJadwal.layoutManager = LinearLayoutManager(requireContext()).apply {
                orientation = LinearLayoutManager.VERTICAL
            }

            recyclerJadwal.adapter = jadwalAdapter
            recyclerJadwal.setHasFixedSize(true)

            loadTeacherSchedules()
        } catch (e: Exception) {
            Toast.makeText(requireContext(), "Error setupRecyclerView: ${e.message}", Toast.LENGTH_LONG).show()
            e.printStackTrace()
        }
    }

    private fun loadTeacherSchedules() {
        lifecycleScope.launch {
            val activity = activity as? BaseNetworkActivity ?: return@launch
            val result = activity.scheduleRepository.getMySchedules()
            when (result) {
                is com.example.ritamesa.api.Result.Success -> {
                    val schedules = result.data
                    jadwalHariIni.clear()
                    jadwalHariIni.addAll(schedules.mapIndexed { index, schedule ->
                        DashboardGuruActivity.JadwalItem(
                            id = schedule.id ?: (index + 1),
                            mataPelajaran = schedule.subjectName ?: "",
                            waktuPelajaran = "Mapel ${index + 1}",
                            kelas = schedule.`class`?.name ?: "",
                            jam = "${schedule.startTime ?: ""} - ${schedule.endTime ?: ""}",
                            idKelas = (schedule.`class`?.id ?: 0).toString(),
                            idMapel = (schedule.id ?: 0).toString()
                        )
                    })
                    recyclerJadwal.adapter?.notifyDataSetChanged()
                }
                is com.example.ritamesa.api.Result.Error -> {
                    Log.e(TAG, "Failed to load schedules: ${result.message}")
                }
                is com.example.ritamesa.api.Result.Loading -> {}
            }
        }
    }

    private fun navigateToDetailJadwalGuru(jadwal: DashboardGuruActivity.JadwalItem) {
        try {
            val intent = Intent(requireContext(), DetailJadwalGuruActivity::class.java).apply {
                putExtra("JADWAL_DATA", DashboardGuruActivity.JadwalData(
                    mataPelajaran = jadwal.mataPelajaran,
                    kelas = jadwal.kelas,
                    jam = jadwal.jam,
                    waktuPelajaran = jadwal.waktuPelajaran
                ))
            }
            requireContext().startActivity(intent)
            Toast.makeText(requireContext(), "Membuka detail: ${jadwal.mataPelajaran}", Toast.LENGTH_SHORT).show()
        } catch (e: Exception) {
            Toast.makeText(requireContext(), "Error navigate: ${e.message}", Toast.LENGTH_LONG).show()
        }
    }

    private fun setupFooterNavigation() {
        try {
            val view = requireView()
            val btnHome: ImageButton = view.findViewById(R.id.btnHome)
            val btnCalendar: ImageButton = view.findViewById(R.id.btnCalendar)
            val btnChart: ImageButton = view.findViewById(R.id.btnChart)
            val btnNotif: ImageButton = view.findViewById(R.id.btnNotif)

            btnHome.setOnClickListener {
                refreshDashboard()
                Toast.makeText(requireContext(), "Dashboard Guru direfresh", Toast.LENGTH_SHORT).show()
            }

            btnCalendar.setOnClickListener {
                navigationCallback?.invoke("riwayat")
            }

            btnChart.setOnClickListener {
                navigationCallback?.invoke("tindak_lanjut")
            }

            btnNotif.setOnClickListener {
                navigationCallback?.invoke("notifikasi")
            }
        } catch (e: Exception) {
            Toast.makeText(requireContext(), "Error footer nav: ${e.message}", Toast.LENGTH_LONG).show()
        }
    }

    private fun setupKehadiranButtons() {
        try {
            val view = requireView()
            val btnHadir: ImageButton = view.findViewById(R.id.button_hadir)
            val btnIzin: ImageButton = view.findViewById(R.id.button_izin)
            val btnSakit: ImageButton = view.findViewById(R.id.button_sakit)
            val btnAlpha: ImageButton = view.findViewById(R.id.button_alpha)

            btnHadir.setOnClickListener {
                Toast.makeText(requireContext(), "Lihat siswa Hadir", Toast.LENGTH_SHORT).show()
            }

            btnIzin.setOnClickListener {
                Toast.makeText(requireContext(), "Lihat siswa Izin", Toast.LENGTH_SHORT).show()
            }

            btnSakit.setOnClickListener {
                Toast.makeText(requireContext(), "Lihat siswa Sakit", Toast.LENGTH_SHORT).show()
            }

            btnAlpha.setOnClickListener {
                Toast.makeText(requireContext(), "Lihat siswa Alpha", Toast.LENGTH_SHORT).show()
            }
        } catch (e: Exception) {
            Toast.makeText(requireContext(), "Error kehadiran buttons: ${e.message}", Toast.LENGTH_LONG).show()
        }
    }

    private fun refreshDashboard() {
        setupKehadiran()
        loadTeacherSchedules()
    }

    fun setNavigationCallback(callback: (String) -> Unit) {
        navigationCallback = callback
    }

    override fun onDestroy() {
        super.onDestroy()
        handler.removeCallbacks(runnable)
        executor.shutdownNow()
    }
}
