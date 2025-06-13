//
//  Customer.swift
//  qrCheckin
//
//  Created by toan on 12/6/25.
//

import Foundation

struct Customer: Identifiable, Codable {
    let id: String
    let email: String
    let firstName: String
    let lastName: String
    let phone: String?
    let dateOfBirth: Date?
    let isActive: Bool
    let createdAt: Date
    let updatedAt: Date
    
    // Associated data
    var activeSubscription: Subscription?
    var qrCodes: [QRCode]?
    var checkinHistory: [CheckinLog]?
    
    var fullName: String {
        return "\(firstName) \(lastName)"
    }
    
    var displayName: String {
        return fullName.isEmpty ? email : fullName
    }
    
    var membershipStatus: String {
        guard let subscription = activeSubscription else {
            return "No Active Membership"
        }
        
        if subscription.isActive && !subscription.isExpired {
            return subscription.package?.name ?? "Active"
        } else if subscription.isExpired {
            return "Expired"
        } else {
            return "Inactive"
        }
    }
    
    var membershipStatusColor: String {
        guard let subscription = activeSubscription else {
            return "gray"
        }
        
        if subscription.isActive && !subscription.isExpired {
            return "green"
        } else {
            return "red"
        }
    }
    
    var memberSince: String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        return formatter.string(from: createdAt)
    }
}

// MARK: - Codable Extension
extension Customer {
    enum CodingKeys: String, CodingKey {
        case id
        case email
        case firstName
        case lastName
        case phone
        case dateOfBirth
        case isActive
        case createdAt
        case updatedAt
        // Don't include related objects in coding keys
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        
        id = try container.decode(String.self, forKey: .id)
        email = try container.decode(String.self, forKey: .email)
        firstName = try container.decode(String.self, forKey: .firstName)
        lastName = try container.decode(String.self, forKey: .lastName)
        phone = try container.decodeIfPresent(String.self, forKey: .phone)
        dateOfBirth = try container.decodeIfPresent(Date.self, forKey: .dateOfBirth)
        isActive = try container.decode(Bool.self, forKey: .isActive)
        createdAt = try container.decode(Date.self, forKey: .createdAt)
        updatedAt = try container.decode(Date.self, forKey: .updatedAt)
        
        // Related objects are initialized as nil
        activeSubscription = nil
        qrCodes = nil
        checkinHistory = nil
    }
    
    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        
        try container.encode(id, forKey: .id)
        try container.encode(email, forKey: .email)
        try container.encode(firstName, forKey: .firstName)
        try container.encode(lastName, forKey: .lastName)
        try container.encodeIfPresent(phone, forKey: .phone)
        try container.encodeIfPresent(dateOfBirth, forKey: .dateOfBirth)
        try container.encode(isActive, forKey: .isActive)
        try container.encode(createdAt, forKey: .createdAt)
        try container.encode(updatedAt, forKey: .updatedAt)
        // Don't encode related objects
    }
}