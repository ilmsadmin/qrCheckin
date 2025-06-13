package com.zplus.qrcheckin.data.repository

import com.zplus.qrcheckin.data.remote.api.QRCheckinApiService
import com.zplus.qrcheckin.domain.repository.EventRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.serialization.json.Json
import kotlinx.serialization.decodeFromString
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Implementation of EventRepository with GraphQL API integration
 */
@Singleton
class EventRepositoryImpl @Inject constructor(
    private val apiService: QRCheckinApiService
) : EventRepository {
    
    private val json = Json { ignoreUnknownKeys = true }
    
    override suspend fun getEvents(): Flow<List<com.zplus.qrcheckin.domain.model.Event>> {
        return flow {
            try {
                val result = apiService.getEvents()
                result.onSuccess { eventsJson ->
                    try {
                        // Backend returns JSON string, need to parse it
                        val eventDtos = json.decodeFromString<List<com.zplus.qrcheckin.data.remote.dto.EventDto>>(eventsJson)
                        val events = eventDtos.map { dto ->
                            com.zplus.qrcheckin.domain.model.Event(
                                id = dto.id,
                                name = dto.name,
                                description = dto.description,
                                startTime = dto.startTime?.let { java.util.Date() } ?: java.util.Date(), // Parse ISO string in real implementation
                                endTime = dto.endTime?.let { java.util.Date() } ?: java.util.Date(),
                                location = dto.location,
                                maxCapacity = dto.maxCapacity?.toInt() ?: 0,
                                isActive = dto.isActive ?: true,
                                clubId = dto.clubId ?: ""
                            )
                        }
                        emit(events)
                    } catch (e: Exception) {
                        // If JSON parsing fails, emit empty list
                        emit(emptyList())
                    }
                }.onFailure {
                    emit(emptyList())
                }
            } catch (e: Exception) {
                emit(emptyList())
            }
        }
    }
    
    override suspend fun getEvent(id: String): Result<com.zplus.qrcheckin.domain.model.Event> {
        return try {
            val result = apiService.getEvent(id)
            result.map { eventJson ->
                // Parse JSON string response
                val dto = json.decodeFromString<com.zplus.qrcheckin.data.remote.dto.EventDto>(eventJson)
                com.zplus.qrcheckin.domain.model.Event(
                    id = dto.id,
                    name = dto.name,
                    description = dto.description,
                    startTime = dto.startTime?.let { java.util.Date() } ?: java.util.Date(),
                    endTime = dto.endTime?.let { java.util.Date() } ?: java.util.Date(),
                    location = dto.location,
                    maxCapacity = dto.maxCapacity?.toInt() ?: 0,
                    isActive = dto.isActive ?: true,
                    clubId = dto.clubId ?: ""
                )
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}