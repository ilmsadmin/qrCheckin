package com.zplus.qrcheckin.data.repository

import com.zplus.qrcheckin.data.mapper.toDomain
import com.zplus.qrcheckin.data.remote.api.QRCheckinApiService
import com.zplus.qrcheckin.domain.model.CheckinLog
import com.zplus.qrcheckin.domain.model.QRCode
import com.zplus.qrcheckin.domain.repository.CheckinRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Implementation of CheckinRepository with GraphQL API integration
 */
@Singleton
class CheckinRepositoryImpl @Inject constructor(
    private val apiService: QRCheckinApiService
) : CheckinRepository {
    
    override suspend fun checkin(qrCodeId: String, eventId: String): Result<CheckinLog> {
        return try {
            val result = apiService.checkin(qrCodeId, eventId)
            result.map { dto -> dto.toDomain() }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun checkout(qrCodeId: String, eventId: String): Result<CheckinLog> {
        return try {
            val result = apiService.checkout(qrCodeId, eventId)
            result.map { dto -> dto.toDomain() }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun getCheckinLogs(
        userId: String?,
        eventId: String?,
        clubId: String?,
        customerId: String?,
        limit: Int?,
        offset: Int?
    ): Flow<List<CheckinLog>> {
        return flow {
            try {
                val result = apiService.getCheckinLogs(clubId, customerId, eventId, limit, offset)
                result.onSuccess { dtos ->
                    val logs = dtos.map { it.toDomain() }
                    emit(logs)
                }.onFailure { 
                    // Fallback to empty list on error
                    emit(emptyList())
                }
            } catch (e: Exception) {
                // Emit empty list on exception
                emit(emptyList())
            }
        }
    }
    
    override suspend fun generateUserQRCode(userId: String): Result<QRCode> {
        return try {
            val result = apiService.generateUserQRCode(userId)
            result.map { dto -> dto.toDomain() }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}