//
//  CustomerActivityView.swift
//  qrCheckin
//
//  Created by toan on 12/6/25.
//

import SwiftUI

struct CustomerActivityView: View {
    @EnvironmentObject private var viewModel: CustomerViewModel
    @State private var selectedFilter: ActivityFilter = .all
    @State private var searchText = ""
    @State private var showFilterSheet = false
    @State private var showStatsDetail = false
    @State private var isRefreshing = false
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Header with stats
                activityStatsHeader
                
                // Search and Filter Bar
                searchAndFilterBar
                
                // Activity List
                activityListView
            }
            .navigationTitle("Activity History")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    HStack {
                        Button(action: {
                            showStatsDetail = true
                        }) {
                            Image(systemName: "chart.bar.doc.horizontal")
                                .foregroundColor(.blue)
                        }
                        
                        Button(action: refreshData) {
                            Image(systemName: "arrow.clockwise")
                                .foregroundColor(.blue)
                        }
                        .disabled(isRefreshing)
                    }
                }
            }
            .sheet(isPresented: $showStatsDetail) {
                CustomerActivityStatsView()
                    .environmentObject(viewModel)
            }
            .sheet(isPresented: $showFilterSheet) {
                ActivityFilterSheet(
                    selectedFilter: $selectedFilter,
                    isPresented: $showFilterSheet
                )
            }
            .refreshable {
                await refreshActivityData()
            }
        }
        .onAppear {
            print("🎯 CustomerActivityView: View appeared, loading checkin history")
            print("🎯 CustomerActivityView: Current checkin history count: \(viewModel.checkinHistory.count)")
            viewModel.loadCheckinHistory()
        }
    }
    
    // MARK: - Activity Stats Header
    private var activityStatsHeader: some View {
        VStack(spacing: 16) {
            HStack(spacing: 20) {
                statCard(
                    title: "Total Check-ins",
                    value: "\(activityStats.totalCheckins)",
                    color: .green,
                    icon: "arrow.right.circle.fill"
                )
                
                statCard(
                    title: "This Month",
                    value: "\(activityStats.thisMonth)",
                    color: .blue,
                    icon: "calendar"
                )
                
                statCard(
                    title: "This Week",
                    value: "\(activityStats.thisWeek)",
                    color: .purple,
                    icon: "calendar.badge.plus"
                )
            }
        }
        .padding()
        .background(Color(.systemGroupedBackground))
    }
    
    private func statCard(title: String, value: String, color: Color, icon: String) -> some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundColor(color)
            
            Text(value)
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(.primary)
            
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 16)
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.1), radius: 2, x: 0, y: 1)
    }
    
    // MARK: - Search and Filter Bar
    private var searchAndFilterBar: some View {
        VStack(spacing: 12) {
            // Search bar
            HStack {
                Image(systemName: "magnifyingglass")
                    .foregroundColor(.secondary)
                
                TextField("Search activities...", text: $searchText)
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
                    ForEach(ActivityFilter.allCases, id: \.self) { filter in
                        filterChip(filter: filter)
                    }
                    
                    Button(action: {
                        showFilterSheet = true
                    }) {
                        HStack(spacing: 4) {
                            Image(systemName: "line.3.horizontal.decrease.circle")
                            Text("More Filters")
                        }
                        .font(.caption)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(Color(.systemGray5))
                        .foregroundColor(.secondary)
                        .cornerRadius(16)
                    }
                }
                .padding(.horizontal)
            }
        }
        .padding()
        .background(Color(.systemBackground))
    }
    
    private func filterChip(filter: ActivityFilter) -> some View {
        Button(action: {
            selectedFilter = filter
        }) {
            Text(filter.displayName)
                .font(.caption)
                .fontWeight(.medium)
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(selectedFilter == filter ? Color.blue : Color(.systemGray5))
                .foregroundColor(selectedFilter == filter ? .white : .secondary)
                .cornerRadius(16)
        }
    }
    
    // MARK: - Activity List
    private var activityListView: some View {
        List {
            if viewModel.isLoading && viewModel.checkinHistory.isEmpty {
                ForEach(0..<5, id: \.self) { _ in
                    ActivityRowSkeleton()
                        .listRowSeparator(.hidden)
                }
            } else if filteredActivities.isEmpty {
                emptyStateView
                    .listRowSeparator(.hidden)
            } else {
                ForEach(groupedActivities.keys.sorted(by: >), id: \.self) { date in
                    Section(header: sectionHeader(for: date)) {
                        ForEach(groupedActivities[date] ?? []) { activity in
                            ActivityRowView(activity: activity)
                                .listRowSeparator(.hidden)
                                .listRowBackground(Color.clear)
                        }
                    }
                }
            }
        }
        .listStyle(PlainListStyle())
        .background(Color(.systemGroupedBackground))
    }
    
    private func sectionHeader(for date: Date) -> some View {
        HStack {
            Text(formatSectionDate(date))
                .font(.subheadline)
                .fontWeight(.semibold)
                .foregroundColor(.primary)
            
            Spacer()
            
            Text("\(groupedActivities[date]?.count ?? 0) activities")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding(.vertical, 4)
        .background(Color(.systemGroupedBackground))
    }
    
    // MARK: - Empty State
    private var emptyStateView: some View {
        VStack(spacing: 20) {
            Image(systemName: "clock.arrow.circlepath")
                .font(.system(size: 48))
                .foregroundColor(.gray)
            
            Text("No Activity Found")
                .font(.title3)
                .fontWeight(.medium)
                .foregroundColor(.primary)
            
            Text(searchText.isEmpty ? 
                 "Your check-in and check-out activities will appear here" :
                 "No activities match your search criteria")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
            
            if searchText.isEmpty && selectedFilter == .all {
                Button("Refresh") {
                    refreshData()
                }
                .buttonStyle(.bordered)
                .tint(.blue)
            }
        }
        .padding(.vertical, 40)
        .frame(maxWidth: .infinity)
    }
    
    // MARK: - Computed Properties
    private var filteredActivities: [CheckinLog] {
        var activities = viewModel.checkinHistory
        print("🔍 CustomerActivityView: Starting with \(activities.count) total activities")
        
        // Apply search filter
        if !searchText.isEmpty {
            activities = activities.filter { activity in
                activity.event?.name.localizedCaseInsensitiveContains(searchText) == true ||
                activity.location?.localizedCaseInsensitiveContains(searchText) == true ||
                activity.notes?.localizedCaseInsensitiveContains(searchText) == true
            }
            print("🔍 CustomerActivityView: After search filter '\(searchText)': \(activities.count) activities")
        }
        
        // Apply type filter
        switch selectedFilter {
        case .all:
            break
        case .checkin:
            activities = activities.filter { $0.type == .checkin }
        case .checkout:
            activities = activities.filter { $0.type == .checkout }
        case .today:
            activities = activities.filter { Calendar.current.isDateInToday($0.timestamp) }
        case .thisWeek:
            let weekAgo = Calendar.current.date(byAdding: .weekOfYear, value: -1, to: Date()) ?? Date()
            activities = activities.filter { $0.timestamp >= weekAgo }
        case .thisMonth:
            let monthAgo = Calendar.current.date(byAdding: .month, value: -1, to: Date()) ?? Date()
            activities = activities.filter { $0.timestamp >= monthAgo }
        }
        
        print("🔍 CustomerActivityView: After \(selectedFilter) filter: \(activities.count) activities")
        let sorted = activities.sorted { $0.timestamp > $1.timestamp }
        print("🔍 CustomerActivityView: Final filtered activities: \(sorted.count)")
        
        return sorted
    }
    
    private var groupedActivities: [Date: [CheckinLog]] {
        Dictionary(grouping: filteredActivities) { activity in
            Calendar.current.startOfDay(for: activity.timestamp)
        }
    }
    
    private var activityStats: ActivityStats {
        let checkins = viewModel.checkinHistory.filter { $0.type == .checkin }
        let today = Date()
        let weekAgo = Calendar.current.date(byAdding: .weekOfYear, value: -1, to: today) ?? today
        let monthAgo = Calendar.current.date(byAdding: .month, value: -1, to: today) ?? today
        
        let stats = ActivityStats(
            totalCheckins: checkins.count,
            thisWeek: checkins.filter { $0.timestamp >= weekAgo }.count,
            thisMonth: checkins.filter { $0.timestamp >= monthAgo }.count
        )
        
        print("📊 CustomerActivityView: Activity stats calculated - Total: \(stats.totalCheckins), Week: \(stats.thisWeek), Month: \(stats.thisMonth)")
        return stats
    }
    
    private var currentStreak: Int {
        // Calculate current streak
        let checkinDates = viewModel.checkinHistory
            .filter { $0.type == .checkin }
            .map { Calendar.current.startOfDay(for: $0.timestamp) }
            .sorted(by: >)
        
        guard !checkinDates.isEmpty else { return 0 }
        
        let today = Calendar.current.startOfDay(for: Date())
        let yesterday = Calendar.current.date(byAdding: .day, value: -1, to: today)!
        
        var streak = 0
        var checkDate = today
        
        for date in checkinDates {
            if date == checkDate {
                streak += 1
                checkDate = Calendar.current.date(byAdding: .day, value: -1, to: checkDate)!
            } else if date == yesterday && checkDate == today {
                // Allow starting streak from yesterday if today has no checkin
                streak += 1
                checkDate = Calendar.current.date(byAdding: .day, value: -1, to: date)!
            } else {
                break
            }
        }
        
        return streak
    }
    
    private var last30DaysCheckins: [CheckinLog] {
        let thirtyDaysAgo = Calendar.current.date(byAdding: .day, value: -30, to: Date()) ?? Date()
        return viewModel.checkinHistory
            .filter { $0.type == .checkin && $0.timestamp >= thirtyDaysAgo }
            .sorted { $0.timestamp < $1.timestamp }
    }
    
    // MARK: - Helper Methods
    private func refreshData() {
        isRefreshing = true
        viewModel.loadCheckinHistory()
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
            isRefreshing = false
        }
    }
    
    @MainActor
    private func refreshActivityData() async {
        await withCheckedContinuation { continuation in
            viewModel.loadCheckinHistory()
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
                continuation.resume()
            }
        }
    }
    
    private func formatSectionDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        let calendar = Calendar.current
        
        if calendar.isDateInToday(date) {
            return "Today"
        } else if calendar.isDateInYesterday(date) {
            return "Yesterday"
        } else if calendar.isDate(date, equalTo: Date(), toGranularity: .weekOfYear) {
            formatter.dateFormat = "EEEE"
            return formatter.string(from: date)
        } else {
            formatter.dateStyle = .medium
            return formatter.string(from: date)
        }
    }
}

// MARK: - Activity Row View
struct ActivityRowView: View {
    let activity: CheckinLog
    
    var body: some View {
        HStack(spacing: 16) {
            // Activity type indicator
            Circle()
                .fill(activity.type == .checkin ? Color.green : Color.red)
                .frame(width: 40, height: 40)
                .overlay(
                    Image(systemName: activity.type == .checkin ? "arrow.right" : "arrow.left")
                        .font(.title3)
                        .fontWeight(.semibold)
                        .foregroundColor(.white)
                )
            
            // Activity details
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(activity.type == .checkin ? "Check-in" : "Check-out")
                        .font(.headline)
                        .fontWeight(.semibold)
                        .foregroundColor(.primary)
                    
                    Spacer()
                    
                    Text(formatTime(activity.timestamp))
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                
                if let eventName = activity.event?.name {
                    HStack(spacing: 4) {
                        Image(systemName: "calendar")
                            .font(.caption)
                            .foregroundColor(.blue)
                        
                        Text(eventName)
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                }
                
                if let location = activity.location {
                    HStack(spacing: 4) {
                        Image(systemName: "location")
                            .font(.caption)
                            .foregroundColor(.orange)
                        
                        Text(location)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                
                if let notes = activity.notes, !notes.isEmpty {
                    HStack(spacing: 4) {
                        Image(systemName: "note.text")
                            .font(.caption)
                            .foregroundColor(.purple)
                        
                        Text(notes)
                            .font(.caption)
                            .foregroundColor(.secondary)
                            .lineLimit(1)
                    }
                }
            }
            
            Spacer()
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.1), radius: 2, x: 0, y: 1)
    }
    
    private func formatTime(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.timeStyle = .short
        return formatter.string(from: date)
    }
}

// MARK: - Activity Row Skeleton (Loading)
struct ActivityRowSkeleton: View {
    @State private var isAnimating = false
    
    var body: some View {
        HStack(spacing: 16) {
            Circle()
                .fill(Color.gray.opacity(0.3))
                .frame(width: 40, height: 40)
            
            VStack(alignment: .leading, spacing: 8) {
                Rectangle()
                    .fill(Color.gray.opacity(0.3))
                    .frame(height: 16)
                    .cornerRadius(4)
                
                Rectangle()
                    .fill(Color.gray.opacity(0.2))
                    .frame(height: 12)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .cornerRadius(4)
                
                Rectangle()
                    .fill(Color.gray.opacity(0.2))
                    .frame(height: 10)
                    .frame(maxWidth: 120)
                    .cornerRadius(4)
            }
            
            Spacer()
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .opacity(isAnimating ? 0.5 : 1.0)
        .animation(
            Animation.easeInOut(duration: 1.0).repeatForever(autoreverses: true),
            value: isAnimating
        )
        .onAppear {
            isAnimating = true
        }
    }
}

// MARK: - Activity Filter Sheet
struct ActivityFilterSheet: View {
    @Binding var selectedFilter: ActivityFilter
    @Binding var isPresented: Bool
    
    var body: some View {
        NavigationView {
            List {
                Section("Filter by Type") {
                    ForEach(ActivityFilter.allCases, id: \.self) { filter in
                        Button(action: {
                            selectedFilter = filter
                            isPresented = false
                        }) {
                            HStack {
                                Text(filter.displayName)
                                    .foregroundColor(.primary)
                                
                                Spacer()
                                
                                if selectedFilter == filter {
                                    Image(systemName: "checkmark")
                                        .foregroundColor(.blue)
                                }
                            }
                        }
                    }
                }
            }
            .navigationTitle("Filter Activities")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        isPresented = false
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Clear") {
                        selectedFilter = .all
                        isPresented = false
                    }
                }
            }
        }
    }
}

// MARK: - Supporting Types
enum ActivityFilter: CaseIterable {
    case all
    case checkin
    case checkout
    case today
    case thisWeek
    case thisMonth
    
    var displayName: String {
        switch self {
        case .all: return "All"
        case .checkin: return "Check-ins"
        case .checkout: return "Check-outs"
        case .today: return "Today"
        case .thisWeek: return "This Week"
        case .thisMonth: return "This Month"
        }
    }
}

struct ActivityStats {
    let totalCheckins: Int
    let thisWeek: Int
    let thisMonth: Int
}

// MARK: - Activity Trend Chart
struct ActivityTrendChart: View {
    let checkins: [CheckinLog]
    
    var body: some View {
        let dailyData = generateDailyData()
        let maxCount = dailyData.values.max() ?? 1
        
        HStack(alignment: .bottom, spacing: 2) {
            ForEach(dailyData.keys.sorted(), id: \.self) { date in
                let count = dailyData[date] ?? 0
                let height = maxCount > 0 ? (Double(count) / Double(maxCount)) * 80 : 2
                
                Rectangle()
                    .fill(Color.blue.opacity(0.7))
                    .frame(width: 8, height: max(2, height))
                    .cornerRadius(2)
            }
        }
        .frame(height: 80)
    }
    
    private func generateDailyData() -> [Date: Int] {
        let calendar = Calendar.current
        let thirtyDaysAgo = calendar.date(byAdding: .day, value: -30, to: Date()) ?? Date()
        var dailyCount: [Date: Int] = [:]
        
        // Initialize all days with 0
        for i in 0..<30 {
            if let date = calendar.date(byAdding: .day, value: i, to: thirtyDaysAgo) {
                dailyCount[calendar.startOfDay(for: date)] = 0
            }
        }
        
        // Count checkins per day
        for checkin in checkins {
            let day = calendar.startOfDay(for: checkin.timestamp)
            dailyCount[day, default: 0] += 1
        }
        
        return dailyCount
    }
}

// MARK: - Weekly Pattern Chart
struct WeeklyPatternChart: View {
    let checkins: [CheckinLog]
    
    var body: some View {
        let weeklyData = generateWeeklyData()
        let maxCount = weeklyData.values.max() ?? 1
        
        HStack(alignment: .bottom, spacing: 16) {
            ForEach(1...7, id: \.self) { weekday in
                let count = weeklyData[weekday] ?? 0
                let height = maxCount > 0 ? (Double(count) / Double(maxCount)) * 80 : 2
                
                VStack(spacing: 8) {
                    Rectangle()
                        .fill(Color.green.opacity(0.7))
                        .frame(width: 30, height: max(2, height))
                        .cornerRadius(4)
                    
                    Text(dayName(for: weekday))
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
            }
        }
        .frame(height: 100)
    }
    
    private func generateWeeklyData() -> [Int: Int] {
        var weeklyCount: [Int: Int] = [:]
        
        for checkin in checkins {
            let weekday = Calendar.current.component(.weekday, from: checkin.timestamp)
            weeklyCount[weekday, default: 0] += 1
        }
        
        return weeklyCount
    }
    
    private func dayName(for weekday: Int) -> String {
        let formatter = DateFormatter()
        let dayNames = formatter.shortWeekdaySymbols ?? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        return dayNames[weekday - 1]
    }
}

#Preview {
    CustomerActivityView()
        .environmentObject(CustomerViewModel())
}
