package com.example.ritamesa.data.dto

import com.google.gson.annotations.SerializedName

data class TeacherDto(
    @SerializedName("id") val id: String?,
    @SerializedName("name") val name: String?,
    @SerializedName("nip") val nip: String?,
    @SerializedName("code") val code: String?,
    @SerializedName("subject") val subject: String?,
    @SerializedName("subject_name") val subjectName: String?,
    @SerializedName("role") val role: String?,
    @SerializedName("waka_field") val wakaField: String?,
    @SerializedName("major_expertise") val majorExpertise: String?,
    @SerializedName("email") val email: String?,
    @SerializedName("phone") val phone: String?,
    @SerializedName("photo_url") val photoUrl: String?,
    @SerializedName("classes_count") val classesCount: Int?,
    @SerializedName("homeroom_class_id") val homeroomClassId: Int?
)
