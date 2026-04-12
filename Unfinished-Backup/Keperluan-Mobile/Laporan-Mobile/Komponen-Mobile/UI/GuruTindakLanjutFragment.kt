package com.example.ritamesa

import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.EditText
import android.widget.ImageButton
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.ritamesa.api.models.StudentFollowUpUiModel
import kotlinx.coroutines.launch

class GuruTindakLanjutFragment : Fragment() {

    private lateinit var recyclerView: RecyclerView
    private lateinit var etSearchKelas: EditText
    private lateinit var adapter: SiswaTindakLanjutAdapter

    private lateinit var btnHome: ImageButton
    private lateinit var btnCalendar: ImageButton
    private lateinit var btnChart: ImageButton
    private lateinit var btnNotif: ImageButton

    private val allSiswaData = mutableListOf<StudentFollowUpUiModel>()
    private val filteredSiswaData = mutableListOf<StudentFollowUpUiModel>()

    private var navigationCallback: ((String) -> Unit)? = null

    companion object {
        fun newInstance() = GuruTindakLanjutFragment()
    }

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View? {
        return inflater.inflate(R.layout.tindak_lanjut_guru, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        initViews(view)
        setupFooterNavigation()
        setupRecyclerView()
        loadFollowUpDataFromApi()
        setupSearchFilter()
    }

    private fun initViews(view: View) {
        recyclerView = view.findViewById(R.id.rvSiswaAbsensi)
        etSearchKelas = view.findViewById(R.id.etSearchKelas)
        btnHome = view.findViewById(R.id.btnHome)
        btnCalendar = view.findViewById(R.id.btnCalendar)
        btnChart = view.findViewById(R.id.btnChart)
        btnNotif = view.findViewById(R.id.btnNotif)
    }

    private fun setupFooterNavigation() {
        btnHome.setOnClickListener {
            navigationCallback?.invoke("dashboard")
        }
        btnCalendar.setOnClickListener {
            navigationCallback?.invoke("riwayat")
        }
        btnChart.setOnClickListener {
            loadFollowUpDataFromApi()
            Toast.makeText(requireContext(), "Data Tindak Lanjut direfresh", Toast.LENGTH_SHORT).show()
        }
        btnNotif.setOnClickListener {
            navigationCallback?.invoke("notifikasi")
        }
    }

    private fun loadFollowUpDataFromApi() {
        lifecycleScope.launch {
            try {
                val activity = activity as? BaseNetworkActivity ?: return@launch
                val result = activity.teacherRepository.getStudentsFollowUpUiModels(problemOnly = true)
                when (result) {
                    is com.example.ritamesa.api.Result.Success -> {
                        allSiswaData.clear()
                        allSiswaData.addAll(result.data)
                        filteredSiswaData.clear()
                        filteredSiswaData.addAll(allSiswaData)
                        adapter.notifyDataSetChanged()
                    }
                    is com.example.ritamesa.api.Result.Error -> {
                        val act = activity as? BaseNetworkActivity
                        act?.showError(result.message ?: "Gagal memuat data tindak lanjut")
                        allSiswaData.clear()
                        filteredSiswaData.clear()
                        adapter.notifyDataSetChanged()
                    }
                    is com.example.ritamesa.api.Result.Loading -> {}
                }
            } catch (e: Exception) {
                val act = activity as? BaseNetworkActivity
                act?.showError("Error: ${e.message}")
            }
        }
    }

    private fun setupRecyclerView() {
        adapter = SiswaTindakLanjutAdapter(filteredSiswaData)
        recyclerView.layoutManager = LinearLayoutManager(requireContext())
        recyclerView.adapter = adapter
    }

    private fun setupSearchFilter() {
        etSearchKelas.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                filterData(s.toString())
            }
        })
    }

    private fun filterData(query: String) {
        filteredSiswaData.clear()

        if (query.isEmpty()) {
            filteredSiswaData.addAll(allSiswaData)
        } else {
            val lowerQuery = query.lowercase()
            filteredSiswaData.addAll(allSiswaData.filter {
                it.studentName.lowercase().contains(lowerQuery) ||
                        it.classLabel.lowercase().contains(lowerQuery)
            })
        }
        adapter.notifyDataSetChanged()
    }

    fun setNavigationCallback(callback: (String) -> Unit) {
        navigationCallback = callback
    }

    private fun handleResult(result: Any?, onSuccess: (List<Any>) -> Unit, onError: (Int, String?) -> Unit) {
        @Suppress("UNCHECKED_CAST")
        when (result) {
            is com.example.ritamesa.api.Result.Success<*> -> {
                val data = (result as com.example.ritamesa.api.Result.Success<List<*>>).data as List<Any>
                onSuccess(data)
            }
            is com.example.ritamesa.api.Result.Error -> onError(0, result.message)
            else -> onError(0, "Unknown error")
        }
    }
}
