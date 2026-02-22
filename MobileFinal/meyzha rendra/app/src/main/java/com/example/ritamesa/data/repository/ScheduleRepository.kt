package com.example.ritamesa.data.repository

import com.example.ritamesa.data.api.ApiService

class ScheduleRepository(private val apiService: ApiService) {
    suspend fun getSchedules() = apiService.getSchedules()
}
