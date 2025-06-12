//
//  GraphQLService.swift
//  qrCheckin
//
//  Created by toan on 12/6/25.
//

import Foundation
import Combine

// Note: AppError is defined in Constants.swift

class GraphQLService: ObservableObject {
    static let shared = GraphQLService()
    
    private let session: URLSession
    private var cancellables = Set<AnyCancellable>()
    
    @Published var isLoading = false
    @Published var error: AppError?
    
    private init() {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = Constants.API.timeoutInterval
        config.requestCachePolicy = Constants.API.cachePolicy
        self.session = URLSession(configuration: config)
    }
    
    // MARK: - Authentication
    func login(email: String, password: String) -> AnyPublisher<User, AppError> {
        let query = """
        mutation Login($input: LoginInput!) {
            login(input: $input) {
                user {
                    id
                    email
                    username
                    firstName
                    lastName
                    role
                    isActive
                    createdAt
                    updatedAt
                }
                token
            }
        }
        """
        
        let variables: [String: Any] = [
            "input": [
                "email": email,
                "password": password
            ]
        ]
        
        return performQuery(query: query, variables: variables)
            .tryMap { (data: LoginResponse) in
                // Store token for future requests
                KeychainHelper.shared.save(data.token, forKey: Constants.Auth.tokenKey)
                return data.user
            }
            .mapError { error in
                if error is AppError {
                    return error as! AppError
                }
                return AppError.authenticationError(error.localizedDescription)
            }
            .eraseToAnyPublisher()
    }
    
    func logout() -> AnyPublisher<Bool, AppError> {
        let mutation = """
        mutation Logout {
            logout
        }
        """
        
        return performQuery(query: mutation, variables: [:])
            .map { (_: LogoutResponse) in
                // Clear stored token
                KeychainHelper.shared.delete(forKey: Constants.Auth.tokenKey)
                return true
            }
            .eraseToAnyPublisher()
    }
    
    // MARK: - Events
    func fetchEvents(clubId: String? = nil) -> AnyPublisher<[Event], AppError> {
        let query = """
        query Events($clubId: ID) {
            events(clubId: $clubId) {
                id
                name
                description
                startTime
                endTime
                location
                maxCapacity
                isActive
                clubId
                createdAt
                updatedAt
            }
        }
        """
        
        let variables: [String: Any] = clubId != nil ? ["clubId": clubId!] : [:]
        
        return performQuery(query: query, variables: variables)
            .map { (data: EventsResponse) in data.events }
            .eraseToAnyPublisher()
    }
    
    // MARK: - Check-in Operations
    func performCheckin(qrCode: String, eventId: String, type: CheckinType) -> AnyPublisher<CheckinLog, AppError> {
        let mutation = """
        mutation ProcessCheckin($input: CheckinInput!) {
            processCheckin(input: $input) {
                id
                userId
                eventId
                qrCodeId
                type
                timestamp
                createdAt
                user {
                    id
                    username
                    firstName
                    lastName
                }
                event {
                    id
                    name
                    location
                }
            }
        }
        """
        
        let variables: [String: Any] = [
            "input": [
                "qrCode": qrCode,
                "eventId": eventId,
                "type": type.rawValue
            ]
        ]
        
        return performQuery(query: mutation, variables: variables)
            .map { (data: CheckinResponse) in data.processCheckin }
            .eraseToAnyPublisher()
    }
    
    // MARK: - Recent Check-ins
    func fetchRecentCheckins(limit: Int = 10) -> AnyPublisher<[CheckinLog], AppError> {
        let query = """
        query RecentCheckins($limit: Int) {
            recentCheckins(limit: $limit) {
                id
                userId
                eventId
                type
                timestamp
                user {
                    id
                    username
                    firstName
                    lastName
                }
                event {
                    id
                    name
                    location
                }
            }
        }
        """
        
        let variables: [String: Any] = ["limit": limit]
        
        return performQuery(query: query, variables: variables)
            .map { (data: RecentCheckinsResponse) in data.recentCheckins }
            .eraseToAnyPublisher()
    }
    
    // MARK: - Generic Query Execution
    private func performQuery<T: Codable>(query: String, variables: [String: Any]) -> AnyPublisher<T, AppError> {
        guard let url = URL(string: Constants.API.graphQLEndpoint) else {
            return Fail(error: AppError.networkError("Invalid API endpoint"))
                .eraseToAnyPublisher()
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        // Add authorization header if token exists
        if let token = KeychainHelper.shared.load(forKey: Constants.Auth.tokenKey) {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        
        let body: [String: Any] = [
            "query": query,
            "variables": variables
        ]
        
        do {
            request.httpBody = try JSONSerialization.data(withJSONObject: body)
        } catch {
            return Fail(error: AppError.dataError("Failed to serialize request body"))
                .eraseToAnyPublisher()
        }
        
        return session.dataTaskPublisher(for: request)
            .map(\.data)
            .decode(type: GraphQLResponse<T>.self, decoder: JSONDecoder.graphQLDecoder)
            .tryMap { response in
                if let errors = response.errors, !errors.isEmpty {
                    throw AppError.networkError(errors.first?.message ?? "GraphQL error")
                }
                guard let data = response.data else {
                    throw AppError.dataError("No data received")
                }
                return data
            }
            .mapError { error in
                if error is AppError {
                    return error as! AppError
                }
                return AppError.networkError(error.localizedDescription)
            }
            .receive(on: DispatchQueue.main)
            .eraseToAnyPublisher()
    }
}

// MARK: - Response Models
private struct GraphQLResponse<T: Codable>: Codable {
    let data: T?
    let errors: [GraphQLError]?
}

private struct GraphQLError: Codable {
    let message: String
    let locations: [Location]?
    let path: [String]?
    
    struct Location: Codable {
        let line: Int
        let column: Int
    }
}

private struct LoginResponse: Codable {
    let user: User
    let token: String
}

private struct LogoutResponse: Codable {
    let logout: Bool
}

private struct EventsResponse: Codable {
    let events: [Event]
}

private struct CheckinResponse: Codable {
    let processCheckin: CheckinLog
}

private struct RecentCheckinsResponse: Codable {
    let recentCheckins: [CheckinLog]
}

// MARK: - JSONDecoder Extension
extension JSONDecoder {
    static var graphQLDecoder: JSONDecoder {
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        decoder.keyDecodingStrategy = .useDefaultKeys
        return decoder
    }
}