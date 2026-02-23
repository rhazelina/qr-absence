package com.example.ritamesa

import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch

class EditDataSiswa : BaseNetworkActivity() {
    private var studentId: Int = -1

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.edit_data_siswa)
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        // Get student ID from intent
        studentId = intent.getIntExtra("student_id", -1)
        if (studentId > 0) {
            loadStudentData(studentId)
            // setupSubmitButton() - disabled due to layout mismatch
        } else {
            showError("Invalid student ID")
            finish()
        }
    }

    private fun loadStudentData(id: Int) {
        lifecycleScope.launch {
            try {
                val result = studentRepository.getStudent(id)
                handleResult(result,
                    onSuccess = { student ->
                        populateForm(student)
                    },
                    onError = { _, msg ->
                        showError("Gagal memuat data siswa: $msg")
                    }
                )
            } catch (e: Exception) {
                showError("Error: ${e.message}")
            }
        }
    }

    private fun populateForm(student: com.example.ritamesa.api.models.StudentResource) {
        // Layout doesn't have form fields - read-only view
    }

    private fun setupSubmitButton() {
        // Form submission disabled - layout mismatch
    }

    private fun updateStudent(
        edtNisn: EditText?,
        edtNama: EditText?,
        edtClass: EditText?
    ) {
        val nisn = edtNisn?.text.toString().trim()
        val nama = edtNama?.text.toString().trim()
        val classId = edtClass?.text.toString().trim().toIntOrNull() ?: 0

        if (nisn.isEmpty() || nama.isEmpty()) {
            showError("NISN dan Nama harus diisi")
            return
        }

        lifecycleScope.launch {
            try {
                val request = com.example.ritamesa.api.models.UpdateStudentRequest(
                    nisn = nisn,
                    name = nama,
                    classId = if (classId > 0) classId else null
                )

                val result = studentRepository.updateStudent(studentId, request)
                handleResult(result,
                    onSuccess = { student ->
                        showSuccess("Siswa berhasil diperbarui: ${student.name}")
                        finish()
                    },
                    onError = { _, msg ->
                        showError("Gagal memperbarui siswa: $msg")
                    }
                )
            } catch (e: Exception) {
                showError("Error: ${e.message}")
            }
        }
    }
}
