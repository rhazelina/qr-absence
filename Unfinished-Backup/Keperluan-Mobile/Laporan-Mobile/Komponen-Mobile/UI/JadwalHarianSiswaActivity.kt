package com.example.ritamesa

import android.app.DatePickerDialog
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.os.Bundle
import android.util.Log
import android.view.Gravity
import android.view.LayoutInflater
import android.view.Window
import android.view.WindowManager
import android.widget.ImageButton
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatDialog
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.ritamesa.api.Result
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.text.SimpleDateFormat
import java.util.*

class JadwalHarianSiswaActivity : BaseNetworkActivity() {

    private lateinit var btnBack: ImageButton
    private lateinit var txtTanggal: TextView
    private lateinit var recyclerView: RecyclerView
    private lateinit var iconCalendar: ImageView

    private var isPengurus = false
    private var selectedDate = Calendar.getInstance()
    private val jadwalList = mutableListOf<JadwalHarianItem>()

    // Simpan referensi dialog QR agar bisa dismiss dengan aman
    private var qrDialog: AppCompatDialog? = null

    companion object {
        private const val TAG = "JadwalHarian"
        // Ukuran QR bitmap (px). 600x600 cukup tajam untuk scan
        private const val QR_SIZE_PX = 600
    }

    // =========================================================
    // LIFECYCLE
    // =========================================================

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Log.d(TAG, "=== JADWAL HARIAN ACTIVITY START ===")

        isPengurus = intent.getBooleanExtra("IS_PENGURUS", false)
        setContentView(R.layout.jadwal_harian_siswa)

        initViews()
        setupCalendarButton()
        setupBackPressedHandler()
        loadDailySchedule()
    }

    override fun onDestroy() {
        // Pastikan semua dialog ditutup agar tidak terjadi WindowLeaked exception
        loadingDialog?.dismiss()
        loadingDialog = null
        qrDialog?.dismiss()
        qrDialog = null
        super.onDestroy()
    }

    // =========================================================
    // INIT
    // =========================================================

    private fun initViews() {
        btnBack       = findViewById(R.id.btn_back)
        txtTanggal    = findViewById(R.id.TextTanggalTerkini)
        recyclerView  = findViewById(R.id.recycler_jadwal_now)
        iconCalendar  = findViewById(R.id.icon_calendar)

        updateTanggalDisplay()
        recyclerView.layoutManager = LinearLayoutManager(this)

        btnBack.setOnClickListener { navigateToRiwayatKehadiran() }
    }

    // =========================================================
    // LOAD SCHEDULE
    // =========================================================

    private fun loadDailySchedule() {
        lifecycleScope.launch {
            val result = scheduleRepository.getTodaysSchedule()

            when (result) {
                is Result.Success -> {
                    val schedules = result.data
                    Log.d(TAG, "Loaded ${schedules.size} schedules")

                    jadwalList.clear()
                    schedules.forEach { schedule ->
                        jadwalList.add(
                            JadwalHarianItem(
                                mataPelajaran = schedule.subjectName ?: "Mata Pelajaran",
                                sesi          = formatSesi(schedule.startTime, schedule.endTime),
                                namaGuru      = schedule.getDisplayTeacherName(),
                                scheduleId    = schedule.id ?: 0
                            )
                        )
                    }
                    updateRecyclerView()
                }

                is Result.Error -> {
                    Log.e(TAG, "Error loading schedules: ${result.message}")
                    showError("Gagal memuat jadwal: ${result.message}")
                    jadwalList.clear()
                    updateRecyclerView()
                }

                else -> {}
            }
        }
    }

    private fun formatSesi(startTime: String?, endTime: String?): String {
        return when {
            !startTime.isNullOrEmpty() && !endTime.isNullOrEmpty() ->
                "${startTime.take(5)} - ${endTime.take(5)}"
            !startTime.isNullOrEmpty() -> startTime.take(5)
            else -> "-"
        }
    }

    private fun updateRecyclerView() {
        val adapter = JadwalHarianAdapter(
            jadwalList  = jadwalList,
            isPengurus  = isPengurus,
            onQrClick   = { scheduleId ->
                if (isPengurus) generateQRCode(scheduleId)
            }
        )
        recyclerView.adapter = adapter
    }

    // =========================================================
    // QR CODE GENERATION
    // =========================================================

    // Guard flag: mencegah klik ganda / toast spam
    private var isGeneratingQR = false

    // Dialog loading yang bisa di-dismiss
    private var loadingDialog: AppCompatDialog? = null

    /**
     * Alur:
     * 1. Tampilkan dialog loading (bukan Toast — menghindari antrian 5 toast)
     * 2. Panggil API → dapat token
     * 3. Encode token → Bitmap di IO thread
     * 4. Dismiss loading → tampilkan QR dialog
     *
     * Guard [isGeneratingQR] mencegah proses duplikat saat user klik cepat.
     * Pesan error langsung diambil dari field "message" yang dikirim backend
     * tanpa mencocokkan kode HTTP di string, sehingga pesan selalu akurat.
     */
    private fun generateQRCode(scheduleId: Int) {
        // --- Guard: tolak klik ganda ---
        if (isGeneratingQR) return
        isGeneratingQR = true

        lifecycleScope.launch {
            // --- 1. Tampilkan loading dialog (bukan Toast) ---
            showLoadingDialog("Membuat QR Code...")

            try {
                // --- 2. Panggil API ---
                val apiResult = if (isPengurus) {
                    qrCodeRepository.generateMyClassQRToken(
                        scheduleId       = scheduleId,
                        type             = "student",
                        expiresInMinutes = 5
                    )
                } else {
                    qrCodeRepository.generateQRCode(
                        scheduleId       = scheduleId,
                        type             = "student",
                        expiresInMinutes = 5
                    )
                }

                // --- Dismiss loading sebelum menampilkan hasil ---
                dismissLoadingDialog()

                when (apiResult) {
                    is Result.Success -> {
                        val qrData = apiResult.data

                        val token = qrData.resolveToken() ?: run {
                            showQRErrorDialog("Token QR Code tidak ditemukan.\nCoba lagi atau hubungi admin.")
                            return@launch
                        }

                        val expiresLabel = qrData.resolveExpiresAt() ?: "-"

                        // --- 3. Encode QR bitmap di IO thread ---
                        val qrBitmap: Bitmap? = withContext(Dispatchers.IO) {
                            try {
                                val writer    = com.google.zxing.qrcode.QRCodeWriter()
                                val bitMatrix = writer.encode(
                                    token,
                                    com.google.zxing.BarcodeFormat.QR_CODE,
                                    QR_SIZE_PX,
                                    QR_SIZE_PX
                                )
                                val w      = bitMatrix.width
                                val h      = bitMatrix.height
                                val bitmap = Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888)
                                for (x in 0 until w) {
                                    for (y in 0 until h) {
                                        bitmap.setPixel(
                                            x, y,
                                            if (bitMatrix[x, y]) Color.BLACK else Color.WHITE
                                        )
                                    }
                                }
                                bitmap
                            } catch (e: Exception) {
                                Log.e(TAG, "Error generating QR bitmap: ${e.message}", e)
                                null
                            }
                        }

                        if (qrBitmap == null) {
                            showQRErrorDialog("Gagal membuat gambar QR Code.\nCoba lagi.")
                            return@launch
                        }

                        // --- 4. Tampilkan QR dialog ---
                        showQRDialog(token = token, expiresAt = expiresLabel, bitmap = qrBitmap)
                    }

                    is Result.Error -> {
                        // Ambil pesan langsung dari backend — tidak perlu cek kode HTTP di string
                        // Backend sudah mengirim pesan yang ramah user di field "message"
                        val rawMsg  = apiResult.message ?: "Gagal generate QR Code"

                        // Bersihkan prefix teknis jika ada (mis. "HTTP Error 422: {...}")
                        val userMsg = extractBackendMessage(rawMsg)

                        showQRErrorDialog(userMsg)
                    }

                    else -> { /* loading / idle — tidak perlu ditangani */ }
                }

            } catch (e: Exception) {
                dismissLoadingDialog()
                Log.e(TAG, "generateQRCode unexpected error: ${e.message}", e)
                showQRErrorDialog("Terjadi kesalahan tak terduga.\nCoba lagi.")
            } finally {
                // Reset guard agar tombol bisa diklik lagi
                isGeneratingQR = false
            }
        }
    }

    /**
     * Ekstrak pesan user-friendly dari string error yang mungkin mengandung JSON.
     * Contoh input:  "HTTP Error 422: {\"message\":\"QR hanya bisa dibuat...\"}"
     * Contoh output: "QR hanya bisa dibuat pada jam aktif atau 15 menit sebelumnya (07:00 - 08:20)"
     */
    private fun extractBackendMessage(raw: String): String {
        return try {
            // Cari JSON object di dalam string error
            val jsonStart = raw.indexOf('{')
            if (jsonStart >= 0) {
                val jsonStr = raw.substring(jsonStart)
                val json    = org.json.JSONObject(jsonStr)
                // Backend Laravel mengirim pesan di field "message"
                json.optString("message", "").takeIf { it.isNotBlank() } ?: raw
            } else {
                raw
            }
        } catch (e: Exception) {
            raw
        }
    }

    // ── Loading dialog ─────────────────────────────────────────────

    private fun showLoadingDialog(message: String) {
        dismissLoadingDialog()
        if (isFinishing || isDestroyed) return

        val density = resources.displayMetrics.density

        val root = android.widget.LinearLayout(this).apply {
            orientation = android.widget.LinearLayout.HORIZONTAL
            gravity     = Gravity.CENTER_VERTICAL
            setPadding(
                (24 * density).toInt(), (20 * density).toInt(),
                (24 * density).toInt(), (20 * density).toInt()
            )
            background = createRoundedBackground(Color.WHITE, 16 * density)
        }

        val progress = android.widget.ProgressBar(this).apply {
            layoutParams = android.widget.LinearLayout.LayoutParams(
                (32 * density).toInt(), (32 * density).toInt()
            ).also { it.marginEnd = (16 * density).toInt() }
            isIndeterminate = true
        }

        val tv = TextView(this).apply {
            text     = message
            textSize = 15f
            setTextColor(Color.parseColor("#1A1A2E"))
        }

        root.addView(progress)
        root.addView(tv)

        val dialog = AppCompatDialog(this).apply {
            requestWindowFeature(Window.FEATURE_NO_TITLE)
            setContentView(root)
            window?.apply {
                setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
                addFlags(WindowManager.LayoutParams.FLAG_DIM_BEHIND)
                attributes = attributes?.also { it.dimAmount = 0.5f }
                setLayout(
                    WindowManager.LayoutParams.WRAP_CONTENT,
                    WindowManager.LayoutParams.WRAP_CONTENT
                )
                setGravity(Gravity.CENTER)
            }
            setCancelable(false)
        }

        loadingDialog = dialog
        dialog.show()
    }

    private fun dismissLoadingDialog() {
        loadingDialog?.dismiss()
        loadingDialog = null
    }

    // ── Error dialog untuk QR (bukan Toast, agar tidak antri) ──────

    private fun showQRErrorDialog(message: String) {
        if (isFinishing || isDestroyed) return

        val density = resources.displayMetrics.density

        val root = android.widget.LinearLayout(this).apply {
            orientation = android.widget.LinearLayout.VERTICAL
            gravity     = Gravity.CENTER
            setPadding(
                (24 * density).toInt(), (24 * density).toInt(),
                (24 * density).toInt(), (24 * density).toInt()
            )
            background = createRoundedBackground(Color.WHITE, 16 * density)
        }

        // Ikon ⚠
        val tvIcon = TextView(this).apply {
            text      = "⚠️"
            textSize  = 36f
            gravity   = Gravity.CENTER
            layoutParams = android.widget.LinearLayout.LayoutParams(
                android.widget.LinearLayout.LayoutParams.MATCH_PARENT,
                android.widget.LinearLayout.LayoutParams.WRAP_CONTENT
            ).also { it.bottomMargin = (12 * density).toInt() }
        }

        // Pesan
        val tvMsg = TextView(this).apply {
            text      = message
            textSize  = 14f
            gravity   = Gravity.CENTER
            setTextColor(Color.parseColor("#333333"))
            layoutParams = android.widget.LinearLayout.LayoutParams(
                android.widget.LinearLayout.LayoutParams.MATCH_PARENT,
                android.widget.LinearLayout.LayoutParams.WRAP_CONTENT
            ).also { it.bottomMargin = (20 * density).toInt() }
        }

        // Tombol OK
        val btnOk = android.widget.Button(this).apply {
            text      = "OK"
            textSize  = 15f
            setTextColor(Color.WHITE)
            background = createRoundedBackground(Color.parseColor("#3F51B5"), 10 * density)
            layoutParams = android.widget.LinearLayout.LayoutParams(
                (120 * density).toInt(),
                (44 * density).toInt()
            ).also { it.gravity = Gravity.CENTER_HORIZONTAL }
        }

        root.addView(tvIcon)
        root.addView(tvMsg)
        root.addView(btnOk)

        val dialog = AppCompatDialog(this).apply {
            requestWindowFeature(Window.FEATURE_NO_TITLE)
            setContentView(root)
            window?.apply {
                setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
                addFlags(WindowManager.LayoutParams.FLAG_DIM_BEHIND)
                attributes = attributes?.also { it.dimAmount = 0.6f }
                setLayout(
                    (resources.displayMetrics.widthPixels * 0.82).toInt(),
                    WindowManager.LayoutParams.WRAP_CONTENT
                )
                setGravity(Gravity.CENTER)
            }
            setCanceledOnTouchOutside(true)
        }

        btnOk.setOnClickListener { dialog.dismiss() }
        dialog.show()
    }

    /**
     * Dialog QR Code dengan latar belakang gelap/blur.
     *
     * Menggunakan AppCompatDialog (bukan AlertDialog) agar bisa menerapkan
     * layout custom penuh tanpa conflict antara setMessage + setView.
     * WindowManager.LayoutParams.FLAG_DIM_BEHIND menggelapkan layar di belakang.
     */
    private fun showQRDialog(token: String, expiresAt: String, bitmap: Bitmap) {
        // Dismiss dialog lama kalau masih terbuka
        qrDialog?.dismiss()

        val dialog = AppCompatDialog(this).apply {
            requestWindowFeature(Window.FEATURE_NO_TITLE)
            setContentView(buildQRDialogView(token, expiresAt, bitmap))
            window?.apply {
                // Background dialog transparan → card di dalam yang memiliki warna
                setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
                // Efek gelap di belakang dialog
                addFlags(WindowManager.LayoutParams.FLAG_DIM_BEHIND)
                attributes = attributes?.also { it.dimAmount = 0.75f }
                // Ukuran dialog: lebar hampir penuh layar
                setLayout(
                    (resources.displayMetrics.widthPixels * 0.88).toInt(),
                    WindowManager.LayoutParams.WRAP_CONTENT
                )
                setGravity(Gravity.CENTER)
            }
            setCanceledOnTouchOutside(true)
            setOnDismissListener { qrDialog = null }
        }

        qrDialog = dialog
        dialog.show()
    }

    /**
     * Membangun View untuk dialog QR secara programatik.
     * Tidak memerlukan XML layout baru sama sekali.
     */
    private fun buildQRDialogView(
        token: String,
        expiresAt: String,
        bitmap: Bitmap
    ): android.view.View {
        val ctx        = this
        val density    = resources.displayMetrics.density

        // ── Root card ──────────────────────────────────────────────────────────
        val card = android.widget.LinearLayout(ctx).apply {
            orientation    = android.widget.LinearLayout.VERTICAL
            gravity        = Gravity.CENTER
            setPadding(
                (24 * density).toInt(),
                (24 * density).toInt(),
                (24 * density).toInt(),
                (24 * density).toInt()
            )
            background = createRoundedBackground(Color.WHITE, 24 * density)
        }

        // ── Judul ─────────────────────────────────────────────────────────────
        val tvTitle = TextView(ctx).apply {
            text      = "QR Code Absensi"
            textSize  = 18f
            setTextColor(Color.parseColor("#1A1A2E"))
            typeface  = android.graphics.Typeface.DEFAULT_BOLD
            gravity   = Gravity.CENTER
            layoutParams = android.widget.LinearLayout.LayoutParams(
                android.widget.LinearLayout.LayoutParams.MATCH_PARENT,
                android.widget.LinearLayout.LayoutParams.WRAP_CONTENT
            ).also { it.bottomMargin = (12 * density).toInt() }
        }

        // ── QR Image ──────────────────────────────────────────────────────────
        val qrSize = (260 * density).toInt()
        val ivQr = ImageView(ctx).apply {
            setImageBitmap(bitmap)
            scaleType    = ImageView.ScaleType.FIT_CENTER
            layoutParams = android.widget.LinearLayout.LayoutParams(qrSize, qrSize).also {
                it.gravity      = Gravity.CENTER_HORIZONTAL
                it.bottomMargin = (16 * density).toInt()
            }
            // Padding putih tipis di sekitar QR agar scanner mudah mendeteksi
            setPadding(
                (8 * density).toInt(),
                (8 * density).toInt(),
                (8 * density).toInt(),
                (8 * density).toInt()
            )
            background = createRoundedBackground(Color.parseColor("#F5F5F5"), 12 * density)
        }

        // ── Divider tipis ─────────────────────────────────────────────────────
        val divider = android.view.View(ctx).apply {
            layoutParams = android.widget.LinearLayout.LayoutParams(
                android.widget.LinearLayout.LayoutParams.MATCH_PARENT,
                (1 * density).toInt()
            ).also {
                it.bottomMargin = (12 * density).toInt()
            }
            setBackgroundColor(Color.parseColor("#E0E0E0"))
        }

        // ── Info berlaku sampai ───────────────────────────────────────────────
        val tvExpiry = TextView(ctx).apply {
            text      = "Berlaku hingga:\n$expiresAt"
            textSize  = 13f
            setTextColor(Color.parseColor("#555555"))
            gravity   = Gravity.CENTER
            layoutParams = android.widget.LinearLayout.LayoutParams(
                android.widget.LinearLayout.LayoutParams.MATCH_PARENT,
                android.widget.LinearLayout.LayoutParams.WRAP_CONTENT
            ).also { it.bottomMargin = (16 * density).toInt() }
        }

        // ── Instruksi kecil ───────────────────────────────────────────────────
        val tvHint = TextView(ctx).apply {
            text      = "Arahkan kamera siswa ke QR ini untuk absen"
            textSize  = 11f
            setTextColor(Color.parseColor("#888888"))
            gravity   = Gravity.CENTER
            layoutParams = android.widget.LinearLayout.LayoutParams(
                android.widget.LinearLayout.LayoutParams.MATCH_PARENT,
                android.widget.LinearLayout.LayoutParams.WRAP_CONTENT
            ).also { it.bottomMargin = (20 * density).toInt() }
        }

        // ── Tombol Tutup ──────────────────────────────────────────────────────
        val btnClose = android.widget.Button(ctx).apply {
            text      = "Tutup"
            textSize  = 15f
            setTextColor(Color.WHITE)
            background = createRoundedBackground(Color.parseColor("#3F51B5"), 12 * density)
            layoutParams = android.widget.LinearLayout.LayoutParams(
                android.widget.LinearLayout.LayoutParams.MATCH_PARENT,
                (48 * density).toInt()
            )
            setPadding(0, 0, 0, 0)
            setOnClickListener {
                qrDialog?.dismiss()
                qrDialog = null
            }
        }

        // ── Rakit semua view ke card ───────────────────────────────────────────
        card.addView(tvTitle)
        card.addView(ivQr)
        card.addView(divider)
        card.addView(tvExpiry)
        card.addView(tvHint)
        card.addView(btnClose)

        return card
    }

    /**
     * Helper: buat GradientDrawable dengan corner radius untuk background view.
     */
    private fun createRoundedBackground(fillColor: Int, radiusDp: Float): android.graphics.drawable.GradientDrawable {
        return android.graphics.drawable.GradientDrawable().apply {
            shape       = android.graphics.drawable.GradientDrawable.RECTANGLE
            cornerRadius = radiusDp
            setColor(fillColor)
        }
    }

    // =========================================================
    // CALENDAR & DATE
    // =========================================================

    private fun setupCalendarButton() {
        iconCalendar.setOnClickListener { showDatePicker() }
    }

    private fun showDatePicker() {
        DatePickerDialog(
            this,
            { _, year, month, day ->
                selectedDate.set(year, month, day)
                updateTanggalDisplay()
                loadDailySchedule()
            },
            selectedDate.get(Calendar.YEAR),
            selectedDate.get(Calendar.MONTH),
            selectedDate.get(Calendar.DAY_OF_MONTH)
        ).show()
    }

    private fun getFormattedDate(): String {
        val localeId = Locale("id", "ID")
        val sdf      = SimpleDateFormat("EEEE, dd MMMM yyyy", localeId)
        return sdf.format(selectedDate.time)
            .replaceFirstChar { if (it.isLowerCase()) it.titlecase(localeId) else it.toString() }
    }

    private fun updateTanggalDisplay() {
        txtTanggal.text = getFormattedDate()
    }

    // =========================================================
    // NAVIGATION & BACK
    // =========================================================

    private fun setupBackPressedHandler() {
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() { navigateToRiwayatKehadiran() }
        })
    }

    private fun navigateToRiwayatKehadiran() {
        if (isPengurus) {
            startActivity(
                Intent(this, RiwayatKehadiranKelasPengurusActivity::class.java).apply {
                    putExtra("IS_PENGURUS", true)
                    flags = Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP
                }
            )
        } else {
            startActivity(
                Intent(this, RiwayatKehadiranKelasSiswaActivity::class.java).apply {
                    flags = Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP
                }
            )
        }
        finish()
    }
}