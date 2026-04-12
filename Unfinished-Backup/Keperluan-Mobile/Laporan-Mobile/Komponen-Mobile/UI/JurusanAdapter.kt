package com.example.ritamesa

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView

class JurusanAdapter(
    private val onEditClick: (Jurusan) -> Unit,
    private val onDeleteClick: (Jurusan) -> Unit
) : RecyclerView.Adapter<JurusanAdapter.JurusanViewHolder>() {

    private var jurusanList: List<Jurusan> = emptyList()

    inner class JurusanViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val tvNo: TextView = itemView.findViewById(R.id.tv_no)
        val tvKonsentrasi: TextView = itemView.findViewById(R.id.tv_konsentrasi_item)
        val tvKode: TextView = itemView.findViewById(R.id.tv_kode_item)
        val btnEdit: LinearLayout = itemView.findViewById(R.id.btn_edit)
        val btnHapus: LinearLayout = itemView.findViewById(R.id.btn_hapus)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): JurusanViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_jurusan, parent, false)
        return JurusanViewHolder(view)
    }

    override fun onBindViewHolder(holder: JurusanViewHolder, position: Int) {
        val jurusan = jurusanList[position]

        holder.tvNo.text = (position + 1).toString()
        holder.tvKonsentrasi.text = jurusan.name
        holder.tvKode.text = jurusan.code

        holder.btnEdit.setOnClickListener {
            onEditClick(jurusan)
        }

        holder.btnHapus.setOnClickListener {
            onDeleteClick(jurusan)
        }
    }

    override fun getItemCount(): Int = jurusanList.size

    fun updateData(newList: List<Jurusan>) {
        jurusanList = newList
        notifyDataSetChanged()
    }
}