package com.zplus.qrcheckin.presentation.scanner

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.zplus.qrcheckin.domain.model.CheckinLog
import com.zplus.qrcheckin.domain.model.Event
import com.zplus.qrcheckin.domain.repository.CheckinRepository
import com.zplus.qrcheckin.domain.repository.EventRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import kotlinx.serialization.json.Json
import kotlinx.serialization.decodeFromString
import javax.inject.Inject

data class QRScannerUiState(
    val events: List<Event> = emptyList(),
    val selectedEvent: Event? = null,
    val recentLogs: List<CheckinLog> = emptyList(),
    val scannedQRCode: String = "",
    val isLoading: Boolean = false,
    val isEventDropdownExpanded: Boolean = false,
    val statusMessage: String? = null,
    val isError: Boolean = false,
    val isConnected: Boolean = true,
    val queuedOperationsCount: Int = 0
)

@HiltViewModel
class QRScannerViewModel @Inject constructor(
    private val eventRepository: EventRepository,
    private val checkinRepository: CheckinRepositoryImpl,
    private val networkMonitor: com.zplus.qrcheckin.utils.offline.NetworkMonitor,
    private val offlineQueueManager: com.zplus.qrcheckin.utils.offline.OfflineQueueManager
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(QRScannerUiState())
    val uiState: StateFlow<QRScannerUiState> = _uiState.asStateFlow()
    
    private val json = Json { ignoreUnknownKeys = true }
    
    init {
        loadEvents()
        loadRecentLogs()
        
        // Monitor network status and offline queue
        viewModelScope.launch {
            networkMonitor.isConnected.collectLatest { isConnected ->
                _uiState.value = _uiState.value.copy(isConnected = isConnected)
                
                // Process queued operations when connected
                if (isConnected) {
                    checkinRepository.processQueuedOperations()
                }
            }
        }
        
        viewModelScope.launch {
            offlineQueueManager.queuedOperations.collectLatest { queuedOps ->
                _uiState.value = _uiState.value.copy(queuedOperationsCount = queuedOps.size)
            }
        }
    }
    
    private fun loadEvents() {
        viewModelScope.launch {
            eventRepository.getEvents().collectLatest { events ->
                _uiState.value = _uiState.value.copy(
                    events = events,
                    selectedEvent = _uiState.value.selectedEvent ?: events.firstOrNull()
                )
            }
        }
    }
    
    private fun loadRecentLogs() {
        viewModelScope.launch {
            checkinRepository.getCheckinLogs(
                limit = 10,
                offset = 0
            ).collectLatest { logs ->
                _uiState.value = _uiState.value.copy(
                    recentLogs = logs
                )
            }
        }
    }
    
    fun selectEvent(event: Event) {
        _uiState.value = _uiState.value.copy(selectedEvent = event)
    }
    
    fun setEventDropdownExpanded(expanded: Boolean) {
        _uiState.value = _uiState.value.copy(isEventDropdownExpanded = expanded)
    }
    
    fun handleQRCodeScan(qrCode: String) {
        _uiState.value = _uiState.value.copy(
            scannedQRCode = qrCode,
            statusMessage = "QR Code scanned: ${qrCode.take(20)}...",
            isError = false
        )
        
        // Clear message after 3 seconds
        viewModelScope.launch {
            kotlinx.coroutines.delay(3000)
            if (_uiState.value.statusMessage?.contains("QR Code scanned") == true) {
                _uiState.value = _uiState.value.copy(statusMessage = null)
            }
        }
    }
    
    fun processCheckin() {
        val currentState = _uiState.value
        val qrCode = currentState.scannedQRCode
        val event = currentState.selectedEvent
        
        if (qrCode.isEmpty() || event == null) {
            showError("Please scan a QR code and select an event")
            return
        }
        
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            
            try {
                val result = checkinRepository.checkin(qrCode, event.id)
                result.onSuccess { checkinLog ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        statusMessage = "Check-in successful for ${checkinLog.user?.firstName ?: "user"}",
                        isError = false,
                        scannedQRCode = ""
                    )
                    loadRecentLogs() // Refresh logs
                }.onFailure { exception ->
                    showError("Check-in failed: ${exception.message}")
                }
            } catch (e: Exception) {
                showError("Network error: ${e.message}")
            }
        }
    }
    
    fun processCheckout() {
        val currentState = _uiState.value
        val qrCode = currentState.scannedQRCode
        val event = currentState.selectedEvent
        
        if (qrCode.isEmpty() || event == null) {
            showError("Please scan a QR code and select an event")
            return
        }
        
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            
            try {
                val result = checkinRepository.checkout(qrCode, event.id)
                result.onSuccess { checkinLog ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        statusMessage = "Check-out successful for ${checkinLog.user?.firstName ?: "user"}",
                        isError = false,
                        scannedQRCode = ""
                    )
                    loadRecentLogs() // Refresh logs
                }.onFailure { exception ->
                    showError("Check-out failed: ${exception.message}")
                }
            } catch (e: Exception) {
                showError("Network error: ${e.message}")
            }
        }
    }
    
    private fun showError(message: String) {
        _uiState.value = _uiState.value.copy(
            isLoading = false,
            statusMessage = message,
            isError = true
        )
        
        // Clear error message after 5 seconds
        viewModelScope.launch {
            kotlinx.coroutines.delay(5000)
            if (_uiState.value.statusMessage == message) {
                _uiState.value = _uiState.value.copy(statusMessage = null, isError = false)
            }
        }
    }
    
    fun clearStatusMessage() {
        _uiState.value = _uiState.value.copy(statusMessage = null, isError = false)
    }
}