package com.example.ritamesa

import android.os.Bundle
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch

class DataSiswaDetail : BaseNetworkActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.data_detail_siswa)

        val studentId = intent.getIntExtra("student_id", -1)
        if (studentId > 0) {
            loadStudentDetail(studentId)
        } else {
            showError("Invalid student ID")
            finish()
        }
    }

    private fun loadStudentDetail(studentId: Int) {
        lifecycleScope.launch {
            try {
                val result = studentRepository.getStudent(studentId)
                handleResult(result,
                    onSuccess = { student ->
                        displayStudentDetail(student)
                    },
                    onError = { _, msg ->
                        showError("Gagal memuat detail siswa: $msg")
                    }
                )
            } catch (e: Exception) {
                showError("Error: ${e.message}")
            }
        }
    }

    private fun displayStudentDetail(student: com.example.ritamesa.api.models.StudentResource) {
        try {
            val tvTitle = findViewById<TextView>(R.id.tvTitle)
            tvTitle?.text = "Detail Siswa: ${student.name} (ID: ${student.id})"

            // Populate other detail fields from layout
            findViewById<TextView>(R.id.tvNisn)?.text = "NISN: ${student.nisn ?: "-"}"
            val className = student.`class`?.name ?: "-"
            // findViewById<TextView>(R.id.tvClass)?.text = "Kelas: $className"
        } catch (e: Exception) {
            showError("Error displaying data: ${e.message}")
        }
    }
}