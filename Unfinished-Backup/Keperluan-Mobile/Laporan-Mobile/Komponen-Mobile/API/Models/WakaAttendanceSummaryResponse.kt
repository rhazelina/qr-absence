package com.example.ritamesa.api.models

import com.google.gson.annotations.SerializedName

/**
 * Response ASLI dari GET /api/waka/attendance/summary
 *
 * Backend (AttendanceController@wakaSummary) mengembalikan FLAT:
 * {
 *   "status_summary": [ {"status":"present","total":2938}, ... ],
 *   "class_summary":  { "6": {"present":2938, ...} },
 *   "student_summary":{ "26": {"present":74, ...} }
 * }
 */
data class WakaAttendanceSummaryResponse(
    @SerializedName("status_summary")
    val statusSummary: List<StatusSummaryItem> = emptyList(),

    @SerializedName("class_summary")
    val classSummary: Map<String, Map<String, Int>> = emptyMap(),

    @SerializedName("student_summary")
    val studentSummary: Map<String, Map<String, Int>> = emptyMap()
) {
    /**
     * Konversi ke AttendanceSummary standar agar UI tidak perlu berubah banyak.
     * Menjumlahkan semua record dari status_summary.
     */
    fun toAttendanceSummary(): AttendanceSummary {
        var present = 0
        var absent  = 0
        var late    = 0
        var sick    = 0
        var excused = 0

        statusSummary.forEach { item ->
            val n = item.total ?: 0
            when (item.status?.lowercase()) {
                "present"         -> present += n
                "absent"          -> absent  += n
                "late"            -> late    += n
                "sick"            -> sick    += n
                "excused", "izin" -> excused += n
            }
        }

        val total = present + absent + late + sick + excused
        val rate  = if (total > 0) ((present + late).toFloat() / total * 100f) else 0f

        return AttendanceSummary(
            totalStudents  = total,
            present        = present,
            absent         = absent,
            late           = late,
            sick           = sick,
            excused        = excused,
            attendanceRate = rate
        )
    }

    fun grandTotal(): Int = statusSummary.sumOf { it.total ?: 0 }

    fun totalForStatus(status: String): Int =
        statusSummary.filter { it.status?.lowercase() == status.lowercase() }
            .sumOf { it.total ?: 0 }
}

data class StatusSummaryItem(
    @SerializedName("status") val status: String?,
    @SerializedName("total")  val total: Int?
)




// V1
//package com.example.ritamesa.api.models
//
//import com.google.gson.annotations.SerializedName
//
///**
// * ═══════════════════════════════════════════════════════════════════
// * LETAKKAN DI: app/src/main/java/com/example/ritamesa/api/models/
// * ═══════════════════════════════════════════════════════════════════
// *
// * Response ASLI dari GET /api/waka/attendance/summary
// *
// * Backend (AttendanceController@wakaSummary) mengembalikan FLAT:
// * {
// *   "status_summary": [ {"status":"present","total":2938}, ... ],
// *   "class_summary":  { "6": {"present":2938, ...} },
// *   "student_summary":{ "26": {"present":74, ...} }
// * }
// *
// * BUKAN wrapped {"data":{...}} → gunakan handleApiCallFlat di repository.
// */
//data class WakaAttendanceSummaryResponse(
//    @SerializedName("status_summary")
//    val statusSummary: List<StatusSummaryItem> = emptyList(),
//
//    @SerializedName("class_summary")
//    val classSummary: Map<String, Map<String, Int>> = emptyMap(),
//
//    @SerializedName("student_summary")
//    val studentSummary: Map<String, Map<String, Int>> = emptyMap()
//) {
//    /**
//     * Konversi ke AttendanceSummary standar agar UI tidak perlu berubah banyak.
//     * Menjumlahkan semua record dari status_summary.
//     */
//    fun toAttendanceSummary(): AttendanceSummary {
//        var present = 0
//        var absent  = 0
//        var late    = 0
//        var sick    = 0
//        var excused = 0
//
//        statusSummary.forEach { item ->
//            val n = item.total ?: 0
//            when (item.status?.lowercase()) {
//                "present"         -> present += n
//                "absent"          -> absent  += n
//                "late"            -> late    += n
//                "sick"            -> sick    += n
//                "excused", "izin" -> excused += n
//            }
//        }
//
//        val total = present + absent + late + sick + excused
//        val rate  = if (total > 0) ((present + late).toFloat() / total * 100f) else 0f
//
//        return AttendanceSummary(
//            totalStudents  = total,
//            present        = present,
//            absent         = absent,
//            late           = late,
//            sick           = sick,
//            excused        = excused,
//            attendanceRate = rate
//        )
//    }
//
//    fun grandTotal(): Int = statusSummary.sumOf { it.total ?: 0 }
//
//    fun totalForStatus(status: String): Int =
//        statusSummary.filter { it.status?.lowercase() == status.lowercase() }
//            .sumOf { it.total ?: 0 }
//}
//
//data class StatusSummaryItem(
//    @SerializedName("status") val status: String?,
//    @SerializedName("total")  val total: Int?
//)