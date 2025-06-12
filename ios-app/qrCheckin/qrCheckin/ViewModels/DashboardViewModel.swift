//
//  DashboardViewModel.swift
//  qrCheckin
//
//  Created by toan on 12/6/25.
//

import Foundation
import Combine

struct DashboardStats {
    let checkins: Int
    let checkouts: Int
    let activeUsers: Int
    
    static let empty = DashboardStats(checkins: 0, checkouts: 0, activeUsers: 0)
}

@MainActor
class DashboardViewModel: ObservableObject {
    @Published var activeEvents: [Event] = []
    @Published var recentActivity: [CheckinLog] = []
    @Published var todayStats: DashboardStats = .empty
    @Published var isLoading = false
    @Published var error: AppError?
    
    private let graphQLService = GraphQLService.shared
    private var cancellables = Set<AnyCancellable>()
    
    init() {
        loadData()
    }
    
    func loadData() {
        loadActiveEvents()
        loadRecentActivity()
        loadTodayStats()
    }
    
    func refresh() {
        loadData()
    }
    
    private func loadActiveEvents() {
        isLoading = true
        
        graphQLService.fetchEvents()
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.error = error
                    }
                },
                receiveValue: { [weak self] events in
                    // Filter for active events (ongoing or upcoming today)
                    let now = Date()
                    let today = Calendar.current.startOfDay(for: now)
                    let tomorrow = Calendar.current.date(byAdding: .day, value: 1, to: today)!
                    
                    self?.activeEvents = events.filter { event in
                        event.isActive && (
                            event.isOngoing ||
                            (event.startTime >= today && event.startTime < tomorrow)
                        )
                    }.sorted { $0.startTime < $1.startTime }
                }
            )
            .store(in: &cancellables)
    }
    
    private func loadRecentActivity() {
        graphQLService.fetchRecentCheckins(limit: 10)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        print("Failed to load recent activity: \(error.localizedDescription)")
                    }
                },
                receiveValue: { [weak self] checkins in
                    self?.recentActivity = checkins
                }
            )
            .store(in: &cancellables)
    }
    
    private func loadTodayStats() {
        // For now, calculate from recent activity
        // In a real app, this would be a separate API call
        let today = Calendar.current.startOfDay(for: Date())
        let tomorrow = Calendar.current.date(byAdding: .day, value: 1, to: today)!
        
        let todayCheckins = recentActivity.filter { checkin in
            checkin.timestamp >= today && checkin.timestamp < tomorrow
        }
        
        let checkins = todayCheckins.filter { $0.type == .checkin }.count
        let checkouts = todayCheckins.filter { $0.type == .checkout }.count
        
        todayStats = DashboardStats(
            checkins: checkins,
            checkouts: checkouts,
            activeUsers: max(0, checkins - checkouts)
        )
    }
}