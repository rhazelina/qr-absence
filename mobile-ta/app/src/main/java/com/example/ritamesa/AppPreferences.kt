package com.example.ritamesa

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.runBlocking

private val Context.dataStore by preferencesDataStore(
    name = "app_preferences"
)

class AppPreferences(private val context: Context) {

    companion object {
        val LOGO_URI_KEY = stringPreferencesKey("app_logo_uri")
        val JUDUL_UTAMA_KEY = stringPreferencesKey("app_judul_utama")
        val JUDUL_SUB_KEY = stringPreferencesKey("app_judul_sub")
        val AUTH_TOKEN_KEY = stringPreferencesKey("auth_token")
        val USER_ID_KEY = stringPreferencesKey("user_id")
        val USER_ROLE_KEY = stringPreferencesKey("user_role")
        val USER_NAME_KEY = stringPreferencesKey("user_name")
        val API_BASE_URL = "http://192.168.0.103:8000/api/"

        const val DEFAULT_LOGO = "logo_1"
        const val DEFAULT_JUDUL_UTAMA = "SMKN 2 SINGOSARI"
        const val DEFAULT_JUDUL_SUB = "PRESENSI DIGITAL"
    }

    // ===== LOGO =====
    suspend fun saveLogoUri(uri: String) {
        context.dataStore.edit { preferences ->
            preferences[LOGO_URI_KEY] = uri
        }
    }

    fun getLogoSync(): String {
        return runBlocking {
            context.dataStore.data.map { preferences ->
                preferences[LOGO_URI_KEY] ?: DEFAULT_LOGO
            }.first()
        }
    }

    // ===== JUDUL UTAMA =====
    suspend fun saveJudulUtama(judul: String) {
        context.dataStore.edit { preferences ->
            preferences[JUDUL_UTAMA_KEY] = judul
        }
    }

    fun getJudulUtamaSync(): String {
        return runBlocking {
            context.dataStore.data.map { preferences ->
                preferences[JUDUL_UTAMA_KEY] ?: DEFAULT_JUDUL_UTAMA
            }.first()
        }
    }

    // ===== JUDUL SUB =====
    suspend fun saveJudulSub(judul: String) {
        context.dataStore.edit { preferences ->
            preferences[JUDUL_SUB_KEY] = judul
        }
    }

    fun getJudulSubSync(): String {
        return runBlocking {
            context.dataStore.data.map { preferences ->
                preferences[JUDUL_SUB_KEY] ?: DEFAULT_JUDUL_SUB
            }.first()
        }
    }

    // ===== RESET KE DEFAULT =====
    suspend fun resetToDefault() {
        context.dataStore.edit { preferences ->
            preferences[LOGO_URI_KEY] = DEFAULT_LOGO
            preferences[JUDUL_UTAMA_KEY] = DEFAULT_JUDUL_UTAMA
            preferences[JUDUL_SUB_KEY] = DEFAULT_JUDUL_SUB
        }
    }

    // ===== AUTHENTICATION TOKEN =====
    suspend fun saveAuthToken(token: String) {
        context.dataStore.edit { preferences ->
            preferences[AUTH_TOKEN_KEY] = token
        }
    }

    fun getAuthTokenSync(): String? {
        return runBlocking {
            context.dataStore.data.map { preferences ->
                preferences[AUTH_TOKEN_KEY]
            }.first()
        }
    }

    suspend fun getAuthToken() = context.dataStore.data.map { preferences ->
        preferences[AUTH_TOKEN_KEY]
    }.first()

    // ===== USER ID =====
    suspend fun saveUserId(userId: String) {
        context.dataStore.edit { preferences ->
            preferences[USER_ID_KEY] = userId
        }
    }

    fun getUserIdSync(): String? {
        return runBlocking {
            context.dataStore.data.map { preferences ->
                preferences[USER_ID_KEY]
            }.first()
        }
    }

    // ===== USER ROLE =====
    suspend fun saveUserRole(role: String) {
        context.dataStore.edit { preferences ->
            preferences[USER_ROLE_KEY] = role
        }
    }

    fun getUserRoleSync(): String? {
        return runBlocking {
            context.dataStore.data.map { preferences ->
                preferences[USER_ROLE_KEY]
            }.first()
        }
    }

    // ===== USER NAME =====
    suspend fun saveUserName(name: String) {
        context.dataStore.edit { preferences ->
            preferences[USER_NAME_KEY] = name
        }
    }

    fun getUserNameSync(): String? {
        return runBlocking {
            context.dataStore.data.map { preferences ->
                preferences[USER_NAME_KEY]
            }.first()
        }
    }

    // ===== CLEAR AUTHENTICATION =====
    suspend fun clearAuth() {
        context.dataStore.edit { preferences ->
            preferences.remove(AUTH_TOKEN_KEY)
            preferences.remove(USER_ID_KEY)
            preferences.remove(USER_ROLE_KEY)
            preferences.remove(USER_NAME_KEY)
        }
    }

    fun isLoggedInSync(): Boolean {
        return getAuthTokenSync() != null
    }
}