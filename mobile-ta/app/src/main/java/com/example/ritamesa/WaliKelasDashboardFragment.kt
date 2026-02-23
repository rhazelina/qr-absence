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

class WaliKelasDashboardFragment : Fragment() {

    private lateinit var txtTanggalSekarang: TextView
    private lateinit var txtWaktuLive: TextView
    private lateinit var txtJamMasuk: TextView
    private lateinit var txtJamPulang: TextView
    private lateinit var txtTanggalDiJamLayout: TextView
    private lateinit var txtNominalSiswa: TextView
    private lateinit var txtHadirCount: TextView
    private lateinit var txtIzinCount: TextView
    private lateinit var txtSakitCount: TextView
    private lateinit var txtAlphaCount: TextView

    private val handler = Handler(Looper.getMainLooper())
    private lateinit var runnable: Runnable

    private var totalSiswa = 25
    private var hadirCount = 20
    private var izinCount = 2
    private var sakitCount = 1
    private var alphaCount = 2

    private lateinit var recyclerJadwal: RecyclerView
    private lateinit var recyclerRiwayat: RecyclerView
    
    private var navigationCallback: ((String) -> Unit)? = null

    companion object {
        fun newInstance() = WaliKelasDashboardFragment()
    }

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View? {
        return inflater.inflate(R.layout.dashboard_wali_kelas, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        initViews(view)
        setupDateTime()
        setupKehadiranData()
        setupRecyclerView()
        setupFooterNavigation()
        setupKehadiranButtons()

        view.findViewById<ImageButton>(R.id.profile).setOnClickListener { profileView ->
            showProfileMenu(profileView)
        }
    }

    private fun initViews(view: View) {
        txtTanggalSekarang = view.findViewById(R.id.txtTanggalSekarang)
        txtWaktuLive = view.findViewById(R.id.txtWaktuLive)
        txtJamMasuk = view.findViewById(R.id.txtJamMasuk)
        txtJamPulang = view.findViewById(R.id.txtJamPulang)
        txtTanggalDiJamLayout = view.findViewById(R.id.txtTanggalDiJamLayout)
        txtNominalSiswa = view.findViewById(R.id.nominal_siswa)
        txtHadirCount = view.findViewById(R.id.txt_hadir_count)
        txtIzinCount = view.findViewById(R.id.txt_izin_count)
        txtSakitCount = view.findViewById(R.id.txt_sakit_count)
        txtAlphaCount = view.findViewById(R.id.txt_alpha_count)
        recyclerJadwal = view.findViewById(R.id.recyclerJadwal)
        recyclerRiwayat = view.findViewById(R.id.recyclerJadwal1)
    }

    private fun showProfileMenu(view: View) {
        val popupMenu = PopupMenu(requireContext(), view)
        popupMenu.menuInflater.inflate(R.menu.profile_simple, popupMenu.menu)
        popupMenu.setOnMenuItemClickListener { menuItem ->
            when (menuItem.itemId) {
                R.id.menu_logout -> { showLogoutConfirmation(); true }
                R.id.menu_cancel -> { Toast.makeText(requireContext(), "Menu dibatalkan", Toast.LENGTH_SHORT).show(); true }
                else -> false
            }
        }
        popupMenu.show()
    }

    private fun showLogoutConfirmation() {
        android.app.AlertDialog.Builder(requireContext())
            .setTitle("Logout Wali Kelas")
            .setMessage("Yakin ingin logout?")
            .setPositiveButton("Ya, Logout") { _, _ -> performLogout() }
            .setNegativeButton("Batal", null)
            .show()
    }

    private fun performLogout() {
        val intent = Intent(requireContext(), LoginAwal::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        requireActivity().startActivity(intent)
        requireActivity().finish()
        Toast.makeText(requireContext(), "Logout berhasil", Toast.LENGTH_SHORT).show()
    }

    private fun setupDateTime() {
        val dateFormat = SimpleDateFormat("EEEE, d MMMM yyyy", Locale.forLanguageTag("id-ID"))
        val tanggalHariIni = dateFormat.format(Date())
        txtTanggalSekarang.text = tanggalHariIni.uppercase()
        txtTanggalDiJamLayout.text = tanggalHariIni.uppercase()
        txtJamMasuk.text = "07:00:00"
        txtJamPulang.text = "15:00:00"

        runnable = object : Runnable {
            override fun run() {
                val timeFormat = SimpleDateFormat("HH:mm", Locale.getDefault())
                timeFormat.timeZone = TimeZone.getTimeZone("Asia/Jakarta")
                txtWaktuLive.text = timeFormat.format(Date())
                handler.postDelayed(this, 1000)
            }
        }
        handler.post(runnable)
    }

    private fun setupKehadiranData() {
        lifecycleScope.launch {
            val activity = activity as? BaseNetworkActivity ?: return@launch
            val result = activity.dashboardRepository.getHomeroomDashboard()
            when (result) {
                is com.example.ritamesa.api.Result.Success -> {
                    val dashboard = result.data
                    val summary = dashboard.todaySummary
                    totalSiswa = summary?.totalStudents ?: 25
                    hadirCount = summary?.present ?: 0
                    izinCount = summary?.excused ?: 0
                    sakitCount = summary?.sick ?: 0
                    alphaCount = summary?.absent ?: 0
                    updateKehadiranDisplay()
                }
                is com.example.ritamesa.api.Result.Error -> {
                    val act = activity as? BaseNetworkActivity
                    act?.showError(result.message ?: "Gagal memuat dashboard")
                }
                else -> {}
            }
        }
    }

    private fun updateKehadiranDisplay() {
        txtNominalSiswa.text = totalSiswa.toString()
        txtHadirCount.text = hadirCount.toString()
        txtIzinCount.text = izinCount.toString()
        txtSakitCount.text = sakitCount.toString()
        txtAlphaCount.text = alphaCount.toString()
    }

    private fun setupRecyclerView() {
        lifecycleScope.launch {
            val activity = activity as? BaseNetworkActivity ?: return@launch
            val result = activity.teacherRepository.getMyHomeroomSchedules()
            when (result) {
                is com.example.ritamesa.api.Result.Success -> {
                    val schedules = result.data
                    val jadwalList = schedules.mapIndexed { index, schedule ->
                        DashboardGuruActivity.JadwalItem(
                            id = schedule.id ?: (index + 1),
                            mataPelajaran = schedule.subjectName ?: "",
                            waktuPelajaran = "Jam ke-${index + 1}",
                            kelas = schedule.`class`?.name ?: "",
                            jam = "${schedule.startTime ?: ""} - ${schedule.endTime ?: ""}",
                            idKelas = (schedule.`class`?.id ?: 0).toString(),
                            idMapel = (schedule.id ?: 0).toString()
                        )
                    }
                    val jadwalAdapter = JadwalAdapter(jadwalList) { jadwal ->
                        navigateToDetailJadwalWakel(jadwal)
                    }
                    recyclerJadwal.layoutManager = LinearLayoutManager(requireContext())
                    recyclerJadwal.adapter = jadwalAdapter
                }
                else -> {}
            }
        }
    }

    private fun navigateToDetailJadwalWakel(jadwal: DashboardGuruActivity.JadwalItem) {
        val intent = Intent(requireContext(), DetailJadwalWakelActivity::class.java).apply {
            putExtra("JADWAL_DATA", DashboardGuruActivity.JadwalData(
                mataPelajaran = jadwal.mataPelajaran,
                kelas = jadwal.kelas,
                jam = jadwal.jam,
                waktuPelajaran = jadwal.waktuPelajaran
            ))
        }
        requireContext().startActivity(intent)
    }

    private fun setupFooterNavigation() {
        val view = requireView()
        view.findViewById<ImageButton>(R.id.btnHome).setOnClickListener {
            refreshDashboard()
        }
        view.findViewById<ImageButton>(R.id.btnCalendar).setOnClickListener {
            navigationCallback?.invoke("riwayat")
        }
        view.findViewById<ImageButton>(R.id.btnChart).setOnClickListener {
            navigationCallback?.invoke("tindak_lanjut")
        }
        view.findViewById<ImageButton>(R.id.btnNotif).setOnClickListener {
            navigationCallback?.invoke("notifikasi")
        }
    }

    private fun setupKehadiranButtons() {
        val view = requireView()
        view.findViewById<ImageButton>(R.id.button_hadir).setOnClickListener {
            Toast.makeText(requireContext(), "Siswa hadir: $hadirCount", Toast.LENGTH_SHORT).show()
        }
        view.findViewById<ImageButton>(R.id.button_sakit).setOnClickListener {
            Toast.makeText(requireContext(), "Detail kehadiran", Toast.LENGTH_SHORT).show()
        }
        view.findViewById<ImageButton>(R.id.jumlah_siswa_wakel).setOnClickListener {
            Toast.makeText(requireContext(), "Total siswa: $totalSiswa", Toast.LENGTH_SHORT).show()
        }
    }

    private fun refreshDashboard() {
        setupKehadiranData()
        setupRecyclerView()
    }

    fun setNavigationCallback(callback: (String) -> Unit) {
        navigationCallback = callback
    }

    override fun onDestroy() {
        super.onDestroy()
        handler.removeCallbacks(runnable)
    }
}
