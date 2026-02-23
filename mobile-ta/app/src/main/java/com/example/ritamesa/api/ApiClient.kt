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

    fun initialize(context: Context) {
        appPreferences = AppPreferences(context)
    }

    fun getApiService(context: Context): ApiService {
        if (apiService == null) {
            if (!::appPreferences.isInitialized) {
                initialize(context)
            }
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
        val httpClient = OkHttpClient.Builder()

        // ===== LOGGING INTERCEPTOR =====
        val loggingInterceptor = HttpLoggingInterceptor()
        loggingInterceptor.level = HttpLoggingInterceptor.Level.BODY

        // ===== AUTHENTICATION INTERCEPTOR =====
        val authInterceptor = okhttp3.Interceptor { chain ->
            val originalRequest = chain.request()

            // Add auth token if available
            val token = appPreferences.getAuthTokenSync()
            val requestBuilder = originalRequest.newBuilder()

            if (!token.isNullOrEmpty()) {
                requestBuilder.addHeader("Authorization", "Bearer $token")
            }

            requestBuilder.addHeader("Accept", "application/json")
            // requestBuilder.addHeader("Content-Type", "application/json")

            val newRequest = requestBuilder.build()
            chain.proceed(newRequest)
        }

        httpClient
            .addInterceptor(loggingInterceptor)
            .addInterceptor(authInterceptor)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)

        return httpClient.build()
    }

    fun resetRetrofit() {
        retrofit = null
        apiService = null
    }
}
