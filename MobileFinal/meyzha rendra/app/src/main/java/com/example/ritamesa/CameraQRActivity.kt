package com.example.ritamesa

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.ImageButton
import android.widget.ProgressBar
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import com.example.ritamesa.data.api.ApiClient
import com.example.ritamesa.data.repository.AttendanceRepository
import com.google.zxing.ResultPoint
import com.journeyapps.barcodescanner.BarcodeCallback
import com.journeyapps.barcodescanner.BarcodeResult
import com.journeyapps.barcodescanner.DecoratedBarcodeView
import kotlinx.coroutines.launch

class CameraQRActivity : AppCompatActivity() {

    private lateinit var barcodeView: DecoratedBarcodeView
    private lateinit var btnBack: ImageButton
    private lateinit var btnFlash: ImageButton
    private lateinit var progressBar: ProgressBar

    private var isFlashOn = false
    private var isScanning = true

    private lateinit var attendanceRepo: AttendanceRepository
    private lateinit var barcodeCallback: BarcodeCallback

    companion object {
        private const val CAMERA_PERMISSION_REQUEST = 100
        const val EXTRA_QR_RESULT = "qr_result"
        const val EXTRA_IS_TEACHER = "IS_TEACHER"
        const val EXTRA_MAPEL = "mapel"
        const val EXTRA_KELAS = "kelas"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_camera_qr)

        attendanceRepo = AttendanceRepository(ApiClient.getService(this))

        initViews()
        setupCallback()
        setupCamera()
        setupButtonListeners()
    }

    private fun initViews() {
        barcodeView = findViewById(R.id.barcode_scanner)
        btnBack = findViewById(R.id.btn_back_camera)
        btnFlash = findViewById(R.id.btn_flash)
        progressBar = findViewById(R.id.progress_bar)
    }

    private fun setupCallback() {
        barcodeCallback = object : BarcodeCallback {
            override fun barcodeResult(result: BarcodeResult) {
                if (!isScanning) return
                isScanning = false
                handleQRResult(result.text)
            }

            override fun possibleResultPoints(resultPoints: MutableList<ResultPoint>?) {
            }
        }
    }

    private fun setupCamera() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA)
            != PackageManager.PERMISSION_GRANTED
        ) {
            ActivityCompat.requestPermissions(
                this,
                arrayOf(Manifest.permission.CAMERA),
                CAMERA_PERMISSION_REQUEST
            )
        } else {
            startCamera()
        }
    }

    private fun startCamera() {
        try {
            barcodeView.decodeContinuous(barcodeCallback)
            barcodeView.resume()
        } catch (e: Exception) {
            Log.e("CameraQRActivity", "Failed to start camera", e)
        }
    }

    private fun handleQRResult(qrText: String) {
        progressBar.visibility = View.VISIBLE
        barcodeView.pause()

        lifecycleScope.launch {
            try {
                val isTeacher = intent.getBooleanExtra(EXTRA_IS_TEACHER, false)
                val response = if (isTeacher) {
                    attendanceRepo.scanStudentQr(qrText)
                } else {
                    attendanceRepo.scanQr(qrText)
                }
                progressBar.visibility = View.GONE
                
                if (response.isSuccessful) {
                    Toast.makeText(this@CameraQRActivity, "Absen Berhasil", Toast.LENGTH_LONG).show()
                    setResult(RESULT_OK)
                    finish()
                } else {
                    val msg = when (response.code()) {
                        403 -> "QR Tidak Valid / Ditolak (Bukan Jadwal Anda)"
                        409 -> "Anda sudah absen"
                        422 -> "QR sudah kedaluwarsa"
                        else -> "Gagal Absen: HTTP ${response.code()}"
                    }
                    Toast.makeText(this@CameraQRActivity, msg, Toast.LENGTH_LONG).show()
                    
                    // Resume scanning
                    isScanning = true
                    barcodeView.resume()
                }
            } catch (e: Exception) {
                progressBar.visibility = View.GONE
                Toast.makeText(this@CameraQRActivity, "Error Jaringan: ${e.message}", Toast.LENGTH_LONG).show()
                Log.e("CameraQRActivity", "API Error: ", e)
                
                // Resume scanning
                isScanning = true
                barcodeView.resume()
            }
        }
    }

    private fun setupButtonListeners() {
        btnBack.setOnClickListener {
            setResult(RESULT_CANCELED)
            finish()
        }

        btnFlash.setOnClickListener {
            toggleFlash()
        }
    }

    private fun toggleFlash() {
        isFlashOn = !isFlashOn
        if (isFlashOn) {
            try {
                barcodeView.setTorchOn()
            } catch (e: Exception) {
            }
            btnFlash.setImageResource(R.drawable.ic_flash_on)
        } else {
            try {
                barcodeView.setTorchOff()
            } catch (e: Exception) {
            }
            btnFlash.setImageResource(R.drawable.ic_flash_off)
        }
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)

        if (requestCode == CAMERA_PERMISSION_REQUEST &&
            grantResults.isNotEmpty() &&
            grantResults[0] == PackageManager.PERMISSION_GRANTED
        ) {
            startCamera()
        } else {
            Toast.makeText(this, "Izin kamera diperlukan untuk fitur ini", Toast.LENGTH_LONG).show()
        }
    }

    override fun onResume() {
        super.onResume()
        try {
            barcodeView.resume()
        } catch (e: Exception) {
        }
    }

    override fun onPause() {
        super.onPause()
        try {
            barcodeView.pause()
            barcodeView.setTorchOff()
        } catch (e: Exception) {
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        try {
            barcodeView.pause()
        } catch (e: Exception) {
        }
    }
}
