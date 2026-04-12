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
     * - Admin       : email + password
     * - Guru / Waka : kode_guru + password
     * - Wali Kelas  : kode_guru + password (homeroom_class_id otomatis disimpan)
     * - Siswa       : NISN (tanpa password)
     *
     * GURU YANG JUGA WAKA:
     *   Backend mengembalikan role = "waka" atau "guru" tergantung jabatan utama.
     *   Tidak ada validasi ganda — satu kali login langsung masuk sesuai role backend.
     *   AppPreferences.canAccessClassScheduleMenuSync() mengizinkan akses waka
     *   berdasarkan role, bukan jabatan terpisah.
     *
     * PROFILE NULL:
     *   Untuk role admin/waka, profile bisa null — ini valid dan tidak memblokir login.
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

                // profile null valid untuk admin/waka — jangan throw
                val safeUser = buildSafeUserProfile(user)

                if (persistAuth) {
                    loginResponse.token?.let { appPreferences.saveAuthToken(it) }
                    saveUserToPreferences(safeUser)
                    Log.d(TAG, "Login berhasil: role=${safeUser.role}, userType=${safeUser.userType}")
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
                        id             = meResponse.id,
                        name           = meResponse.name,
                        username       = meResponse.username,
                        email          = meResponse.email,
                        userType       = meResponse.userType,
                        role           = meResponse.role,
                        isClassOfficer = meResponse.isClassOfficer,
                        createdAt      = meResponse.createdAt,
                        studentProfile = meResponse.studentProfile,
                        teacherProfile = meResponse.teacherProfile,
                        profile        = meResponse.profile   // nullable OK
                    )
                )
                Result.Success(safeUser)
            }

            is Result.Error   -> Result.Error(meResult.exception, meResult.message)
            is Result.Loading -> Result.Loading()
        }

        if (result is Result.Success && persistAuth) {
            saveUserToPreferences(result.data)
            Log.d(TAG, "getMe berhasil & preferences diperbarui")
        }

        return result
    }

    /**
     * Profile boleh null untuk role admin/waka — jangan anggap error.
     */
    private fun buildSafeUserProfile(user: UserProfile): UserProfile {
        if (user.profile == null) {
            Log.d(TAG, "Profile null: id=${user.id}, role=${user.role}, userType=${user.userType}")
        }
        return user.copy(profile = user.profile)
    }

    /**
     * Simpan data user ke AppPreferences secara terpusat.
     *
     * GURU YANG JUGA WAKA:
     *   - role (jabatan backend) disimpan apa adanya — "waka" atau "guru"
     *   - Tidak ada fetch jabatan tambahan / validasi ganda
     *   - AppPreferences.canAccessClassScheduleMenuSync() membaca role ini langsung
     */
    private suspend fun saveUserToPreferences(user: UserProfile) {
        try {
            appPreferences.saveUserId(user.id?.toString() ?: "")
            appPreferences.saveUserName(user.name ?: "")
            appPreferences.saveUserRole(user.userType ?: "")

            // role dari backend dipakai sebagai jabatan (untuk routing dashboard)
            val backendRole = user.role ?: ""
            appPreferences.saveJabatan(backendRole)

            val teacherJabatanCsv = when {
                !user.teacherProfile?.jabatan.isNullOrEmpty() -> user.teacherProfile?.jabatanJoined.orEmpty()
                !user.profile?.jabatan.isNullOrBlank() -> user.profile?.jabatan.orEmpty()
                else -> ""
            }
            appPreferences.saveTeacherJabatan(teacherJabatanCsv)

            // homeroom_class_id untuk wali kelas
            val homeroomId = user.teacherProfile?.homeroomClassId?.toString()
                ?: user.profile?.homeroomClassId?.toString()
            if (!homeroomId.isNullOrEmpty()) {
                appPreferences.saveHomeroomClassId(homeroomId)
                Log.d(TAG, "Simpan homeroom_class_id: $homeroomId")
            } else {
                // Bersihkan agar tidak bocor antar sesi
                appPreferences.saveHomeroomClassId("")
                Log.d(TAG, "Bukan wali kelas, homeroom_class_id dikosongkan")
            }

            // is_class_officer untuk siswa pengurus
            appPreferences.saveIsPengurus(user.isClassOfficer == true)

            Log.d(TAG, "Preferences saved: role=${user.userType}, jabatan=$backendRole, teacherJabatan=$teacherJabatanCsv")
        } catch (e: Exception) {
            Log.e(TAG, "Gagal simpan preferences: ${e.message}")
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

    fun isLoggedIn(): Boolean       = appPreferences.isLoggedInSync()
    fun getAuthToken(): String?     = appPreferences.getAuthTokenSync()
    fun getCurrentUserRole(): String? = appPreferences.getUserRoleSync()
    fun getCurrentJabatan(): String = appPreferences.getJabatanSync()
    fun getIsPengurus(): Boolean    = appPreferences.getIsPengurusSync()
    fun getCurrentUserName(): String? = appPreferences.getUserNameSync()
    fun getCurrentUserId(): String?  = appPreferences.getUserIdSync()
    fun getHomeroomClassId(): String? = appPreferences.getHomeroomClassIdSync()

    /**
     * Akses menu ClassSchedule:
     *   - role "admin"  → boleh
     *   - role "waka"   → boleh (termasuk guru yang jabatan utamanya waka)
     *   - lainnya       → tidak boleh
     */
    fun canAccessClassScheduleMenu(): Boolean = appPreferences.canAccessClassScheduleMenuSync()
}
