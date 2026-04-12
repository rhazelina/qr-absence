// meyzha-rendra/app/src/main/java/com/example/ritamesa/api/repositories/OtherRepositories.kt
package com.example.ritamesa.api.repositories

import android.content.Context
import com.example.ritamesa.api.ApiClient
import com.example.ritamesa.api.ApiUtils
import com.example.ritamesa.api.Result
import com.example.ritamesa.api.models.*

class AbsenceRequestRepository(private val context: Context) {
    private val apiService = ApiClient.getApiService(context)

    suspend fun getAbsenceRequests(status: String? = null, page: Int? = null): Result<List<AbsenceRequest>> {
        return ApiUtils.handleApiCall {
            apiService.getAbsenceRequests(status, page)
        }.map { response -> response.data ?: emptyList() }
    }

    suspend fun createAbsenceRequest(request: StoreAbsenceRequest): Result<AbsenceRequest> {
        return ApiUtils.handleApiCall {
            apiService.createAbsenceRequest(request)
        }.map { response -> response.request ?: throw Exception(response.message ?: "No absence request data in response") }
    }

    suspend fun approveAbsenceRequest(absenceRequestId: Int, request: ApproveAbsenceRequest): Result<AbsenceRequest> {
        return ApiUtils.handleApiCall {
            apiService.approveAbsenceRequest(absenceRequestId, request)
        }.map { response -> response.request ?: throw Exception(response.message ?: "No absence request data in response") }
    }

    suspend fun rejectAbsenceRequest(absenceRequestId: Int, request: RejectAbsenceRequest): Result<AbsenceRequest> {
        return ApiUtils.handleApiCall {
            apiService.rejectAbsenceRequest(absenceRequestId, request)
        }.map { response -> response.request ?: throw Exception(response.message ?: "No absence request data in response") }
    }
}

class SettingsRepository(private val context: Context) {
    private val apiService = ApiClient.getApiService(context)

    suspend fun getSettings(): Result<Map<String, String>> {
        return ApiUtils.handleApiCall {
            apiService.getSettings()
        }.map { response -> response.data ?: emptyMap() }
    }

    suspend fun updateSettings(request: Map<String, String>): Result<Any> {
        return ApiUtils.handleApiCall {
            apiService.updateSettings(request)
        }.map { response -> response.data ?: response.message ?: Any() }
    }

    suspend fun bulkUpdateSettings(request: Map<String, Map<String, String>>): Result<Any> {
        return ApiUtils.handleApiCall {
            apiService.bulkUpdateSettings(request)
        }.map { response -> response.data ?: response.message ?: Any() }
    }

    suspend fun syncSettings(): Result<SyncSettingsResponse> {
        return ApiUtils.handleApiCall {
            apiService.syncSettings()
        }.map { response ->
            SyncSettingsResponse(
                schoolName = response.settings?.get("school_name"),
                schoolPhone = response.settings?.get("school_phone"),
                schoolEmail = response.settings?.get("school_email"),
                schoolAddress = response.settings?.get("school_address"),
                year = response.schoolYear?.year
            )
        }
    }

    suspend fun syncAdminData(): Result<Any> {
        return ApiUtils.handleApiCall {
            apiService.syncAdminData()
        }.map { response -> response }
    }
}



// v1
//package com.example.ritamesa.api.repositories
//
//import android.content.Context
//import com.example.ritamesa.api.ApiClient
//import com.example.ritamesa.api.ApiUtils
//import com.example.ritamesa.api.Result
//import com.example.ritamesa.api.models.*
//
//class AbsenceRequestRepository(private val context: Context) {
//    private val apiService = ApiClient.getApiService(context)
//
//    suspend fun getAbsenceRequests(status: String? = null, page: Int? = null): Result<List<AbsenceRequest>> {
//        return ApiUtils.handleApiCall {
//            apiService.getAbsenceRequests(status, page)
//        }.map { response -> response.data ?: emptyList() }
//    }
//
//    suspend fun createAbsenceRequest(request: StoreAbsenceRequest): Result<AbsenceRequest> {
//        return ApiUtils.handleApiCall {
//            apiService.createAbsenceRequest(request)
//        }.map { response -> response.data ?: throw Exception("No absence request data in response") }
//    }
//
//    suspend fun approveAbsenceRequest(absenceRequestId: Int, request: ApproveAbsenceRequest): Result<AbsenceRequest> {
//        return ApiUtils.handleApiCall {
//            apiService.approveAbsenceRequest(absenceRequestId, request)
//        }.map { response -> response.data ?: throw Exception("No absence request data in response") }
//    }
//
//    suspend fun rejectAbsenceRequest(absenceRequestId: Int, request: RejectAbsenceRequest): Result<AbsenceRequest> {
//        return ApiUtils.handleApiCall {
//            apiService.rejectAbsenceRequest(absenceRequestId, request)
//        }.map { response -> response.data ?: throw Exception("No absence request data in response") }
//    }
//}
//
//class SettingsRepository(private val context: Context) {
//    private val apiService = ApiClient.getApiService(context)
//
//    suspend fun getSettings(): Result<List<Setting>> {
//        return ApiUtils.handleApiCall {
//            apiService.getSettings()
//        }.map { response -> response.data ?: emptyList() }
//    }
//
//    suspend fun updateSettings(request: Map<String, String>): Result<Any> {
//        return ApiUtils.handleApiCall {
//            apiService.updateSettings(request)
//        }.map { response -> response.data ?: Any() }
//    }
//
//    suspend fun bulkUpdateSettings(request: Map<String, Map<String, String>>): Result<Any> {
//        return ApiUtils.handleApiCall {
//            apiService.bulkUpdateSettings(request)
//        }.map { response -> response.data ?: Any() }
//    }
//
//    suspend fun syncSettings(): Result<SyncSettingsResponse> {
//        return ApiUtils.handleApiCall {
//            apiService.syncSettings()
//        }.map { response ->
//            response.data ?: SyncSettingsResponse(null, null, null, null, null)
//        }
//    }
//
//    suspend fun syncAdminData(): Result<Any> {
//        return ApiUtils.handleApiCall {
//            apiService.syncAdminData()
//        }.map { response -> response.data ?: Any() }
//    }
//}