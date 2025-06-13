//
//  SimpleMemberDetailView.swift
//  qrCheckin
//
//  Created for debugging white screen issue
//

import SwiftUI

struct SimpleMemberDetailView: View {
    let member: Member
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                Text("🎯 SIMPLE MEMBER DETAIL")
                    .font(.title)
                    .foregroundColor(.blue)
                    .padding()
                
                VStack(alignment: .leading, spacing: 12) {
                    Text("Name: \(member.fullName)")
                        .font(.headline)
                    
                    Text("Email: \(member.email)")
                        .font(.subheadline)
                    
                    Text("Status: \(member.status.displayName)")
                        .font(.subheadline)
                    
                    Text("Total Check-ins: \(member.totalCheckins)")
                        .font(.subheadline)
                    
                    Text("Member Since: \(formatDate(member.memberSince))")
                        .font(.subheadline)
                }
                .padding()
                .background(Color.gray.opacity(0.1))
                .cornerRadius(12)
                
                Button("Test Button") {
                    print("Test button tapped!")
                }
                .padding()
                .background(Color.blue)
                .foregroundColor(.white)
                .cornerRadius(8)
                
                Spacer()
            }
            .padding()
            .navigationTitle("Simple Detail")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Close") {
                        print("🔍 DEBUG: Close button tapped")
                        dismiss()
                    }
                }
            }
        }
        .navigationViewStyle(StackNavigationViewStyle())
        .background(Color.yellow.opacity(0.2))
        .onAppear {
            print("🔍 DEBUG: SimpleMemberDetailView appeared")
            print("🔍 DEBUG: Member: \(member.fullName)")
        }
        .onDisappear {
            print("🔍 DEBUG: SimpleMemberDetailView disappeared")
        }
    }
    
    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        return formatter.string(from: date)
    }
}

#Preview {
    SimpleMemberDetailView(member: Member(
        id: "1",
        email: "john.doe@example.com",
        firstName: "John",
        lastName: "Doe",
        phone: "+1234567890",
        dateOfBirth: Date(),
        gender: "Male",
        address: "123 Main St",
        city: "New York",
        state: "NY",
        country: "USA",
        postalCode: "10001",
        isActive: true,
        createdAt: Date(),
        updatedAt: Date(),
        clubId: "1",
        profileImageUrl: nil,
        fullName: "John Doe",
        displayName: "John Doe",
        currentSubscription: nil,
        currentQRCode: nil,
        recentCheckins: [],
        totalSubscriptions: 2,
        totalCheckins: 15,
        memberSince: Date(),
        status: .active,
        subscriptionExpiry: Date(),
        lastActivity: Date(),
        thisMonthCheckins: 5,
        subscriptionHistory: nil,
        checkinHistory: nil,
        stats: nil
    ))
}
