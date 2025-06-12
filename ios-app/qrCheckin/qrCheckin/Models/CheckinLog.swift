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
    let qrCodeId: String?
    let type: CheckinType
    let timestamp: Date
    let createdAt: Date?
    
    // Related data (populated when fetched with relations)
    var user: User?
    var event: Event?
    
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