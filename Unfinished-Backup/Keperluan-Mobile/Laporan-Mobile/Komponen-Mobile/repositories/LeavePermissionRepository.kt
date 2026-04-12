package com.example.ritamesa.api.repositories

import android.content.Context
import com.example.ritamesa.api.ApiClient
import com.example.ritamesa.api.ApiUtils
import com.example.ritamesa.api.Result
import com.example.ritamesa.api.models.CreateLeavePermissionRequest
import com.example.ritamesa.api.models.StudentLeavePermission
import com.example.ritamesa.api.models.UpdateLeavePermissionRequest

class LeavePermissionRepository(private val context: Context) {

    private val apiService get() = ApiClient.getApiService(context)

    /**
     * GET /leave-permissions
     * Ambil daftar leave-permissions, opsional filter by status dan studentId.
     * Jika status null → ambil semua (untuk tab filter di PersetujuanDispensasi).
     */
    suspend fun getLeavePermissions(
        studentId: Int? = null,
        status: String? = null,
        page: Int? = null
    ): Result<List<StudentLeavePermission>> {
        return ApiUtils.handleApiCallWithTransform(
            call = {
                apiService.getLeavePermissions(
                    studentId = studentId,
                    status = status,
                    page = page
                )
            },
            transform = { paginated ->
                paginated.data ?: emptyList()
            }
        )
    }

    /**
     * GET /leave-permissions/{id}
     * Ambil detail satu leave-permission berdasarkan ID.
     */
    suspend fun getLeavePermission(permissionId: Int): Result<StudentLeavePermission> {
        return ApiUtils.handleApiCallWithTransform(
            call = { apiService.getLeavePermission(permissionId) },
            transform = { apiResponse ->
                apiResponse.data ?: throw Exception("Data kosong dari server")
            }
        )
    }

    /**
     * POST /leave-permissions
     * Buat leave-permission baru.
     */
    suspend fun createLeavePermission(
        request: CreateLeavePermissionRequest
    ): Result<StudentLeavePermission> {
        return ApiUtils.handleApiCallWithTransform(
            call = { apiService.createLeavePermission(request) },
            transform = { apiResponse ->
                apiResponse.data ?: throw Exception("Data kosong dari server")
            }
        )
    }

    /**
     * PATCH /leave-permissions/{id}
     * Update status dispensasi: "approved" atau "rejected".
     * Digunakan oleh PersetujuanDispensasi dan Detail_Persetujuan_Dispensasi.
     */
    suspend fun updateLeavePermission(
        permissionId: Int,
        request: UpdateLeavePermissionRequest
    ): Result<StudentLeavePermission> {
        return ApiUtils.handleApiCallWithTransform(
            call = { apiService.updateLeavePermission(permissionId, request) },
            transform = { apiResponse ->
                apiResponse.data ?: throw Exception("Data kosong dari server")
            }
        )
    }

    /**
     * POST /leave-permissions/{id}/return
     * Tandai siswa sudah kembali dari dispensasi.
     */
    suspend fun markReturn(permissionId: Int): Result<StudentLeavePermission> {
        return ApiUtils.handleApiCallWithTransform(
            call = { apiService.markLeavePermissionReturn(permissionId) },
            transform = { apiResponse ->
                apiResponse.data ?: throw Exception("Data kosong dari server")
            }
        )
    }

    /**
     * POST /leave-permissions/{id}/mark-absent
     * Tandai siswa tidak kembali (absen).
     */
    suspend fun markAbsent(permissionId: Int): Result<StudentLeavePermission> {
        return ApiUtils.handleApiCallWithTransform(
            call = { apiService.markLeavePermissionAbsent(permissionId) },
            transform = { apiResponse ->
                apiResponse.data ?: throw Exception("Data kosong dari server")
            }
        )
    }

    /**
     * POST /leave-permissions/{id}/cancel
     * Batalkan dispensasi.
     */
    suspend fun cancelLeavePermission(permissionId: Int): Result<StudentLeavePermission> {
        return ApiUtils.handleApiCallWithTransform(
            call = { apiService.cancelLeavePermission(permissionId) },
            transform = { apiResponse ->
                apiResponse.data ?: throw Exception("Data kosong dari server")
            }
        )
    }
}