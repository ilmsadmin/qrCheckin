package com.zplus.qrcheckin.domain.model

data class QRCode(
    val id: String,
    val code: String,
    val isActive: Boolean,
    val userId: String,
    val subscriptionId: String
)