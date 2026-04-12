package com.example.ritamesa.api

import android.content.Context
import com.example.ritamesa.AppPreferences
import com.example.ritamesa.api.services.ApiService
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object ApiClient {
    private var retrofit: Retrofit? = null
    private var apiService: ApiService? = null
    private lateinit var appPreferences: AppPreferences

    // FIX: Simpan token terakhir yang dipakai, agar bisa deteksi perubahan token
    private var lastToken: String? = null

    fun initialize(context: Context) {
        appPreferences = AppPreferences(context)
    }

    fun getApiService(context: Context): ApiService {
        if (!::appPreferences.isInitialized) {
            initialize(context)
        }

        // FIX: Rebuild jika token berubah (login ulang / logout)
        val currentToken = appPreferences.getAuthTokenSync()
        if (apiService == null || currentToken != lastToken) {
            lastToken = currentToken
            retrofit = createRetrofit(context)
            apiService = retrofit!!.create(ApiService::class.java)
        }

        return apiService!!
    }

    private fun createRetrofit(context: Context): Retrofit {
        return Retrofit.Builder()
            .baseUrl(AppPreferences.API_BASE_URL)
            .client(createOkHttpClient(context))
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    private fun createOkHttpClient(context: Context): OkHttpClient {
        val loggingInterceptor = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BASIC
        }

        val authInterceptor = okhttp3.Interceptor { chain ->
            val originalRequest = chain.request()
            val token = appPreferences.getAuthTokenSync()
            val requestBuilder = originalRequest.newBuilder()

            if (!token.isNullOrEmpty()) {
                requestBuilder.addHeader("Authorization", "Bearer $token")
            }

            requestBuilder.addHeader("Accept", "application/json")

            chain.proceed(requestBuilder.build())
        }

        return OkHttpClient.Builder()
            .addInterceptor(loggingInterceptor)
            .addInterceptor(authInterceptor)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build()
    }

    fun resetRetrofit() {
        retrofit = null
        apiService = null
        lastToken = null
    }
}
