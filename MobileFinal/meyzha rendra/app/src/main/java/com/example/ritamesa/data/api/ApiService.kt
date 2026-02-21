package com.example.ritamesa.data.api

import com.example.ritamesa.data.dto.*
import retrofit2.Response
import retrofit2.http.*

interface ApiService {

    @POST("api/auth/login")
    suspend fun login(@Body request: LoginRequest): Response<BaseResponse<LoginResponseData>>

    @GET("api/me")
    suspend fun getProfile(): Response<BaseResponse<UserDto>>

    @GET("api/me/schedules/today")
    suspend fun getSchedules(): Response<BaseResponse<List<ScheduleDto>>>

    @POST("api/attendance/scan")
    suspend fun scanQr(@Body request: ScanRequest): Response<BaseResponse<Any>>

    @POST("api/attendance/scan-student")
    suspend fun scanStudentQr(@Body request: ScanRequest): Response<BaseResponse<Any>>

    // =========================================================================
    // STUDENTS EXTENSION
    // =========================================================================
    @GET("api/students")
    suspend fun getStudents(
        @Query("search") search: String? = null,
        @Query("major") major: String? = null,
        @Query("grade") grade: String? = null
    ): Response<BaseResponse<List<StudentDto>>>

    @POST("api/students")
    suspend fun createStudent(@Body studentDto: StudentDto): Response<BaseResponse<StudentDto>>

    @PUT("api/students/{id}")
    suspend fun updateStudent(
        @Path("id") id: String,
        @Body studentDto: StudentDto
    ): Response<BaseResponse<StudentDto>>

    @DELETE("api/students/{id}")
    suspend fun deleteStudent(@Path("id") id: String): Response<BaseResponse<Any>>

    // =========================================================================
    // TEACHERS EXTENSION
    // =========================================================================
    @GET("api/teachers")
    suspend fun getTeachers(): Response<BaseResponse<List<TeacherDto>>>

    @POST("api/teachers")
    suspend fun createTeacher(@Body teacherDto: TeacherDto): Response<BaseResponse<TeacherDto>>

    @PUT("api/teachers/{id}")
    suspend fun updateTeacher(
        @Path("id") id: String,
        @Body teacherDto: TeacherDto
    ): Response<BaseResponse<TeacherDto>>

    @DELETE("api/teachers/{id}")
    suspend fun deleteTeacher(@Path("id") id: String): Response<BaseResponse<Any>>

    // =========================================================================
    // CLASSES EXTENSION
    // =========================================================================
    @GET("api/classes")
    suspend fun getClasses(): Response<BaseResponse<List<ClassRoomDto>>>

    @POST("api/classes")
    suspend fun createClass(@Body classRoom: ClassRoomDto): Response<BaseResponse<ClassRoomDto>>

    @PUT("api/classes/{id}")
    suspend fun updateClass(
        @Path("id") id: Int,
        @Body classRoom: ClassRoomDto
    ): Response<BaseResponse<ClassRoomDto>>

    @DELETE("api/classes/{id}")
    suspend fun deleteClass(@Path("id") id: Int): Response<BaseResponse<Any>>

    // =========================================================================
    // MAJORS EXTENSION
    // =========================================================================
    @GET("api/majors")
    suspend fun getMajors(): Response<BaseResponse<List<MajorDto>>>

    @POST("api/majors")
    suspend fun createMajor(@Body majorDto: MajorDto): Response<BaseResponse<MajorDto>>

    @PUT("api/majors/{id}")
    suspend fun updateMajor(
        @Path("id") id: Int,
        @Body majorDto: MajorDto
    ): Response<BaseResponse<MajorDto>>

    @DELETE("api/majors/{id}")
    suspend fun deleteMajor(@Path("id") id: Int): Response<BaseResponse<Any>>

    // =========================================================================
    // SUBJECTS EXTENSION
    // =========================================================================
    @GET("api/subjects")
    suspend fun getSubjects(): Response<BaseResponse<List<SubjectDto>>>

    @POST("api/subjects")
    suspend fun createSubject(@Body subjectDto: SubjectDto): Response<BaseResponse<SubjectDto>>

    @PUT("api/subjects/{id}")
    suspend fun updateSubject(
        @Path("id") id: Int,
        @Body subjectDto: SubjectDto
    ): Response<BaseResponse<SubjectDto>>

    @DELETE("api/subjects/{id}")
    suspend fun deleteSubject(@Path("id") id: Int): Response<BaseResponse<Any>>
}
