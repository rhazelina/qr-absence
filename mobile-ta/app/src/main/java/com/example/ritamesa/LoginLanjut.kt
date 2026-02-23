package com.example.ritamesa

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch

class LoginLanjut : BaseNetworkActivity() {

    companion object {
        private const val TAG = "LoginLanjut"
    }

    private lateinit var selectedRole: String
    private var progressBar: ProgressBar? = null
    private lateinit var btnMasuk: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.login_lanjut)

        // Ambil role dari intent - menggunakan konstanta dari LoginAwal
        selectedRole = intent.getStringExtra(LoginAwal.EXTRA_ROLE) ?: ""
        Log.d(TAG, "Selected role: $selectedRole")

        // Atur UI berdasarkan role
        setupUIByRole()

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        setupLoginButton()
    }

    private fun setupUIByRole() {
        val textEmail = findViewById<TextView>(R.id.textView5)
        val edtEmail = findViewById<EditText>(R.id.edtNama)
        val textPassword = findViewById<TextView>(R.id.textView8)
        val edtPassword = findViewById<EditText>(R.id.edtPass)

        when (selectedRole) {
            "Admin" -> {
                // Admin: Email & Kata Sandi
                textEmail.text = "Email"
                edtEmail.hint = "Masukkan Email Anda"
                textPassword.visibility = View.VISIBLE
                edtPassword.visibility = View.VISIBLE
                textPassword.text = "Kata Sandi"  // DIUBAH DARI "Password" KE "Kata Sandi"
            }

            "Waka", "Guru", "Wali Kelas" -> {
                // Waka, Guru, Wali: Kode Guru & Kata Sandi
                textEmail.text = "Kode Guru"
                edtEmail.hint = "Masukkan Kode Guru"
                textPassword.visibility = View.VISIBLE
                edtPassword.visibility = View.VISIBLE
                textPassword.text = "Kata Sandi"  // DIUBAH DARI "Password" KE "Kata Sandi"
            }

            "Siswa", "Pengurus" -> {
                // Siswa & Pengurus: Hanya NISN
                textEmail.text = "NISN"
                edtEmail.hint = "Masukkan NISN"
                textPassword.visibility = View.GONE
                edtPassword.visibility = View.GONE
            }

            else -> {
                // Default: tampilkan semua
                textEmail.text = "Email"
                edtEmail.hint = "Masukkan Email/Kode/NISN"
                textPassword.text = "Kata Sandi"  // DIUBAH DARI "Password" KE "Kata Sandi"
            }
        }
    }

    private fun setupLoginButton() {
        val edtUsername = findViewById<EditText>(R.id.edtNama)
        val edtPassword = findViewById<EditText>(R.id.edtPass)
        btnMasuk = findViewById<Button>(R.id.btnMasuk)
        progressBar = try {
            findViewById<ProgressBar>(R.id.progressBar)
        } catch (e: Exception) {
            Log.w(TAG, "ProgressBar not found in layout", e)
            null
        }

        btnMasuk.setOnClickListener {
            val username = edtUsername.text.toString().trim()
            val password = edtPassword.text.toString().trim()

            // Validasi berdasarkan role
            when (selectedRole) {
                "Admin" -> {
                    if (username.isEmpty() || password.isEmpty()) {
                        Toast.makeText(this, "Email dan kata sandi harus diisi", Toast.LENGTH_SHORT).show()
                        return@setOnClickListener
                    }
                    performLogin(username, password)
                }

                "Waka", "Guru", "Wali Kelas" -> {
                    if (username.isEmpty() || password.isEmpty()) {
                        Toast.makeText(this, "Kode guru dan kata sandi harus diisi", Toast.LENGTH_SHORT).show()
                        return@setOnClickListener
                    }
                    performLogin(username, password)
                }

                "Siswa", "Pengurus" -> {
                    if (username.isEmpty()) {
                        Toast.makeText(this, "NISN harus diisi", Toast.LENGTH_SHORT).show()
                        return@setOnClickListener
                    }
                    // NISN login doesn't require password
                    performLogin(username, password = null)
                }

                else -> {
                    Toast.makeText(this, "Role tidak valid", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    private fun performLogin(username: String, password: String?) {
        // Show loading state
        progressBar?.visibility = View.VISIBLE
        btnMasuk.isEnabled = false

        // Launch coroutine for API call
        lifecycleScope.launch {
            val result = authRepository.login(username, password)
            
            // Hide loading state
            progressBar?.visibility = View.GONE
            btnMasuk.isEnabled = true

            when (result) {
                is com.example.ritamesa.api.Result.Success -> {
                    val userProfile = result.data
                    Log.d(TAG, "Login successful for user: ${userProfile.name}, type: ${userProfile.userType}")
                    
                    // Navigate based on userType returned from API
                    navigateBasedOnUserType(userProfile.userType)
                }
                is com.example.ritamesa.api.Result.Error -> {
                    Log.e(TAG, "Login failed: ${result.message}", result.exception)
                    val errorMessage = result.message ?: result.exception.message ?: "Login gagal"
                    Toast.makeText(this@LoginLanjut, errorMessage, Toast.LENGTH_LONG).show()
                }
                is com.example.ritamesa.api.Result.Loading -> {
                    // Already handled by progress bar
                }
            }
        }
    }

    private fun navigateBasedOnUserType(userType: String?) {
        when (userType) {
            "admin" -> {
                Toast.makeText(this, "Login sebagai Admin", Toast.LENGTH_SHORT).show()
                navigateToAdminDashboard()
            }
            "teacher" -> {
                // For teachers, determine if they are Waka or regular Guru
                // This could be based on additional data from the API response
                Toast.makeText(this, "Login sebagai Guru", Toast.LENGTH_SHORT).show()
                navigateToGuruDashboard()
            }
            "student" -> {
                // For students, check if they are regular siswa or pengurus (class officer)
                // This could be based on additional data from the API response
                Toast.makeText(this, "Login sebagai Siswa", Toast.LENGTH_SHORT).show()
                navigateToSiswaDashboard(isPengurus = false)
            }
            else -> {
                Toast.makeText(this, "Tipe pengguna tidak dikenal: $userType", Toast.LENGTH_SHORT).show()
            }
        }
    }

    // Fungsi navigasi tetap sama seperti sebelumnya
    private fun navigateToAdminDashboard() {
        try {
            val intent = Intent(this, Dashboard::class.java)
            startActivity(intent)
            finish()
        } catch (e: Exception) {
            Toast.makeText(this, "Error membuka dashboard admin", Toast.LENGTH_LONG).show()
            Log.e(TAG, "Failed to open admin dashboard: ${e.message}", e)
        }
    }

    private fun navigateToGuruDashboard() {
        try {
            val intent = Intent(this, GuruNavigationActivity::class.java)
            startActivity(intent)
            finish()
        } catch (e: Exception) {
            Toast.makeText(this, "Error membuka dashboard guru", Toast.LENGTH_LONG).show()
            Log.e(TAG, "Failed to open guru dashboard: ${e.message}", e)
        }
    }

    private fun navigateToWaliKelasDashboard() {
        try {
            val intent = Intent(this, WaliKelasNavigationActivity::class.java)
            startActivity(intent)
            finish()
        } catch (e: Exception) {
            Toast.makeText(this, "Error membuka dashboard wali kelas", Toast.LENGTH_LONG).show()
            Log.e(TAG, "Failed to open wali kelas dashboard: ${e.message}", e)
        }
    }

    private fun navigateToWakaDashboard() {
        try {
            val intent = Intent(this, DashboardWaka::class.java)
            startActivity(intent)
            finish()
        } catch (e: Exception) {
            Toast.makeText(this, "Error membuka dashboard waka", Toast.LENGTH_LONG).show()
            Log.e(TAG, "Failed to open waka dashboard: ${e.message}", e)
        }
    }

    private fun navigateToSiswaDashboard(isPengurus: Boolean) {
        try {
            val intent = Intent(this, DashboardSiswaActivity::class.java)
            intent.putExtra("IS_PENGURUS", isPengurus)
            startActivity(intent)
            finish()
        } catch (e: Exception) {
            Toast.makeText(this, "Error membuka dashboard siswa", Toast.LENGTH_LONG).show()
            Log.e(TAG, "Failed to open siswa dashboard: ${e.message}", e)
        }
    }
}