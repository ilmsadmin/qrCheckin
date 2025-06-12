//
//  ConfigManager.swift
//  qrCheckin
//
//  Created by toan on 12/6/25.
//

import Foundation

class ConfigManager {
    static let shared = ConfigManager()
    
    private var config: [String: Any] = [:]
    
    private init() {
        loadConfig()
    }
    
    private func loadConfig() {
        guard let path = Bundle.main.path(forResource: "Config", ofType: "plist"),
              let plist = NSDictionary(contentsOfFile: path) as? [String: Any] else {
            print("Warning: Config.plist not found, using default values")
            return
        }
        
        config = plist
    }
    
    func getString(_ key: String, defaultValue: String = "") -> String {
        return config[key] as? String ?? defaultValue
    }
    
    func getInt(_ key: String, defaultValue: Int = 0) -> Int {
        return config[key] as? Int ?? defaultValue
    }
    
    func getDouble(_ key: String, defaultValue: Double = 0.0) -> Double {
        return config[key] as? Double ?? defaultValue
    }
    
    func getBool(_ key: String, defaultValue: Bool = false) -> Bool {
        return config[key] as? Bool ?? defaultValue
    }
    
    // MARK: - Specific Config Values
    var apiBaseURL: String {
        return getString("API_BASE_URL", defaultValue: Constants.API.baseURL)
    }
    
    var graphQLEndpoint: String {
        return getString("GRAPHQL_ENDPOINT", defaultValue: Constants.API.graphQLEndpoint)
    }
    
    var wsEndpoint: String {
        return getString("WS_ENDPOINT", defaultValue: Constants.API.wsEndpoint)
    }
    
    var timeoutInterval: TimeInterval {
        return TimeInterval(getInt("TIMEOUT_INTERVAL", defaultValue: Int(Constants.API.timeoutInterval)))
    }
    
    var scannerDelay: Double {
        return getDouble("SCANNER_DELAY", defaultValue: Constants.Scanner.scanDelay)
    }
    
    var vibrationEnabled: Bool {
        return getBool("VIBRATION_ENABLED", defaultValue: Constants.Scanner.vibrationEnabled)
    }
    
    var soundEnabled: Bool {
        return getBool("SOUND_ENABLED", defaultValue: Constants.Scanner.soundEnabled)
    }
}