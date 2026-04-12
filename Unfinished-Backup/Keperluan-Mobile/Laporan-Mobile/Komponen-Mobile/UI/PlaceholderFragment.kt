package com.example.ritamesa

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.fragment.app.Fragment

/**
 * Fragment sementara untuk menggantikan fragment yang belum diimplementasi.
 * Dipakai oleh GuruNavigationActivity dan WaliKelasNavigationActivity
 * agar tidak crash dengan NoClassDefFoundError saat fragment belum ada.
 *
 * Hapus penggunaan PlaceholderFragment ini setelah fragment asli sudah dibuat.
 */
class PlaceholderFragment : Fragment() {

    companion object {
        private const val ARG_TITLE = "title"

        fun newInstance(title: String = "Halaman"): PlaceholderFragment {
            return PlaceholderFragment().apply {
                arguments = Bundle().apply {
                    putString(ARG_TITLE, title)
                }
            }
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        // Layout sederhana: satu TextView di tengah
        val textView = TextView(requireContext()).apply {
            val title = arguments?.getString(ARG_TITLE) ?: "Halaman"
            text = "$title\nSegera hadir"
            textSize = 18f
            gravity = android.view.Gravity.CENTER
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
        }
        return textView
    }
}