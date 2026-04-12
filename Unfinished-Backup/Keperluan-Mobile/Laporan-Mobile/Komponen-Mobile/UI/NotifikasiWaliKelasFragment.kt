package com.example.ritamesa

import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageButton
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale
import java.util.TimeZone

class NotifikasiWaliKelasFragment : Fragment() {

    private lateinit var rvHariIni: RecyclerView
    private lateinit var tvHariTanggal: TextView
    private lateinit var adapterHariIni: NotifikasiAdapter
    private val dataHariIni = mutableListOf<Map<String, Any>>()

    private lateinit var btnHome: ImageButton
    private lateinit var btnCalendar: ImageButton
    private lateinit var btnChart: ImageButton
    private lateinit var btnNotif: ImageButton

    private var navigationCallback: ((String) -> Unit)? = null

    companion object {
        fun newInstance() = NotifikasiWaliKelasFragment()
    }

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View? {
        return inflater.inflate(R.layout.notifikasi_guru, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        initViews(view)
        setupRecyclerView()
        setupFooterNavigation()
        updateTanggalRealTime()
        loadNotifications()
    }

    private fun initViews(view: View) {
        rvHariIni = view.findViewById(R.id.rvNotifHariIni)
        tvHariTanggal = view.findViewById(R.id.tvharitanggal)
        btnHome = view.findViewById(R.id.btnHome)
        btnCalendar = view.findViewById(R.id.btnCalendar)
        btnChart = view.findViewById(R.id.btnChart)
        btnNotif = view.findViewById(R.id.btnNotif)
    }

    private fun setupRecyclerView() {
        adapterHariIni = NotifikasiAdapter(dataHariIni, false) // false for wali kelas/guru
        rvHariIni.layoutManager = LinearLayoutManager(requireContext())
        rvHariIni.adapter = adapterHariIni
    }

    private fun setupFooterNavigation() {
        btnHome.setOnClickListener { navigationCallback?.invoke("dashboard") }
        btnCalendar.setOnClickListener { navigationCallback?.invoke("riwayat") }
        btnChart.setOnClickListener { navigationCallback?.invoke("tindak_lanjut") }
        btnNotif.setOnClickListener { loadNotifications() }
    }

    private fun updateTanggalRealTime() {
        try {
            val calendar = Calendar.getInstance(TimeZone.getTimeZone("Asia/Jakarta"))
            val sdf = SimpleDateFormat("EEEE, dd MMMM yyyy", Locale("id", "ID"))
            sdf.timeZone = TimeZone.getTimeZone("Asia/Jakarta")
            tvHariTanggal.text = sdf.format(calendar.time)
        } catch (e: Exception) {
            tvHariTanggal.text = "-"
        }
    }

    private fun loadNotifications() {
        lifecycleScope.launch {
            try {
                val act = activity as? BaseNetworkActivity ?: return@launch
                val result = act.administrationRepository.getMyNotifications()
                act.handleResult(result, { notifications ->
                    dataHariIni.clear()
                    val headerDate = resolveHeaderDate(notifications)
                    tvHariTanggal.text = headerDate

                    dataHariIni.addAll(notifications.map { notif ->
                        val formattedTime = formatNotifTime(notif.createdAt)
                        mapOf(
                            "type" to (notif.type ?: "reminder"),
                            "message" to (notif.message ?: ""),
                            "detail" to (notif.title ?: notif.message ?: ""),
                            "time" to formattedTime,
                            "date" to headerDate
                        )
                    })
                    adapterHariIni.notifyDataSetChanged()
                }, { _, msg ->
                    act.showError(msg ?: "Gagal memuat notifikasi")
                })
            } catch (e: Exception) {
                Log.e("NotifWakelFrag", "Error: ${e.message}")
            }
        }
    }

    private fun resolveHeaderDate(notifications: List<com.example.ritamesa.api.models.MobileNotification>): String {
        val localeId = Locale("id", "ID")
        val output = SimpleDateFormat("EEEE, dd MMMM yyyy", localeId)
        output.timeZone = TimeZone.getTimeZone("Asia/Jakarta")

        val createdAt = notifications.firstOrNull()?.createdAt
        val parsed = parseIsoDate(createdAt)
        val date = parsed ?: Date()
        val formatted = output.format(date)
        return formatted.replaceFirstChar { if (it.isLowerCase()) it.titlecase(localeId) else it.toString() }
    }

    private fun formatNotifTime(createdAt: String?): String {
        val parsed = parseIsoDate(createdAt) ?: return "-"
        val out = SimpleDateFormat("HH:mm", Locale.getDefault())
        out.timeZone = TimeZone.getTimeZone("Asia/Jakarta")
        return out.format(parsed)
    }

    private fun parseIsoDate(raw: String?): Date? {
        if (raw.isNullOrBlank()) return null
        val formats = listOf(
            "yyyy-MM-dd'T'HH:mm:ssXXX",
            "yyyy-MM-dd'T'HH:mm:ss.SSSXXX",
            "yyyy-MM-dd HH:mm:ss",
            "yyyy-MM-dd"
        )
        for (pattern in formats) {
            try {
                val sdf = SimpleDateFormat(pattern, Locale.US)
                sdf.timeZone = TimeZone.getTimeZone("Asia/Jakarta")
                val parsed = sdf.parse(raw)
                if (parsed != null) return parsed
            } catch (_: Exception) { }
        }
        return null
    }

    fun setNavigationCallback(callback: (String) -> Unit) {
        navigationCallback = callback
    }
}



//package com.example.ritamesa
//
//import android.os.Bundle
//import android.util.Log
//import android.view.LayoutInflater
//import android.view.View
//import android.view.ViewGroup
//import android.widget.ImageButton
//import android.widget.TextView
//import android.widget.Toast
//import androidx.fragment.app.Fragment
//import androidx.lifecycle.lifecycleScope
//import androidx.recyclerview.widget.LinearLayoutManager
//import androidx.recyclerview.widget.RecyclerView
//import kotlinx.coroutines.launch
//import java.text.SimpleDateFormat
//import java.util.Calendar
//import java.util.Locale
//import java.util.TimeZone
//
//class NotifikasiWaliKelasFragment : Fragment() {
//
//    private lateinit var rvHariIni: RecyclerView
//    private lateinit var tvHariTanggal: TextView
//    private lateinit var adapterHariIni: NotifikasiAdapter
//    private val dataHariIni = mutableListOf<Map<String, Any>>()
//
//    private lateinit var btnHome: ImageButton
//    private lateinit var btnCalendar: ImageButton
//    private lateinit var btnChart: ImageButton
//    private lateinit var btnNotif: ImageButton
//
//    private var navigationCallback: ((String) -> Unit)? = null
//
//    companion object {
//        fun newInstance() = NotifikasiWaliKelasFragment()
//    }
//
//    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View? {
//        return inflater.inflate(R.layout.notifikasi_guru, container, false)
//    }
//
//    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
//        super.onViewCreated(view, savedInstanceState)
//        initViews(view)
//        setupRecyclerView()
//        setupFooterNavigation()
//        updateTanggalRealTime()
//        loadNotifications()
//    }
//
//    private fun initViews(view: View) {
//        rvHariIni = view.findViewById(R.id.rvNotifHariIni)
//        tvHariTanggal = view.findViewById(R.id.tvharitanggal)
//        btnHome = view.findViewById(R.id.btnHome)
//        btnCalendar = view.findViewById(R.id.btnCalendar)
//        btnChart = view.findViewById(R.id.btnChart)
//        btnNotif = view.findViewById(R.id.btnNotif)
//    }
//
//    private fun setupRecyclerView() {
//        adapterHariIni = NotifikasiAdapter(dataHariIni, false) // false for wali kelas/guru
//        rvHariIni.layoutManager = LinearLayoutManager(requireContext())
//        rvHariIni.adapter = adapterHariIni
//    }
//
//    private fun setupFooterNavigation() {
//        btnHome.setOnClickListener { navigationCallback?.invoke("dashboard") }
//        btnCalendar.setOnClickListener { navigationCallback?.invoke("riwayat") }
//        btnChart.setOnClickListener { navigationCallback?.invoke("tindak_lanjut") }
//        btnNotif.setOnClickListener { loadNotifications() }
//    }
//
//    private fun updateTanggalRealTime() {
//        try {
//            val calendar = Calendar.getInstance(TimeZone.getTimeZone("Asia/Jakarta"))
//            val sdf = SimpleDateFormat("EEEE, dd MMMM yyyy", Locale("id", "ID"))
//            sdf.timeZone = TimeZone.getTimeZone("Asia/Jakarta")
//            tvHariTanggal.text = sdf.format(calendar.time)
//        } catch (e: Exception) {
//            tvHariTanggal.text = "-"
//        }
//    }
//
//    private fun loadNotifications() {
//        lifecycleScope.launch {
//            try {
//                val act = activity as? BaseNetworkActivity ?: return@launch
//                val result = act.administrationRepository.getMyNotifications()
//                act.handleResult(result, { notifications ->
//                    dataHariIni.clear()
//                    dataHariIni.addAll(notifications.map { notif ->
//                        mapOf(
//                            "type" to (notif.type ?: "reminder"),
//                            "message" to (notif.message ?: ""),
//                            "detail" to (notif.title ?: ""),
//                            "time" to (notif.createdAt ?: "-"),
//                            "date" to SimpleDateFormat("dd MMMM yyyy", Locale("id", "ID")).format(Calendar.getInstance().time)
//                        )
//                    })
//                    adapterHariIni.notifyDataSetChanged()
//                }, { _, msg ->
//                    act.showError(msg ?: "Gagal memuat notifikasi")
//                })
//            } catch (e: Exception) {
//                Log.e("NotifWakelFrag", "Error: ${e.message}")
//            }
//        }
//    }
//
//    fun setNavigationCallback(callback: (String) -> Unit) {
//        navigationCallback = callback
//    }
//}
