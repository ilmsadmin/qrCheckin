package com.zplus.qrcheckin.presentation.stats

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.zplus.qrcheckin.domain.model.CheckinLog
import com.zplus.qrcheckin.domain.model.Event
import com.zplus.qrcheckin.domain.repository.CheckinRepository
import com.zplus.qrcheckin.domain.repository.EventRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

data class StatsUiState(
    val logs: List<CheckinLog> = emptyList(),
    val events: List<Event> = emptyList(),
    val eventStats: List<EventStats> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null
)

@HiltViewModel
class StatsViewModel @Inject constructor(
    private val checkinRepository: CheckinRepository,
    private val eventRepository: EventRepository
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(StatsUiState())
    val uiState: StateFlow<StatsUiState> = _uiState.asStateFlow()
    
    init {
        loadData()
    }
    
    private fun loadData() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            try {
                // Combine events and logs
                combine(
                    eventRepository.getEvents(),
                    checkinRepository.getCheckinLogs(limit = 100, offset = 0)
                ) { events, logs ->
                    val eventStats = calculateEventStats(logs, events)
                    _uiState.value = _uiState.value.copy(
                        logs = logs,
                        events = events,
                        eventStats = eventStats,
                        isLoading = false,
                        error = null
                    )
                }.collectLatest { }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = e.message ?: "Failed to load statistics"
                )
            }
        }
    }
    
    private fun calculateEventStats(logs: List<CheckinLog>, events: List<Event>): List<EventStats> {
        return events.map { event ->
            val eventLogs = logs.filter { it.eventId == event.id }
            val totalCheckins = eventLogs.count { it.type == com.zplus.qrcheckin.domain.model.CheckinType.CHECKIN }
            
            // Simple calculation for current users
            val userLogs = eventLogs.groupBy { it.userId }
                .mapValues { (_, userLogs) -> userLogs.maxByOrNull { it.timestamp } }
            val currentlyIn = userLogs.values.count { 
                it?.type == com.zplus.qrcheckin.domain.model.CheckinType.CHECKIN 
            }
            
            // Simple peak hour calculation
            val hourCounts = eventLogs.groupBy { 
                java.text.SimpleDateFormat("HH", java.util.Locale.getDefault()).format(it.timestamp)
            }
            val peakHour = hourCounts.maxByOrNull { it.value.size }?.key ?: "N/A"
            
            EventStats(
                event = event,
                totalCheckins = totalCheckins,
                currentlyIn = currentlyIn,
                peakHour = if (peakHour != "N/A") "${peakHour}:00" else "N/A"
            )
        }
    }
    
    fun refresh() {
        loadData()
    }
}