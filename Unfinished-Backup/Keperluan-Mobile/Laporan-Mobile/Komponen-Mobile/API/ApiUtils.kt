package com.example.ritamesa.api

import android.util.Log
import retrofit2.Response
import java.io.IOException

object ApiUtils {

    private const val TAG = "ApiUtils"

    // Untuk response yang WRAPPED: {"data": {...}, "links":{...}}
    // Dipakai untuk GET list (PaginatedResponse) dan GET detail (ApiResponse<T>)
    suspend fun <T> handleApiCall(call: suspend () -> Response<T>): Result<T> {
        return try {
            val response = call()
            logResponse(response)

            if (response.isSuccessful) {
                val body = response.body()
                if (body != null) {
                    Result.Success(body)
                } else {
                    Result.Error(Exception("Empty response body"), "Response body is empty")
                }
            } else {
                val errorBody = response.errorBody()?.string()
                val errorMessage = if (!errorBody.isNullOrEmpty()) errorBody
                else response.message() ?: "Unknown error"

                Log.e(TAG, "HTTP Error ${response.code()}: $errorMessage")
                Result.Error(
                    Exception("HTTP ${response.code()}: ${response.message()}"),
                    errorMessage
                )
            }
        } catch (e: IOException) {
            Log.e(TAG, "Network error: ${e.message}", e)
            Result.Error(e, "Network error: ${e.message}")
        } catch (e: Exception) {
            Log.e(TAG, "Error: ${e.message}", e)
            Result.Error(e, "Error: ${e.message}")
        }
    }

    // FIX: Untuk response yang FLAT (tanpa "data" wrapper):
    //   {"id":8,"code":"DKI","name":"...",...}
    // Dipakai untuk POST (create) dan PUT (update) yang API-nya return objek langsung.
    suspend fun <T> handleApiCallFlat(call: suspend () -> Response<T>): Result<T> {
        return try {
            val response = call()
            logResponse(response)

            if (response.isSuccessful) {
                val body = response.body()
                if (body != null) {
                    Result.Success(body)
                } else {
                    // HTTP 200/201 tapi body kosong (misal DELETE yang return 204)
                    Result.Error(Exception("Empty response body"), "Response body is empty")
                }
            } else {
                val errorBody = response.errorBody()?.string()
                val errorMessage = if (!errorBody.isNullOrEmpty()) errorBody
                else response.message() ?: "Unknown error"

                Log.e(TAG, "HTTP Error ${response.code()}: $errorMessage")
                Result.Error(
                    Exception("HTTP ${response.code()}: ${response.message()}"),
                    errorMessage
                )
            }
        } catch (e: IOException) {
            Log.e(TAG, "Network error: ${e.message}", e)
            Result.Error(e, "Network error: ${e.message}")
        } catch (e: Exception) {
            Log.e(TAG, "Error: ${e.message}", e)
            Result.Error(e, "Error: ${e.message}")
        }
    }

    suspend fun <T, R> handleApiCallWithTransform(
        call: suspend () -> Response<T>,
        transform: (T) -> R
    ): Result<R> {
        return try {
            val response = call()
            logResponse(response)

            if (response.isSuccessful) {
                val body = response.body()
                if (body != null) {
                    Result.Success(transform(body))
                } else {
                    Result.Error(Exception("Empty response body"), "Response body is empty")
                }
            } else {
                val errorBody = response.errorBody()?.string()
                val errorMessage = if (!errorBody.isNullOrEmpty()) errorBody
                else response.message() ?: "Unknown error"

                Log.e(TAG, "HTTP Error ${response.code()}: $errorMessage")
                Result.Error(
                    Exception("HTTP ${response.code()}: ${response.message()}"),
                    errorMessage
                )
            }
        } catch (e: IOException) {
            Log.e(TAG, "Network error: ${e.message}", e)
            Result.Error(e, "Network error: ${e.message}")
        } catch (e: Exception) {
            Log.e(TAG, "Error: ${e.message}", e)
            Result.Error(e, "Error: ${e.message}")
        }
    }

    private fun <T> logResponse(response: Response<T>) {
        val url = response.raw().request.url.toString()
        val code = response.code()

        if (response.isSuccessful) {
            Log.d(TAG, "✅ $url ($code)")
        } else {
            Log.e(TAG, "❌ $url ($code)")
        }
    }
}