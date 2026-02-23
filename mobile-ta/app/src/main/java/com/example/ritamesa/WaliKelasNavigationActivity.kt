package com.example.ritamesa

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.fragment.app.Fragment
import androidx.fragment.app.FragmentManager

class WaliKelasNavigationActivity : AppCompatActivity() {

    private lateinit var fragmentManager: FragmentManager
    
    private lateinit var dashboardFragment: WaliKelasDashboardFragment
    private lateinit var notifikasiFragment: WaliKelasNotifikasiFragment

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_guru_navigation)

        fragmentManager = supportFragmentManager

        dashboardFragment = WaliKelasDashboardFragment.newInstance()
        notifikasiFragment = WaliKelasNotifikasiFragment.newInstance()

        dashboardFragment.setNavigationCallback { destination -> navigateTo(destination) }
        notifikasiFragment.setNavigationCallback { destination -> navigateTo(destination) }

        if (savedInstanceState == null) {
            replaceFragment(dashboardFragment)
        }
    }

    private fun navigateTo(destination: String) {
        when (destination) {
            "dashboard" -> replaceFragment(dashboardFragment)
            "riwayat" -> replaceFragment(dashboardFragment)  // Simplified: riwayat navigates to dashboard
            "tindak_lanjut" -> replaceFragment(dashboardFragment)  // Simplified: tindak_lanjut navigates to dashboard
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
