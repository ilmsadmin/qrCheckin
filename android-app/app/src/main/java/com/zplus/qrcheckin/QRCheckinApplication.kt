package com.zplus.qrcheckin

import android.app.Application
import dagger.hilt.android.HiltAndroidApp

/**
 * QR Check-in Application class with Hilt dependency injection
 */
@HiltAndroidApp
class QRCheckinApplication : Application() {
    
    override fun onCreate() {
        super.onCreate()
        // Initialize app-wide dependencies and configurations
    }
}