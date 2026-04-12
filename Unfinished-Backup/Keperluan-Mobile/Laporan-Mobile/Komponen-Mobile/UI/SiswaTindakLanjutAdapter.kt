package com.example.ritamesa

import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.ritamesa.api.models.FollowUpRiskLevel
import com.example.ritamesa.api.models.StudentFollowUpUiModel

class SiswaTindakLanjutAdapter(
    private val dataList: List<StudentFollowUpUiModel>
) : RecyclerView.Adapter<SiswaTindakLanjutAdapter.ViewHolder>() {

    companion object {
        private const val TAG = "SiswaTindakLanjutAdapter"
    }

    class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val txtNamaSiswa: TextView = view.findViewById(R.id.text_nama_siswa)
        val txtJurusan: TextView = view.findViewById(R.id.text_jurusan)
        val txtAlpha: TextView = view.findViewById(R.id.tvalpha)
        val txtIzin: TextView = view.findViewById(R.id.tvizin)
        val txtSakit: TextView = view.findViewById(R.id.tvsakit)
        val txtBadgeStatus: TextView = view.findViewById(R.id.tvBadgeStatus)

        // Tambahkan variabel untuk layout badge
        val badgeAlphaLayout: View = view.findViewById(R.id.badge_alpha)
        val badgeIzinLayout: View = view.findViewById(R.id.badge_izin)
        val badgeSakitLayout: View = view.findViewById(R.id.badge_sakit)
        val badgeStatusLayout: View = view.findViewById(R.id.badge_sering_absensi)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        try {
            val view = LayoutInflater.from(parent.context)
                .inflate(R.layout.item_siswa_ditindak, parent, false)
            return ViewHolder(view)
        } catch (e: Exception) {
            Log.e(TAG, "Error inflating layout: ${e.message}")
            throw RuntimeException("Layout file not found: item_siswa_ditindak", e)
        }
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        try {
            val item = dataList.getOrNull(position) ?: return

            holder.txtNamaSiswa.text = item.studentName
            holder.txtJurusan.text = item.classLabel

            val alphaCount = item.alphaCount
            val izinCount = item.izinCount
            val sakitCount = item.sakitCount

            holder.txtAlpha.text = if (alphaCount > 0) "x$alphaCount Alfa" else ""
            holder.txtIzin.text = if (izinCount > 0) "x$izinCount Izin" else ""
            holder.txtSakit.text = if (sakitCount > 0) "x$sakitCount Sakit" else ""

            holder.badgeAlphaLayout.visibility = if (alphaCount > 0) View.VISIBLE else View.GONE
            holder.badgeIzinLayout.visibility = if (izinCount > 0) View.VISIBLE else View.GONE
            holder.badgeSakitLayout.visibility = if (sakitCount > 0) View.VISIBLE else View.GONE

            holder.txtBadgeStatus.text = item.riskLabel

            val badgeDrawable = when (item.riskLevel) {
                FollowUpRiskLevel.DANGER -> R.drawable.box_danger
                FollowUpRiskLevel.WARNING -> R.drawable.box_warning
                FollowUpRiskLevel.SAFE -> R.drawable.box_success
            }
            holder.badgeStatusLayout.setBackgroundResource(badgeDrawable)

            holder.badgeStatusLayout.visibility = View.VISIBLE
            holder.txtBadgeStatus.visibility = View.VISIBLE
        } catch (e: Exception) {
            Log.e(TAG, "Error binding data at position $position: ${e.message}")

            holder.txtNamaSiswa.text = "Error"
            holder.txtJurusan.text = "Error"
            holder.txtBadgeStatus.text = "Error"
            holder.badgeStatusLayout.setBackgroundResource(R.drawable.box_success)

            holder.badgeAlphaLayout.visibility = View.GONE
            holder.badgeIzinLayout.visibility = View.GONE
            holder.badgeSakitLayout.visibility = View.GONE
        }
    }

    override fun getItemCount(): Int = dataList.size
}
