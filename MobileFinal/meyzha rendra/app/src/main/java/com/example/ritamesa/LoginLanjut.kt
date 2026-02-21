package com.example.ritamesa

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.lifecycle.lifecycleScope
import com.example.ritamesa.data.api.ApiClient
import com.example.ritamesa.data.repository.AuthRepository
import kotlinx.coroutines.launch

class LoginLanjut : AppCompatActivity() {

    companion object {
        private const val TAG = "LoginLanjut"
    }

    private lateinit var selectedRole: String
    private lateinit var authRepo: AuthRepository
    private lateinit var appPreferences: AppPreferences

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.login_lanjut)

        authRepo = AuthRepository(ApiClient.getService(this))
        appPreferences = AppPreferences(this)

        // Ambil role dari intent
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

        // Untuk real API, kita wajib memunculkan field password di semua level
        textPassword.visibility = View.VISIBLE
        edtPassword.visibility = View.VISIBLE
        textPassword.text = "Kata Sandi"

        when (selectedRole) {
            "Admin" -> {
                textEmail.text = "Email"
                edtEmail.hint = "Masukkan Email Anda"
            }
            "Waka", "Guru", "Wali Kelas" -> {
                textEmail.text = "Kode Guru"
                edtEmail.hint = "Masukkan Kode Guru"
            }
            "Siswa", "Pengurus" -> {
                textEmail.text = "NISN"
                edtEmail.hint = "Masukkan NISN"
            }
            else -> {
                textEmail.text = "Email"
                edtEmail.hint = "Masukkan Email/Kode/NISN"
            }
        }
    }

    private fun setupLoginButton() {
        val edtUsername = findViewById<EditText>(R.id.edtNama)
        val edtPassword = findViewById<EditText>(R.id.edtPass)
        val btnMasuk = findViewById<Button>(R.id.btnMasuk)

        btnMasuk.setOnClickListener {
            val username = edtUsername.text.toString().trim()
            val password = edtPassword.text.toString().trim()

            if (username.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, "Semua field harus diisi", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            performApiLogin(username, password)
        }
    }

    private fun performApiLogin(username: String, pass: String) {
        val btnMasuk = findViewById<Button>(R.id.btnMasuk)
        btnMasuk.isEnabled = false
        btnMasuk.text = "Loading..."

        lifecycleScope.launch {
            try {
                val response = authRepo.login(username, pass)
                if (response.isSuccessful && response.body()?.data?.token != null) {
                    val token = response.body()?.data?.token!!
                    val role = response.body()?.data?.user?.role ?: ""

                    appPreferences.saveToken(token)
                    Toast.makeText(this@LoginLanjut, "Login Sukses!", Toast.LENGTH_SHORT).show()

                    when (role) {
                        "admin" -> navigateToAdminDashboard()
                        "teacher" -> navigateToGuruDashboard()
                        "student" -> navigateToSiswaDashboard(isPengurus = selectedRole == "Pengurus")
                        else -> navigateToSiswaDashboard(false) // fallback
                    }
                } else {
                    val msg = response.body()?.message ?: "Login Gagal. Kode HTTP: ${response.code()}"
                    Toast.makeText(this@LoginLanjut, msg, Toast.LENGTH_LONG).show()
                    btnMasuk.isEnabled = true
                    btnMasuk.text = "MASUK"
                }
            } catch(e: Exception) {
                Toast.makeText(this@LoginLanjut, "Error Jaringan: ${e.message}", Toast.LENGTH_LONG).show()
                Log.e(TAG, "API Error: ", e)
                btnMasuk.isEnabled = true
                btnMasuk.text = "MASUK"
            }
        }
    }

    private fun navigateToAdminDashboard() {
        try {
            val intent = Intent(this, Dashboard::class.java)
            startActivity(intent)
            finish()
        } catch (e: Exception) {
            Toast.makeText(this, "Error membuka dashboard admin", Toast.LENGTH_LONG).show()
        }
    }

    private fun navigateToGuruDashboard() {
        try {
            val intent = Intent(this, DashboardGuruActivity::class.java)
            startActivity(intent)
            finish()
        } catch (e: Exception) {
            Toast.makeText(this, "Error membuka dashboard guru", Toast.LENGTH_LONG).show()
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
        }
    }
}