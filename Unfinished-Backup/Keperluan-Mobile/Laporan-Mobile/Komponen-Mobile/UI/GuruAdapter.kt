package com.example.ritamesa

import android.util.Log
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

    companion object {
        private const val TAG = "GuruAdapter"
    }

    class ViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val tvNo: TextView    = itemView.findViewById(R.id.tvNo)
        val tvNama: TextView  = itemView.findViewById(R.id.tvNama)
        val tvNIP: TextView   = itemView.findViewById(R.id.tvNIP)
        val tvRole: TextView  = itemView.findViewById(R.id.tvRole)
        val btnEdit: LinearLayout  = itemView.findViewById(R.id.btnEdit)
        val btnHapus: LinearLayout = itemView.findViewById(R.id.btnHapus)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_crud_guru, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        try {
            val guru = guruList[position]

            holder.tvNo.text   = (position + 1).toString()
            holder.tvNama.text = guru.name.ifEmpty { "-" }
            // FIX: NIP bisa berformat "NIP-XXXX" dari backend, tampilkan apa adanya
            holder.tvNIP.text  = guru.nip?.ifBlank { "-" } ?: "-"
            // FIX: jabatan sudah di-handle JabatanDeserializer sehingga selalu String
            holder.tvRole.text = guru.getRole().ifBlank { "Guru" }

            holder.btnEdit.setOnClickListener {
                val pos = holder.adapterPosition
                if (pos != RecyclerView.NO_ID.toInt() && pos < guruList.size) {
                    onEditClick(guruList[pos], pos)
                }
            }

            holder.btnHapus.setOnClickListener {
                val pos = holder.adapterPosition
                if (pos != RecyclerView.NO_ID.toInt() && pos < guruList.size) {
                    onDeleteClick(guruList[pos], pos)
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error binding view at position $position: ${e.message}")
        }
    }

    override fun getItemCount(): Int = guruList.size

    fun updateData(newList: List<Guru>) {
        Log.d(TAG, "updateData: newList size = ${newList.size}")
        guruList.clear()
        guruList.addAll(newList)
        notifyDataSetChanged()
    }

    /**
     * FIX: Hapus item dari list lokal setelah delete berhasil
     * tanpa perlu reload seluruh data dari server (opsional, lebih responsif)
     */
    fun removeItem(position: Int) {
        if (position >= 0 && position < guruList.size) {
            guruList.removeAt(position)
            notifyItemRemoved(position)
            notifyItemRangeChanged(position, guruList.size)
        }
    }
}