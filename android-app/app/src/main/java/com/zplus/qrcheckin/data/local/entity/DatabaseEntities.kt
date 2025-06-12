package com.zplus.qrcheckin.data.local.entity

/**
 * Room database entities for offline storage
 * 
 * These entities would be used with Room database for local caching
 * and offline support. Each entity corresponds to a table in the local database.
 * 
 * To use these, you would need to:
 * 1. Add Room dependencies to build.gradle
 * 2. Add @Entity, @PrimaryKey annotations (androidx.room.*)
 * 3. Create DAOs (Data Access Objects)
 * 4. Create Database class with @Database annotation
 */

data class UserEntity(
    val id: String,
    val email: String,
    val username: String,
    val firstName: String,
    val lastName: String,
    val role: String,
    val isActive: Boolean
)

data class EventEntity(
    val id: String,
    val name: String,
    val description: String?,
    val startTime: Long, // Unix timestamp
    val endTime: Long,   // Unix timestamp
    val location: String?,
    val maxCapacity: Int?,
    val isActive: Boolean,
    val clubId: String
)

data class CheckinLogEntity(
    val id: String,
    val type: String, // "CHECKIN" or "CHECKOUT"
    val timestamp: Long, // Unix timestamp
    val location: String?,
    val notes: String?,
    val userId: String,
    val eventId: String,
    val subscriptionId: String,
    val qrCodeId: String
)

data class QRCodeEntity(
    val id: String,
    val code: String,
    val isActive: Boolean,
    val userId: String,
    val subscriptionId: String
)

/*
 * Example of what the Room DAOs would look like:
 
@Dao
interface CheckinLogDao {
    @Query("SELECT * FROM checkin_logs ORDER BY timestamp DESC")
    suspend fun getAllLogs(): List<CheckinLogEntity>
    
    @Query("SELECT * FROM checkin_logs WHERE userId = :userId")
    suspend fun getLogsByUser(userId: String): List<CheckinLogEntity>
    
    @Query("SELECT * FROM checkin_logs WHERE eventId = :eventId")
    suspend fun getLogsByEvent(eventId: String): List<CheckinLogEntity>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertLogs(logs: List<CheckinLogEntity>)
    
    @Query("DELETE FROM checkin_logs")
    suspend fun clearLogs()
}

@Database(
    entities = [UserEntity::class, EventEntity::class, CheckinLogEntity::class, QRCodeEntity::class],
    version = 1,
    exportSchema = false
)
abstract class QRCheckinDatabase : RoomDatabase() {
    abstract fun checkinLogDao(): CheckinLogDao
    abstract fun eventDao(): EventDao
    abstract fun userDao(): UserDao
    abstract fun qrCodeDao(): QRCodeDao
}
*/