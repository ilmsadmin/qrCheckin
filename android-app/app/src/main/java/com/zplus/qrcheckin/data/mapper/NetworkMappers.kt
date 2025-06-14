package com.zplus.qrcheckin.data.mapper

import com.zplus.qrcheckin.data.remote.dto.*
import com.zplus.qrcheckin.domain.model.*
import java.text.SimpleDateFormat
import java.util.*

private val dateFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US)

fun UserDto.toDomain(): User = User(
    id = id,
    email = email,
    username = username,
    firstName = firstName,
    lastName = lastName,
    role = try {
        when (role.uppercase()) {
            "SYSTEM_ADMIN" -> Role.SYSTEM_ADMIN
            "CLUB_ADMIN" -> Role.CLUB_ADMIN
            "CLUB_STAFF" -> Role.CLUB_STAFF
            "CUSTOMER" -> Role.CUSTOMER
            else -> Role.CUSTOMER
        }
    } catch (e: Exception) {
        Role.CUSTOMER
    },
    isActive = isActive
)

fun EventDto.toDomain(): Event = Event(
    id = id,
    name = name,
    description = description,
    startTime = startTime?.let { 
        try { dateFormat.parse(it) } catch (e: Exception) { Date() }
    } ?: Date(),
    endTime = endTime?.let { 
        try { dateFormat.parse(it) } catch (e: Exception) { Date() }
    } ?: Date(),
    location = location,
    maxCapacity = maxCapacity?.toInt() ?: 0,
    isActive = isActive ?: true,
    clubId = clubId ?: ""
)

fun CheckinLogDto.toDomain(): CheckinLog = CheckinLog(
    id = id,
    type = try {
        CheckinType.valueOf(type.uppercase())
    } catch (e: Exception) {
        CheckinType.CHECKIN
    },
    timestamp = try { 
        dateFormat.parse(timestamp) 
    } catch (e: Exception) { 
        Date() 
    } ?: Date(),
    location = location,
    notes = notes,
    userId = userId,
    eventId = eventId,
    subscriptionId = "", // Not available in new API
    qrCodeId = "", // Not available in new API
    user = user?.toDomain(),
    event = event?.toDomain()
)

fun QRCodeDto.toDomain(): QRCode = QRCode(
    id = id,
    code = qrCode,
    isActive = isActive,
    userId = "", // Not available in new API structure
    subscriptionId = "" // Not available in new API structure
)