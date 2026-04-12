package com.example.ritamesa

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView

class KelasAdapter(
    private var kelasList: MutableList<Kelas>,
    private val onEditClickListener: (Kelas) -> Unit,
    private val onDeleteClickListener: (Kelas) -> Unit
) : RecyclerView.Adapter<KelasAdapter.ViewHolder>() {

    inner class ViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val tvNo: TextView = itemView.findViewById(R.id.tvNo)
        val tvKonsentrasi: TextView = itemView.findViewById(R.id.tvKonsentrasi)
        val tvKelas: TextView = itemView.findViewById(R.id.tvKelas)
        val tvWaliKelas: TextView = itemView.findViewById(R.id.tvWaliKelas)
        val btnEdit: LinearLayout = itemView.findViewById(R.id.btnEdit)
        val btnHapus: LinearLayout = itemView.findViewById(R.id.btnHapus)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_kelas, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val kelas = kelasList[position]

        holder.tvNo.text = (position + 1).toString()
        holder.tvKonsentrasi.text = kelas.konsentrasiKeahlian
        holder.tvKelas.text = kelas.namaKelas
        holder.tvWaliKelas.text = kelas.waliKelas

        holder.btnEdit.setOnClickListener {
            onEditClickListener(kelas)
        }

        holder.btnHapus.setOnClickListener {
            onDeleteClickListener(kelas)
        }
    }

    override fun getItemCount(): Int = kelasList.size

    fun updateData(newList: List<Kelas>) {
        kelasList.clear()
        kelasList.addAll(newList)
        notifyDataSetChanged()
    }
}