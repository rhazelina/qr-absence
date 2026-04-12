package com.example.ritamesa

import android.os.Bundle
import androidx.fragment.app.Fragment
import androidx.fragment.app.FragmentManager

class WaliKelasNavigationActivity : BaseNetworkActivity() {

    private lateinit var fragmentManager: FragmentManager

    private lateinit var dashboardFragment: WaliKelasDashboardFragment
    private lateinit var riwayatFragment: Fragment
    private lateinit var tindakLanjutFragment: Fragment

    private var activeFragment: Fragment? = null
    private val tindakLanjutClassName = "com.example.ritamesa.WaliKelasTindakLanjutFragment"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_guru_navigation)

        fragmentManager = supportFragmentManager

        if (savedInstanceState != null) {
            dashboardFragment =
                fragmentManager.findFragmentByTag("dashboard") as? WaliKelasDashboardFragment
                    ?: WaliKelasDashboardFragment.newInstance()

            riwayatFragment =
                fragmentManager.findFragmentByTag("riwayat")
                    ?: runCatching { RiwayatKehadiranKelasFragment.newInstance() }
                        .getOrElse { PlaceholderFragment.newInstance("Riwayat") }

            tindakLanjutFragment =
                fragmentManager.findFragmentByTag("tindak_lanjut")
                    ?: runCatching { createTindakLanjutFragment() }
                        .getOrElse { PlaceholderFragment.newInstance("Tindak Lanjut") }

            activeFragment = fragmentManager.fragments.lastOrNull { it.isVisible }
                ?: dashboardFragment

        } else {
            dashboardFragment = WaliKelasDashboardFragment.newInstance()

            riwayatFragment = runCatching { RiwayatKehadiranKelasFragment.newInstance() }
                .getOrElse {
                    android.util.Log.w("WaliKelasNav", "RiwayatKehadiranKelasFragment belum ada")
                    PlaceholderFragment.newInstance("Riwayat")
                }

            tindakLanjutFragment = runCatching { createTindakLanjutFragment() }
                .getOrElse {
                    android.util.Log.w("WaliKelasNav", "WaliKelasTindakLanjutFragment belum ada")
                    PlaceholderFragment.newInstance("Tindak Lanjut")
                }

            fragmentManager.beginTransaction().apply {
                add(R.id.fragmentContainer, dashboardFragment, "dashboard")
                add(R.id.fragmentContainer, riwayatFragment, "riwayat")
                add(R.id.fragmentContainer, tindakLanjutFragment, "tindak_lanjut")
                hide(riwayatFragment)
                hide(tindakLanjutFragment)
            }.commit()

            activeFragment = dashboardFragment
        }

        dashboardFragment.setNavigationCallback { destination -> navigateTo(destination) }
        (riwayatFragment as? RiwayatKehadiranKelasFragment)
            ?.setNavigationCallback { destination -> navigateTo(destination) }
        setNavigationCallbackIfSupported(tindakLanjutFragment) { destination -> navigateTo(destination) }
    }

    private fun createTindakLanjutFragment(): Fragment {
        val clazz = Class.forName(tindakLanjutClassName)
        val newInstance = clazz.methods.firstOrNull {
            it.name == "newInstance" && it.parameterTypes.isEmpty()
        }
        if (newInstance != null) {
            val instance = newInstance.invoke(null)
            if (instance is Fragment) return instance
        }
        val ctor = clazz.getDeclaredConstructor()
        ctor.isAccessible = true
        return ctor.newInstance() as Fragment
    }

    private fun setNavigationCallbackIfSupported(
        fragment: Fragment,
        callback: (String) -> Unit
    ) {
        runCatching {
            val method = fragment::class.java.methods.firstOrNull {
                it.name == "setNavigationCallback" &&
                        it.parameterTypes.size == 1 &&
                        kotlin.jvm.functions.Function1::class.java.isAssignableFrom(it.parameterTypes[0])
            }
            method?.invoke(fragment, callback)
        }
    }

    private fun navigateTo(destination: String) {
        val target = when (destination) {
            "dashboard"     -> dashboardFragment
            "riwayat"       -> riwayatFragment
            "tindak_lanjut" -> tindakLanjutFragment
            else            -> return
        }

        if (target === activeFragment) return

        fragmentManager.beginTransaction()
            .hide(activeFragment ?: return)
            .show(target)
            .commitAllowingStateLoss()

        activeFragment = target
    }

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
//class WaliKelasNavigationActivity : BaseNetworkActivity() {
//
//    private lateinit var fragmentManager: FragmentManager
//
//    private lateinit var dashboardFragment: WaliKelasDashboardFragment
//    private lateinit var riwayatFragment: Fragment
//    private lateinit var tindakLanjutFragment: Fragment
//    private lateinit var notifikasiFragment: Fragment
//
//    private var activeFragment: Fragment? = null
//    private val tindakLanjutClassName = "com.example.ritamesa.WaliKelasTindakLanjutFragment"
//
//    override fun onCreate(savedInstanceState: Bundle?) {
//        super.onCreate(savedInstanceState)
//        setContentView(R.layout.activity_guru_navigation)
//
//        fragmentManager = supportFragmentManager
//
//        if (savedInstanceState != null) {
//            dashboardFragment =
//                fragmentManager.findFragmentByTag("dashboard") as? WaliKelasDashboardFragment
//                    ?: WaliKelasDashboardFragment.newInstance()
//
//            riwayatFragment =
//                fragmentManager.findFragmentByTag("riwayat")
//                    ?: runCatching { RiwayatKehadiranKelasFragment.newInstance() }
//                        .getOrElse { PlaceholderFragment.newInstance("Riwayat") }
//
//            tindakLanjutFragment =
//                fragmentManager.findFragmentByTag("tindak_lanjut")
//                    ?: runCatching { createTindakLanjutFragment() }
//                        .getOrElse { PlaceholderFragment.newInstance("Tindak Lanjut") }
//
//            notifikasiFragment =
//                fragmentManager.findFragmentByTag("notifikasi")
//                    ?: runCatching { NotifikasiWaliKelasFragment.newInstance() }
//                        .getOrElse { PlaceholderFragment.newInstance("Notifikasi") }
//
//            activeFragment = fragmentManager.fragments.lastOrNull { it.isVisible }
//                ?: dashboardFragment
//
//        } else {
//            dashboardFragment = WaliKelasDashboardFragment.newInstance()
//
//            riwayatFragment = runCatching { RiwayatKehadiranKelasFragment.newInstance() }
//                .getOrElse {
//                    android.util.Log.w("WaliKelasNav", "RiwayatKehadiranKelasFragment belum ada")
//                    PlaceholderFragment.newInstance("Riwayat")
//                }
//
//            tindakLanjutFragment = runCatching { createTindakLanjutFragment() }
//                .getOrElse {
//                    android.util.Log.w("WaliKelasNav", "WaliKelasTindakLanjutFragment belum ada")
//                    PlaceholderFragment.newInstance("Tindak Lanjut")
//                }
//
//            notifikasiFragment = runCatching { NotifikasiWaliKelasFragment.newInstance() }
//                .getOrElse {
//                    android.util.Log.w("WaliKelasNav", "NotifikasiWaliKelasFragment belum ada")
//                    PlaceholderFragment.newInstance("Notifikasi")
//                }
//
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
//        dashboardFragment.setNavigationCallback { destination -> navigateTo(destination) }
//        (riwayatFragment as? RiwayatKehadiranKelasFragment)
//            ?.setNavigationCallback { destination -> navigateTo(destination) }
//        setNavigationCallbackIfSupported(tindakLanjutFragment) { destination -> navigateTo(destination) }
//        (notifikasiFragment as? NotifikasiWaliKelasFragment)
//            ?.setNavigationCallback { destination -> navigateTo(destination) }
//    }
//
//    private fun createTindakLanjutFragment(): Fragment {
//        val clazz = Class.forName(tindakLanjutClassName)
//        val newInstance = clazz.methods.firstOrNull {
//            it.name == "newInstance" && it.parameterTypes.isEmpty()
//        }
//        if (newInstance != null) {
//            val instance = newInstance.invoke(null)
//            if (instance is Fragment) return instance
//        }
//        val ctor = clazz.getDeclaredConstructor()
//        ctor.isAccessible = true
//        return ctor.newInstance() as Fragment
//    }
//
//    private fun setNavigationCallbackIfSupported(
//        fragment: Fragment,
//        callback: (String) -> Unit
//    ) {
//        runCatching {
//            val method = fragment::class.java.methods.firstOrNull {
//                it.name == "setNavigationCallback" &&
//                        it.parameterTypes.size == 1 &&
//                        kotlin.jvm.functions.Function1::class.java.isAssignableFrom(it.parameterTypes[0])
//            }
//            method?.invoke(fragment, callback)
//        }
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
//        if (target === activeFragment) return
//
//        fragmentManager.beginTransaction()
//            .hide(activeFragment ?: return)
//            .show(target)
//            .commitAllowingStateLoss()
//
//        activeFragment = target
//    }
//
//    @SuppressLint("GestureBackNavigation")
//    override fun onBackPressed() {
//        if (activeFragment !== dashboardFragment) {
//            navigateTo("dashboard")
//        } else {
//            super.onBackPressed()
//        }
//    }
//}
