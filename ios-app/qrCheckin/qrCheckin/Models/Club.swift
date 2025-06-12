//
//  Club.swift
//  qrCheckin
//
//  Created by toan on 12/6/25.
//

import Foundation

struct Club: Identifiable {
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

// MARK: - Codable Extension
extension Club: Codable {
    enum CodingKeys: String, CodingKey {
        case id
        case name
        case description
        case isActive
        case createdAt
        case updatedAt
        // Don't include related objects in coding keys
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        
        id = try container.decode(String.self, forKey: .id)
        name = try container.decode(String.self, forKey: .name)
        description = try container.decodeIfPresent(String.self, forKey: .description)
        isActive = try container.decode(Bool.self, forKey: .isActive)
        createdAt = try container.decode(Date.self, forKey: .createdAt)
        updatedAt = try container.decode(Date.self, forKey: .updatedAt)
        
        // Related objects are initialized as nil
        events = nil
        subscriptionPackages = nil
    }
    
    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        
        try container.encode(id, forKey: .id)
        try container.encode(name, forKey: .name)
        try container.encodeIfPresent(description, forKey: .description)
        try container.encode(isActive, forKey: .isActive)
        try container.encode(createdAt, forKey: .createdAt)
        try container.encode(updatedAt, forKey: .updatedAt)
        // Don't encode related objects
    }
}