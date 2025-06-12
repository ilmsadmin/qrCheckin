//
//  Subscription.swift
//  qrCheckin
//
//  Created by toan on 12/6/25.
//

import Foundation

enum SubscriptionType: String, CaseIterable, Codable {
    case daily = "DAILY"
    case weekly = "WEEKLY"
    case monthly = "MONTHLY"
    case yearly = "YEARLY"
    case eventSpecific = "EVENT_SPECIFIC"
}

// SubscriptionPackage is defined in its own file

struct Subscription: Identifiable {
    let id: String
    let userId: String
    let clubId: String
    let packageId: String
    let type: SubscriptionType
    let startDate: Date
    let endDate: Date
    let isActive: Bool
    let createdAt: Date
    let updatedAt: Date
    
    // Related data
    var user: User?
    var club: Club?
    var package: SubscriptionPackage?
    
    var isExpired: Bool {
        return endDate < Date()
    }
    
    var isValid: Bool {
        let now = Date()
        return isActive && now >= startDate && now <= endDate
    }
    
    var daysRemaining: Int {
        let days = Calendar.current.dateComponents([.day], from: Date(), to: endDate).day ?? 0
        return max(0, days)
    }
}

// MARK: - Codable Extension
extension Subscription: Codable {
    enum CodingKeys: String, CodingKey {
        case id
        case userId
        case clubId
        case packageId
        case type
        case startDate
        case endDate
        case isActive
        case createdAt
        case updatedAt
        // Don't include related objects in coding keys
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        
        id = try container.decode(String.self, forKey: .id)
        userId = try container.decode(String.self, forKey: .userId)
        clubId = try container.decode(String.self, forKey: .clubId)
        packageId = try container.decode(String.self, forKey: .packageId)
        type = try container.decode(SubscriptionType.self, forKey: .type)
        startDate = try container.decode(Date.self, forKey: .startDate)
        endDate = try container.decode(Date.self, forKey: .endDate)
        isActive = try container.decode(Bool.self, forKey: .isActive)
        createdAt = try container.decode(Date.self, forKey: .createdAt)
        updatedAt = try container.decode(Date.self, forKey: .updatedAt)
        
        // Related objects are initialized as nil
        user = nil
        club = nil
        package = nil
    }
    
    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        
        try container.encode(id, forKey: .id)
        try container.encode(userId, forKey: .userId)
        try container.encode(clubId, forKey: .clubId)
        try container.encode(packageId, forKey: .packageId)
        try container.encode(type, forKey: .type)
        try container.encode(startDate, forKey: .startDate)
        try container.encode(endDate, forKey: .endDate)
        try container.encode(isActive, forKey: .isActive)
        try container.encode(createdAt, forKey: .createdAt)
        try container.encode(updatedAt, forKey: .updatedAt)
        // Don't encode related objects
    }
}