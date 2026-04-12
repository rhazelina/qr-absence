package com.example.ritamesa

import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch

class TambahDataSiswa : BaseNetworkActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.tambah_data_siswa)
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        setupSubmitButton()
    }

    private fun setupSubmitButton() {
        // Form elements not available in layout - skipping button setup
    }

    private fun submitStudent(
        edtNisn: EditText?,
        edtNama: EditText?,
        edtEmail: EditText?,
        edtClass: EditText?
    ) {
        val nisn = edtNisn?.text.toString().trim()
        val nama = edtNama?.text.toString().trim()
        val email = edtEmail?.text.toString().trim()
        val classId = edtClass?.text.toString().trim().toIntOrNull() ?: 0

        if (nisn.isEmpty() || nama.isEmpty()) {
            showError("NISN dan Nama harus diisi")
            return
        }

        if (classId <= 0) {
            showError("Kelas harus diisi dengan nilai yang valid")
            return
        }

        lifecycleScope.launch {
            try {
                val request = com.example.ritamesa.api.models.StoreStudentRequest(
                    nisn = nisn,
                    name = nama,
                    email = email,
                    classId = classId
                )
                
                val result = studentRepository.createStudent(request)
                handleResult(result,
                    onSuccess = { student ->
                        showSuccess("Siswa berhasil ditambahkan: ${student.name}")
                        finish()
                    },
                    onError = { _, msg ->
                        showError("Gagal menambahkan siswa: $msg")
                    }
                )
            } catch (e: Exception) {
                showError("Error: ${e.message}")
            }
        }
    }
}