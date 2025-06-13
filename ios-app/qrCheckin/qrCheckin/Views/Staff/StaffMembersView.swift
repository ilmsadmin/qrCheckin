//
//  StaffMembersView.swift
//  qrCheckin
//
//  Created by toan on 12/6/25.
//

import SwiftUI

struct StaffMembersView: View {
    @State private var searchText = ""
    @State private var selectedFilter = MemberFilter.all
    @State private var showFilterSheet = false
    
    // Mock data for demonstration - in real app this would come from a ViewModel
    @State private var members: [CustomerInfo] = []
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
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
        }
        .sheet(isPresented: $showFilterSheet) {
            filterSheet
        }
        .onAppear {
            loadMockData()
        }
    }
    
    // MARK: - Search and Filter Bar
    private var searchAndFilterBar: some View {
        VStack(spacing: 12) {
            // Search bar
            HStack {
                Image(systemName: "magnifyingglass")
                    .foregroundColor(.secondary)
                
                TextField("Search members...", text: $searchText)
                    .textFieldStyle(PlainTextFieldStyle())
                
                if !searchText.isEmpty {
                    Button(action: {
                        searchText = ""
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
        List {
            ForEach(filteredMembers) { member in
                memberRow(member: member)
                    .listRowInsets(EdgeInsets(top: 8, leading: 16, bottom: 8, trailing: 16))
                    .listRowSeparator(.hidden)
            }
        }
        .listStyle(PlainListStyle())
        .refreshable {
            // Refresh members data
            loadMockData()
        }
    }
    
    private func memberRow(member: CustomerInfo) -> some View {
        HStack(spacing: 12) {
            // Profile image
            AsyncImage(url: URL(string: member.profileImageUrl)) { image in
                image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } placeholder: {
                Circle()
                    .fill(Color.gray.opacity(0.3))
            }
            .frame(width: 50, height: 50)
            .clipShape(Circle())
            
            // Member info
            VStack(alignment: .leading, spacing: 4) {
                Text(member.name)
                    .font(.headline)
                    .fontWeight(.medium)
                
                Text(member.email)
                    .font(.caption)
                    .foregroundColor(.secondary)
                
                HStack(spacing: 8) {
                    // Status badge
                    HStack(spacing: 4) {
                        Circle()
                            .fill(member.isActive ? Color.green : Color.red)
                            .frame(width: 6, height: 6)
                        
                        Text(member.membershipStatus)
                            .font(.caption2)
                            .fontWeight(.medium)
                            .foregroundColor(member.isActive ? .green : .red)
                    }
                    .padding(.horizontal, 8)
                    .padding(.vertical, 2)
                    .background((member.isActive ? Color.green : Color.red).opacity(0.1))
                    .cornerRadius(8)
                    
                    // Last visit
                    if let lastVisit = member.lastVisit {
                        Text("Last visit: \(formatRelativeDate(lastVisit))")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }
                }
            }
            
            Spacer()
            
            // Action button
            Button(action: {
                // TODO: Show member details or actions
            }) {
                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
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
    
    // MARK: - Computed Properties
    private var filteredMembers: [CustomerInfo] {
        let filtered = members.filter { member in
            switch selectedFilter {
            case .all:
                return true
            case .active:
                return member.isActive
            case .expired:
                return !member.isActive && member.membershipStatus.contains("Expired")
            case .recent:
                return member.lastVisit != nil && Calendar.current.isDate(member.lastVisit!, inSameDayAs: Date())
            }
        }
        
        if searchText.isEmpty {
            return filtered
        } else {
            return filtered.filter { member in
                member.name.localizedCaseInsensitiveContains(searchText) ||
                member.email.localizedCaseInsensitiveContains(searchText)
            }
        }
    }
    
    // MARK: - Helper Methods
    private func loadMockData() {
        // Mock data for demonstration
        members = [
            CustomerInfo(
                id: "1",
                name: "Sarah Johnson",
                email: "sarah@example.com",
                membershipStatus: "Premium",
                isActive: true,
                lastVisit: Date(),
                profileImageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            ),
            CustomerInfo(
                id: "2",
                name: "Mike Chen",
                email: "mike@example.com",
                membershipStatus: "Basic",
                isActive: true,
                lastVisit: Calendar.current.date(byAdding: .day, value: -1, to: Date()),
                profileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            ),
            CustomerInfo(
                id: "3",
                name: "Emily Davis",
                email: "emily@example.com",
                membershipStatus: "Expired",
                isActive: false,
                lastVisit: Calendar.current.date(byAdding: .day, value: -7, to: Date()),
                profileImageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            ),
            CustomerInfo(
                id: "4",
                name: "David Wilson",
                email: "david@example.com",
                membershipStatus: "Premium Plus",
                isActive: true,
                lastVisit: Calendar.current.date(byAdding: .hour, value: -2, to: Date()),
                profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            ),
            CustomerInfo(
                id: "5",
                name: "Lisa Anderson",
                email: "lisa@example.com",
                membershipStatus: "Basic",
                isActive: true,
                lastVisit: Calendar.current.date(byAdding: .day, value: -3, to: Date()),
                profileImageUrl: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            )
        ]
    }
    
    private func formatRelativeDate(_ date: Date) -> String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .abbreviated
        return formatter.localizedString(for: date, relativeTo: Date())
    }
}

// MARK: - Supporting Types
enum MemberFilter: CaseIterable {
    case all, active, expired, recent
    
    var displayName: String {
        switch self {
        case .all: return "All"
        case .active: return "Active"
        case .expired: return "Expired"
        case .recent: return "Recent"
        }
    }
}

struct CustomerInfo: Identifiable {
    let id: String
    let name: String
    let email: String
    let membershipStatus: String
    let isActive: Bool
    let lastVisit: Date?
    let profileImageUrl: String
}

#Preview {
    StaffMembersView()
}