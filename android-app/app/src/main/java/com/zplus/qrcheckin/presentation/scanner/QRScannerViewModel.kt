package com.zplus.qrcheckin.presentation.scanner

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.zplus.qrcheckin.domain.model.CheckinLog
import com.zplus.qrcheckin.domain.model.Event
import com.zplus.qrcheckin.domain.usecase.CheckinUseCase
import com.zplus.qrcheckin.domain.usecase.GetEventsUseCase
import com.zplus.qrcheckin.domain.repository.CheckinRepository
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class QRScannerUiState(
    val events: List<Event> = emptyList(),
    val selectedEvent: Event? = null,
    val recentLogs: List<CheckinLog> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null,
    val lastScannedQRCode: String? = null
)

class QRScannerViewModel(
    private val getEventsUseCase: GetEventsUseCase,
    private val checkinUseCase: CheckinUseCase,
    private val checkinRepository: CheckinRepository
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(QRScannerUiState())
    val uiState: StateFlow<QRScannerUiState> = _uiState.asStateFlow()
    
    init {
        loadEvents()
        loadRecentLogs()
    }
    
    private fun loadEvents() {
        viewModelScope.launch {
            try {
                getEventsUseCase().collect { events ->
                    _uiState.value = _uiState.value.copy(
                        events = events,
                        selectedEvent = _uiState.value.selectedEvent ?: events.firstOrNull()
                    )
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    error = e.message ?: "Failed to load events"
                )
            }
        }
    }
    
    private fun loadRecentLogs() {
        viewModelScope.launch {
            try {
                checkinRepository.getCheckinLogs().collect { logs ->
                    _uiState.value = _uiState.value.copy(
                        recentLogs = logs.take(10) // Show last 10 logs
                    )
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    error = e.message ?: "Failed to load recent logs"
                )
            }
        }
    }
    
    fun selectEvent(event: Event) {
        _uiState.value = _uiState.value.copy(selectedEvent = event)
    }
    
    fun onQRCodeScanned(qrCode: String) {
        _uiState.value = _uiState.value.copy(lastScannedQRCode = qrCode)
    }
    
    fun checkin() {
        val state = _uiState.value
        val qrCode = state.lastScannedQRCode
        val eventId = state.selectedEvent?.id
        
        if (qrCode != null && eventId != null) {
            viewModelScope.launch {
                _uiState.value = _uiState.value.copy(isLoading = true, error = null)
                
                checkinUseCase.checkin(qrCode, eventId).fold(
                    onSuccess = { log ->
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            lastScannedQRCode = null // Clear after successful checkin
                        )
                        // Refresh recent logs
                        loadRecentLogs()
                    },
                    onFailure = { error ->
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            error = error.message ?: "Checkin failed"
                        )
                    }
                )
            }
        } else {
            _uiState.value = _uiState.value.copy(
                error = "Please scan a QR code and select an event"
            )
        }
    }
    
    fun checkout() {
        val state = _uiState.value
        val qrCode = state.lastScannedQRCode
        val eventId = state.selectedEvent?.id
        
        if (qrCode != null && eventId != null) {
            viewModelScope.launch {
                _uiState.value = _uiState.value.copy(isLoading = true, error = null)
                
                checkinUseCase.checkout(qrCode, eventId).fold(
                    onSuccess = { log ->
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            lastScannedQRCode = null // Clear after successful checkout
                        )
                        // Refresh recent logs
                        loadRecentLogs()
                    },
                    onFailure = { error ->
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            error = error.message ?: "Checkout failed"
                        )
                    }
                )
            }
        } else {
            _uiState.value = _uiState.value.copy(
                error = "Please scan a QR code and select an event"
            )
        }
    }
    
    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
    }
}