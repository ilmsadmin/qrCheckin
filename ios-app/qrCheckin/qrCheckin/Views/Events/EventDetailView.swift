//
//  EventDetailView.swift
//  qrCheckin
//
//  Created on 12/6/25.
//

import SwiftUI

struct EventDetailView: View {
    let event: Event
    @State private var isScanning = false
    @State private var attendees: [User] = []
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                // Event Header
                eventHeader
                
                // Event Details
                eventDetails
                
                // Attendee List
                attendeeList
                
                // Action Buttons
                actionButtons
            }
            .padding()
        }
        .navigationTitle("Event Details")
        .onAppear {
            // Load mock attendees
            loadMockAttendees()
        }
        .sheet(isPresented: $isScanning) {
            ScannerView()
        }
    }
    
    // MARK: - Event Header
    private var eventHeader: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(event.name)
                    .font(.title2)
                    .fontWeight(.bold)
                
                Spacer()
                
                StatusBadge(
                    status: statusText,
                    color: statusColor
                )
            }
            
            if let description = event.description, !description.isEmpty {
                Text(description)
                    .font(.body)
                    .foregroundColor(.secondary)
                    .padding(.top, 4)
            }
        }
        .padding()
        .background(Color(.secondarySystemBackground))
        .cornerRadius(12)
    }
    
    // MARK: - Event Details
    private var eventDetails: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Details")
                .font(.headline)
            
            VStack(alignment: .leading, spacing: 12) {
                DetailRow(icon: "calendar", title: "Date", value: formattedDate)
                DetailRow(icon: "clock", title: "Time", value: "\(formattedStartTime) - \(formattedEndTime)")
                
                if let location = event.location {
                    DetailRow(icon: "mappin.and.ellipse", title: "Location", value: location)
                }
                
                if let capacity = event.maxCapacity {
                    DetailRow(icon: "person.3.fill", title: "Capacity", value: "\(capacity) people")
                }
                
                DetailRow(icon: "hourglass", title: "Duration", value: event.durationString)
            }
        }
        .padding()
        .background(Color(.secondarySystemBackground))
        .cornerRadius(12)
    }
    
    // MARK: - Attendee List
    private var attendeeList: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text("Attendees")
                    .font(.headline)
                
                Spacer()
                
                Text("\(attendees.count) checked in")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
            
            if attendees.isEmpty {
                HStack {
                    Spacer()
                    
                    VStack(spacing: 12) {
                        Image(systemName: "person.fill.questionmark")
                            .font(.system(size: 40))
                            .foregroundColor(.gray)
                        
                        Text("No attendees yet")
                            .font(.subheadline)
                            .foregroundColor(.gray)
                    }
                    
                    Spacer()
                }
                .padding(.vertical)
            } else {
                ForEach(attendees) { user in
                    HStack {
                        Circle()
                            .fill(Color.green)
                            .frame(width: 10, height: 10)
                        
                        Text(user.displayName)
                            .font(.body)
                        
                        Spacer()
                        
                        Text("Checked in")
                            .font(.caption)
                            .foregroundColor(.gray)
                    }
                    .padding(.vertical, 4)
                }
            }
        }
        .padding()
        .background(Color(.secondarySystemBackground))
        .cornerRadius(12)
    }
    
    // MARK: - Action Buttons
    private var actionButtons: some View {
        VStack(spacing: 12) {
            Button(action: {
                isScanning = true
            }) {
                HStack {
                    Image(systemName: "qrcode.viewfinder")
                    Text("Scan QR Code")
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color.blue)
                .foregroundColor(.white)
                .cornerRadius(12)
            }
            
            Button(action: {
                // Manual check-in would be implemented here
            }) {
                HStack {
                    Image(systemName: "person.badge.plus")
                    Text("Manual Check-in")
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color.gray.opacity(0.2))
                .foregroundColor(.primary)
                .cornerRadius(12)
            }
        }
    }
    
    // MARK: - Helpers
    private var statusText: String {
        if event.isOngoing {
            return "ONGOING"
        } else if event.isUpcoming {
            return "UPCOMING"
        } else {
            return "COMPLETED"
        }
    }
    
    private var statusColor: Color {
        if event.isOngoing {
            return .green
        } else if event.isUpcoming {
            return .orange
        } else {
            return .gray
        }
    }
    
    private var formattedDate: String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .none
        return formatter.string(from: event.startTime)
    }
    
    private var formattedStartTime: String {
        let formatter = DateFormatter()
        formatter.timeStyle = .short
        formatter.dateStyle = .none
        return formatter.string(from: event.startTime)
    }
    
    private var formattedEndTime: String {
        let formatter = DateFormatter()
        formatter.timeStyle = .short
        formatter.dateStyle = .none
        return formatter.string(from: event.endTime)
    }
    
    private func loadMockAttendees() {
        // In a real app, we would fetch this from the API
        // For mock purposes, we'll create some sample attendees
        let mockAttendees: [User] = [
            User(
                id: "user_001",
                email: "john.doe@example.com",
                username: "johndoe",
                firstName: "John",
                lastName: "Doe",
                role: .user,
                isActive: true,
                createdAt: Date(),
                updatedAt: Date(),
                phone: "+1234567890",
                dateOfBirth: nil
            ),
            User(
                id: "user_002",
                email: "jane.smith@example.com",
                username: "janesmith",
                firstName: "Jane",
                lastName: "Smith",
                role: .user,
                isActive: true,
                createdAt: Date(),
                updatedAt: Date(),
                phone: "+1987654321",
                dateOfBirth: nil
            )
        ]
        
        // Only add attendees for ongoing or completed events
        if !event.isUpcoming {
            self.attendees = mockAttendees
        }
    }
}

// MARK: - Supporting Views
struct DetailRow: View {
    let icon: String
    let title: String
    let value: String
    
    var body: some View {
        HStack(alignment: .top) {
            Image(systemName: icon)
                .frame(width: 24, height: 24)
                .foregroundColor(.blue)
            
            VStack(alignment: .leading) {
                Text(title)
                    .font(.caption)
                    .foregroundColor(.gray)
                
                Text(value)
                    .font(.body)
            }
            
            Spacer()
        }
    }
}

struct StatusBadge: View {
    let status: String
    let color: Color
    
    var body: some View {
        Text(status)
            .font(.caption)
            .fontWeight(.medium)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(color.opacity(0.2))
            .foregroundColor(color)
            .cornerRadius(6)
    }
}

struct EventDetailView_Previews: PreviewProvider {
    static var previews: some View {
        NavigationView {
            EventDetailView(
                event: Event(
                    id: "event_001",
                    name: "Morning Fitness Class",
                    description: "High-intensity interval training session",
                    startTime: Date().addingTimeInterval(3600),
                    endTime: Date().addingTimeInterval(7200),
                    location: "Gym Room A",
                    maxCapacity: 20,
                    isActive: true,
                    clubId: "club_001",
                    createdAt: Date(),
                    updatedAt: Date()
                )
            )
        }
    }
}
