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
                    
                    // Active Events
                    activeEventsSection
                    
                    // Recent Activity
                    recentActivitySection
                }
                .padding()
            }
            .navigationTitle("Dashboard")
            .navigationBarItems(
                trailing: Button("Logout") {
                    loginViewModel.logout()
                }
            )
            .onAppear {
                viewModel.loadData()
            }
            .refreshable {
                viewModel.refresh()
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
                    title: "Active Events",
                    value: "\(viewModel.activeEvents.count)",
                    color: .blue,
                    icon: "calendar"
                )
            }
        }
    }
    
    // MARK: - Active Events Section
    private var activeEventsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Active Events")
                .font(.headline)
            
            if viewModel.activeEvents.isEmpty {
                Text("No active events")
                    .foregroundColor(.gray)
                    .frame(maxWidth: .infinity)
                    .padding()
            } else {
                LazyVStack(spacing: 12) {
                    ForEach(viewModel.activeEvents) { event in
                        EventCardView(event: event)
                    }
                }
            }
        }
    }
    
    // MARK: - Recent Activity Section
    private var recentActivitySection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Recent Activity")
                .font(.headline)
            
            if viewModel.recentActivity.isEmpty {
                Text("No recent activity")
                    .foregroundColor(.gray)
                    .frame(maxWidth: .infinity)
                    .padding()
            } else {
                LazyVStack(spacing: 8) {
                    ForEach(viewModel.recentActivity) { checkin in
                        RecentCheckinRowView(checkin: checkin)
                    }
                }
            }
        }
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
        .background(Color.gray.opacity(0.1))
        .cornerRadius(Constants.UI.cornerRadius)
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
        .background(Color.gray.opacity(0.1))
        .cornerRadius(Constants.UI.cornerRadius)
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