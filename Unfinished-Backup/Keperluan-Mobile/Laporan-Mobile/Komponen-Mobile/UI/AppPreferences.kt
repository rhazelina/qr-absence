package com.example.ritamesa

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.runBlocking
import java.util.Locale

private val Context.dataStore by preferencesDataStore(name = "app_preferences")

class AppPreferences(private val context: Context) {

    companion object {
        val LOGO_URI_KEY       = stringPreferencesKey("app_logo_uri")
        val JUDUL_UTAMA_KEY    = stringPreferencesKey("app_judul_utama")
        val JUDUL_SUB_KEY      = stringPreferencesKey("app_judul_sub")

        val AUTH_TOKEN_KEY     = stringPreferencesKey("auth_token")
        val USER_ID_KEY        = stringPreferencesKey("user_id")
        val USER_ROLE_KEY      = stringPreferencesKey("user_role")
        val USER_NAME_KEY      = stringPreferencesKey("user_name")
        val JABATAN_KEY        = stringPreferencesKey("jabatan")
        val HOMEROOM_CLASS_ID_KEY = stringPreferencesKey("homeroom_class_id")
        val IS_PENGURUS_KEY       = stringPreferencesKey("is_pengurus")

        const val API_BASE_URL = "https://unstentorian-enforceable-louann.ngrok-free.dev/api/"

        const val DEFAULT_LOGO        = "logo_1"
        const val DEFAULT_JUDUL_UTAMA = "SMKN 2 SINGOSARI"
        const val DEFAULT_JUDUL_SUB   = "PRESENSI DIGITAL"
        const val DEFAULT_SCHOOL_NAME = "SMKN 2 SINGOSARI"

        val SCHOOL_NAME_KEY           = stringPreferencesKey("school_name")
        val SCHOOL_NPSN_KEY           = stringPreferencesKey("school_npsn")
        val SCHOOL_TYPE_KEY           = stringPreferencesKey("school_type")
        val SCHOOL_ACCREDITATION_KEY  = stringPreferencesKey("school_accreditation")
        val SCHOOL_HEADMASTER_KEY     = stringPreferencesKey("school_headmaster")
        val SCHOOL_HEADMASTER_NIP_KEY = stringPreferencesKey("school_headmaster_nip")
        val SCHOOL_EMAIL_KEY          = stringPreferencesKey("school_email")
        val SCHOOL_PHONE_KEY          = stringPreferencesKey("school_phone")
        val SCHOOL_ADDRESS_KEY        = stringPreferencesKey("school_address")
        val VILLAGE_KEY               = stringPreferencesKey("village")
        val DISTRICT_KEY              = stringPreferencesKey("district")
        val CITY_KEY                  = stringPreferencesKey("city")
        val PROVINCE_KEY              = stringPreferencesKey("province")
        val POSTAL_CODE_KEY           = stringPreferencesKey("postal_code")

        val SCHOOL_DEFAULTS = mapOf(
            "school_name"           to "SMKN 2 SINGOSARI",
            "school_npsn"           to "20517748",
            "school_type"           to "SMK",
            "school_accreditation"  to "A",
            "school_headmaster"     to "SUMIJAH, S.Pd., M.Si",
            "school_headmaster_nip" to "97002101998022009",
            "school_email"          to "smkn2.singosari@yahoo.co.id",
            "school_phone"          to "(0341) 458823",
            "school_address"        to "Jl. Perusahaan No.20",
            "village"               to "Tunjungtirto",
            "district"              to "Singosari",
            "city"                  to "Kab. Malang",
            "province"              to "Jawa Timur",
            "postal_code"           to "65154"
        )
    }

    suspend fun saveLogoUri(uri: String) {
        context.dataStore.edit { it[LOGO_URI_KEY] = uri }
    }
    fun getLogoSync(): String = runBlocking {
        context.dataStore.data.map { it[LOGO_URI_KEY] ?: DEFAULT_LOGO }.first()
    }

    suspend fun saveJudulUtama(judul: String) {
        context.dataStore.edit { it[JUDUL_UTAMA_KEY] = judul }
    }
    fun getJudulUtamaSync(): String = runBlocking {
        context.dataStore.data.map { it[JUDUL_UTAMA_KEY] ?: DEFAULT_JUDUL_UTAMA }.first()
    }

    suspend fun saveJudulSub(judul: String) {
        context.dataStore.edit { it[JUDUL_SUB_KEY] = judul }
    }
    fun getJudulSubSync(): String = runBlocking {
        context.dataStore.data.map { it[JUDUL_SUB_KEY] ?: DEFAULT_JUDUL_SUB }.first()
    }

    suspend fun saveAuthToken(token: String) {
        context.dataStore.edit { it[AUTH_TOKEN_KEY] = token }
    }
    fun getAuthTokenSync(): String? = runBlocking {
        context.dataStore.data.map { it[AUTH_TOKEN_KEY] }.first()
    }
    suspend fun getAuthToken() = context.dataStore.data.map { it[AUTH_TOKEN_KEY] }.first()

    suspend fun saveUserId(userId: String) {
        context.dataStore.edit { it[USER_ID_KEY] = userId }
    }
    fun getUserIdSync(): String? = runBlocking {
        context.dataStore.data.map { it[USER_ID_KEY] }.first()
    }

    suspend fun saveUserRole(role: String) {
        context.dataStore.edit { it[USER_ROLE_KEY] = role }
    }
    fun getUserRoleSync(): String? = runBlocking {
        context.dataStore.data.map { it[USER_ROLE_KEY] }.first()
    }

    suspend fun saveUserName(name: String) {
        context.dataStore.edit { it[USER_NAME_KEY] = name }
    }
    fun getUserNameSync(): String? = runBlocking {
        context.dataStore.data.map { it[USER_NAME_KEY] }.first()
    }

    suspend fun saveJabatan(jabatan: String) {
        context.dataStore.edit { it[JABATAN_KEY] = jabatan }
    }
    fun getJabatanSync(): String = runBlocking {
        context.dataStore.data.map { it[JABATAN_KEY] ?: "" }.first()
    }

    suspend fun saveHomeroomClassId(classId: String) {
        context.dataStore.edit { it[HOMEROOM_CLASS_ID_KEY] = classId }
    }
    fun getHomeroomClassIdSync(): String? = runBlocking {
        context.dataStore.data.map { it[HOMEROOM_CLASS_ID_KEY] }.first()
    }
    fun getHomeroomClassIdIntSync(): Int? = getHomeroomClassIdSync()?.toIntOrNull()

    suspend fun saveIsPengurus(isPengurus: Boolean) {
        context.dataStore.edit { it[IS_PENGURUS_KEY] = if (isPengurus) "true" else "false" }
    }
    fun getIsPengurusSync(): Boolean = runBlocking {
        context.dataStore.data.map { it[IS_PENGURUS_KEY] == "true" }.first()
    }

    fun getDisplayRoleSync(): String {
        val role = getUserRoleSync() ?: return "Unknown"
        return when (role) {
            "teacher" -> {
                val jabatan = getJabatanSync()
                when (jabatan) {
                    "Wali Kelas" -> "Guru (Wali Kelas)"
                    "Waka" -> "Guru (Waka Kurikulum)"
                    else -> "Guru"
                }
            }
            "student" -> {
                if (getIsPengurusSync()) "Siswa (Pengurus Kelas)" else "Siswa"
            }
            "admin" -> "Admin"
            else -> role.replaceFirstChar { if (it.isLowerCase()) it.titlecase(Locale.getDefault()) else it.toString() }
        }
    }

    fun isTeacherSync(): Boolean = getUserRoleSync() == "teacher"
    fun isHomeroomTeacherSync(): Boolean = isTeacherSync() && (getJabatanSync() == "wakel" || getJabatanSync() == "Wali Kelas")
    fun isWakaSync(): Boolean = isTeacherSync() && getJabatanSync() == "waka"
    fun isRegularStudentSync(): Boolean = getUserRoleSync() == "student" && !getIsPengurusSync()

//    fun isTeacherSync(): Boolean = getUserRoleSync() == "teacher"
//    fun isHomeroomTeacherSync(): Boolean = isTeacherSync() && getJabatanSync() == "Wali Kelas"
//    fun isWakaSync(): Boolean = isTeacherSync() && getJabatanSync() == "Waka"
//    fun isRegularStudentSync(): Boolean = getUserRoleSync() == "student" && !getIsPengurusSync()

    suspend fun clearAuth() {
        context.dataStore.edit { prefs ->
            prefs.remove(AUTH_TOKEN_KEY)
            prefs.remove(USER_ID_KEY)
            prefs.remove(USER_ROLE_KEY)
            prefs.remove(USER_NAME_KEY)
            prefs.remove(JABATAN_KEY)
            prefs.remove(HOMEROOM_CLASS_ID_KEY)
            prefs.remove(IS_PENGURUS_KEY)
        }
    }

    fun isLoggedInSync(): Boolean = getAuthTokenSync() != null

    suspend fun resetToDefault() {
        context.dataStore.edit { prefs ->
            prefs[LOGO_URI_KEY]             = DEFAULT_LOGO
            prefs[JUDUL_UTAMA_KEY]          = DEFAULT_JUDUL_UTAMA
            prefs[JUDUL_SUB_KEY]            = DEFAULT_JUDUL_SUB
            prefs[SCHOOL_NAME_KEY]          = SCHOOL_DEFAULTS["school_name"]!!
            prefs[SCHOOL_NPSN_KEY]          = SCHOOL_DEFAULTS["school_npsn"]!!
            prefs[SCHOOL_TYPE_KEY]          = SCHOOL_DEFAULTS["school_type"]!!
            prefs[SCHOOL_ACCREDITATION_KEY] = SCHOOL_DEFAULTS["school_accreditation"]!!
            prefs[SCHOOL_HEADMASTER_KEY]    = SCHOOL_DEFAULTS["school_headmaster"]!!
            prefs[SCHOOL_HEADMASTER_NIP_KEY]= SCHOOL_DEFAULTS["school_headmaster_nip"]!!
            prefs[SCHOOL_EMAIL_KEY]         = SCHOOL_DEFAULTS["school_email"]!!
            prefs[SCHOOL_PHONE_KEY]         = SCHOOL_DEFAULTS["school_phone"]!!
            prefs[SCHOOL_ADDRESS_KEY]       = SCHOOL_DEFAULTS["school_address"]!!
            prefs[VILLAGE_KEY]              = SCHOOL_DEFAULTS["village"]!!
            prefs[DISTRICT_KEY]             = SCHOOL_DEFAULTS["district"]!!
            prefs[CITY_KEY]                  = SCHOOL_DEFAULTS["city"]!!
            prefs[PROVINCE_KEY]              = SCHOOL_DEFAULTS["province"]!!
            prefs[POSTAL_CODE_KEY]           = SCHOOL_DEFAULTS["postal_code"]!!
        }
    }

    fun getSettingSync(key: String, default: String = ""): String = runBlocking {
        val prefKey = stringPreferencesKey(key)
        context.dataStore.data.map { it[prefKey] ?: (SCHOOL_DEFAULTS[key] ?: default) }.first()
    }

    suspend fun saveSetting(key: String, value: String) {
        val prefKey = stringPreferencesKey(key)
        context.dataStore.edit { it[prefKey] = value }
    }
}