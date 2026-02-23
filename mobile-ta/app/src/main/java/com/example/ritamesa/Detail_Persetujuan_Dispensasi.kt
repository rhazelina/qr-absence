package com.example.ritamesa

import android.os.Bundle
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.lifecycle.lifecycleScope
import com.example.ritamesa.api.models.StudentLeavePermission
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

        // Get dispensasi ID from intent
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

    private fun displayDispensasiDetail(permission: StudentLeavePermission) {
        // TODO: Implement UI binding to display permission details
        // Use findViewById() or view binding to update TextViews with permission data
    }
}