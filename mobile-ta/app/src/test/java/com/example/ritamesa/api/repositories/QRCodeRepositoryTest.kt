package com.example.ritamesa.api.repositories

import com.example.ritamesa.api.Result
import io.mockk.coEvery
import io.mockk.mockk
import kotlinx.coroutines.runBlocking
import org.junit.Before
import org.junit.Test

/**
 * QRCodeRepository Tests
 * Tests QR code generation, scanning, validation, and revocation
 */
class QRCodeRepositoryTest {

    private lateinit var qrCodeRepository: QRCodeRepository
    private val mockApi = mockk<QRCodeApi>()

    @Before
    fun setUp() {
        qrCodeRepository = QRCodeRepository(mockApi)
    }

    @Test
    fun testGenerateQRCode() = runBlocking {
        // Arrange
        val generateRequest = mapOf(
            "schedule_id" to 1,
            "expires_in_minutes" to 5
        )

        val mockResponse = mapOf(
            "id" to 123,
            "token" to "QR_ABC123XYZ",
            "schedule_id" to 1,
            "created_at" to "2026-02-20 08:00:00",
            "expires_at" to "2026-02-20 08:05:00",
            "is_active" to true,
            "scan_count" to 0
        )

        coEvery { mockApi.generateQRCode(any()) } returns mockResponse

        // Act
        val result = qrCodeRepository.generateQRCode(generateRequest)

        // Assert
        assert(result is Result.Success)
        val qrCode = (result as Result.Success).data
        assert(qrCode["token"] == "QR_ABC123XYZ")
        assert(qrCode["is_active"] == true)
    }

    @Test
    fun testGetActiveQRCodes() = runBlocking {
        // Arrange
        val mockQRCodes = listOf(
            mapOf(
                "id" to 1,
                "token" to "QR_001",
                "schedule_id" to 10,
                "created_at" to "2026-02-20 08:00:00",
                "expires_at" to "2026-02-20 08:05:00",
                "is_active" to true,
                "scan_count" to 25
            ),
            mapOf(
                "id" to 2,
                "token" to "QR_002",
                "schedule_id" to 11,
                "created_at" to "2026-02-20 09:00:00",
                "expires_at" to "2026-02-20 09:05:00",
                "is_active" to true,
                "scan_count" to 18
            )
        )

        coEvery { mockApi.getActiveQRCodes() } returns mockQRCodes

        // Act
        val result = qrCodeRepository.getActiveQRCodes()

        // Assert
        assert(result is Result.Success)
        val qrCodes = (result as Result.Success).data
        assert(qrCodes.size == 2)
        assert(qrCodes[0]["is_active"] == true)
    }

    @Test
    fun testGetQRCodeDetails() = runBlocking {
        // Arrange
        val token = "QR_ABC123XYZ"
        val mockResponse = mapOf(
            "id" to 123,
            "token" to token,
            "schedule_id" to 1,
            "created_at" to "2026-02-20 08:00:00",
            "expires_at" to "2026-02-20 08:05:00",
            "is_active" to true,
            "scan_count" to 10,
            "schedule" to mapOf(
                "id" to 1,
                "subject" to "Math",
                "class" to "10A",
                "time" to "08:00-09:00"
            )
        )

        coEvery { mockApi.getQRCodeDetails(token) } returns mockResponse

        // Act
        val result = qrCodeRepository.getQRCodeDetails(token)

        // Assert
        assert(result is Result.Success)
        val qrCode = (result as Result.Success).data
        assert(qrCode["is_active"] == true)
        assert(qrCode["scan_count"] == 10)
    }

    @Test
    fun testRevokeQRCode() = runBlocking {
        // Arrange
        val token = "QR_ABC123XYZ"
        val mockResponse = mapOf(
            "message" to "QR code telah dibatalkan",
            "token" to token,
            "is_active" to false,
            "revoked_at" to "2026-02-20 08:02:00"
        )

        coEvery { mockApi.revokeQRCode(token) } returns mockResponse

        // Act
        val result = qrCodeRepository.revokeQRCode(token)

        // Assert
        assert(result is Result.Success)
        val response = (result as Result.Success).data
        assert(response["is_active"] == false)
    }

    @Test
    fun testScanQRCode() = runBlocking {
        // Arrange
        val scanRequest = mapOf(
            "token" to "QR_ABC123XYZ",
            "device_id" to 1
        )

        val mockResponse = mapOf(
            "id" to 456,
            "attendance_id" to 789,
            "qr_code_id" to 123,
            "student_id" to 10,
            "status" to "present",
            "timestamp" to "2026-02-20 08:00:30",
            "message" to "Attendance recorded successfully"
        )

        coEvery { mockApi.scanQRCode(any()) } returns mockResponse

        // Act
        val result = qrCodeRepository.scanQRCode(scanRequest)

        // Assert
        assert(result is Result.Success)
        val response = (result as Result.Success).data
        assert(response["status"] == "present")
        assert(response["message"] == "Attendance recorded successfully")
    }

    @Test
    fun testScanQRCodeInvalid() = runBlocking {
        // Arrange
        val scanRequest = mapOf(
            "token" to "INVALID_TOKEN"
        )

        coEvery { mockApi.scanQRCode(any()) } throws Exception("QR tidak aktif atau sudah kadaluarsa")

        // Act
        val result = qrCodeRepository.scanQRCode(scanRequest)

        // Assert
        assert(result is Result.Error)
    }

    @Test
    fun testQRCodeExpiration() = runBlocking {
        // Arrange - QR code that has expired
        val expiredToken = "QR_EXPIRED123"
        
        coEvery { mockApi.getQRCodeDetails(expiredToken) } returns mapOf(
            "id" to 999,
            "token" to expiredToken,
            "is_active" to false,
            "expires_at" to "2026-02-20 07:00:00" // Past time
        )

        // Act
        val result = qrCodeRepository.getQRCodeDetails(expiredToken)

        // Assert
        assert(result is Result.Success)
        val qrCode = (result as Result.Success).data
        assert(qrCode["is_active"] == false)
    }

    @Test
    fun testQRCodeWithDifferentExpiryDurations() = runBlocking {
        // Test various expiry durations
        val expiryDurations = listOf(1, 5, 10, 15, 30, 60)

        expiryDurations.forEach { minutes ->
            val request = mapOf(
                "schedule_id" to 1,
                "expires_in_minutes" to minutes
            )

            coEvery { mockApi.generateQRCode(any()) } returns mapOf(
                "id" to minutes,
                "token" to "QR_TEST_$minutes",
                "expires_in_minutes" to minutes
            )

            val result = qrCodeRepository.generateQRCode(request)

            assert(result is Result.Success)
        }
    }

    @Test
    fun testMultipleQRScansForSameCode() = runBlocking {
        // Arrange
        val token = "QR_ABC123XYZ"

        // Mock the API to track scan count
        var scanCount = 0
        coEvery { mockApi.getQRCodeDetails(token) } answers {
            mapOf(
                "token" to token,
                "scan_count" to ++scanCount,
                "is_active" to true
            )
        }

        // Act - Simulate multiple scans
        repeat(3) {
            qrCodeRepository.getQRCodeDetails(token)
        }

        // Assert
        val result = qrCodeRepository.getQRCodeDetails(token)
        assert(result is Result.Success)
        val qrCode = (result as Result.Success).data
        assert(qrCode["scan_count"] == 4) // 3 + 1 from final call
    }

    @Test
    fun testQRCodeBatch() = runBlocking {
        // Arrange
        val scheduleIds = listOf(1, 2, 3, 4, 5)
        val mockBatchResponse = mapOf(
            "created" to 5,
            "failed" to 0,
            "qr_codes" to listOf(
                mapOf("id" to 1, "token" to "QR_001"),
                mapOf("id" to 2, "token" to "QR_002"),
                mapOf("id" to 3, "token" to "QR_003"),
                mapOf("id" to 4, "token" to "QR_004"),
                mapOf("id" to 5, "token" to "QR_005")
            )
        )

        coEvery { mockApi.generateBatchQRCodes(any()) } returns mockBatchResponse

        // Act
        val result = qrCodeRepository.generateBatchQRCodes(scheduleIds)

        // Assert
        assert(result is Result.Success)
        val response = (result as Result.Success).data
        assert(response["created"] == 5)
    }

    @Test
    fun testApiErrorHandling() = runBlocking {
        // Arrange
        coEvery { mockApi.getActiveQRCodes() } throws Exception("Network error")

        // Act
        val result = qrCodeRepository.getActiveQRCodes()

        // Assert
        assert(result is Result.Error)
    }
}

// Mock repository and API interfaces
class QRCodeRepository(val api: QRCodeApi) {
    suspend fun generateQRCode(request: Map<String, Any>): Result<Map<String, Any>> = try {
        Result.Success(api.generateQRCode(request))
    } catch (e: Exception) {
        Result.Error(e)
    }

    suspend fun getActiveQRCodes(): Result<List<Map<String, Any>>> = try {
        Result.Success(api.getActiveQRCodes())
    } catch (e: Exception) {
        Result.Error(e)
    }

    suspend fun getQRCodeDetails(token: String): Result<Map<String, Any>> = try {
        Result.Success(api.getQRCodeDetails(token))
    } catch (e: Exception) {
        Result.Error(e)
    }

    suspend fun revokeQRCode(token: String): Result<Map<String, Any>> = try {
        Result.Success(api.revokeQRCode(token))
    } catch (e: Exception) {
        Result.Error(e)
    }

    suspend fun scanQRCode(request: Map<String, Any>): Result<Map<String, Any>> = try {
        Result.Success(api.scanQRCode(request))
    } catch (e: Exception) {
        Result.Error(e)
    }

    suspend fun generateBatchQRCodes(scheduleIds: List<Int>): Result<Map<String, Any>> = try {
        Result.Success(api.generateBatchQRCodes(scheduleIds))
    } catch (e: Exception) {
        Result.Error(e)
    }
}

interface QRCodeApi {
    suspend fun generateQRCode(request: Map<String, Any>): Map<String, Any>
    suspend fun getActiveQRCodes(): List<Map<String, Any>>
    suspend fun getQRCodeDetails(token: String): Map<String, Any>
    suspend fun revokeQRCode(token: String): Map<String, Any>
    suspend fun scanQRCode(request: Map<String, Any>): Map<String, Any>
    suspend fun generateBatchQRCodes(scheduleIds: List<Int>): Map<String, Any>
}
