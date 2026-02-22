package com.example.ritamesa.data.dto

import com.google.gson.annotations.SerializedName

data class StudentDto(
    @SerializedName("id") val id: String?,
    @SerializedName("name") val name: String?,
    @SerializedName("nisn") val nisn: String?,
    @SerializedName("nis") val nis: String?,
    @SerializedName("email") val email: String?,
    @SerializedName("major") val major: String?,
    @SerializedName("major_name") val majorName: String?,
    @SerializedName("class_id") val classId: String?,
    @SerializedName("class_name") val className: String?,
    @SerializedName("grade") val grade: String?,
    @SerializedName("gender") val gender: String?,
    @SerializedName("phone") val phone: String?,
    @SerializedName("address") val address: String?,
    @SerializedName("photo_url") val photoUrl: String?
)
