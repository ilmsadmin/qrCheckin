//
//  SubscriptionPackage.swift
//  qrCheckin
//
//  Created on 12/6/25.
//

import Foundation

struct SubscriptionPackage: Identifiable, Codable, Equatable {
    let id: String
    let name: String
    let description: String?
    let clubId: String
    let price: Double
    let discountPrice: Double?
    let features: [String]
    let maxCheckins: Int?
    let isPopular: Bool
    let isFeatured: Bool?
    let sortOrder: Int
    let isActive: Bool
    let image: String?
    let color: String?
    let terms: String?
    let refundPolicy: String?
    let createdAt: Date
    let updatedAt: Date
    let type: SubscriptionType
    
    // Additional fields from the other declaration  
    let duration: Int
    
    // Computed properties for backward compatibility
    var durationDays: Int { duration }
    var checkinLimit: Int? { maxCheckins }
    
    // Computed properties
    var formattedPrice: String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = "VND"
        formatter.locale = Locale(identifier: "vi_VN")
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
    
    var durationText: String {
        if durationDays == 30 {
            return "1 tháng"
        } else if durationDays == 90 {
            return "3 tháng"
        } else if durationDays == 180 {
            return "6 tháng"
        } else if durationDays == 365 {
            return "1 năm"
        } else {
            return "\(durationDays) ngày"
        }
    }
    
    // Helper initializer for MockDataService compatibility
    init(id: String, name: String, description: String?, clubId: String, 
         type: SubscriptionType, price: Double, discountPrice: Double? = nil, 
         features: [String] = [], maxCheckins: Int? = nil, isPopular: Bool = false,
         isFeatured: Bool? = nil, sortOrder: Int = 0, isActive: Bool = true, 
         image: String? = nil, color: String? = nil, terms: String? = nil, 
         refundPolicy: String? = nil, duration: Int = 30,
         createdAt: Date = Date(), updatedAt: Date = Date()) {
        self.id = id
        self.name = name
        self.description = description
        self.clubId = clubId
        self.type = type
        self.price = price
        self.discountPrice = discountPrice
        self.features = features
        self.maxCheckins = maxCheckins
        self.isPopular = isPopular
        self.isFeatured = isFeatured
        self.sortOrder = sortOrder
        self.isActive = isActive
        self.image = image
        self.color = color
        self.terms = terms
        self.refundPolicy = refundPolicy
        self.duration = duration
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }
}
