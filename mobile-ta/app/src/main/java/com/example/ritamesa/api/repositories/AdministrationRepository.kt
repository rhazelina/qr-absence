package com.example.ritamesa.api.repositories

import android.content.Context
import com.example.ritamesa.api.ApiClient
import com.example.ritamesa.api.ApiUtils
import com.example.ritamesa.api.Result
import com.example.ritamesa.api.models.*

class AdministrationRepository(private val context: Context) {
    private val apiService = ApiClient.getApiService(context)

    // ===== ROOM MANAGEMENT =====
    suspend fun getRooms(): Result<List<Room>> {
        return ApiUtils.handleApiCall {
            apiService.getRooms()
        }.map { response ->
            response.data ?: emptyList()
        }
    }

    suspend fun createRoom(request: CreateRoomRequest): Result<Room> {
        return ApiUtils.handleApiCall {
            apiService.createRoom(request)
        }.map { response ->
            response.data ?: throw Exception("No room data in response")
        }
    }

    suspend fun getRoom(roomId: Int): Result<Room> {
        return ApiUtils.handleApiCall {
            apiService.getRoom(roomId)
        }.map { response ->
            response.data ?: throw Exception("No room data in response")
        }
    }

    suspend fun updateRoom(roomId: Int, request: CreateRoomRequest): Result<Room> {
        return ApiUtils.handleApiCall {
            apiService.updateRoom(roomId, request)
        }.map { response ->
            response.data ?: throw Exception("No room data in response")
        }
    }

    suspend fun deleteRoom(roomId: Int): Result<Unit> {
        return ApiUtils.handleApiCall {
            apiService.deleteRoom(roomId)
        }.map { Unit }
    }

    // ===== SUBJECT MANAGEMENT =====
    suspend fun getSubjects(search: String? = null, page: Int? = null): Result<List<Subject>> {
        return ApiUtils.handleApiCall {
            apiService.getSubjects(search, page)
        }.map { response ->
            response.data ?: emptyList()
        }
    }

    suspend fun createSubject(request: CreateSubjectRequest): Result<Subject> {
        return ApiUtils.handleApiCall {
            apiService.createSubject(request)
        }.map { response ->
            response.data ?: throw Exception("No subject data in response")
        }
    }

    suspend fun getSubject(subjectId: Int): Result<Subject> {
        return ApiUtils.handleApiCall {
            apiService.getSubject(subjectId)
        }.map { response ->
            response.data ?: throw Exception("No subject data in response")
        }
    }

    suspend fun updateSubject(subjectId: Int, request: CreateSubjectRequest): Result<Subject> {
        return ApiUtils.handleApiCall {
            apiService.updateSubject(subjectId, request)
        }.map { response ->
            response.data ?: throw Exception("No subject data in response")
        }
    }

    suspend fun deleteSubject(subjectId: Int): Result<Unit> {
        return ApiUtils.handleApiCall {
            apiService.deleteSubject(subjectId)
        }.map { Unit }
    }

    // ===== TIME SLOT MANAGEMENT =====
    suspend fun getTimeSlots(): Result<List<TimeSlot>> {
        return ApiUtils.handleApiCall {
            apiService.getTimeSlots()
        }.map { response ->
            response.data ?: emptyList()
        }
    }

    suspend fun createTimeSlot(request: CreateTimeSlotRequest): Result<TimeSlot> {
        return ApiUtils.handleApiCall {
            apiService.createTimeSlot(request)
        }.map { response ->
            response.data ?: throw Exception("No time slot data in response")
        }
    }

    suspend fun getTimeSlot(timeSlotId: Int): Result<TimeSlot> {
        return ApiUtils.handleApiCall {
            apiService.getTimeSlot(timeSlotId)
        }.map { response ->
            response.data ?: throw Exception("No time slot data in response")
        }
    }

    suspend fun updateTimeSlot(timeSlotId: Int, request: CreateTimeSlotRequest): Result<TimeSlot> {
        return ApiUtils.handleApiCall {
            apiService.updateTimeSlot(timeSlotId, request)
        }.map { response ->
            response.data ?: throw Exception("No time slot data in response")
        }
    }

    suspend fun deleteTimeSlot(timeSlotId: Int): Result<Unit> {
        return ApiUtils.handleApiCall {
            apiService.deleteTimeSlot(timeSlotId)
        }.map { Unit }
    }

    // ===== MAJOR MANAGEMENT =====
    suspend fun getMajors(search: String? = null, page: Int? = null): Result<List<Major>> {
        return ApiUtils.handleApiCall {
            apiService.getMajors(search, page)
        }.map { response ->
            response.data ?: emptyList()
        }
    }

    suspend fun createMajor(request: CreateMajorRequest): Result<Major> {
        return ApiUtils.handleApiCall {
            apiService.createMajor(request)
        }.map { response ->
            response.data ?: throw Exception("No major data in response")
        }
    }

    suspend fun getMajor(majorId: Int): Result<Major> {
        return ApiUtils.handleApiCall {
            apiService.getMajor(majorId)
        }.map { response ->
            response.data ?: throw Exception("No major data in response")
        }
    }

    suspend fun updateMajor(majorId: Int, request: CreateMajorRequest): Result<Major> {
        return ApiUtils.handleApiCall {
            apiService.updateMajor(majorId, request)
        }.map { response ->
            response.data ?: throw Exception("No major data in response")
        }
    }

    suspend fun deleteMajor(majorId: Int): Result<Unit> {
        return ApiUtils.handleApiCall {
            apiService.deleteMajor(majorId)
        }.map { Unit }
    }

    // ===== SCHOOL YEAR MANAGEMENT =====
    suspend fun getSchoolYears(): Result<List<SchoolYear>> {
        return ApiUtils.handleApiCall {
            apiService.getSchoolYears()
        }.map { response ->
            response.data ?: emptyList()
        }
    }

    suspend fun createSchoolYear(request: SchoolYear): Result<SchoolYear> {
        return ApiUtils.handleApiCall {
            apiService.createSchoolYear(request)
        }.map { response ->
            response.data ?: throw Exception("No school year data in response")
        }
    }

    suspend fun getSchoolYear(schoolYearId: Int): Result<SchoolYear> {
        return ApiUtils.handleApiCall {
            apiService.getSchoolYear(schoolYearId)
        }.map { response ->
            response.data ?: throw Exception("No school year data in response")
        }
    }

    suspend fun updateSchoolYear(schoolYearId: Int, request: SchoolYear): Result<SchoolYear> {
        return ApiUtils.handleApiCall {
            apiService.updateSchoolYear(schoolYearId, request)
        }.map { response ->
            response.data ?: throw Exception("No school year data in response")
        }
    }

    suspend fun deleteSchoolYear(schoolYearId: Int): Result<Unit> {
        return ApiUtils.handleApiCall {
            apiService.deleteSchoolYear(schoolYearId)
        }.map { Unit }
    }

    // ===== SEMESTER MANAGEMENT =====
    suspend fun getSemesters(): Result<List<Semester>> {
        return ApiUtils.handleApiCall {
            apiService.getSemesters()
        }.map { response ->
            response.data ?: emptyList()
        }
    }

    suspend fun createSemester(request: Semester): Result<Semester> {
        return ApiUtils.handleApiCall {
            apiService.createSemester(request)
        }.map { response ->
            response.data ?: throw Exception("No semester data in response")
        }
    }

    suspend fun getSemester(semesterId: Int): Result<Semester> {
        return ApiUtils.handleApiCall {
            apiService.getSemester(semesterId)
        }.map { response ->
            response.data ?: throw Exception("No semester data in response")
        }
    }

    suspend fun updateSemester(semesterId: Int, request: Semester): Result<Semester> {
        return ApiUtils.handleApiCall {
            apiService.updateSemester(semesterId, request)
        }.map { response ->
            response.data ?: throw Exception("No semester data in response")
        }
    }

    suspend fun deleteSemester(semesterId: Int): Result<Unit> {
        return ApiUtils.handleApiCall {
            apiService.deleteSemester(semesterId)
        }.map { Unit }
    }

    // ===== DEVICE MANAGEMENT =====
    suspend fun registerDevice(request: RegisterDeviceRequest): Result<Device> {
        return ApiUtils.handleApiCall {
            apiService.registerDevice(request)
        }.map { response ->
            response.data ?: throw Exception("No device data in response")
        }
    }

    suspend fun registerMyDevice(request: RegisterDeviceRequest): Result<Device> {
        return ApiUtils.handleApiCall {
            apiService.registerMyDevice(request)
        }.map { response ->
            response.data ?: throw Exception("No device data in response")
        }
    }

    suspend fun deleteMyDevice(deviceId: Int): Result<Unit> {
        return ApiUtils.handleApiCall {
            apiService.deleteMyDevice(deviceId)
        }.map { Unit }
    }

    // ===== NOTIFICATIONS =====
    suspend fun getMobileNotifications(page: Int? = null): Result<List<MobileNotification>> {
        return ApiUtils.handleApiCall {
            apiService.getMobileNotifications(page)
        }.map { response ->
            response.data ?: emptyList()
        }
    }

    suspend fun getMyNotifications(page: Int? = null): Result<List<MobileNotification>> {
        return ApiUtils.handleApiCall {
            apiService.getMyNotifications(page)
        }.map { response ->
            response.data ?: emptyList()
        }
    }
}
