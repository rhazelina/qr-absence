package com.example.ritamesa.data.dto

import com.google.gson.annotations.SerializedName

data class SubjectDto(
    @SerializedName("id") val id: Int?,
    @SerializedName("code") val code: String?,
    @SerializedName("name") val name: String?,
    @SerializedName("description") val description: String?
)
