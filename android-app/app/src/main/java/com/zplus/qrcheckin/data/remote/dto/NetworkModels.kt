package com.zplus.qrcheckin.data.remote.dto

import kotlinx.serialization.Serializable

@Serializable
data class AuthResponseDto(
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
    val isActive: Boolean,
    val clubId: String? = null,
    val createdAt: String? = null,
    val updatedAt: String? = null
)

@Serializable
data class ClubDto(
    val id: String,
    val name: String,
    val description: String?,
    val isActive: Boolean,
    val createdAt: String,
    val updatedAt: String
)

@Serializable
data class EventDto(
    val id: String,
    val name: String,
    val description: String? = null,
    val startTime: String? = null, // ISO date string
    val endTime: String? = null,   // ISO date string
    val location: String? = null,
    val maxCapacity: Float? = null,
    val isActive: Boolean? = null,
    val clubId: String? = null,
    val createdAt: String? = null,
    val updatedAt: String? = null
)

@Serializable
data class CheckinLogDto(
    val id: String,
    val type: String, // "CHECKIN" or "CHECKOUT"
    val action: String? = null,
    val timestamp: String, // ISO date string
    val location: String? = null,
    val notes: String? = null,
    val userId: String,
    val eventId: String,
    val user: UserDto? = null,
    val event: EventDto? = null
)

@Serializable
data class QRCodeDto(
    val id: String,
    val qrCode: String,
    val isActive: Boolean,
    val createdAt: String? = null,
    val updatedAt: String? = null,
    val expiresAt: String? = null
)

@Serializable
data class CustomerDto(
    val id: String,
    val email: String,
    val firstName: String,
    val lastName: String,
    val phone: String? = null,
    val address: String? = null,
    val city: String? = null,
    val state: String? = null,
    val postalCode: String? = null,
    val country: String? = null,
    val dateOfBirth: String? = null,
    val gender: String? = null,
    val isActive: Boolean,
    val marketingOptIn: Boolean,
    val emergencyContactName: String? = null,
    val emergencyContactPhone: String? = null,
    val createdAt: String,
    val updatedAt: String
)

@Serializable
data class SubscriptionDto(
    val id: String,
    val name: String,
    val type: String,
    val price: Float,
    val duration: Int,
    val maxCheckins: Int? = null,
    val startDate: String,
    val endDate: String,
    val isActive: Boolean,
    val customerId: String,
    val clubId: String,
    val customer: CustomerDto? = null,
    val club: ClubDto? = null,
    val createdAt: String,
    val updatedAt: String
)

@Serializable
data class SubscriptionPackageDto(
    val id: String,
    val name: String,
    val description: String? = null,
    val price: Float,
    val discountPrice: Float? = null,
    val duration: Int,
    val maxCheckins: Int? = null,
    val features: List<String> = emptyList(),
    val isPopular: Boolean,
    val sortOrder: Int,
    val type: String,
    val isActive: Boolean,
    val club: ClubDto? = null,
    val createdAt: String,
    val updatedAt: String
)