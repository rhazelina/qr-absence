package com.example.ritamesa.api.models

import com.google.gson.annotations.SerializedName

/**
 * Model untuk respons dari:
 * GET /api/classes/{class}/attendance
 */
data class ClassAttendanceResponse(
    @SerializedName("class")
    val `class`: Classes? = null,
    @SerializedName("date")
    val date: String? = null,
    @SerializedName("day")
    val day: String? = null,
    @SerializedName("items")
    val items: List<ClassAttendanceItem> = emptyList()
)

data class ClassAttendanceItem(
    @SerializedName("schedule")
    val schedule: Schedule? = null,
    @SerializedName("attendances")
    val attendances: List<AttendanceResource> = emptyList()
)

/**
 * Model untuk respons dari:
 * GET /api/waka/attendance/teachers/daily
 */
data class DailyTeacherAttendanceResponse(
    @SerializedName("date")
    val date: String? = null,
    @SerializedName("items")
    val items: PaginatedResponse<DailyTeacherAttendanceItem>? = null
)

data class DailyTeacherAttendanceItem(
    @SerializedName("teacher")
    val teacher: TeacherResource? = null,
    @SerializedName("attendances")
    val attendances: List<AttendanceResource> = emptyList(),
    @SerializedName("status")
    val status: String? = null,
    @SerializedName("slots")
    val slots: List<String?> = emptyList()
)

/**
 * Model untuk item di PaginatedResponse dari:
 * GET /api/students/absences
 */
data class StudentAbsenceResponseItem(
    @SerializedName("student")
    val student: StudentResource? = null,
    @SerializedName("items")
    val items: List<AttendanceResource> = emptyList(),
    @SerializedName("total_absences")
    val totalAbsences: Int? = 0
)



// REFIXED
//import com.example.ritamesa.api.models.StatusSummaryItem
//import com.google.gson.annotations.SerializedName
//
//data class WakaAttendanceSummaryResponse(
//    @SerializedName("status_summary")
//    val statusSummary: List<StatusSummaryItem> = emptyList(),
//
//    @SerializedName("class_summary")
//    val classSummary: Map<String, Map<String, Int>> = emptyMap(),
//
//    @SerializedName("student_summary")
//    val studentSummary: Map<String, Map<String, Int>> = emptyMap()
//)
//
////  V1
////package com.example.ritamesa.api.models
////
////import com.google.gson.annotations.SerializedName
////
/////**
//// * Model untuk respons dari:
//// * GET /api/classes/{class}/attendance
//// */
////data class ClassAttendanceResponse(
////    val `class`: Classes?,
////    val date: String?,
////    val day: String?,
////    val items: List<ClassAttendanceItem> = emptyList()
////)
////
////data class ClassAttendanceItem(
////    val schedule: Schedule?,
////    val attendances: List<AttendanceResource> = emptyList()
////)
////
/////**
//// * Model untuk respons dari:
//// * GET /api/waka/attendance/teachers/daily
//// */
////data class DailyTeacherAttendanceResponse(
////    val date: String?,
////    val items: PaginatedResponse<DailyTeacherAttendanceItem>
////)
////
////data class DailyTeacherAttendanceItem(
////    val teacher: TeacherResource?,
////    val attendances: List<AttendanceResource> = emptyList(),
////    val status: String?,
////    val slots: List<String?> = emptyList()
////)
////
/////**
//// * Model untuk item di PaginatedResponse dari:
//// * GET /api/students/absences
//// */
////data class StudentAbsenceResponseItem(
////    val student: StudentResource?,
////    val items: List<AttendanceResource> = emptyList(),
////    @SerializedName("total_absences")
////    val totalAbsences: Int? = 0
////)
////
/////**
//// * Model untuk respons dari:
//// * GET /api/waka/attendance/summary
//// */
////data class WakaAttendanceSummaryResponse(
////    @SerializedName("status_summary")
////    val statusSummary: List<StatusCountItem> = emptyList(),
////    @SerializedName("class_summary")
////    val classSummary: Map<String, Map<String, Int>> = emptyMap(),
////    @SerializedName("student_summary")
////    val studentSummary: Map<String, Map<String, Int>> = emptyMap()
////)
////
////data class StatusCountItem(
////    val status: String?,
////    val total: Int?
////)
