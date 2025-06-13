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
    @Published var error: Error?
    @Published var clubs: [Club] = []
    @Published var selectedClub: Club?
    
    private let graphQLService = GraphQLService.shared
    private var cancellables = Set<AnyCancellable>()
    
    init() {
        loadData()
    }
    
    func loadData() {
        loadActiveEvents()
        loadRecentActivity()
        loadTodayStats()
        loadClubs()
    }
    
    func refresh() {
        loadData()
    }
    
    private func loadClubs() {
        isLoading = true
        
        graphQLService.fetchClubs()
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        self?.error = error
                    }
                    self?.isLoading = false
                },
                receiveValue: { [weak self] clubs in
                    self?.clubs = clubs.filter { $0.isActive }
                    if self?.selectedClub == nil && !clubs.isEmpty {
                        self?.selectedClub = clubs.first
                    }
                }
            )
            .store(in: &cancellables)
    }
    
    private func loadActiveEvents() {
        print("📅 DashboardViewModel: Loading active events")
        isLoading = true
        
        graphQLService.fetchEvents()
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        print("❌ DashboardViewModel: Failed to load events - \(error.localizedDescription)")
                        self?.error = error
                    }
                },
                receiveValue: { [weak self] events in
                    print("✅ DashboardViewModel: Loaded \(events.count) total events")
                    // Filter for active events (ongoing or upcoming today)
                    let now = Date()
                    let today = Calendar.current.startOfDay(for: now)
                    let tomorrow = Calendar.current.date(byAdding: .day, value: 1, to: today)!
                    
                    let filtered = events.filter { event in
                        event.isActive && (
                            event.isOngoing ||
                            (event.startTime >= today && event.startTime < tomorrow)
                        )
                    }.sorted { $0.startTime < $1.startTime }
                    
                    print("📅 DashboardViewModel: Filtered to \(filtered.count) active events")
                    for event in filtered {
                        print("   - \(event.name) at \(event.startTime)")
                    }
                    
                    self?.activeEvents = filtered
                }
            )
            .store(in: &cancellables)
    }
    
    private func loadRecentActivity() {
        print("⏰ DashboardViewModel: Loading recent activity")
        graphQLService.fetchRecentCheckins(limit: 10)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { completion in
                    if case .failure(let error) = completion {
                        print("❌ DashboardViewModel: Failed to load recent activity - \(error.localizedDescription)")
                    }
                },
                receiveValue: { [weak self] checkins in
                    print("✅ DashboardViewModel: Loaded \(checkins.count) recent checkins")
                    for checkin in checkins {
                        print("   - \(checkin.type.rawValue) by \(checkin.user?.displayName ?? "Unknown") at \(checkin.timestamp)")
                    }
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
    
    // MARK: - Filtering Methods
    func filterEventsByClub(clubId: String?) {
        if let clubId = clubId {
            // Filter events to show only those from the selected club
            graphQLService.fetchEvents()
                .receive(on: DispatchQueue.main)
                .sink(
                    receiveCompletion: { [weak self] completion in
                        if case .failure(let error) = completion {
                            self?.error = error
                        }
                    },
                    receiveValue: { [weak self] events in
                        let now = Date()
                        let today = Calendar.current.startOfDay(for: now)
                        let tomorrow = Calendar.current.date(byAdding: .day, value: 1, to: today)!
                        
                        self?.activeEvents = events.filter { event in
                            event.isActive && 
                            event.clubId == clubId &&
                            (event.isOngoing || (event.startTime >= today && event.startTime < tomorrow))
                        }.sorted { $0.startTime < $1.startTime }
                    }
                )
                .store(in: &cancellables)
        } else {
            // Show all events if no club is selected
            loadActiveEvents()
        }
    }
    
    func clearClubFilter() {
        selectedClub = nil
        loadActiveEvents()
    }
}