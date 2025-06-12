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
    role = Role.valueOf(role),
    isActive = isActive
)

fun EventDto.toDomain(): Event = Event(
    id = id,
    name = name,
    description = description,
    startTime = dateFormat.parse(startTime) ?: Date(),
    endTime = dateFormat.parse(endTime) ?: Date(),
    location = location,
    maxCapacity = maxCapacity,
    isActive = isActive,
    clubId = clubId
)

fun CheckinLogDto.toDomain(): CheckinLog = CheckinLog(
    id = id,
    type = CheckinType.valueOf(type),
    timestamp = dateFormat.parse(timestamp) ?: Date(),
    location = location,
    notes = notes,
    userId = userId,
    eventId = eventId,
    subscriptionId = subscriptionId,
    qrCodeId = qrCodeId,
    user = user?.toDomain(),
    event = event?.toDomain()
)

fun QRCodeDto.toDomain(): QRCode = QRCode(
    id = id,
    code = code,
    isActive = isActive,
    userId = userId,
    subscriptionId = subscriptionId
)