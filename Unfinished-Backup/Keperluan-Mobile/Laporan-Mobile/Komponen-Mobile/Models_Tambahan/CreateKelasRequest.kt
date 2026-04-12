package com.example.ritamesa.api.models

import com.google.gson.annotations.SerializedName

// Dipakai di UI/form admin untuk membuat/edit kelas.
// ClassPayload di ClassScheduleModels.kt adalah versi yang dikirim ke API.

data class CreateKelasRequest(
    val grade: String,                    // tingkat: "10" | "11" | "12"
    val label: String,                    // label: "1" | "2" | "3"
    @SerializedName("major_id")
    val majorId: Int,
    @SerializedName("homeroom_teacher_id")
    val homeroomTeacherId: Int? = null
)

data class UpdateKelasRequest(
    val grade: String? = null,
    val label: String? = null,
    @SerializedName("major_id")
    val majorId: Int? = null,
    @SerializedName("homeroom_teacher_id")
    val homeroomTeacherId: Int? = null
)

// Response dari API GET /classes
// Gunakan Classes (ClassScheduleModels.kt) untuk response standar.
data class KelasResponse(
    val id: Int?,
    val grade: String?,
    val label: String?,
    val name: String? = null,
    @SerializedName("major_id")
    val majorId: Int?,
    @SerializedName("homeroom_teacher_id")
    val homeroomTeacherId: Int? = null,
    val major: MajorInfo? = null,
    @SerializedName("homeroom_teacher")
    val homeroomTeacher: TeacherInfo? = null,
    @SerializedName("student_count")
    val studentCount: Int? = null,
    @SerializedName("created_at")
    val createdAt: String? = null
)