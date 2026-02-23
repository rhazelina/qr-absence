package com.example.ritamesa.api.repositories

import com.example.ritamesa.api.Result
import io.mockk.coEvery
import io.mockk.mockk
import kotlinx.coroutines.runBlocking
import org.junit.Before
import org.junit.Test

/**
 * NotificationRepository Tests
 * Tests notification management: retrieval, marking as read, deletion, filters
 */
class NotificationRepositoryTest {

    private lateinit var notificationRepository: NotificationRepository
    private val mockApi = mockk<NotificationApi>()

    @Before
    fun setUp() {
        notificationRepository = NotificationRepository(mockApi)
    }

    @Test
    fun testGetNotifications() = runBlocking {
        // Arrange
        val mockNotifications = listOf(
            mapOf(
                "id" to 1,
                "title" to "Absence Alert",
                "message" to "You have 5 absences this month",
                "type" to "absence",
                "read" to false,
                "created_at" to "2026-02-20 10:30:00"
            ),
            mapOf(
                "id" to 2,
                "title" to "Schedule Change",
                "message" to "Your class schedule has been updated",
                "type" to "schedule",
                "read" to false,
                "created_at" to "2026-02-20 09:15:00"
            ),
            mapOf(
                "id" to 3,
                "title" to "Late Notice",
                "message" to "You were late 3 times this week",
                "type" to "attendance",
                "read" to true,
                "created_at" to "2026-02-19 14:00:00"
            )
        )

        coEvery { mockApi.getNotifications() } returns mockNotifications

        // Act
        val result = notificationRepository.getNotifications()

        // Assert
        assert(result is Result.Success)
        val notifications = (result as Result.Success).data
        assert(notifications.size == 3)
        assert(notifications[0]["type"] == "absence")
        assert(notifications[2]["read"] == true)
    }

    @Test
    fun testGetUnreadNotifications() = runBlocking {
        // Arrange
        val mockUnreadNotifications = listOf(
            mapOf(
                "id" to 1,
                "title" to "Absence Alert",
                "message" to "You have 5 absences",
                "read" to false
            ),
            mapOf(
                "id" to 2,
                "title" to "Schedule Change",
                "message" to "Schedule has been updated",
                "read" to false
            )
        )

        coEvery { mockApi.getUnreadNotifications() } returns mockUnreadNotifications

        // Act
        val result = notificationRepository.getUnreadNotifications()

        // Assert
        assert(result is Result.Success)
        val notifications = (result as Result.Success).data
        assert(notifications.size == 2)
        notifications.forEach { notification ->
            assert(notification["read"] == false)
        }
    }

    @Test
    fun testGetUnreadCount() = runBlocking {
        // Arrange
        val mockResponse = mapOf("unread_count" to 5)

        coEvery { mockApi.getUnreadCount() } returns mockResponse

        // Act
        val result = notificationRepository.getUnreadCount()

        // Assert
        assert(result is Result.Success)
        val response = (result as Result.Success).data
        assert(response["unread_count"] == 5)
    }

    @Test
    fun testMarkAsRead() = runBlocking {
        // Arrange
        val notificationId = 1
        val mockResponse = mapOf(
            "id" to notificationId,
            "read" to true,
            "read_at" to "2026-02-20 10:45:00"
        )

        coEvery { mockApi.markAsRead(notificationId) } returns mockResponse

        // Act
        val result = notificationRepository.markAsRead(notificationId)

        // Assert
        assert(result is Result.Success)
        val response = (result as Result.Success).data
        assert(response["read"] == true)
    }

    @Test
    fun testMarkAllAsRead() = runBlocking {
        // Arrange
        val mockResponse = mapOf(
            "marked_as_read" to 5,
            "message" to "All notifications marked as read"
        )

        coEvery { mockApi.markAllAsRead() } returns mockResponse

        // Act
        val result = notificationRepository.markAllAsRead()

        // Assert
        assert(result is Result.Success)
        val response = (result as Result.Success).data
        assert(response["marked_as_read"] == 5)
    }

    @Test
    fun testDeleteNotification() = runBlocking {
        // Arrange
        val notificationId = 1
        val mockResponse = mapOf(
            "message" to "Notification deleted successfully",
            "id" to notificationId
        )

        coEvery { mockApi.deleteNotification(notificationId) } returns mockResponse

        // Act
        val result = notificationRepository.deleteNotification(notificationId)

        // Assert
        assert(result is Result.Success)
        val response = (result as Result.Success).data
        assert(response["message"] == "Notification deleted successfully")
    }

    @Test
    fun testDeleteMultipleNotifications() = runBlocking {
        // Arrange
        val notificationIds = listOf(1, 2, 3)
        val mockResponse = mapOf(
            "deleted" to 3,
            "message" to "Notifications deleted successfully"
        )

        coEvery { mockApi.deleteMultiple(any()) } returns mockResponse

        // Act
        val result = notificationRepository.deleteMultiple(notificationIds)

        // Assert
        assert(result is Result.Success)
        val response = (result as Result.Success).data
        assert(response["deleted"] == 3)
    }

    @Test
    fun testFilterNotificationsByType() = runBlocking {
        // Arrange
        val type = "absence"
        val mockNotifications = listOf(
            mapOf(
                "id" to 1,
                "type" to "absence",
                "title" to "Absence Alert 1"
            ),
            mapOf(
                "id" to 4,
                "type" to "absence",
                "title" to "Absence Alert 2"
            )
        )

        coEvery { mockApi.getNotificationsByType(type) } returns mockNotifications

        // Act
        val result = notificationRepository.getNotificationsByType(type)

        // Assert
        assert(result is Result.Success)
        val notifications = (result as Result.Success).data
        assert(notifications.size == 2)
        notifications.forEach { notification ->
            assert(notification["type"] == "absence")
        }
    }

    @Test
    fun testFilterNotificationsByDateRange() = runBlocking {
        // Arrange
        val fromDate = "2026-02-15"
        val toDate = "2026-02-20"
        val mockNotifications = listOf(
            mapOf(
                "id" to 1,
                "created_at" to "2026-02-20 10:30:00"
            ),
            mapOf(
                "id" to 2,
                "created_at" to "2026-02-19 09:15:00"
            )
        )

        coEvery { mockApi.getNotificationsByDateRange(fromDate, toDate) } returns mockNotifications

        // Act
        val result = notificationRepository.getNotificationsByDateRange(fromDate, toDate)

        // Assert
        assert(result is Result.Success)
        val notifications = (result as Result.Success).data
        assert(notifications.size == 2)
    }

    @Test
    fun testSendNotification() = runBlocking {
        // Arrange
        val sendRequest = mapOf(
            "user_id" to 10,
            "title" to "Test Notification",
            "message" to "This is a test notification",
            "type" to "test"
        )

        val mockResponse = mapOf(
            "id" to 999,
            "user_id" to 10,
            "title" to "Test Notification",
            "message" to "This is a test notification",
            "created_at" to "2026-02-20 11:00:00"
        )

        coEvery { mockApi.sendNotification(any()) } returns mockResponse

        // Act
        val result = notificationRepository.sendNotification(sendRequest)

        // Assert
        assert(result is Result.Success)
        val response = (result as Result.Success).data
        assert(response["id"] == 999)
    }

    @Test
    fun testBroadcastNotification() = runBlocking {
        // Arrange
        val broadcastRequest = mapOf(
            "title" to "System Announcement",
            "message" to "System will be under maintenance",
            "audience" to "all"
        )

        val mockResponse = mapOf(
            "sent_to" to 500,
            "message" to "Notification broadcast successfully"
        )

        coEvery { mockApi.broadcastNotification(any()) } returns mockResponse

        // Act
        val result = notificationRepository.broadcastNotification(broadcastRequest)

        // Assert
        assert(result is Result.Success)
        val response = (result as Result.Success).data
        assert(response["sent_to"] == 500)
    }

    @Test
    fun testNotificationPagination() = runBlocking {
        // Arrange
        val page = 1
        val perPage = 10
        val mockResponse = mapOf(
            "data" to listOf(
                mapOf("id" to 1, "title" to "Notification 1"),
                mapOf("id" to 2, "title" to "Notification 2")
            ),
            "page" to page,
            "per_page" to perPage,
            "total" to 50
        )

        coEvery { mockApi.getNotifications(page, perPage) } returns mockResponse

        // Act
        val result = notificationRepository.getNotifications(page, perPage)

        // Assert
        assert(result is Result.Success)
        val response = (result as Result.Success).data
        assert(response["total"] == 50)
    }

    @Test
    fun testNotificationSearch() = runBlocking {
        // Arrange
        val query = "absence"
        val mockNotifications = listOf(
            mapOf(
                "id" to 1,
                "title" to "Absence Alert",
                "message" to "You have absences"
            ),
            mapOf(
                "id" to 4,
                "title" to "Consecutive Absence Notice",
                "message" to "You have consecutive absences"
            )
        )

        coEvery { mockApi.searchNotifications(query) } returns mockNotifications

        // Act
        val result = notificationRepository.searchNotifications(query)

        // Assert
        assert(result is Result.Success)
        val notifications = (result as Result.Success).data
        assert(notifications.size == 2)
    }

    @Test
    fun testApiErrorHandling() = runBlocking {
        // Arrange
        coEvery { mockApi.getNotifications() } throws Exception("Network error")

        // Act
        val result = notificationRepository.getNotifications()

        // Assert
        assert(result is Result.Error)
    }

    @Test
    fun testNotificationUpdateStatus() = runBlocking {
        // Arrange
        val notificationId = 1
        val mockResponse = mapOf(
            "id" to notificationId,
            "read" to true,
            "updated_at" to "2026-02-20 11:45:00"
        )

        coEvery { mockApi.updateNotificationStatus(notificationId, any()) } returns mockResponse

        // Act
        val updateRequest = mapOf("read" to true)
        val result = notificationRepository.updateNotificationStatus(notificationId, updateRequest)

        // Assert
        assert(result is Result.Success)
        val response = (result as Result.Success).data
        assert(response["read"] == true)
    }
}

// Mock repository and API interfaces
class NotificationRepository(val api: NotificationApi) {
    suspend fun getNotifications(): Result<List<Map<String, Any>>> = try {
        Result.Success(api.getNotifications())
    } catch (e: Exception) {
        Result.Error(e)
    }

    suspend fun getNotifications(page: Int, perPage: Int): Result<Map<String, Any>> = try {
        Result.Success(api.getNotifications(page, perPage))
    } catch (e: Exception) {
        Result.Error(e)
    }

    suspend fun getUnreadNotifications(): Result<List<Map<String, Any>>> = try {
        Result.Success(api.getUnreadNotifications())
    } catch (e: Exception) {
        Result.Error(e)
    }

    suspend fun getUnreadCount(): Result<Map<String, Any>> = try {
        Result.Success(api.getUnreadCount())
    } catch (e: Exception) {
        Result.Error(e)
    }

    suspend fun markAsRead(notificationId: Int): Result<Map<String, Any>> = try {
        Result.Success(api.markAsRead(notificationId))
    } catch (e: Exception) {
        Result.Error(e)
    }

    suspend fun markAllAsRead(): Result<Map<String, Any>> = try {
        Result.Success(api.markAllAsRead())
    } catch (e: Exception) {
        Result.Error(e)
    }

    suspend fun deleteNotification(notificationId: Int): Result<Map<String, Any>> = try {
        Result.Success(api.deleteNotification(notificationId))
    } catch (e: Exception) {
        Result.Error(e)
    }

    suspend fun deleteMultiple(ids: List<Int>): Result<Map<String, Any>> = try {
        Result.Success(api.deleteMultiple(ids))
    } catch (e: Exception) {
        Result.Error(e)
    }

    suspend fun getNotificationsByType(type: String): Result<List<Map<String, Any>>> = try {
        Result.Success(api.getNotificationsByType(type))
    } catch (e: Exception) {
        Result.Error(e)
    }

    suspend fun getNotificationsByDateRange(fromDate: String, toDate: String): Result<List<Map<String, Any>>> = try {
        Result.Success(api.getNotificationsByDateRange(fromDate, toDate))
    } catch (e: Exception) {
        Result.Error(e)
    }

    suspend fun sendNotification(request: Map<String, Any>): Result<Map<String, Any>> = try {
        Result.Success(api.sendNotification(request))
    } catch (e: Exception) {
        Result.Error(e)
    }

    suspend fun broadcastNotification(request: Map<String, Any>): Result<Map<String, Any>> = try {
        Result.Success(api.broadcastNotification(request))
    } catch (e: Exception) {
        Result.Error(e)
    }

    suspend fun searchNotifications(query: String): Result<List<Map<String, Any>>> = try {
        Result.Success(api.searchNotifications(query))
    } catch (e: Exception) {
        Result.Error(e)
    }

    suspend fun updateNotificationStatus(notificationId: Int, request: Map<String, Any>): Result<Map<String, Any>> = try {
        Result.Success(api.updateNotificationStatus(notificationId, request))
    } catch (e: Exception) {
        Result.Error(e)
    }
}

interface NotificationApi {
    suspend fun getNotifications(): List<Map<String, Any>>
    suspend fun getNotifications(page: Int, perPage: Int): Map<String, Any>
    suspend fun getUnreadNotifications(): List<Map<String, Any>>
    suspend fun getUnreadCount(): Map<String, Any>
    suspend fun markAsRead(notificationId: Int): Map<String, Any>
    suspend fun markAllAsRead(): Map<String, Any>
    suspend fun deleteNotification(notificationId: Int): Map<String, Any>
    suspend fun deleteMultiple(ids: List<Int>): Map<String, Any>
    suspend fun getNotificationsByType(type: String): List<Map<String, Any>>
    suspend fun getNotificationsByDateRange(fromDate: String, toDate: String): List<Map<String, Any>>
    suspend fun sendNotification(request: Map<String, Any>): Map<String, Any>
    suspend fun broadcastNotification(request: Map<String, Any>): Map<String, Any>
    suspend fun searchNotifications(query: String): List<Map<String, Any>>
    suspend fun updateNotificationStatus(notificationId: Int, request: Map<String, Any>): Map<String, Any>
}
