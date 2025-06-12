package com.zplus.qrcheckin.domain.usecase

import com.zplus.qrcheckin.domain.model.CheckinLog
import com.zplus.qrcheckin.domain.repository.CheckinRepository

class CheckinUseCase(
    private val checkinRepository: CheckinRepository
) {
    suspend fun checkin(qrCodeId: String, eventId: String): Result<CheckinLog> {
        return checkinRepository.checkin(qrCodeId, eventId)
    }
    
    suspend fun checkout(qrCodeId: String, eventId: String): Result<CheckinLog> {
        return checkinRepository.checkout(qrCodeId, eventId)
    }
}