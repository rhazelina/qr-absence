package com.example.ritamesa

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageButton
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView

class GuruAdapterWaka(
    private val list: List<GuruRekap>,
    private val onLihat: (GuruRekap) -> Unit
) : RecyclerView.Adapter<GuruAdapterWaka.VH>() {

    inner class VH(v: View) : RecyclerView.ViewHolder(v) {
        val tvNomor   : TextView    = v.findViewById(R.id.tvNomor)
        val tvNama    : TextView    = v.findViewById(R.id.tvNama)
        val tvNip     : TextView    = v.findViewById(R.id.tvTelepon)
        val tvJabatan : TextView    = v.findViewById(R.id.tvMataPelajaran)
        val btnLihat  : ImageButton = v.findViewById(R.id.btnLihat)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int) =
        VH(LayoutInflater.from(parent.context).inflate(R.layout.item_guru, parent, false))

    override fun getItemCount() = list.size

    override fun onBindViewHolder(holder: VH, position: Int) {
        val item = list[position]
        holder.tvNomor.text   = (position + 1).toString()
        holder.tvNama.text    = item.nama
        holder.tvNip.text     = item.nip
        holder.tvJabatan.text = item.jabatan
        holder.btnLihat.setOnClickListener { onLihat(item) }
    }
}