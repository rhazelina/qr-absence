package com.example.ritamesa

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageButton
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView

class AbsensiAdapter(
    private var siswaList: MutableList<AbsensiAdapter.SiswaData>,
    // Dipanggil saat tombol Izin ATAU Sakit diklik — Activity yang tampilkan popup
    private val onPerizinanSelected: ((siswa: SiswaData, position: Int) -> Unit)? = null
) : RecyclerView.Adapter<AbsensiAdapter.ViewHolder>() {

    data class SiswaData(
        val id: Int,
        val nomor: Int,
        val nisn: String,
        val nama: String,
        var status: String,                 // "none" | "hadir" | "izin" | "sakit" | "alpha"
        var autoLate: Boolean = false,
        var perizinanReason: String = "",   // alasan dari popup
        var perizinanType: String = "",     // nilai API: "excused" | "sick"
        var pendingAttachmentFile: java.io.File? = null,  // bukti surat sementara
        var isFromDraft: Boolean = false    // true jika status berasal dari server/draft, tidak perlu validasi ulang
    )

    class ViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val tvNomor: TextView = itemView.findViewById(R.id.nomor_absen)
        val tvNISN: TextView = itemView.findViewById(R.id.nisn)
        val tvNama: TextView = itemView.findViewById(R.id.nama_siswa)
        val tvAutoLateBadge: TextView = itemView.findViewById(R.id.tv_auto_late_badge)
        val btnHadir: ImageButton = itemView.findViewById(R.id.radio_hadir)
        val btnIzin: ImageButton = itemView.findViewById(R.id.radio_izin)
        val btnSakit: ImageButton = itemView.findViewById(R.id.radio_sakit)
        val btnAlpha: ImageButton = itemView.findViewById(R.id.radio_alpha)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_list_absen, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val siswa = siswaList[position]

        holder.tvNomor.text = siswa.nomor.toString()
        holder.tvNISN.text = siswa.nisn
        holder.tvNama.text = siswa.nama
        holder.tvAutoLateBadge.visibility = if (siswa.autoLate) View.VISIBLE else View.GONE

        updateRadioButtons(holder, siswa.status)

        // Hadir: tidak perlu popup
        holder.btnHadir.setOnClickListener {
            clearPerizinan(siswa)
            siswa.status = "hadir"
            updateRadioButtons(holder, "hadir")
            notifyItemChanged(position)
        }

        // Izin: wajib melalui popup perizinan
        holder.btnIzin.setOnClickListener {
            if (onPerizinanSelected != null) {
                onPerizinanSelected.invoke(siswa, position)
            } else {
                clearPerizinan(siswa)
                siswa.status = "izin"
                siswa.perizinanType = "excused"
                updateRadioButtons(holder, "izin")
                notifyItemChanged(position)
            }
        }

        // Sakit: wajib melalui popup perizinan (sama seperti Izin)
        holder.btnSakit.setOnClickListener {
            if (onPerizinanSelected != null) {
                onPerizinanSelected.invoke(siswa, position)
            } else {
                clearPerizinan(siswa)
                siswa.status = "sakit"
                siswa.perizinanType = "sick"
                updateRadioButtons(holder, "sakit")
                notifyItemChanged(position)
            }
        }

        // Alpha: tidak perlu popup
        holder.btnAlpha.setOnClickListener {
            clearPerizinan(siswa)
            siswa.status = "alpha"
            updateRadioButtons(holder, "alpha")
            notifyItemChanged(position)
        }
    }

    override fun getItemCount(): Int = siswaList.size

    /**
     * Dipanggil dari Activity setelah popup perizinan dikonfirmasi.
     * [izinType] = "excused" (Izin) atau "sick" (Sakit) — nilai yang dikirim ke API.
     * Status lokal (izin/sakit) ditentukan otomatis dari izinType.
     */
    fun confirmPerizinanStatus(position: Int, izinType: String, reason: String, file: java.io.File) {
        if (position < 0 || position >= siswaList.size) return
        val siswa = siswaList[position]
        siswa.status = if (izinType == "sick") "sakit" else "izin"
        siswa.autoLate = false
        siswa.perizinanType = izinType
        siswa.perizinanReason = reason
        siswa.pendingAttachmentFile = file
        notifyItemChanged(position)
    }

    private fun clearPerizinan(siswa: SiswaData) {
        siswa.autoLate = false
        siswa.perizinanReason = ""
        siswa.perizinanType = ""
        siswa.pendingAttachmentFile = null
        siswa.isFromDraft = false
    }

    private fun updateRadioButtons(holder: ViewHolder, status: String) {
        val off = R.drawable.radiobutton_off
        val on  = R.drawable.radiobutton_on
        holder.btnHadir.setImageResource(if (status == "hadir") on else off)
        holder.btnIzin.setImageResource(if (status == "izin")  on else off)
        holder.btnSakit.setImageResource(if (status == "sakit") on else off)
        holder.btnAlpha.setImageResource(if (status == "alpha") on else off)
    }

    fun getAbsensiData(): List<SiswaData> = siswaList

    fun updateData(newData: List<SiswaData>) {
        siswaList = newData.toMutableList()
        notifyDataSetChanged()
    }

    fun resetAllStatus() {
        siswaList.forEach { siswa ->
            siswa.status = "none"
            clearPerizinan(siswa)
        }
        notifyDataSetChanged()
    }
}