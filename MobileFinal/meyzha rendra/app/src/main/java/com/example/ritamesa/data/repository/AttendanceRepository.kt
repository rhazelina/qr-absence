package com.example.ritamesa.data.repository

import com.example.ritamesa.data.api.ApiService
import com.example.ritamesa.data.dto.ScanRequest

class AttendanceRepository(private val apiService: ApiService) {
    suspend fun scanQr(token: String) = apiService.scanQr(ScanRequest(token))
    suspend fun scanStudentQr(nisnOrToken: String) = apiService.scanStudentQr(ScanRequest(nisnOrToken))
}
