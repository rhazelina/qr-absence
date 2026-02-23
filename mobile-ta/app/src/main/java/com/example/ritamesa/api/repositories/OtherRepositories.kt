package com.example.ritamesa.api.repositories

import android.content.Context
import com.example.ritamesa.api.ApiClient
import com.example.ritamesa.api.ApiUtils
import com.example.ritamesa.api.Result
import com.example.ritamesa.api.models.*

class LeavePermissionRepository(private val context: Context) {
    private val apiService = ApiClient.getApiService(context)

    suspend fun getLeavePermissions(studentId: Int? = null, status: String? = null, page: Int? = null): Result<List<StudentLeavePermission>> {
        return ApiUtils.handleApiCall {
            apiService.getLeavePermissions(studentId, status, page)
        }.map { response ->
            response.data ?: emptyList()
        }
    }

    suspend fun createLeavePermission(request: CreateLeavePermissionRequest): Result<StudentLeavePermission> {
        return ApiUtils.handleApiCall {
            apiService.createLeavePermission(request)
        }.map { response ->
            response.data ?: throw Exception("No leave permission data in response")
        }
    }

    suspend fun getLeavePermission(permissionId: Int): Result<StudentLeavePermission> {
        return ApiUtils.handleApiCall {
            apiService.getLeavePermission(permissionId)
        }.map { response ->
            response.data ?: throw Exception("No leave permission data in response")
        }
    }

    suspend fun updateLeavePermission(permissionId: Int, request: UpdateLeavePermissionRequest): Result<StudentLeavePermission> {
        return ApiUtils.handleApiCall {
            apiService.updateLeavePermission(permissionId, request)
        }.map { response ->
            response.data ?: throw Exception("No leave permission data in response")
        }
    }

    suspend fun markLeavePermissionReturn(permissionId: Int): Result<StudentLeavePermission> {
        return ApiUtils.handleApiCall {
            apiService.markLeavePermissionReturn(permissionId)
        }.map { response ->
            response.data ?: throw Exception("No leave permission data in response")
        }
    }

    suspend fun markLeavePermissionAbsent(permissionId: Int): Result<StudentLeavePermission> {
        return ApiUtils.handleApiCall {
            apiService.markLeavePermissionAbsent(permissionId)
        }.map { response ->
            response.data ?: throw Exception("No leave permission data in response")
        }
    }

    suspend fun cancelLeavePermission(permissionId: Int): Result<StudentLeavePermission> {
        return ApiUtils.handleApiCall {
            apiService.cancelLeavePermission(permissionId)
        }.map { response ->
            response.data ?: throw Exception("No leave permission data in response")
        }
    }

    suspend fun checkExpiredLeavePermissions(): Result<Any> {
        return ApiUtils.handleApiCall {
            apiService.checkExpiredLeavePermissions()
        }.map { response ->
            response.data ?: Any()
        }
    }

    suspend fun markMyLeavePermissionReturn(leavePermissionId: Int): Result<StudentLeavePermission> {
        return ApiUtils.handleApiCall {
            apiService.markMyLeavePermissionReturn(leavePermissionId)
        }.map { response ->
            response.data ?: throw Exception("No leave permission data in response")
        }
    }

    suspend fun markMyLeavePermissionAbsent(leavePermissionId: Int): Result<StudentLeavePermission> {
        return ApiUtils.handleApiCall {
            apiService.markMyLeavePermissionAbsent(leavePermissionId)
        }.map { response ->
            response.data ?: throw Exception("No leave permission data in response")
        }
    }
}

class QRCodeRepository(private val context: Context) {
    private val apiService = ApiClient.getApiService(context)

    suspend fun getActiveQRCode(): Result<Qrcode> {
        return ApiUtils.handleApiCall {
            apiService.getActiveQRCode()
        }.map { response ->
            response.data ?: throw Exception("No QR code data in response")
        }
    }

    suspend fun generateQRCode(request: GenerateQRCodeRequest): Result<GenerateQRCodeResponse> {
        return ApiUtils.handleApiCall {
            apiService.generateQRCode(request)
        }.map { response ->
            response.data ?: throw Exception("No QR code data in response")
        }
    }

    suspend fun generateMyClassQRToken(request: GenerateQRCodeRequest): Result<GenerateQRCodeResponse> {
        return ApiUtils.handleApiCall {
            apiService.generateMyClassQRToken(request)
        }.map { response ->
            response.data ?: throw Exception("No QR code data in response")
        }
    }

    suspend fun getQRCode(token: String): Result<Qrcode> {
        return ApiUtils.handleApiCall {
            apiService.getQRCode(token)
        }.map { response ->
            response.data ?: throw Exception("No QR code data in response")
        }
    }

    suspend fun revokeQRCode(token: String): Result<Any> {
        return ApiUtils.handleApiCall {
            apiService.revokeQRCode(token)
        }.map { response ->
            response.data ?: Any()
        }
    }
}

class AbsenceRequestRepository(private val context: Context) {
    private val apiService = ApiClient.getApiService(context)

    suspend fun getAbsenceRequests(status: String? = null, page: Int? = null): Result<List<AbsenceRequest>> {
        return ApiUtils.handleApiCall {
            apiService.getAbsenceRequests(status, page)
        }.map { response ->
            response.data ?: emptyList()
        }
    }

    suspend fun createAbsenceRequest(request: StoreAbsenceRequest): Result<AbsenceRequest> {
        return ApiUtils.handleApiCall {
            apiService.createAbsenceRequest(request)
        }.map { response ->
            response.data ?: throw Exception("No absence request data in response")
        }
    }

    suspend fun approveAbsenceRequest(absenceRequestId: Int, request: ApproveAbsenceRequest): Result<AbsenceRequest> {
        return ApiUtils.handleApiCall {
            apiService.approveAbsenceRequest(absenceRequestId, request)
        }.map { response ->
            response.data ?: throw Exception("No absence request data in response")
        }
    }

    suspend fun rejectAbsenceRequest(absenceRequestId: Int, request: RejectAbsenceRequest): Result<AbsenceRequest> {
        return ApiUtils.handleApiCall {
            apiService.rejectAbsenceRequest(absenceRequestId, request)
        }.map { response ->
            response.data ?: throw Exception("No absence request data in response")
        }
    }
}

class DashboardRepository(private val context: Context) {
    private val apiService = ApiClient.getApiService(context)

    suspend fun getStudentDashboard(): Result<StudentDashboard> {
        return ApiUtils.handleApiCall {
            apiService.getStudentDashboard()
        }.map { response ->
            response.data ?: throw Exception("No dashboard data in response")
        }
    }

    suspend fun getTeacherDashboard(): Result<TeacherDashboard> {
        return ApiUtils.handleApiCall {
            apiService.getTeacherDashboard()
        }.map { response ->
            response.data ?: throw Exception("No dashboard data in response")
        }
    }

    suspend fun getGuruDashboard(): Result<TeacherDashboard> {
        return ApiUtils.handleApiCall {
            apiService.getGuruDashboard()
        }.map { response ->
            response.data ?: throw Exception("No dashboard data in response")
        }
    }

    suspend fun getHomeroomDashboard(): Result<HomeroomDashboard> {
        return ApiUtils.handleApiCall {
            apiService.getHomeroomDashboard()
        }.map { response ->
            response.data ?: throw Exception("No dashboard data in response")
        }
    }

    suspend fun getWakaDashboard(): Result<WakaDashboard> {
        return ApiUtils.handleApiCall {
            apiService.getWakaDashboard()
        }.map { response ->
            response.data ?: throw Exception("No dashboard data in response")
        }
    }

    suspend fun getWakaAttendanceSummary(startDate: String? = null, endDate: String? = null): Result<AttendanceSummary> {
        return ApiUtils.handleApiCall {
            apiService.getWakaAttendanceSummary(startDate, endDate)
        }.map { response ->
            response.data ?: AttendanceSummary()
        }
    }

    suspend fun getAdminDashboard(): Result<AdminDashboard> {
        return ApiUtils.handleApiCall {
            apiService.getAdminDashboard()
        }.map { response ->
            response.data ?: throw Exception("No dashboard data in response")
        }
    }

    suspend fun getClassDashboard(): Result<ClassDashboard> {
        return ApiUtils.handleApiCall {
            apiService.getMyClassDashboard()
        }.map { response ->
            response.data ?: throw Exception("No dashboard data in response")
        }
    }
}

class SettingsRepository(private val context: Context) {
    private val apiService = ApiClient.getApiService(context)

    suspend fun getSettings(): Result<List<Setting>> {
        return ApiUtils.handleApiCall {
            apiService.getSettings()
        }.map { response ->
            response.data ?: emptyList()
        }
    }

    suspend fun updateSettings(request: Map<String, String>): Result<Any> {
        return ApiUtils.handleApiCall {
            apiService.updateSettings(request)
        }.map { response ->
            response.data ?: Any()
        }
    }

    suspend fun bulkUpdateSettings(request: Map<String, Map<String, String>>): Result<Any> {
        return ApiUtils.handleApiCall {
            apiService.bulkUpdateSettings(request)
        }.map { response ->
            response.data ?: Any()
        }
    }

    suspend fun syncSettings(): Result<SyncSettingsResponse> {
        return ApiUtils.handleApiCall {
            apiService.syncSettings()
        }.map { response ->
            response.data ?: SyncSettingsResponse(
                schoolName = null,
                schoolPhone = null,
                schoolEmail = null,
                schoolAddress = null,
                year = null
            )
        }
    }

    suspend fun syncAdminData(): Result<Any> {
        return ApiUtils.handleApiCall {
            apiService.syncAdminData()
        }.map { response ->
            response.data ?: Any()
        }
    }
}
