package com.example.ritamesa.api.repositories

import com.example.ritamesa.api.Result
import io.mockk.coEvery
import io.mockk.mockk
import kotlinx.coroutines.runBlocking
import org.junit.Before
import org.junit.Test

/**
 * AdminRepository Tests
 * Tests admin operations: user management, system statistics, configurations
 */
class AdminRepositoryTest {

    private lateinit var adminRepository: AdminRepository
    private val mockApi = mockk<AdminApi>()

    @Before
    fun setUp() {
        adminRepository = AdminRepository(mockApi)
    }

    @Test
    fun testGetDashboardSummary() = runBlocking {
        // Arrange
        val mockDashboard = mapOf(
            "totalStudents" to 500,
            "totalTeachers" to 50,
            "totalClasses" to 20,
            "attendanceRate" to 89.5,
            "totalAdmins" to 5
        )

        coEvery { mockApi.getDashboardSummary() } returns mockDashboard

        // Act
        val result = adminRepository.getDashboardSummary()

        // Assert
        assert(result is Result.Success)
        val dashboard = (result as Result.Success).data
        assert(dashboard["totalStudents"] == 500)
        assert(dashboard["totalTeachers"] == 50)
    }

    @Test
    fun testGetUsersList() = runBlocking {
        // Arrange
        val mockUsers = listOf(
            mapOf("id" to 1, "name" to "Admin User", "email" to "admin@school.com", "role" to "admin"),
            mapOf("id" to 2, "name" to "Teacher User", "email" to "teacher@school.com", "role" to "teacher"),
            mapOf("id" to 3, "name" to "Student User", "email" to "student@school.com", "role" to "student")
        )

        coEvery { mockApi.getUsersList() } returns mockUsers

        // Act
        val result = adminRepository.getUsersList()

        // Assert
        assert(result is Result.Success)
        val users = (result as Result.Success).data
        assert(users.size == 3)
        assert(users[0]["role"] == "admin")
    }

    @Test
    fun testCreateUser() = runBlocking {
        // Arrange
        val createUserRequest = mapOf(
            "name" to "New User",
            "email" to "newuser@school.com",
            "role" to "teacher",
            "password" to "password123"
        )

        val mockResponse = mapOf(
            "id" to 4,
            "name" to "New User",
            "email" to "newuser@school.com",
            "role" to "teacher"
        )

        coEvery { mockApi.createUser(any()) } returns mockResponse

        // Act
        val result = adminRepository.createUser(createUserRequest)

        // Assert
        assert(result is Result.Success)
        val user = (result as Result.Success).data
        assert(user["id"] == 4)
        assert(user["role"] == "teacher")
    }

    @Test
    fun testUpdateUser() = runBlocking {
        // Arrange
        val updateUserRequest = mapOf(
            "id" to 1,
            "name" to "Updated Name",
            "email" to "updated@school.com"
        )

        val mockResponse = mapOf(
            "id" to 1,
            "name" to "Updated Name",
            "email" to "updated@school.com"
        )

        coEvery { mockApi.updateUser(1, any()) } returns mockResponse

        // Act
        val result = adminRepository.updateUser(1, updateUserRequest)

        // Assert
        assert(result is Result.Success)
        val user = (result as Result.Success).data
        assert(user["name"] == "Updated Name")
    }

    @Test
    fun testDeleteUser() = runBlocking {
        // Arrange
        val mockResponse = mapOf("message" to "User deleted successfully")

        coEvery { mockApi.deleteUser(1) } returns mockResponse

        // Act
        val result = adminRepository.deleteUser(1)

        // Assert
        assert(result is Result.Success)
        val response = (result as Result.Success).data
        assert(response["message"] == "User deleted successfully")
    }

    @Test
    fun testGetSystemStatistics() = runBlocking {
        // Arrange
        val mockStats = mapOf(
            "totalAttendanceRecords" to 50000,
            "totalAbsences" to 5000,
            "totalLateArrivals" to 3000,
            "averageAttendanceRate" to 88.5,
            "dataStorageUsage" to 2.5
        )

        coEvery { mockApi.getSystemStatistics() } returns mockStats

        // Act
        val result = adminRepository.getSystemStatistics()

        // Assert
        assert(result is Result.Success)
        val stats = (result as Result.Success).data
        assert(stats["totalAttendanceRecords"] == 50000)
    }

    @Test
    fun testGetSystemHealth() = runBlocking {
        // Arrange
        val mockHealth = mapOf(
            "status" to "healthy",
            "apiResponseTime" to 45,
            "databaseConnections" to 10,
            "cacheHitRate" to 92.3,
            "uptime" to 99.9
        )

        coEvery { mockApi.getSystemHealth() } returns mockHealth

        // Act
        val result = adminRepository.getSystemHealth()

        // Assert
        assert(result is Result.Success)
        val health = (result as Result.Success).data
        assert(health["status"] == "healthy")
        assert(health["uptime"] == 99.9)
    }

    @Test
    fun testGetAuditLogs() = runBlocking {
        // Arrange
        val mockLogs = listOf(
            mapOf("id" to 1, "action" to "user_created", "user" to "admin1", "timestamp" to "2026-02-20 10:00:00"),
            mapOf("id" to 2, "action" to "user_updated", "user" to "admin1", "timestamp" to "2026-02-20 11:30:00"),
            mapOf("id" to 3, "action" to "attendance_recorded", "user" to "teacher1", "timestamp" to "2026-02-20 08:00:00")
        )

        coEvery { mockApi.getAuditLogs() } returns mockLogs

        // Act
        val result = adminRepository.getAuditLogs()

        // Assert
        assert(result is Result.Success)
        val logs = (result as Result.Success).data
        assert(logs.size == 3)
        assert(logs[0]["action"] == "user_created")
    }

    @Test
    fun testGetClassManagement() = runBlocking {
        // Arrange
        val mockClasses = listOf(
            mapOf("id" to 1, "name" to "10A", "homeroom" to "Mr. Johnson", "students" to 30),
            mapOf("id" to 2, "name" to "10B", "homeroom" to "Ms. Smith", "students" to 28),
            mapOf("id" to 3, "name" to "11A", "homeroom" to "Mr. Brown", "students" to 32)
        )

        coEvery { mockApi.getClassManagement() } returns mockClasses

        // Act
        val result = adminRepository.getClassManagement()

        // Assert
        assert(result is Result.Success)
        val classes = (result as Result.Success).data
        assert(classes.size == 3)
        assert(classes[0]["name"] == "10A")
    }

    @Test
    fun testGetBackupStatus() = runBlocking {
        // Arrange
        val mockBackup = mapOf(
            "lastBackup" to "2026-02-20 23:00:00",
            "backupSize" to "5.2GB",
            "nextScheduledBackup" to "2026-02-21 23:00:00",
            "backupStatus" to "success"
        )

        coEvery { mockApi.getBackupStatus() } returns mockBackup

        // Act
        val result = adminRepository.getBackupStatus()

        // Assert
        assert(result is Result.Success)
        val backup = (result as Result.Success).data
        assert(backup["backupStatus"] == "success")
    }

    @Test
    fun testBulkImportStudents() = runBlocking {
        // Arrange
        val mockResponse = mapOf(
            "imported" to 100,
            "skipped" to 5,
            "errors" to 2,
            "message" to "Import completed"
        )

        coEvery { mockApi.bulkImportStudents(any()) } returns mockResponse

        // Act
        val result = adminRepository.bulkImportStudents("file.csv")

        // Assert
        assert(result is Result.Success)
        val response = (result as Result.Success).data
        assert(response["imported"] == 100)
        assert(response["skipped"] == 5)
    }

    @Test
    fun testApiErrorHandling() = runBlocking {
        // Arrange
        coEvery { mockApi.getDashboardSummary() } throws Exception("API Error")

        // Act
        val result = adminRepository.getDashboardSummary()

        // Assert
        assert(result is Result.Error)
    }
}

// Mock repository and API interfaces
class AdminRepository(val api: AdminApi) {
    suspend fun getDashboardSummary(): Result<Map<String, Any>> = try {
        Result.Success(api.getDashboardSummary())
    } catch (e: Exception) {
        Result.Error(e)
    }

    suspend fun getUsersList(): Result<List<Map<String, Any>>> = try {
        Result.Success(api.getUsersList())
    } catch (e: Exception) {
        Result.Error(e)
    }

    suspend fun createUser(user: Map<String, Any>): Result<Map<String, Any>> = try {
        Result.Success(api.createUser(user))
    } catch (e: Exception) {
        Result.Error(e)
    }

    suspend fun updateUser(userId: Int, user: Map<String, Any>): Result<Map<String, Any>> = try {
        Result.Success(api.updateUser(userId, user))
    } catch (e: Exception) {
        Result.Error(e)
    }

    suspend fun deleteUser(userId: Int): Result<Map<String, Any>> = try {
        Result.Success(api.deleteUser(userId))
    } catch (e: Exception) {
        Result.Error(e)
    }

    suspend fun getSystemStatistics(): Result<Map<String, Any>> = try {
        Result.Success(api.getSystemStatistics())
    } catch (e: Exception) {
        Result.Error(e)
    }

    suspend fun getSystemHealth(): Result<Map<String, Any>> = try {
        Result.Success(api.getSystemHealth())
    } catch (e: Exception) {
        Result.Error(e)
    }

    suspend fun getAuditLogs(): Result<List<Map<String, Any>>> = try {
        Result.Success(api.getAuditLogs())
    } catch (e: Exception) {
        Result.Error(e)
    }

    suspend fun getClassManagement(): Result<List<Map<String, Any>>> = try {
        Result.Success(api.getClassManagement())
    } catch (e: Exception) {
        Result.Error(e)
    }

    suspend fun getBackupStatus(): Result<Map<String, Any>> = try {
        Result.Success(api.getBackupStatus())
    } catch (e: Exception) {
        Result.Error(e)
    }

    suspend fun bulkImportStudents(filePath: String): Result<Map<String, Any>> = try {
        Result.Success(api.bulkImportStudents(filePath))
    } catch (e: Exception) {
        Result.Error(e)
    }
}

interface AdminApi {
    suspend fun getDashboardSummary(): Map<String, Any>
    suspend fun getUsersList(): List<Map<String, Any>>
    suspend fun createUser(user: Map<String, Any>): Map<String, Any>
    suspend fun updateUser(userId: Int, user: Map<String, Any>): Map<String, Any>
    suspend fun deleteUser(userId: Int): Map<String, Any>
    suspend fun getSystemStatistics(): Map<String, Any>
    suspend fun getSystemHealth(): Map<String, Any>
    suspend fun getAuditLogs(): List<Map<String, Any>>
    suspend fun getClassManagement(): List<Map<String, Any>>
    suspend fun getBackupStatus(): Map<String, Any>
    suspend fun bulkImportStudents(filePath: String): Map<String, Any>
}
