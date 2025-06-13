//
//  Member.swift
//  qrCheckin
//
//  Created by toan on 12/6/25.
//

import Foundation
import SwiftUI

struct Member: Identifiable, Codable {
    let id: String
    let email: String
    let firstName: String
    let lastName: String
    let phone: String?
    let dateOfBirth: Date?
    let gender: String?
    let address: String?
    let city: String?
    let state: String?
    let country: String?
    let postalCode: String?
    let isActive: Bool
    let createdAt: Date
    let updatedAt: Date
    let clubId: String
    let profileImageUrl: String?
    
    // Computed fields from backend
    let fullName: String
    let displayName: String
    let currentSubscription: MemberSubscription?
    let currentQRCode: MemberQRCode?
    let recentCheckins: [CheckinLog]
    let totalSubscriptions: Int
    let totalCheckins: Int
    let memberSince: Date
    let status: MemberStatus
    let subscriptionExpiry: Date?
    let lastActivity: Date?
    
    // Additional fields for detail view
    let thisMonthCheckins: Int?
    let subscriptionHistory: [MemberSubscription]?
    let checkinHistory: [CheckinLog]?
    let stats: MemberIndividualStats?
    
    enum CodingKeys: String, CodingKey {
        case id, email, firstName, lastName, phone, dateOfBirth, gender
        case address, city, state, country, postalCode, isActive, createdAt, updatedAt, clubId, profileImageUrl
        case fullName, displayName, currentSubscription, currentQRCode, recentCheckins
        case totalSubscriptions, totalCheckins, memberSince, status, subscriptionExpiry, lastActivity
        case thisMonthCheckins, subscriptionHistory, checkinHistory, stats
    }
}

struct MemberSubscription: Identifiable, Codable {
    let id: String
    let name: String
    let type: SubscriptionType
    let status: MemberStatus
    let originalPrice: Double
    let finalPrice: Double
    let duration: Int
    let maxCheckins: Int?
    let usedCheckins: Int
    let startDate: Date
    let endDate: Date
    let paymentStatus: PaymentStatus
    let isActive: Bool
    let createdAt: Date
    let updatedAt: Date
    let package: SubscriptionPackage?
    let payments: [Payment]?
    
    // Computed property for backward compatibility
    var packageName: String {
        return package?.name ?? name
    }
    
    var daysRemaining: Int {
        let components = Calendar.current.dateComponents([.day], from: Date(), to: endDate)
        return max(0, components.day ?? 0)
    }
}

struct MemberQRCode: Identifiable, Codable {
    let id: String
    let code: String
    let usageCount: Int
    let lastUsed: Date?
    let lastUsedAt: Date?
    let expiresAt: Date?
    let isActive: Bool
    let createdAt: Date
    let updatedAt: Date
}

enum MemberStatus: String, CaseIterable, Codable {
    case active = "ACTIVE"
    case expired = "EXPIRED"
    case canceled = "CANCELED"
    case paused = "PAUSED"
    
    var displayName: String {
        switch self {
        case .active:
            return "Active"
        case .expired:
            return "Expired"
        case .canceled:
            return "Canceled"
        case .paused:
            return "Paused"
        }
    }
    
    var color: String {
        switch self {
        case .active:
            return "green"
        case .expired:
            return "orange"
        case .canceled:
            return "red"
        case .paused:
            return "yellow"
        }
    }
}

enum PaymentStatus: String, Codable {
    case pending = "PENDING"
    case processing = "PROCESSING"
    case completed = "COMPLETED"
    case failed = "FAILED"
    case refunded = "REFUNDED"
    case canceled = "CANCELED"
}

struct Payment: Identifiable, Codable {
    let id: String
    let amount: Double
    let currency: String
    let status: PaymentStatus
    let method: String?
    let netAmount: Double?
    let transactionFee: Double?
    let description: String?
    let createdAt: Date
}

struct MemberStats: Codable {
    let totalCustomers: Int
    let activeCustomers: Int
    let expiredCustomers: Int
    let canceledCustomers: Int
    let newThisMonth: Int
    let totalRevenue: Double
    let activePercentage: Int
    let retentionRate: Int
    
    // Computed properties for backward compatibility
    var totalMembers: Int { totalCustomers }
    var activeMembers: Int { activeCustomers }
    var monthlyRevenue: Double { totalRevenue }
    var checkinsToday: Int { 0 }
    var checkinsThisWeek: Int { 0 }
    var checkinsThisMonth: Int { 0 }
}

struct MemberIndividualStats: Codable {
    let totalCheckins: Int
    let checkinsThisMonth: Int
    let checkinsThisWeek: Int
    let currentStreak: Int
    let averagePerWeek: Double
    let lastCheckin: Date?
}

// MARK: - Extensions
extension Member {
    var initials: String {
        let firstInitial = firstName.prefix(1).uppercased()
        let lastInitial = lastName.prefix(1).uppercased()
        return "\(firstInitial)\(lastInitial)"
    }
    
    var statusColor: Color {
        switch status {
        case .active:
            return .green
        case .expired:
            return .orange
        case .canceled:
            return .red
        case .paused:
            return .yellow
        }
    }
    
    var activeSubscription: MemberSubscription? {
        return currentSubscription
    }
    
    var qrCode: MemberQRCode? {
        return currentQRCode
    }
    
    var membershipDuration: String {
        let components = Calendar.current.dateComponents([.day], from: memberSince, to: Date())
        let days = components.day ?? 0
        
        if days < 30 {
            return "\(days) days"
        } else if days < 365 {
            let months = days / 30
            return "\(months) month\(months > 1 ? "s" : "")"
        } else {
            let years = days / 365
            let remainingMonths = (days % 365) / 30
            if remainingMonths > 0 {
                return "\(years) year\(years > 1 ? "s" : "") \(remainingMonths) month\(remainingMonths > 1 ? "s" : "")"
            } else {
                return "\(years) year\(years > 1 ? "s" : "")"
            }
        }
    }
    
    var subscriptionExpiryText: String {
        guard let expiry = subscriptionExpiry else { return "No active subscription" }
        
        let components = Calendar.current.dateComponents([.day], from: Date(), to: expiry)
        let days = components.day ?? 0
        
        if days < 0 {
            return "Expired"
        } else if days == 0 {
            return "Expires today"
        } else if days < 30 {
            return "Expires in \(days) day\(days > 1 ? "s" : "")"
        } else {
            let months = days / 30
            return "Expires in \(months) month\(months > 1 ? "s" : "")"
        }
    }
    
    var lastActivityText: String {
        guard let lastActivity = lastActivity else { return "No activity" }
        
        let components = Calendar.current.dateComponents([.day, .hour, .minute], from: lastActivity, to: Date())
        
        if let days = components.day, days > 0 {
            return "\(days) day\(days > 1 ? "s" : "") ago"
        } else if let hours = components.hour, hours > 0 {
            return "\(hours) hour\(hours > 1 ? "s" : "") ago"
        } else if let minutes = components.minute, minutes > 0 {
            return "\(minutes) minute\(minutes > 1 ? "s" : "") ago"
        } else {
            return "Just now"
        }
    }
}
