package com.example.ritamesa.api.models

import com.google.gson.annotations.SerializedName

/**
 * Response dari:
 *   GET /api/teachers/{teacher}/attendance-history
 *   GET /api/students/{student}/attendance
 *
 * Backend return FLAT: { "teacher":{...}, "history":[...] }
 * Tidak ada wrapper {"data":...} — gunakan handleApiCallFlat
 */
data class TeacherAttendanceHistoryResponse(
    @SerializedName("teacher") val teacher: TeacherHistoryProfile? = null,
    @SerializedName("student") val student: Any? = null,          // student endpoint juga pakai struktur ini
    @SerializedName("history") val history: List<TeacherHistoryItem> = emptyList()
)

data class TeacherHistoryProfile(
    @SerializedName("id")   val id: Int?,
    @SerializedName("nip")  val nip: String?,
    @SerializedName("user") val user: TeacherHistoryUser?
)

data class TeacherHistoryUser(
    @SerializedName("id")   val id: Int?,
    @SerializedName("name") val name: String?
)

/**
 * Satu record kehadiran (guru maupun siswa).
 *
 * PENTING — Backend Eloquent menyimpan waktu check-in di kolom "checked_in_at"
 * (bukan "check_in_time"). Kedua alias diterima agar tidak crash saat API berubah.
 */
data class TeacherHistoryItem(
    @SerializedName("id")             val id: Int,
    @SerializedName("date")           val date: String?,
    @SerializedName("status")         val status: String?,
    @SerializedName("reason")         val reason: String?,

    // FIX: Backend kolom asli = "checked_in_at", bukan "check_in_time"
    // Terima keduanya agar tidak null di semua kondisi
    @SerializedName("checked_in_at")  val checkedInAt: String?,
    @SerializedName("check_in_time")  val checkInTime: String?,

    @SerializedName("attendee_type")  val attendeeType: String?,
    @SerializedName("schedule")       val schedule: TeacherHistorySchedule?
) {
    /** Helper: ambil waktu check-in dari field mana saja yang tersedia */
    fun resolvedCheckIn(): String? = checkedInAt ?: checkInTime
}

data class TeacherHistorySchedule(
    @SerializedName("id")             val id: Int?,
    @SerializedName("start_time")     val startTime: String?,
    @SerializedName("end_time")       val endTime: String?,
    @SerializedName("subject")        val subject: TeacherHistorySubject?,
    @SerializedName("daily_schedule") val dailySchedule: TeacherHistoryDailySchedule?
)

data class TeacherHistorySubject(
    @SerializedName("id")   val id: Int?,
    @SerializedName("name") val name: String?,
    @SerializedName("code") val code: String? = null
)

data class TeacherHistoryDailySchedule(
    @SerializedName("id")             val id: Int?,
    @SerializedName("day")            val day: String?,
    @SerializedName("class_schedule") val classSchedule: TeacherHistoryClassSchedule?
)

data class TeacherHistoryClassSchedule(
    @SerializedName("class") val classData: TeacherHistoryClass?
)

data class TeacherHistoryClass(
    @SerializedName("id")   val id: Int?,
    @SerializedName("name") val name: String?
)