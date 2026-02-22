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
        val TOKEN_KEY = stringPreferencesKey("app_token")

        const val DEFAULT_LOGO = "logo_1"
        const val DEFAULT_JUDUL_UTAMA = "SMKN 2 SINGOSARI"
        const val DEFAULT_JUDUL_SUB = "PRESENSI DIGITAL"
    }

    // ===== TOKEN =====
    suspend fun saveToken(token: String) {
        context.dataStore.edit { preferences ->
            preferences[TOKEN_KEY] = token
        }
    }

    fun getTokenSync(): String {
        return runBlocking {
            context.dataStore.data.map { preferences ->
                preferences[TOKEN_KEY] ?: ""
            }.first()
        }
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
}