package com.example.ritamesa.data.dto

import com.google.gson.annotations.SerializedName

data class UserDto(
    @SerializedName("id") val id: Int?,
    @SerializedName("name") val name: String?,
    @SerializedName("email") val email: String?,
    @SerializedName("username") val username: String?,
    @SerializedName("role") val role: String?,
    @SerializedName("class_officer") val classOfficer: Boolean?
)
