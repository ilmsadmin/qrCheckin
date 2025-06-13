//
//  StaffMembersView.swift
//  qrCheckin
//
//  Created by toan on 12/6/25.
//

import SwiftUI

struct StaffMembersView: View {
    @StateObject private var membersViewModel = MembersViewModel()
    @State private var selectedFilter = MemberFilter.all
    @State private var showFilterSheet = false
    @State private var showMemberDetail = false
    @State private var selectedMember: Member?
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Stats Header
                if let stats = membersViewModel.memberStats {
                    statsHeaderView(stats: stats)
                }
                
                // Search and Filter Bar
                searchAndFilterBar
                
                // Members List
                membersList
            }
            .navigationTitle("Members")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: {
                        showFilterSheet = true
                    }) {
                        Image(systemName: "line.horizontal.3.decrease.circle")
                            .font(.title3)
                    }
                }
            }
            .refreshable {
                await refreshMembers()
            }
        }
        .sheet(isPresented: $showFilterSheet) {
            filterSheet
        }
        .sheet(isPresented: $showMemberDetail) {
            if let member = selectedMember {
                MemberDetailView(member: member)
            }
        }
        .alert(membersViewModel.alertTitle, isPresented: $membersViewModel.showAlert) {
            Button("OK") { }
        } message: {
            Text(membersViewModel.alertMessage)
        }
        .task {
            await loadInitialData()
        }
    }
    
    // MARK: - Stats Header
    private func statsHeaderView(stats: MemberStats) -> some View {
        VStack(spacing: 12) {
            HStack(spacing: 20) {
                statCard(title: "Total", value: "\(stats.totalMembers)", color: .blue)
                statCard(title: "Active", value: "\(stats.activeMembers)", color: .green)
                statCard(title: "Check-ins Today", value: "\(stats.checkinsToday)", color: .orange)
            }
            
            HStack(spacing: 20) {
                statCard(title: "This Week", value: "\(stats.checkinsThisWeek)", color: .purple)
                statCard(title: "This Month", value: "\(stats.checkinsThisMonth)", color: .red)
                statCard(title: "Revenue", value: String(format: "$%.0f", stats.monthlyRevenue), color: .teal)
            }
        }
        .padding()
        .background(Color(.systemGray6))
    }
    
    private func statCard(title: String, value: String, color: Color) -> some View {
        VStack(spacing: 4) {
            Text(value)
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(color)
            
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 8)
        .background(Color(.systemBackground))
        .cornerRadius(8)
    }
    
    // MARK: - Search and Filter Bar
    private var searchAndFilterBar: some View {
        VStack(spacing: 12) {
            // Search bar
            HStack {
                Image(systemName: "magnifyingglass")
                    .foregroundColor(.secondary)
                
                TextField("Search members...", text: $membersViewModel.searchText)
                    .textFieldStyle(PlainTextFieldStyle())
                
                if !membersViewModel.searchText.isEmpty {
                    Button(action: {
                        membersViewModel.searchText = ""
                    }) {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundColor(.secondary)
                    }
                }
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(Color(.systemGray6))
            .cornerRadius(10)
            
            // Filter chips
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    ForEach(MemberFilter.allCases, id: \.self) { filter in
                        filterChip(filter: filter)
                    }
                }
                .padding(.horizontal)
            }
        }
        .padding()
        .background(Color(.systemBackground))
    }
    
    private func filterChip(filter: MemberFilter) -> some View {
        Button(action: {
            selectedFilter = filter
            updateViewModelFilter()
        }) {
            Text(filter.displayName)
                .font(.caption)
                .fontWeight(.medium)
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(selectedFilter == filter ? Color.blue : Color(.systemGray5))
                .foregroundColor(selectedFilter == filter ? .white : .primary)
                .cornerRadius(16)
        }
    }
    
    // MARK: - Members List
    private var membersList: some View {
        Group {
            if membersViewModel.isLoading && membersViewModel.filteredMembers.isEmpty {
                loadingView
            } else if membersViewModel.filteredMembers.isEmpty {
                emptyStateView
            } else {
                List {
                    ForEach(membersViewModel.filteredMembers) { member in
                        memberRow(member: member)
                            .listRowInsets(EdgeInsets(top: 8, leading: 16, bottom: 8, trailing: 16))
                            .listRowSeparator(.hidden)
                            .onTapGesture {
                                selectedMember = member
                                showMemberDetail = true
                            }
                    }
                    
                    // Load more indicator
                    if membersViewModel.isLoading {
                        HStack {
                            Spacer()
                            ProgressView()
                                .padding()
                            Spacer()
                        }
                        .listRowSeparator(.hidden)
                    }
                }
                .listStyle(PlainListStyle())
            }
        }
    }
    
    private var loadingView: some View {
        VStack(spacing: 16) {
            ProgressView()
                .scaleEffect(1.2)
            Text("Loading members...")
                .font(.headline)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
    
    private var emptyStateView: some View {
        VStack(spacing: 16) {
            Image(systemName: "person.2.slash")
                .font(.system(size: 48))
                .foregroundColor(.secondary)
            
            Text("No members found")
                .font(.headline)
                .foregroundColor(.secondary)
            
            Text("Try adjusting your search or filter criteria")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
            
            Button("Refresh") {
                Task {
                    await refreshMembers()
                }
            }
            .buttonStyle(.bordered)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding()
    }
    
    private func memberRow(member: Member) -> some View {
        HStack(spacing: 12) {
            // Profile image
            AsyncImage(url: URL(string: member.profileImageUrl ?? "")) { image in
                image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } placeholder: {
                ZStack {
                    Circle()
                        .fill(Color.gray.opacity(0.2))
                    
                    Text(member.initials)
                        .font(.headline)
                        .fontWeight(.semibold)
                        .foregroundColor(.secondary)
                }
            }
            .frame(width: 50, height: 50)
            .clipShape(Circle())
            
            // Member info
            VStack(alignment: .leading, spacing: 4) {
                Text(member.fullName)
                    .font(.headline)
                    .fontWeight(.medium)
                
                Text(member.email)
                    .font(.caption)
                    .foregroundColor(.secondary)
                
                HStack(spacing: 8) {
                    // Status badge
                    HStack(spacing: 4) {
                        Circle()
                            .fill(member.statusColor)
                            .frame(width: 6, height: 6)
                        
                        Text(member.status.rawValue.capitalized)
                            .font(.caption2)
                            .fontWeight(.medium)
                            .foregroundColor(member.statusColor)
                    }
                    .padding(.horizontal, 8)
                    .padding(.vertical, 2)
                    .background(member.statusColor.opacity(0.1))
                    .cornerRadius(8)
                    
                    // Subscription info
                    if let subscription = member.activeSubscription {
                        Text(subscription.packageName)
                            .font(.caption2)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 1)
                            .background(Color.blue.opacity(0.1))
                            .foregroundColor(.blue)
                            .cornerRadius(4)
                    }
                    
                    Spacer()
                    
                    // Check-in count
                    VStack(alignment: .trailing, spacing: 2) {
                        Text("Check-ins")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                        Text("\(member.stats?.totalCheckins ?? 0)")
                            .font(.caption)
                            .fontWeight(.semibold)
                    }
                }
                
                // Last visit
                if let lastCheckin = member.stats?.lastCheckin {
                    Text("Last visit: \(formatRelativeDate(lastCheckin))")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
            }
            
            Spacer()
            
            // Action button
            Image(systemName: "chevron.right")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.1), radius: 2, x: 0, y: 1)
    }
    
    // MARK: - Filter Sheet
    private var filterSheet: some View {
        NavigationView {
            VStack(alignment: .leading, spacing: 20) {
                Text("Filter Members")
                    .font(.title2)
                    .fontWeight(.bold)
                    .padding(.top)
                
                VStack(alignment: .leading, spacing: 12) {
                    Text("Membership Status")
                        .font(.headline)
                    
                    ForEach(MemberFilter.allCases, id: \.self) { filter in
                        HStack {
                            Button(action: {
                                selectedFilter = filter
                                updateViewModelFilter()
                            }) {
                                HStack {
                                    Image(systemName: selectedFilter == filter ? "checkmark.circle.fill" : "circle")
                                        .foregroundColor(selectedFilter == filter ? .blue : .secondary)
                                    
                                    Text(filter.displayName)
                                        .foregroundColor(.primary)
                                    
                                    Spacer()
                                }
                            }
                        }
                        .padding(.vertical, 4)
                    }
                }
                
                Spacer()
                
                // Apply button
                Button("Apply Filter") {
                    showFilterSheet = false
                }
                .foregroundColor(.white)
                .padding()
                .frame(maxWidth: .infinity)
                .background(Color.blue)
                .cornerRadius(12)
            }
            .padding()
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        showFilterSheet = false
                    }
                }
            }
        }
    }
    
    // MARK: - Helper Methods
    @MainActor
    private func loadInitialData() async {
        await membersViewModel.loadInitialData()
    }
    
    @MainActor
    private func refreshMembers() async {
        await membersViewModel.refreshMembers()
    }
    
    private func updateViewModelFilter() {
        switch selectedFilter {
        case .all:
            membersViewModel.selectedStatus = nil
        case .active:
            membersViewModel.selectedStatus = .active
        case .expired:
            membersViewModel.selectedStatus = .expired
        case .canceled:
            membersViewModel.selectedStatus = .canceled
        case .paused:
            membersViewModel.selectedStatus = .paused
        case .recent:
            // For recent, we'll use a custom filter in the view model
            membersViewModel.selectedStatus = nil
            // You might want to add a custom filter for recent members
        }
    }
                    
    private func formatRelativeDate(_ date: Date) -> String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .abbreviated
        return formatter.localizedString(for: date, relativeTo: Date())
    }
}

// MARK: - Supporting Types
enum MemberFilter: CaseIterable {
    case all, active, expired, canceled, paused, recent
    
    var displayName: String {
        switch self {
        case .all: return "All"
        case .active: return "Active"
        case .expired: return "Expired"
        case .canceled: return "Canceled"
        case .paused: return "Paused"
        case .recent: return "Recent"
        }
    }
}

// MARK: - Member Detail View
struct MemberDetailView: View {
    let member: Member
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    // Header with profile
                    memberHeader
                    
                    // Subscription details
                    if let subscription = member.activeSubscription {
                        subscriptionSection(subscription: subscription)
                    }
                    
                    // QR Code
                    if let qrCode = member.qrCode {
                        qrCodeSection(qrCode: qrCode)
                    }
                    
                    // Stats
                    if let stats = member.stats {
                        statsSection(stats: stats)
                    }
                    
                    Spacer()
                }
                .padding()
            }
            .navigationTitle("Member Details")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
    }
    
    private var memberHeader: some View {
        VStack(spacing: 16) {
            // Profile image
            AsyncImage(url: URL(string: member.profileImageUrl ?? "")) { image in
                image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } placeholder: {
                ZStack {
                    Circle()
                        .fill(Color.gray.opacity(0.2))
                    
                    Text(member.initials)
                        .font(.largeTitle)
                        .fontWeight(.semibold)
                        .foregroundColor(.secondary)
                }
            }
            .frame(width: 100, height: 100)
            .clipShape(Circle())
            
            VStack(spacing: 8) {
                Text(member.fullName)
                    .font(.title2)
                    .fontWeight(.bold)
                
                Text(member.email)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                
                HStack(spacing: 4) {
                    Circle()
                        .fill(member.statusColor)
                        .frame(width: 8, height: 8)
                    
                    Text(member.status.rawValue.capitalized)
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundColor(member.statusColor)
                }
            }
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }
    
    private func subscriptionSection(subscription: MemberSubscription) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Subscription")
                .font(.headline)
            
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text("Package:")
                    Spacer()
                    Text(subscription.packageName)
                        .fontWeight(.medium)
                }
                
                HStack {
                    Text("Status:")
                    Spacer()
                    Text(subscription.status.rawValue.capitalized)
                        .fontWeight(.medium)
                        .foregroundColor(subscription.status == .active ? .green : .red)
                }
                
                HStack {
                    Text("Expires:")
                    Spacer()
                    Text(subscription.endDate, style: .date)
                        .fontWeight(.medium)
                }
                
                if subscription.status == .active {
                    HStack {
                        Text("Days remaining:")
                        Spacer()
                        Text("\(subscription.daysRemaining)")
                            .fontWeight(.medium)
                            .foregroundColor(subscription.daysRemaining < 7 ? .red : .primary)
                    }
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.1), radius: 2, x: 0, y: 1)
    }
    
    private func qrCodeSection(qrCode: MemberQRCode) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("QR Code")
                .font(.headline)
            
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Usage: \(qrCode.usageCount)")
                        .font(.subheadline)
                    
                    if let lastUsed = qrCode.lastUsed {
                        Text("Last used: \(lastUsed, style: .date)")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    } else {
                        Text("Last used: Never")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                
                Spacer()
                
                // QR Code placeholder
                RoundedRectangle(cornerRadius: 8)
                    .fill(Color.gray.opacity(0.2))
                    .frame(width: 60, height: 60)
                    .overlay(
                        Image(systemName: "qrcode")
                            .font(.title2)
                            .foregroundColor(.secondary)
                    )
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.1), radius: 2, x: 0, y: 1)
    }
    
    private func statsSection(stats: MemberIndividualStats) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Statistics")
                .font(.headline)
            
            LazyVGrid(columns: [
                GridItem(.flexible()),
                GridItem(.flexible())
            ], spacing: 12) {
                statBox(title: "Total Check-ins", value: "\(stats.totalCheckins)")
                statBox(title: "This Month", value: "\(stats.checkinsThisMonth)")
                statBox(title: "Streak", value: "\(stats.currentStreak) days")
                statBox(title: "Avg/Week", value: String(format: "%.1f", stats.averagePerWeek))
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.1), radius: 2, x: 0, y: 1)
    }
    
    private func statBox(title: String, value: String) -> some View {
        VStack(spacing: 4) {
            Text(value)
                .font(.title3)
                .fontWeight(.bold)
                .foregroundColor(.blue)
            
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(8)
    }
}

#Preview {
    StaffMembersView()
}
