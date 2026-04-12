package com.example.ritamesa.api.repositories

import android.content.Context
import com.example.ritamesa.api.ApiClient
import com.example.ritamesa.api.ApiUtils
import com.example.ritamesa.api.Result
import com.example.ritamesa.api.models.CreateLeavePermissionRequest
import com.example.ritamesa.api.models.StudentLeavePermission
import com.example.ritamesa.api.models.UpdateLeavePermissionRequest
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

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
            transform = { permission ->
                permission
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
        val normalizedType = normalizeLeaveType(request.type)
        val normalizedRequest = request.copy(
            type = normalizedType,
            startTime = normalizeStartTime(request.startTime),
            // Full-day leave should not carry end time.
            endTime = if (normalizedType == "sakit" || normalizedType == "izin") null else request.endTime
        )

        return ApiUtils.handleApiCallWithTransform(
            call = { apiService.createLeavePermission(normalizedRequest) },
            transform = { payload ->
                payload.permission ?: throw Exception(payload.message ?: "Data kosong dari server")
            }
        )
    }

    private fun normalizeLeaveType(raw: String): String {
        return when (raw.trim().lowercase()) {
            "dispensation", "dispensasi", "dispen" -> "dispensasi"
            "sick", "sakit" -> "sakit"
            "excused", "permit", "izin" -> "izin"
            "early_leave", "leave_early", "izin_pulang" -> "izin_pulang"
            else -> raw
        }
    }

    private fun normalizeStartTime(startTime: String?): String {
        if (!startTime.isNullOrBlank()) {
            return startTime
        }

        // Backend requires HH:mm for start_time.
        return SimpleDateFormat("HH:mm", Locale.getDefault()).format(Date())
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
            transform = { payload ->
                payload.permission ?: throw Exception(payload.message ?: "Data kosong dari server")
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
            transform = { payload ->
                payload.permission ?: throw Exception(payload.message ?: "Data kosong dari server")
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
            transform = { payload ->
                payload.permission ?: throw Exception(payload.message ?: "Data kosong dari server")
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
            transform = { payload ->
                payload.permission ?: throw Exception(payload.message ?: "Data kosong dari server")
            }
        )
    }
}




//// meyzha-rendra/app/src/main/java/com/example/ritamesa/api/repositories/LeavePermissionRepository.kt
//package com.example.ritamesa.api.repositories
//
//import android.content.Context
//import com.example.ritamesa.api.ApiClient
//import com.example.ritamesa.api.ApiUtils
//import com.example.ritamesa.api.Result
//import com.example.ritamesa.api.models.CreateLeavePermissionRequest
//import com.example.ritamesa.api.models.StudentLeavePermission
//import com.example.ritamesa.api.models.UpdateLeavePermissionRequest
//
//class LeavePermissionRepository(private val context: Context) {
//
//    private val apiService get() = ApiClient.getApiService(context)
//
//    /**
//     * GET /leave-permissions
//     * Ambil daftar leave-permissions, opsional filter by status dan studentId.
//     * Jika status null → ambil semua (untuk tab filter di PersetujuanDispensasi).
//     */
//    suspend fun getLeavePermissions(
//        studentId: Int? = null,
//        status: String? = null,
//        page: Int? = null
//    ): Result<List<StudentLeavePermission>> {
//        return ApiUtils.handleApiCallWithTransform(
//            call = {
//                apiService.getLeavePermissions(
//                    studentId = studentId,
//                    status = status,
//                    page = page
//                )
//            },
//            transform = { paginated ->
//                paginated.data ?: emptyList()
//            }
//        )
//    }
//
//    /**
//     * GET /leave-permissions/{id}
//     * Ambil detail satu leave-permission berdasarkan ID.
//     */
//    suspend fun getLeavePermission(permissionId: Int): Result<StudentLeavePermission> {
//        return ApiUtils.handleApiCallWithTransform(
//            call = { apiService.getLeavePermission(permissionId) },
//            transform = { permission ->
//                permission
//            }
//        )
//    }
//
//    /**
//     * POST /leave-permissions
//     * Buat leave-permission baru.
//     */
//    suspend fun createLeavePermission(
//        request: CreateLeavePermissionRequest
//    ): Result<StudentLeavePermission> {
//        return ApiUtils.handleApiCallWithTransform(
//            call = { apiService.createLeavePermission(request) },
//            transform = { payload ->
//                payload.permission ?: throw Exception(payload.message ?: "Data kosong dari server")
//            }
//        )
//    }
//
//    /**
//     * PATCH /leave-permissions/{id}
//     * Update status dispensasi: "approved" atau "rejected".
//     * Digunakan oleh PersetujuanDispensasi dan Detail_Persetujuan_Dispensasi.
//     */
//    suspend fun updateLeavePermission(
//        permissionId: Int,
//        request: UpdateLeavePermissionRequest
//    ): Result<StudentLeavePermission> {
//        return ApiUtils.handleApiCallWithTransform(
//            call = { apiService.updateLeavePermission(permissionId, request) },
//            transform = { payload ->
//                payload.permission ?: throw Exception(payload.message ?: "Data kosong dari server")
//            }
//        )
//    }
//
//    /**
//     * POST /leave-permissions/{id}/return
//     * Tandai siswa sudah kembali dari dispensasi.
//     */
//    suspend fun markReturn(permissionId: Int): Result<StudentLeavePermission> {
//        return ApiUtils.handleApiCallWithTransform(
//            call = { apiService.markLeavePermissionReturn(permissionId) },
//            transform = { payload ->
//                payload.permission ?: throw Exception(payload.message ?: "Data kosong dari server")
//            }
//        )
//    }
//
//    /**
//     * POST /leave-permissions/{id}/mark-absent
//     * Tandai siswa tidak kembali (absen).
//     */
//    suspend fun markAbsent(permissionId: Int): Result<StudentLeavePermission> {
//        return ApiUtils.handleApiCallWithTransform(
//            call = { apiService.markLeavePermissionAbsent(permissionId) },
//            transform = { payload ->
//                payload.permission ?: throw Exception(payload.message ?: "Data kosong dari server")
//            }
//        )
//    }
//
//    /**
//     * POST /leave-permissions/{id}/cancel
//     * Batalkan dispensasi.
//     */
//    suspend fun cancelLeavePermission(permissionId: Int): Result<StudentLeavePermission> {
//        return ApiUtils.handleApiCallWithTransform(
//            call = { apiService.cancelLeavePermission(permissionId) },
//            transform = { payload ->
//                payload.permission ?: throw Exception(payload.message ?: "Data kosong dari server")
//            }
//        )
//    }
//}
//
//
//
//// v1
////package com.example.ritamesa.api.repositories
////
////import android.content.Context
////import com.example.ritamesa.api.ApiClient
////import com.example.ritamesa.api.ApiUtils
////import com.example.ritamesa.api.Result
////import com.example.ritamesa.api.models.CreateLeavePermissionRequest
////import com.example.ritamesa.api.models.StudentLeavePermission
////import com.example.ritamesa.api.models.UpdateLeavePermissionRequest
////
////class LeavePermissionRepository(private val context: Context) {
////
////    private val apiService get() = ApiClient.getApiService(context)
////
////    /**
////     * GET /leave-permissions
////     * Ambil daftar leave-permissions, opsional filter by status dan studentId.
////     * Jika status null → ambil semua (untuk tab filter di PersetujuanDispensasi).
////     */
////    suspend fun getLeavePermissions(
////        studentId: Int? = null,
////        status: String? = null,
////        page: Int? = null
////    ): Result<List<StudentLeavePermission>> {
////        return ApiUtils.handleApiCallWithTransform(
////            call = {
////                apiService.getLeavePermissions(
////                    studentId = studentId,
////                    status = status,
////                    page = page
////                )
////            },
////            transform = { paginated ->
////                paginated.data ?: emptyList()
////            }
////        )
////    }
////
////    /**
////     * GET /leave-permissions/{id}
////     * Ambil detail satu leave-permission berdasarkan ID.
////     */
////    suspend fun getLeavePermission(permissionId: Int): Result<StudentLeavePermission> {
////        return ApiUtils.handleApiCallWithTransform(
////            call = { apiService.getLeavePermission(permissionId) },
////            transform = { apiResponse ->
////                apiResponse.data ?: throw Exception("Data kosong dari server")
////            }
////        )
////    }
////
////    /**
////     * POST /leave-permissions
////     * Buat leave-permission baru.
////     */
////    suspend fun createLeavePermission(
////        request: CreateLeavePermissionRequest
////    ): Result<StudentLeavePermission> {
////        return ApiUtils.handleApiCallWithTransform(
////            call = { apiService.createLeavePermission(request) },
////            transform = { apiResponse ->
////                apiResponse.data ?: throw Exception("Data kosong dari server")
////            }
////        )
////    }
////
////    /**
////     * PATCH /leave-permissions/{id}
////     * Update status dispensasi: "approved" atau "rejected".
////     * Digunakan oleh PersetujuanDispensasi dan Detail_Persetujuan_Dispensasi.
////     */
////    suspend fun updateLeavePermission(
////        permissionId: Int,
////        request: UpdateLeavePermissionRequest
////    ): Result<StudentLeavePermission> {
////        return ApiUtils.handleApiCallWithTransform(
////            call = { apiService.updateLeavePermission(permissionId, request) },
////            transform = { apiResponse ->
////                apiResponse.data ?: throw Exception("Data kosong dari server")
////            }
////        )
////    }
////
////    /**
////     * POST /leave-permissions/{id}/return
////     * Tandai siswa sudah kembali dari dispensasi.
////     */
////    suspend fun markReturn(permissionId: Int): Result<StudentLeavePermission> {
////        return ApiUtils.handleApiCallWithTransform(
////            call = { apiService.markLeavePermissionReturn(permissionId) },
////            transform = { apiResponse ->
////                apiResponse.data ?: throw Exception("Data kosong dari server")
////            }
////        )
////    }
////
////    /**
////     * POST /leave-permissions/{id}/mark-absent
////     * Tandai siswa tidak kembali (absen).
////     */
////    suspend fun markAbsent(permissionId: Int): Result<StudentLeavePermission> {
////        return ApiUtils.handleApiCallWithTransform(
////            call = { apiService.markLeavePermissionAbsent(permissionId) },
////            transform = { apiResponse ->
////                apiResponse.data ?: throw Exception("Data kosong dari server")
////            }
////        )
////    }
////
////    /**
////     * POST /leave-permissions/{id}/cancel
////     * Batalkan dispensasi.
////     */
////    suspend fun cancelLeavePermission(permissionId: Int): Result<StudentLeavePermission> {
////        return ApiUtils.handleApiCallWithTransform(
////            call = { apiService.cancelLeavePermission(permissionId) },
////            transform = { apiResponse ->
////                apiResponse.data ?: throw Exception("Data kosong dari server")
////            }
////        )
////    }
////}