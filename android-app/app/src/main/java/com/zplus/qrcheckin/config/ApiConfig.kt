package com.zplus.qrcheckin.config

/**
 * API Configuration for QR Check-in app
 */
object ApiConfig {
    // Default to localhost for development, should be configured for production
    const val BASE_URL = "http://10.0.2.2:4000" // Android emulator localhost
    const val GRAPHQL_ENDPOINT = "/graphql"
    const val WS_ENDPOINT = "/graphql"
    
    // For physical device testing, use your machine's IP address
    // const val BASE_URL = "http://192.168.1.100:4000"
    
    // Production URL (to be configured)
    // const val BASE_URL = "https://api.qrcheckin.com"
    
    const val TIMEOUT_SECONDS = 30L
    const val CONNECT_TIMEOUT_SECONDS = 30L
    const val READ_TIMEOUT_SECONDS = 30L
    const val WRITE_TIMEOUT_SECONDS = 30L
    
    // Cache settings
    const val CACHE_SIZE = 10 * 1024 * 1024L // 10MB
    const val CACHE_MAX_AGE_SECONDS = 60 * 5 // 5 minutes
    const val CACHE_MAX_STALE_SECONDS = 60 * 60 * 24 * 7 // 1 week
}