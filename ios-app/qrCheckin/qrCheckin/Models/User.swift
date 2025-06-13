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
    case systemAdmin = "SYSTEM_ADMIN"
    
    var isStaff: Bool {
        return self == .admin || self == .staff || self == .systemAdmin
    }
    
    var isCustomer: Bool {
        return self == .customer || self == .user
    }
    
    var isSystemAdmin: Bool {
        return self == .systemAdmin
    }
}

struct User: Identifiable, Codable, Equatable {
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
    // Breaking the recursive relationship by using a class wrapper
    var activeSubscription: SubscriptionReference?
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
    
    // MARK: - Equatable
    static func == (lhs: User, rhs: User) -> Bool {
        return lhs.id == rhs.id &&
               lhs.email == rhs.email &&
               lhs.username == rhs.username &&
               lhs.firstName == rhs.firstName &&
               lhs.lastName == rhs.lastName &&
               lhs.role == rhs.role &&
               lhs.isActive == rhs.isActive &&
               lhs.createdAt == rhs.createdAt &&
               lhs.updatedAt == rhs.updatedAt &&
               lhs.phone == rhs.phone &&
               lhs.dateOfBirth == rhs.dateOfBirth &&
               lhs.qrCode == rhs.qrCode
        // Note: We compare activeSubscription by subscription ID to avoid infinite recursion
        // since SubscriptionReference might have circular references
    }
}

// MARK: - Subscription Reference Class
// This class wrapper breaks the recursive relationship
final class SubscriptionReference: Codable {
    let subscription: Subscription
    
    init(subscription: Subscription) {
        self.subscription = subscription
    }
    
    // Convenience accessors
    var id: String { subscription.id }
    var isActive: Bool { subscription.isActive }
    var isExpired: Bool { subscription.isExpired }
    var package: SubscriptionPackage? { subscription.package }
    var startDate: Date { subscription.startDate }
    var endDate: Date { subscription.endDate }
    var daysRemaining: Int { subscription.daysRemaining }
    
    // Codable implementation
    enum CodingKeys: String, CodingKey {
        case subscription
    }
    
    required init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        subscription = try container.decode(Subscription.self, forKey: .subscription)
    }
    
    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(subscription, forKey: .subscription)
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
        if let subscriptionData = try container.decodeIfPresent(Subscription.self, forKey: .activeSubscription) {
            activeSubscription = SubscriptionReference(subscription: subscriptionData)
        } else {
            activeSubscription = nil
        }
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
        if let activeSubscription = activeSubscription {
            try container.encode(activeSubscription.subscription, forKey: .activeSubscription)
        }
        try container.encodeIfPresent(qrCode, forKey: .qrCode)
    }
}
