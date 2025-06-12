//
//  ScannerViewModel.swift
//  qrCheckin
//
//  Created by toan on 12/6/25.
//

import Foundation
import Combine
import SwiftUI

@MainActor
class ScannerViewModel: ObservableObject {
    @Published var events: [Event] = []
    @Published var selectedEvent: Event?
    @Published var recentCheckins: [CheckinLog] = []
    @Published var isLoading = false
    @Published var error: AppError?
    @Published var showAlert = false
    @Published var alertMessage = ""
    @Published var alertTitle = ""
    @Published var lastScannedCode = ""
    @Published var processingCheckin = false
    
    private let graphQLService = GraphQLService.shared
    private let qrScannerService = QRScannerService()
    private let offlineService = OfflineService.shared
    private var cancellables = Set<AnyCancellable>()
    
    init() {
        setupSubscriptions()
        loadEvents()
        loadRecentCheckins()
        loadSelectedEvent()
    }
    
    // MARK: - Setup
    private func setupSubscriptions() {
        // Listen for scanned QR codes
        qrScannerService.$scannedCode
            .receive(on: DispatchQueue.main)
            .sink { [weak self] code in
                if !code.isEmpty {
                    self?.handleScannedCode(code)
                }
            }
            .store(in: &cancellables)
        
        // Listen for scanner errors
        qrScannerService.$error
            .compactMap { $0 }
            .receive(on: DispatchQueue.main)
            .sink { [weak self] error in
                self?.showError(error)
            }
            .store(in: &cancellables)
    }
    
    // MARK: - Data Loading
    func loadEvents() {
        isLoading = true
        
        graphQLService.fetchEvents()
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.showError(error)
                    }
                },
                receiveValue: { [weak self] events in
                    self?.events = events.filter { $0.isActive }
                    
                    // Auto-select first ongoing or upcoming event
                    if self?.selectedEvent == nil {
                        self?.selectedEvent = events.first { $0.isOngoing } ?? events.first { $0.isUpcoming }
                    }
                }
            )
            .store(in: &cancellables)
    }
    
    func loadRecentCheckins() {
        graphQLService.fetchRecentCheckins(limit: 5)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        print("Failed to load recent checkins: \(error.localizedDescription)")
                    }
                },
                receiveValue: { [weak self] checkins in
                    self?.recentCheckins = checkins
                }
            )
            .store(in: &cancellables)
    }
    
    private func loadSelectedEvent() {
        if let eventId = UserDefaults.standard.string(forKey: Constants.UserDefaults.currentEventId),
           let event = events.first(where: { $0.id == eventId }) {
            selectedEvent = event
        }
    }
    
    // MARK: - Event Selection
    func selectEvent(_ event: Event) {
        selectedEvent = event
        UserDefaults.standard.set(event.id, forKey: Constants.UserDefaults.currentEventId)
    }
    
    // MARK: - QR Scanning
    var scannerService: QRScannerService {
        return qrScannerService
    }
    
    private func handleScannedCode(_ code: String) {
        guard !code.isEmpty, code != lastScannedCode else { return }
        
        lastScannedCode = code
        
        // Auto-determine check-in or check-out based on recent activity
        determineCheckinType(for: code)
    }
    
    private func determineCheckinType(for code: String) {
        // Check if user recently checked in for current event
        let recentCheckin = recentCheckins.first { checkin in
            checkin.qrCodeId == code && 
            checkin.eventId == selectedEvent?.id &&
            checkin.timestamp.timeIntervalSinceNow > -3600 // Within last hour
        }
        
        let type: CheckinType = (recentCheckin?.type == .checkin) ? .checkout : .checkin
        performCheckin(code: code, type: type)
    }
    
    // MARK: - Check-in Operations
    func performCheckin(code: String, type: CheckinType) {
        guard let selectedEvent = selectedEvent else {
            showError(AppError.validationError("Please select an event first"))
            return
        }
        
        processingCheckin = true
        
        // Check if offline - queue the item
        if !offlineService.isOnline {
            offlineService.queueCheckin(qrCode: code, eventId: selectedEvent.id, type: type)
            handleOfflineCheckin(code: code, type: type, event: selectedEvent)
            processingCheckin = false
            return
        }
        
        graphQLService.performCheckin(qrCode: code, eventId: selectedEvent.id, type: type)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.processingCheckin = false
                    if case .failure(let error) = completion {
                        // If network error, queue for offline processing
                        if case .networkError = error {
                            self?.offlineService.queueCheckin(qrCode: code, eventId: selectedEvent.id, type: type)
                            self?.handleOfflineCheckin(code: code, type: type, event: selectedEvent)
                        } else {
                            self?.showError(error)
                        }
                    }
                },
                receiveValue: { [weak self] checkinLog in
                    self?.handleSuccessfulCheckin(checkinLog)
                }
            )
            .store(in: &cancellables)
    }
    
    private func handleSuccessfulCheckin(_ checkinLog: CheckinLog) {
        // Add to recent checkins
        recentCheckins.insert(checkinLog, at: 0)
        if recentCheckins.count > 5 {
            recentCheckins.removeLast()
        }
        
        // Show success message
        let userName = checkinLog.user?.displayName ?? "User"
        let action = checkinLog.type == .checkin ? "checked in" : "checked out"
        
        showSuccess("\(userName) successfully \(action)")
        
        // Clear last scanned code after successful processing
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) { [weak self] in
            self?.lastScannedCode = ""
        }
    }
    
    private func handleOfflineCheckin(code: String, type: CheckinType, event: Event) {
        // Create a mock checkin log for immediate feedback
        let mockCheckin = CheckinLog(
            id: "offline_\(UUID().uuidString)",
            userId: "unknown",
            eventId: event.id,
            qrCodeId: code,
            type: type,
            timestamp: Date(),
            createdAt: Date(),
            user: User(
                id: "unknown",
                email: "",
                username: "Unknown User",
                firstName: nil,
                lastName: nil,
                role: .user,
                isActive: true,
                createdAt: Date(),
                updatedAt: Date()
            ),
            event: event
        )
        
        // Add to recent checkins
        recentCheckins.insert(mockCheckin, at: 0)
        if recentCheckins.count > 5 {
            recentCheckins.removeLast()
        }
        
        let action = type == .checkin ? "check-in" : "check-out"
        showSuccess("\(action.capitalized) queued for sync (offline mode)")
        
        // Clear last scanned code after processing
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) { [weak self] in
            self?.lastScannedCode = ""
        }
    }
    
    // MARK: - Manual Check-in
    func performManualCheckin(code: String, type: CheckinType) {
        performCheckin(code: code, type: type)
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
    
    // MARK: - Refresh
    func refresh() {
        loadEvents()
        loadRecentCheckins()
    }
}