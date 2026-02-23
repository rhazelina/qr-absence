package com.example.ritamesa.api.repositories

import android.content.Context
import com.example.ritamesa.api.Result
import com.example.ritamesa.api.models.*
import com.example.ritamesa.api.services.ApiService
import com.google.common.truth.Truth.assertThat
import kotlinx.coroutines.runBlocking
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.ResponseBody.Companion.toResponseBody
import org.junit.Before
import org.junit.Test
import org.mockito.Mockito.*
import retrofit2.Response

/**
 * Unit tests for AttendanceRepository
 * Tests attendance operations: scanning QR codes, manual recording, and retrieval
 * Based on API documentation: POST /attendance/scan, POST /attendance/manual, GET /attendance/{id}, etc.
 */
class AttendanceRepositoryTest {

    private lateinit var mockContext: Context
    private lateinit var mockApiService: ApiService

    private lateinit var attendanceRepository: AttendanceRepository

    @Before
    fun setup() {
        mockContext = mock(Context::class.java)
        mockApiService = mock(ApiService::class.java)
        attendanceRepository = AttendanceRepository(mockContext, mockApiService)
    }

    private fun createMockAttendanceData(id: Int = 1, status: String = "present"): AttendanceData {
        return AttendanceData(
            id = id,
            attendeeName = "Student $id",
            status = status,
            scannedAt = "2026-02-20T08:00:00Z",
            schedule = ScheduleInfo(
                id = 1,
                subjectName = "Matematika",
                className = "X-1",
                date = "2026-02-20"
            ),
            reason = null
        )
    }

    // ===== QR CODE SCANNING TESTS =====

    @Test
    fun testScanAttendanceSuccess(): Unit = runBlocking {
        // Arrange
        val qrToken = "qr_token_12345"
        val attendanceData = createMockAttendanceData()
        val apiResponse = ApiResponse(data = attendanceData)
        val mockResponse = Response.success(apiResponse)
        `when`(mockApiService.scanAttendance(ScanAttendanceRequest(token = qrToken))).thenReturn(mockResponse)

        // Act
        val result = attendanceRepository.scanAttendance(qrToken)

        // Assert
        assertThat(result).isInstanceOf(Result.Success::class.java)
        val successResult = result as Result.Success
        assertThat(successResult.data.status).isEqualTo("present")
        verify(mockApiService).scanAttendance(ScanAttendanceRequest(token = qrToken))
    }

    @Test
    fun testScanAttendanceExpiredQR(): Unit = runBlocking {
        // Arrange
        val qrToken = "expired_qr"
        val errorJson = "{\"message\":\"QR tidak aktif atau sudah kadaluarsa\"}"
        val errorBody = errorJson.toResponseBody("application/json".toMediaType())
        val mockResponse = Response.error<ApiResponse<AttendanceData>>(400, errorBody)
        `when`(mockApiService.scanAttendance(ScanAttendanceRequest(token = qrToken))).thenReturn(mockResponse)

        // Act
        val result = attendanceRepository.scanAttendance(qrToken)

        // Assert
        assertThat(result).isInstanceOf(Result.Error::class.java)
    }

    @Test
    fun testScanAttendanceNetworkError(): Unit = runBlocking {
        // Arrange
        `when`(mockApiService.scanAttendance(ScanAttendanceRequest(token = "qr_token"))).thenThrow(RuntimeException("Network timeout"))

        // Act
        val result = attendanceRepository.scanAttendance("qr_token")

        // Assert
        assertThat(result).isInstanceOf(Result.Error::class.java)
        val errorResult = result as Result.Error
        assertThat(errorResult.message).contains("Network timeout")
    }

    @Test
    fun testScanStudentAttendanceSuccess(): Unit = runBlocking {
        // Arrange
        val qrToken = "qr_token_student"
        val attendanceData = createMockAttendanceData(status = "present")
        val apiResponse = ApiResponse(data = attendanceData)
        val mockResponse = Response.success(apiResponse)
        `when`(mockApiService.scanStudentAttendance(ScanAttendanceRequest(token = qrToken))).thenReturn(mockResponse)

        // Act
        val result = attendanceRepository.scanStudentAttendance(qrToken)

        // Assert
        assertThat(result).isInstanceOf(Result.Success::class.java)
        assertThat((result as Result.Success).data.status).isEqualTo("present")
    }

    // ===== MANUAL ATTENDANCE RECORDING TESTS =====

    @Test
    fun testRecordManualAttendanceSuccess(): Unit = runBlocking {
        // Arrange
        val request = ManualAttendanceRequest(
            attendeeType = "student",
            scheduleId = 1,
            date = "2026-02-20",
            status = "present",
            studentId = 100,
            reason = "On time"
        )
        val attendanceData = createMockAttendanceData()
        val apiResponse = ApiResponse(data = attendanceData)
        val mockResponse = Response.success(apiResponse)
        `when`(mockApiService.recordManualAttendance(request)).thenReturn(mockResponse)

        // Act
        val result = attendanceRepository.recordManualAttendance(request)

        // Assert
        assertThat(result).isInstanceOf(Result.Success::class.java)
        verify(mockApiService).recordManualAttendance(request)
    }

    @Test
    fun testRecordManualAttendanceSickStatus(): Unit = runBlocking {
        // Arrange
        val request = ManualAttendanceRequest(
            attendeeType = "student",
            scheduleId = 1,
            date = "2026-02-20",
            status = "sick",
            studentId = 100,
            reason = "Demam tinggi"
        )
        val attendanceData = createMockAttendanceData(status = "sick")
        val apiResponse = ApiResponse(data = attendanceData)
        `when`(mockApiService.recordManualAttendance(request)).thenReturn(Response.success(apiResponse))

        // Act
        val result = attendanceRepository.recordManualAttendance(request)

        // Assert
        assertThat(result).isInstanceOf(Result.Success::class.java)
        assertThat((result as Result.Success).data.status).isEqualTo("sick")
    }

    @Test
    fun testRecordManualAttendanceAbsenceStatus(): Unit = runBlocking {
        // Arrange
        val request = ManualAttendanceRequest(
            attendeeType = "student",
            scheduleId = 1,
            date = "2026-02-20",
            status = "absent",
            studentId = 100,
            reason = null
        )
        val attendanceData = createMockAttendanceData(status = "absent")
        val apiResponse = ApiResponse(data = attendanceData)
        `when`(mockApiService.recordManualAttendance(request)).thenReturn(Response.success(apiResponse))

        // Act
        val result = attendanceRepository.recordManualAttendance(request)

        // Assert
        assertThat(result).isInstanceOf(Result.Success::class.java)
    }

    @Test
    fun testRecordBulkManualAttendanceSuccess(): Unit = runBlocking {
        // Arrange
        val records = listOf(
            BulkAttendanceItem(
                attendeeType = "student",
                scheduleId = 1,
                status = "present",
                date = "2026-02-20",
                studentId = 1
            ),
            BulkAttendanceItem(
                attendeeType = "student",
                scheduleId = 1,
                status = "absent",
                date = "2026-02-20",
                studentId = 2
            )
        )
        val attendanceDataList = listOf(
            createMockAttendanceData(id = 1),
            createMockAttendanceData(id = 2, status = "absent")
        )
        val apiResponse = ApiResponse(data = attendanceDataList)
        `when`(mockApiService.recordBulkManualAttendance(BulkManualAttendanceRequest(records))).thenReturn(Response.success(apiResponse))

        // Act
        val result = attendanceRepository.recordBulkManualAttendance(records)

        // Assert
        assertThat(result).isInstanceOf(Result.Success::class.java)
        val successResult = result as Result.Success
        assertThat(successResult.data).hasSize(2)
    }

    // ===== GET ATTENDANCE RECORDS TESTS =====

    @Test
    fun testGetAttendanceByScheduleSuccess(): Unit = runBlocking {
        // Arrange
        val scheduleId = 1
        val attendanceList = listOf(
            AttendanceResource(
                id = 1,
                student = null,
                schedule = null,
                status = "present",
                timestamp = "2026-02-20T08:00:00Z",
                reason = null
            ),
            AttendanceResource(
                id = 2,
                student = null,
                schedule = null,
                status = "absent",
                timestamp = null,
                reason = null
            )
        )
        val apiResponse = ApiResponse(data = attendanceList)
        `when`(mockApiService.getAttendanceBySchedule(scheduleId)).thenReturn(Response.success(apiResponse))

        // Act
        val result = attendanceRepository.getAttendanceBySchedule(scheduleId)

        // Assert
        assertThat(result).isInstanceOf(Result.Success::class.java)
        val successResult = result as Result.Success
        assertThat(successResult.data).hasSize(2)
        assertThat(successResult.data[0].status).isEqualTo("present")
        assertThat(successResult.data[1].status).isEqualTo("absent")
    }

    @Test
    fun testGetStudentAbsencesSuccess(): Unit = runBlocking {
        // Arrange
        val studentId = 100
        val startDate = "2026-02-01"
        val endDate = "2026-02-28"
        val absenceList = listOf(
            AttendanceResource(
                id = 1,
                student = null,
                schedule = null,
                status = "absent",
                timestamp = null,
                reason = null
            ),
            AttendanceResource(
                id = 2,
                student = null,
                schedule = null,
                status = "sick",
                timestamp = "2026-02-20T08:00:00Z",
                reason = null
            )
        )
        val apiResponse = PaginatedResponse(data = absenceList)
        `when`(mockApiService.getStudentAbsences(studentId, startDate, endDate))
            .thenReturn(Response.success(apiResponse))

        // Act
        val result = attendanceRepository.getStudentAbsences(studentId, startDate, endDate)

        // Assert
        assertThat(result).isInstanceOf(Result.Success::class.java)
        val successResult = result as Result.Success
        assertThat(successResult.data).hasSize(2)
    }

    @Test
    fun testGetMyAttendanceSuccess(): Unit = runBlocking {
        // Arrange
        val startDate = "2026-02-01"
        val endDate = "2026-02-28"
        val attendanceList = listOf(
            AttendanceResource(id = 1, student = null, schedule = null, status = "present", timestamp = null, reason = null),
            AttendanceResource(id = 2, student = null, schedule = null, status = "late", timestamp = null, reason = null),
            AttendanceResource(id = 3, student = null, schedule = null, status = "present", timestamp = null, reason = null)
        )
        `when`(mockApiService.getMyAttendance(startDate, endDate))
            .thenReturn(Response.success(PaginatedResponse(data = attendanceList)))

        // Act
        val result = attendanceRepository.getMyAttendance(startDate, endDate)

        // Assert
        assertThat(result).isInstanceOf(Result.Success::class.java)
        val successResult = result as Result.Success
        assertThat(successResult.data).hasSize(3)
    }

    @Test
    fun testGetDailyTeacherAttendanceSuccess(): Unit = runBlocking {
        // Arrange
        val date = "2026-02-20"
        val dailyAttendanceList = listOf(
            DailyAttendanceData(
                date = date,
                teacherId = 1,
                teacherName = "Teacher One",
                nip = "1234567890",
                status = "present",
                timestamp = "07:30"
            ),
            DailyAttendanceData(
                date = date,
                teacherId = 2,
                teacherName = "Teacher Two",
                nip = "0987654321",
                status = "late",
                timestamp = "08:15"
            )
        )
        `when`(mockApiService.getDailyTeacherAttendance(date))
            .thenReturn(Response.success(PaginatedResponse(data = dailyAttendanceList)))

        // Act
        val result = attendanceRepository.getDailyTeacherAttendance(date)

        // Assert
        assertThat(result).isInstanceOf(Result.Success::class.java)
        val successResult = result as Result.Success
        assertThat(successResult.data).hasSize(2)
        assertThat(successResult.data[0].teacherName).isEqualTo("Teacher One")
    }

    @Test
    fun testGetClassAttendanceByDateSuccess(): Unit = runBlocking {
        // Arrange
        val classId = 1
        val date = "2026-02-20"
        val attendanceList = listOf(
            AttendanceResource(id = 1, student = null, schedule = null, status = "present", timestamp = null, reason = null),
            AttendanceResource(id = 2, student = null, schedule = null, status = "absent", timestamp = null, reason = null),
            AttendanceResource(id = 3, student = null, schedule = null, status = "present", timestamp = null, reason = null)
        )
        `when`(mockApiService.getClassAttendanceByDate(classId, date))
            .thenReturn(Response.success(PaginatedResponse(data = attendanceList)))

        // Act
        val result = attendanceRepository.getClassAttendanceByDate(classId, date)

        // Assert
        assertThat(result).isInstanceOf(Result.Success::class.java)
        val successResult = result as Result.Success
        assertThat(successResult.data).hasSize(3)
        val presentCount = successResult.data.count { it.status == "present" }
        assertThat(presentCount).isEqualTo(2)
    }

    // ===== SUMMARY TESTS =====

    @Test
    fun testGetAttendanceSummarySuccess(): Unit = runBlocking {
        // Arrange
        val startDate = "2026-02-01"
        val endDate = "2026-02-28"
        val summary = AttendanceSummary(
            totalStudents = 1000,
            present = 850,
            absent = 100,
            late = 50,
            attendanceRate = 85.0f
        )
        `when`(mockApiService.getAttendanceSummary(startDate, endDate))
            .thenReturn(Response.success(ApiResponse(data = summary)))

        // Act
        val result = attendanceRepository.getAttendanceSummary(startDate, endDate)

        // Assert
        assertThat(result).isInstanceOf(Result.Success::class.java)
        val successResult = result as Result.Success
        assertThat(successResult.data.present).isEqualTo(850)
        assertThat(successResult.data.attendanceRate).isWithin(0.1f).of(85.0f)
    }

    @Test
    fun testGetMyAttendanceSummarySuccess(): Unit = runBlocking {
        // Arrange
        val startDate = "2026-02-01"
        val endDate = "2026-02-28"
        val summary = AttendanceSummary(
            totalStudents = 20,
            present = 18,
            absent = 2,
            late = 0,
            attendanceRate = 90.0f
        )
        `when`(mockApiService.getMyAttendanceSummary(startDate, endDate))
            .thenReturn(Response.success(ApiResponse(data = summary)))

        // Act
        val result = attendanceRepository.getMyAttendanceSummary(startDate, endDate)

        // Assert
        assertThat(result).isInstanceOf(Result.Success::class.java)
        val successResult = result as Result.Success
        assertThat(successResult.data.present).isEqualTo(18)
    }

    // ===== ERROR HANDLING TESTS =====

    @Test
    fun testGetAttendanceByScheduleEmptyResult(): Unit = runBlocking {
        // Arrange
        val emptyList = emptyList<AttendanceResource>()
        `when`(mockApiService.getAttendanceBySchedule(1))
            .thenReturn(Response.success(ApiResponse(data = emptyList)))

        // Act
        val result = attendanceRepository.getAttendanceBySchedule(1)

        // Assert
        assertThat(result).isInstanceOf(Result.Success::class.java)
        val successResult = result as Result.Success
        assertThat(successResult.data).isEmpty()
    }

    @Test
    fun testRecordManualAttendanceInvalidStatus(): Unit = runBlocking {
        // Arrange - Invalid status should be caught by API
        val request = ManualAttendanceRequest(
            attendeeType = "student",
            scheduleId = 1,
            date = "2026-02-20",
            status = "invalid_status",
            studentId = 100,
            reason = null
        )
        val errorJson = "{\"message\":\"Invalid attendance status\"}"
        val errorBody = errorJson.toResponseBody("application/json".toMediaType())
        `when`(mockApiService.recordManualAttendance(request))
            .thenReturn(Response.error<ApiResponse<AttendanceData>>(400, errorBody))

        // Act
        val result = attendanceRepository.recordManualAttendance(request)

        // Assert
        assertThat(result).isInstanceOf(Result.Error::class.java)
    }
}
