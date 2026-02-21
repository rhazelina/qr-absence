package com.example.ritamesa.data.repository

import com.example.ritamesa.data.api.ApiService
import com.example.ritamesa.data.dto.LoginRequest

class AuthRepository(private val apiService: ApiService) {
    suspend fun login(loginStr: String, passwordStr: String) = 
        apiService.login(LoginRequest(login = loginStr, password = passwordStr))

    suspend fun getProfile() = apiService.getProfile()
}
