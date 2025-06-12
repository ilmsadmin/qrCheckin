package com.zplus.qrcheckin.data.remote.dto

import kotlinx.serialization.Serializable

@Serializable
data class AuthResponse(
    val accessToken: String,
    val user: UserDto
)

@Serializable
data class UserDto(
    val id: String,
    val email: String,
    val username: String,
    val firstName: String,
    val lastName: String,
    val role: String,
    val isActive: Boolean
)

@Serializable
data class EventDto(
    val id: String,
    val name: String,
    val description: String?,
    val startTime: String, // ISO date string
    val endTime: String,   // ISO date string
    val location: String?,
    val maxCapacity: Int?,
    val isActive: Boolean,
    val clubId: String
)

@Serializable
data class CheckinLogDto(
    val id: String,
    val type: String, // "CHECKIN" or "CHECKOUT"
    val timestamp: String, // ISO date string
    val location: String?,
    val notes: String?,
    val userId: String,
    val eventId: String,
    val subscriptionId: String,
    val qrCodeId: String,
    val user: UserDto?,
    val event: EventDto?
)

@Serializable
data class QRCodeDto(
    val id: String,
    val code: String,
    val isActive: Boolean,
    val userId: String,
    val subscriptionId: String
)