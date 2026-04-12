package com.example.ritamesa

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView

class RiwayatAbsenAdapter(
    private val riwayatList: List<RiwayatAbsenItem>
) : RecyclerView.Adapter<RiwayatAbsenAdapter.RiwayatViewHolder>() {

    class RiwayatViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val txtSubjudul: TextView = view.findViewById(R.id.txt_subjudul)
        val txtTanggal: TextView = view.findViewById(R.id.txt_tanggal)
        val txtWaktu: TextView = view.findViewById(R.id.txt_waktu)
        val imgStatus: ImageView = view.findViewById(R.id.img_status)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RiwayatViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.bar_riwayat_siswa_wakel, parent, false)
        return RiwayatViewHolder(view)
    }

    override fun onBindViewHolder(holder: RiwayatViewHolder, position: Int) {
        val riwayat = riwayatList[position]

        // Set data ke view
        holder.txtSubjudul.text = "${riwayat.namaSiswa} / ${riwayat.jurusan}"
        holder.txtTanggal.text = riwayat.tanggal
        holder.txtWaktu.text = "Pukul ${riwayat.waktu}"

        val rawStatus = riwayat.status.lowercase()
        val reason = riwayat.reason

        // Logika Dispensasi
        val isDispen = rawStatus == "dispensasi" || rawStatus == "dispen" ||
                (rawStatus == "hadir" && !reason.isNullOrBlank())

        // Set image berdasarkan status
        val imageResource = when {
            isDispen -> R.drawable.siswa_hadir_wakel // Icon tetap hadir atau bisa disesuaikan
            rawStatus == "hadir" -> R.drawable.siswa_hadir_wakel
            rawStatus == "izin"  -> R.drawable.siswa_izin_wakel
            rawStatus == "sakit" -> R.drawable.siswa_sakit_wakel
            rawStatus == "alpha" -> R.drawable.siswa_alpha_wakel
            else -> R.drawable.siswa_hadir_wakel
        }
        holder.imgStatus.setImageResource(imageResource)

        // UI Tweak untuk Dispen
        if (isDispen) {
            holder.txtWaktu.text = "Pukul ${riwayat.waktu} • Hadir (Dispen)"
            holder.txtWaktu.setTextColor(android.graphics.Color.parseColor("#2196F3"))
        } else {
            holder.txtWaktu.setTextColor(android.graphics.Color.parseColor("#4B5563"))
        }

        // Listener untuk alasan dispen
        holder.itemView.setOnClickListener {
            if (isDispen && !reason.isNullOrBlank()) {
                showReasonDialog(holder.itemView.context, riwayat.namaSiswa, reason)
            }
        }
    }

    private fun showReasonDialog(context: android.content.Context, nama: String, reason: String) {
        androidx.appcompat.app.AlertDialog.Builder(context)
            .setTitle("Detail Dispensasi")
            .setMessage("Siswa: $nama\n\nKeterangan: $reason")
            .setPositiveButton("Tutup", null)
            .show()
    }

    override fun getItemCount(): Int {
        return riwayatList.size
    }
}