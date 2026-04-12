
package com.example.ritamesa.api.models

/**
 * Typed UI model for follow-up screen.
 * This keeps adapter/fragment logic simple and avoids raw Map<String, Any> usage.
 */
data class StudentFollowUpUiModel(
    val studentId: Int,
    val studentName: String,
    val classLabel: String,
    val alphaCount: Int,
    val izinCount: Int,
    val sakitCount: Int,
    val totalIssue: Int,
    val severityScore: Int,
    val riskLevel: FollowUpRiskLevel,
    val riskLabel: String,
    val isProblematic: Boolean
)

enum class FollowUpRiskLevel {
    SAFE,
    WARNING,
    DANGER
}

/**
 * Thresholds agreed in implementation plan:
 * - DANGER  : alpha >= 3 OR totalIssue >= 6 OR severity >= 8
 * - WARNING : alpha >= 1 OR totalIssue >= 3 OR severity >= 4
 * - SAFE    : else
 */
object StudentFollowUpThresholds {
    const val WARNING_MIN_ALPHA = 1
    const val WARNING_MIN_TOTAL_ISSUE = 3
    const val WARNING_MIN_SEVERITY = 4

    const val DANGER_MIN_ALPHA = 3
    const val DANGER_MIN_TOTAL_ISSUE = 6
    const val DANGER_MIN_SEVERITY = 8
}

fun StudentFollowUp.toUiModel(): StudentFollowUpUiModel {
    val resolvedStudentId = studentId ?: id ?: 0
    val resolvedName = resolvedName().ifBlank { "-" }
    val resolvedClassLabel = when {
        !className.isNullOrBlank() -> className
        !majorName.isNullOrBlank() -> majorName
        !nis.isNullOrBlank() -> nis
        !nisn.isNullOrBlank() -> nisn
        else -> "-"
    }

    val alpha = resolvedAbsent().coerceAtLeast(0)
    val izin = resolvedExcused().coerceAtLeast(0)
    val sakit = resolvedSick().coerceAtLeast(0)
    val totalIssue = alpha + izin + sakit
    val severityScore = (alpha * 3) + (izin * 2) + (sakit * 1)

    val riskLevel = when {
        alpha >= StudentFollowUpThresholds.DANGER_MIN_ALPHA ||
                totalIssue >= StudentFollowUpThresholds.DANGER_MIN_TOTAL_ISSUE ||
                severityScore >= StudentFollowUpThresholds.DANGER_MIN_SEVERITY -> FollowUpRiskLevel.DANGER

        alpha >= StudentFollowUpThresholds.WARNING_MIN_ALPHA ||
                totalIssue >= StudentFollowUpThresholds.WARNING_MIN_TOTAL_ISSUE ||
                severityScore >= StudentFollowUpThresholds.WARNING_MIN_SEVERITY -> FollowUpRiskLevel.WARNING

        else -> FollowUpRiskLevel.SAFE
    }

    val riskLabel = when (riskLevel) {
        FollowUpRiskLevel.DANGER -> "Sering Absensi"
        FollowUpRiskLevel.WARNING -> "Perlu Diperhatikan"
        FollowUpRiskLevel.SAFE -> "Aman"
    }

    return StudentFollowUpUiModel(
        studentId = resolvedStudentId,
        studentName = resolvedName,
        classLabel = resolvedClassLabel,
        alphaCount = alpha,
        izinCount = izin,
        sakitCount = sakit,
        totalIssue = totalIssue,
        severityScore = severityScore,
        riskLevel = riskLevel,
        riskLabel = riskLabel,
        isProblematic = riskLevel != FollowUpRiskLevel.SAFE
    )
}
