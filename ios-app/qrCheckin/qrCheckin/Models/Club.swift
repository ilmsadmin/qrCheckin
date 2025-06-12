//
//  Club.swift
//  qrCheckin
//
//  Created by toan on 12/6/25.
//

import Foundation

struct Club: Identifiable, Codable {
    let id: String
    let name: String
    let description: String?
    let isActive: Bool
    let createdAt: Date
    let updatedAt: Date
    
    // Related data
    var events: [Event]?
    var subscriptionPackages: [SubscriptionPackage]?
}