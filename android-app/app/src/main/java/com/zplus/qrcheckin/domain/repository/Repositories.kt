package com.zplus.qrcheckin.domain.repository

import com.zplus.qrcheckin.domain.model.*
import kotlinx.coroutines.flow.Flow

interface CheckinRepository {
    suspend fun checkin(qrCodeId: String, eventId: String): Result<CheckinLog>
    suspend fun checkout(qrCodeId: String, eventId: String): Result<CheckinLog>
    suspend fun getCheckinLogs(userId: String? = null, eventId: String? = null): Flow<List<CheckinLog>>
    suspend fun scanQRCode(qrCode: String): Result<QRCode>
}

interface EventRepository {
    suspend fun getEvents(): Flow<List<Event>>
    suspend fun getEvent(id: String): Event?
}

interface AuthRepository {
    suspend fun login(email: String, password: String): Result<User>
    suspend fun logout()
    suspend fun getCurrentUser(): User?
    fun isLoggedIn(): Boolean
}