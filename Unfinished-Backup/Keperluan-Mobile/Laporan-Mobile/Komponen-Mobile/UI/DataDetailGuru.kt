package com.example.ritamesa

import android.os.Bundle
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch

class DataGuruDetail : BaseNetworkActivity() {

    private var teacherId: Int = -1

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.data_detail_guru)

        teacherId = intent.getIntExtra("id", -1)
        val nama = intent.getStringExtra("nama") ?: "Tidak ada nama"

        val tvTitle = findViewById<TextView>(R.id.tvTitle)
        tvTitle.text = "Detail Guru: $nama (ID: $teacherId)"

        if (teacherId != -1) {
            loadTeacherDetail(teacherId)
        }
    }

    private fun loadTeacherDetail(id: Int) {
        lifecycleScope.launch {
            try {
                val result = teacherRepository.getTeacher(id)
                handleResult(result,
                    onSuccess = { teacher ->
                        displayTeacherDetail(teacher)
                    },
                    onError = { _, message ->
                        showError(message ?: "Gagal memuat detail guru")
                    }
                )
            } catch (e: Exception) {
                showError("Error: ${e.message}")
            }
        }
    }

    private fun displayTeacherDetail(teacher: Any) {
        val tvTitle = findViewById<TextView>(R.id.tvTitle)
        val teacherName = (teacher as? Map<*, *>)?.get("name")?.toString() ?: "Tidak ada nama"
        tvTitle.text = "Detail Guru: $teacherName (ID: $teacherId)"
    }
}