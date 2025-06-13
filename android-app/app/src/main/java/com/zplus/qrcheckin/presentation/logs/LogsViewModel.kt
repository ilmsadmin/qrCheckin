package com.zplus.qrcheckin.presentation.logs

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.zplus.qrcheckin.domain.model.CheckinLog
import com.zplus.qrcheckin.domain.model.CheckinType
import com.zplus.qrcheckin.domain.repository.CheckinRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.util.*
import javax.inject.Inject

data class LogsUiState(
    val logs: List<CheckinLog> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null,
    val todayCheckins: Int = 0,
    val currentlyIn: Int = 0
)

@HiltViewModel
class LogsViewModel @Inject constructor(
    private val checkinRepository: CheckinRepository
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(LogsUiState())
    val uiState: StateFlow<LogsUiState> = _uiState.asStateFlow()
    
    init {
        loadLogs()
    }
    
    fun loadLogs() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            try {
                checkinRepository.getCheckinLogs(
                    limit = 50,
                    offset = 0
                ).collectLatest { logs ->
                    val todayCheckins = logs.count { 
                        it.type == CheckinType.CHECKIN && isToday(it.timestamp)
                    }
                    
                    val currentlyIn = calculateCurrentlyIn(logs)
                    
                    _uiState.value = _uiState.value.copy(
                        logs = logs,
                        isLoading = false,
                        todayCheckins = todayCheckins,
                        currentlyIn = currentlyIn,
                        error = null
                    )
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = e.message ?: "Failed to load logs"
                )
            }
        }
    }
    
    private fun isToday(timestamp: Date): Boolean {
        val today = Calendar.getInstance()
        val logDate = Calendar.getInstance().apply { time = timestamp }
        
        return today.get(Calendar.YEAR) == logDate.get(Calendar.YEAR) &&
                today.get(Calendar.DAY_OF_YEAR) == logDate.get(Calendar.DAY_OF_YEAR)
    }
    
    private fun calculateCurrentlyIn(logs: List<CheckinLog>): Int {
        // Group logs by user and find the latest log for each user today
        val userLogs = logs.filter { isToday(it.timestamp) }
            .groupBy { it.userId }
            .mapValues { (_, userLogs) ->
                userLogs.maxByOrNull { it.timestamp }
            }
        
        // Count users whose latest log today is a check-in
        return userLogs.values.count { 
            it?.type == CheckinType.CHECKIN 
        }
    }
    
    fun refresh() {
        loadLogs()
    }
}