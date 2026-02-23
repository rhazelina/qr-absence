package com.example.ritamesa

import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.example.ritamesa.api.Result
import com.example.ritamesa.api.repositories.*

open class BaseNetworkActivity : AppCompatActivity() {

    // Lazy initialize repositories
    internal val authRepository: AuthRepository by lazy { AuthRepository(this) }
    internal val attendanceRepository: AttendanceRepository by lazy { AttendanceRepository(this) }
    internal val teacherRepository: TeacherRepository by lazy { TeacherRepository(this) }
    internal val studentRepository: StudentRepository by lazy { StudentRepository(this) }
    internal val classRepository: ClassRepository by lazy { ClassRepository(this) }
    internal val scheduleRepository: ScheduleRepository by lazy { ScheduleRepository(this) }
    internal val leavePermissionRepository: LeavePermissionRepository by lazy { LeavePermissionRepository(this) }
    internal val qrCodeRepository: QRCodeRepository by lazy { QRCodeRepository(this) }
    internal val absenceRequestRepository: AbsenceRequestRepository by lazy { AbsenceRequestRepository(this) }
    internal val dashboardRepository: DashboardRepository by lazy { DashboardRepository(this) }
    internal val settingsRepository: SettingsRepository by lazy { SettingsRepository(this) }
    internal val administrationRepository: AdministrationRepository by lazy { AdministrationRepository(this) }

    internal fun <T> handleResult(
        result: Result<T>,
        onSuccess: (T) -> Unit,
        onError: ((Exception, String?) -> Unit)? = null
    ) {
        when (result) {
            is Result.Success -> onSuccess(result.data)
            is Result.Error -> {
                val message = result.message ?: result.exception.message ?: "Unknown error"
                Toast.makeText(this, message, Toast.LENGTH_LONG).show()
                onError?.invoke(result.exception, result.message)
            }
            is Result.Loading -> {
                // Show loading indicator if needed
            }
        }
    }

    internal fun showToast(message: String, duration: Int = Toast.LENGTH_SHORT) {
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show()
    }

    internal fun showError(message: String) {
        Toast.makeText(this, "Error: $message", Toast.LENGTH_LONG).show()
    }

    internal fun showSuccess(message: String) {
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show()
    }
}
