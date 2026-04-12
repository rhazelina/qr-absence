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
import com.example.ritamesa.api.Result
import kotlinx.coroutines.launch

class LoginLanjut : BaseNetworkActivity() {

    companion object {
        private const val TAG = "LoginLanjut"
    }

    private lateinit var selectedRole: String
    private var progressBar: ProgressBar? = null
    private lateinit var btnMasuk: Button

    // PERBAIKAN 1: Deklarasi variabel appPreferences
    private lateinit var appPreferences: AppPreferences

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.login_lanjut)

        // PERBAIKAN 2: Inisialisasi appPreferences
        appPreferences = AppPreferences(this)

        selectedRole = intent.getStringExtra(LoginAwal.EXTRA_ROLE) ?: ""
        Log.d(TAG, "Selected role dari UI: $selectedRole")

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
                textEmail.text = "Email"
                edtEmail.hint = "Masukkan Email Anda"
                textPassword.visibility = View.VISIBLE
                edtPassword.visibility = View.VISIBLE
                textPassword.text = "Kata Sandi"
            }
            "Waka", "Guru", "Wali Kelas" -> {
                textEmail.text = "NIP"
                edtEmail.hint = "Masukkan NIP"
                textPassword.visibility = View.VISIBLE
                edtPassword.visibility = View.VISIBLE
                textPassword.text = "Kata Sandi"
            }
            "Siswa", "Pengurus" -> {
                textEmail.text = "NISN"
                edtEmail.hint = "Masukkan NISN"
                textPassword.visibility = View.GONE
                edtPassword.visibility = View.GONE
            }
            else -> {
                textEmail.text = "Email / Kode / NISN"
                edtEmail.hint = "Masukkan identitas login"
                textPassword.text = "Kata Sandi"
            }
        }
    }

    private fun setupLoginButton() {
        val edtUsername = findViewById<EditText>(R.id.edtNama)
        val edtPassword = findViewById<EditText>(R.id.edtPass)
        btnMasuk = findViewById(R.id.btnMasuk)
        progressBar = try { findViewById(R.id.progressBar) } catch (e: Exception) { null }

        btnMasuk.setOnClickListener {
            val username = edtUsername.text.toString().trim()
            val password = edtPassword.text.toString().trim()

            when (selectedRole) {
                "Admin", "Waka", "Guru", "Wali Kelas" -> {
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
                    performLogin(username, password = null)
                }
                else -> Toast.makeText(this, "Role tidak valid", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun performLogin(username: String, password: String? = null) {
        progressBar?.visibility = View.VISIBLE
        btnMasuk.isEnabled = false

        lifecycleScope.launch {
            val result = authRepository.login(username, password)

            progressBar?.visibility = View.GONE
            btnMasuk.isEnabled = true

            when (result) {
                is Result.Success -> {
                    val user = result.data
                    Log.d(TAG, "Login berhasil: name=${user.name}, " +
                            "userType=${user.userType}, role=${user.role}, " +
                            "isClassOfficer=${user.isClassOfficer}")

                    navigateBasedOnRole(user.role, user.userType)
                }
                is Result.Error -> {
                    Log.e(TAG, "Login gagal: ${result.message}", result.exception)
                    Toast.makeText(
                        this@LoginLanjut,
                        result.message ?: result.exception.message ?: "Login gagal",
                        Toast.LENGTH_LONG
                    ).show()
                }
                is Result.Loading -> { /* handled by progress bar */ }
            }
        }
    }

    private fun navigateBasedOnRole(role: String?, userType: String?) {
        Log.d(TAG, "Navigasi berdasarkan role: $role, userType: $userType")

        when (role) {
            "admin" -> {
                Toast.makeText(this, "Login sebagai Admin", Toast.LENGTH_SHORT).show()
                startActivity(Intent(this, Dashboard::class.java))
                finish()
            }
            "waka" -> {
                Toast.makeText(this, "Login sebagai Waka", Toast.LENGTH_SHORT).show()
                startActivity(Intent(this, DashboardWaka::class.java))
                finish()
            }
            "wakel" -> {
                Toast.makeText(this, "Login sebagai Wali Kelas", Toast.LENGTH_SHORT).show()
                startActivity(Intent(this, WaliKelasNavigationActivity::class.java))
                finish()
            }
            "guru" -> {
                Toast.makeText(this, "Login sebagai Guru", Toast.LENGTH_SHORT).show()
                startActivity(Intent(this, GuruNavigationActivity::class.java))
                finish()
            }
            "pengurus_kelas" -> {
                Toast.makeText(this, "Login sebagai Pengurus Kelas", Toast.LENGTH_SHORT).show()
                val intent = Intent(this, DashboardSiswaActivity::class.java)
                intent.putExtra("IS_PENGURUS", true)
                startActivity(intent)
                finish()
            }
            "siswa" -> {
                Toast.makeText(this, "Login sebagai Siswa", Toast.LENGTH_SHORT).show()
                val intent = Intent(this, DashboardSiswaActivity::class.java)
                intent.putExtra("IS_PENGURUS", false)
                startActivity(intent)
                finish()
            }
            else -> {
                Log.w(TAG, "role tidak dikenal '$role', fallback ke userType='$userType'")
                when (userType) {
                    "admin" -> {
                        startActivity(Intent(this, Dashboard::class.java))
                        finish()
                    }
                    "teacher" -> {
                        if (appPreferences.isHomeroomTeacherSync()) {
                            Toast.makeText(this, "Login sebagai Wali Kelas", Toast.LENGTH_SHORT).show()
                            startActivity(Intent(this, WaliKelasNavigationActivity::class.java))
                        } else {
                            Toast.makeText(this, "Login sebagai Guru", Toast.LENGTH_SHORT).show()
                            startActivity(Intent(this, GuruNavigationActivity::class.java))
                        }
                        finish()
                    }
                    "student" -> {
                        // PERBAIKAN 3: Gunakan appPreferences untuk memanggil getIsPengurusSync()
                        val isPengurus = appPreferences.getIsPengurusSync()
                        val intent = Intent(this, DashboardSiswaActivity::class.java)
                        intent.putExtra("IS_PENGURUS", isPengurus)
                        startActivity(intent)
                        finish()
                    }
                    else -> {
                        Toast.makeText(this, "Tipe pengguna tidak dikenal: $userType", Toast.LENGTH_SHORT).show()
                    }
                }
            }
        }
    }
}