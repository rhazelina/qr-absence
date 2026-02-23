package com.example.ritamesa.api.examples

import android.os.Bundle
import android.widget.Toast
import androidx.lifecycle.lifecycleScope
import com.example.ritamesa.BaseNetworkActivity
import com.example.ritamesa.api.Result
import kotlinx.coroutines.launch

/**
 * EXAMPLE: How to integrate API calls in Activities
 *
 * Follow these patterns when modifying existing activities to use API services.
 */
class ApiIntegrationExamples : BaseNetworkActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // All examples below show how to use the repositories
        // Uncomment and adapt to your needs
    }

    /**
     * ===== EXAMPLE 1: LOGIN =====
     * Replace the mock login in LoginLanjut with this
     */
    fun exampleLogin() {
        lifecycleScope.launch {
            val result = authRepository.login("email@example.com", "password")
            handleResult(
                result,
                onSuccess = { userProfile ->
                    showSuccess("Login successful! Welcome ${userProfile.name}")
                    // Navigate to dashboard
                },
                onError = { exception, message ->
                    showError(message ?: exception.message ?: "Login failed")
                }
            )
        }
    }

    /**
     * ===== EXAMPLE 2: GET TEACHERS LIST =====
     * Use this in DataRekapKehadiranGuru or similar list activities
     */
    fun exampleGetTeachers() {
        lifecycleScope.launch {
            val result = teacherRepository.getTeachers(search = null, page = 1)
            result.onSuccess { teachers ->
                // Update your RecyclerView adapter
                showSuccess("Loaded ${teachers.size} teachers")
                // adapter.updateData(teachers)
            }.onError { exception, message ->
                showError(message ?: "Failed to load teachers")
            }
        }
    }

    /**
     * ===== EXAMPLE 3: SCAN QR CODE ATTENDANCE =====
     * Use this in CameraQRActivity after scanning
     */
    fun exampleScanAttendance(qrToken: String, latitude: Double? = null, longitude: Double? = null) {
        lifecycleScope.launch {
            val result = attendanceRepository.scanAttendance(qrToken)
            result
                .onSuccess { attackdance ->
                    showSuccess("Attendance recorded: ${attackdance.status}")
                    // Continue with next step
                }
                .onError { exception, message ->
                    showError(message ?: "Failed to record attendance")
                }
        }
    }

    /**
     * ===== EXAMPLE 4: GET ATTENDANCE SUMMARY =====
     * Use this in Dashboard or RekapKehadiranSiswa
     */
    fun exampleGetAttendanceSummary() {
        lifecycleScope.launch {
            val result = attendanceRepository.getAttendanceSummary()
            result.onSuccess { summary ->
                // Update UI with summary data
                // tvHadir.text = summary.hadir.toString()
                // tvTerlambat.text = summary.terlambat.toString()
                // etc
                showSuccess("Attendance summary loaded")
            }
        }
    }

    /**
     * ===== EXAMPLE 5: GET DASHBOARD DATA =====
     * Use this in Dashboard activities
     */
    fun exampleGetDashboard() {
        lifecycleScope.launch {
            val result = dashboardRepository.getStudentDashboard()
            result.onSuccess { dashboard ->
                // Update dashboard UI with:
                // dashboard.schedules
                // dashboard.attendance_summary
                // dashboard.total_students
                // etc
            }
        }
    }

    /**
     * ===== EXAMPLE 6: RECORD MANUAL ATTENDANCE =====
     * Use this in manual attendance input screens
     */
    fun exampleRecordManualAttendance(studentId: Int, scheduleId: Int, status: String) {
        lifecycleScope.launch {
            val request = com.example.ritamesa.api.models.ManualAttendanceRequest(
                attendeeType = "student",
                scheduleId = scheduleId,
                status = status,
                date = "2024-01-01",
                studentId = studentId,
                reason = "Manual entry"
            )
            val result = attendanceRepository.recordManualAttendance(request)
            result.onSuccess {
                showSuccess("Attendance recorded")
            }
        }
    }

    /**
     * ===== EXAMPLE 7: RECORD MANUAL BULK ATTENDANCE =====
     * Use this for quick input of multiple students
     */
    fun exampleRecordBulkAttendance(scheduleId: Int) {
        lifecycleScope.launch {
            val attendances = listOf(
                com.example.ritamesa.api.models.BulkAttendanceItem("student", scheduleId, "present", "2024-01-01", 1, null, null),
                com.example.ritamesa.api.models.BulkAttendanceItem("student", scheduleId, "late", "2024-01-01", 2, null, "Traffic"),
                com.example.ritamesa.api.models.BulkAttendanceItem("student", scheduleId, "sick", "2024-01-01", 3, null, "Sakit flu"),
            )

            val result = attendanceRepository.recordBulkManualAttendance(attendances)
            result.onSuccess { recordedAttendances ->
                showSuccess("${recordedAttendances.size} attendances recorded")
            }
        }
    }

    /**
     * ===== EXAMPLE 8: GET STUDENTS LIST =====
     * Use this in student list activities
     */
    fun exampleGetStudents(classId: Int? = null) {
        lifecycleScope.launch {
            val result = studentRepository.getStudents(search = null, classId = classId, page = 1)
            result.onSuccess { students ->
                // Update RecyclerView with students list
                // adapter.updateData(students)
            }
        }
    }

    /**
     * ===== EXAMPLE 9: GET CLASS ATTENDANCE BY DATE =====
     * Use this in class attendance views
     */
    fun exampleGetClassAttendanceByDate(classId: Int, date: String) {
        lifecycleScope.launch {
            val result = attendanceRepository.getClassAttendanceByDate(classId, date)
            result.onSuccess { attendances ->
                // Update UI with attendance list for the class
            }
        }
    }

    /**
     * ===== EXAMPLE 10: CREATE LEAVE PERMISSION =====
     * Use this in leave permission forms
     */
    fun exampleCreateLeavePermission(studentId: Int, startTime: String, endTime: String) {
        lifecycleScope.launch {
            val request = com.example.ritamesa.api.models.CreateLeavePermissionRequest(
                studentId = studentId,
                type = "early_leave",
                reason = "Ijin untuk keperluan",
                startTime = startTime,
                endTime = endTime
            )

            val result = leavePermissionRepository.createLeavePermission(request)
            result.onSuccess { permission ->
                showSuccess("Leave permission created")
            }
        }
    }

    /**
     * ===== EXAMPLE 11: GENERATE QR CODE =====
     * Use this in teacher's schedule to generate QR for attendance
     */
    fun exampleGenerateQRCode(scheduleId: Int) {
        lifecycleScope.launch {
            val request = com.example.ritamesa.api.models.GenerateQRCodeRequest(
                scheduleId = scheduleId,
                expiresInMinutes = 30
            )

            val result = qrCodeRepository.generateQRCode(request)
            result.onSuccess { qrResponse ->
                // Display QR code image
                // imageView.setImageBitmap(qrResponse.qr_code)
                showSuccess("QR Code generated, expires at ${qrResponse.expiresAt}")
            }
        }
    }

    /**
     * ===== EXAMPLE 12: GET HOMEROOM DASHBOARD =====
     * Use this in homeroom teacher dashboard
     */
    fun exampleGetHomeroomDashboard() {
        lifecycleScope.launch {
            val result = dashboardRepository.getHomeroomDashboard()
            result.onSuccess { dashboard ->
                // Update UI with:
                // dashboard.class_info
                // dashboard.schedules
                // dashboard.class_attendance
                // dashboard.students_on_leave
            }
        }
    }

    /**
     * ===== EXAMPLE 13: GET WAKA DASHBOARD =====
     * Use this in vice principal dashboard
     */
    fun exampleGetWakaDashboard() {
        lifecycleScope.launch {
            val result = dashboardRepository.getWakaDashboard()
            result.onSuccess { dashboard ->
                // Update UI with:
                // dashboard.attendance_summary
                // dashboard.monthly_trend
                // dashboard.class_summaries
            }
        }
    }

    /**
     * ===== EXAMPLE 14: GET SCHEDULES =====
     * Use this in schedule list/calendar views
     */
    fun exampleGetSchedules(classId: Int? = null) {
        lifecycleScope.launch {
            val result = scheduleRepository.getSchedules(classId, page = 1)
            result.onSuccess { schedules ->
                // Update calendar or schedule list UI
            }
        }
    }

    /**
     * ===== PATTERN: Using Result wrapper =====
     * The Result wrapper provides multiple ways to handle responses
     */
    fun exampleResultPatterns() {
        lifecycleScope.launch {
            val result = teacherRepository.getTeachers()

            // Method 1: Using when
            when (result) {
                is Result.Success -> {
                    val data = result.data
                    showSuccess("${data.size} teachers loaded")
                }
                is Result.Error -> {
                    showError(result.message ?: result.exception.message ?: "Error")
                }
                is Result.Loading -> {
                    // Show loading
                }
            }

            // Method 2: Using fold (if implemented)
            // result.fold(
            //     onSuccess = { data ->
            //         showSuccess("${data.size} teachers loaded")
            //     },
            //     onError = { exception, message ->
            //         showError(message ?: exception.message ?: "Error")
            //     }
            // )

            // Method 3: Using onSuccess/onError
            result
                .onSuccess { data ->
                    showSuccess("${data.size} teachers loaded")
                }
                .onError { exception, message ->
                    showError(message ?: exception.message ?: "Error")
                }
        }
    }

    /**
     * ===== TIPS =====
     *
     * 1. Always use lifecycleScope.launch {} to run suspending functions
     * 2. Handle errors gracefully with showError()
     * 3. Update UI on success with showSuccess()
     * 4. Use the BaseNetworkActivity which provides all repositories
     * 5. Check the API response structure in api/models/ to know what data is returned
     * 6. Change base URL in AppPreferences.API_BASE_URL if needed (default: localhost:8000)
     * 7. Make sure API_BASE_URL matches your backend server address/port
     * 8. Add INTERNET permission in AndroidManifest.xml (already added)
     * 9. If behind corporate proxy, configure OkHttpClient in ApiClient
     * 10. For file uploads, convert files to base64 or MultipartBody
     */
}
