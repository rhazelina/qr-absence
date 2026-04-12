package com.example.ritamesa

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.ritamesa.model.ModelSiswa

class SiswaAdapter(
    private val onEditClick: (ModelSiswa) -> Unit,
    private val onDeleteClick: (ModelSiswa) -> Unit
) : RecyclerView.Adapter<SiswaAdapter.SiswaViewHolder>() {

    private var siswaList: List<ModelSiswa> = emptyList()

    inner class SiswaViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val tvNo: TextView       = itemView.findViewById(R.id.tv_no_siswa)
        val tvNama: TextView     = itemView.findViewById(R.id.tv_nama_siswa)
        val tvNisn: TextView     = itemView.findViewById(R.id.tv_nisn_siswa)
        val tvKelas: TextView    = itemView.findViewById(R.id.tv_kelas_siswa)
        val btnEdit: LinearLayout  = itemView.findViewById(R.id.btn_edit_siswa)
        val btnHapus: LinearLayout = itemView.findViewById(R.id.btn_hapus_siswa)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): SiswaViewHolder {
        // FIX: inflate item_siswa_admin (edit+hapus) bukan item_siswa (lihat)
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_siswa_admin, parent, false)
        return SiswaViewHolder(view)
    }

    override fun onBindViewHolder(holder: SiswaViewHolder, position: Int) {
        val siswa = siswaList[position]
        holder.tvNo.text    = (position + 1).toString()
        holder.tvNama.text  = siswa.name
        holder.tvNisn.text  = siswa.nisn
        holder.tvKelas.text = siswa.class_name
        holder.btnEdit.setOnClickListener  { onEditClick(siswa) }
        holder.btnHapus.setOnClickListener { onDeleteClick(siswa) }
    }

    override fun getItemCount(): Int = siswaList.size

    fun updateData(newList: List<ModelSiswa>) {
        siswaList = newList
        notifyDataSetChanged()
    }
}