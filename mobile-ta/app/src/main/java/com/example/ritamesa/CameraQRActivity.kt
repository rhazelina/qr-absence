package com.example.ritamesa

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.View
import android.widget.ImageButton
import android.widget.ProgressBar
import android.widget.Toast
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import com.google.zxing.ResultPoint
import com.journeyapps.barcodescanner.BarcodeCallback
import com.journeyapps.barcodescanner.BarcodeResult
import com.journeyapps.barcodescanner.DecoratedBarcodeView
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class CameraQRActivity : BaseNetworkActivity() {

    private lateinit var barcodeView: DecoratedBarcodeView
    private lateinit var btnBack: ImageButton
    private lateinit var btnFlash: ImageButton
    private lateinit var progressBar: ProgressBar

    private var isFlashOn = false
    private var isScanning = true

    private lateinit var barcodeCallback: BarcodeCallback

    companion object {
        private const val CAMERA_PERMISSION_REQUEST = 100
        private const val TAG = "CameraQR"
        const val EXTRA_QR_RESULT = "qr_result"
        const val EXTRA_JADWAL_ID = "jadwal_id"
        const val EXTRA_MAPEL = "mata_pelajaran"
        const val EXTRA_KELAS = "kelas"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_camera_qr)

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
            Log.e(TAG, "Failed to start camera: ${e.message}")
            Toast.makeText(this, "Gagal membuka kamera", Toast.LENGTH_LONG).show()
        }
    }

    private fun handleQRResult(qrToken: String) {
        progressBar.visibility = View.VISIBLE
        isScanning = false

        lifecycleScope.launch {
            Log.d(TAG, "Scanning QR token: $qrToken")
            
            val result = attendanceRepository.scanAttendance(qrToken)
            
            when (result) {
                is com.example.ritamesa.api.Result.Success -> {
                    val attendanceData = result.data
                    Log.d(TAG, "Attendance scan successful: $attendanceData")
                    progressBar.visibility = View.GONE
                    
                    Toast.makeText(
                        this@CameraQRActivity,
                        "Absensi berhasil: ${attendanceData.attendeeName}",
                        Toast.LENGTH_SHORT
                    ).show()
                    
                    val intent = Intent(this@CameraQRActivity, AbsensiSiswaActivity::class.java).apply {
                        putExtra(EXTRA_MAPEL, attendanceData.schedule?.subjectName ?: "")
                        putExtra(EXTRA_KELAS, attendanceData.schedule?.className ?: "")
                        putExtra("status", attendanceData.status)
                        putExtra("scanned_at", attendanceData.scannedAt)
                        putExtra("attendee_name", attendanceData.attendeeName)
                    }
                    startActivity(intent)
                    finish()
                }
                is com.example.ritamesa.api.Result.Error -> {
                    progressBar.visibility = View.GONE
                    Log.e(TAG, "Attendance scan failed: ${result.message}")
                    
                    when {
                        result.message?.contains("expired", ignoreCase = true) == true -> {
                            Toast.makeText(this@CameraQRActivity, "QR Code sudah expired", Toast.LENGTH_LONG).show()
                        }
                        result.message?.contains("invalid", ignoreCase = true) == true -> {
                            Toast.makeText(this@CameraQRActivity, "QR Code tidak valid", Toast.LENGTH_LONG).show()
                        }
                        else -> {
                            Toast.makeText(this@CameraQRActivity, "Gagal scan: ${result.message}", Toast.LENGTH_LONG).show()
                        }
                    }
                    
                    // Allow retry via camera
                    isScanning = true
                }
                is com.example.ritamesa.api.Result.Loading -> { }
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
            Toast.makeText(this, "Izin kamera diperlukan untuk scan QR", Toast.LENGTH_LONG).show()
            finish()
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
