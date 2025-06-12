package com.zplus.qrcheckin.domain.model

import java.util.Date

data class CheckinLog(
    val id: String,
    val type: CheckinType,
    val timestamp: Date,
    val location: String?,
    val notes: String?,
    val userId: String,
    val eventId: String,
    val subscriptionId: String,
    val qrCodeId: String,
    val user: User?,
    val event: Event?
)

enum class CheckinType {
    CHECKIN,
    CHECKOUT
}