//
//  Constants.swift
//  qrCheckin
//
//  Created by toan on 12/6/25.
//

import Foundation

struct Constants {
    // MARK: - API Configuration
    struct API {
        static var baseURL: String {
            return ConfigManager.shared.apiBaseURL
        }
        
        static var graphQLEndpoint: String {
            return ConfigManager.shared.graphQLEndpoint
        }
        
        static var wsEndpoint: String {
            return ConfigManager.shared.wsEndpoint
        }
        
        static var timeoutInterval: TimeInterval {
            return ConfigManager.shared.timeoutInterval
        }
        
        static let cachePolicy: URLRequest.CachePolicy = .useProtocolCachePolicy
    }
    
    // MARK: - Authentication
    struct Auth {
        static let tokenKey = "access_token"
        static let userKey = "current_user"
        static let refreshTokenKey = "refresh_token"
    }
    
    // MARK: - UserDefaults Keys
    struct UserDefaults {
        static let currentEventId = "current_event_id"
        static let lastSyncTime = "last_sync_time"
        static let offlineQueue = "offline_queue"
        static let selectedClubId = "selected_club_id"
        static let appVersion = "app_version"
    }
    
    // MARK: - UI Constants
    struct UI {
        static let cornerRadius: CGFloat = 12.0
        static let shadowRadius: CGFloat = 4.0
        static let animationDuration: Double = 0.3
        static let scannerFrameSize: CGFloat = 250.0
    }
    
    // MARK: - QR Scanner
    struct Scanner {
        static var scanDelay: Double {
            return ConfigManager.shared.scannerDelay
        }
        
        static var vibrationEnabled: Bool {
            return ConfigManager.shared.vibrationEnabled
        }
        
        static var soundEnabled: Bool {
            return ConfigManager.shared.soundEnabled
        }
    }
    
    // MARK: - Colors (System colors for consistency)
    struct Colors {
        static let primary = "AccentColor"
        static let success = "systemGreen"
        static let error = "systemRed"
        static let warning = "systemOrange"
        static let background = "systemBackground"
        static let secondaryBackground = "secondarySystemBackground"
    }
}

// MARK: - Error Definitions
enum AppError: LocalizedError {
    case networkError(String)
    case authenticationError(String)
    case validationError(String)
    case scannerError(String)
    case dataError(String)
    case unknownError
    
    var errorDescription: String? {
        switch self {
        case .networkError(let message):
            return "Network Error: \(message)"
        case .authenticationError(let message):
            return "Authentication Error: \(message)"
        case .validationError(let message):
            return "Validation Error: \(message)"
        case .scannerError(let message):
            return "Scanner Error: \(message)"
        case .dataError(let message):
            return "Data Error: \(message)"
        case .unknownError:
            return "An unknown error occurred"
        }
    }
}