package com.example.ritamesa.api.repositories

import android.content.Context
import com.example.ritamesa.api.ApiClient
import com.example.ritamesa.api.ApiUtils
import com.example.ritamesa.api.Result
import com.example.ritamesa.api.models.LoginRequest
import com.example.ritamesa.api.models.LoginResponse
import com.example.ritamesa.api.models.ApiResponse
import com.example.ritamesa.api.models.UserProfile
import com.example.ritamesa.AppPreferences

class AuthRepository(
    private val context: Context,
    private val apiService: com.example.ritamesa.api.services.ApiService = ApiClient.getApiService(context),
    private val appPreferences: AppPreferences = AppPreferences(context),
    private val persistAuth: Boolean = true
) {

    /**
     * Login with username/email/NISN and optional password
     * Password is optional for NISN login
     */
    suspend fun login(username: String, password: String? = null): Result<UserProfile> {
        val result = ApiUtils.handleApiCall {
            apiService.login(LoginRequest(username, password))
        }

        return when (result) {
            is Result.Success -> {
                val loginResponse: LoginResponse = result.data
                val user = loginResponse.user
                if (user == null) {
                    Result.Error(
                        Exception("Invalid login response: missing user"),
                        "Invalid login response: missing user"
                    )
                } else {
                    if (persistAuth) {
                        try {
                            val token = loginResponse.token
                            if (!token.isNullOrEmpty()) {
                                appPreferences.saveAuthToken(token)
                            }
                            appPreferences.saveUserId(user.id?.toString() ?: "")
                            appPreferences.saveUserName(user.name ?: "")
                            appPreferences.saveUserRole(user.userType ?: "")
                        } catch (e: Exception) {
                            // Error saving preferences, but login still succeeded
                            e.printStackTrace()
                        }
                    }
                    Result.Success(user)
                }
            }
            is Result.Error -> Result.Error(result.exception, result.message)
            is Result.Loading -> Result.Loading()
        }
    }

    suspend fun getMe(): Result<UserProfile> {
        return ApiUtils.handleApiCall {
            apiService.getMe()
        }.map { apiResponse ->
            val meResponse = apiResponse.data
                ?: throw Exception("Invalid response: missing user data")
            UserProfile(
                id = meResponse.id,
                name = meResponse.name,
                username = meResponse.username,
                email = meResponse.email,
                userType = meResponse.userType,
                createdAt = meResponse.createdAt,
                studentProfile = meResponse.studentProfile,
                teacherProfile = meResponse.teacherProfile
            )
        }
    }

    suspend fun logout(): Result<Unit> {
        val result = ApiUtils.handleApiCall {
            apiService.logout()
        }.map { Unit }
        
        // Clear preferences if logout successful
        if (result is Result.Success) {
            if (persistAuth) {
                try {
                    appPreferences.clearAuth()
                    ApiClient.resetRetrofit()
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            } else {
                ApiClient.resetRetrofit()
            }
        }
        
        return result
    }

    fun isLoggedIn(): Boolean {
        return appPreferences.isLoggedInSync()
    }

    fun getAuthToken(): String? {
        return appPreferences.getAuthTokenSync()
    }
}
