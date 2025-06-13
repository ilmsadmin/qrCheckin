//
//  CustomerViewModel.swift
//  qrCheckin
//
//  Created by toan on 12/6/25.
//

import Foundation
import Combine

@MainActor
class CustomerViewModel: ObservableObject {
    @Published var isLoading = false
    @Published var showAlert = false
    @Published var alertTitle = ""
    @Published var alertMessage = ""
    
    // Customer data
    @Published var customerProfile: User?
    @Published var checkinHistory: [CheckinLog] = []
    @Published var subscriptionPackages: [SubscriptionPackage] = []
    
    // UI state
    @Published var showQREnlarged = false
    @Published var selectedTab = 0 // 0: Home, 1: QR, 2: Packages, 3: Profile
    
    private let graphQLService = GraphQLService.shared
    private var cancellables = Set<AnyCancellable>()
    
    init() {
        loadCustomerData()
    }
    
    func loadCustomerData() {
        print("🏋️ CustomerViewModel: Starting to load customer data")
        isLoading = true
        
        // Fetch customer profile with subscription data
        graphQLService.fetchCustomerProfile()
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        print("❌ CustomerViewModel: Failed to load profile - \(error.localizedDescription)")
                        self?.showError("Failed to load profile", error.localizedDescription)
                    }
                },
                receiveValue: { [weak self] user in
                    print("✅ CustomerViewModel: Successfully loaded customer profile - \(user.displayName)")
                    self?.customerProfile = user
                    self?.loadCheckinHistory()
                }
            )
            .store(in: &cancellables)
    }
    
    func loadCheckinHistory() {
        print("📋 CustomerViewModel: Loading checkin history")
        graphQLService.fetchCustomerCheckinHistory(limit: 10)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        print("❌ CustomerViewModel: Failed to load checkin history - \(error.localizedDescription)")
                    }
                },
                receiveValue: { [weak self] history in
                    print("✅ CustomerViewModel: Successfully loaded \(history.count) checkin history items")
                    for (index, item) in history.enumerated() {
                        print("   \(index + 1). \(item.type.rawValue) at \(item.timestamp) - \(item.event?.name ?? "Unknown event")")
                    }
                    self?.checkinHistory = history
                }
            )
            .store(in: &cancellables)
    }
    
    func loadSubscriptionPackages() {
        graphQLService.fetchSubscriptionPackages()
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        print("Failed to load packages: \(error.localizedDescription)")
                    }
                },
                receiveValue: { [weak self] packages in
                    self?.subscriptionPackages = packages.filter { $0.isActive }
                }
            )
            .store(in: &cancellables)
    }
    
    func refreshData() {
        loadCustomerData()
    }
    
    func enlargeQRCode() {
        showQREnlarged = true
    }
    
    func dismissQRCode() {
        showQREnlarged = false
    }
    
    // MARK: - Computed Properties
    var membershipCardTitle: String {
        guard let profile = customerProfile else { return "Loading..." }
        return profile.activeSubscription?.package?.name ?? "No Active Membership"
    }
    
    var membershipStatus: String {
        guard let profile = customerProfile else { return "Loading..." }
        return profile.membershipStatus
    }
    
    var membershipStatusColor: String {
        guard let profile = customerProfile else { return "gray" }
        return profile.hasActiveSubscription ? "green" : "red"
    }
    
    var memberSince: String {
        guard let profile = customerProfile else { return "N/A" }
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        return formatter.string(from: profile.createdAt)
    }
    
    var membershipExpiry: String {
        guard let subscription = customerProfile?.activeSubscription else { return "N/A" }
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        return formatter.string(from: subscription.endDate)
    }
    
    var qrCodeData: String {
        return customerProfile?.qrCode ?? "loading"
    }
    
    var hasQRCode: Bool {
        guard let qrCode = customerProfile?.qrCode else { return false }
        return !qrCode.isEmpty && qrCode != "loading"
    }
    
    var recentCheckins: [CheckinLog] {
        return Array(checkinHistory.prefix(5))
    }
    
    // MARK: - Helper Methods
    private func showError(_ title: String, _ message: String) {
        alertTitle = title
        alertMessage = message
        showAlert = true
    }
    
    func formatCheckinTime(_ checkin: CheckinLog) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .none
        formatter.timeStyle = .short
        
        let dateFormatter = DateFormatter()
        dateFormatter.dateStyle = .short
        dateFormatter.timeStyle = .none
        
        let calendar = Calendar.current
        if calendar.isDateInToday(checkin.timestamp) {
            return "Today, \(formatter.string(from: checkin.timestamp))"
        } else if calendar.isDateInYesterday(checkin.timestamp) {
            return "Yesterday, \(formatter.string(from: checkin.timestamp))"
        } else {
            return "\(dateFormatter.string(from: checkin.timestamp)), \(formatter.string(from: checkin.timestamp))"
        }
    }
}

// MARK: - Enhanced Activity Methods
extension CustomerViewModel {
    func loadCheckinHistory(limit: Int = 50) {
        print("📋 CustomerViewModel: Loading enhanced checkin history with limit \(limit)")
        graphQLService.fetchCustomerCheckinHistory(limit: limit)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        print("❌ CustomerViewModel: Failed to load enhanced checkin history - \(error.localizedDescription)")
                        self?.showError("Failed to load activity", error.localizedDescription)
                    }
                },
                receiveValue: { [weak self] history in
                    print("✅ CustomerViewModel: Successfully loaded \(history.count) enhanced checkin history items")
                    self?.checkinHistory = history
                }
            )
            .store(in: &cancellables)
    }
    
    func refreshActivityData() async {
        await withCheckedContinuation { continuation in
            loadCheckinHistory(limit: 100)
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                continuation.resume()
            }
        }
    }
    
    // MARK: - Activity Statistics
    var activityStats: ActivityStatistics {
        let checkins = checkinHistory.filter { $0.type == .checkin }
        let checkouts = checkinHistory.filter { $0.type == .checkout }
        let today = Date()
        let weekAgo = Calendar.current.date(byAdding: .weekOfYear, value: -1, to: today) ?? today
        let monthAgo = Calendar.current.date(byAdding: .month, value: -1, to: today) ?? today
        let yearAgo = Calendar.current.date(byAdding: .year, value: -1, to: today) ?? today
        
        return ActivityStatistics(
            totalActivities: checkinHistory.count,
            totalCheckins: checkins.count,
            totalCheckouts: checkouts.count,
            checkinsToday: checkins.filter { Calendar.current.isDateInToday($0.timestamp) }.count,
            checkinsThisWeek: checkins.filter { $0.timestamp >= weekAgo }.count,
            checkinsThisMonth: checkins.filter { $0.timestamp >= monthAgo }.count,
            checkinsThisYear: checkins.filter { $0.timestamp >= yearAgo }.count,
            averageSessionDuration: calculateAverageSessionDuration(),
            mostActiveDay: findMostActiveDay(),
            longestStreak: calculateLongestStreak()
        )
    }
    
    private func calculateAverageSessionDuration() -> Double {
        // Group checkins and checkouts by day and calculate average session duration
        let groupedByDay = Dictionary(grouping: checkinHistory) { activity in
            Calendar.current.startOfDay(for: activity.timestamp)
        }
        
        var totalDuration: TimeInterval = 0
        var sessionCount = 0
        
        for (_, activities) in groupedByDay {
            let sortedActivities = activities.sorted { $0.timestamp < $1.timestamp }
            var checkinTime: Date?
            
            for activity in sortedActivities {
                if activity.type == .checkin {
                    checkinTime = activity.timestamp
                } else if activity.type == .checkout, let checkin = checkinTime {
                    totalDuration += activity.timestamp.timeIntervalSince(checkin)
                    sessionCount += 1
                    checkinTime = nil
                }
            }
        }
        
        return sessionCount > 0 ? totalDuration / Double(sessionCount) / 3600 : 0 // Return hours
    }
    
    private func findMostActiveDay() -> String {
        let groupedByWeekday = Dictionary(grouping: checkinHistory.filter { $0.type == .checkin }) { activity in
            Calendar.current.component(.weekday, from: activity.timestamp)
        }
        
        let mostActive = groupedByWeekday.max { $0.value.count < $1.value.count }
        
        if let weekday = mostActive?.key {
            let formatter = DateFormatter()
            formatter.locale = Locale(identifier: "en_US")
            return formatter.weekdaySymbols[weekday - 1]
        }
        
        return "N/A"
    }
    
    private func calculateLongestStreak() -> Int {
        let checkinDates = checkinHistory
            .filter { $0.type == .checkin }
            .map { Calendar.current.startOfDay(for: $0.timestamp) }
            .sorted()
        
        guard !checkinDates.isEmpty else { return 0 }
        
        var longestStreak = 1
        var currentStreak = 1
        
        for i in 1..<checkinDates.count {
            let previousDate = checkinDates[i - 1]
            let currentDate = checkinDates[i]
            
            if Calendar.current.dateInterval(of: .day, for: currentDate)?.start ==
               Calendar.current.date(byAdding: .day, value: 1, to: previousDate) {
                currentStreak += 1
                longestStreak = max(longestStreak, currentStreak)
            } else if currentDate != previousDate {
                currentStreak = 1
            }
        }
        
        return longestStreak
    }
}

// MARK: - Activity Statistics Model
struct ActivityStatistics {
    let totalActivities: Int
    let totalCheckins: Int
    let totalCheckouts: Int
    let checkinsToday: Int
    let checkinsThisWeek: Int
    let checkinsThisMonth: Int
    let checkinsThisYear: Int
    let averageSessionDuration: Double // in hours
    let mostActiveDay: String
    let longestStreak: Int
    
    var averageSessionDurationFormatted: String {
        if averageSessionDuration < 1 {
            return String(format: "%.0f min", averageSessionDuration * 60)
        } else {
            return String(format: "%.1f hrs", averageSessionDuration)
        }
    }
}