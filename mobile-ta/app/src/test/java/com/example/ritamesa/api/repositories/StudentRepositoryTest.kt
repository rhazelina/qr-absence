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
 * Unit tests for StudentRepository (StudentClassScheduleRepository)
 * Tests CRUD operations: Create, Read, Update, Delete students
 * Based on API documentation: GET /students, POST /students, PUT /students/{id}, DELETE /students/{id}
 */
class StudentRepositoryTest {

    private lateinit var mockContext: Context
    private lateinit var mockApiService: ApiService

    private lateinit var studentRepository: StudentRepository

    @Before
    fun setup() {
        mockContext = mock(Context::class.java)
        mockApiService = mock(ApiService::class.java)
        studentRepository = StudentRepository(mockContext, mockApiService)
    }

    private fun createMockStudent(id: Int = 1, name: String = "John Doe", nisn: String = "1234567890"): StudentResource {
        return StudentResource(
            id = id,
            nisn = nisn,
            nis = "123",
            name = name,
            `class` = ClassInfo(id = 1, name = "10-A"),
            dateOfBirth = "2008-01-15",
            createdAt = "2026-01-01T00:00:00Z"
        )
    }

    // ===== LIST/READ TESTS =====

    @Test
    fun testGetStudentsSuccess(): Unit = runBlocking {
        // Arrange
        val studentList = listOf(
            createMockStudent(1, "John Doe", "1111111111"),
            createMockStudent(2, "Jane Smith", "2222222222"),
            createMockStudent(3, "Bob Johnson", "3333333333")
        )
        val apiResponse = PaginatedResponse(data = studentList)
        `when`(mockApiService.getStudents(any(), any(), any())).thenReturn(Response.success(apiResponse))

        // Act
        val result = studentRepository.getStudents()

        // Assert
        assertThat(result).isInstanceOf(Result.Success::class.java)
        val successResult = result as Result.Success
        assertThat(successResult.data).hasSize(3)
        assertThat(successResult.data[0].name).isEqualTo("John Doe")
    }

    @Test
    fun testGetStudentsWithSearch(): Unit = runBlocking {
        // Arrange
        val searchTerm = "John"
        val filteredList = listOf(
            createMockStudent(1, "John Doe", "1111111111")
        )
        val apiResponse = PaginatedResponse(data = filteredList)
        `when`(mockApiService.getStudents(searchTerm, null, null))
            .thenReturn(Response.success(apiResponse))

        // Act
        val result = studentRepository.getStudents(search = searchTerm)

        // Assert
        assertThat(result).isInstanceOf(Result.Success::class.java)
        val successResult = result as Result.Success
        assertThat(successResult.data).hasSize(1)
        assertThat(successResult.data[0].name).contains("John")
    }

    @Test
    fun testGetStudentsWithClassFilter(): Unit = runBlocking {
        // Arrange
        val classId = 1
        val classList = listOf(
            createMockStudent(1, "John Doe"),
            createMockStudent(2, "Jane Smith")
        )
        val apiResponse = PaginatedResponse(data = classList)
        `when`(mockApiService.getStudents(null, classId, null))
            .thenReturn(Response.success(apiResponse))

        // Act
        val result = studentRepository.getStudents(classId = classId)

        // Assert
        assertThat(result).isInstanceOf(Result.Success::class.java)
        val successResult = result as Result.Success
        assertThat(successResult.data).hasSize(2)
        successResult.data.forEach { student ->
            assertThat(student.`class`?.id).isEqualTo(classId)
        }
    }

    @Test
    fun testGetStudentsEmptyList(): Unit = runBlocking {
        // Arrange
        val emptyList = emptyList<StudentResource>()
        val apiResponse = PaginatedResponse(data = emptyList)
        `when`(mockApiService.getStudents(any(), any(), any()))
            .thenReturn(Response.success(apiResponse))

        // Act
        val result = studentRepository.getStudents()

        // Assert
        assertThat(result).isInstanceOf(Result.Success::class.java)
        val successResult = result as Result.Success
        assertThat(successResult.data).isEmpty()
    }

    // ===== CREATE (POST) TESTS =====

    @Test
    fun testCreateStudentSuccess(): Unit = runBlocking {
        // Arrange
        val request = StoreStudentRequest(
            nisn = "9876543210",
            name = "New Student",
            email = "newstudent@example.com",
            classId = 1
        )
        val createdStudent = StudentResource(
            id = 10,
            nisn = request.nisn,
            nis = "456",
            name = request.name,
            `class` = ClassInfo(id = request.classId, name = "10-A"),
            dateOfBirth = "2008-06-10",
            createdAt = "2026-02-20T10:00:00Z"
        )
        val apiResponse = ApiResponse(data = createdStudent)
        `when`(mockApiService.createStudent(request)).thenReturn(Response.success(apiResponse))

        // Act
        val result = studentRepository.createStudent(request)

        // Assert
        assertThat(result).isInstanceOf(Result.Success::class.java)
        val successResult = result as Result.Success
        assertThat(successResult.data.id).isEqualTo(10)
        assertThat(successResult.data.name).isEqualTo("New Student")
        assertThat(successResult.data.nisn).isEqualTo(request.nisn)
        verify(mockApiService).createStudent(request)
    }

    @Test
    fun testCreateStudentDuplicateNISN(): Unit = runBlocking {
        // Arrange
        val request = StoreStudentRequest(
            nisn = "1111111111",  // Already exists
            name = "Duplicate Student",
            email = "dup@example.com",
            classId = 1
        )
        val errorJson = "{\"message\":\"NISN sudah terdaftar\"}"
        val errorBody = errorJson.toResponseBody("application/json".toMediaType())
        `when`(mockApiService.createStudent(request)).thenReturn(Response.error(409, errorBody))

        // Act
        val result = studentRepository.createStudent(request)

        // Assert
        assertThat(result).isInstanceOf(Result.Error::class.java)
    }

    @Test
    fun testCreateStudentNetworkError(): Unit = runBlocking {
        // Arrange
        val request = StoreStudentRequest(
            nisn = "9999999999",
            name = "Test Student",
            email = "test@example.com",
            classId = 1
        )
        `when`(mockApiService.createStudent(request))
            .thenThrow(RuntimeException("Network error: Connection timeout"))

        // Act
        val result = studentRepository.createStudent(request)

        // Assert
        assertThat(result).isInstanceOf(Result.Error::class.java)
        val errorResult = result as Result.Error
        assertThat(errorResult.message).contains("Network error")
    }

    // ===== GET SINGLE STUDENT TESTS =====

    @Test
    fun testGetStudentSuccess(): Unit = runBlocking {
        // Arrange
        val studentId = 1
        val student = createMockStudent(studentId, "John Doe")
        val apiResponse = ApiResponse(data = student)
        `when`(mockApiService.getStudent(studentId)).thenReturn(Response.success(apiResponse))

        // Act
        val result = studentRepository.getStudent(studentId)

        // Assert
        assertThat(result).isInstanceOf(Result.Success::class.java)
        val successResult = result as Result.Success
        assertThat(successResult.data.id).isEqualTo(studentId)
        assertThat(successResult.data.name).isEqualTo("John Doe")
    }

    @Test
    fun testGetStudentNotFound(): Unit = runBlocking {
        // Arrange
        val nonExistentId = 999
        val errorJson = "{\"message\":\"Student tidak ditemukan\"}"
        val errorBody = errorJson.toResponseBody("application/json".toMediaType())
        `when`(mockApiService.getStudent(nonExistentId))
            .thenReturn(Response.error(404, errorBody))

        // Act
        val result = studentRepository.getStudent(nonExistentId)

        // Assert
        assertThat(result).isInstanceOf(Result.Error::class.java)
    }

    // ===== UPDATE (PUT) TESTS =====

    @Test
    fun testUpdateStudentSuccess(): Unit = runBlocking {
        // Arrange
        val studentId = 1
        val request = UpdateStudentRequest(
            nisn = "1111111111",
            name = "Updated Name",
            classId = 2
        )
        val updatedStudent = createMockStudent(studentId, "Updated Name")
        val apiResponse = ApiResponse(data = updatedStudent)
        `when`(mockApiService.updateStudent(studentId, request))
            .thenReturn(Response.success(apiResponse))

        // Act
        val result = studentRepository.updateStudent(studentId, request)

        // Assert
        assertThat(result).isInstanceOf(Result.Success::class.java)
        val successResult = result as Result.Success
        assertThat(successResult.data.name).isEqualTo("Updated Name")
        verify(mockApiService).updateStudent(studentId, request)
    }

    @Test
    fun testUpdateStudentPartial(): Unit = runBlocking {
        // Arrange
        val studentId = 2
        val request = UpdateStudentRequest(
            nisn = "2222222222",
            name = "Jane Smith Updated",
            classId = null  // Not updating class
        )
        val updatedStudent = createMockStudent(2, "Jane Smith Updated")
        val apiResponse = ApiResponse(data = updatedStudent)
        `when`(mockApiService.updateStudent(studentId, request))
            .thenReturn(Response.success(apiResponse))

        // Act
        val result = studentRepository.updateStudent(studentId, request)

        // Assert
        assertThat(result).isInstanceOf(Result.Success::class.java)
        assertThat((result as Result.Success).data.name).isEqualTo("Jane Smith Updated")
    }

    @Test
    fun testUpdateStudentNotFound(): Unit = runBlocking {
        // Arrange
        val nonExistentId = 999
        val request = UpdateStudentRequest(
            nisn = "1111111111",
            name = "Test",
            classId = 1
        )
        val errorJson = "{\"message\":\"Student tidak ditemukan\"}"
        val errorBody = errorJson.toResponseBody("application/json".toMediaType())
        `when`(mockApiService.updateStudent(nonExistentId, request))
            .thenReturn(Response.error(404, errorBody))

        // Act
        val result = studentRepository.updateStudent(nonExistentId, request)

        // Assert
        assertThat(result).isInstanceOf(Result.Error::class.java)
    }

    // ===== DELETE TESTS =====

    @Test
    fun testDeleteStudentSuccess(): Unit = runBlocking {
        // Arrange
        val studentId = 1
        val apiResponse = ApiResponse<Any>(message = "Student berhasil dihapus")
        `when`(mockApiService.deleteStudent(studentId))
            .thenReturn(Response.success(apiResponse))

        // Act
        val result = studentRepository.deleteStudent(studentId)

        // Assert
        assertThat(result).isInstanceOf(Result.Success::class.java)
        verify(mockApiService).deleteStudent(studentId)
    }

    @Test
    fun testDeleteStudentNotFound(): Unit = runBlocking {
        // Arrange
        val nonExistentId = 999
        val errorJson = "{\"message\":\"Student tidak ditemukan\"}"
        val errorBody = errorJson.toResponseBody("application/json".toMediaType())
        `when`(mockApiService.deleteStudent(nonExistentId))
            .thenReturn(Response.error(404, errorBody))

        // Act
        val result = studentRepository.deleteStudent(nonExistentId)

        // Assert
        assertThat(result).isInstanceOf(Result.Error::class.java)
    }

    // ===== ATTENDANCE-RELATED TESTS =====

    @Test
    fun testGetStudentAttendanceHistorySuccess(): Unit = runBlocking {
        // Arrange
        val studentId = 1
        val startDate = "2026-02-01"
        val endDate = "2026-02-28"
        val attendanceList = listOf(
            AttendanceResource(id = 1, student = null, schedule = null, status = "present", timestamp = null, reason = null),
            AttendanceResource(id = 2, student = null, schedule = null, status = "absent", timestamp = null, reason = null),
            AttendanceResource(id = 3, student = null, schedule = null, status = "present", timestamp = null, reason = null)
        )
        val apiResponse = PaginatedResponse(data = attendanceList)
        `when`(mockApiService.getStudentAttendanceHistory(studentId, startDate, endDate))
            .thenReturn(Response.success(apiResponse))

        // Act
        val result = studentRepository.getStudentAttendanceHistory(studentId, startDate, endDate)

        // Assert
        assertThat(result).isInstanceOf(Result.Success::class.java)
        val successResult = result as Result.Success
        assertThat(successResult.data).hasSize(3)
        assertThat(successResult.data.count { it.status == "present" }).isEqualTo(2)
    }

    @Test
    fun testGetMyClassSuccess(): Unit = runBlocking {
        // Arrange
        val classData = Classes(
            id = 1,
            name = "10-A",
            major = MajorInfo(id = 1, name = "Science"),
            homeroomTeacher = TeacherInfo(id = 5, name = "Mr. Teacher"),
            studentCount = 30,
            createdAt = "2026-01-01T00:00:00Z"
        )
        val apiResponse = ApiResponse(data = classData)
        `when`(mockApiService.getMyClass()).thenReturn(Response.success(apiResponse))

        // Act
        val result = studentRepository.getMyClass()

        // Assert
        assertThat(result).isInstanceOf(Result.Success::class.java)
        val successResult = result as Result.Success
        assertThat(successResult.data.name).isEqualTo("10-A")
        assertThat(successResult.data.studentCount).isEqualTo(30)
    }

    @Test
    fun testGetMyClassSchedulesSuccess(): Unit = runBlocking {
        // Arrange
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
        val apiResponse = PaginatedResponse(data = schedules)
        `when`(mockApiService.getMyClassSchedules()).thenReturn(Response.success(apiResponse))

        // Act
        val result = studentRepository.getMyClassSchedules()

        // Assert
        assertThat(result).isInstanceOf(Result.Success::class.java)
        val successResult = result as Result.Success
        assertThat(successResult.data).hasSize(2)
        assertThat(successResult.data[0].subjectName).isEqualTo("Matematika")
    }

    // ===== IMPORT TESTS =====

    @Test
    fun testImportStudentsSuccess(): Unit = runBlocking {
        // Arrange
        val request = StudentImportRequest(
            file = "students_data.csv"
        )
        val importResponse = StudentImportResponse(
            imported = 50,
            skipped = 2,
            errors = listOf("Row 5: NISN already exists", "Row 23: Invalid email")
        )
        val apiResponse = ApiResponse(data = importResponse)
        `when`(mockApiService.importStudents(request)).thenReturn(Response.success(apiResponse))

        // Act
        val result = studentRepository.importStudents(request)

        // Assert
        assertThat(result).isInstanceOf(Result.Success::class.java)
        val successResult = result as Result.Success
        assertThat(successResult.data.imported).isEqualTo(50)
        assertThat(successResult.data.skipped).isEqualTo(2)
    }

    // ===== INTEGRATION TESTS =====

    @Test
    fun testCreateAndRetrieveStudentFlow(): Unit = runBlocking {
        // Arrange - Create
        val createRequest = StoreStudentRequest(
            nisn = "5555555555",
            name = "Integration Test Student",
            email = "integration@example.com",
            classId = 1
        )
        val createdStudent = createMockStudent(50, "Integration Test Student", "5555555555")
        `when`(mockApiService.createStudent(createRequest))
            .thenReturn(Response.success(ApiResponse(data = createdStudent)))

        // Act - Create
        val createResult = studentRepository.createStudent(createRequest)

        // Assert - Create
        assertThat(createResult).isInstanceOf(Result.Success::class.java)
        val createdId = requireNotNull((createResult as Result.Success).data.id)

        // Arrange - Retrieve
        `when`(mockApiService.getStudent(createdId))
            .thenReturn(Response.success(ApiResponse(data = createdStudent)))

        // Act - Retrieve
        val retrieveResult = studentRepository.getStudent(createdId)

        // Assert - Retrieve
        assertThat(retrieveResult).isInstanceOf(Result.Success::class.java)
        assertThat((retrieveResult as Result.Success).data.name).isEqualTo("Integration Test Student")
    }

    @Test
    fun testUpdateStudentFlow(): Unit = runBlocking {
        // Arrange
        val studentId = 1
        val originalStudent = createMockStudent(studentId)
        `when`(mockApiService.getStudent(studentId))
            .thenReturn(Response.success(ApiResponse(data = originalStudent)))

        // Act - Get original
        val originalResult = studentRepository.getStudent(studentId)
        assertThat(originalResult).isInstanceOf(Result.Success::class.java)

        // Arrange - Update
        val updateRequest = UpdateStudentRequest(
            nisn = originalStudent.nisn ?: "",
            name = "Updated Name",
            classId = 2
        )
        val updatedStudent = originalStudent.copy(
            name = "Updated Name",
            `class` = ClassInfo(id = 2, name = "Class 2")
        )
        `when`(mockApiService.updateStudent(studentId, updateRequest))
            .thenReturn(Response.success(ApiResponse(data = updatedStudent)))

        // Act - Update
        val updateResult = studentRepository.updateStudent(studentId, updateRequest)

        // Assert - Update
        assertThat(updateResult).isInstanceOf(Result.Success::class.java)
        assertThat((updateResult as Result.Success).data.name).isEqualTo("Updated Name")
    }
}
