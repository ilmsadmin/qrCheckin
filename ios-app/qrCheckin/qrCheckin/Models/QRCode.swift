//
//  QRCode.swift
//  qrCheckin
//
//  Created by toan on 12/6/25.
//

import Foundation

struct QRCode: Identifiable, Codable {
    let id: String
    let code: String
    let userId: String
    let subscriptionId: String?
    let isActive: Bool
    let expiresAt: Date?
    let createdAt: Date
    let updatedAt: Date
    
    // Related data
    var user: User?
    var subscription: Subscription?
    
    var isExpired: Bool {
        guard let expiresAt = expiresAt else { return false }
        return expiresAt < Date()
    }
    
    var isValid: Bool {
        return isActive && !isExpired
    }
}