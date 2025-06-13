//
//  MembersViewModel.swift
//  qrCheckin
//
//  Created by toan on 12/6/25.
//

import Foundation
import Combine
import SwiftUI

@MainActor
class MembersViewModel: ObservableObject {
    @Published var members: [Member] = []
    @Published var filteredMembers: [Member] = []
    @Published var memberStats: MemberStats?
    @Published var isLoading = false
    @Published var error: AppError?
    @Published var showAlert = false
    @Published var alertMessage = ""
    @Published var alertTitle = ""
    @Published var searchText = "" {
        didSet {
            // Debounce search to avoid too many API calls
            searchWorkItem?.cancel()
            let workItem = DispatchWorkItem {
                Task {
                    self.currentOffset = 0
                    self.hasMoreData = true
                    await self.loadMembersAsync()
                }
            }
            searchWorkItem = workItem
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.5, execute: workItem)
        }
    }
    @Published var selectedStatus: MemberStatus? {
        didSet {
            print("🔧 Filter changed to: \(selectedStatus?.rawValue ?? "nil")")
            // Reset pagination and reload with new filter
            currentOffset = 0
            hasMoreData = true
            Task {
                await loadMembersAsync()
            }
        }
    }
    @Published var selectedMember: Member?
    @Published var showMemberDetail = false
    
    private let graphQLService = GraphQLService.shared
    private var cancellables = Set<AnyCancellable>()
    private let pageSize = 50
    private var currentOffset = 0
    private var hasMoreData = true
    private var searchWorkItem: DispatchWorkItem?
    
    init() {
        Task {
            await loadInitialData()
        }
    }
    
    // MARK: - Data Loading (Async)
    func loadInitialData() async {
        await withTaskGroup(of: Void.self) { group in
            group.addTask {
                await self.loadMembersAsync()
            }
            group.addTask {
                await self.loadMemberStatsAsync()
            }
        }
    }
    
    // MARK: - Data Loading (Combine-based for compatibility)
    func loadMembers(refresh: Bool = false) {
        if refresh {
            currentOffset = 0
            hasMoreData = true
            members.removeAll()
        }
        
        guard !isLoading && hasMoreData else { return }
        
        isLoading = true
        
        let search = searchText.isEmpty ? nil : searchText
        let status = selectedStatus?.rawValue
        
        graphQLService.fetchMembers(
            search: search,
            status: status,
            limit: pageSize,
            offset: currentOffset
        )
        .receive(on: DispatchQueue.main)
        .sink(
            receiveCompletion: { [weak self] completion in
                self?.isLoading = false
                if case .failure(let error) = completion {
                    self?.showError(error)
                }
            },
            receiveValue: { [weak self] newMembers in
                if refresh {
                    self?.members = newMembers
                } else {
                    self?.members.append(contentsOf: newMembers)
                }
                
                self?.hasMoreData = newMembers.count == self?.pageSize
                self?.currentOffset += newMembers.count
                self?.filterMembers()
            }
        )
        .store(in: &cancellables)
    }
    
    func loadMoreMembers() {
        loadMembers(refresh: false)
    }
    
    func refreshMembers() async {
        currentOffset = 0
        hasMoreData = true
        members.removeAll()
        filteredMembers.removeAll()
        
        await withTaskGroup(of: Void.self) { group in
            group.addTask {
                await self.loadMembersAsync()
            }
            group.addTask {
                await self.loadMemberStatsAsync()
            }
        }
    }
    
    func loadMemberStats() {
        graphQLService.fetchMemberStats()
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { completion in
                    if case .failure(let error) = completion {
                        print("Failed to load member stats: \(error.localizedDescription)")
                    }
                },
                receiveValue: { [weak self] stats in
                    self?.memberStats = stats
                }
            )
            .store(in: &cancellables)
    }
    
    func loadMemberDetail(id: String) {
        isLoading = true
        
        graphQLService.fetchMember(id: id)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.showError(error)
                    }
                },
                receiveValue: { [weak self] member in
                    self?.selectedMember = member
                    self?.showMemberDetail = true
                }
            )
            .store(in: &cancellables)
    }
    
    // MARK: - Async Data Loading (Primary Methods)
    @MainActor
    private func loadMembersAsync() async {
        isLoading = true
        
        print("🔄 Loading members: search=\(searchText.isEmpty ? "nil" : searchText), status=\(selectedStatus?.rawValue ?? "nil"), offset=\(currentOffset)")
        
        do {
            let newMembers = try await graphQLService.fetchMembersAsync(
                searchText: searchText.isEmpty ? nil : searchText,
                status: selectedStatus,
                offset: currentOffset,
                limit: pageSize
            )
            
            print("📥 Received \(newMembers.count) members")
            
            if currentOffset == 0 {
                members = newMembers
            } else {
                members.append(contentsOf: newMembers)
            }
            
            hasMoreData = newMembers.count == pageSize
            currentOffset += newMembers.count
            filterMembers()
            
        } catch {
            print("❌ Error loading members: \(error)")
            showError(AppError.networkError(error.localizedDescription))
        }
        
        isLoading = false
    }
    
    @MainActor
    private func loadMemberStatsAsync() async {
        do {
            memberStats = try await graphQLService.fetchMemberStatsAsync()
        } catch {
            print("Failed to load member stats: \(error.localizedDescription)")
        }
    }
    
    // MARK: - Filtering
    private func filterMembers() {
        var filtered = members
        
        // Apply search filter
        if !searchText.isEmpty {
            filtered = filtered.filter { member in
                member.fullName.localizedCaseInsensitiveContains(searchText) ||
                member.email.localizedCaseInsensitiveContains(searchText) ||
                (member.phone?.localizedCaseInsensitiveContains(searchText) ?? false)
            }
        }
        
        // Apply status filter
        if let status = selectedStatus {
            filtered = filtered.filter { $0.status == status }
        }
        
        filteredMembers = filtered
    }
    
    // MARK: - Actions
    func selectMember(_ member: Member) {
        selectedMember = member
        showMemberDetail = true
    }
    
    func clearSearch() {
        searchText = ""
    }
    
    func clearStatusFilter() {
        selectedStatus = nil
    }
    
    // MARK: - Helper Methods
    func formatMemberSince(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        return formatter.string(from: date)
    }
    
    func formatLastActivity(_ date: Date?) -> String {
        guard let date = date else { return "No activity" }
        
        let components = Calendar.current.dateComponents([.day, .hour, .minute], from: date, to: Date())
        
        if let days = components.day, days > 0 {
            return "\(days) day\(days > 1 ? "s" : "") ago"
        } else if let hours = components.hour, hours > 0 {
            return "\(hours) hour\(hours > 1 ? "s" : "") ago"
        } else if let minutes = components.minute, minutes > 0 {
            return "\(minutes) minute\(minutes > 1 ? "s" : "") ago"
        } else {
            return "Just now"
        }
    }
    
    func formatSubscriptionExpiry(_ date: Date?) -> String {
        guard let date = date else { return "No subscription" }
        
        let components = Calendar.current.dateComponents([.day], from: Date(), to: date)
        let days = components.day ?? 0
        
        if days < 0 {
            return "Expired"
        } else if days == 0 {
            return "Expires today"
        } else if days < 30 {
            return "Expires in \(days) day\(days > 1 ? "s" : "")"
        } else {
            let months = days / 30
            return "Expires in \(months) month\(months > 1 ? "s" : "")"
        }
    }
    
    // MARK: - Error Handling
    private func showError(_ error: AppError) {
        self.error = error
        alertTitle = "Error"
        alertMessage = error.localizedDescription
        showAlert = true
    }
    
    private func showSuccess(_ message: String) {
        alertTitle = "Success"
        alertMessage = message
        showAlert = true
    }
}
