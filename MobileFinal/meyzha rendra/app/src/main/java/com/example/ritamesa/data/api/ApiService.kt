package com.example.ritamesa.data.api

import com.example.ritamesa.data.dto.BaseResponse
import com.example.ritamesa.data.dto.LoginRequest
import com.example.ritamesa.data.dto.LoginResponseData
import com.example.ritamesa.data.dto.ScanRequest
import com.example.ritamesa.data.dto.ScheduleDto
import com.example.ritamesa.data.dto.UserDto
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

interface ApiService {

    @POST("api/auth/login")
    suspend fun login(@Body request: LoginRequest): Response<BaseResponse<LoginResponseData>>

    @GET("api/me")
    suspend fun getProfile(): Response<BaseResponse<UserDto>>

    @GET("api/me/class/schedules")
    suspend fun getSchedules(): Response<BaseResponse<List<ScheduleDto>>>

    @POST("api/attendance/scan")
    suspend fun scanQr(@Body request: ScanRequest): Response<BaseResponse<Any>>
}
