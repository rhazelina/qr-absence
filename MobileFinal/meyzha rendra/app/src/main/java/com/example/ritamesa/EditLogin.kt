package com.example.ritamesa

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.MediaStore
import android.text.Editable
import android.text.TextWatcher
import android.widget.Button
import android.widget.EditText
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import com.bumptech.glide.Glide
import kotlinx.coroutines.launch

class EditLogin : AppCompatActivity() {

    private lateinit var ivLogoPreview: ImageView
    private lateinit var tvPreviewJudul: TextView
    private lateinit var tvPreviewSubJudul: TextView
    private lateinit var etJudulUtama: EditText
    private lateinit var etJudulSub: EditText
    private lateinit var btnPilihLogo: Button
    private lateinit var btnSimpan: Button
    private lateinit var btnReset: Button
    private lateinit var btnKembali: Button

    private lateinit var appPreferences: AppPreferences
    private var selectedImageUri: Uri? = null

    // Launcher untuk meminta permission
    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (isGranted) {
            openGallery()
        } else {
            Toast.makeText(this, "Izin akses storage diperlukan", Toast.LENGTH_SHORT).show()
        }
    }

    private val pickImageLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == RESULT_OK) {
            result.data?.data?.let { uri ->
                selectedImageUri = uri

                // Preview logo dengan Glide - TANPA CACHE
                Glide.with(this)
                    .load(uri)
                    .skipMemoryCache(true)
                    .diskCacheStrategy(com.bumptech.glide.load.engine.DiskCacheStrategy.NONE)
                    .into(ivLogoPreview)

                Toast.makeText(this, "✓ Logo berhasil dipilih", Toast.LENGTH_SHORT).show()

                // DEBUG
                println("✅ URI yang dipilih: $uri")
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.edit_login)

        appPreferences = AppPreferences(this)

        initViews()
        loadCurrentData()
        setupListeners()
    }

    private fun initViews() {
        ivLogoPreview = findViewById(R.id.iv_logo_preview)
        tvPreviewJudul = findViewById(R.id.tv_preview_judul)
        tvPreviewSubJudul = findViewById(R.id.tv_preview_subjudul)
        etJudulUtama = findViewById(R.id.et_judul_utama)
        etJudulSub = findViewById(R.id.et_judul_sub)
        btnPilihLogo = findViewById(R.id.btn_pilih_logo)
        btnSimpan = findViewById(R.id.btn_simpan)
        btnReset = findViewById(R.id.btn_reset)
        btnKembali = findViewById(R.id.btn_kembali)
    }

    private fun loadCurrentData() {
        // Load Logo
        val currentLogo = appPreferences.getLogoSync()
        println("📦 DataStore - Logo tersimpan: $currentLogo")

        if (currentLogo.startsWith("content://") || currentLogo.startsWith("file://")) {
            Glide.with(this)
                .load(Uri.parse(currentLogo))
                .skipMemoryCache(true)
                .diskCacheStrategy(com.bumptech.glide.load.engine.DiskCacheStrategy.NONE)
                .error(R.drawable.logo_1)
                .into(ivLogoPreview)

            println("✅ Loading logo dari URI: $currentLogo")
        } else {
            val resId = resources.getIdentifier(currentLogo, "drawable", packageName)
            if (resId != 0) {
                ivLogoPreview.setImageResource(resId)
                println("✅ Loading logo dari resource: $currentLogo")
            } else {
                ivLogoPreview.setImageResource(R.drawable.logo_1)
                println("✅ Loading logo default")
            }
        }

        // Load Judul
        val judulUtama = appPreferences.getJudulUtamaSync()
        val judulSub = appPreferences.getJudulSubSync()

        etJudulUtama.setText(judulUtama)
        etJudulSub.setText(judulSub)
        tvPreviewJudul.text = judulUtama
        tvPreviewSubJudul.text = judulSub

        println("✅ Judul utama: $judulUtama")
        println("✅ Judul sub: $judulSub")
    }

    private fun setupListeners() {
        btnPilihLogo.setOnClickListener {
            checkPermissionAndOpenGallery()
        }

        // TextWatcher untuk update preview
        etJudulUtama.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                tvPreviewJudul.text = s.toString()
            }
            override fun afterTextChanged(s: Editable?) {}
        })

        etJudulSub.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                tvPreviewSubJudul.text = s.toString()
            }
            override fun afterTextChanged(s: Editable?) {}
        })

        btnSimpan.setOnClickListener {
            simpanPerubahan()
        }

        btnReset.setOnClickListener {
            showResetConfirmation()
        }

        btnKembali.setOnClickListener {
            finish()
        }
    }

    private fun checkPermissionAndOpenGallery() {
        val permission = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            Manifest.permission.READ_MEDIA_IMAGES
        } else {
            Manifest.permission.READ_EXTERNAL_STORAGE
        }

        when {
            ContextCompat.checkSelfPermission(this, permission) == PackageManager.PERMISSION_GRANTED -> {
                openGallery()
            }
            else -> {
                requestPermissionLauncher.launch(permission)
            }
        }
    }

    private fun openGallery() {
        val intent = Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI)
        intent.type = "image/*"
        pickImageLauncher.launch(intent)
    }

    private fun simpanPerubahan() {
        val judulUtama = etJudulUtama.text.toString().trim()
        val judulSub = etJudulSub.text.toString().trim()

        if (judulUtama.isEmpty()) {
            etJudulUtama.error = "Judul tidak boleh kosong"
            return
        }

        lifecycleScope.launch {
            try {
                // Simpan judul
                appPreferences.saveJudulUtama(judulUtama)
                appPreferences.saveJudulSub(judulSub)

                // Simpan logo jika ada perubahan
                if (selectedImageUri != null) {
                    val uriString = selectedImageUri.toString()
                    appPreferences.saveLogoUri(uriString)
                    println("💾 MENYIMPAN LOGO: $uriString")
                }

                Toast.makeText(this@EditLogin, "✓ Perubahan berhasil disimpan!", Toast.LENGTH_LONG).show()

                // Beri delay sebelum finish
                Thread.sleep(500)
                finish()
            } catch (e: Exception) {
                Toast.makeText(this@EditLogin, "✗ Gagal menyimpan: ${e.message}", Toast.LENGTH_SHORT).show()
                e.printStackTrace()
            }
        }
    }

    private fun showResetConfirmation() {
        AlertDialog.Builder(this)
            .setTitle("Reset ke Default")
            .setMessage("Semua perubahan logo dan judul akan dikembalikan ke pengaturan awal. Lanjutkan?")
            .setPositiveButton("Ya, Reset") { _, _ ->
                resetToDefault()
            }
            .setNegativeButton("Batal", null)
            .show()
    }

    private fun resetToDefault() {
        lifecycleScope.launch {
            try {
                appPreferences.resetToDefault()

                // Reset UI
                ivLogoPreview.setImageResource(R.drawable.logo_1)
                etJudulUtama.setText(AppPreferences.DEFAULT_JUDUL_UTAMA)
                etJudulSub.setText(AppPreferences.DEFAULT_JUDUL_SUB)
                tvPreviewJudul.text = AppPreferences.DEFAULT_JUDUL_UTAMA
                tvPreviewSubJudul.text = AppPreferences.DEFAULT_JUDUL_SUB
                selectedImageUri = null

                Toast.makeText(this@EditLogin, "✓ Reset ke default berhasil", Toast.LENGTH_SHORT).show()
            } catch (e: Exception) {
                Toast.makeText(this@EditLogin, "✗ Gagal reset: ${e.message}", Toast.LENGTH_SHORT).show()
                e.printStackTrace()
            }
        }
    }
}