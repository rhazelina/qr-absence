package com.example.ritamesa.api.repositories

import android.content.Context
import com.example.ritamesa.AppPreferences
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
 * Unit tests for AuthRepository
 * Tests authentication flows: login, logout, getMe
 * Based on API documentation: POST /auth/login, POST /auth/logout, GET /me
 */
class AuthRepositoryTest {

    private lateinit var mockContext: Context
    private lateinit var mockApiService: ApiService
    private lateinit var mockAppPreferences: AppPreferences

    private lateinit var authRepository: AuthRepository

    @Before
    fun setup() {
        mockContext = mock(Context::class.java)
        mockApiService = mock(ApiService::class.java)
        mockAppPreferences = mock(AppPreferences::class.java)

        // Initialize repository
        authRepository = AuthRepository(mockContext, mockApiService, mockAppPreferences, persistAuth = false)
    }

    // ===== LOGIN TESTS =====

    @Test
    fun testLoginSuccess(): Unit = runBlocking {
        // Arrange
        val username = "student001"
        val password = "password123"
        val userProfile = UserProfile(
            id = 1,
            name = "John Doe",
            username = username,
            email = "john@example.com",
            userType = "student",
            createdAt = "2026-01-01T00:00:00Z",
            studentProfile = StudentProfile(1, "1234567890", "123", 1, "2010-05-15")
        )
        val loginResponse = LoginResponse(
            user = userProfile,
            token = "auth_token_123",
            tokenType = "Bearer"
        )
        val mockResponse = Response.success(loginResponse)
        `when`(mockApiService.login(LoginRequest(username, password))).thenReturn(mockResponse)

        // Act
        val result = authRepository.login(username, password)

        // Assert
        assertThat(result).isInstanceOf(Result.Success::class.java)
        val successResult = result as Result.Success
        assertThat(successResult.data.username).isEqualTo(username)
        assertThat(successResult.data.userType).isEqualTo("student")
        verify(mockAppPreferences, never()).saveAuthToken("auth_token_123")
    }

    @Test
    fun testLoginWithoutPassword(): Unit = runBlocking {
        // Arrange - NISN login doesn't require password
        val nisn = "9876543210"
        val userProfile = UserProfile(
            id = 2,
            name = "Jane Doe",
            username = nisn,
            email = "jane@example.com",
            userType = "student",
            createdAt = "2026-01-01T00:00:00Z"
        )
        val loginResponse = LoginResponse(
            user = userProfile,
            token = "auth_token_456",
            tokenType = "Bearer"
        )
        val mockResponse = Response.success(loginResponse)
        `when`(mockApiService.login(LoginRequest(nisn, null))).thenReturn(mockResponse)

        // Act
        val result = authRepository.login(nisn, password = null)

        // Assert
        assertThat(result).isInstanceOf(Result.Success::class.java)
        assertThat((result as Result.Success).data.id).isEqualTo(2)
    }

    @Test
    fun testLoginFailureInvalidCredentials(): Unit = runBlocking {
        // Arrange
        val errorJson = "{\"message\":\"Username atau password salah\"}"
        val errorBody = errorJson.toResponseBody("application/json".toMediaType())
        val mockResponse = Response.error<LoginResponse>(401, errorBody)
        `when`(mockApiService.login(LoginRequest("invalid", "wrong"))).thenReturn(mockResponse)

        // Act
        val result = authRepository.login("invalid", "wrong")

        // Assert
        assertThat(result).isInstanceOf(Result.Error::class.java)
        verify(mockAppPreferences, never()).saveAuthToken("auth_token_123")
    }

    @Test
    fun testLoginFailureNetworkError(): Unit = runBlocking {
        // Arrange
        val networkException = RuntimeException("Network error")
        `when`(mockApiService.login(LoginRequest("user", "pass"))).thenThrow(networkException)

        // Act
        val result = authRepository.login("user", "pass")

        // Assert
        assertThat(result).isInstanceOf(Result.Error::class.java)
        val errorResult = result as Result.Error
        assertThat(errorResult.exception.message).contains("Network error")
    }

    @Test
    fun testLoginTeacherWithNIP(): Unit = runBlocking {
        // Arrange
        val nip = "197305081998031001"
        val userProfile = UserProfile(
            id = 3,
            name = "Mr. Teacher",
            username = nip,
            email = "teacher@example.com",
            userType = "teacher",
            createdAt = "2026-01-01T00:00:00Z",
            teacherProfile = TeacherProfile(1, nip, "guru001")
        )
        val loginResponse = LoginResponse(
            user = userProfile,
            token = "auth_token_789",
            tokenType = "Bearer"
        )
        val mockResponse = Response.success(loginResponse)
        `when`(mockApiService.login(LoginRequest(nip, "password"))).thenReturn(mockResponse)

        // Act
        val result = authRepository.login(nip, "password")

        // Assert
        assertThat(result).isInstanceOf(Result.Success::class.java)
        val successResult = result as Result.Success
        assertThat(successResult.data.userType).isEqualTo("teacher")
        assertThat(successResult.data.teacherProfile?.nip).isEqualTo(nip)
    }

    // ===== GET ME TESTS =====

    @Test
    fun testGetMeSuccess(): Unit = runBlocking {
        // Arrange
        val meResponse = MeResponse(
            id = 1,
            name = "John Doe",
            username = "student001",
            email = "john@example.com",
            userType = "student",
            createdAt = "2026-01-01T00:00:00Z",
            studentProfile = StudentProfile(1, "1234567890", "123", 1, "2010-05-15")
        )
        val apiResponse = ApiResponse(data = meResponse)
        val mockResponse = Response.success(apiResponse)
        `when`(mockApiService.getMe()).thenReturn(mockResponse)

        // Act
        val result = authRepository.getMe()

        // Assert
        assertThat(result).isInstanceOf(Result.Success::class.java)
        val successResult = result as Result.Success
        assertThat(successResult.data.id).isEqualTo(1)
        assertThat(successResult.data.username).isEqualTo("student001")
    }

    @Test
    fun testGetMeFailure(): Unit = runBlocking {
        // Arrange
        val errorJson = "{\"message\":\"Not authenticated\"}"
        val errorBody = errorJson.toResponseBody("application/json".toMediaType())
        val mockResponse = Response.error<ApiResponse<MeResponse>>(401, errorBody)
        `when`(mockApiService.getMe()).thenReturn(mockResponse)

        // Act
        val result = authRepository.getMe()

        // Assert
        assertThat(result).isInstanceOf(Result.Error::class.java)
    }

    // ===== LOGOUT TESTS =====

    @Test
    fun testLogoutSuccess(): Unit = runBlocking {
        // Arrange
        val apiResponse = ApiResponse<Any>(data = null, message = "Logout berhasil")
        val mockResponse = Response.success(apiResponse)
        `when`(mockApiService.logout()).thenReturn(mockResponse)

        // Act
        val result = authRepository.logout()

        // Assert
        assertThat(result).isInstanceOf(Result.Success::class.java)
        verify(mockAppPreferences, never()).clearAuth()
    }

    @Test
    fun testLogoutFailure(): Unit = runBlocking {
        // Arrange
        val errorJson = "{\"message\":\"Not authenticated\"}"
        val errorBody = errorJson.toResponseBody("application/json".toMediaType())
        val mockResponse = Response.error<ApiResponse<Any>>(401, errorBody)
        `when`(mockApiService.logout()).thenReturn(mockResponse)

        // Act
        val result = authRepository.logout()

        // Assert
        assertThat(result).isInstanceOf(Result.Error::class.java)
        verify(mockAppPreferences, never()).clearAuth()
    }

    @Test
    fun testLogoutNetworkError(): Unit = runBlocking {
        // Arrange
        `when`(mockApiService.logout()).thenThrow(RuntimeException("Network error"))

        // Act
        val result = authRepository.logout()

        // Assert
        assertThat(result).isInstanceOf(Result.Error::class.java)
    }

    // ===== INTEGRATION TESTS =====

    @Test
    fun testLoginThenGetMeFlow(): Unit = runBlocking {
        // Arrange
        val loginResponse = LoginResponse(
            user = UserProfile(
                id = 1,
                name = "John Doe",
                username = "student001",
                email = "john@example.com",
                userType = "student",
                createdAt = "2026-01-01T00:00:00Z"
            ),
            token = "auth_token_123",
            tokenType = "Bearer"
        )
        `when`(mockApiService.login(LoginRequest("student001", "password"))).thenReturn(Response.success(loginResponse))

        val meResponse = MeResponse(
            id = 1,
            name = "John Doe",
            username = "student001",
            email = "john@example.com",
            userType = "student",
            createdAt = "2026-01-01T00:00:00Z"
        )
        val meApiResponse = ApiResponse(data = meResponse)
        `when`(mockApiService.getMe()).thenReturn(Response.success(meApiResponse))

        // Act
        val loginResult = authRepository.login("student001", "password")
        val meResult = authRepository.getMe()

        // Assert
        assertThat(loginResult).isInstanceOf(Result.Success::class.java)
        assertThat(meResult).isInstanceOf(Result.Success::class.java)
        assertThat((loginResult as Result.Success).data.username).isEqualTo((meResult as Result.Success).data.username)
    }
}
