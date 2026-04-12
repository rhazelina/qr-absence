package com.example.ritamesa.api.repositories

import android.content.Context
import android.util.Log
import com.example.ritamesa.AppPreferences
import com.example.ritamesa.api.ApiClient
import com.example.ritamesa.api.ApiUtils
import com.example.ritamesa.api.Result
import com.example.ritamesa.api.models.*

class AuthRepository(
    private val context: Context,
    private val apiService: com.example.ritamesa.api.services.ApiService = ApiClient.getApiService(context),
    private val appPreferences: AppPreferences = AppPreferences(context),
    private val persistAuth: Boolean = true
) {
    companion object {
        private const val TAG = "AuthRepository"
    }

    /**
     * Login dengan:
     * - Admin: email + password
     * - Guru/Waka/Wali Kelas: kode_guru + password (default: password123)
     * - Siswa: NISN (tanpa password)
     *
     * Response dari backend (AuthController.php) mengandung:
     * - role: "admin", "waka", "wakel", "guru", "pengurus_kelas", "siswa"
     * - is_class_officer: true/false untuk siswa
     * - teacherProfile.homeroom_class_id: untuk wali kelas
     */
    suspend fun login(username: String, password: String? = null): Result<UserProfile> {
        Log.d(TAG, "login attempt: username=$username, hasPassword=${password != null}")

        val result = ApiUtils.handleApiCall {
            apiService.login(LoginRequest(login = username, password = password))
        }

        return when (result) {
            is Result.Success -> {
                val loginResponse: LoginResponse = result.data
                val user = loginResponse.user

                if (user == null) {
                    return Result.Error(Exception("User data is null"), "Respons login tidak valid")
                }

                // IMPORTANT:
                // profile null is valid for some roles (e.g. admin/waka) and must not block login.
                val safeUser = buildSafeUserProfile(user)

                if (persistAuth) {
                    // Simpan token jika ada
                    loginResponse.token?.let { appPreferences.saveAuthToken(it) }
                    // Simpan data user ke preferences
                    saveUserToPreferences(safeUser)
                    Log.d(TAG, "Login berhasil & data tersimpan untuk user: ${safeUser.username}")
                }
                Result.Success(safeUser)
            }

            is Result.Error -> {
                Log.e(TAG, "Login error: ${result.message}")
                Result.Error(result.exception, result.message)
            }

            is Result.Loading -> Result.Loading()
        }
    }

    suspend fun getMe(): Result<UserProfile> {
        val meResult = ApiUtils.handleApiCall {
            apiService.getMe()
        }

        val result: Result<UserProfile> = when (meResult) {
            is Result.Success -> {
                val payload: ApiResponse<MeResponse> = meResult.data
                val meResponse: MeResponse? = payload.data

                if (meResponse == null) {
                    return Result.Error(
                        Exception("Data user kosong"),
                        payload.message ?: "Data user tidak tersedia"
                    )
                }

                val safeUser = buildSafeUserProfile(
                    UserProfile(
                        id = meResponse.id,
                        name = meResponse.name,
                        username = meResponse.username,
                        email = meResponse.email,
                        userType = meResponse.userType,
                        role = meResponse.role,
                        isClassOfficer = meResponse.isClassOfficer,
                        createdAt = meResponse.createdAt,
                        profile = meResponse.profile // keep nullable, do not throw if null
                    )
                )
                Result.Success(safeUser)
            }

            is Result.Error -> Result.Error(meResult.exception, meResult.message)
            is Result.Loading -> Result.Loading()
        }

        if (result is Result.Success && persistAuth) {
            saveUserToPreferences(result.data)
            Log.d(TAG, "getMe berhasil & preferences diperbarui")
        }

        return result
    }

    /**
     * Profile boleh null untuk role tertentu (admin/waka), sehingga jangan pernah
     * dianggap error selama user utama valid.
     */
    private fun buildSafeUserProfile(user: UserProfile): UserProfile {
        if (user.profile == null) {
            Log.d(
                TAG,
                "Profile null diterima untuk user id=${user.id}, role=${user.role}, userType=${user.userType}"
            )
        }
        return user.copy(profile = user.profile)
    }

    /**
     * Helper untuk menyimpan data user ke AppPreferences secara terpusat.
     * Memastikan role, jabatan, dan homeroom_class_id selalu konsisten.
     */
    private suspend fun saveUserToPreferences(user: UserProfile) {
        try {
            appPreferences.saveUserId(user.id?.toString() ?: "")
            appPreferences.saveUserName(user.name ?: "")
            appPreferences.saveUserRole(user.userType ?: "")

            // Simpan role presisi dari backend (digunakan AppPreferences.getJabatanSync)
            val backendRole = user.role ?: ""
            appPreferences.saveJabatan(backendRole)

            // EKSTRAKSI & PENYIMPANAN HOMEROOM CLASS ID (Wali Kelas)
            val homeroomId = user.teacherProfile?.homeroomClassId?.toString()
            if (!homeroomId.isNullOrEmpty()) {
                appPreferences.saveHomeroomClassId(homeroomId)
                Log.d(TAG, "Berhasil simpan homeroom_class_id: $homeroomId")
            } else {
                // Bersihkan jika bukan wali kelas untuk menghindari sesi bocor
                appPreferences.saveHomeroomClassId("")
                Log.d(TAG, "Bukan wali kelas, homeroom_class_id dikosongkan")
            }

            // Simpan status pengurus kelas (Siswa)
            val isClassOfficer = user.isClassOfficer == true
            appPreferences.saveIsPengurus(isClassOfficer)

            Log.d(TAG, "Data user berhasil disimpan ke preferences: role=${user.userType}, jabatan=$backendRole")
        } catch (e: Exception) {
            Log.e(TAG, "Gagal simpan data user ke preferences: ${e.message}")
        }
    }

    suspend fun logout(): Result<Unit> {
        val result = ApiUtils.handleApiCall {
            apiService.logout()
        }.map { Unit }

        if (result is Result.Success && persistAuth) {
            try {
                appPreferences.clearAuth()
                ApiClient.resetRetrofit()
                Log.d(TAG, "Logout success, preferences cleared")
            } catch (e: Exception) {
                Log.e(TAG, "Error clearing preferences", e)
            }
        }
        return result
    }

    fun isLoggedIn(): Boolean = appPreferences.isLoggedInSync()
    fun getAuthToken(): String? = appPreferences.getAuthTokenSync()
    fun getCurrentUserRole(): String? = appPreferences.getUserRoleSync()
    fun getCurrentJabatan(): String = appPreferences.getJabatanSync()
    fun getIsPengurus(): Boolean = appPreferences.getIsPengurusSync()
    fun getCurrentUserName(): String? = appPreferences.getUserNameSync()
    fun getCurrentUserId(): String? = appPreferences.getUserIdSync()
    fun getHomeroomClassId(): String? = appPreferences.getHomeroomClassIdSync()
}






// v2, block waka dan keep wali kelas
//package com.example.ritamesa.api.repositories
//
//import android.content.Context
//import android.util.Log
//import com.example.ritamesa.api.ApiClient
//import com.example.ritamesa.api.ApiUtils
//import com.example.ritamesa.api.Result
//import com.example.ritamesa.api.models.*
//import com.example.ritamesa.AppPreferences
//
//class AuthRepository(
//    private val context: Context,
//    private val apiService: com.example.ritamesa.api.services.ApiService = ApiClient.getApiService(context),
//    private val appPreferences: AppPreferences = AppPreferences(context),
//    private val persistAuth: Boolean = true
//) {
//    companion object {
//        private const val TAG = "AuthRepository"
//    }
//
//    suspend fun login(username: String, password: String? = null): Result<UserProfile> {
//        Log.d(TAG, "login attempt: username=$username")
//        val result = ApiUtils.handleApiCall {
//            apiService.login(LoginRequest(login = username, password = password))
//        }
//        return when (result) {
//            is Result.Success -> {
//                val loginResponse: LoginResponse = result.data
//                val user = loginResponse.user
//                if (user == null) {
//                    return Result.Error(Exception("User data is null"), "Respons login tidak valid")
//                }
//                if (persistAuth) {
//                    loginResponse.token?.let { appPreferences.saveAuthToken(it) }
//                    saveUserToPreferences(user)
//                }
//                Result.Success(user)
//            }
//            is Result.Error   -> Result.Error(result.exception, result.message)
//            is Result.Loading -> Result.Loading()
//        }
//    }
//
//    // FIX FINAL:
//    // - handleApiCall<T> mengekstrak body dari Response<T> -> Result<T>
//    // - apiService.getMe() bertipe Response<ApiResponse<MeResponse>>
//    // - Maka handleApiCall mengembalikan Result<ApiResponse<MeResponse>>
//    // - Gunakan .map{} untuk unwrap ApiResponse.data -> MeResponse -> UserProfile
//    suspend fun getMe(): Result<UserProfile> {
//        return try {
//            val result: Result<ApiResponse<MeResponse>> = ApiUtils.handleApiCall {
//                apiService.getMe()
//            }
//            val mapped = result.map { apiResponse ->
//                val meResponse = apiResponse.data
//                    ?: throw Exception("Profil tidak tersedia")
//                UserProfile(
//                    id             = meResponse.id,
//                    name           = meResponse.name,
//                    username       = meResponse.username,
//                    email          = meResponse.email,
//                    userType       = meResponse.userType,
//                    role           = meResponse.role,
//                    isClassOfficer = meResponse.isClassOfficer,
//                    createdAt      = meResponse.createdAt,
//                    profile        = meResponse.profile
//                )
//            }
//            if (mapped is Result.Success && persistAuth) {
//                saveUserToPreferences(mapped.data)
//            }
//            mapped
//        } catch (e: Exception) {
//            Log.e(TAG, "getMe exception: ${e.message}", e)
//            Result.Error(e, e.message ?: "Gagal memuat profil")
//        }
//    }
//
//    private suspend fun saveUserToPreferences(user: UserProfile) {
//        try {
//            appPreferences.saveUserId(user.id?.toString() ?: "")
//            appPreferences.saveUserName(user.name ?: "")
//            appPreferences.saveUserRole(user.userType ?: "")
//            appPreferences.saveJabatan(user.role ?: "")
//            val homeroomId = user.teacherProfile?.homeroomClassId?.toString()
//            if (!homeroomId.isNullOrEmpty()) {
//                appPreferences.saveHomeroomClassId(homeroomId)
//                Log.d(TAG, "Simpan homeroom_class_id: $homeroomId")
//            } else {
//                appPreferences.saveHomeroomClassId("")
//            }
//            appPreferences.saveIsPengurus(user.isClassOfficer == true)
//        } catch (e: Exception) {
//            Log.e(TAG, "Gagal simpan preferences: ${e.message}")
//        }
//    }
//
//    suspend fun logout(): Result<Unit> {
//        val result = ApiUtils.handleApiCall { apiService.logout() }.map { Unit }
//        if (result is Result.Success && persistAuth) {
//            appPreferences.clearAuth()
//            ApiClient.resetRetrofit()
//        }
//        return result
//    }
//
//    fun isLoggedIn(): Boolean = appPreferences.isLoggedInSync()
//    fun getAuthToken(): String? = appPreferences.getAuthTokenSync()
//    fun getCurrentUserRole(): String? = appPreferences.getUserRoleSync()
//    fun getCurrentJabatan(): String = appPreferences.getJabatanSync()
//    fun getIsPengurus(): Boolean = appPreferences.getIsPengurusSync()
//    fun getCurrentUserName(): String? = appPreferences.getUserNameSync()
//    fun getCurrentUserId(): String? = appPreferences.getUserIdSync()
//    fun getHomeroomClassId(): String? = appPreferences.getHomeroomClassIdSync()
//}

//package com.example.ritamesa.api.repositories
//
//import android.content.Context
//import android.util.Log
//import com.example.ritamesa.api.ApiClient
//import com.example.ritamesa.api.ApiUtils
//import com.example.ritamesa.api.Result
//import com.example.ritamesa.api.models.*
//import com.example.ritamesa.AppPreferences
//
//class AuthRepository(
//    private val context: Context,
//    private val apiService: com.example.ritamesa.api.services.ApiService = ApiClient.getApiService(context),
//    private val appPreferences: AppPreferences = AppPreferences(context),
//    private val persistAuth: Boolean = true
//) {
//    companion object {
//        private const val TAG = "AuthRepository"
//    }
//
//    suspend fun login(username: String, password: String? = null): Result<UserProfile> {
//        Log.d(TAG, "login attempt: username=$username")
//        val result = ApiUtils.handleApiCall {
//            apiService.login(LoginRequest(login = username, password = password))
//        }
//        return when (result) {
//            is Result.Success -> {
//                val loginResponse: LoginResponse = result.data
//                val user = loginResponse.user
//                if (user == null) {
//                    return Result.Error(Exception("User data is null"), "Respons login tidak valid")
//                }
//                if (persistAuth) {
//                    loginResponse.token?.let { appPreferences.saveAuthToken(it) }
//                    saveUserToPreferences(user)
//                }
//                Result.Success(user)
//            }
//            is Result.Error   -> Result.Error(result.exception, result.message)
//            is Result.Loading -> Result.Loading()
//        }
//    }
//
//    // FIX FINAL:
//    // - handleApiCall<T> mengekstrak body dari Response<T> -> Result<T>
//    // - apiService.getMe() bertipe Response<ApiResponse<MeResponse>>
//    // - Maka handleApiCall mengembalikan Result<ApiResponse<MeResponse>>
//    // - Gunakan .map{} untuk unwrap ApiResponse.data -> MeResponse -> UserProfile
//    suspend fun getMe(): Result<UserProfile> {
//        return try {
//            val result: Result<ApiResponse<MeResponse>> = ApiUtils.handleApiCall {
//                apiService.getMe()
//            }
//            val mapped = result.map { apiResponse ->
//                val meResponse = apiResponse.data
//                    ?: throw Exception("Profil tidak tersedia")
//                UserProfile(
//                    id             = meResponse.id,
//                    name           = meResponse.name,
//                    username       = meResponse.username,
//                    email          = meResponse.email,
//                    userType       = meResponse.userType,
//                    role           = meResponse.role,
//                    isClassOfficer = meResponse.isClassOfficer,
//                    createdAt      = meResponse.createdAt,
//                    profile        = meResponse.profile
//                )
//            }
//            if (mapped is Result.Success && persistAuth) {
//                saveUserToPreferences(mapped.data)
//            }
//            mapped
//        } catch (e: Exception) {
//            Log.e(TAG, "getMe exception: ${e.message}", e)
//            Result.Error(e, e.message ?: "Gagal memuat profil")
//        }
//    }
//
//    private suspend fun saveUserToPreferences(user: UserProfile) {
//        try {
//            appPreferences.saveUserId(user.id?.toString() ?: "")
//            appPreferences.saveUserName(user.name ?: "")
//            appPreferences.saveUserRole(user.userType ?: "")
//            appPreferences.saveJabatan(user.role ?: "")
//            val homeroomId = user.teacherProfile?.homeroomClassId?.toString()
//            if (!homeroomId.isNullOrEmpty()) {
//                appPreferences.saveHomeroomClassId(homeroomId)
//                Log.d(TAG, "Simpan homeroom_class_id: $homeroomId")
//            } else {
//                appPreferences.saveHomeroomClassId("")
//            }
//            appPreferences.saveIsPengurus(user.isClassOfficer == true)
//        } catch (e: Exception) {
//            Log.e(TAG, "Gagal simpan preferences: ${e.message}")
//        }
//    }
//
//    suspend fun logout(): Result<Unit> {
//        val result = ApiUtils.handleApiCall { apiService.logout() }.map { Unit }
//        if (result is Result.Success && persistAuth) {
//            appPreferences.clearAuth()
//            ApiClient.resetRetrofit()
//        }
//        return result
//    }
//
//    fun isLoggedIn(): Boolean = appPreferences.isLoggedInSync()
//    fun getAuthToken(): String? = appPreferences.getAuthTokenSync()
//    fun getCurrentUserRole(): String? = appPreferences.getUserRoleSync()
//    fun getCurrentJabatan(): String = appPreferences.getJabatanSync()
//    fun getIsPengurus(): Boolean = appPreferences.getIsPengurusSync()
//    fun getCurrentUserName(): String? = appPreferences.getUserNameSync()
//    fun getCurrentUserId(): String? = appPreferences.getUserIdSync()
//    fun getHomeroomClassId(): String? = appPreferences.getHomeroomClassIdSync()
//}