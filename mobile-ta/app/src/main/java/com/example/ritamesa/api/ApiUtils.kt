package com.example.ritamesa.api

import retrofit2.Response
import java.io.IOException

object ApiUtils {
    suspend fun <T> handleApiCall(call: suspend () -> Response<T>): Result<T> {
        return try {
            val response = call()

            if (response.isSuccessful) {
                val body = response.body()
                if (body != null) {
                    Result.Success(body)
                } else {
                    Result.Error(
                        Exception("Empty response body"),
                        "Response body is empty"
                    )
                }
            } else {
                val errorBody = response.errorBody()?.string()
                val errorMessage = try {
                    if (!errorBody.isNullOrEmpty()) {
                        errorBody
                    } else {
                        response.message() ?: "Unknown error"
                    }
                } catch (e: Exception) {
                    response.message() ?: "Unknown error"
                }

                Result.Error(
                    Exception("HTTP ${response.code()}: ${response.message()}"),
                    errorMessage
                )
            }
        } catch (e: IOException) {
            Result.Error(e, "Network error: ${e.message}")
        } catch (e: Exception) {
            Result.Error(e, "Error: ${e.message}")
        }
    }

    suspend fun <T, R> handleApiCallWithTransform(
        call: suspend () -> Response<T>,
        transform: (T) -> R
    ): Result<R> {
        return try {
            val response = call()

            if (response.isSuccessful) {
                val body = response.body()
                if (body != null) {
                    Result.Success(transform(body))
                } else {
                    Result.Error(
                        Exception("Empty response body"),
                        "Response body is empty"
                    )
                }
            } else {
                val errorBody = response.errorBody()?.string()
                val errorMessage = try {
                    if (!errorBody.isNullOrEmpty()) {
                        errorBody
                    } else {
                        response.message() ?: "Unknown error"
                    }
                } catch (e: Exception) {
                    response.message() ?: "Unknown error"
                }

                Result.Error(
                    Exception("HTTP ${response.code()}: ${response.message()}"),
                    errorMessage
                )
            }
        } catch (e: IOException) {
            Result.Error(e, "Network error: ${e.message}")
        } catch (e: Exception) {
            Result.Error(e, "Error: ${e.message}")
        }
    }
}
