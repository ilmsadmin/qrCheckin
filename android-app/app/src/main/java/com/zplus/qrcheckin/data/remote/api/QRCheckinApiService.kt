package com.zplus.qrcheckin.data.remote.api

import com.zplus.qrcheckin.data.remote.dto.*

/**
 * GraphQL API service interface
 * This interface defines the contract for communicating with the backend GraphQL API
 * 
 * Implementation would use Apollo GraphQL client or similar
 */
interface QRCheckinApiService {
    
    // Authentication
    suspend fun login(email: String, password: String): Result<AuthResponse>
    suspend fun logout(): Result<String>
    suspend fun getCurrentUser(): Result<UserDto>
    
    // Events
    suspend fun getEvents(): Result<List<EventDto>>
    suspend fun getEvent(id: String): Result<EventDto>
    
    // Check-ins
    suspend fun checkin(qrCodeId: String, eventId: String): Result<CheckinLogDto>
    suspend fun checkout(qrCodeId: String, eventId: String): Result<CheckinLogDto>
    suspend fun getCheckinLogs(userId: String? = null, eventId: String? = null): Result<List<CheckinLogDto>>
    
    // QR Code
    suspend fun scanQRCode(code: String): Result<QRCodeDto>
}

/**
 * Configuration for the API service
 */
data class ApiConfig(
    val baseUrl: String = "http://localhost:4000/graphql", // Backend GraphQL endpoint
    val timeout: Long = 30_000L, // 30 seconds
    val enableLogging: Boolean = true
)

/**
 * API endpoints - would be used for REST API if needed
 */
object ApiEndpoints {
    const val GRAPHQL = "/graphql"
    const val LOGIN = "/auth/login"
    const val LOGOUT = "/auth/logout"
    const val EVENTS = "/events"
    const val CHECKIN = "/checkin"
    const val CHECKOUT = "/checkout"
    const val LOGS = "/logs"
}