//package com.example.ritamesa.api.models

// CommonModels.kt
// StudentInfo, ClassInfo, TeacherInfo, MajorInfo sudah didefinisikan di AttendanceModels.kt
// File ini sengaja dikosongkan untuk menghindari Redeclaration error.
// Jangan tambahkan class yang sudah ada di AttendanceModels.kt di sini.

// meyzha-rendra/app/src/main/java/com/example/ritamesa/api/models/CommonModels.kt
package com.example.ritamesa.api.models

import com.google.gson.annotations.SerializedName

data class LeavePermissionMutationResponse(
    val message: String? = null,
    @SerializedName("permission")
    val permission: StudentLeavePermission? = null
)

data class AbsenceRequestMutationResponse(
    val message: String? = null,
    @SerializedName("request")
    val request: AbsenceRequest? = null
)

data class SettingsIndexResponse(
    val status: String? = null,
    val data: Map<String, String>? = null
)

data class SettingsMutationResponse(
    val status: String? = null,
    val message: String? = null,
    val data: Map<String, String>? = null
)

data class SyncSettingsEnvelope(
    @SerializedName("school_year")
    val schoolYear: SchoolYear? = null,
    val semester: Semester? = null,
    val settings: Map<String, String>? = null
)

data class ScheduleStudentsResponse(
    @SerializedName("schedule_id")
    val scheduleId: Int? = null,
    @SerializedName("class_id")
    val classId: Int? = null,
    @SerializedName("class_name")
    val className: String? = null,
    val date: String? = null,
    val data: List<StudentResource>? = null,
    @SerializedName("eligible_students")
    val eligibleStudents: List<StudentResource>? = null
) {
    fun resolvedStudents(): List<StudentResource> = data ?: eligibleStudents ?: emptyList()
}