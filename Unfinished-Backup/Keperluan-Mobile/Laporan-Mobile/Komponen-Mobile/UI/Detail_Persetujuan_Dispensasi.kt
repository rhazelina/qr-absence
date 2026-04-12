package com.example.ritamesa

import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.TextView
import androidx.activity.enableEdgeToEdge
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.lifecycle.lifecycleScope
import com.example.ritamesa.api.models.StudentLeavePermission
import com.example.ritamesa.api.models.UpdateLeavePermissionRequest
import kotlinx.coroutines.launch

class Detail_Persetujuan_Dispensasi : BaseNetworkActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.detail_persetujuan_dispensasi)
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        val dispensasiId = intent.getIntExtra("dispensasi_id", -1)
        if (dispensasiId > 0) {
            loadDispensasiDetail(dispensasiId)
        } else {
            showError("Invalid dispensasi ID")
            finish()
        }
    }

    private fun loadDispensasiDetail(dispensasiId: Int) {
        lifecycleScope.launch {
            try {
                val result = leavePermissionRepository.getLeavePermission(dispensasiId)
                handleResult(result,
                    onSuccess = { permission ->
                        displayDispensasiDetail(permission)
                    },
                    onError = { _, msg ->
                        showError("Gagal memuat detail dispensasi: $msg")
                    }
                )
            } catch (e: Exception) {
                showError("Error: ${e.message}")
            }
        }
    }

    /**
     * FIX: Hanya gunakan field yang ada di StudentLeavePermission:
     * id, student, studentClass, createdAt, startTime, endTime, reason, status
     * Field 'date', 'subject', 'teacher' TIDAK ADA → pakai createdAt & tanda "-"
     */
    private fun displayDispensasiDetail(permission: StudentLeavePermission) {
        // Nama siswa
        findViewById<TextView>(R.id.textView)?.text = permission.student?.name ?: "-"

        // Hari — dihitung dari createdAt (field 'date' tidak ada di model)
        val dateStr = permission.createdAt
        findViewById<TextView>(R.id.textView2)?.text = getDayName(dateStr)

        // Tanggal
        findViewById<TextView>(R.id.textView3)?.text = formatDate(dateStr ?: "-")

        // Jam (startTime - endTime)
        val jamKe = "${permission.startTime ?: "-"} - ${permission.endTime ?: "-"}"
        findViewById<TextView>(R.id.textView19)?.text = jamKe

        // Kelas
        findViewById<TextView>(R.id.textView20)?.text = permission.studentClass?.name ?: "-"

        // Mata Pelajaran — 'subject' tidak ada di StudentLeavePermission
        findViewById<TextView>(R.id.textView21)?.text = "-"

        // Guru Pengajar — 'teacher' tidak ada di StudentLeavePermission
        findViewById<TextView>(R.id.textView22)?.text = "-"

        // Catatan / Alasan
        findViewById<TextView>(R.id.textView24)?.text = permission.reason ?: "-"

        // Tampilkan/sembunyikan tombol berdasarkan status
        val btnSetujui = findViewById<Button>(R.id.button)
        val btnTolak = findViewById<Button>(R.id.button6)
        val isPending = permission.status?.lowercase() == "pending"

        if (!isPending) {
            btnSetujui?.visibility = View.GONE
            btnTolak?.visibility = View.GONE
        } else {
            btnSetujui?.visibility = View.VISIBLE
            btnTolak?.visibility = View.VISIBLE
        }

        // Tombol Setujui → PATCH /leave-permissions/{id} status "approved"
        btnSetujui?.setOnClickListener {
            permission.id?.let { id -> updateStatus(id, "approved") }
        }

        // Tombol Tolak → PATCH /leave-permissions/{id} status "rejected"
        btnTolak?.setOnClickListener {
            permission.id?.let { id -> updateStatus(id, "rejected") }
        }
    }

    private fun updateStatus(permissionId: Int, newStatus: String) {
        lifecycleScope.launch {
            try {
                val request = UpdateLeavePermissionRequest(status = newStatus)
                val result = leavePermissionRepository.updateLeavePermission(permissionId, request)
                handleResult(result,
                    onSuccess = { updated ->
                        val msg = if (newStatus == "approved") "Dispensasi disetujui" else "Dispensasi ditolak"
                        showSuccess(msg)
                        displayDispensasiDetail(updated)
                        setResult(RESULT_OK)
                    },
                    onError = { _, msg ->
                        showError("Gagal update: $msg")
                    }
                )
            } catch (e: Exception) {
                showError("Error: ${e.message}")
            }
        }
    }

    private fun getDayName(dateStr: String?): String {
        if (dateStr.isNullOrEmpty()) return "-"
        return try {
            val sdf = java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale("id", "ID"))
            val date = sdf.parse(dateStr.take(10)) ?: return "-"
            val cal = java.util.Calendar.getInstance()
            cal.time = date
            val days = arrayOf("Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu")
            days[cal.get(java.util.Calendar.DAY_OF_WEEK) - 1]
        } catch (e: Exception) { "-" }
    }

    private fun formatDate(dateStr: String): String {
        return try {
            val sdfIn = java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.getDefault())
            val sdfOut = java.text.SimpleDateFormat("dd MMM yyyy", java.util.Locale("id", "ID"))
            val date = sdfIn.parse(dateStr.take(10)) ?: return dateStr
            sdfOut.format(date)
        } catch (e: Exception) { dateStr }
    }
}