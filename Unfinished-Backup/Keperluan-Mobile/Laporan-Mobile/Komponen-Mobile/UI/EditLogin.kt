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
import android.widget.*
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import com.bumptech.glide.Glide
import kotlinx.coroutines.launch

class EditLogin : BaseNetworkActivity() {

    // ---- Login tampilan ----
    private lateinit var ivLogoPreview: ImageView
    private lateinit var tvPreviewJudul: TextView
    private lateinit var tvPreviewSubJudul: TextView
    private lateinit var etJudulUtama: EditText
    private lateinit var etJudulSub: EditText
    private lateinit var btnPilihLogo: Button

    // ---- Profil Sekolah ----
    private lateinit var etSchoolName: EditText
    private lateinit var etSchoolNpsn: EditText
    private lateinit var spinnerSchoolLevel: Spinner
    private lateinit var etSchoolAccreditation: EditText
    private lateinit var etHeadmasterName: EditText
    private lateinit var etHeadmasterNip: EditText
    private lateinit var etSchoolEmail: EditText
    private lateinit var etSchoolPhone: EditText
    private lateinit var etSchoolAddress: EditText
    private lateinit var etVillage: EditText
    private lateinit var etDistrict: EditText
    private lateinit var etCity: EditText
    private lateinit var etProvince: EditText
    private lateinit var etPostalCode: EditText

    // ---- Tombol ----
    private lateinit var btnSimpan: Button
    private lateinit var btnReset: Button
    private lateinit var btnKembali: Button

    private lateinit var appPreferences: AppPreferences
    private var selectedImageUri: Uri? = null

    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (isGranted) openGallery()
        else Toast.makeText(this, "Izin akses storage diperlukan", Toast.LENGTH_SHORT).show()
    }

    private val pickImageLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == RESULT_OK) {
            result.data?.data?.let { uri ->
                selectedImageUri = uri
                Glide.with(this)
                    .load(uri)
                    .skipMemoryCache(true)
                    .diskCacheStrategy(com.bumptech.glide.load.engine.DiskCacheStrategy.NONE)
                    .into(ivLogoPreview)
                Toast.makeText(this, "✓ Logo berhasil dipilih", Toast.LENGTH_SHORT).show()
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
        // Login tampilan
        ivLogoPreview       = findViewById(R.id.iv_logo_preview)
        tvPreviewJudul      = findViewById(R.id.tv_preview_judul)
        tvPreviewSubJudul   = findViewById(R.id.tv_preview_subjudul)
        etJudulUtama        = findViewById(R.id.et_judul_utama)
        etJudulSub          = findViewById(R.id.et_judul_sub)
        btnPilihLogo        = findViewById(R.id.btn_pilih_logo)

        // Profil Sekolah
        etSchoolName        = findViewById(R.id.et_school_name)
        etSchoolNpsn        = findViewById(R.id.et_school_npsn)
        spinnerSchoolLevel  = findViewById(R.id.spinner_school_level)
        etSchoolAccreditation = findViewById(R.id.et_school_accreditation)
        etHeadmasterName    = findViewById(R.id.et_headmaster_name)
        etHeadmasterNip     = findViewById(R.id.et_headmaster_nip)
        etSchoolEmail       = findViewById(R.id.et_school_email)
        etSchoolPhone       = findViewById(R.id.et_school_phone)
        etSchoolAddress     = findViewById(R.id.et_school_address)
        etVillage           = findViewById(R.id.et_village)
        etDistrict          = findViewById(R.id.et_district)
        etCity              = findViewById(R.id.et_city)
        etProvince          = findViewById(R.id.et_province)
        etPostalCode        = findViewById(R.id.et_postal_code)

        // Tombol
        btnSimpan   = findViewById(R.id.btn_simpan)
        btnReset    = findViewById(R.id.btn_reset)
        btnKembali  = findViewById(R.id.btn_kembali)
    }

    private fun loadCurrentData() {
        // Logo
        val currentLogo = appPreferences.getLogoSync()
        if (currentLogo.startsWith("content://") || currentLogo.startsWith("file://")) {
            Glide.with(this)
                .load(Uri.parse(currentLogo))
                .skipMemoryCache(true)
                .diskCacheStrategy(com.bumptech.glide.load.engine.DiskCacheStrategy.NONE)
                .error(R.drawable.logo_1)
                .into(ivLogoPreview)
        } else {
            val resId = resources.getIdentifier(currentLogo, "drawable", packageName)
            ivLogoPreview.setImageResource(if (resId != 0) resId else R.drawable.logo_1)
        }

        // Judul
        val judulUtama = appPreferences.getJudulUtamaSync()
        val judulSub   = appPreferences.getJudulSubSync()
        etJudulUtama.setText(judulUtama)
        etJudulSub.setText(judulSub)
        tvPreviewJudul.text    = judulUtama
        tvPreviewSubJudul.text = judulSub

        // Profil Sekolah — load from AppPreferences (beri default dari seeder)
        etSchoolName.setText(appPreferences.getSettingSync("school_name", AppPreferences.DEFAULT_SCHOOL_NAME))
        etSchoolNpsn.setText(appPreferences.getSettingSync("school_npsn", "20517748"))
        etSchoolAccreditation.setText(appPreferences.getSettingSync("school_accreditation", "A"))
        etHeadmasterName.setText(appPreferences.getSettingSync("school_headmaster", "SUMIJAH, S.Pd., M.Si"))
        etHeadmasterNip.setText(appPreferences.getSettingSync("school_headmaster_nip", "97002101998022009"))
        etSchoolEmail.setText(appPreferences.getSettingSync("school_email", "smkn2.singosari@yahoo.co.id"))
        etSchoolPhone.setText(appPreferences.getSettingSync("school_phone", "(0341) 458823"))
        etSchoolAddress.setText(appPreferences.getSettingSync("school_address", "Jl. Perusahaan No.20"))
        etVillage.setText(appPreferences.getSettingSync("village", "Tunjungtirto"))
        etDistrict.setText(appPreferences.getSettingSync("district", "Singosari"))
        etCity.setText(appPreferences.getSettingSync("city", "Kab. Malang"))
        etProvince.setText(appPreferences.getSettingSync("province", "Jawa Timur"))
        etPostalCode.setText(appPreferences.getSettingSync("postal_code", "65154"))

        // Spinner jenjang — adapter diset via code, bukan android:entries di XML
        val schoolLevels = arrayOf("SMA/SMK/MA", "SMP/MTS", "SD/MI")
        val spinnerAdapter = ArrayAdapter(this, android.R.layout.simple_spinner_item, schoolLevels)
        spinnerAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        spinnerSchoolLevel.adapter = spinnerAdapter

        val savedLevel = appPreferences.getSettingSync("school_type", "SMA/SMK/MA")
        val levelIndex = schoolLevels.indexOfFirst { it.contains(savedLevel, ignoreCase = true) }
        if (levelIndex >= 0) spinnerSchoolLevel.setSelection(levelIndex)
    }

    private fun setupListeners() {
        btnPilihLogo.setOnClickListener { checkPermissionAndOpenGallery() }

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

        btnSimpan.setOnClickListener  { simpanPerubahan() }
        btnReset.setOnClickListener   { showResetConfirmation() }
        btnKembali.setOnClickListener { finish() }
    }

    private fun checkPermissionAndOpenGallery() {
        val permission = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU)
            Manifest.permission.READ_MEDIA_IMAGES
        else
            Manifest.permission.READ_EXTERNAL_STORAGE

        if (ContextCompat.checkSelfPermission(this, permission) == PackageManager.PERMISSION_GRANTED)
            openGallery()
        else
            requestPermissionLauncher.launch(permission)
    }

    private fun openGallery() {
        val intent = Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI)
        intent.type = "image/*"
        pickImageLauncher.launch(intent)
    }

    private fun simpanPerubahan() {
        val judulUtama = etJudulUtama.text.toString().trim()
        val judulSub   = etJudulSub.text.toString().trim()

        if (judulUtama.isEmpty()) {
            etJudulUtama.error = "Judul tidak boleh kosong"
            return
        }
        if (etSchoolName.text.toString().trim().isEmpty()) {
            etSchoolName.error = "Nama sekolah tidak boleh kosong"
            return
        }

        lifecycleScope.launch {
            try {
                // Simpan tampilan login
                appPreferences.saveJudulUtama(judulUtama)
                appPreferences.saveJudulSub(judulSub)
                if (selectedImageUri != null) {
                    appPreferences.saveLogoUri(selectedImageUri.toString())
                }

                // Simpan profil sekolah
                val selectedLevel = spinnerSchoolLevel.selectedItem?.toString() ?: "SMA/SMK/MA"
                // Ambil kode jenis (SMK/SMA/MA/SMP/MTS/SD/MI) dari pilihan spinner
                val schoolType = when {
                    selectedLevel.contains("SMK") -> "SMK"
                    selectedLevel.contains("SMA") -> "SMA"
                    selectedLevel.contains("MA")  -> "MA"
                    selectedLevel.contains("SMP") -> "SMP"
                    selectedLevel.contains("MTS") -> "MTS"
                    selectedLevel.contains("SD")  -> "SD"
                    selectedLevel.contains("MI")  -> "MI"
                    else -> selectedLevel
                }

                appPreferences.saveSetting("school_name",           etSchoolName.text.toString().trim())
                appPreferences.saveSetting("school_npsn",           etSchoolNpsn.text.toString().trim())
                appPreferences.saveSetting("school_type",           schoolType)
                appPreferences.saveSetting("school_accreditation",  etSchoolAccreditation.text.toString().trim())
                appPreferences.saveSetting("school_headmaster",     etHeadmasterName.text.toString().trim())
                appPreferences.saveSetting("school_headmaster_nip", etHeadmasterNip.text.toString().trim())
                appPreferences.saveSetting("school_email",          etSchoolEmail.text.toString().trim())
                appPreferences.saveSetting("school_phone",          etSchoolPhone.text.toString().trim())
                appPreferences.saveSetting("school_address",        etSchoolAddress.text.toString().trim())
                appPreferences.saveSetting("village",               etVillage.text.toString().trim())
                appPreferences.saveSetting("district",              etDistrict.text.toString().trim())
                appPreferences.saveSetting("city",                  etCity.text.toString().trim())
                appPreferences.saveSetting("province",              etProvince.text.toString().trim())
                appPreferences.saveSetting("postal_code",           etPostalCode.text.toString().trim())

                Toast.makeText(this@EditLogin, "✓ Perubahan berhasil disimpan!", Toast.LENGTH_LONG).show()
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
            .setMessage("Semua perubahan logo, judul, dan profil sekolah akan dikembalikan ke pengaturan awal. Lanjutkan?")
            .setPositiveButton("Ya, Reset") { _, _ -> resetToDefault() }
            .setNegativeButton("Batal", null)
            .show()
    }

    private fun resetToDefault() {
        lifecycleScope.launch {
            try {
                appPreferences.resetToDefault()

                // Reset UI login
                ivLogoPreview.setImageResource(R.drawable.logo_1)
                etJudulUtama.setText(AppPreferences.DEFAULT_JUDUL_UTAMA)
                etJudulSub.setText(AppPreferences.DEFAULT_JUDUL_SUB)
                tvPreviewJudul.text    = AppPreferences.DEFAULT_JUDUL_UTAMA
                tvPreviewSubJudul.text = AppPreferences.DEFAULT_JUDUL_SUB
                selectedImageUri = null

                // Reset UI profil sekolah ke nilai seeder
                etSchoolName.setText(AppPreferences.DEFAULT_SCHOOL_NAME)
                etSchoolNpsn.setText("20517748")
                spinnerSchoolLevel.setSelection(0)
                etSchoolAccreditation.setText("A")
                etHeadmasterName.setText("SUMIJAH, S.Pd., M.Si")
                etHeadmasterNip.setText("97002101998022009")
                etSchoolEmail.setText("smkn2.singosari@yahoo.co.id")
                etSchoolPhone.setText("(0341) 458823")
                etSchoolAddress.setText("Jl. Perusahaan No.20")
                etVillage.setText("Tunjungtirto")
                etDistrict.setText("Singosari")
                etCity.setText("Kab. Malang")
                etProvince.setText("Jawa Timur")
                etPostalCode.setText("65154")

                Toast.makeText(this@EditLogin, "✓ Reset ke default berhasil", Toast.LENGTH_SHORT).show()
            } catch (e: Exception) {
                Toast.makeText(this@EditLogin, "✗ Gagal reset: ${e.message}", Toast.LENGTH_SHORT).show()
                e.printStackTrace()
            }
        }
    }
}