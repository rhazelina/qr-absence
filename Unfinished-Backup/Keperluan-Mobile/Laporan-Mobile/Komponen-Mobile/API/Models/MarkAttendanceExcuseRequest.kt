package com.example.ritamesa.api.models

data class MarkAttendanceExcuseRequest(
    val status: String,
    val reason: String? = null,
    val isEarlyLeave: Boolean? = null
)