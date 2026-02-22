package com.example.ritamesa.data.dto

import com.google.gson.annotations.SerializedName

data class ScanRequest(
    @SerializedName("token") val token: String,
    @SerializedName("device_id") val deviceId: String? = null
)
