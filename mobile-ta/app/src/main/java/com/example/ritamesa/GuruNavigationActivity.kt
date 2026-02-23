package com.example.ritamesa

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.fragment.app.Fragment
import androidx.fragment.app.FragmentManager

class GuruNavigationActivity : AppCompatActivity() {

    private lateinit var fragmentManager: FragmentManager
    
    private lateinit var dashboardFragment: GuruDashboardFragment
    private lateinit var riwayatFragment: GuruRiwayatFragment
    private lateinit var tindakLanjutFragment: GuruTindakLanjutFragment
    private lateinit var notifikasiFragment: GuruNotifikasiFragment

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_guru_navigation)

        fragmentManager = supportFragmentManager

        // Initialize fragments
        dashboardFragment = GuruDashboardFragment.newInstance()
        riwayatFragment = GuruRiwayatFragment.newInstance()
        tindakLanjutFragment = GuruTindakLanjutFragment.newInstance()
        notifikasiFragment = GuruNotifikasiFragment.newInstance()

        // Set navigation callbacks for each fragment
        dashboardFragment.setNavigationCallback { destination -> navigateTo(destination) }
        riwayatFragment.setNavigationCallback { destination -> navigateTo(destination) }
        tindakLanjutFragment.setNavigationCallback { destination -> navigateTo(destination) }
        notifikasiFragment.setNavigationCallback { destination -> navigateTo(destination) }

        // Show dashboard fragment by default
        if (savedInstanceState == null) {
            replaceFragment(dashboardFragment)
        }
    }

    private fun navigateTo(destination: String) {
        when (destination) {
            "dashboard" -> replaceFragment(dashboardFragment)
            "riwayat" -> replaceFragment(riwayatFragment)
            "tindak_lanjut" -> replaceFragment(tindakLanjutFragment)
            "notifikasi" -> replaceFragment(notifikasiFragment)
        }
    }

    private fun replaceFragment(fragment: Fragment) {
        fragmentManager.beginTransaction()
            .replace(R.id.fragmentContainer, fragment)
            .addToBackStack(null)
            .commit()
    }
}
