package com.example.ritamesa

import android.app.AlertDialog
import android.app.DatePickerDialog
import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.EditText
import android.widget.ImageButton
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.Spinner
import android.widget.TextView
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.asRequestBody
import kotlinx.coroutines.launch
import java.io.File
import java.io.FileOutputStream
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale

class RiwayatKehadiranKelasFragment : Fragment() {

    private lateinit var recyclerView: RecyclerView
    private lateinit var txtJumlahSiswa: TextView
    private lateinit var txtHadirCount: TextView
    private lateinit var txtSakitCount: TextView
    private lateinit var txtIzinCount: TextView
    private lateinit var txtAlphaCount: TextView
    private lateinit var txtFilterTanggal: TextView
    private lateinit var adapter: SimpleSiswaAdapter
    private lateinit var btnHadir: ImageButton
    private lateinit var btnSakit: ImageButton
    private lateinit var btnIzin: ImageButton
    private lateinit var btnAlpha: ImageButton
    private lateinit var iconCalendar: ImageView

    private val allData = mutableListOf<Map<String, Any>>()
    private val filteredData = mutableListOf<Map<String, Any>>()
    private var filterActive: String? = null
    private var selectedDate: String = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
    private var navigationCallback: ((String) -> Unit)? = null
    private var selectedAttachmentUri: Uri? = null
    private var currentAttachmentNameView: TextView? = null

    private val filePickerLauncher = registerForActivityResult(
        ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        selectedAttachmentUri = uri
        currentAttachmentNameView?.text = if (uri != null) getFileName(uri) else "Masukkan Bukti Surat"
    }

    companion object {
        private const val TAG = "RiwayatKehadiranFrag"
        fun newInstance() = RiwayatKehadiranKelasFragment()
    }

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View? {
        // PERBAIKAN: Meng-inflate layout khusus Wali Kelas, BUKAN layout pengurus/siswa
        return inflater.inflate(R.layout.riwayat_kehadiran_kelas, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        initViews(view)
        setupRecyclerView()
        setupFooterNavigation(view)
        setupFilterButtons()
        setupCalendarPicker()
        updateTanggalDisplay()
        loadTotalStudents()
        loadAttendanceData()
    }

    private fun initViews(view: View) {
        recyclerView = view.findViewById(R.id.recycler_riwayat)
        txtJumlahSiswa = view.findViewById(R.id.text_jumlah_siswa)
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
    }

    private fun setupRecyclerView() {
        adapter = SimpleSiswaAdapter(
            requireContext(),
            filteredData,
            onMarkPresent = { item -> updateAttendanceStatus(item, "present") },
            onMarkAbsent = { item -> updateAttendanceStatus(item, "absent") },
            onOpenExcuseDialog = { item -> showExcuseDialog(item) }
        )
        recyclerView.layoutManager = LinearLayoutManager(requireContext())
        recyclerView.adapter = adapter
        recyclerView.isNestedScrollingEnabled = false
    }

    private fun setupFooterNavigation(view: View) {
        view.findViewById<ImageButton>(R.id.btnHome)?.setOnClickListener { navigationCallback?.invoke("dashboard") }
        // PERBAIKAN: Layout Wali Kelas menggunakan ID btnAssigment untuk tombol Riwayat/Kalender
        view.findViewById<ImageButton>(R.id.btnAssigment)?.setOnClickListener {
            filterActive = null
            applyFilterAndUpdate()
            loadAttendanceData()
        } // Refresh riwayat
        view.findViewById<ImageButton>(R.id.btnChart)?.setOnClickListener { navigationCallback?.invoke("tindak_lanjut") }
    }

    private fun updateTanggalDisplay() {
        val sdf = SimpleDateFormat("EEEE, dd MMMM yyyy", Locale("id", "ID"))
        txtFilterTanggal.text = try {
            val parsed = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).parse(selectedDate)
            val formatted = sdf.format(parsed ?: Date())
            formatted.replaceFirstChar { if (it.isLowerCase()) it.titlecase(Locale("id", "ID")) else it.toString() }
        } catch (e: Exception) {
            sdf.format(Date())
        }
    }

    private fun setupCalendarPicker() {
        // Klik di icon ATAU di text tanggal sama-sama buka date picker
        val openDatePicker = View.OnClickListener {
            showDatePickerDialog()
        }
        iconCalendar.setOnClickListener(openDatePicker)
        txtFilterTanggal.setOnClickListener(openDatePicker)
    }

    private fun showDatePickerDialog() {
        try {
            val calendar = Calendar.getInstance()
            val parsed = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).parse(selectedDate)
            if (parsed != null) {
                calendar.time = parsed
            }

            DatePickerDialog(
                requireContext(),
                { _, year, month, dayOfMonth ->
                    val monthValue = (month + 1).toString().padStart(2, '0')
                    val dayValue = dayOfMonth.toString().padStart(2, '0')
                    selectedDate = "$year-$monthValue-$dayValue"
                    updateTanggalDisplay()
                    loadAttendanceData()
                },
                calendar.get(Calendar.YEAR),
                calendar.get(Calendar.MONTH),
                calendar.get(Calendar.DAY_OF_MONTH)
            ).show()
        } catch (e: Exception) {
            Log.e(TAG, "setupCalendarPicker error: ${e.message}", e)
            Toast.makeText(requireContext(), "Gagal membuka kalender", Toast.LENGTH_SHORT).show()
        }
    }

    private fun setupFilterButtons() {
        btnHadir.setOnClickListener { toggleFilter("hadir") }
        btnIzin.setOnClickListener { toggleFilter("izin") }
        btnSakit.setOnClickListener { toggleFilter("sakit") }
        btnAlpha.setOnClickListener { toggleFilter("alpha") }
    }

    private fun toggleFilter(status: String) {
        filterActive = if (filterActive == status) null else status
        applyFilterAndUpdate()
        updateTombolAktif()
    }

    private fun updateTombolAktif() {
        // Reset semua ke gambar normal
        btnHadir.setImageResource(R.drawable.btn_guru_hadir)
        btnSakit.setImageResource(R.drawable.btn_guru_sakit)
        btnIzin.setImageResource(R.drawable.btn_guru_izin)
        btnAlpha.setImageResource(R.drawable.btn_guru_alpha)

        // Set angka ke warna normal (abu)
        val colorNormal = android.graphics.Color.parseColor("#4B5563")
        txtHadirCount.setTextColor(colorNormal)
        txtSakitCount.setTextColor(colorNormal)
        txtIzinCount.setTextColor(colorNormal)
        txtAlphaCount.setTextColor(colorNormal)

        // Set tombol aktif: gambar _active + angka putih
        when (filterActive) {
            "hadir" -> {
                btnHadir.setImageResource(R.drawable.btn_guru_hadir_active)
                txtHadirCount.setTextColor(android.graphics.Color.WHITE)
            }
            "sakit" -> {
                btnSakit.setImageResource(R.drawable.btn_guru_sakit_active)
                txtSakitCount.setTextColor(android.graphics.Color.WHITE)
            }
            "izin" -> {
                btnIzin.setImageResource(R.drawable.btn_guru_izin_active)
                txtIzinCount.setTextColor(android.graphics.Color.WHITE)
            }
            "alpha" -> {
                btnAlpha.setImageResource(R.drawable.btn_guru_alpha_active)
                txtAlphaCount.setTextColor(android.graphics.Color.WHITE)
            }
        }
    }

    private fun loadAttendanceData() {
        lifecycleScope.launch {
            try {
                val activity = activity as? BaseNetworkActivity ?: return@launch

                // Gunakan endpoint /me/homeroom/attendance?start_date=X&end_date=X
                // Endpoint ini filter langsung by student.class_id milik wali kelas,
                // tanpa bergantung pada adanya jadwal (ScheduleItem) terdaftar untuk hari itu.
                val result = activity.teacherRepository.getMyHomeroomAttendance(
                    startDate = selectedDate,
                    endDate = selectedDate
                )

                when (result) {
                    is com.example.ritamesa.api.Result.Success -> {
                        allData.clear()
                        result.data.forEach { item ->
                            val statusMap = mapOf(
                                "attendanceId" to (item.id ?: 0),
                                "studentId" to (item.student?.id ?: 0),
                                "nama" to (item.student?.name ?: "Tanpa Nama"),
                                "nisn" to (item.student?.nisn ?: item.student?.nis ?: "-"),
                                "kelas" to (item.schedule?.className ?: "-"),
                                "class" to (item.schedule?.className ?: "-"),
                                "status" to (item.status ?: "alpha"),
                                "reason" to (item.reason ?: ""),
                                "source" to (item.source ?: ""),
                                "attachmentUrl" to (item.reasonFileUrl ?: ""),
                                "latestAttachmentUrl" to (item.latestAttachmentUrl ?: "")
                            )
                            allData.add(statusMap)
                        }
                        applyFilterAndUpdate()
                    }
                    is com.example.ritamesa.api.Result.Error -> {
                        Log.e(TAG, "loadAttendanceData error: ${result.message}")
                        activity.showError(result.message ?: "Gagal memuat data kehadiran")
                    }
                    else -> {}
                }
            } catch (e: Exception) {
                Log.e(TAG, "loadAttendanceData exception: ${e.message}", e)
            }
        }
    }

    private fun loadTotalStudents() {
        lifecycleScope.launch {
            try {
                val activity = activity as? BaseNetworkActivity ?: return@launch
                when (val result = activity.teacherRepository.getMyHomeroomStudents()) {
                    is com.example.ritamesa.api.Result.Success -> {
                        val total = result.data.size
                        txtJumlahSiswa.text = "Total Jumlah Siswa : $total"
                    }
                    is com.example.ritamesa.api.Result.Error -> {
                        txtJumlahSiswa.text = "Total Jumlah Siswa : 0"
                    }
                    else -> {}
                }
            } catch (e: Exception) {
                txtJumlahSiswa.text = "Total Jumlah Siswa : 0"
            }
        }
    }

    private fun applyFilterAndUpdate() {
        filteredData.clear()
        if (filterActive == null) {
            filteredData.addAll(allData)
        } else {
            filteredData.addAll(allData.filter { item ->
                val status = item["status"]?.toString()
                resolveStatusGroup(status) == filterActive
            })
        }
        adapter.updateData(filteredData.toList())
        updateStatistics()
    }

    private fun resolveStatusGroup(rawStatus: String?): String {
        val s = rawStatus?.lowercase() ?: "alpha"
        return when (s) {
            "present", "hadir", "late", "terlambat", "dispensasi", "dispen" -> "hadir"
            "sick", "sakit" -> "sakit"
            "excused", "permission", "izin" -> "izin"
            "absent", "alpha" -> "alpha"
            else -> "alpha"
        }
    }

    private fun updateStatistics() {
        val hadir = allData.count { resolveStatusGroup(it["status"]?.toString()) == "hadir" }
        val sakit = allData.count { resolveStatusGroup(it["status"]?.toString()) == "sakit" }
        val izin = allData.count { resolveStatusGroup(it["status"]?.toString()) == "izin" }
        val alpha = allData.count { resolveStatusGroup(it["status"]?.toString()) == "alpha" }

        txtHadirCount.text = hadir.toString()
        txtSakitCount.text = sakit.toString()
        txtIzinCount.text = izin.toString()
        txtAlphaCount.text = alpha.toString()
    }

    fun setNavigationCallback(callback: (String) -> Unit) {
        navigationCallback = callback
    }

    private fun updateAttendanceStatus(item: Map<String, Any>, status: String) {
        val activity = activity as? BaseNetworkActivity ?: return
        val attendanceId = item["attendanceId"] as? Int ?: 0
        val source = item["source"]?.toString().orEmpty()

        if (attendanceId <= 0) {
            Toast.makeText(requireContext(), "ID absensi tidak ditemukan", Toast.LENGTH_SHORT).show()
            return
        }

        if (source == "system_close" && status == "present") {
            Toast.makeText(
                requireContext(),
                "Alpha otomatis tidak dapat diubah menjadi hadir oleh wali kelas",
                Toast.LENGTH_LONG
            ).show()
            return
        }

        lifecycleScope.launch {
            val result = activity.attendanceRepository.markAttendanceExcuse(
                attendanceId,
                mapOf(
                    "status" to status,
                    "reason" to if (status == "absent") "Ditetapkan ulang sebagai alfa" else ""
                )
            )
            activity.handleResult(
                result,
                onSuccess = {
                    Toast.makeText(requireContext(), "Status berhasil diperbarui", Toast.LENGTH_SHORT).show()
                    loadAttendanceData()
                },
                onError = { _, msg ->
                    activity.showError(msg ?: "Gagal memperbarui status")
                }
            )
        }
    }

    private fun showExcuseDialog(item: Map<String, Any>) {
        val activity = activity as? BaseNetworkActivity ?: return
        val attendanceId = item["attendanceId"] as? Int ?: 0
        val studentName = item["nama"]?.toString().orEmpty()
        val source = item["source"]?.toString().orEmpty()

        if (attendanceId <= 0) {
            Toast.makeText(requireContext(), "ID absensi tidak ditemukan", Toast.LENGTH_SHORT).show()
            return
        }

        selectedAttachmentUri = null
        val dialogView = LayoutInflater.from(requireContext()).inflate(R.layout.pop_up_izin, null)
        val rootLayout = dialogView as LinearLayout
        val inputNamaSiswa = dialogView.findViewById<EditText>(R.id.input_nama_siswa)
        val btnDropdownSiswa = dialogView.findViewById<ImageButton>(R.id.btn_dropdown_siswa)
        val inputTanggal = dialogView.findViewById<EditText>(R.id.input_tanggal)
        val etCatatan = dialogView.findViewById<EditText>(R.id.et_catatan)
        val namaFile = dialogView.findViewById<TextView>(R.id.namafile)
        val btnFile = dialogView.findViewById<ImageButton>(R.id.btn_tambahkanfile)
        val btnKirim = dialogView.findViewById<Button>(R.id.btn_kirim_izin)
        val btnBatal = dialogView.findViewById<Button>(R.id.btn_batal_izin)
        val boxBuktiSurat = dialogView.findViewById<LinearLayout>(R.id.box_bukti_surat)
        val layoutJamSection = dialogView.findViewById<LinearLayout>(R.id.layout_jam_section)

        val statusSpinner = Spinner(requireContext())
        val statusAdapter = ArrayAdapter(
            requireContext(),
            android.R.layout.simple_spinner_item,
            listOf("Sakit", "Izin")
        )
        statusAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        statusSpinner.adapter = statusAdapter

        val statusLabel = TextView(requireContext()).apply {
            text = "Jenis Perizinan"
            textSize = 16f
            setTextColor(android.graphics.Color.parseColor("#303030"))
            setTypeface(typeface, android.graphics.Typeface.BOLD)
        }
        rootLayout.addView(statusLabel, 4)
        rootLayout.addView(statusSpinner, 5)

        boxBuktiSurat.visibility = View.VISIBLE
        layoutJamSection.visibility = View.GONE
        inputNamaSiswa.setText(studentName)
        inputNamaSiswa.isEnabled = false
        btnDropdownSiswa.visibility = View.GONE
        inputTanggal.setText(selectedDate)
        namaFile.text = "Masukkan Bukti Surat"
        currentAttachmentNameView = namaFile
        if (source == "system_close") {
            etCatatan.hint = "Alasan wajib diisi untuk koreksi alpha otomatis"
        }

        val dialog = AlertDialog.Builder(requireContext())
            .setView(dialogView)
            .create()

        btnFile.setOnClickListener { filePickerLauncher.launch("image/*") }
        btnBatal.setOnClickListener { dialog.dismiss() }
        btnKirim.setOnClickListener {
            val selectedStatus = if (statusSpinner.selectedItemPosition == 0) "sick" else "excused"
            val reason = etCatatan.text?.toString()?.trim().orEmpty()

            if (reason.isBlank()) {
                Toast.makeText(requireContext(), "Keterangan wajib diisi", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            if (selectedAttachmentUri == null) {
                Toast.makeText(requireContext(), "Bukti surat wajib diunggah", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val file = getFileFromUri(selectedAttachmentUri!!)
            if (file == null) {
                Toast.makeText(requireContext(), "Gagal membaca file bukti", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val attachment = MultipartBody.Part.createFormData(
                "attachment",
                file.name,
                file.asRequestBody("image/*".toMediaTypeOrNull())
            )

            lifecycleScope.launch {
                val result = activity.attendanceRepository.updateAttendanceExcuse(
                    attendanceId = attendanceId,
                    status = selectedStatus,
                    reason = reason,
                    attachment = attachment
                )
                activity.handleResult(
                    result,
                    onSuccess = {
                        dialog.dismiss()
                        Toast.makeText(requireContext(), "Koreksi presensi berhasil", Toast.LENGTH_SHORT).show()
                        loadAttendanceData()
                    },
                    onError = { _, msg ->
                        activity.showError(msg ?: "Gagal memperbarui presensi")
                    }
                )
            }
        }

        dialog.show()
    }

    private fun getFileName(uri: Uri): String {
        var result = "bukti_surat.jpg"
        val cursor = requireContext().contentResolver.query(uri, null, null, null, null)
        cursor?.use {
            if (it.moveToFirst()) {
                val nameIndex = it.getColumnIndex(android.provider.OpenableColumns.DISPLAY_NAME)
                if (nameIndex >= 0) {
                    result = it.getString(nameIndex)
                }
            }
        }
        return result
    }

    private fun getFileFromUri(uri: Uri): File? {
        val tempFile = File(requireContext().cacheDir, getFileName(uri))
        return try {
            val inputStream = requireContext().contentResolver.openInputStream(uri) ?: return null
            val outputStream = FileOutputStream(tempFile)
            val buffer = ByteArray(4 * 1024)
            var read: Int
            while (inputStream.read(buffer).also { read = it } != -1) {
                outputStream.write(buffer, 0, read)
            }
            outputStream.flush()
            outputStream.close()
            inputStream.close()
            tempFile
        } catch (e: Exception) {
            Log.e(TAG, "Gagal membuat file sementara", e)
            null
        }
    }
}