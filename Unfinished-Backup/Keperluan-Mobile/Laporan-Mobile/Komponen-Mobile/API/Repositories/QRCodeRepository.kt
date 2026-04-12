// meyzha-rendra/app/src/main/java/com/example/ritamesa/api/repositories/QRCodeRepository.kt
package com.example.ritamesa.api.repositories

import android.content.Context
import android.util.Log
import com.example.ritamesa.AppPreferences
import com.example.ritamesa.api.ApiClient
import com.example.ritamesa.api.ApiUtils
import com.example.ritamesa.api.Result
import com.example.ritamesa.api.models.*
import com.google.gson.Gson
import com.google.gson.JsonObject
import com.google.gson.JsonParser
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.util.concurrent.TimeUnit

class QRCodeRepository(
    private val context: Context,
    private val apiService: com.example.ritamesa.api.services.ApiService = ApiClient.getApiService(context)
) {
    companion object {
        private const val TAG = "QRCodeRepository"
        private val gson = Gson()

        // OkHttpClient khusus untuk QR — tidak pakai Retrofit agar bisa baca raw JSON
        private val okClient = OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build()
    }

    // ──────────────────────────────────────────────────────────────────────────

    suspend fun generateQRCode(
        scheduleId: Int,
        type: String = "student",
        expiresInMinutes: Int = 5
    ): Result<GenerateQRCodeResponse> {
        Log.d(TAG, "generateQRCode: scheduleId=$scheduleId")
        return callQREndpointRaw("qrcodes/generate", scheduleId, type, expiresInMinutes)
    }

    /**
     * POST /me/class/qr-token
     *
     * ApiService mendeklarasikan return: Response<ApiResponse<GenerateQRCodeResponse>>
     * tapi backend mengembalikan JSON root-level TANPA wrapper "data":
     *
     *   { "qrcode": { "token": "...", "expires_at": "..." },
     *     "payload": { "token": "...", "expires_at": "..." },
     *     "metadata": { ... }, "mobile_format": "..." }
     *
     * Karena Gson memetakan field "data" yang tidak ada → ApiResponse.data = null.
     * Solusi: bypass Retrofit, panggil OkHttp langsung, parse JSON manual.
     */
    suspend fun generateMyClassQRToken(
        scheduleId: Int,
        type: String = "student",
        expiresInMinutes: Int = 5
    ): Result<GenerateQRCodeResponse> {
        Log.d(TAG, "generateMyClassQRToken: scheduleId=$scheduleId")
        return callQREndpointRaw("me/class/qr-token", scheduleId, type, expiresInMinutes)
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Raw OkHttp call — bypass Retrofit/ApiResponse wrapper
    // ──────────────────────────────────────────────────────────────────────────

    private suspend fun callQREndpointRaw(
        path: String,
        scheduleId: Int,
        type: String,
        expiresInMinutes: Int
    ): Result<GenerateQRCodeResponse> = withContext(Dispatchers.IO) {
        try {
            val prefs     = AppPreferences(context)
            val baseUrl   = AppPreferences.API_BASE_URL.trimEnd('/')
            val authToken = prefs.getAuthTokenSync()

            if (authToken.isNullOrBlank()) {
                Log.e(TAG, "Auth token kosong")
                return@withContext Result.Error(
                    Exception("Unauthenticated"),
                    "Sesi login habis. Silakan login ulang."
                )
            }

            val url      = "$baseUrl/$path"
            val bodyJson = """{"schedule_id":$scheduleId,"type":"$type","expires_in_minutes":$expiresInMinutes}"""

            Log.d(TAG, "→ POST $url | body=$bodyJson")

            val request = Request.Builder()
                .url(url)
                .post(bodyJson.toRequestBody("application/json; charset=utf-8".toMediaType()))
                .addHeader("Authorization", "Bearer $authToken")
                .addHeader("Accept", "application/json")
                .build()

            val response = okClient.newCall(request).execute()
            val bodyStr  = response.body?.string() ?: ""

            Log.d(TAG, "← HTTP ${response.code} | body=${bodyStr.take(500)}")

            if (!response.isSuccessful) {
                val errMsg = extractErrorMessage(bodyStr, response.code)
                Log.e(TAG, "Error $errMsg")
                return@withContext Result.Error(Exception("HTTP ${response.code}"), errMsg)
            }

            parseQRSuccess(bodyStr, scheduleId, type)

        } catch (e: Exception) {
            Log.e(TAG, "callQREndpointRaw exception: ${e.message}", e)
            Result.Error(e, "Gagal menghubungi server: ${e.message}")
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Parse respons sukses — ekstrak token dari semua kemungkinan path JSON
    // ──────────────────────────────────────────────────────────────────────────

    private fun parseQRSuccess(
        bodyStr: String,
        scheduleId: Int,
        type: String
    ): Result<GenerateQRCodeResponse> {
        val root: JsonObject = try {
            JsonParser.parseString(bodyStr).asJsonObject
        } catch (e: Exception) {
            Log.e(TAG, "JSON tidak valid: ${e.message}")
            return Result.Error(Exception("Invalid JSON"), "Respons server tidak valid")
        }

        // Ekstrak token — coba semua path dari struktur respons aktual backend:
        // 1. root["qrcode"]["token"]  ← PATH UTAMA (dari log aktual)
        // 2. root["payload"]["token"] ← duplikat token di field payload
        // 3. root["data"]["token"]    ← jika backend berubah pakai wrapper
        // 4. root["token"]            ← fallback root level
        val token: String? =
            root.obj("qrcode")?.str("token")
                ?: root.obj("payload")?.str("token")
                ?: root.obj("data")?.str("token")
                ?: root.str("token")

        val expiresAt: String? =
            root.obj("qrcode")?.str("expires_at")
                ?: root.obj("payload")?.str("expires_at")
                ?: root.obj("data")?.str("expires_at")
                ?: root.str("expires_at")

        if (token.isNullOrBlank()) {
            Log.e(TAG, "Token null setelah parse semua path. body=$bodyStr")
            return Result.Error(
                Exception("Token not found"),
                "Token QR tidak ditemukan dalam respons server"
            )
        }

        Log.d(TAG, "✓ token=$token | expiresAt=$expiresAt")

        return Result.Success(
            GenerateQRCodeResponse(
                qrcode       = root.obj("qrcode")
                    ?.let { gson.fromJson(it, QrcodeDetail::class.java) },
                payload      = QRPayloadInfo(
                    token      = token,
                    expiresAt  = expiresAt,
                    type       = type,
                    scheduleId = scheduleId
                ),
                metadata     = root.obj("metadata")
                    ?.let { gson.fromJson(it, QRMetadata::class.java) },
                mobileFormat = root.str("mobile_format")
            )
        )
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Endpoint lain — tetap pakai Retrofit (tidak bermasalah)
    // ──────────────────────────────────────────────────────────────────────────

    suspend fun getActiveQRCode(): Result<Qrcode> {
        Log.d(TAG, "getActiveQRCode")
        return ApiUtils.handleApiCall { apiService.getActiveQRCode() }
            .map { it.data?.firstOrNull() ?: throw Exception("Tidak ada QR Code yang aktif saat ini") }
    }

    suspend fun getQRCode(token: String): Result<Qrcode> {
        Log.d(TAG, "getQRCode: token=$token")
        return ApiUtils.handleApiCallFlat { apiService.getQRCode(token) }
    }

    suspend fun revokeQRCode(token: String): Result<Any> {
        Log.d(TAG, "revokeQRCode: token=$token")
        return ApiUtils.handleApiCall { apiService.revokeQRCode(token) }
            .map { it["message"] ?: Any() }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Helpers
    // ──────────────────────────────────────────────────────────────────────────

    private fun extractErrorMessage(bodyStr: String, code: Int): String {
        if (bodyStr.isBlank()) return "HTTP Error $code"
        return try {
            JsonParser.parseString(bodyStr).asJsonObject.str("message")
                ?: "HTTP Error $code"
        } catch (_: Exception) {
            "HTTP Error $code"
        }
    }

    // JsonObject extension helpers (private, scoped ke file ini)
    private fun JsonObject.obj(key: String): JsonObject? = try {
        get(key)?.takeIf { !it.isJsonNull }?.asJsonObject
    } catch (_: Exception) { null }

    private fun JsonObject.str(key: String): String? = try {
        get(key)?.takeIf { !it.isJsonNull }?.asString?.takeIf { it.isNotBlank() }
    } catch (_: Exception) { null }
}



// v1
//package com.example.ritamesa.api.repositories
//
//import android.content.Context
//import android.util.Log
//import com.example.ritamesa.AppPreferences
//import com.example.ritamesa.api.ApiClient
//import com.example.ritamesa.api.ApiUtils
//import com.example.ritamesa.api.Result
//import com.example.ritamesa.api.models.*
//import com.google.gson.Gson
//import com.google.gson.JsonObject
//import com.google.gson.JsonParser
//import kotlinx.coroutines.Dispatchers
//import kotlinx.coroutines.withContext
//import okhttp3.MediaType.Companion.toMediaType
//import okhttp3.OkHttpClient
//import okhttp3.Request
//import okhttp3.RequestBody.Companion.toRequestBody
//import java.util.concurrent.TimeUnit
//
//class QRCodeRepository(
//    private val context: Context,
//    private val apiService: com.example.ritamesa.api.services.ApiService = ApiClient.getApiService(context)
//) {
//    companion object {
//        private const val TAG = "QRCodeRepository"
//        private val gson = Gson()
//
//        // OkHttpClient khusus untuk QR — tidak pakai Retrofit agar bisa baca raw JSON
//        private val okClient = OkHttpClient.Builder()
//            .connectTimeout(30, TimeUnit.SECONDS)
//            .readTimeout(30, TimeUnit.SECONDS)
//            .writeTimeout(30, TimeUnit.SECONDS)
//            .build()
//    }
//
//    // ──────────────────────────────────────────────────────────────────────────
//
//    suspend fun generateQRCode(
//        scheduleId: Int,
//        type: String = "student",
//        expiresInMinutes: Int = 5
//    ): Result<GenerateQRCodeResponse> {
//        Log.d(TAG, "generateQRCode: scheduleId=$scheduleId")
//        return callQREndpointRaw("qrcodes/generate", scheduleId, type, expiresInMinutes)
//    }
//
//    /**
//     * POST /me/class/qr-token
//     *
//     * ApiService mendeklarasikan return: Response<ApiResponse<GenerateQRCodeResponse>>
//     * tapi backend mengembalikan JSON root-level TANPA wrapper "data":
//     *
//     *   { "qrcode": { "token": "...", "expires_at": "..." },
//     *     "payload": { "token": "...", "expires_at": "..." },
//     *     "metadata": { ... }, "mobile_format": "..." }
//     *
//     * Karena Gson memetakan field "data" yang tidak ada → ApiResponse.data = null.
//     * Solusi: bypass Retrofit, panggil OkHttp langsung, parse JSON manual.
//     */
//    suspend fun generateMyClassQRToken(
//        scheduleId: Int,
//        type: String = "student",
//        expiresInMinutes: Int = 5
//    ): Result<GenerateQRCodeResponse> {
//        Log.d(TAG, "generateMyClassQRToken: scheduleId=$scheduleId")
//        return callQREndpointRaw("me/class/qr-token", scheduleId, type, expiresInMinutes)
//    }
//
//    // ──────────────────────────────────────────────────────────────────────────
//    // Raw OkHttp call — bypass Retrofit/ApiResponse wrapper
//    // ──────────────────────────────────────────────────────────────────────────
//
//    private suspend fun callQREndpointRaw(
//        path: String,
//        scheduleId: Int,
//        type: String,
//        expiresInMinutes: Int
//    ): Result<GenerateQRCodeResponse> = withContext(Dispatchers.IO) {
//        try {
//            val prefs     = AppPreferences(context)
//            val baseUrl   = AppPreferences.API_BASE_URL.trimEnd('/')
//            val authToken = prefs.getAuthTokenSync()
//
//            if (authToken.isNullOrBlank()) {
//                Log.e(TAG, "Auth token kosong")
//                return@withContext Result.Error(
//                    Exception("Unauthenticated"),
//                    "Sesi login habis. Silakan login ulang."
//                )
//            }
//
//            val url      = "$baseUrl/$path"
//            val bodyJson = """{"schedule_id":$scheduleId,"type":"$type","expires_in_minutes":$expiresInMinutes}"""
//
//            Log.d(TAG, "→ POST $url | body=$bodyJson")
//
//            val request = Request.Builder()
//                .url(url)
//                .post(bodyJson.toRequestBody("application/json; charset=utf-8".toMediaType()))
//                .addHeader("Authorization", "Bearer $authToken")
//                .addHeader("Accept", "application/json")
//                .build()
//
//            val response = okClient.newCall(request).execute()
//            val bodyStr  = response.body?.string() ?: ""
//
//            Log.d(TAG, "← HTTP ${response.code} | body=${bodyStr.take(500)}")
//
//            if (!response.isSuccessful) {
//                val errMsg = extractErrorMessage(bodyStr, response.code)
//                Log.e(TAG, "Error $errMsg")
//                return@withContext Result.Error(Exception("HTTP ${response.code}"), errMsg)
//            }
//
//            parseQRSuccess(bodyStr, scheduleId, type)
//
//        } catch (e: Exception) {
//            Log.e(TAG, "callQREndpointRaw exception: ${e.message}", e)
//            Result.Error(e, "Gagal menghubungi server: ${e.message}")
//        }
//    }
//
//    // ──────────────────────────────────────────────────────────────────────────
//    // Parse respons sukses — ekstrak token dari semua kemungkinan path JSON
//    // ──────────────────────────────────────────────────────────────────────────
//
//    private fun parseQRSuccess(
//        bodyStr: String,
//        scheduleId: Int,
//        type: String
//    ): Result<GenerateQRCodeResponse> {
//        val root: JsonObject = try {
//            JsonParser.parseString(bodyStr).asJsonObject
//        } catch (e: Exception) {
//            Log.e(TAG, "JSON tidak valid: ${e.message}")
//            return Result.Error(Exception("Invalid JSON"), "Respons server tidak valid")
//        }
//
//        // Ekstrak token — coba semua path dari struktur respons aktual backend:
//        // 1. root["qrcode"]["token"]  ← PATH UTAMA (dari log aktual)
//        // 2. root["payload"]["token"] ← duplikat token di field payload
//        // 3. root["data"]["token"]    ← jika backend berubah pakai wrapper
//        // 4. root["token"]            ← fallback root level
//        val token: String? =
//            root.obj("qrcode")?.str("token")
//                ?: root.obj("payload")?.str("token")
//                ?: root.obj("data")?.str("token")
//                ?: root.str("token")
//
//        val expiresAt: String? =
//            root.obj("qrcode")?.str("expires_at")
//                ?: root.obj("payload")?.str("expires_at")
//                ?: root.obj("data")?.str("expires_at")
//                ?: root.str("expires_at")
//
//        if (token.isNullOrBlank()) {
//            Log.e(TAG, "Token null setelah parse semua path. body=$bodyStr")
//            return Result.Error(
//                Exception("Token not found"),
//                "Token QR tidak ditemukan dalam respons server"
//            )
//        }
//
//        Log.d(TAG, "✓ token=$token | expiresAt=$expiresAt")
//
//        return Result.Success(
//            GenerateQRCodeResponse(
//                qrcode       = root.obj("qrcode")
//                    ?.let { gson.fromJson(it, QrcodeDetail::class.java) },
//                payload      = QRPayloadInfo(
//                    token      = token,
//                    expiresAt  = expiresAt,
//                    type       = type,
//                    scheduleId = scheduleId
//                ),
//                metadata     = root.obj("metadata")
//                    ?.let { gson.fromJson(it, QRMetadata::class.java) },
//                mobileFormat = root.str("mobile_format")
//            )
//        )
//    }
//
//    // ──────────────────────────────────────────────────────────────────────────
//    // Endpoint lain — tetap pakai Retrofit (tidak bermasalah)
//    // ──────────────────────────────────────────────────────────────────────────
//
//    suspend fun getActiveQRCode(): Result<Qrcode> {
//        Log.d(TAG, "getActiveQRCode")
//        return ApiUtils.handleApiCall { apiService.getActiveQRCode() }
//            .map { it.data ?: throw Exception("Tidak ada QR Code yang aktif saat ini") }
//    }
//
//    suspend fun getQRCode(token: String): Result<Qrcode> {
//        Log.d(TAG, "getQRCode: token=$token")
//        return ApiUtils.handleApiCall { apiService.getQRCode(token) }
//            .map { it.data ?: throw Exception("QR Code tidak ditemukan") }
//    }
//
//    suspend fun revokeQRCode(token: String): Result<Any> {
//        Log.d(TAG, "revokeQRCode: token=$token")
//        return ApiUtils.handleApiCall { apiService.revokeQRCode(token) }
//            .map { it.data ?: Any() }
//    }
//
//    // ──────────────────────────────────────────────────────────────────────────
//    // Helpers
//    // ──────────────────────────────────────────────────────────────────────────
//
//    private fun extractErrorMessage(bodyStr: String, code: Int): String {
//        if (bodyStr.isBlank()) return "HTTP Error $code"
//        return try {
//            JsonParser.parseString(bodyStr).asJsonObject.str("message")
//                ?: "HTTP Error $code"
//        } catch (_: Exception) {
//            "HTTP Error $code"
//        }
//    }
//
//    // JsonObject extension helpers (private, scoped ke file ini)
//    private fun JsonObject.obj(key: String): JsonObject? = try {
//        get(key)?.takeIf { !it.isJsonNull }?.asJsonObject
//    } catch (_: Exception) { null }
//
//    private fun JsonObject.str(key: String): String? = try {
//        get(key)?.takeIf { !it.isJsonNull }?.asString?.takeIf { it.isNotBlank() }
//    } catch (_: Exception) { null }
//}