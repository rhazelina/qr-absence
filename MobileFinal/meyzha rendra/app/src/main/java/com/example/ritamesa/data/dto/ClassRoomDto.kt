package com.example.ritamesa.data.dto

import com.google.gson.annotations.SerializedName

data class ClassRoomDto(
    @SerializedName("id") val id: Int?,
    @SerializedName("name") val name: String?,
    @SerializedName("label") val label: String?,
    @SerializedName("grade") val grade: String?,
    @SerializedName("major_id") val majorId: Int?,
    @SerializedName("major_name") val majorName: String?,
    @SerializedName("homeroom_teacher_id") val homeroomTeacherId: Int?,
    @SerializedName("homeroom_teacher_name") val homeroomTeacherName: String?
)
