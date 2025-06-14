package com.zplus.qrcheckin.data.repository

import com.zplus.qrcheckin.data.mapper.toDomain
import com.zplus.qrcheckin.data.remote.api.QRCheckinApiService
import com.zplus.qrcheckin.domain.model.CheckinLog
import com.zplus.qrcheckin.domain.model.CheckinType
import com.zplus.qrcheckin.domain.model.QRCode
import com.zplus.qrcheckin.domain.repository.CheckinRepository
import com.zplus.qrcheckin.utils.offline.NetworkMonitor
import com.zplus.qrcheckin.utils.offline.OfflineQueueManager
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Implementation of CheckinRepository with GraphQL API integration and offline support
 */
@Singleton
class CheckinRepositoryImpl @Inject constructor(
    private val apiService: QRCheckinApiService,
    private val networkMonitor: NetworkMonitor,
    private val offlineQueueManager: OfflineQueueManager
) : CheckinRepository {
    
    override suspend fun checkin(qrCodeId: String, eventId: String): Result<CheckinLog> {
        return if (networkMonitor.isConnectedNow()) {
            try {
                val result = apiService.checkin(qrCodeId, eventId)
                result.map { dto -> dto.toDomain() }
            } catch (e: Exception) {
                // Queue for offline processing
                offlineQueueManager.queueOperation(qrCodeId, eventId, CheckinType.CHECKIN)
                Result.failure(Exception("Queued for offline sync: ${e.message}"))
            }
        } else {
            // Queue for offline processing
            offlineQueueManager.queueOperation(qrCodeId, eventId, CheckinType.CHECKIN)
            Result.failure(Exception("No internet connection. Operation queued for sync."))
        }
    }
    
    override suspend fun checkout(qrCodeId: String, eventId: String): Result<CheckinLog> {
        return if (networkMonitor.isConnectedNow()) {
            try {
                val result = apiService.checkout(qrCodeId, eventId)
                result.map { dto -> dto.toDomain() }
            } catch (e: Exception) {
                // Queue for offline processing
                offlineQueueManager.queueOperation(qrCodeId, eventId, CheckinType.CHECKOUT)
                Result.failure(Exception("Queued for offline sync: ${e.message}"))
            }
        } else {
            // Queue for offline processing
            offlineQueueManager.queueOperation(qrCodeId, eventId, CheckinType.CHECKOUT)
            Result.failure(Exception("No internet connection. Operation queued for sync."))
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
    
    /**
     * Process queued operations when network is available
     */
    suspend fun processQueuedOperations() {
        if (!networkMonitor.isConnectedNow()) return
        
        val queuedOps = offlineQueueManager.getQueuedOperations()
        
        queuedOps.forEach { operation ->
            try {
                val result = when (operation.type) {
                    "CHECKIN" -> apiService.checkin(operation.qrCode, operation.eventId)
                    "CHECKOUT" -> apiService.checkout(operation.qrCode, operation.eventId)
                    else -> return@forEach
                }
                
                result.onSuccess {
                    // Operation successful, remove from queue
                    offlineQueueManager.removeOperation(operation.id)
                }.onFailure {
                    // Operation failed, increment retry count
                    offlineQueueManager.incrementRetryCount(operation.id)
                }
            } catch (e: Exception) {
                // Network error, increment retry count
                offlineQueueManager.incrementRetryCount(operation.id)
            }
        }
    }
}