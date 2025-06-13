//
//  CustomerActivityStatsView.swift
//  qrCheckin
//
//  Created by toan on 12/6/25.
//

import SwiftUI

struct CustomerActivityStatsView: View {
    @EnvironmentObject private var viewModel: CustomerViewModel
    @State private var selectedTimeRange: TimeRange = .month
    @State private var showDetailView = false
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 24) {
                    // Time Range Selector
                    timeRangeSelector
                    
                    // Overview Stats Cards
                    overviewStatsGrid
                    
                    // Activity Chart Section
                    activityChartSection
                    
                    // Streak and Achievements
                    streakAchievementsSection
                    
                    // Most Active Times
                    mostActiveTimesSection
                    
                    // Quick Actions
                    quickActionsSection
                }
                .padding()
            }
            .navigationTitle("Activity Stats")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: {
                        showDetailView = true
                    }) {
                        Image(systemName: "chart.bar.doc.horizontal")
                    }
                }
            }
            .sheet(isPresented: $showDetailView) {
                ActivityDetailReportView()
                    .environmentObject(viewModel)
            }
        }
        .onAppear {
            viewModel.loadCheckinHistory(limit: 200)
        }
    }
    
    // MARK: - Time Range Selector
    private var timeRangeSelector: some View {
        HStack(spacing: 8) {
            ForEach(TimeRange.allCases, id: \.self) { range in
                Button(action: {
                    selectedTimeRange = range
                }) {
                    Text(range.displayName)
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 8)
                        .background(selectedTimeRange == range ? Color.blue : Color(.systemGray5))
                        .foregroundColor(selectedTimeRange == range ? .white : .primary)
                        .cornerRadius(20)
                }
            }
            
            Spacer()
        }
    }
    
    // MARK: - Overview Stats Grid
    private var overviewStatsGrid: some View {
        LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 2), spacing: 16) {
            statsCard(
                title: "Total Check-ins",
                value: "\(filteredStats.totalCheckins)",
                subtitle: "All time",
                color: .green,
                icon: "arrow.right.circle.fill"
            )
            
            statsCard(
                title: "This \(selectedTimeRange.displayName)",
                value: "\(currentPeriodCheckins)",
                subtitle: "Check-ins",
                color: .blue,
                icon: "calendar"
            )
            
            statsCard(
                title: "Avg. Session",
                value: filteredStats.averageSessionDurationFormatted,
                subtitle: "Duration",
                color: .purple,
                icon: "clock"
            )
            
            statsCard(
                title: "Longest Streak",
                value: "\(filteredStats.longestStreak)",
                subtitle: "Days",
                color: .orange,
                icon: "flame.fill"
            )
        }
    }
    
    private func statsCard(title: String, value: String, subtitle: String, color: Color, icon: String) -> some View {
        VStack(spacing: 12) {
            HStack {
                Image(systemName: icon)
                    .font(.title2)
                    .foregroundColor(color)
                
                Spacer()
            }
            
            VStack(alignment: .leading, spacing: 4) {
                Text(value)
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(.primary)
                
                Text(title)
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(.primary)
                
                Text(subtitle)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
        .shadow(color: Color.black.opacity(0.1), radius: 5, x: 0, y: 2)
    }
    
    // MARK: - Activity Chart Section
    private var activityChartSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text("Activity Trends")
                    .font(.headline)
                    .fontWeight(.bold)
                
                Spacer()
                
                Text("Last \(selectedTimeRange.displayName)")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            ActivityChartView(
                data: chartData,
                timeRange: selectedTimeRange
            )
            .frame(height: 200)
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
        .shadow(color: Color.black.opacity(0.1), radius: 5, x: 0, y: 2)
    }
    
    // MARK: - Streak and Achievements
    private var streakAchievementsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Achievements")
                .font(.headline)
                .fontWeight(.bold)
            
            VStack(spacing: 12) {
                achievementRow(
                    title: "Current Streak",
                    value: "\(currentStreak) days",
                    icon: "flame.fill",
                    color: currentStreak > 0 ? .orange : .gray,
                    isActive: currentStreak > 0
                )
                
                achievementRow(
                    title: "Most Active Day",
                    value: filteredStats.mostActiveDay,
                    icon: "star.fill",
                    color: .yellow,
                    isActive: true
                )
                
                achievementRow(
                    title: "Monthly Goal",
                    value: "\(filteredStats.checkinsThisMonth)/20",
                    icon: "target",
                    color: filteredStats.checkinsThisMonth >= 20 ? .green : .blue,
                    isActive: filteredStats.checkinsThisMonth >= 20
                )
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
        .shadow(color: Color.black.opacity(0.1), radius: 5, x: 0, y: 2)
    }
    
    private func achievementRow(title: String, value: String, icon: String, color: Color, isActive: Bool) -> some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundColor(color)
                .frame(width: 24)
            
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(.primary)
                
                Text(value)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            if isActive {
                Image(systemName: "checkmark.circle.fill")
                    .foregroundColor(.green)
            }
        }
        .padding(.vertical, 4)
    }
    
    // MARK: - Most Active Times
    private var mostActiveTimesSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Peak Activity Hours")
                .font(.headline)
                .fontWeight(.bold)
            
            HourlyActivityChart(checkins: viewModel.checkinHistory.filter { $0.type == .checkin })
                .frame(height: 120)
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
        .shadow(color: Color.black.opacity(0.1), radius: 5, x: 0, y: 2)
    }
    
    // MARK: - Quick Actions
    private var quickActionsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Quick Actions")
                .font(.headline)
                .fontWeight(.bold)
            
            HStack(spacing: 16) {
                quickActionButton(
                    title: "View All Activities",
                    icon: "list.bullet",
                    color: .blue,
                    action: {
                        viewModel.selectedTab = 2
                    }
                )
                
                quickActionButton(
                    title: "Export Data",
                    icon: "square.and.arrow.up",
                    color: .green,
                    action: {
                        // TODO: Export functionality
                    }
                )
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
        .shadow(color: Color.black.opacity(0.1), radius: 5, x: 0, y: 2)
    }
    
    private func quickActionButton(title: String, icon: String, color: Color, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack {
                Image(systemName: icon)
                    .font(.title3)
                    .foregroundColor(color)
                
                Text(title)
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(.primary)
                
                Spacer()
                
                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            .padding()
            .background(Color(.systemGray6))
            .cornerRadius(12)
        }
    }
    
    // MARK: - Computed Properties
    private var filteredStats: ActivityStatistics {
        return viewModel.activityStats
    }
    
    private var currentPeriodCheckins: Int {
        let checkins = viewModel.checkinHistory.filter { $0.type == .checkin }
        let now = Date()
        
        switch selectedTimeRange {
        case .week:
            let weekAgo = Calendar.current.date(byAdding: .weekOfYear, value: -1, to: now) ?? now
            return checkins.filter { $0.timestamp >= weekAgo }.count
        case .month:
            let monthAgo = Calendar.current.date(byAdding: .month, value: -1, to: now) ?? now
            return checkins.filter { $0.timestamp >= monthAgo }.count
        case .quarter:
            let quarterAgo = Calendar.current.date(byAdding: .month, value: -3, to: now) ?? now
            return checkins.filter { $0.timestamp >= quarterAgo }.count
        case .year:
            let yearAgo = Calendar.current.date(byAdding: .year, value: -1, to: now) ?? now
            return checkins.filter { $0.timestamp >= yearAgo }.count
        }
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
    
    private var chartData: [ChartDataPoint] {
        // Generate chart data based on selected time range
        let checkins = viewModel.checkinHistory.filter { $0.type == .checkin }
        let now = Date()
        let calendar = Calendar.current
        
        switch selectedTimeRange {
        case .week:
            let weekAgo = calendar.date(byAdding: .weekOfYear, value: -1, to: now) ?? now
            return generateDailyData(from: weekAgo, to: now, checkins: checkins)
        case .month:
            let monthAgo = calendar.date(byAdding: .month, value: -1, to: now) ?? now
            return generateDailyData(from: monthAgo, to: now, checkins: checkins)
        case .quarter:
            let quarterAgo = calendar.date(byAdding: .month, value: -3, to: now) ?? now
            return generateWeeklyData(from: quarterAgo, to: now, checkins: checkins)
        case .year:
            let yearAgo = calendar.date(byAdding: .year, value: -1, to: now) ?? now
            return generateMonthlyData(from: yearAgo, to: now, checkins: checkins)
        }
    }
    
    private func generateDailyData(from startDate: Date, to endDate: Date, checkins: [CheckinLog]) -> [ChartDataPoint] {
        var data: [ChartDataPoint] = []
        let calendar = Calendar.current
        var currentDate = startDate
        
        while currentDate <= endDate {
            let dayCheckins = checkins.filter { calendar.isDate($0.timestamp, inSameDayAs: currentDate) }
            data.append(ChartDataPoint(
                date: currentDate,
                value: Double(dayCheckins.count),
                label: DateFormatter.dayFormatter.string(from: currentDate)
            ))
            currentDate = calendar.date(byAdding: .day, value: 1, to: currentDate) ?? currentDate
        }
        
        return data
    }
    
    private func generateWeeklyData(from startDate: Date, to endDate: Date, checkins: [CheckinLog]) -> [ChartDataPoint] {
        var data: [ChartDataPoint] = []
        let calendar = Calendar.current
        var currentDate = calendar.dateInterval(of: .weekOfYear, for: startDate)?.start ?? startDate
        
        while currentDate <= endDate {
            let weekEnd = calendar.date(byAdding: .weekOfYear, value: 1, to: currentDate) ?? currentDate
            let weekCheckins = checkins.filter { $0.timestamp >= currentDate && $0.timestamp < weekEnd }
            data.append(ChartDataPoint(
                date: currentDate,
                value: Double(weekCheckins.count),
                label: "Week of \(DateFormatter.shortDateFormatter.string(from: currentDate))"
            ))
            currentDate = weekEnd
        }
        
        return data
    }
    
    private func generateMonthlyData(from startDate: Date, to endDate: Date, checkins: [CheckinLog]) -> [ChartDataPoint] {
        var data: [ChartDataPoint] = []
        let calendar = Calendar.current
        var currentDate = calendar.dateInterval(of: .month, for: startDate)?.start ?? startDate
        
        while currentDate <= endDate {
            let monthEnd = calendar.date(byAdding: .month, value: 1, to: currentDate) ?? currentDate
            let monthCheckins = checkins.filter { $0.timestamp >= currentDate && $0.timestamp < monthEnd }
            data.append(ChartDataPoint(
                date: currentDate,
                value: Double(monthCheckins.count),
                label: DateFormatter.monthFormatter.string(from: currentDate)
            ))
            currentDate = monthEnd
        }
        
        return data
    }
}

// MARK: - Supporting Views
struct ActivityChartView: View {
    let data: [ChartDataPoint]
    let timeRange: TimeRange
    
    var body: some View {
        VStack {
            if data.isEmpty {
                Text("No data available")
                    .foregroundColor(.secondary)
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else {
                // Simple bar chart representation
                HStack(alignment: .bottom, spacing: 4) {
                    ForEach(data.indices, id: \.self) { index in
                        let point = data[index]
                        let maxValue = data.map(\.value).max() ?? 1
                        let height = maxValue > 0 ? (point.value / maxValue) * 150 : 0
                        
                        VStack {
                            Rectangle()
                                .fill(Color.blue.opacity(0.7))
                                .frame(width: max(8, CGFloat(300 / data.count) - 4), height: max(2, height))
                                .cornerRadius(2)
                            
                            if data.count <= 7 {
                                Text(String(Int(point.value)))
                                    .font(.caption2)
                                    .foregroundColor(.secondary)
                            }
                        }
                    }
                }
                .frame(height: 150)
            }
        }
    }
}

struct HourlyActivityChart: View {
    let checkins: [CheckinLog]
    
    var body: some View {
        let hourlyData = generateHourlyData()
        
        HStack(alignment: .bottom, spacing: 2) {
            ForEach(0..<24, id: \.self) { hour in
                let count = hourlyData[hour] ?? 0
                let maxCount = hourlyData.values.max() ?? 1
                let height = maxCount > 0 ? (Double(count) / Double(maxCount)) * 80 : 0
                
                VStack {
                    Rectangle()
                        .fill(Color.blue.opacity(0.6))
                        .frame(width: 10, height: max(2, height))
                        .cornerRadius(1)
                    
                    if hour % 6 == 0 {
                        Text("\(hour):00")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }
                }
            }
        }
        .frame(height: 100)
    }
    
    private func generateHourlyData() -> [Int: Int] {
        var hourlyCount: [Int: Int] = [:]
        
        for checkin in checkins {
            let hour = Calendar.current.component(.hour, from: checkin.timestamp)
            hourlyCount[hour, default: 0] += 1
        }
        
        return hourlyCount
    }
}

// MARK: - Supporting Types
enum TimeRange: CaseIterable {
    case week, month, quarter, year
    
    var displayName: String {
        switch self {
        case .week: return "Week"
        case .month: return "Month"
        case .quarter: return "Quarter"
        case .year: return "Year"
        }
    }
}

struct ChartDataPoint {
    let date: Date
    let value: Double
    let label: String
}

// MARK: - Date Formatters
extension DateFormatter {
    static let dayFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateFormat = "EEE"
        return formatter
    }()
    
    static let shortDateFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateStyle = .short
        return formatter
    }()
    
    static let monthFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMM"
        return formatter
    }()
}

// MARK: - Detail Report View
struct ActivityDetailReportView: View {
    @EnvironmentObject private var viewModel: CustomerViewModel
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    // Report will be implemented here
                    Text("Detailed Activity Report")
                        .font(.title2)
                        .padding()
                    
                    Text("Coming Soon...")
                        .foregroundColor(.secondary)
                }
                .padding()
            }
            .navigationTitle("Detailed Report")
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
}

#Preview {
    CustomerActivityStatsView()
        .environmentObject(CustomerViewModel())
}
