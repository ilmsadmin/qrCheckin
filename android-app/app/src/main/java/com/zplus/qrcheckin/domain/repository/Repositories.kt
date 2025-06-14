package com.zplus.qrcheckin.domain.repository

import com.zplus.qrcheckin.domain.model.*
import kotlinx.coroutines.flow.Flow

interface CheckinRepository {
    suspend fun checkin(qrCodeId: String, eventId: String): Result<CheckinLog>
    suspend fun checkout(qrCodeId: String, eventId: String): Result<CheckinLog>
    suspend fun getCheckinLogs(
        userId: String? = null,
        eventId: String? = null,
        clubId: String? = null,
        customerId: String? = null,
        limit: Int? = null,
        offset: Int? = null
    ): Flow<List<CheckinLog>>
    suspend fun generateUserQRCode(userId: String): Result<QRCode>
}

interface EventRepository {
    suspend fun getEvents(): Flow<List<Event>>
    suspend fun getEvent(id: String): Result<Event>
}

interface AuthRepository {
    suspend fun login(email: String, password: String): Result<User>
    suspend fun logout(): Result<String>
    suspend fun getCurrentUser(): Result<User>
    suspend fun register(
        email: String,
        password: String,
        firstName: String,
        lastName: String,
        username: String
    ): Result<User>
    fun isLoggedIn(): Boolean
    fun getStoredUserInfo(): User?
}