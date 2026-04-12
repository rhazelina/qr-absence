package com.example.ritamesa

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageButton
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView

class SiswaAdapterWaka(
    private val list: List<SiswaRekap>,
    private val onLihat: (SiswaRekap) -> Unit
) : RecyclerView.Adapter<SiswaAdapterWaka.VH>() {

    inner class VH(v: View) : RecyclerView.ViewHolder(v) {
        val tvNomor  : TextView    = v.findViewById(R.id.tvNomor)
        val tvNama   : TextView    = v.findViewById(R.id.tvNama)
        val tvNisn   : TextView    = v.findViewById(R.id.tvTelepon)
        val tvKelas  : TextView    = v.findViewById(R.id.tvMataPelajaran)
        val btnLihat : ImageButton = v.findViewById(R.id.btnLihat)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int) =
        VH(LayoutInflater.from(parent.context).inflate(R.layout.item_siswa, parent, false))

    override fun getItemCount() = list.size

    override fun onBindViewHolder(holder: VH, position: Int) {
        val item = list[position]
        holder.tvNomor.text  = item.nomor.toString()
        holder.tvNama.text   = item.nama
        holder.tvNisn.text   = item.nisn
        holder.tvKelas.text  = item.kelas
        holder.btnLihat.setOnClickListener { onLihat(item) }
    }
}