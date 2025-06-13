//
//  User.swift
//  qrCheckin
//
//  Created by toan on 12/6/25.
//

import Foundation

enum UserRole: String, CaseIterable, Codable {
    case admin = "ADMIN"
    case staff = "STAFF"
    case user = "USER"
    case customer = "CUSTOMER"
    
    var isStaff: Bool {
        return self == .admin || self == .staff
    }
    
    var isCustomer: Bool {
        return self == .customer || self == .user
    }
}

struct User: Identifiable, Codable {
    let id: String
    let email: String
    let username: String
    let firstName: String?
    let lastName: String?
    let role: UserRole
    let isActive: Bool
    let createdAt: Date
    let updatedAt: Date
    
    // Customer-specific properties (only populated for customer users)
    let phone: String?
    let dateOfBirth: Date?
    
    // Associated data for customers
    var activeSubscription: Subscription?
    var qrCode: String?
    
    var fullName: String {
        let first = firstName ?? ""
        let last = lastName ?? ""
        return "\(first) \(last)".trimmingCharacters(in: .whitespaces)
    }
    
    var displayName: String {
        return fullName.isEmpty ? username : fullName
    }
    
    var membershipStatus: String {
        guard role.isCustomer else { return "" }
        
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
    
    var hasActiveSubscription: Bool {
        guard let subscription = activeSubscription else { return false }
        return subscription.isActive && !subscription.isExpired
    }
}

// MARK: - Codable Extension
extension User {
    enum CodingKeys: String, CodingKey {
        case id, email, username, firstName, lastName, role, isActive, createdAt, updatedAt
        case phone, dateOfBirth, activeSubscription, qrCode
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        
        id = try container.decode(String.self, forKey: .id)
        email = try container.decode(String.self, forKey: .email)
        username = try container.decode(String.self, forKey: .username)
        firstName = try container.decodeIfPresent(String.self, forKey: .firstName)
        lastName = try container.decodeIfPresent(String.self, forKey: .lastName)
        role = try container.decode(UserRole.self, forKey: .role)
        isActive = try container.decode(Bool.self, forKey: .isActive)
        createdAt = try container.decode(Date.self, forKey: .createdAt)
        updatedAt = try container.decode(Date.self, forKey: .updatedAt)
        
        // Customer-specific fields
        phone = try container.decodeIfPresent(String.self, forKey: .phone)
        dateOfBirth = try container.decodeIfPresent(Date.self, forKey: .dateOfBirth)
        
        // Associated data (may be nil)
        activeSubscription = try container.decodeIfPresent(Subscription.self, forKey: .activeSubscription)
        qrCode = try container.decodeIfPresent(String.self, forKey: .qrCode)
    }
    
    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        
        try container.encode(id, forKey: .id)
        try container.encode(email, forKey: .email)
        try container.encode(username, forKey: .username)
        try container.encodeIfPresent(firstName, forKey: .firstName)
        try container.encodeIfPresent(lastName, forKey: .lastName)
        try container.encode(role, forKey: .role)
        try container.encode(isActive, forKey: .isActive)
        try container.encode(createdAt, forKey: .createdAt)
        try container.encode(updatedAt, forKey: .updatedAt)
        
        // Customer-specific fields
        try container.encodeIfPresent(phone, forKey: .phone)
        try container.encodeIfPresent(dateOfBirth, forKey: .dateOfBirth)
        
        // Associated data
        try container.encodeIfPresent(activeSubscription, forKey: .activeSubscription)
        try container.encodeIfPresent(qrCode, forKey: .qrCode)
    }
}