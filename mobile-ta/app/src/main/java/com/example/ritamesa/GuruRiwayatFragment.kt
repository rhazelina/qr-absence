package com.example.ritamesa

import android.app.DatePickerDialog
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageButton
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

class GuruRiwayatFragment : Fragment() {

    private lateinit var recyclerView: RecyclerView
    private lateinit var txtHadirCount: TextView
    private lateinit var txtSakitCount: TextView
    private lateinit var txtIzinCount: TextView
    private lateinit var txtAlphaCount: TextView
    private lateinit var txtFilterTanggal: TextView

    private lateinit var btnHadir: ImageButton
    private lateinit var btnSakit: ImageButton
    private lateinit var btnIzin: ImageButton
    private lateinit var btnAlpha: ImageButton
    private lateinit var iconCalendar: ImageView

    private lateinit var btnHome: ImageButton
    private lateinit var btnChart: ImageButton
    private lateinit var btnNotif: ImageButton

    private val allData = Collections.synchronizedList(mutableListOf<Map<String, Any>>())
    private val filteredData = Collections.synchronizedList(mutableListOf<Map<String, Any>>())
    private lateinit var adapter: SimpleGuruAdapter
    private var filterActive: String? = null
    private var dateFilterActive: Boolean = false

    private val handler = Handler(Looper.getMainLooper())
    private var isLoading = false
    private var selectedDate = Calendar.getInstance()

    private val textColorActive = android.graphics.Color.WHITE
    private val textColorNormal = android.graphics.Color.parseColor("#4B5563")

    private var navigationCallback: ((String) -> Unit)? = null

    companion object {
        private const val TAG = "RiwayatGuruFrag"
        private const val DATE_FORMAT = "dd-MM-yyyy"
        fun newInstance() = GuruRiwayatFragment()
    }

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View? {
        return inflater.inflate(R.layout.riwayat_kehadiran_guru_fix, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        if (!initializeViews(view)) {
            Toast.makeText(requireContext(), "Gagal memuat tampilan", Toast.LENGTH_LONG).show()
            return
        }

        setupRecyclerView()
        setupFooterNavigation()
        setupFilterButtons()
        setupCalendarButton()
        updateTanggalDisplay()
        resetTextColors()
        loadDataAsync()
    }

    private fun initializeViews(view: View): Boolean {
        return try {
            recyclerView = view.findViewById(R.id.recycler_riwayat)
            txtHadirCount = view.findViewById(R.id.txt_hadir_count)
            txtSakitCount = view.findViewById(R.id.txt_sakit_count)
            txtIzinCount = view.findViewById(R.id.txt_izin_count)
            txtAlphaCount = view.findViewById(R.id.txt_alpha_count)
            txtFilterTanggal = view.findViewById(R.id.text_filter_tanggal)
            btnHadir = view.findViewById(R.id.button_hadir)
            btnSakit = view.findViewById(R.id.button_sakit)
            btnIzin = view.findViewById(R.id.button_izin)
            btnAlpha = view.findViewById(R.id.button_alpha)
            iconCalendar = view.findViewById(R.id.icon_calendar)
            btnHome = view.findViewById(R.id.btnHome)
            btnChart = view.findViewById(R.id.btnChart)
            btnNotif = view.findViewById(R.id.btnNotif)
            true
        } catch (e: Exception) {
            Log.e(TAG, "Error initializeViews: ${e.message}")
            false
        }
    }

    private fun setupCalendarButton() {
        iconCalendar.setOnClickListener { showDatePicker() }
    }

    private fun showDatePicker() {
        val year = selectedDate.get(Calendar.YEAR)
        val month = selectedDate.get(Calendar.MONTH)
        val day = selectedDate.get(Calendar.DAY_OF_MONTH)

        DatePickerDialog(
            requireContext(),
            { _, selectedYear, selectedMonth, selectedDay ->
                selectedDate.set(selectedYear, selectedMonth, selectedDay)
                dateFilterActive = true
                updateTanggalDisplay()
                applyDateFilter()
                filterActive = null
                updateTombolAktif()
                resetTextColors()
            },
            year, month, day
        ).show()
    }

    private fun updateTanggalDisplay() {
        val sdf = SimpleDateFormat("EEEE, dd MMMM yyyy", Locale.forLanguageTag("id-ID"))
        val formatted = sdf.format(selectedDate.time)
        txtFilterTanggal.text = formatted[0].uppercaseChar() + formatted.substring(1)
    }

    private fun applyDateFilter() {
        if (isLoading) return
        isLoading = true

        Thread {
            try {
                val dateFormat = SimpleDateFormat(DATE_FORMAT, Locale.getDefault())
                val selectedDateStr = dateFormat.format(selectedDate.time)

                val tempFilteredData = allData.filter {
                    (it["tanggal"] as? String ?: "").contains(selectedDateStr)
                }

                handler.post {
                    filteredData.clear()
                    filteredData.addAll(tempFilteredData)

                    if (filterActive != null) {
                        applyFilter(filterActive!!)
                    } else {
                        adapter.notifyDataSetChanged()
                    }
                    updateAngkaTombol()
                    isLoading = false
                }
            } catch (e: Exception) {
                handler.post { isLoading = false }
            }
        }.start()
    }

    private fun setupRecyclerView() {
        adapter = SimpleGuruAdapter(requireContext(), filteredData)
        recyclerView.layoutManager = LinearLayoutManager(requireContext())
        recyclerView.adapter = adapter
    }

    private fun setupFooterNavigation() {
        btnHome.setOnClickListener {
            navigationCallback?.invoke("dashboard")
        }

        requireView().findViewById<ImageButton>(R.id.btnAssigment).setOnClickListener {
            filterActive = null
            dateFilterActive = false
            selectedDate = Calendar.getInstance()
            updateTanggalDisplay()
            resetFilter()
            updateTombolAktif()
            resetTextColors()
        }

        btnChart.setOnClickListener {
            navigationCallback?.invoke("tindak_lanjut")
        }

        btnNotif.setOnClickListener {
            navigationCallback?.invoke("notifikasi")
        }
    }

    private fun setupFilterButtons() {
        btnHadir.setOnClickListener { toggleFilter("hadir") }
        btnSakit.setOnClickListener { toggleFilter("sakit") }
        btnIzin.setOnClickListener { toggleFilter("izin") }
        btnAlpha.setOnClickListener { toggleFilter("alpha") }
    }

    private fun loadDataAsync() {
        isLoading = true
        lifecycleScope.launch {
            try {
                val activity = activity as? BaseNetworkActivity ?: return@launch
                val result = activity.attendanceRepository.getMyTeachingAttendance()
                when (result) {
                    is com.example.ritamesa.api.Result.Success -> {
                        val attendanceRecords = result.data
                        allData.clear()
                        filteredData.clear()
                        
                        attendanceRecords.forEachIndexed { index, record ->
                            val mapOfRecord: MutableMap<String, Any> = mutableMapOf<String, Any>().apply {
                                this["id"] = index
                                this["mapel"] = record.schedule?.subjectName ?: "-"
                                this["kelas"] = record.schedule?.className ?: "-"
                                this["status"] = record.status ?: "Hadir"
                                this["tanggal"] = record.schedule?.date ?: "-"
                                this["statusType"] = (record.status ?: "hadir").lowercase()
                            }
                            allData.add(mapOfRecord)
                        }

                        allData.sortByDescending { it["tanggal"] as? String ?: "" }

                        val todayStr = SimpleDateFormat(DATE_FORMAT, Locale.getDefault()).format(Date())
                        filteredData.addAll(allData.filter {
                            (it["tanggal"] as? String ?: "").contains(todayStr)
                        })

                        updateAngkaTombol()
                        adapter.notifyDataSetChanged()
                        isLoading = false
                    }
                    is com.example.ritamesa.api.Result.Error -> {
                        val act = activity as? BaseNetworkActivity
                        act?.showError(result.message ?: "Error loading data")
                        isLoading = false
                    }
                    is com.example.ritamesa.api.Result.Loading -> {}
                }
            } catch (e: Exception) {
                val act = activity as? BaseNetworkActivity
                act?.showError("Error: ${e.message}")
                isLoading = false
            }
        }
    }

    private fun toggleFilter(status: String) {
        if (filterActive == status) {
            filterActive = null
            resetFilter()
            resetTextColors()
        } else {
            filterActive = status
            applyFilter(status)
            updateTextColors(status)
        }
        updateTombolAktif()
    }

    private fun applyFilter(status: String) {
        filteredData.clear()

        if (dateFilterActive) {
            val dateFormat = SimpleDateFormat(DATE_FORMAT, Locale.getDefault())
            val selectedDateStr = dateFormat.format(selectedDate.time)

            filteredData.addAll(allData.filter {
                it["statusType"] == status &&
                        (it["tanggal"] as? String ?: "").contains(selectedDateStr)
            })
        } else {
            filteredData.addAll(allData.filter { it["statusType"] == status })
        }

        adapter.notifyDataSetChanged()
        updateAngkaTombol()
    }

    private fun resetFilter() {
        filteredData.clear()

        if (dateFilterActive) {
            val dateFormat = SimpleDateFormat(DATE_FORMAT, Locale.getDefault())
            val selectedDateStr = dateFormat.format(selectedDate.time)
            filteredData.addAll(allData.filter {
                (it["tanggal"] as? String ?: "").contains(selectedDateStr)
            })
        } else {
            filteredData.addAll(allData)
        }

        adapter.notifyDataSetChanged()
        updateAngkaTombol()
    }

    private fun updateTombolAktif() {
        btnHadir.setImageResource(R.drawable.btn_guru_hadir)
        btnSakit.setImageResource(R.drawable.btn_guru_sakit)
        btnIzin.setImageResource(R.drawable.btn_guru_izin)
        btnAlpha.setImageResource(R.drawable.btn_guru_alpha)

        when (filterActive) {
            "hadir" -> btnHadir.setImageResource(R.drawable.btn_guru_hadir_active)
            "sakit" -> btnSakit.setImageResource(R.drawable.btn_guru_sakit_active)
            "izin" -> btnIzin.setImageResource(R.drawable.btn_guru_izin_active)
            "alpha" -> btnAlpha.setImageResource(R.drawable.btn_guru_alpha_active)
        }
    }

    private fun updateTextColors(activeStatus: String) {
        resetTextColors()
        when (activeStatus) {
            "hadir" -> txtHadirCount.setTextColor(textColorActive)
            "sakit" -> txtSakitCount.setTextColor(textColorActive)
            "izin" -> txtIzinCount.setTextColor(textColorActive)
            "alpha" -> txtAlphaCount.setTextColor(textColorActive)
        }
    }

    private fun resetTextColors() {
        txtHadirCount.setTextColor(textColorNormal)
        txtSakitCount.setTextColor(textColorNormal)
        txtIzinCount.setTextColor(textColorNormal)
        txtAlphaCount.setTextColor(textColorNormal)
    }

    private fun updateAngkaTombol() {
        var hadir = 0; var sakit = 0; var izin = 0; var alpha = 0

        val dataToCount = if (dateFilterActive) {
            val dateFormat = SimpleDateFormat(DATE_FORMAT, Locale.getDefault())
            val selectedDateStr = dateFormat.format(selectedDate.time)
            allData.filter {
                (it["tanggal"] as? String ?: "").contains(selectedDateStr)
            }
        } else {
            allData
        }

        dataToCount.forEach {
            when (it["statusType"]) {
                "hadir" -> hadir++
                "sakit" -> sakit++
                "izin" -> izin++
                "alpha" -> alpha++
            }
        }

        txtHadirCount.text = hadir.toString()
        txtSakitCount.text = sakit.toString()
        txtIzinCount.text = izin.toString()
        txtAlphaCount.text = alpha.toString()
    }

    fun setNavigationCallback(callback: (String) -> Unit) {
        navigationCallback = callback
    }

    private fun handleResult(result: Any?, onSuccess: (List<Any>) -> Unit, onError: (Int, String?) -> Unit) {
        @Suppress("UNCHECKED_CAST")
        when (result) {
            is com.example.ritamesa.api.Result.Success<*> -> {
                val data = (result as com.example.ritamesa.api.Result.Success<List<*>>).data as List<Any>
                onSuccess(data)
            }
            is com.example.ritamesa.api.Result.Error -> onError(0, result.message)
            else -> onError(0, "Unknown error")
        }
    }
}
