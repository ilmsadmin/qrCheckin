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
            return ConfigManager.shared.baseURL
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
        static let offlineQueueKey = "offlineQueueKey"
    }
    
    // MARK: - Scanner Configuration
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
        
        static let cameraSession = "camera_session"
        static let sessionQueue = "session_queue"
    }
    
    // MARK: - UI Constants
    struct UI {
        static let cornerRadius: CGFloat = 12
        static let shadowRadius: CGFloat = 5
        static let shadowOpacity: Float = 0.1
        static let animationDuration: Double = 0.3
        
        // Scanner UI
        static let scannerFrameSize: CGFloat = 300
        
        // Tab bar
        static let tabBarHeight: CGFloat = 80
        static let tabIconSize: CGFloat = 24
        
        // Colors
        static let primaryColor = "primaryColor"
        static let secondaryColor = "secondaryColor"
        static let accentColor = "accentColor"
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