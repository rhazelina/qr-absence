package com.example.ritamesa.adapter

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageButton
import android.widget.LinearLayout
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.ritamesa.R
import com.example.ritamesa.model.ModelSiswa

class SiswaAdapter(
    private val listSiswa: List<ModelSiswa>,
    private val onEditClick: (ModelSiswa, Int) -> Unit,
    private val onDeleteClick: (String, Int) -> Unit
) : RecyclerView.Adapter<SiswaAdapter.ViewHolder>() {

    inner class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val tvNo: TextView = view.findViewById(R.id.tvNo)
        val tvNama: TextView = view.findViewById(R.id.tvNamaSiswa)
        val tvNisn: TextView = view.findViewById(R.id.tvNisn)
        val tvKelas: TextView = view.findViewById(R.id.tvKelas)
        val tvJurusan: TextView = view.findViewById(R.id.tvKode)

        // Container LinearLayout untuk area klik
        val btnEditContainer: LinearLayout = view.findViewById(R.id.btnEdit)
        val btnHapusContainer: LinearLayout = view.findViewById(R.id.btnHapus)

        // ImageButton di dalam container - PERBAIKAN: Pisahkan ID yang berbeda
        val btnEditIcon: ImageButton = view.findViewById(R.id.btnEdit) // Ganti ID
        val btnHapusIcon: ImageButton = view.findViewById(R.id.btnHapus) // Ganti ID
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_crud_datasiswa, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val siswa = listSiswa[position]

        // Set data ke view
        holder.tvNo.text = (position + 1).toString()
        holder.tvNama.text = siswa.nama
        holder.tvNisn.text = siswa.nis // PERBAIKAN: nisn bukan nis
        holder.tvKelas.text = siswa.kelas


        // Set click listeners untuk container
        holder.btnEditContainer.setOnClickListener {
            onEditClick(siswa, position)
        }

        holder.btnHapusContainer.setOnClickListener {
            onDeleteClick(siswa.nama, position)
        }

        // Set click listeners untuk icon (opsional, bisa juga langsung panggil fungsi yang sama)
        holder.btnEditIcon.setOnClickListener {
            onEditClick(siswa, position)
        }

        holder.btnHapusIcon.setOnClickListener {
            onDeleteClick(siswa.nama, position)
        }
    }

    override fun getItemCount(): Int = listSiswa.size
}