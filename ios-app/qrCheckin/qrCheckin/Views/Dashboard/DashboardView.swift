//
//  DashboardView.swift
//  qrCheckin
//
//  Created by toan on 12/6/25.
//

import SwiftUI

struct DashboardView: View {
    @StateObject private var viewModel = DashboardViewModel()
    @EnvironmentObject var loginViewModel: LoginViewModel
    
    var body: some View {
        NavigationView {
            ScrollView {
                LazyVStack(spacing: 20) {
                    // Header Stats
                    statsSection
                    
                    // Club Filter
                    clubFilterSection
                    
                    // Active Events
                    activeEventsSection
                    
                    // Recent Activity
                    recentActivitySection
                }
                .padding()
            }
            .navigationTitle("Dashboard")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: {
                        loginViewModel.logout()
                    }) {
                        Label("Logout", systemImage: "rectangle.portrait.and.arrow.right")
                    }
                }
                
                ToolbarItem(placement: .navigationBarLeading) {
                    Button(action: {
                        viewModel.refresh()
                    }) {
                        Label("Refresh", systemImage: "arrow.clockwise")
                    }
                }
            }
            .refreshable {
                viewModel.refresh()
            }
            .overlay {
                if viewModel.isLoading {
                    ProgressView()
                        .scaleEffect(1.5)
                        .background(
                            RoundedRectangle(cornerRadius: 10)
                                .fill(Color.white.opacity(0.8))
                                .frame(width: 100, height: 100)
                        )
                }
            }
            .alert(isPresented: .init(
                get: { viewModel.error != nil },
                set: { if !$0 { viewModel.error = nil } }
            )) {
                Alert(
                    title: Text("Error"),
                    message: Text(viewModel.error?.localizedDescription ?? "Unknown error"),
                    dismissButton: .default(Text("OK"))
                )
            }
        }
    }
    
    // MARK: - Stats Section
    private var statsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Today's Summary")
                .font(.headline)
            
            HStack(spacing: 16) {
                StatCardView(
                    title: "Check-ins",
                    value: "\(viewModel.todayStats.checkins)",
                    color: .green,
                    icon: "person.badge.plus"
                )
                
                StatCardView(
                    title: "Check-outs",
                    value: "\(viewModel.todayStats.checkouts)",
                    color: .red,
                    icon: "person.badge.minus"
                )
                
                StatCardView(
                    title: "Active Users",
                    value: "\(viewModel.todayStats.activeUsers)",
                    color: .blue,
                    icon: "person.3.fill"
                )
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.1), radius: 5, x: 0, y: 2)
    }
    
    // MARK: - Club Filter Section
    private var clubFilterSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Filter by Club")
                .font(.headline)
                
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 10) {
                    ClubFilterButton(
                        isSelected: viewModel.selectedClub == nil,
                        name: "All Clubs"
                    ) {
                        viewModel.selectedClub = nil
                        viewModel.loadData()
                    }
                    
                    ForEach(viewModel.clubs) { club in
                        ClubFilterButton(
                            isSelected: viewModel.selectedClub?.id == club.id,
                            name: club.name
                        ) {
                            viewModel.selectedClub = club
                            viewModel.filterEventsByClub(clubId: club.id)
                        }
                    }
                }
                .padding(.vertical, 5)
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.1), radius: 5, x: 0, y: 2)
    }
    
    // MARK: - Active Events Section
    private var activeEventsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Active Events")
                .font(.headline)
            
            if viewModel.activeEvents.isEmpty {
                VStack(spacing: 10) {
                    Image(systemName: "calendar.badge.clock")
                        .font(.system(size: 40))
                        .foregroundColor(.gray)
                    
                    Text("No active events at the moment")
                        .font(.subheadline)
                        .foregroundColor(.gray)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 30)
            } else {
                LazyVStack(spacing: 12) {
                    ForEach(viewModel.activeEvents) { event in
                        NavigationLink(destination: EventDetailView(event: event)) {
                            EventCardView(event: event)
                        }
                        .buttonStyle(PlainButtonStyle())
                    }
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.1), radius: 5, x: 0, y: 2)
    }
    
    // MARK: - Recent Activity Section
    private var recentActivitySection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Recent Activity")
                .font(.headline)
            
            if viewModel.recentActivity.isEmpty {
                VStack(spacing: 10) {
                    Image(systemName: "clock.arrow.circlepath")
                        .font(.system(size: 40))
                        .foregroundColor(.gray)
                    
                    Text("No recent activity")
                        .font(.subheadline)
                        .foregroundColor(.gray)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 30)
            } else {
                LazyVStack(spacing: 8) {
                    ForEach(viewModel.recentActivity) { checkin in
                        RecentCheckinRowView(checkin: checkin)
                    }
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.1), radius: 5, x: 0, y: 2)
    }
}

struct StatCardView: View {
    let title: String
    let value: String
    let color: Color
    let icon: String
    
    var body: some View {
        VStack {
            Image(systemName: icon)
                .font(.title2)
                .foregroundColor(color)
            
            Text(value)
                .font(.title2)
                .fontWeight(.bold)
            
            Text(title)
                .font(.caption)
                .foregroundColor(.gray)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(color.opacity(0.1))
        .cornerRadius(12)
    }
}

struct ClubFilterButton: View {
    let isSelected: Bool
    let name: String
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Text(name)
                .font(.subheadline)
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(isSelected ? Color.blue : Color.gray.opacity(0.2))
                .foregroundColor(isSelected ? .white : .primary)
                .cornerRadius(20)
        }
    }
}

struct EventCardView: View {
    let event: Event
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(event.name)
                    .font(.headline)
                
                Spacer()
                
                Text(event.isOngoing ? "LIVE" : "UPCOMING")
                    .font(.caption)
                    .fontWeight(.bold)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(event.isOngoing ? Color.green : Color.orange)
                    .foregroundColor(.white)
                    .cornerRadius(4)
            }
            
            if let location = event.location {
                HStack {
                    Image(systemName: "location")
                        .foregroundColor(.gray)
                    Text(location)
                        .font(.subheadline)
                        .foregroundColor(.gray)
                }
            }
            
            HStack {
                Image(systemName: "clock")
                    .foregroundColor(.gray)
                Text("\(event.startTime, formatter: timeFormatter) - \(event.endTime, formatter: timeFormatter)")
                    .font(.subheadline)
                    .foregroundColor(.gray)
            }
            
            if let maxCapacity = event.maxCapacity {
                HStack {
                    Image(systemName: "person.2")
                        .foregroundColor(.gray)
                    Text("Capacity: \(maxCapacity)")
                        .font(.subheadline)
                        .foregroundColor(.gray)
                }
            }
        }
        .padding()
        .background(Color(.secondarySystemBackground))
        .cornerRadius(12)
    }
}

private let timeFormatter: DateFormatter = {
    let formatter = DateFormatter()
    formatter.timeStyle = .short
    return formatter
}()

#Preview {
    DashboardView()
        .environmentObject(LoginViewModel())
}