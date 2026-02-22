package com.example.ritamesa.data.dto

import com.google.gson.annotations.SerializedName

data class LoginRequest(
    @SerializedName("login") val login: String,
    @SerializedName("password") val password: String,
    @SerializedName("device_name") val deviceName: String = "AndroidApp"
)

data class LoginResponseData(
    @SerializedName("user") val user: UserDto?,
    @SerializedName("token") val token: String?
)
