package com.example.ritamesa.data.dto

import com.google.gson.annotations.SerializedName

data class ScanRequest(
    @SerializedName("qr_token") val qrToken: String
)
