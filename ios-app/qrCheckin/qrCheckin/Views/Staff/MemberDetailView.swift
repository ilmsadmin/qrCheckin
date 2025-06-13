//
//  MemberDetailView.swift
//  qrCheckin
//
//  Created by toan on 12/6/25.
//

import SwiftUI

struct MemberDetailView: View {
    let member: Member
    @Environment(\.dismiss) private var dismiss
    @State private var selectedTab = 0
    @State private var showQRCodeView = false
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    // Member Header
                    memberHeaderView
                    
                    // Tab Selection
                    tabSelectionView
                    
                    // Tab Content
                    tabContentView
                    
                    Spacer()
                }
                .padding()
                .background(Color.blue.opacity(0.1)) // Debug background
            }
            .background(Color.green.opacity(0.1)) // Debug background
            .navigationTitle("Member Details")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Close") {
                        dismiss()
                    }
                }
            }
        }
        .navigationViewStyle(StackNavigationViewStyle())
        .background(Color.red.opacity(0.1)) // Debug background
        .sheet(isPresented: $showQRCodeView) {
            if let qrCode = member.currentQRCode {
                QRCodeView(qrCode: qrCode.code)
            }
        }
        .onAppear {
        }
    }
    
    // MARK: - Member Header
    private var memberHeaderView: some View {
        VStack(spacing: 16) {
            // Profile Image
            AsyncImage(url: URL(string: member.profileImageUrl ?? "")) { image in
                image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } placeholder: {
                Circle()
                    .fill(Color.gray.opacity(0.3))
                    .overlay(
                        Image(systemName: "person.fill")
                            .font(.system(size: 40))
                            .foregroundColor(.white)
                    )
            }
            .frame(width: 100, height: 100)
            .clipShape(Circle())
            .overlay(
                Circle()
                    .stroke(Color.white, lineWidth: 4)
            )
            .shadow(color: Color.black.opacity(0.1), radius: 10, x: 0, y: 5)
            
            // Member Info
            VStack(spacing: 8) {
                Text(member.fullName)
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(.primary)
                
                Text(member.email)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                
                // Status Badge
                HStack(spacing: 4) {
                    Circle()
                        .fill(member.status.swiftUIColor)
                        .frame(width: 8, height: 8)
                    
                    Text(member.status.displayName)
                        .font(.caption)
                        .fontWeight(.medium)
                        .foregroundColor(.primary)
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(member.status.swiftUIColor.opacity(0.1))
                .cornerRadius(16)
            }
        }
        .padding(.top, 20)
    }
    
    // MARK: - Tab Selection
    private var tabSelectionView: some View {
        HStack(spacing: 0) {
            ForEach(0..<4) { index in
                Button(action: {
                    selectedTab = index
                }) {
                    VStack(spacing: 4) {
                        Text(tabTitle(for: index))
                            .font(.subheadline)
                            .fontWeight(selectedTab == index ? .semibold : .regular)
                        
                        Rectangle()
                            .frame(height: 2)
                            .foregroundColor(selectedTab == index ? .blue : .clear)
                    }
                }
                .foregroundColor(selectedTab == index ? .blue : .secondary)
                .frame(maxWidth: .infinity)
            }
        }
        .padding(.bottom, 8)
    }
    
    // MARK: - Tab Content
    private var tabContentView: some View {
        Group {
            switch selectedTab {
            case 0:
                memberInfoTab
            case 1:
                subscriptionTab
            case 2:
                historyTab
            case 3:
                statsTab
            default:
                EmptyView()
            }
        }
    }
    
    // MARK: - Tab: Member Info
    private var memberInfoTab: some View {
        VStack(spacing: 16) {
            // Personal Information
            infoSection(title: "Personal Information") {
                VStack(spacing: 12) {
                    infoRow(title: "Full Name", value: member.fullName, icon: "person.fill")
                    infoRow(title: "Email", value: member.email, icon: "envelope.fill")
                    
                    if let phone = member.phone {
                        infoRow(title: "Phone", value: phone, icon: "phone.fill")
                    }
                    
                    if let dateOfBirth = member.dateOfBirth {
                        infoRow(title: "Date of Birth", value: formatDate(dateOfBirth), icon: "gift.fill")
                    }
                    
                    if let gender = member.gender {
                        infoRow(title: "Gender", value: gender.capitalized, icon: "person.2.fill")
                    }
                }
            }
            
            // Address Information
            if hasAddressInfo {
                infoSection(title: "Address") {
                    VStack(spacing: 12) {
                        if let address = member.address {
                            infoRow(title: "Address", value: address, icon: "house.fill")
                        }
                        
                        if let city = member.city {
                            infoRow(title: "City", value: city, icon: "building.2.fill")
                        }
                        
                        if let state = member.state {
                            infoRow(title: "State", value: state, icon: "map.fill")
                        }
                        
                        if let country = member.country {
                            infoRow(title: "Country", value: country, icon: "globe")
                        }
                        
                        if let postalCode = member.postalCode {
                            infoRow(title: "Postal Code", value: postalCode, icon: "location.fill")
                        }
                    }
                }
            }
            
            // Membership Information
            infoSection(title: "Membership") {
                VStack(spacing: 12) {
                    infoRow(title: "Member Since", value: formatDate(member.memberSince), icon: "calendar")
                    infoRow(title: "Total Subscriptions", value: "\(member.totalSubscriptions)", icon: "doc.text.fill")
                    infoRow(title: "Total Check-ins", value: "\(member.totalCheckins)", icon: "checkmark.circle.fill")
                    infoRow(title: "Status", value: member.status.displayName, icon: "info.circle.fill")
                }
            }
        }
    }
    
    // MARK: - Tab: Subscription
    private var subscriptionTab: some View {
        VStack(spacing: 16) {
            // Current Subscription
            if let currentSubscription = member.currentSubscription {
                infoSection(title: "Current Subscription") {
                    VStack(spacing: 12) {
                        infoRow(title: "Package", value: currentSubscription.packageName, icon: "star.fill")
                        infoRow(title: "Status", value: currentSubscription.status.displayName, icon: "info.circle.fill")
                        infoRow(title: "Start Date", value: formatDate(currentSubscription.startDate), icon: "play.circle.fill")
                        infoRow(title: "End Date", value: formatDate(currentSubscription.endDate), icon: "stop.circle.fill")
                        infoRow(title: "Days Remaining", value: "\(currentSubscription.daysRemaining) days", icon: "hourglass")
                        
                        if let maxCheckins = currentSubscription.maxCheckins {
                            let remainingCheckins = max(0, maxCheckins - currentSubscription.usedCheckins)
                            infoRow(title: "Check-ins Remaining", value: "\(remainingCheckins) / \(maxCheckins)", icon: "checkmark.circle")
                        }
                        
                        infoRow(title: "Price Paid", value: formatCurrency(currentSubscription.finalPrice), icon: "dollarsign.circle.fill")
                    }
                }
            } else {
                noDataView(title: "No Active Subscription", message: "This member doesn't have an active subscription.")
            }
            
            // QR Code Section
            if member.currentQRCode != nil {
                Button(action: {
                    showQRCodeView = true
                }) {
                    HStack {
                        Image(systemName: "qrcode")
                            .font(.title2)
                            .foregroundColor(.blue)
                        
                        VStack(alignment: .leading) {
                            Text("View QR Code")
                                .font(.headline)
                                .foregroundColor(.primary)
                            
                            Text("Show member's QR code for check-in")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        
                        Spacer()
                        
                        Image(systemName: "chevron.right")
                            .foregroundColor(.secondary)
                    }
                    .padding()
                    .background(Color(.systemBackground))
                    .cornerRadius(12)
                    .shadow(color: Color.black.opacity(0.1), radius: 5, x: 0, y: 2)
                }
            }
            
            // Subscription History
            if let subscriptionHistory = member.subscriptionHistory, !subscriptionHistory.isEmpty {
                infoSection(title: "Subscription History") {
                    VStack(spacing: 8) {
                        ForEach(subscriptionHistory) { subscription in
                            subscriptionHistoryRow(subscription: subscription)
                        }
                    }
                }
            }
        }
    }
    
    // MARK: - Tab: History
    private var historyTab: some View {
        VStack(spacing: 16) {
            if let checkinHistory = member.checkinHistory, !checkinHistory.isEmpty {
                infoSection(title: "Recent Check-ins") {
                    VStack(spacing: 8) {
                        ForEach(checkinHistory.prefix(20)) { log in
                            checkinHistoryRow(log: log)
                        }
                    }
                }
            } else {
                noDataView(title: "No Check-in History", message: "This member hasn't checked in yet.")
            }
        }
    }
    
    // MARK: - Tab: Stats
    private var statsTab: some View {
        VStack(spacing: 16) {
            if let stats = member.stats {
                // Monthly Stats
                infoSection(title: "This Month") {
                    VStack(spacing: 12) {
                        infoRow(title: "Check-ins", value: "\(stats.totalCheckins)", icon: "checkmark.circle.fill")
                        infoRow(title: "Hours Spent", value: "\(stats.totalHours)h", icon: "clock.fill")
                        infoRow(title: "Average Visit Duration", value: "\(stats.averageVisitDuration)min", icon: "timer")
                        infoRow(title: "Most Active Day", value: stats.mostActiveDay, icon: "calendar.badge.plus")
                    }
                }
                
                // All Time Stats
                infoSection(title: "All Time") {
                    VStack(spacing: 12) {
                        infoRow(title: "Total Check-ins", value: "\(member.totalCheckins)", icon: "checkmark.circle.fill")
                        infoRow(title: "Total Subscriptions", value: "\(member.totalSubscriptions)", icon: "doc.text.fill")
                        infoRow(title: "Member Since", value: formatDate(member.memberSince), icon: "calendar")
                        
                        if let lastActivity = member.lastActivity {
                            infoRow(title: "Last Activity", value: formatRelativeDate(lastActivity), icon: "clock.arrow.circlepath")
                        }
                    }
                }
            } else {
                noDataView(title: "No Statistics Available", message: "Statistical data is not available for this member.")
            }
        }
    }
    
    // MARK: - Helper Views
    private func infoSection<Content: View>(title: String, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 16) {
            Text(title)
                .font(.headline)
                .foregroundColor(.primary)
            
            content()
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
        .shadow(color: Color.black.opacity(0.1), radius: 5, x: 0, y: 2)
    }
    
    private func infoRow(title: String, value: String, icon: String) -> some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundColor(.blue)
                .frame(width: 20)
            
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.caption)
                    .foregroundColor(.secondary)
                
                Text(value)
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(.primary)
            }
            
            Spacer()
        }
    }
    
    private func subscriptionHistoryRow(subscription: MemberSubscription) -> some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(subscription.packageName)
                    .font(.subheadline)
                    .fontWeight(.medium)
                
                Text("\(formatDate(subscription.startDate)) - \(formatDate(subscription.endDate))")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            VStack(alignment: .trailing, spacing: 4) {
                Text(subscription.status.displayName)
                    .font(.caption)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 2)
                    .background(subscription.status.swiftUIColor.opacity(0.2))
                    .foregroundColor(subscription.status.swiftUIColor)
                    .cornerRadius(8)
                
                Text(formatCurrency(subscription.finalPrice))
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding(.vertical, 8)
    }
    
    private func checkinHistoryRow(log: CheckinLog) -> some View {
        HStack {
            Image(systemName: log.type == .checkin ? "arrow.right.circle.fill" : "arrow.left.circle.fill")
                .foregroundColor(log.type == .checkin ? .green : .red)
            
            VStack(alignment: .leading, spacing: 2) {
                Text(log.type == .checkin ? "Check-in" : "Check-out")
                    .font(.subheadline)
                    .fontWeight(.medium)
                
                Text(formatDateTime(log.timestamp))
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            if let location = log.location {
                Text(location)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding(.vertical, 4)
    }
    
    private func noDataView(title: String, message: String) -> some View {
        VStack(spacing: 16) {
            Image(systemName: "doc.text")
                .font(.system(size: 48))
                .foregroundColor(.gray)
            
            VStack(spacing: 8) {
                Text(title)
                    .font(.headline)
                    .foregroundColor(.primary)
                
                Text(message)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
            }
        }
        .padding()
        .frame(maxWidth: .infinity)
        .background(Color(.systemBackground))
        .cornerRadius(16)
        .shadow(color: Color.black.opacity(0.1), radius: 5, x: 0, y: 2)
    }
    
    // MARK: - Helper Methods
    private func tabTitle(for index: Int) -> String {
        switch index {
        case 0: return "Info"
        case 1: return "Subscription"
        case 2: return "History"
        case 3: return "Stats"
        default: return ""
        }
    }
    
    private var hasAddressInfo: Bool {
        member.address != nil || member.city != nil || member.state != nil || member.country != nil || member.postalCode != nil
    }
    
    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        return formatter.string(from: date)
    }
    
    private func formatDateTime(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .short
        formatter.timeStyle = .short
        return formatter.string(from: date)
    }
    
    private func formatRelativeDate(_ date: Date) -> String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .full
        return formatter.localizedString(for: date, relativeTo: Date())
    }
    
    private func formatCurrency(_ amount: Double) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = "USD" // TODO: Use club's currency
        return formatter.string(from: NSNumber(value: amount)) ?? "$\(amount)"
    }
}

#Preview {
    MemberDetailView(member: Member(
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

// MARK: - QR Code View
struct QRCodeView: View {
    let qrCode: String
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                Text("Member QR Code")
                    .font(.title2)
                    .fontWeight(.bold)
                
                // QR Code placeholder
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color.gray.opacity(0.2))
                    .frame(width: 200, height: 200)
                    .overlay(
                        VStack {
                            Image(systemName: "qrcode")
                                .font(.system(size: 60))
                                .foregroundColor(.gray)
                            Text("QR Code")
                                .font(.caption)
                                .foregroundColor(.gray)
                        }
                    )
                
                Text("Scan this code to check-in")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                
                Spacer()
            }
            .padding()
            .navigationTitle("QR Code")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
        .navigationViewStyle(StackNavigationViewStyle())
    }
}
