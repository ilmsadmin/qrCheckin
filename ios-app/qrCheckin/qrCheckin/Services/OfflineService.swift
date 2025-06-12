//
//  OfflineService.swift
//  qrCheckin
//
//  Created by toan on 12/6/25.
//

import Foundation
import Combine

struct OfflineCheckinItem: Codable {
    let id: String
    let qrCode: String
    let eventId: String
    let type: CheckinType
    let timestamp: Date
    
    init(qrCode: String, eventId: String, type: CheckinType) {
        self.id = UUID().uuidString
        self.qrCode = qrCode
        self.eventId = eventId
        self.type = type
        self.timestamp = Date()
    }
}

class OfflineService: ObservableObject {
    static let shared = OfflineService()
    
    @Published var isOnline = true
    @Published var offlineQueue: [OfflineCheckinItem] = []
    
    private let graphQLService = GraphQLService.shared
    private var cancellables = Set<AnyCancellable>()
    
    private init() {
        loadOfflineQueue()
        setupNetworkMonitoring()
    }
    
    // MARK: - Network Monitoring
    private func setupNetworkMonitoring() {
        // Simple network monitoring - in a real app you'd use Network framework
        Timer.publish(every: 5.0, on: .main, in: .common)
            .autoconnect()
            .sink { [weak self] _ in
                self?.checkNetworkStatus()
            }
            .store(in: &cancellables)
    }
    
    private func checkNetworkStatus() {
        // Simple ping to check connectivity
        // In a real app, you'd use proper network monitoring
        let url = URL(string: Constants.API.baseURL)!
        var request = URLRequest(url: url)
        request.timeoutInterval = 5.0
        
        URLSession.shared.dataTask(with: request) { [weak self] _, response, error in
            DispatchQueue.main.async {
                if let httpResponse = response as? HTTPURLResponse,
                   httpResponse.statusCode >= 200 && httpResponse.statusCode < 300 {
                    self?.handleOnlineStatus()
                } else {
                    self?.handleOfflineStatus()
                }
            }
        }.resume()
    }
    
    private func handleOnlineStatus() {
        if !isOnline {
            isOnline = true
            syncOfflineQueue()
        }
    }
    
    private func handleOfflineStatus() {
        isOnline = false
    }
    
    // MARK: - Offline Queue Management
    func queueCheckin(qrCode: String, eventId: String, type: CheckinType) {
        let item = OfflineCheckinItem(qrCode: qrCode, eventId: eventId, type: type)
        offlineQueue.append(item)
        saveOfflineQueue()
    }
    
    private func syncOfflineQueue() {
        guard !offlineQueue.isEmpty else { return }
        
        let items = offlineQueue
        
        for item in items {
            graphQLService.performCheckin(qrCode: item.qrCode, eventId: item.eventId, type: item.type)
                .sink(
                    receiveCompletion: { [weak self] completion in
                        if case .success = completion {
                            self?.removeFromQueue(item)
                        }
                    },
                    receiveValue: { _ in }
                )
                .store(in: &cancellables)
        }
    }
    
    private func removeFromQueue(_ item: OfflineCheckinItem) {
        offlineQueue.removeAll { $0.id == item.id }
        saveOfflineQueue()
    }
    
    // MARK: - Persistence
    private func loadOfflineQueue() {
        if let data = UserDefaults.standard.data(forKey: Constants.UserDefaults.offlineQueue),
           let items = try? JSONDecoder().decode([OfflineCheckinItem].self, from: data) {
            offlineQueue = items
        }
    }
    
    private func saveOfflineQueue() {
        if let data = try? JSONEncoder().encode(offlineQueue) {
            UserDefaults.standard.set(data, forKey: Constants.UserDefaults.offlineQueue)
        }
    }
    
    // MARK: - Public Methods
    func clearOfflineQueue() {
        offlineQueue.removeAll()
        saveOfflineQueue()
    }
    
    func getQueuedItemsCount() -> Int {
        return offlineQueue.count
    }
}