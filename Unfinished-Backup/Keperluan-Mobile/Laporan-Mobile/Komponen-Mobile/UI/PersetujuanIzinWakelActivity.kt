package com.example.ritamesa

import android.app.Dialog
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.util.Log
import android.view.Window
import android.widget.Button
import android.widget.EditText
import android.widget.ImageButton
import android.widget.TextView
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.ritamesa.api.models.UpdateLeavePermissionRequest
import kotlinx.coroutines.launch

class PersetujuanIzinWakelActivity : BaseNetworkActivity() {

    private lateinit var rvIzinSakit: RecyclerView
    private lateinit var etSearchSiswa: EditText
    private lateinit var btnBack: ImageButton
    private lateinit var btnSemua: Button
    private lateinit var btnMenunggu: Button
    private lateinit var btnDisetujui: Button
    private lateinit var btnDitolak: Button

    private var allIzinSakitList = mutableListOf<Dispensasi>() // Reusing Dispensasi model
    private var filteredList = mutableListOf<Dispensasi>()
    private var currentFilter: StatusDispensasi? = null

    companion object {
        private const val TAG = "PersetujuanIzinWakel"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_persetujuan_izin_wakel)

        setupEdgeToEdge()
        initViews()
        setupListeners()
        setupRecyclerView()
        loadData()
    }

    private fun setupEdgeToEdge() {
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }
    }

    private fun initViews() {
        rvIzinSakit = findViewById(R.id.rvIzinSakit)
        etSearchSiswa = findViewById(R.id.etSearchSiswa)
        btnBack = findViewById(R.id.btnBack)
        btnSemua = findViewById(R.id.buttonSemua)
        btnMenunggu = findViewById(R.id.buttonMenunggu)
        btnDisetujui = findViewById(R.id.buttonDisetujui)
        btnDitolak = findViewById(R.id.buttonDitolak)
    }

    private fun setupListeners() {
        btnBack.setOnClickListener { finish() }

        btnSemua.setOnClickListener { updateFilter(null, it as Button) }
        btnMenunggu.setOnClickListener { updateFilter(StatusDispensasi.MENUNGGU, it as Button) }
        btnDisetujui.setOnClickListener { updateFilter(StatusDispensasi.DISETUJUI, it as Button) }
        btnDitolak.setOnClickListener { updateFilter(StatusDispensasi.DITOLAK, it as Button) }

        etSearchSiswa.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) { applyFilters() }
        })
    }

    private fun updateFilter(status: StatusDispensasi?, button: Button) {
        currentFilter = status
        highlightButton(button)
        applyFilters()
    }

    private fun highlightButton(selected: Button) {
        val buttons = listOf(btnSemua, btnMenunggu, btnDisetujui, btnDitolak)
        buttons.forEach {
            it.setBackgroundResource(R.drawable.button_filter_unselected)
            it.setTextColor(Color.BLACK)
        }
        selected.setBackgroundResource(R.drawable.button_filter_selected)
        selected.setTextColor(Color.WHITE)
    }

    private fun setupRecyclerView() {
        rvIzinSakit.layoutManager = LinearLayoutManager(this)
        // I'll create a specialized adapter for this activity later,
        // for now reusing DispensasiAdapter or common logic
    }

    private fun loadData() {
        lifecycleScope.launch {
            try {
                val prefs = AppPreferences(this@PersetujuanIzinWakelActivity)
                val classIdStr = prefs.getHomeroomClassIdSync()
                val classId = classIdStr?.toIntOrNull()

                if (classId == null || classId <= 0) {
                    showError("ID Kelas Wali tidak ditemukan")
                    return@launch
                }

                val result = teacherRepository.getClassLeavePermissions(classId)
                handleResult(result,
                    onSuccess = { permissions ->
                        allIzinSakitList.clear()
                        allIzinSakitList.addAll(permissions.map { p ->
                            Dispensasi(
                                id = p.id ?: -1,
                                namaSiswa = p.student?.name ?: "-",
                                kelas = p.studentClass?.name ?: "-",
                                mataPelajaran = p.reason ?: "-", // Using reason as label for preview
                                hari = "-",
                                tanggal = p.createdAt?.take(10) ?: "-",
                                jamKe = "${p.startTime ?: ""} - ${p.endTime ?: ""}",
                                guruPengajar = "-",
                                catatan = "[${p.type ?: "izin"}] ${p.reason ?: "-"}",
                                status = when(p.status?.lowercase()) {
                                    "approved" -> StatusDispensasi.DISETUJUI
                                    "rejected" -> StatusDispensasi.DITOLAK
                                    else -> StatusDispensasi.MENUNGGU
                                },
                                studentId = p.student?.id ?: -1
                            )
                        })
                        applyFilters()
                    },
                    onError = { _, msg ->
                        showError(msg ?: "Gagal memuat data")
                    }
                )
            } catch (e: Exception) {
                Log.e(TAG, "loadData error: ${e.message}")
            }
        }
    }

    private fun applyFilters() {
        val query = etSearchSiswa.text.toString().lowercase()
        filteredList.clear()
        filteredList.addAll(allIzinSakitList.filter { item ->
            val statusMatch = currentFilter == null || item.status == currentFilter
            val queryMatch = item.namaSiswa.lowercase().contains(query)
            statusMatch && queryMatch
        })

        // Setup or update adapter
        if (rvIzinSakit.adapter == null) {
            rvIzinSakit.adapter = IzinSakitAdapter(filteredList) { showDetailDialog(it) }
        } else {
            (rvIzinSakit.adapter as? IzinSakitAdapter)?.updateList(filteredList)
        }
    }

    private fun showDetailDialog(item: Dispensasi) {
        val dialog = Dialog(this)
        dialog.requestWindowFeature(Window.FEATURE_NO_TITLE)
        dialog.setContentView(R.layout.detail_persetujuan_dispensasi)
        dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))

        // Simple data binding
        dialog.findViewById<TextView>(R.id.textView)?.text = item.namaSiswa
        dialog.findViewById<TextView>(R.id.textView20)?.text = item.kelas
        dialog.findViewById<TextView>(R.id.textView24)?.text = item.catatan
        dialog.findViewById<TextView>(R.id.textView19)?.text = item.jamKe
        dialog.findViewById<TextView>(R.id.textView3)?.text = item.tanggal

        val btnApprove = dialog.findViewById<Button>(R.id.button)
        val btnReject = dialog.findViewById<Button>(R.id.button6)

        if (item.status != StatusDispensasi.MENUNGGU) {
            btnApprove?.visibility = android.view.View.GONE
            btnReject?.visibility = android.view.View.GONE
        }

        btnApprove?.setOnClickListener {
            updateStatus(item, "approved", dialog)
        }
        btnReject?.setOnClickListener {
            updateStatus(item, "rejected", dialog)
        }

        dialog.show()
    }

    private fun updateStatus(item: Dispensasi, status: String, dialog: Dialog) {
        lifecycleScope.launch {
            try {
                val request = UpdateLeavePermissionRequest(status = status)
                val result = leavePermissionRepository.updateLeavePermission(item.id, request)
                handleResult(result,
                    onSuccess = {
                        showSuccess("Status berhasil diperbarui")
                        dialog.dismiss()
                        loadData()
                    },
                    onError = { _, msg ->
                        showError(msg ?: "Gagal memperbarui status")
                    }
                )
            } catch (e: Exception) {
                showError("Error: ${e.message}")
            }
        }
    }
}
