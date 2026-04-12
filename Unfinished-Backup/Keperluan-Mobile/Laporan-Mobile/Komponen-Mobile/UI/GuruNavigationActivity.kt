package com.example.ritamesa

import android.os.Bundle
import androidx.fragment.app.Fragment
import androidx.fragment.app.FragmentManager

class GuruNavigationActivity : BaseNetworkActivity() {

    private lateinit var fragmentManager: FragmentManager

    private lateinit var dashboardFragment: GuruDashboardFragment
    private lateinit var riwayatFragment: Fragment

    // Lacak fragment aktif saat ini untuk logika hide/show
    private var activeFragment: Fragment? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_guru_navigation)

        fragmentManager = supportFragmentManager

        // FIX: Jika activity di-recreate (rotasi layar, dll.), ambil kembali fragment
        // yang sudah ada dari FragmentManager agar tidak double-add.
        if (savedInstanceState != null) {
            dashboardFragment =
                fragmentManager.findFragmentByTag("dashboard") as? GuruDashboardFragment
                    ?: GuruDashboardFragment.newInstance()

            riwayatFragment =
                fragmentManager.findFragmentByTag("riwayat")
                    ?: runCatching { GuruRiwayatFragment.newInstance() }
                        .getOrElse { PlaceholderFragment.newInstance("Riwayat") }

            // Tentukan fragment mana yang sedang tampil
            activeFragment = fragmentManager.fragments.lastOrNull { it.isVisible }
                ?: dashboardFragment

        } else {
            // Inisialisasi pertama kali
            dashboardFragment = GuruDashboardFragment.newInstance()

            riwayatFragment = runCatching { GuruRiwayatFragment.newInstance() }
                .getOrElse {
                    android.util.Log.w("GuruNav", "GuruRiwayatFragment belum ada, pakai placeholder")
                    PlaceholderFragment.newInstance("Riwayat")
                }

            // FIX: Tambahkan semua fragment sekaligus di awal, sisanya di-hide.
            // Ini mencegah fragment di-destroy/recreate setiap kali pindah tab,
            // sehingga coroutine/API call tidak terpotong di tengah jalan.
            fragmentManager.beginTransaction().apply {
                add(R.id.fragmentContainer, dashboardFragment, "dashboard")
                add(R.id.fragmentContainer, riwayatFragment, "riwayat")
                hide(riwayatFragment)
            }.commit()

            activeFragment = dashboardFragment
        }

        // Pasang navigation callback
        dashboardFragment.setNavigationCallback { destination -> navigateTo(destination) }
        (riwayatFragment as? GuruRiwayatFragment)
            ?.setNavigationCallback { destination -> navigateTo(destination) }
    }

    private fun navigateTo(destination: String) {
        val target = when (destination) {
            "dashboard"     -> dashboardFragment
            "riwayat"       -> riwayatFragment
            else            -> return
        }

        if (target === activeFragment) return  // Sudah tampil, tidak perlu apa-apa

        // FIX: Gunakan hide/show, bukan replace.
        // replace() menghancurkan fragment lama → onDestroyView dipanggil →
        // coroutine yang belum selesai bisa lempar IllegalStateException.
        fragmentManager.beginTransaction()
            .hide(activeFragment ?: return)
            .show(target)
            // FIX: HAPUS addToBackStack. Navigasi tab tidak perlu back-stack;
            // menumpuk back-stack menyebabkan tombol Back harus ditekan berkali-kali
            // dan fragment lama di-resume ulang secara tidak terduga.
            .commitAllowingStateLoss()

        activeFragment = target
    }

    // FIX: Tangani tombol Back agar langsung keluar dari activity
    // (bukan muncul kembali ke fragment sebelumnya dari back-stack yang kosong).
    override fun onBackPressed() {
        if (activeFragment !== dashboardFragment) {
            navigateTo("dashboard")
        } else {
            super.onBackPressed()
        }
    }
}


//package com.example.ritamesa
//
//import android.annotation.SuppressLint
//import android.os.Bundle
//import androidx.fragment.app.Fragment
//import androidx.fragment.app.FragmentManager
//
//class GuruNavigationActivity : BaseNetworkActivity() {
//
//    private lateinit var fragmentManager: FragmentManager
//
//    private lateinit var dashboardFragment: GuruDashboardFragment
//    private lateinit var riwayatFragment: Fragment
//    private lateinit var tindakLanjutFragment: Fragment
//    private lateinit var notifikasiFragment: Fragment
//
//    // Lacak fragment aktif saat ini untuk logika hide/show
//    private var activeFragment: Fragment? = null
//
//    override fun onCreate(savedInstanceState: Bundle?) {
//        super.onCreate(savedInstanceState)
//        setContentView(R.layout.activity_guru_navigation)
//
//        fragmentManager = supportFragmentManager
//
//        // FIX: Jika activity di-recreate (rotasi layar, dll.), ambil kembali fragment
//        // yang sudah ada dari FragmentManager agar tidak double-add.
//        if (savedInstanceState != null) {
//            dashboardFragment =
//                fragmentManager.findFragmentByTag("dashboard") as? GuruDashboardFragment
//                    ?: GuruDashboardFragment.newInstance()
//
//            riwayatFragment =
//                fragmentManager.findFragmentByTag("riwayat")
//                    ?: runCatching { GuruRiwayatFragment.newInstance() }
//                        .getOrElse { PlaceholderFragment.newInstance("Riwayat") }
//
//            tindakLanjutFragment =
//                fragmentManager.findFragmentByTag("tindak_lanjut")
//                    ?: runCatching { GuruTindakLanjutFragment.newInstance() }
//                        .getOrElse { PlaceholderFragment.newInstance("Tindak Lanjut") }
//
//            notifikasiFragment =
//                fragmentManager.findFragmentByTag("notifikasi")
//                    ?: runCatching { GuruNotifikasiFragment.newInstance() }
//                        .getOrElse { PlaceholderFragment.newInstance("Notifikasi") }
//
//            // Tentukan fragment mana yang sedang tampil
//            activeFragment = fragmentManager.fragments.lastOrNull { it.isVisible }
//                ?: dashboardFragment
//
//        } else {
//            // Inisialisasi pertama kali
////            dashboardFragment = GuruDashboardFragment.newInstance()
//            dashboardFragment = GuruDashboardFragment.newInstance()
////            riwayatFragment = runCatching { GuruRiwayatFragment.newInstance() } ...
////            tindakLanjutFragment = runCatching { GuruTindakLanjutFragment.newInstance() } ...
//
//            riwayatFragment = runCatching { GuruRiwayatFragment.newInstance() }
//                .getOrElse {
//                    android.util.Log.w("GuruNav", "GuruRiwayatFragment belum ada, pakai placeholder")
//                    PlaceholderFragment.newInstance("Riwayat")
//                }
//
//            tindakLanjutFragment = runCatching { GuruTindakLanjutFragment.newInstance() }
//                .getOrElse {
//                    android.util.Log.w("GuruNav", "GuruTindakLanjutFragment belum ada, pakai placeholder")
//                    PlaceholderFragment.newInstance("Tindak Lanjut")
//                }
//
//            notifikasiFragment = runCatching { GuruNotifikasiFragment.newInstance() }
//                .getOrElse {
//                    android.util.Log.w("GuruNav", "GuruNotifikasiFragment belum ada, pakai placeholder")
//                    PlaceholderFragment.newInstance("Notifikasi")
//                }
//
//            // FIX: Tambahkan semua fragment sekaligus di awal, sisanya di-hide.
//            // Ini mencegah fragment di-destroy/recreate setiap kali pindah tab,
//            // sehingga coroutine/API call tidak terpotong di tengah jalan.
//            fragmentManager.beginTransaction().apply {
//                add(R.id.fragmentContainer, dashboardFragment, "dashboard")
//                add(R.id.fragmentContainer, riwayatFragment, "riwayat")
//                add(R.id.fragmentContainer, tindakLanjutFragment, "tindak_lanjut")
//                add(R.id.fragmentContainer, notifikasiFragment, "notifikasi")
//                hide(riwayatFragment)
//                hide(tindakLanjutFragment)
//                hide(notifikasiFragment)
//            }.commit()
//
//            activeFragment = dashboardFragment
//        }
//
//        // Pasang navigation callback
//        dashboardFragment.setNavigationCallback { destination -> navigateTo(destination) }
//        (riwayatFragment as? GuruRiwayatFragment)
//            ?.setNavigationCallback { destination -> navigateTo(destination) }
//        (tindakLanjutFragment as? GuruTindakLanjutFragment)
//            ?.setNavigationCallback { destination -> navigateTo(destination) }
//        (notifikasiFragment as? GuruNotifikasiFragment)
//            ?.setNavigationCallback { destination -> navigateTo(destination) }
//    }
//
//    private fun navigateTo(destination: String) {
//        val target = when (destination) {
//            "dashboard"     -> dashboardFragment
//            "riwayat"       -> riwayatFragment
//            "tindak_lanjut" -> tindakLanjutFragment
//            "notifikasi"    -> notifikasiFragment
//            else            -> return
//        }
//
//        if (target === activeFragment) return  // Sudah tampil, tidak perlu apa-apa
//
//        // FIX: Gunakan hide/show, bukan replace.
//        // replace() menghancurkan fragment lama → onDestroyView dipanggil →
//        // coroutine yang belum selesai bisa lempar IllegalStateException.
//        fragmentManager.beginTransaction()
//            .hide(activeFragment ?: return)
//            .show(target)
//            // FIX: HAPUS addToBackStack. Navigasi tab tidak perlu back-stack;
//            // menumpuk back-stack menyebabkan tombol Back harus ditekan berkali-kali
//            // dan fragment lama di-resume ulang secara tidak terduga.
//            .commitAllowingStateLoss()
//
//        activeFragment = target
//    }
//
//    // FIX: Tangani tombol Back agar langsung keluar dari activity
//    // (bukan muncul kembali ke fragment sebelumnya dari back-stack yang kosong).
////    @SuppressLint("GestureBackNavigation")
//    override fun onBackPressed() {
//        if (activeFragment !== dashboardFragment) {
//            navigateTo("dashboard")
//        } else {
//            super.onBackPressed()
//        }
//    }
//}