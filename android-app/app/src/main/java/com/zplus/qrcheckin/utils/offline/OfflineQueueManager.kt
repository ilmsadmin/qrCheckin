package com.zplus.qrcheckin.utils.offline

import android.content.Context
import android.content.SharedPreferences
import com.zplus.qrcheckin.domain.model.CheckinType
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import kotlinx.serialization.encodeToString
import kotlinx.serialization.decodeFromString
import java.util.*
import javax.inject.Inject
import javax.inject.Singleton

@Serializable
data class QueuedOperation(
    val id: String = UUID.randomUUID().toString(),
    val qrCode: String,
    val eventId: String,
    val type: String, // CHECKIN or CHECKOUT
    val timestamp: Long = System.currentTimeMillis(),
    val retryCount: Int = 0
)

/**
 * Manages offline queue for check-in/check-out operations
 */
@Singleton
class OfflineQueueManager @Inject constructor(
    @ApplicationContext private val context: Context
) {
    
    private val prefs: SharedPreferences by lazy {
        context.getSharedPreferences("offline_queue", Context.MODE_PRIVATE)
    }
    
    private val json = Json { ignoreUnknownKeys = true }
    
    private val _queuedOperations = MutableStateFlow<List<QueuedOperation>>(emptyList())
    val queuedOperations: StateFlow<List<QueuedOperation>> = _queuedOperations.asStateFlow()
    
    private val _hasQueuedOperations = MutableStateFlow(false)
    val hasQueuedOperations: StateFlow<Boolean> = _hasQueuedOperations.asStateFlow()
    
    init {
        loadQueue()
    }
    
    /**
     * Add an operation to the offline queue
     */
    fun queueOperation(qrCode: String, eventId: String, type: CheckinType) {
        val operation = QueuedOperation(
            qrCode = qrCode,
            eventId = eventId,
            type = type.name
        )
        
        val currentQueue = _queuedOperations.value.toMutableList()
        currentQueue.add(operation)
        
        saveQueue(currentQueue)
        _queuedOperations.value = currentQueue
        _hasQueuedOperations.value = currentQueue.isNotEmpty()
    }
    
    /**
     * Remove an operation from the queue (after successful sync)
     */
    fun removeOperation(operationId: String) {
        val currentQueue = _queuedOperations.value.toMutableList()
        currentQueue.removeAll { it.id == operationId }
        
        saveQueue(currentQueue)
        _queuedOperations.value = currentQueue
        _hasQueuedOperations.value = currentQueue.isNotEmpty()
    }
    
    /**
     * Increment retry count for an operation
     */
    fun incrementRetryCount(operationId: String) {
        val currentQueue = _queuedOperations.value.toMutableList()
        val index = currentQueue.indexOfFirst { it.id == operationId }
        
        if (index != -1) {
            currentQueue[index] = currentQueue[index].copy(
                retryCount = currentQueue[index].retryCount + 1
            )
            
            // Remove operation if retry count exceeds limit
            if (currentQueue[index].retryCount >= MAX_RETRY_COUNT) {
                currentQueue.removeAt(index)
            }
            
            saveQueue(currentQueue)
            _queuedOperations.value = currentQueue
            _hasQueuedOperations.value = currentQueue.isNotEmpty()
        }
    }
    
    /**
     * Get all queued operations
     */
    fun getQueuedOperations(): List<QueuedOperation> {
        return _queuedOperations.value
    }
    
    /**
     * Clear all queued operations
     */
    fun clearQueue() {
        prefs.edit().remove(QUEUE_KEY).apply()
        _queuedOperations.value = emptyList()
        _hasQueuedOperations.value = false
    }
    
    private fun loadQueue() {
        val queueJson = prefs.getString(QUEUE_KEY, null)
        if (queueJson != null) {
            try {
                val operations = json.decodeFromString<List<QueuedOperation>>(queueJson)
                _queuedOperations.value = operations
                _hasQueuedOperations.value = operations.isNotEmpty()
            } catch (e: Exception) {
                // Clear corrupted queue
                clearQueue()
            }
        }
    }
    
    private fun saveQueue(operations: List<QueuedOperation>) {
        val queueJson = json.encodeToString(operations)
        prefs.edit().putString(QUEUE_KEY, queueJson).apply()
    }
    
    companion object {
        private const val QUEUE_KEY = "queued_operations"
        private const val MAX_RETRY_COUNT = 3
    }
}