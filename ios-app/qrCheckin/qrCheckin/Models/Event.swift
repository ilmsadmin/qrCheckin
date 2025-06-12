//
//  Event.swift
//  qrCheckin
//
//  Created by toan on 12/6/25.
//

import Foundation

struct Event: Identifiable, Codable {
    let id: String
    let name: String
    let description: String?
    let startTime: Date
    let endTime: Date
    let location: String?
    let maxCapacity: Int?
    let isActive: Bool
    let clubId: String
    let createdAt: Date
    let updatedAt: Date
    
    var isOngoing: Bool {
        let now = Date()
        return now >= startTime && now <= endTime
    }
    
    var isUpcoming: Bool {
        return startTime > Date()
    }
    
    var isCompleted: Bool {
        return endTime < Date()
    }
    
    var duration: TimeInterval {
        return endTime.timeIntervalSince(startTime)
    }
    
    var durationString: String {
        let hours = Int(duration) / 3600
        let minutes = Int(duration) % 3600 / 60
        
        if hours > 0 {
            return "\(hours)h \(minutes)m"
        } else {
            return "\(minutes)m"
        }
    }
}