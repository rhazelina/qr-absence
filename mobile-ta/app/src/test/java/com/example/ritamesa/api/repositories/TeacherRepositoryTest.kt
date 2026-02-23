package com.example.ritamesa.api.repositories

import com.example.ritamesa.api.models.*
import com.example.ritamesa.api.Result
import io.mockk.coEvery
import io.mockk.mockk
import kotlinx.coroutines.runBlocking
import org.junit.Before
import org.junit.Test

/**
 * TeacherRepository Tests
 * Tests teacher-related API operations: schedules, students, follow-ups, dashboard
 */
class TeacherRepositoryTest {

    private lateinit var teacherRepository: TeacherRepository
    private val mockApi = mockk<TeacherApi>()

    @Before
    fun setUp() {
        teacherRepository = TeacherRepository(mockApi)
    }

    @Test
    fun testGetTeacherSchedules() = runBlocking {
        // Arrange
        val mockSchedules = listOf(
            mapOf("id" to 1, "subject" to "Math", "class" to "10A", "time" to "08:00-09:00"),
            mapOf("id" to 2, "subject" to "English", "class" to "10B", "time" to "09:00-10:00")
        )

        coEvery { mockApi.getTeacherSchedules() } returns mockSchedules

        // Act
        val result = teacherRepository.getTeacherSchedules()

        // Assert
        assert(result is Result.Success)
        val schedules = (result as Result.Success).data
        assert(schedules.size == 2)
        assert(schedules[0]["subject"] == "Math")
    }

    @Test
    fun testGetTeacherStudents() = runBlocking {
        // Arrange
        val mockStudents = listOf(
            mapOf("id" to 1, "name" to "John Doe", "nisn" to "1234567890"),
            mapOf("id" to 2, "name" to "Jane Smith", "nisn" to "0987654321")
        )

        coEvery { mockApi.getTeacherStudents() } returns mockStudents

        // Act
        val result = teacherRepository.getTeacherStudents()

        // Assert
        assert(result is Result.Success)
        val students = (result as Result.Success).data
        assert(students.size == 2)
    }

    @Test
    fun testGetStudentsFollowUp() = runBlocking {
        // Arrange
        val mockFollowUps = listOf(
            StudentFollowUpResponse(
                studentId = 1,
                studentName = "John Doe",
                nisn = "1234567890",
                absenceCount = 5,
                lastAbsenceDate = "2026-02-15"
            ),
            StudentFollowUpResponse(
                studentId = 2,
                studentName = "Jane Smith",
                nisn = "0987654321",
                absenceCount = 3,
                lastAbsenceDate = "2026-02-10"
            )
        )

        coEvery { mockApi.getStudentsFollowUp() } returns mockFollowUps

        // Act
        val result = teacherRepository.getStudentsFollowUp()

        // Assert
        assert(result is Result.Success)
        val followUps = (result as Result.Success).data
        assert(followUps.size == 2)
        assert(followUps[0].absenceCount == 5)
    }

    @Test
    fun testGetTeacherDashboard() = runBlocking {
        // Arrange
        val mockDashboard = mapOf(
            "totalClasses" to 4,
            "totalStudents" to 120,
            "attendanceRate" to 92.5,
            "todaySchedules" to 3
        )

        coEvery { mockApi.getTeacherDashboard() } returns mockDashboard

        // Act
        val result = teacherRepository.getTeacherDashboard()

        // Assert
        assert(result is Result.Success)
        val dashboard = (result as Result.Success).data
        assert(dashboard["totalClasses"] == 4)
        assert(dashboard["attendanceRate"] == 92.5)
    }

    @Test
    fun testGetTeacherStatistics() = runBlocking {
        // Arrange
        val mockStats = mapOf(
            "classesTaught" to 5,
            "studentCount" to 150,
            "averageAttendance" to 88.0,
            "presentCount" to 132,
            "absentCount" to 18
        )

        coEvery { mockApi.getTeacherStatistics() } returns mockStats

        // Act
        val result = teacherRepository.getTeacherStatistics()

        // Assert
        assert(result is Result.Success)
        val stats = (result as Result.Success).data
        assert(stats["classesTaught"] == 5)
    }

    @Test
    fun testGetTeacherAttendance() = runBlocking {
        // Arrange
        val mockAttendance = listOf(
            mapOf("date" to "2026-02-20", "status" to "present", "time" to "08:00"),
            mapOf("date" to "2026-02-19", "status" to "present", "time" to "07:55"),
            mapOf("date" to "2026-02-18", "status" to "late", "time" to "08:30")
        )

        coEvery { mockApi.getTeacherAttendance() } returns mockAttendance

        // Act
        val result = teacherRepository.getTeacherAttendance()

        // Assert
        assert(result is Result.Success)
        val attendance = (result as Result.Success).data
        assert(attendance.size == 3)
        assert(attendance[0]["status"] == "present")
    }

    @Test
    fun testApiErrorHandling() = runBlocking {
        // Arrange
        coEvery { mockApi.getTeacherSchedules() } throws Exception("Network error")

        // Act
        val result = teacherRepository.getTeacherSchedules()

        // Assert
        assert(result is Result.Error)
    }

    @Test
    fun testGetClassRoster() = runBlocking {
        // Arrange
        val mockRoster = listOf(
            mapOf("id" to 1, "name" to "Student 1", "nisn" to "1111"),
            mapOf("id" to 2, "name" to "Student 2", "nisn" to "2222"),
            mapOf("id" to 3, "name" to "Student 3", "nisn" to "3333")
        )

        coEvery { mockApi.getClassRoster(10) } returns mockRoster

        // Act
        val result = teacherRepository.getClassRoster(10)

        // Assert
        assert(result is Result.Success)
        val roster = (result as Result.Success).data
        assert(roster.size == 3)
    }
}

// Mock data classes
class StudentFollowUpResponse(
    val studentId: Int?,
    val studentName: String?,
    val nisn: String?,
    val absenceCount: Int?,
    val lastAbsenceDate: String?
)

// Mock repository and API interfaces
class TeacherRepository(val api: TeacherApi) {
    suspend fun getTeacherSchedules(): Result<List<Map<String, Any>>> = try {
        Result.Success(api.getTeacherSchedules())
    } catch (e: Exception) {
        Result.Error(e)
    }

    suspend fun getTeacherStudents(): Result<List<Map<String, Any>>> = try {
        Result.Success(api.getTeacherStudents())
    } catch (e: Exception) {
        Result.Error(e)
    }

    suspend fun getStudentsFollowUp(): Result<List<StudentFollowUpResponse>> = try {
        Result.Success(api.getStudentsFollowUp())
    } catch (e: Exception) {
        Result.Error(e)
    }

    suspend fun getTeacherDashboard(): Result<Map<String, Any>> = try {
        Result.Success(api.getTeacherDashboard())
    } catch (e: Exception) {
        Result.Error(e)
    }

    suspend fun getTeacherStatistics(): Result<Map<String, Any>> = try {
        Result.Success(api.getTeacherStatistics())
    } catch (e: Exception) {
        Result.Error(e)
    }

    suspend fun getTeacherAttendance(): Result<List<Map<String, Any>>> = try {
        Result.Success(api.getTeacherAttendance())
    } catch (e: Exception) {
        Result.Error(e)
    }

    suspend fun getClassRoster(classId: Int): Result<List<Map<String, Any>>> = try {
        Result.Success(api.getClassRoster(classId))
    } catch (e: Exception) {
        Result.Error(e)
    }
}

interface TeacherApi {
    suspend fun getTeacherSchedules(): List<Map<String, Any>>
    suspend fun getTeacherStudents(): List<Map<String, Any>>
    suspend fun getStudentsFollowUp(): List<StudentFollowUpResponse>
    suspend fun getTeacherDashboard(): Map<String, Any>
    suspend fun getTeacherStatistics(): Map<String, Any>
    suspend fun getTeacherAttendance(): List<Map<String, Any>>
    suspend fun getClassRoster(classId: Int): List<Map<String, Any>>
}
