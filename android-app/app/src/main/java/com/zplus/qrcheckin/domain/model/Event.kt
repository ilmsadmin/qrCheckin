package com.zplus.qrcheckin.domain.model

import java.util.Date

data class Event(
    val id: String,
    val name: String,
    val description: String?,
    val startTime: Date,
    val endTime: Date,
    val location: String?,
    val maxCapacity: Int?,
    val isActive: Boolean,
    val clubId: String
)