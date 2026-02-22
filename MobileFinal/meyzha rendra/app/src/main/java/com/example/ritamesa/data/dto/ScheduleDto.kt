package com.example.ritamesa.data.dto

import com.google.gson.annotations.SerializedName

data class ScheduleDto(
    @SerializedName("id") val id: Int?,
    @SerializedName("subject_name") val subjectName: String?,
    @SerializedName("teacher_name") val teacherName: String?,
    @SerializedName("start_time") val startTime: String?,
    @SerializedName("end_time") val endTime: String?,
    @SerializedName("attendance") val attendance: AttendanceDto?
)

data class AttendanceDto(
    @SerializedName("status") val status: String?,
    @SerializedName("excuse_reason") val excuseReason: String?
)
