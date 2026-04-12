package com.example.ritamesa

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageButton
import android.widget.TextView
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*
import java.util.Date
import java.util.TimeZone

class GuruNotifikasiFragment : Fragment() {

    private lateinit var rvHariIni: RecyclerView
    private lateinit var tvHariTanggal: TextView
    private lateinit var btnHome: ImageButton
    private lateinit var btnCalendar: ImageButton
    private lateinit var btnChart: ImageButton
    private lateinit var btnNotif: ImageButton
    private lateinit var adapterHariIni: NotifikasiAdapter
    private val dataHariIni = mutableListOf<Map<String, Any>>()

    private var navigationCallback: ((String) -> Unit)? = null

    companion object {
        fun newInstance() = GuruNotifikasiFragment()
    }

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View? {
        return inflater.inflate(R.layout.notifikasi_guru, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        initViews(view)
        setupFooterNavigation()
        setupRecyclerView()
        loadNotificationsFromApi()
        updateTanggalRealTime()
    }

    private fun initViews(view: View) {
        rvHariIni = view.findViewById(R.id.rvNotifHariIni)
        tvHariTanggal = view.findViewById(R.id.tvharitanggal)
        btnHome = view.findViewById(R.id.btnHome)
        btnCalendar = view.findViewById(R.id.btnCalendar)
        btnChart = view.findViewById(R.id.btnChart)
        btnNotif = view.findViewById(R.id.btnNotif)
    }

    private fun updateTanggalRealTime() {
        val calendar = Calendar.getInstance(TimeZone.getTimeZone("Asia/Jakarta"))
        val sdf = SimpleDateFormat("EEEE, dd MMMM yyyy", Locale.forLanguageTag("id-ID"))
        sdf.timeZone = TimeZone.getTimeZone("Asia/Jakarta")
        val formattedDate = sdf.format(calendar.time)
        tvHariTanggal.text = formattedDate[0].uppercaseChar() + formattedDate.substring(1)
    }

    private fun setupFooterNavigation() {
        btnHome.setOnClickListener {
            navigationCallback?.invoke("dashboard")
        }
        btnCalendar.setOnClickListener {
            navigationCallback?.invoke("riwayat")
        }
        btnChart.setOnClickListener {
            navigationCallback?.invoke("tindak_lanjut")
        }
        btnNotif.setOnClickListener {
            refreshNotifications()
        }
    }

    private fun refreshNotifications() {
        updateTanggalRealTime()
        loadNotificationsFromApi()
        Toast.makeText(requireContext(), "Notifikasi direfresh", Toast.LENGTH_SHORT).show()
    }

    private fun loadNotificationsFromApi() {
        lifecycleScope.launch {
            try {
                val activity = activity as? BaseNetworkActivity ?: return@launch
                val result = activity.administrationRepository.getMyNotifications()
                when (result) {
                    is com.example.ritamesa.api.Result.Success -> {
                        val notifications = result.data
                        dataHariIni.clear()
                        val headerDate = resolveHeaderDate(notifications)
                        tvHariTanggal.text = headerDate
                        dataHariIni.addAll(notifications.map { notif ->
                            val formattedTime = formatNotifTime(notif.createdAt)
                            mapOf<String, Any>(
                                "type" to (notif.type ?: "reminder"),
                                "message" to (notif.message ?: ""),
                                "detail" to (notif.title ?: notif.message ?: ""),
                                "time" to formattedTime,
                                "date" to headerDate
                            )
                        })
                        loadDataToAdapter()
                    }
                    is com.example.ritamesa.api.Result.Error -> {
                        val act = activity as? BaseNetworkActivity
                        act?.showError(result.message ?: "Gagal memuat notifikasi")
                    }
                    is com.example.ritamesa.api.Result.Loading -> {}
                }
            } catch (e: Exception) {
                val act = activity as? BaseNetworkActivity
                act?.showError("Error: ${e.message}")
            }
        }
    }

    private fun setupRecyclerView() {
        adapterHariIni = NotifikasiAdapter(dataHariIni, true)
        rvHariIni.layoutManager = LinearLayoutManager(requireContext())
        rvHariIni.adapter = adapterHariIni
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

    private fun loadDataToAdapter() {
        adapterHariIni.notifyDataSetChanged()
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



//package com.example.ritamesa
//
//import android.os.Bundle
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
//import java.util.*
//
//class GuruNotifikasiFragment : Fragment() {
//
//    private lateinit var rvHariIni: RecyclerView
//    private lateinit var tvHariTanggal: TextView
//    private lateinit var btnHome: ImageButton
//    private lateinit var btnCalendar: ImageButton
//    private lateinit var btnChart: ImageButton
//    private lateinit var btnNotif: ImageButton
//    private lateinit var adapterHariIni: NotifikasiAdapter
//    private val dataHariIni = mutableListOf<Map<String, Any>>()
//
//    private var navigationCallback: ((String) -> Unit)? = null
//
//    companion object {
//        fun newInstance() = GuruNotifikasiFragment()
//    }
//
//    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View? {
//        return inflater.inflate(R.layout.notifikasi_guru, container, false)
//    }
//
//    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
//        super.onViewCreated(view, savedInstanceState)
//
//        initViews(view)
//        setupFooterNavigation()
//        setupRecyclerView()
//        loadNotificationsFromApi()
//        updateTanggalRealTime()
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
//    private fun updateTanggalRealTime() {
//        val calendar = Calendar.getInstance(TimeZone.getTimeZone("Asia/Jakarta"))
//        val sdf = SimpleDateFormat("EEEE, dd MMMM yyyy", Locale.forLanguageTag("id-ID"))
//        sdf.timeZone = TimeZone.getTimeZone("Asia/Jakarta")
//        val formattedDate = sdf.format(calendar.time)
//        tvHariTanggal.text = formattedDate[0].uppercaseChar() + formattedDate.substring(1)
//    }
//
//    private fun setupFooterNavigation() {
//        btnHome.setOnClickListener {
//            navigationCallback?.invoke("dashboard")
//        }
//        btnCalendar.setOnClickListener {
//            navigationCallback?.invoke("riwayat")
//        }
//        btnChart.setOnClickListener {
//            navigationCallback?.invoke("tindak_lanjut")
//        }
//        btnNotif.setOnClickListener {
//            refreshNotifications()
//        }
//    }
//
//    private fun refreshNotifications() {
//        updateTanggalRealTime()
//        loadNotificationsFromApi()
//        Toast.makeText(requireContext(), "Notifikasi direfresh", Toast.LENGTH_SHORT).show()
//    }
//
//    private fun loadNotificationsFromApi() {
//        lifecycleScope.launch {
//            try {
//                val activity = activity as? BaseNetworkActivity ?: return@launch
//                val result = activity.administrationRepository.getMyNotifications()
//                when (result) {
//                    is com.example.ritamesa.api.Result.Success -> {
//                        val notifications = result.data
//                        dataHariIni.clear()
//                        dataHariIni.addAll(notifications.map { notif ->
//                            mapOf<String, Any>(
//                                "type" to (notif.type ?: "reminder"),
//                                "message" to (notif.message ?: ""),
//                                "detail" to (notif.title ?: ""),
//                                "time" to (notif.createdAt ?: "-"),
//                                "date" to getCurrentFormattedDate()
//                            )
//                        })
//                        loadDataToAdapter()
//                    }
//                    is com.example.ritamesa.api.Result.Error -> {
//                        val act = activity as? BaseNetworkActivity
//                        act?.showError(result.message ?: "Gagal memuat notifikasi")
//                    }
//                    is com.example.ritamesa.api.Result.Loading -> {}
//                }
//            } catch (e: Exception) {
//                val act = activity as? BaseNetworkActivity
//                act?.showError("Error: ${e.message}")
//            }
//        }
//    }
//
//    private fun setupRecyclerView() {
//        adapterHariIni = NotifikasiAdapter(dataHariIni, true)
//        rvHariIni.layoutManager = LinearLayoutManager(requireContext())
//        rvHariIni.adapter = adapterHariIni
//    }
//
//    private fun getCurrentFormattedDate(): String {
//        val calendar = Calendar.getInstance(TimeZone.getTimeZone("Asia/Jakarta"))
//        val dateFormat = SimpleDateFormat("dd MMMM yyyy", Locale.forLanguageTag("id-ID"))
//        dateFormat.timeZone = TimeZone.getTimeZone("Asia/Jakarta")
//        return dateFormat.format(calendar.time)
//    }
//
//    private fun loadDataToAdapter() {
//        adapterHariIni.notifyDataSetChanged()
//    }
//
//    fun setNavigationCallback(callback: (String) -> Unit) {
//        navigationCallback = callback
//    }
//
//    private fun handleResult(result: Any?, onSuccess: (List<Any>) -> Unit, onError: (Int, String?) -> Unit) {
//        @Suppress("UNCHECKED_CAST")
//        when (result) {
//            is com.example.ritamesa.api.Result.Success<*> -> {
//                val data = (result as com.example.ritamesa.api.Result.Success<List<*>>).data as List<Any>
//                onSuccess(data)
//            }
//            is com.example.ritamesa.api.Result.Error -> onError(0, result.message)
//            else -> onError(0, "Unknown error")
//        }
//    }
//}
