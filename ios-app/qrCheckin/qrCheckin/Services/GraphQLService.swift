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
                access_token
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
                KeychainHelper.shared.save(data.login.access_token, forKey: Constants.Auth.tokenKey)
                return data.login.user
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
    
    func getCurrentUser() -> AnyPublisher<User, AppError> {
        let query = """
        query Me {
            me {
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
        }
        """
        
        return performQuery(query: query, variables: [:])
            .map { (data: CurrentUserResponse) in data.me }
            .eraseToAnyPublisher()
    }
    
    // MARK: - Events
    func fetchEvents(clubId: String? = nil) -> AnyPublisher<[Event], AppError> {
        let query = """
        query Events {
            events
        }
        """
        
        return performQuery(query: query, variables: [:])
            .tryMap { (data: EventsStringResponse) in
                // Parse JSON string response from backend
                guard let jsonData = data.events.data(using: .utf8) else {
                    throw AppError.dataError("Invalid response format")
                }
                let events = try JSONDecoder.graphQLDecoder.decode([Event].self, from: jsonData)
                return events
            }
            .mapError { error in
                if error is AppError {
                    return error as! AppError
                }
                return AppError.networkError("Failed to fetch events: \(error.localizedDescription)")
            }
            .eraseToAnyPublisher()
    }
    
    // MARK: - Check-in Operations
    func performCheckin(qrCodeId: String, eventId: String) -> AnyPublisher<CheckinLog, AppError> {
        let mutation = """
        mutation Checkin($qrCodeId: String!, $eventId: String!) {
            checkin(qrCodeId: $qrCodeId, eventId: $eventId) {
                id
                userId
                eventId
                type
                timestamp
                location
                notes
                action
            }
        }
        """
        
        let variables: [String: Any] = [
            "qrCodeId": qrCodeId,
            "eventId": eventId
        ]
        
        return performQuery(query: mutation, variables: variables)
            .tryMap { (data: CheckinResponse) in
                return data.checkin
            }
            .mapError { error in
                if error is AppError {
                    return error as! AppError
                }
                return AppError.networkError("Checkin failed: \(error.localizedDescription)")
            }
            .eraseToAnyPublisher()
    }
    
    func performCheckout(qrCodeId: String, eventId: String) -> AnyPublisher<CheckinLog, AppError> {
        let mutation = """
        mutation Checkout($qrCodeId: String!, $eventId: String!) {
            checkout(qrCodeId: $qrCodeId, eventId: $eventId) {
                id
                userId
                eventId
                type
                timestamp
                location
                notes
                action
            }
        }
        """
        
        let variables: [String: Any] = [
            "qrCodeId": qrCodeId,
            "eventId": eventId
        ]
        
        return performQuery(query: mutation, variables: variables)
            .tryMap { (data: CheckoutResponse) in
                return data.checkout
            }
            .mapError { error in
                if error is AppError {
                    return error as! AppError
                }
                return AppError.networkError("Checkout failed: \(error.localizedDescription)")
            }
            .eraseToAnyPublisher()
    }
    
    // MARK: - Recent Check-ins
    func fetchRecentCheckins(limit: Int = 10, userId: String? = nil, eventId: String? = nil) -> AnyPublisher<[CheckinLog], AppError> {
        let query = """
        query CheckinLogs($userId: String, $eventId: String) {
            checkinLogs(userId: $userId, eventId: $eventId)
        }
        """
        
        var variables: [String: Any] = [:]
        if let userId = userId {
            variables["userId"] = userId
        }
        if let eventId = eventId {
            variables["eventId"] = eventId
        }
        
        return performQuery(query: query, variables: variables)
            .tryMap { (data: CheckinLogsStringResponse) in
                // Parse JSON string response from backend
                guard let jsonData = data.checkinLogs.data(using: .utf8) else {
                    throw AppError.dataError("Invalid response format")
                }
                let checkinLogs = try JSONDecoder.graphQLDecoder.decode([CheckinLog].self, from: jsonData)
                // Apply limit on client side since backend doesn't support it
                return Array(checkinLogs.prefix(limit))
            }
            .mapError { error in
                if error is AppError {
                    return error as! AppError
                }
                return AppError.networkError("Failed to fetch checkin logs: \(error.localizedDescription)")
            }
            .eraseToAnyPublisher()
    }
    
    // MARK: - Clubs
    func fetchClubs() -> AnyPublisher<[Club], AppError> {
        let query = """
        query Clubs {
            clubs {
                id
                name
                description
                isActive
                createdAt
                updatedAt
            }
        }
        """
        
        return performQuery(query: query, variables: [:])
            .map { (data: ClubsResponse) in data.clubs }
            .eraseToAnyPublisher()
    }
    
    // MARK: - Customer-specific Methods
    func fetchCustomerProfile() -> AnyPublisher<User, AppError> {
        let query = """
        query CustomerProfile {
            me {
                id
                email
                username
                firstName
                lastName
                role
                isActive
                createdAt
                updatedAt
                phone
                dateOfBirth
                activeSubscription {
                    id
                    type
                    startDate
                    endDate
                    isActive
                    package {
                        id
                        name
                        description
                        price
                    }
                }
                qrCode
            }
        }
        """
        
        return performQuery(query: query, variables: [:])
            .map { (data: CustomerProfileResponse) in data.me }
            .eraseToAnyPublisher()
    }
    
    func fetchCustomerCheckinHistory(limit: Int = 20) -> AnyPublisher<[CheckinLog], AppError> {
        let query = """
        query CustomerCheckinHistory($limit: Int) {
            myCheckinHistory(limit: $limit)
        }
        """
        
        let variables: [String: Any] = [
            "limit": limit
        ]
        
        return performQuery(query: query, variables: variables)
            .tryMap { (data: CustomerCheckinHistoryResponse) in
                // Parse JSON string response from backend
                guard let jsonData = data.myCheckinHistory.data(using: .utf8) else {
                    throw AppError.dataError("Invalid response format")
                }
                let checkinLogs = try JSONDecoder.graphQLDecoder.decode([CheckinLog].self, from: jsonData)
                return checkinLogs
            }
            .mapError { error in
                if error is AppError {
                    return error as! AppError
                }
                return AppError.networkError("Failed to fetch checkin history: \(error.localizedDescription)")
            }
            .eraseToAnyPublisher()
    }
    
    func fetchSubscriptionPackages() -> AnyPublisher<[SubscriptionPackage], AppError> {
        let query = """
        query SubscriptionPackages {
            subscriptionPackages {
                id
                name
                description
                price
                discountPrice
                duration
                type
                features
                isActive
                isPopular
                createdAt
                updatedAt
            }
        }
        """
        
        return performQuery(query: query, variables: [:])
            .map { (data: SubscriptionPackagesResponse) in data.subscriptionPackages }
            .eraseToAnyPublisher()
    }
    
    // MARK: - Members Management
    func fetchMembers(search: String? = nil, status: String? = nil, limit: Int = 50, offset: Int = 0) -> AnyPublisher<[Member], AppError> {
        let query = """
        query Members($search: String, $status: String, $limit: Int, $offset: Int) {
            customers(search: $search, status: $status, limit: $limit, offset: $offset)
        }
        """
        
        var variables: [String: Any] = [
            "limit": limit,
            "offset": offset
        ]
        
        if let search = search, !search.isEmpty {
            variables["search"] = search
        }
        
        if let status = status, !status.isEmpty {
            variables["status"] = status
        }
        
        return performQuery(query: query, variables: variables)
            .tryMap { (data: MembersStringResponse) in
                // Parse JSON string response from backend
                guard let jsonData = data.customers.data(using: .utf8) else {
                    throw AppError.dataError("Invalid response format")
                }
                do {
                    let members = try JSONDecoder.graphQLDecoder.decode([Member].self, from: jsonData)
                    return members
                } catch {             
                    throw AppError.dataError("Failed to decode members: \(error.localizedDescription)")
                }
            }
            .mapError { error in
                if error is AppError {
                    return error as! AppError
                }
                return AppError.networkError("Failed to fetch members: \(error.localizedDescription)")
            }
            .eraseToAnyPublisher()
    }
    
    func fetchMember(id: String) -> AnyPublisher<Member, AppError> {
        let query = """
        query Member($id: String!) {
            customer(id: $id)
        }
        """
        
        let variables: [String: Any] = [
            "id": id
        ]
        
        return performQuery(query: query, variables: variables)
            .tryMap { (data: MemberStringResponse) in
                // Parse JSON string response from backend
                guard let jsonData = data.customer.data(using: .utf8) else {
                    throw AppError.dataError("Invalid response format")
                }
                let member = try JSONDecoder.graphQLDecoder.decode(Member.self, from: jsonData)
                return member
            }
            .mapError { error in
                if error is AppError {
                    return error as! AppError
                }
                return AppError.networkError("Failed to fetch member: \(error.localizedDescription)")
            }
            .eraseToAnyPublisher()
    }
    
    func fetchMemberStats() -> AnyPublisher<MemberStats, AppError> {
        let query = """
        query CustomerStats {
            customerStats
        }
        """
        
        return performQuery(query: query, variables: [:])
            .tryMap { (data: MemberStatsStringResponse) in
                // Parse JSON string response from backend
                guard let jsonData = data.customerStats.data(using: .utf8) else {
                    throw AppError.dataError("Invalid response format")
                }
                let stats = try JSONDecoder.graphQLDecoder.decode(MemberStats.self, from: jsonData)
                return stats
            }
            .mapError { error in
                if error is AppError {
                    return error as! AppError
                }
                return AppError.networkError("Failed to fetch member stats: \(error.localizedDescription)")
            }
            .eraseToAnyPublisher()
    }

    // MARK: - Async Methods for Members
    func fetchMembersAsync(searchText: String? = nil, status: MemberStatus? = nil, offset: Int = 0, limit: Int = 50) async throws -> [Member] {
        return try await withCheckedThrowingContinuation { continuation in
            fetchMembers(
                search: searchText,
                status: status?.rawValue,
                limit: limit,
                offset: offset
            )
            .sink(
                receiveCompletion: { completion in
                    if case .failure(let error) = completion {
                        continuation.resume(throwing: error)
                    }
                },
                receiveValue: { members in
                    continuation.resume(returning: members)
                }
            )
            .store(in: &cancellables)
        }
    }
    
    func fetchMemberStatsAsync() async throws -> MemberStats {
        return try await withCheckedThrowingContinuation { continuation in
            fetchMemberStats()
                .sink(
                    receiveCompletion: { completion in
                        if case .failure(let error) = completion {
                            continuation.resume(throwing: error)
                        }
                    },
                    receiveValue: { stats in
                        continuation.resume(returning: stats)
                    }
                )
                .store(in: &cancellables)
        }
    }

    // MARK: - Generic Query Execution
    private func performQuery<T: Codable>(query: String, variables: [String: Any]) -> AnyPublisher<T, AppError> {
        guard let url = URL(string: Constants.API.graphQLEndpoint) else {
            return Fail(error: AppError.networkError("Invalid API endpoint: \(Constants.API.graphQLEndpoint)"))
                .eraseToAnyPublisher()
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        // Add authorization header if token exists
        let token = KeychainHelper.shared.load(forKey: Constants.Auth.tokenKey)
        if let token = token {
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
                    let errorMessage = errors.first?.message ?? "GraphQL error"
                    throw AppError.networkError("Server error: \(errorMessage)")
                }
                guard let data = response.data else {
                    throw AppError.dataError("No data received from server")
                }
                return data
            }
            .mapError { error in
                if error is AppError {
                    return error as! AppError
                }
                // Check for specific network errors
                if let urlError = error as? URLError {
                    switch urlError.code {
                    case .notConnectedToInternet:
                        return AppError.networkError("No internet connection")
                    case .timedOut:
                        return AppError.networkError("Request timed out. Please check your connection.")
                    case .cannotConnectToHost:
                        return AppError.networkError("Cannot connect to server. Please check if the server is running.")
                    case .networkConnectionLost:
                        return AppError.networkError("Network connection lost")
                    default:
                        return AppError.networkError("Network error: \(urlError.localizedDescription)")
                    }
                }
                return AppError.networkError("Unknown error: \(error.localizedDescription)")
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
    let login: LoginData
    
    struct LoginData: Codable {
        let user: User
        let access_token: String
    }
}

private struct CurrentUserResponse: Codable {
    let me: User
}

private struct LogoutResponse: Codable {
    let logout: String
}

private struct EventsStringResponse: Codable {
    let events: String
}

private struct CheckinResponse: Codable {
    let checkin: CheckinLog
}

private struct CheckoutResponse: Codable {
    let checkout: CheckinLog
}

private struct CheckinLogsStringResponse: Codable {
    let checkinLogs: String
}

private struct ClubsResponse: Codable {
    let clubs: [Club]
}

private struct CustomerProfileResponse: Codable {
    let me: User
}

private struct CustomerCheckinHistoryResponse: Codable {
    let myCheckinHistory: String
}

private struct SubscriptionPackagesResponse: Codable {
    let subscriptionPackages: [SubscriptionPackage]
}

private struct MembersStringResponse: Codable {
    let customers: String
}

private struct MemberStringResponse: Codable {
    let customer: String
}

private struct MemberStatsStringResponse: Codable {
    let customerStats: String
}

// MARK: - JSONDecoder Extension
extension JSONDecoder {
    static var graphQLDecoder: JSONDecoder {
        let decoder = JSONDecoder()
        
        // Use ISO8601DateFormatter which handles fractional seconds better
        if #available(iOS 10.0, *) {
            let formatter = ISO8601DateFormatter()
            formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
            decoder.dateDecodingStrategy = .custom { decoder in
                let container = try decoder.singleValueContainer()
                let dateString = try container.decode(String.self)
                
                // First try with fractional seconds
                if let date = formatter.date(from: dateString) {
                    return date
                }
                
                // Fallback: try without fractional seconds
                formatter.formatOptions = [.withInternetDateTime]
                if let date = formatter.date(from: dateString) {
                    return date
                }
                
                // Last resort: manual parsing
                let fallbackFormatter = DateFormatter()
                fallbackFormatter.locale = Locale(identifier: "en_US_POSIX")
                fallbackFormatter.timeZone = TimeZone(secondsFromGMT: 0)
                fallbackFormatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
                
                if let date = fallbackFormatter.date(from: dateString) {
                    return date
                }
                
                throw DecodingError.dataCorruptedError(in: container, debugDescription: "Cannot parse date: \(dateString)")
            }
        } else {
            // Fallback for older iOS versions
            decoder.dateDecodingStrategy = .iso8601
        }
        
        decoder.keyDecodingStrategy = .useDefaultKeys
        return decoder
    }
}