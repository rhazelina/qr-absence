package com.example.ritamesa

import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import android.util.Log
import android.widget.Toast

class SimpleSiswaAdapter(
    private val context: Context,
    private var dataList: List<Map<String, Any>>,
    private val onMarkPresent: (Map<String, Any>) -> Unit = {},
    private val onMarkAbsent: (Map<String, Any>) -> Unit = {},
    private val onOpenExcuseDialog: (Map<String, Any>) -> Unit = {}
) : RecyclerView.Adapter<SimpleSiswaAdapter.ViewHolder>() {

    companion object {
        private const val TAG = "SimpleSiswaAdapter"
    }

    class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val txtSubjudul: TextView? = view.findViewById(R.id.txt_subjudul)
        val txtMapel: TextView? = view.findViewById(R.id.txt_mata_pelajaran)
        val txtKeterangan: TextView? = view.findViewById(R.id.txt_keterangan)
        val actionHadir: TextView? = view.findViewById(R.id.action_hadir)
        val actionSakit: TextView? = view.findViewById(R.id.action_sakit)
        val actionAlpha: TextView? = view.findViewById(R.id.action_alpha)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        return try {
            val view = LayoutInflater.from(parent.context)
                .inflate(R.layout.riwayat_kehadiran_siswa_wakel, parent, false)
            ViewHolder(view)
        } catch (e: Exception) {
            Log.e(TAG, "Error inflating layout: ${e.message}")
            // Fallback ke layout minimal
            val view = View(parent.context)
            ViewHolder(view)
        }
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        try {
            if (position < 0 || position >= dataList.size) return

            val data = dataList[position]
            val nama = data["nama"]?.toString() ?: "Tanpa Nama"
            val nisn = data["nisn"]?.toString() ?: "-"
            val className = data["kelas"]?.toString() ?: data["class"]?.toString() ?: "-"
            val rawStatus = data["status"]?.toString()?.lowercase() ?: "hadir"
            val reason = data["reason"]?.toString()
            val statusGroup = when (rawStatus) {
                "present", "hadir", "late", "terlambat" -> "hadir"
                "sick", "sakit" -> "sakit"
                "excused", "permission", "izin" -> "izin"
                else -> "alpha"
            }

            holder.txtSubjudul?.text = nama
            holder.txtMapel?.text = "$nisn • $className"

            // Logika UI Dispensasi
            val isDispen = rawStatus == "dispensasi" || rawStatus == "dispen" ||
                    (rawStatus == "hadir" && !reason.isNullOrBlank())

            if (isDispen) {
                holder.txtKeterangan?.text = "Status: Hadir (Dispen)"
                holder.txtKeterangan?.setTextColor(android.graphics.Color.parseColor("#2196F3")) // Biru
            } else {
                holder.txtKeterangan?.text = "Status: ${rawStatus.uppercase()}"
                holder.txtKeterangan?.setTextColor(android.graphics.Color.BLACK)
            }

            updateActionStyle(holder.actionHadir, statusGroup == "hadir")
            updateActionStyle(holder.actionSakit, statusGroup == "sakit" || statusGroup == "izin")
            updateActionStyle(holder.actionAlpha, statusGroup == "alpha")

            holder.actionHadir?.setOnClickListener { onMarkPresent(data) }
            holder.actionSakit?.setOnClickListener { onOpenExcuseDialog(data) }
            holder.actionAlpha?.setOnClickListener { onMarkAbsent(data) }

            // Click listener untuk detail dispen/reason
            holder.itemView.setOnClickListener {
                if (isDispen && !reason.isNullOrBlank()) {
                    showReasonDialog(nama, reason)
                } else {
                    Log.d(TAG, "Item clicked: $nama, Status: $rawStatus")
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error binding data at position $position: ${e.message}")
            holder.txtSubjudul?.text = "Error"
            holder.txtMapel?.text = "Error"
            holder.txtKeterangan?.text = "Error"
        }
    }

    private fun updateActionStyle(view: TextView?, isActive: Boolean) {
        view ?: return
        view.alpha = if (isActive) 1f else 0.7f
    }

    private fun showReasonDialog(nama: String, reason: String) {
        try {
            androidx.appcompat.app.AlertDialog.Builder(context)
                .setTitle("Keterangan Dispensasi")
                .setMessage("Siswa: $nama\n\nAlasan: $reason")
                .setPositiveButton("Tutup", null)
                .show()
        } catch (e: Exception) {
            Log.e(TAG, "Gagal menampilkan dialog: ${e.message}")
            Toast.makeText(context, "Alasan: $reason", Toast.LENGTH_LONG).show()
        }
    }

    override fun getItemCount(): Int = dataList.size

    fun updateData(newData: List<Map<String, Any>>) {
        this.dataList = newData
        notifyDataSetChanged()
    }
}

//package com.example.ritamesa
//
//import android.content.Context
//import android.view.LayoutInflater
//import android.view.View
//import android.view.ViewGroup
//import android.widget.TextView
//import androidx.recyclerview.widget.RecyclerView
//import android.util.Log
//import android.widget.Toast
//
//class SimpleSiswaAdapter(
//    private val context: Context,
//    private var dataList: List<Map<String, Any>>
//) : RecyclerView.Adapter<SimpleSiswaAdapter.ViewHolder>() {
//
//    companion object {
//        private const val TAG = "SimpleSiswaAdapter"
//    }
//
//    class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
//        val txtSubjudul: TextView? = view.findViewById(R.id.txt_subjudul)
//        val txtMapel: TextView? = view.findViewById(R.id.txt_mata_pelajaran)
//        val txtKeterangan: TextView? = view.findViewById(R.id.txt_keterangan)
//    }
//
//    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
//        return try {
//            val view = LayoutInflater.from(parent.context)
//                .inflate(R.layout.riwayat_kehadiran_siswa_wakel, parent, false)
//            ViewHolder(view)
//        } catch (e: Exception) {
//            Log.e(TAG, "Error inflating layout: ${e.message}")
//            // Fallback ke layout minimal
//            val view = View(parent.context)
//            ViewHolder(view)
//        }
//    }
//
//    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
//        try {
//            if (position < 0 || position >= dataList.size) return
//
//            val data = dataList[position]
//            val nama = data["nama"]?.toString() ?: "Tanpa Nama"
//            val nisn = data["nisn"]?.toString() ?: "-"
//            val className = data["kelas"]?.toString() ?: data["class"]?.toString() ?: "-"
//            val rawStatus = data["status"]?.toString()?.lowercase() ?: "hadir"
//            val reason = data["reason"]?.toString()
//
//            holder.txtSubjudul?.text = nama
//            holder.txtMapel?.text = "$nisn • $className"
//
//            // Logika UI Dispensasi
//            val isDispen = rawStatus == "dispensasi" || rawStatus == "dispen" ||
//                    (rawStatus == "hadir" && !reason.isNullOrBlank())
//
//            if (isDispen) {
//                holder.txtKeterangan?.text = "Status: Hadir (Dispen)"
//                holder.txtKeterangan?.setTextColor(android.graphics.Color.parseColor("#2196F3")) // Biru
//            } else {
//                holder.txtKeterangan?.text = "Status: ${rawStatus.uppercase()}"
//                holder.txtKeterangan?.setTextColor(android.graphics.Color.BLACK)
//            }
//
//            // Click listener untuk detail dispen/reason
//            holder.itemView.setOnClickListener {
//                if (isDispen && !reason.isNullOrBlank()) {
//                    showReasonDialog(nama, reason)
//                } else {
//                    Log.d(TAG, "Item clicked: $nama, Status: $rawStatus")
//                }
//            }
//        } catch (e: Exception) {
//            Log.e(TAG, "Error binding data at position $position: ${e.message}")
//            holder.txtSubjudul?.text = "Error"
//            holder.txtMapel?.text = "Error"
//            holder.txtKeterangan?.text = "Error"
//        }
//    }
//
//    private fun showReasonDialog(nama: String, reason: String) {
//        try {
//            androidx.appcompat.app.AlertDialog.Builder(context)
//                .setTitle("Keterangan Dispensasi")
//                .setMessage("Siswa: $nama\n\nAlasan: $reason")
//                .setPositiveButton("Tutup", null)
//                .show()
//        } catch (e: Exception) {
//            Log.e(TAG, "Gagal menampilkan dialog: ${e.message}")
//            Toast.makeText(context, "Alasan: $reason", Toast.LENGTH_LONG).show()
//        }
//    }
//
//    override fun getItemCount(): Int = dataList.size
//
//    fun updateData(newData: List<Map<String, Any>>) {
//        this.dataList = newData
//        notifyDataSetChanged()
//    }
//}
