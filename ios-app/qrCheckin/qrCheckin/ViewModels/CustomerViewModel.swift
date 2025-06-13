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
        isLoading = true
        
        // Fetch customer profile with subscription data
        graphQLService.fetchCustomerProfile()
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.showError("Failed to load profile", error.localizedDescription)
                    }
                },
                receiveValue: { [weak self] user in
                    self?.customerProfile = user
                    self?.loadCheckinHistory()
                }
            )
            .store(in: &cancellables)
    }
    
    func loadCheckinHistory() {
        graphQLService.fetchCustomerCheckinHistory(limit: 10)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        print("Failed to load checkin history: \(error.localizedDescription)")
                    }
                },
                receiveValue: { [weak self] history in
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