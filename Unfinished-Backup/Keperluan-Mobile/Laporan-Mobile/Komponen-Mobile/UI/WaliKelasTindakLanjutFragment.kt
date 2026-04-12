package com.example.ritamesa

import android.app.AlertDialog
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.EditText
import android.widget.ImageButton
import android.widget.Spinner
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.ritamesa.api.models.StudentFollowUpUiModel
import com.example.ritamesa.api.models.StudentResource
import com.google.android.material.floatingactionbutton.FloatingActionButton
import kotlinx.coroutines.launch

class WaliKelasTindakLanjutFragment : Fragment() {

    private lateinit var recyclerView: RecyclerView
    private lateinit var etSearchKelas: EditText
    private lateinit var adapter: SiswaTindakLanjutAdapter
//    private lateinit var fabAddFollowUp: FloatingActionButton

    private lateinit var btnHome: ImageButton
    private lateinit var btnCalendar: ImageButton
    private lateinit var btnChart: ImageButton



    private val allSiswaData = mutableListOf<StudentFollowUpUiModel>()
    private val filteredSiswaData = mutableListOf<StudentFollowUpUiModel>()
    private val homeroomStudents = mutableListOf<StudentResource>()

    private var navigationCallback: ((String) -> Unit)? = null

    companion object {
        fun newInstance() = WaliKelasTindakLanjutFragment()
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        return inflater.inflate(R.layout.tindak_lanjut_guru, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        initViews(view)
        setupRecyclerView()
        setupSearchFilter()
        setupFooterNavigation()
//        setupFab()
        loadFollowUpData()
        loadHomeroomStudents()
    }

    private fun initViews(view: View) {
        recyclerView = view.findViewById(R.id.rvSiswaAbsensi)
        etSearchKelas = view.findViewById(R.id.etSearchKelas)
//        fabAddFollowUp = view.findViewById(R.id.fabAddFollowUp)
        btnHome = view.findViewById(R.id.btnHome)
        btnCalendar = view.findViewById(R.id.btnCalendar)
        btnChart = view.findViewById(R.id.btnChart)

    }


//    private fun setupFab() {
//        fabAddFollowUp.setOnClickListener { showTambahTindakLanjutDialog() }
//    }

    private fun setupRecyclerView() {
        adapter = SiswaTindakLanjutAdapter(filteredSiswaData)
        recyclerView.layoutManager = LinearLayoutManager(requireContext())
        recyclerView.adapter = adapter
    }

    private fun setupFooterNavigation() {
        btnHome.setOnClickListener { navigationCallback?.invoke("dashboard") }
        btnCalendar.setOnClickListener { navigationCallback?.invoke("riwayat") }
        btnChart.setOnClickListener { loadFollowUpData() }
    }

    private fun loadHomeroomStudents() {
        lifecycleScope.launch {
            try {
                val act = activity as? BaseNetworkActivity ?: return@launch
                when (val result = act.teacherRepository.getMyHomeroomStudents()) {
                    is com.example.ritamesa.api.Result.Success -> {
                        homeroomStudents.clear()
                        homeroomStudents.addAll(result.data)
                    }
                    is com.example.ritamesa.api.Result.Error ->
                        Log.w("WakelTindakLanjutFrag", "loadHomeroomStudents error: ${result.message}")
                    is com.example.ritamesa.api.Result.Loading -> Unit
                }
            } catch (e: Exception) {
                Log.e("WakelTindakLanjutFrag", "loadHomeroomStudents exception: ${e.message}", e)
            }
        }
    }

    private fun loadFollowUpData() {
        lifecycleScope.launch {
            try {
                val act = activity as? BaseNetworkActivity ?: return@launch
                when (val result = act.teacherRepository.getStudentsFollowUpUiModels(problemOnly = true)) {
                    is com.example.ritamesa.api.Result.Success -> {
                        allSiswaData.clear()
                        allSiswaData.addAll(result.data)
                        filteredSiswaData.clear()
                        filteredSiswaData.addAll(allSiswaData)
                        adapter.notifyDataSetChanged()
                    }
                    is com.example.ritamesa.api.Result.Error ->
                        act.showError(result.message ?: "Gagal memuat data tindak lanjut")
                    is com.example.ritamesa.api.Result.Loading -> Unit
                }
            } catch (e: Exception) {
                Log.e("WakelTindakLanjutFrag", "loadFollowUpData exception: ${e.message}", e)
            }
        }
    }

    private fun showTambahTindakLanjutDialog() {
        val dialogView = LayoutInflater.from(requireContext())
            .inflate(R.layout.dialog_tambah_tindak_lanjut, null)
        val spinnerSiswa = dialogView.findViewById<Spinner>(R.id.spinner_siswa)
        val etCatatan = dialogView.findViewById<EditText>(R.id.et_catatan_follow_up)
        val etAksi = dialogView.findViewById<EditText>(R.id.et_aksi_follow_up)
        val btnSimpan = dialogView.findViewById<Button>(R.id.btn_simpan_follow_up)

        val studentNames = homeroomStudents.map { it.name ?: "Siswa" }
        if (studentNames.isEmpty()) {
            Toast.makeText(requireContext(), "Data siswa belum siap", Toast.LENGTH_SHORT).show()
            return
        }

        val spinnerAdapter = ArrayAdapter(
            requireContext(),
            android.R.layout.simple_spinner_item,
            studentNames
        )
        spinnerAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        spinnerSiswa.adapter = spinnerAdapter

        val dialog = AlertDialog.Builder(requireContext())
            .setView(dialogView)
            .create()

        btnSimpan.setOnClickListener {
            val position = spinnerSiswa.selectedItemPosition
            val studentId = homeroomStudents.getOrNull(position)?.id
            val note = etCatatan.text?.toString()?.trim().orEmpty()
            val action = etAksi.text?.toString()?.trim()

            if (studentId == null || note.isEmpty()) {
                Toast.makeText(requireContext(), "Siswa dan Catatan wajib diisi", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            lifecycleScope.launch {
                val act = activity as? BaseNetworkActivity ?: return@launch
                val result = act.teacherRepository.createStudentFollowUp(studentId, note, action)
                act.handleResult(result, {
                    dialog.dismiss()
                    Toast.makeText(requireContext(), "Tindak lanjut disimpan!", Toast.LENGTH_SHORT).show()
                    loadFollowUpData()
                }, { _, msg ->
                    act.showError(msg ?: "Gagal menyimpan")
                })
            }
        }
        dialog.show()
    }

    private fun setupSearchFilter() {
        etSearchKelas.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) = Unit
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) = Unit
            override fun afterTextChanged(s: Editable?) = filterData(s.toString())
        })
    }

    private fun filterData(query: String) {
        filteredSiswaData.clear()
        if (query.isEmpty()) {
            filteredSiswaData.addAll(allSiswaData)
        } else {
            val q = query.lowercase()
            filteredSiswaData.addAll(
                allSiswaData.filter {
                    it.studentName.lowercase().contains(q) ||
                            it.classLabel.lowercase().contains(q)
                }
            )
        }
        adapter.notifyDataSetChanged()
    }

    fun setNavigationCallback(callback: (String) -> Unit) {
        navigationCallback = callback
    }
}