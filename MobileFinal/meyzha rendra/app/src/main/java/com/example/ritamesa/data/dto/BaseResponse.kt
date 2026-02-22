package com.example.ritamesa.data.dto

import com.google.gson.annotations.SerializedName

data class BaseResponse<T>(
    @SerializedName("data") val data: T?,
    @SerializedName("message") val message: String?,
    @SerializedName("meta") val meta: MetaData?,
    @SerializedName("links") val links: LinksData?
)

data class MetaData(
    @SerializedName("current_page") val currentPage: Int?,
    @SerializedName("last_page") val lastPage: Int?,
    @SerializedName("per_page") val perPage: Int?,
    @SerializedName("total") val total: Int?
)

data class LinksData(
    @SerializedName("first") val first: String?,
    @SerializedName("last") val last: String?,
    @SerializedName("prev") val prev: String?,
    @SerializedName("next") val next: String?
)
