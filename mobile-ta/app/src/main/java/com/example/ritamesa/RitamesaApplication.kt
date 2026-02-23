package com.example.ritamesa

import android.app.Application
import com.example.ritamesa.api.ApiClient

class RitamesaApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        // Initialize API Client
        ApiClient.initialize(this)
    }
}
