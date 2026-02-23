package com.example.ritamesa

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView

class GuruAdapter(
    private var guruList: MutableList<Guru>,
    private val onEditClick: (Guru, Int) -> Unit,
    private val onDeleteClick: (Guru, Int) -> Unit
) : RecyclerView.Adapter<GuruAdapter.ViewHolder>() {

    private var currentPage = 1
    private val itemsPerPage = 10

    class ViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        // SESUAIKAN DENGAN ID DI item_crud_guru.xml
        val tvNo: TextView = itemView.findViewById(R.id.tvNo)
        val tvNama: TextView = itemView.findViewById(R.id.tvNamaGuru)  // ← BUKAN tvNama
        val tvKode: TextView = itemView.findViewById(R.id.tvKode)
        val tvNIP: TextView = itemView.findViewById(R.id.tvNIP)        // ← BUKAN tvNIP (huruf kecil)
        val tvMapel: TextView = itemView.findViewById(R.id.tvMapel)
        val tvRole: TextView = itemView.findViewById(R.id.tvKeterangan)      // ← BUKAN tvKeterangan

        // Tombol edit dan hapus (LinearLayout)
        val btnEdit: LinearLayout = itemView.findViewById(R.id.btnEdit)
        val btnHapus: LinearLayout = itemView.findViewById(R.id.btnHapus)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_crud_guru, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val guru = guruList[position]

        // NOMOR URUT PER HALAMAN DIMULAI DARI 1
        val nomorUrut = ((currentPage - 1) * itemsPerPage) + position + 1
        holder.tvNo.text = nomorUrut.toString()

        holder.tvNama.text = guru.nama
        holder.tvKode.text = guru.kode
        holder.tvNIP.text = guru.nip
        holder.tvMapel.text = guru.mapel
        holder.tvRole.text = guru.keterangan

        // Klik untuk edit pada tombol edit
        holder.btnEdit.setOnClickListener {
            onEditClick(guru, position)
        }

        // Klik untuk hapus pada tombol hapus
        holder.btnHapus.setOnClickListener {
            onDeleteClick(guru, position)
        }
    }

    override fun getItemCount(): Int = guruList.size

    fun updateData(newList: List<Guru>, page: Int) {
        guruList = newList.toMutableList()
        currentPage = page
        notifyDataSetChanged()
    }

    fun updateData(newList: List<Guru>) {
        updateData(newList, 1)
    }
}