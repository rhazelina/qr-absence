package com.example.ritamesa

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView

class IzinSakitAdapter(
    private var list: List<Dispensasi>,
    private val onItemClick: (Dispensasi) -> Unit
) : RecyclerView.Adapter<IzinSakitAdapter.ViewHolder>() {

    inner class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val tvNama: TextView = view.findViewById(R.id.tvNamaSiswa)
        val tvKelas: TextView = view.findViewById(R.id.tvKelas)
        val tvTipe: TextView = view.findViewById(R.id.tvTipe)
        val tvTanggal: TextView = view.findViewById(R.id.tvTanggal)
        val ivStatus: ImageView = view.findViewById(R.id.ivStatus)
        val ivCheck: ImageView = view.findViewById(R.id.ivCheckmark)
        val ivCancel: ImageView = view.findViewById(R.id.ivCancel)
        val layout: View = view.findViewById(R.id.itemLayout)

        fun bind(item: Dispensasi) {
            tvNama.text = item.namaSiswa
            tvKelas.text = item.kelas
            tvTipe.text = if (item.catatan.lowercase().contains("sakit")) "Sakit" else "Izin"
            tvTanggal.text = item.tanggal

            // Set status icon
            when (item.status) {
                StatusDispensasi.MENUNGGU -> {
                    ivStatus.setImageResource(R.drawable.menunggusye)
                    ivCheck.visibility = View.GONE
                    ivCancel.visibility = View.GONE
                }
                StatusDispensasi.DISETUJUI -> {
                    ivStatus.setImageResource(R.drawable.diset)
                    ivCheck.visibility = View.VISIBLE
                    ivCancel.visibility = View.GONE
                }
                StatusDispensasi.DITOLAK -> {
                    ivStatus.setImageResource(R.drawable.ditol)
                    ivCheck.visibility = View.GONE
                    ivCancel.visibility = View.VISIBLE
                }
            }

            layout.setOnClickListener { onItemClick(item) }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val v = LayoutInflater.from(parent.context).inflate(R.layout.item_izin_wakel, parent, false)
        return ViewHolder(v)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.bind(list[position])
    }

    override fun getItemCount(): Int = list.size

    fun updateList(newList: List<Dispensasi>) {
        list = newList
        notifyDataSetChanged()
    }
}
