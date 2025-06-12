package com.zplus.qrcheckin.domain.usecase

import com.zplus.qrcheckin.domain.model.Event
import com.zplus.qrcheckin.domain.repository.EventRepository
import kotlinx.coroutines.flow.Flow

class GetEventsUseCase(
    private val eventRepository: EventRepository
) {
    suspend operator fun invoke(): Flow<List<Event>> {
        return eventRepository.getEvents()
    }
}