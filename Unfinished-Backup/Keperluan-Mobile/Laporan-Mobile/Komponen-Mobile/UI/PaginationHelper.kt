package com.example.ritamesa

import android.content.Context
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONArray
import org.json.JSONObject

/**
 * Helper untuk load semua halaman dari endpoint yang paginated.
 * Mengembalikan JSONArray berisi semua item dari semua halaman.
 *
 * Digunakan di: TotalSiswa, TotalGuru, TotalKelas, dan activity lain yang
 * perlu load semua data (bukan hanya 10 item dari page 1).
 */
object PaginationHelper {

    suspend fun loadAll(
        context: Context,
        endpoint: String,           // contoh: "students", "teachers", "classes"
        perPage: Int = 100,
        extraParams: String = ""    // contoh: "&search=foo"
    ): JSONArray {
        val prefs   = AppPreferences(context)
        val token   = prefs.getAuthTokenSync() ?: ""
        val baseUrl = AppPreferences.API_BASE_URL

        return withContext(Dispatchers.IO) {
            val client   = OkHttpClient()
            val allItems = JSONArray()
            var page     = 1
            var lastPage = 1

            try {
                do {
                    val url = "${baseUrl}${endpoint}?page=$page&per_page=$perPage${extraParams}"
                    val request = Request.Builder()
                        .url(url)
                        .addHeader("Authorization", "Bearer $token")
                        .addHeader("Accept", "application/json")
                        .build()

                    val response = client.newCall(request).execute()

                    // FIX: HTTP error sekarang throw exception agar activity bisa tangkap & tampilkan
                    if (!response.isSuccessful) {
                        throw Exception("HTTP ${response.code} dari /$endpoint — cek token atau koneksi server")
                    }

                    val bodyStr = response.body?.string()
                        ?: throw Exception("Response body kosong dari /$endpoint")

                    val json = JSONObject(bodyStr)

                    // FIX: Tangkap jika "data" tidak ada di response (format tidak sesuai)
                    val dataArr = json.optJSONArray("data")
                        ?: throw Exception(
                            "Format response tidak valid — key 'data' tidak ditemukan di /$endpoint. " +
                                    "Preview: ${bodyStr.take(200)}"
                        )

                    val meta = json.optJSONObject("meta")
                    lastPage = meta?.optInt("last_page", 1) ?: 1

                    for (i in 0 until dataArr.length()) {
                        allItems.put(dataArr.getJSONObject(i))
                    }
                    page++
                } while (page <= lastPage)

            } catch (e: Exception) {
                // Re-throw agar activity bisa tampilkan pesan error yang jelas
                throw e
            }

            allItems
        }
    }
}