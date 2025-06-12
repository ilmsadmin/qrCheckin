//
//  RecentCheckinRowView.swift
//  qrCheckin
//
//  Created by toan on 12/6/25.
//

import SwiftUI

struct RecentCheckinRowView: View {
    let checkin: CheckinLog
    
    var body: some View {
        HStack {
            // Status Icon
            Image(systemName: checkin.type == .checkin ? "person.badge.plus" : "person.badge.minus")
                .foregroundColor(checkin.type == .checkin ? .green : .red)
                .font(.title3)
                .frame(width: 30)
            
            VStack(alignment: .leading, spacing: 2) {
                // User Name
                Text(checkin.user?.displayName ?? "Unknown User")
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(.white)
                
                // Event Name
                if let eventName = checkin.event?.name {
                    Text(eventName)
                        .font(.caption)
                        .foregroundColor(.gray)
                }
            }
            
            Spacer()
            
            VStack(alignment: .trailing, spacing: 2) {
                // Action Type
                Text(checkin.type == .checkin ? "Check-in" : "Check-out")
                    .font(.caption)
                    .fontWeight(.medium)
                    .foregroundColor(checkin.type == .checkin ? .green : .red)
                
                // Time
                Text(checkin.timeAgo)
                    .font(.caption2)
                    .foregroundColor(.gray)
            }
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(Color.gray.opacity(0.1))
        .cornerRadius(8)
    }
}

#Preview {
    VStack {
        RecentCheckinRowView(
            checkin: CheckinLog(
                id: "1",
                userId: "user1",
                eventId: "event1",
                qrCodeId: "qr1",
                type: .checkin,
                timestamp: Date().addingTimeInterval(-300), // 5 minutes ago
                createdAt: Date(),
                user: User(
                    id: "user1",
                    email: "john@example.com",
                    username: "johndoe",
                    firstName: "John",
                    lastName: "Doe",
                    role: .user,
                    isActive: true,
                    createdAt: Date(),
                    updatedAt: Date()
                ),
                event: Event(
                    id: "event1",
                    name: "Fitness Class",
                    description: "Morning workout",
                    startTime: Date(),
                    endTime: Date().addingTimeInterval(3600),
                    location: "Gym A",
                    maxCapacity: 20,
                    isActive: true,
                    clubId: "club1",
                    createdAt: Date(),
                    updatedAt: Date()
                )
            )
        )
        
        RecentCheckinRowView(
            checkin: CheckinLog(
                id: "2",
                userId: "user2",
                eventId: "event1",
                qrCodeId: "qr2",
                type: .checkout,
                timestamp: Date().addingTimeInterval(-600), // 10 minutes ago
                createdAt: Date(),
                user: User(
                    id: "user2",
                    email: "jane@example.com",
                    username: "janesmith",
                    firstName: "Jane",
                    lastName: "Smith",
                    role: .user,
                    isActive: true,
                    createdAt: Date(),
                    updatedAt: Date()
                ),
                event: Event(
                    id: "event1",
                    name: "Yoga Session",
                    description: "Relaxing yoga",
                    startTime: Date(),
                    endTime: Date().addingTimeInterval(3600),
                    location: "Studio B",
                    maxCapacity: 15,
                    isActive: true,
                    clubId: "club1",
                    createdAt: Date(),
                    updatedAt: Date()
                )
            )
        )
    }
    .padding()
    .background(Color.black)
}