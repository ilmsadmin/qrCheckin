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

struct SubscriptionPackage: Identifiable, Codable {
    let id: String
    let name: String
    let description: String?
    let clubId: String
    let type: SubscriptionType
    let price: Double
    let discountPrice: Double?
    let features: [String]
    let checkinLimit: Int?
    let isPopular: Bool
    let sortOrder: Int
    let isActive: Bool
    let createdAt: Date
    let updatedAt: Date
    
    var displayPrice: String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = "VND"
        formatter.minimumFractionDigits = 0
        
        if let discount = discountPrice {
            return formatter.string(from: NSNumber(value: discount)) ?? "₫\(Int(discount))"
        } else {
            return formatter.string(from: NSNumber(value: price)) ?? "₫\(Int(price))"
        }
    }
    
    var originalPriceString: String? {
        guard let _ = discountPrice else { return nil }
        
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = "VND"
        formatter.minimumFractionDigits = 0
        
        return formatter.string(from: NSNumber(value: price)) ?? "₫\(Int(price))"
    }
}

struct Subscription: Identifiable, Codable {
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