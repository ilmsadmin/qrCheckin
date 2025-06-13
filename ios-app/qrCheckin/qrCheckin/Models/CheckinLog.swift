//
//  CheckinLog.swift
//  qrCheckin
//
//  Created by toan on 12/6/25.
//

import Foundation

enum CheckinType: String, CaseIterable, Codable {
    case checkin = "CHECKIN"
    case checkout = "CHECKOUT"
}

struct CheckinLog: Identifiable, Codable {
    let id: String
    let userId: String
    let eventId: String
    let subscriptionId: String?
    let qrCodeId: String?
    let type: CheckinType
    let timestamp: Date
    let location: String?
    let notes: String?
    
    // Related data (populated when fetched with relations)
    var user: User?
    var event: Event?
    
    // For backward compatibility with some mock data
    init(id: String, eventId: String, userId: String, timestamp: Date, status: String) {
        self.id = id
        self.eventId = eventId
        self.userId = userId
        self.timestamp = timestamp
        self.subscriptionId = nil
        self.qrCodeId = nil
        self.type = status == "CHECKED_IN" ? .checkin : .checkout
        self.location = nil
        self.notes = nil
    }
    
    // Add a custom initializer for CheckinLog that includes all needed properties
    init(id: String, userId: String, eventId: String, subscriptionId: String? = nil, qrCodeId: String?, type: CheckinType, timestamp: Date, location: String? = nil, notes: String? = nil, user: User? = nil, event: Event? = nil) {
        self.id = id
        self.userId = userId
        self.eventId = eventId
        self.subscriptionId = subscriptionId
        self.qrCodeId = qrCodeId
        self.type = type
        self.timestamp = timestamp
        self.location = location
        self.notes = notes
        self.user = user
        self.event = event
    }
    
    var displayTime: String {
        let formatter = DateFormatter()
        formatter.timeStyle = .short
        return formatter.string(from: timestamp)
    }
    
    var timeAgo: String {
        let timeInterval = Date().timeIntervalSince(timestamp)
        
        if timeInterval < 60 {
            return "just now"
        } else if timeInterval < 3600 {
            let minutes = Int(timeInterval / 60)
            return "\(minutes) min\(minutes > 1 ? "s" : "") ago"
        } else if timeInterval < 86400 {
            let hours = Int(timeInterval / 3600)
            return "\(hours) hour\(hours > 1 ? "s" : "") ago"
        } else {
            let days = Int(timeInterval / 86400)
            return "\(days) day\(days > 1 ? "s" : "") ago"
        }
    }
}

extension CheckinLog: Equatable {
    static func == (lhs: CheckinLog, rhs: CheckinLog) -> Bool {
        return lhs.id == rhs.id &&
               lhs.userId == rhs.userId &&
               lhs.eventId == rhs.eventId &&
               lhs.type == rhs.type &&
               lhs.timestamp == rhs.timestamp
    }
}
