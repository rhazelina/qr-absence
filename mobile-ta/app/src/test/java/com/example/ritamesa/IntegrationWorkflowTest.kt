package com.example.ritamesa

import android.content.Context
import com.example.ritamesa.api.Result
import com.example.ritamesa.api.models.*
import com.example.ritamesa.api.repositories.AttendanceRepository
import com.example.ritamesa.api.repositories.AuthRepository
import com.example.ritamesa.api.repositories.StudentRepository
import com.example.ritamesa.api.services.ApiService
import com.google.common.truth.Truth.assertThat
import kotlinx.coroutines.runBlocking
import org.junit.Before
import org.junit.Test
import org.mockito.Mockito.*
import retrofit2.Response

/**
 * Integration tests for complete user workflows
 * Tests how multiple repositories and API calls work together
 * 
 * Scenarios covered:
 * 1. Student Login -> View Dashboard -> Check Attendance
 * 2. Teacher Login -> View Class -> Record Attendance
 * 3. Admin Login -> Manage Students -> View Statistics
 * 4. QR Code Scanning Flow
 * 5. Manual Attendance Recording Flow
 */
class IntegrationWorkflowTest {

    private lateinit var mockContext: Context
    private lateinit var mockApiService: ApiService

    private lateinit var authRepository: AuthRepository
    private lateinit var attendanceRepository: AttendanceRepository
    private lateinit var studentRepository: StudentRepository
    private lateinit var mockAppPreferences: AppPreferences

    @Before
    fun setup() {
        mockContext = mock(Context::class.java)
        mockApiService = mock(ApiService::class.java)
        mockAppPreferences = mock(AppPreferences::class.java)
        authRepository = AuthRepository(mockContext, mockApiService, mockAppPreferences, persistAuth = false)
        attendanceRepository = AttendanceRepository(mockContext, mockApiService)
        studentRepository = StudentRepository(mockContext, mockApiService)
    }

    // ===== WORKFLOW 1: STUDENT LOGIN -> VIEW DASHBOARD -> CHECK ATTENDANCE =====

    @Test
    fun testStudentLoginAndViewDashboardFlow(): Unit = runBlocking {
        // Step 1: Student login
        val username = "student001"
        val password = "password123"
        
        val studentProfile = UserProfile(
            id = 1,
            name = "John Doe",
            username = username,
            email = "john@example.com",
            userType = "student",
            createdAt = "2026-01-01T00:00:00Z",
            studentProfile = StudentProfile(1, "1234567890", "123", 1, "2008-05-15")
        )
        val loginResponse = LoginResponse(
            user = studentProfile,
            token = "auth_token_123",
            tokenType = "Bearer"
        )
        
        `when`(mockApiService.login(LoginRequest(username, password)))
            .thenReturn(Response.success(loginResponse))

        val loginResult = authRepository.login(username, password)
        assertThat(loginResult).isInstanceOf(Result.Success::class.java)
        val loggedInUser = (loginResult as Result.Success).data

        // Step 2: Get user profile (for dashboard)
        val meResponse = MeResponse(
            id = 1,
            name = "John Doe",
            username = username,
            email = "john@example.com",
            userType = "student",
            createdAt = "2026-01-01T00:00:00Z",
            studentProfile = StudentProfile(1, "1234567890", "123", 1, "2008-05-15")
        )
        
        `when`(mockApiService.getMe())
            .thenReturn(Response.success(ApiResponse(data = meResponse)))

        val meResult = authRepository.getMe()
        assertThat(meResult).isInstanceOf(Result.Success::class.java)
        val userProfile = (meResult as Result.Success).data

        // Step 3: Get student's class schedules
        val schedules = listOf(
            Schedule(
                id = 1,
                `class` = ClassInfo(id = 1, name = "10-A"),
                teacher = TeacherInfo(id = 10, name = "Mr. Math"),
                subjectName = "Matematika",
                day = "Senin",
                startTime = "07:30",
                endTime = "08:30",
                room = "101",
                semester = 1,
                year = 2026,
                createdAt = "2026-01-01T00:00:00Z"
            ),
            Schedule(
                id = 2,
                `class` = ClassInfo(id = 1, name = "10-A"),
                teacher = TeacherInfo(id = 11, name = "Mr. Bahasa"),
                subjectName = "Bahasa Indonesia",
                day = "Senin",
                startTime = "08:30",
                endTime = "09:30",
                room = "102",
                semester = 1,
                year = 2026,
                createdAt = "2026-01-01T00:00:00Z"
            )
        )
        
        `when`(mockApiService.getMyClassSchedules())
            .thenReturn(Response.success(PaginatedResponse(data = schedules)))

        val schedulesResult = studentRepository.getMyClassSchedules()
        assertThat(schedulesResult).isInstanceOf(Result.Success::class.java)
        val userSchedules = (schedulesResult as Result.Success).data
        assertThat(userSchedules).hasSize(2)

        // Step 4: Get attendance summary
        val attendanceSummary = AttendanceSummary(
            totalStudents = 20,
            present = 18,
            absent = 1,
            late = 1,
            attendanceRate = 90.0f
        )
        
        `when`(mockApiService.getMyAttendanceSummary(null, null))
            .thenReturn(Response.success(ApiResponse(data = attendanceSummary)))

        val summaryResult = attendanceRepository.getMyAttendanceSummary()
        assertThat(summaryResult).isInstanceOf(Result.Success::class.java)
        val summary = (summaryResult as Result.Success).data
        assertThat(summary.attendanceRate).isWithin(0.1f).of(90.0f)

        // Verify complete flow
        assertThat(loggedInUser.userType).isEqualTo("student")
        assertThat(userProfile.username).isEqualTo(username)
        assertThat(userSchedules).isNotEmpty()
        assertThat(summary.present ?: 0).isGreaterThan(0)
    }

    // ===== WORKFLOW 2: QR CODE SCANNING FLOW =====

    @Test
    fun testQRCodeScanningWorkflow(): Unit = runBlocking {
        // Scenario: Student scans a QR code to record attendance

        // Step 1: Student has a valid QR code
        val qrToken = "qr_token_12345"

        // Step 2: Scan the QR code
        val scannedAttendance = AttendanceData(
            id = 100,
            attendeeName = "John Doe",
            status = "present",
            scannedAt = "2026-02-20T08:05:00Z",
            schedule = ScheduleInfo(
                id = 1,
                subjectName = "Matematika",
                className = "10-A",
                date = "2026-02-20"
            ),
            reason = "Valid scan"
        )

        `when`(mockApiService.scanAttendance(ScanAttendanceRequest(token = qrToken)))
            .thenReturn(Response.success(ApiResponse(data = scannedAttendance)))

        val scanResult = attendanceRepository.scanAttendance(qrToken)
        assertThat(scanResult).isInstanceOf(Result.Success::class.java)
        val attendance = (scanResult as Result.Success).data

        // Step 3: Verify the attendance was recorded
        assertThat(attendance.status).isEqualTo("present")
        assertThat(attendance.attendeeName).isEqualTo("John Doe")
        assertThat(attendance.scannedAt).isNotNull()

        // Step 4: Get confirmation message
        val confirmationMessage = "Kehadiran berhasil dicatat: ${attendance.status.orEmpty().uppercase()}"
        assertThat(confirmationMessage).contains("PRESENT")
    }

    // ===== WORKFLOW 3: MANUAL ATTENDANCE RECORDING FOR TEACHER =====

    @Test
    fun testTeacherManualAttendanceRecordingWorkflow(): Unit = runBlocking {
        // Scenario: Teacher manually records attendance for a class

        // Step 1: Teacher gets their class info
        val classInfo = Classes(
            id = 1,
            name = "10-A",
            major = MajorInfo(id = 1, name = "Science"),
            homeroomTeacher = TeacherInfo(id = 5, name = "Mr. Teacher"),
            studentCount = 30,
            createdAt = "2026-01-01T00:00:00Z"
        )

        `when`(mockApiService.getMyClass())
            .thenReturn(Response.success(ApiResponse(data = classInfo)))

        val classResult = studentRepository.getMyClass()
        assertThat(classResult).isInstanceOf(Result.Success::class.java)

        // Step 2: Get the class attendance records
        val classAttendance = listOf(
            AttendanceResource(id = 1, student = null, schedule = null, status = "present", timestamp = null, reason = null),
            AttendanceResource(id = 2, student = null, schedule = null, status = "absent", timestamp = null, reason = null),
            AttendanceResource(id = 3, student = null, schedule = null, status = "present", timestamp = null, reason = null)
        )

        `when`(mockApiService.getClassAttendanceByDate(1, "2026-02-20"))
            .thenReturn(Response.success(PaginatedResponse(data = classAttendance)))

        val attendanceResult = attendanceRepository.getClassAttendanceByDate(1, "2026-02-20")
        assertThat(attendanceResult).isInstanceOf(Result.Success::class.java)
        val records = (attendanceResult as Result.Success).data

        // Step 3: Teacher records manual attendance for absent student
        val manualRecord = ManualAttendanceRequest(
            attendeeType = "student",
            scheduleId = 1,
            date = "2026-02-20",
            status = "sick",
            studentId = 101,
            reason = "Demam tinggi - confirmed by parent"
        )

        val updatedAttendance = AttendanceData(
            id = 2,
            attendeeName = "Student 101",
            status = "sick",
            scannedAt = null,
            schedule = ScheduleInfo(
                id = 1,
                subjectName = "Matematika",
                className = "10-A",
                date = "2026-02-20"
            ),
            reason = "Demam tinggi - confirmed by parent"
        )

        `when`(mockApiService.recordManualAttendance(manualRecord))
            .thenReturn(Response.success(ApiResponse(data = updatedAttendance)))

        val updateResult = attendanceRepository.recordManualAttendance(manualRecord)
        assertThat(updateResult).isInstanceOf(Result.Success::class.java)
        val updated = (updateResult as Result.Success).data
        assertThat(updated.status).isEqualTo("sick")

        // Step 4: Verify class statistics
        val presentCount = records.count { it.status == "present" }
        val absentCount = records.count { it.status == "absent" }

        assertThat(presentCount).isEqualTo(2)
        assertThat(absentCount).isEqualTo(1)
    }

    // ===== WORKFLOW 4: BULK ATTENDANCE RECORDING =====

    @Test
    fun testBulkAttendanceRecordingWorkflow(): Unit = runBlocking {
        // Scenario: Teacher records attendance for an entire class at once

        val scheduleId = 5
        val date = "2026-02-20"

        // Get students in the class
        val students = listOf(
            StudentResource(
                id = 1,
                nisn = "1001",
                nis = "001",
                name = "Student 1",
                `class` = ClassInfo(id = 1, name = "10-A"),
                dateOfBirth = "2008-01-01",
                createdAt = ""
            ),
            StudentResource(
                id = 2,
                nisn = "1002",
                nis = "002",
                name = "Student 2",
                `class` = ClassInfo(id = 1, name = "10-A"),
                dateOfBirth = "2008-02-01",
                createdAt = ""
            ),
            StudentResource(
                id = 3,
                nisn = "1003",
                nis = "003",
                name = "Student 3",
                `class` = ClassInfo(id = 1, name = "10-A"),
                dateOfBirth = "2008-03-01",
                createdAt = ""
            )
        )

        `when`(mockApiService.getStudents(null, 1, null))
            .thenReturn(Response.success(PaginatedResponse(data = students)))

        val studentsResult = studentRepository.getStudents(classId = 1)
        assertThat(studentsResult).isInstanceOf(Result.Success::class.java)

        // Prepare bulk records
        val bulkRecords = listOf(
            BulkAttendanceItem(
                attendeeType = "student",
                scheduleId = scheduleId,
                status = "present",
                date = date,
                studentId = 1
            ),
            BulkAttendanceItem(
                attendeeType = "student",
                scheduleId = scheduleId,
                status = "absent",
                date = date,
                studentId = 2
            ),
            BulkAttendanceItem(
                attendeeType = "student",
                scheduleId = scheduleId,
                status = "present",
                date = date,
                studentId = 3
            )
        )

        // Record bulk attendance
        val attendanceResults = listOf(
            createAttendanceData(1, "Student 1", "present"),
            createAttendanceData(2, "Student 2", "absent"),
            createAttendanceData(3, "Student 3", "present")
        )

        `when`(mockApiService.recordBulkManualAttendance(BulkManualAttendanceRequest(bulkRecords)))
            .thenReturn(Response.success(ApiResponse(data = attendanceResults)))

        val bulkResult = attendanceRepository.recordBulkManualAttendance(bulkRecords)
        assertThat(bulkResult).isInstanceOf(Result.Success::class.java)
        val results = (bulkResult as Result.Success).data

        // Verify results
        assertThat(results).hasSize(3)
        assertThat(results.count { it.status == "present" }).isEqualTo(2)
        assertThat(results.count { it.status == "absent" }).isEqualTo(1)
    }

    // ===== WORKFLOW 5: STUDENT MANAGEMENT FOR ADMIN =====

    @Test
    fun testAdminStudentManagementWorkflow(): Unit = runBlocking {
        // Scenario: Admin creates a new student

        // Step 1: Get list of existing students
        val existingStudents = listOf(
            StudentResource(
                id = 1,
                nisn = "1001",
                nis = "001",
                name = "John",
                `class` = ClassInfo(id = 1, name = "10-A"),
                dateOfBirth = "",
                createdAt = ""
            ),
            StudentResource(
                id = 2,
                nisn = "1002",
                nis = "002",
                name = "Jane",
                `class` = ClassInfo(id = 1, name = "10-A"),
                dateOfBirth = "",
                createdAt = ""
            )
        )

        `when`(mockApiService.getStudents(null, null, null))
            .thenReturn(Response.success(PaginatedResponse(data = existingStudents)))

        val listResult = studentRepository.getStudents()
        assertThat(listResult).isInstanceOf(Result.Success::class.java)
        val currentList = (listResult as Result.Success).data
        assertThat(currentList).hasSize(2)

        // Step 2: Create a new student
        val newStudentRequest = StoreStudentRequest(
            nisn = "2024001",
            name = "New Student",
            email = "newstudent@school.com",
            classId = 1
        )

        val newStudent = StudentResource(
            id = 3,
            nisn = "2024001",
            nis = "003",
            name = "New Student",
            `class` = ClassInfo(id = 1, name = "10-A"),
            dateOfBirth = "2009-01-01",
            createdAt = "2026-02-20T10:00:00Z"
        )

        `when`(mockApiService.createStudent(newStudentRequest))
            .thenReturn(Response.success(ApiResponse(data = newStudent)))

        val createResult = studentRepository.createStudent(newStudentRequest)
        assertThat(createResult).isInstanceOf(Result.Success::class.java)
        val createdStudent = (createResult as Result.Success).data
        assertThat(createdStudent.id).isEqualTo(3)

        // Step 3: Retrieve the newly created student
        `when`(mockApiService.getStudent(3))
            .thenReturn(Response.success(ApiResponse(data = newStudent)))

        val retrieveResult = studentRepository.getStudent(3)
        assertThat(retrieveResult).isInstanceOf(Result.Success::class.java)

        // Step 4: Update the student
        val updateRequest = UpdateStudentRequest(
            nisn = "2024001",
            name = "Updated Name",
            classId = 2
        )

        val updatedStudent = newStudent.copy(
            name = "Updated Name",
            `class` = ClassInfo(id = 2, name = "Class 2")
        )

        `when`(mockApiService.updateStudent(3, updateRequest))
            .thenReturn(Response.success(ApiResponse(data = updatedStudent)))

        val updateResult = studentRepository.updateStudent(3, updateRequest)
        assertThat(updateResult).isInstanceOf(Result.Success::class.java)
        assertThat((updateResult as Result.Success).data.name).isEqualTo("Updated Name")
    }

    // ===== WORKFLOW 6: ATTENDANCE STATISTICS AND REPORTING =====

    @Test
    fun testAttendanceStatisticsReportingWorkflow(): Unit = runBlocking {
        // Scenario: Administrator generates attendance report for a period

        val startDate = "2026-02-01"
        val endDate = "2026-02-28"

        // Step 1: Get overall attendance summary
        val overallSummary = AttendanceSummary(
            totalStudents = 1000,
            present = 820,
            absent = 120,
            late = 60,
            attendanceRate = 82.0f
        )

        `when`(mockApiService.getAttendanceSummary(startDate, endDate))
            .thenReturn(Response.success(ApiResponse(data = overallSummary)))

        val summaryResult = attendanceRepository.getAttendanceSummary(startDate, endDate)
        assertThat(summaryResult).isInstanceOf(Result.Success::class.java)
        val summary = (summaryResult as Result.Success).data

        // Step 2: Verify statistics
        val totalCount = (summary.present ?: 0) + (summary.absent ?: 0) + (summary.late ?: 0)
        assertThat(totalCount).isEqualTo(summary.totalStudents)

        val calculatedRate = ((summary.present ?: 0).toFloat() / (summary.totalStudents ?: 1).toFloat()) * 100
        assertThat(calculatedRate).isWithin(1f).of(summary.attendanceRate ?: 0f)

        // Step 3: Get detailed records for a specific class
        val classAttendance = listOf(
            AttendanceResource(id = 1, student = null, schedule = null, status = "present", timestamp = null, reason = null),
            AttendanceResource(id = 2, student = null, schedule = null, status = "absent", timestamp = null, reason = null),
            AttendanceResource(id = 3, student = null, schedule = null, status = "late", timestamp = null, reason = null)
        )

        `when`(mockApiService.getClassAttendanceByDate(1, "2026-02-20"))
            .thenReturn(Response.success(PaginatedResponse(data = classAttendance)))

        val classResult = attendanceRepository.getClassAttendanceByDate(1, "2026-02-20")
        assertThat(classResult).isInstanceOf(Result.Success::class.java)
        val classRecords = (classResult as Result.Success).data

        // Step 4: Analyze data
        val presentPercentage = (classRecords.count { it.status == "present" }.toFloat() / classRecords.size) * 100
        assertThat(presentPercentage).isWithin(1f).of(33.33f)
    }

    // Helper extension function
    private fun createAttendanceData(id: Int, attendeeName: String, status: String): AttendanceData {
        return AttendanceData(
            id = id,
            attendeeName = attendeeName,
            status = status,
            scannedAt = null,
            schedule = null,
            reason = null
        )
    }
}
