package com.example.ritamesa

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.GestureDetector
import android.view.MotionEvent
import android.widget.EditText
import android.widget.ImageButton
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.lifecycle.lifecycleScope
import com.bumptech.glide.Glide
import kotlinx.coroutines.launch
import kotlin.math.abs

class LoginAwal : BaseNetworkActivity() {

    companion object {
        const val EXTRA_ROLE = "SELECTED_ROLE"
    }

    private lateinit var gestureDetector: GestureDetector
    private var selectedRole: String = ""
    private lateinit var appPreferences: AppPreferences

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.login_awal)

        val mainView = findViewById<android.view.View>(R.id.motionLayout)
        ViewCompat.setOnApplyWindowInsetsListener(mainView) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        // Inisialisasi Preferences
        appPreferences = AppPreferences(this)

        // Load tampilan yang sudah diedit
        loadSavedAppearance()

        // Setup dropdown SIMPLE
        setupSimpleDropdown()

        gestureDetector = GestureDetector(
            this,
            object : GestureDetector.SimpleOnGestureListener() {
                private val SWIPE_THRESHOLD = 100
                private val SWIPE_VELOCITY_THRESHOLD = 100

                override fun onFling(
                    e1: MotionEvent?,
                    e2: MotionEvent,
                    velocityX: Float,
                    velocityY: Float
                ): Boolean {
                    if (e1 == null) return false
                    val diffY = e2.y - e1.y

                    if (abs(diffY) > SWIPE_THRESHOLD && abs(velocityY) > SWIPE_VELOCITY_THRESHOLD) {
                        if (diffY < 0) {
                            navigateToNext()
                            return true
                        }
                    }
                    return false
                }
            }
        )

        mainView.setOnTouchListener { _, event ->
            gestureDetector.onTouchEvent(event)
            true
        }
    }

    private fun loadSavedAppearance() {
        try {
            // Load Logo
            val ivLogo = findViewById<ImageView>(R.id.imageView2)
            val savedLogo = appPreferences.getLogoSync()

            println("🔍 LOGIN AWAL - Logo dari DataStore: $savedLogo")

            if (savedLogo.startsWith("content://") || savedLogo.startsWith("file://")) {
                // HAPUS CACHE GLIDE
                Glide.get(this).clearMemory()

                Glide.with(this)
                    .load(Uri.parse(savedLogo))
                    .placeholder(R.drawable.logo_1)
                    .error(R.drawable.logo_1)
                    .skipMemoryCache(true)
                    .diskCacheStrategy(com.bumptech.glide.load.engine.DiskCacheStrategy.NONE)
                    .into(ivLogo)

                println("✅ LOGIN AWAL - Load logo dari URI: $savedLogo")
            } else {
                val resId = resources.getIdentifier(savedLogo, "drawable", packageName)
                if (resId != 0) {
                    ivLogo.setImageResource(resId)
                    println("✅ LOGIN AWAL - Load logo dari resource: $savedLogo")
                } else {
                    ivLogo.setImageResource(R.drawable.logo_1)
                    println("✅ LOGIN AWAL - Load logo default")
                }
            }

            // Load Judul Utama
            val tvJudul = findViewById<TextView>(R.id.textView)
            tvJudul.text = appPreferences.getJudulUtamaSync()
            println("✅ LOGIN AWAL - Judul: ${appPreferences.getJudulUtamaSync()}")

            // Load Sub Judul
            val tvSubJudul = findViewById<TextView>(R.id.textView2)
            tvSubJudul.text = appPreferences.getJudulSubSync()
            println("✅ LOGIN AWAL - Sub Judul: ${appPreferences.getJudulSubSync()}")

        } catch (e: Exception) {
            e.printStackTrace()
            println("❌ LOGIN AWAL - Error: ${e.message}")
        }
    }

    private fun setupSimpleDropdown() {
        val roleEditText = findViewById<EditText>(R.id.role_login)
        val btnDropdown = findViewById<ImageButton>(R.id.btn_dropdown_arrow)

        val roles = arrayOf(
            "Admin",
            "Waka",
            "Guru",
            "Wali Kelas",
            "Siswa",
            "Pengurus"
        )

        var currentIndex = -1

        btnDropdown.setOnClickListener {
            currentIndex = (currentIndex + 1) % roles.size
            selectedRole = roles[currentIndex]
            roleEditText.setText(selectedRole)
            Toast.makeText(this, "Role: $selectedRole", Toast.LENGTH_SHORT).show()
        }

        roleEditText.setOnClickListener {
            btnDropdown.performClick()
        }

        btnDropdown.performClick()
    }

    private fun navigateToNext() {
        if (selectedRole.isEmpty()) {
            Toast.makeText(this, "Pilih role dulu", Toast.LENGTH_SHORT).show()
            return
        }

        val intent = Intent(this, LoginLanjut::class.java)
        intent.putExtra(EXTRA_ROLE, selectedRole)
        startActivity(intent)
        finish()
        overridePendingTransition(
            android.R.anim.slide_in_left,
            android.R.anim.slide_out_right
        )
    }

    override fun onResume() {
        super.onResume()
        // Bersihkan cache Glide setiap kali halaman dibuka
        Glide.get(this).clearMemory()
        loadSavedAppearance()
    }
}