//
//  MockDataService.swift
//  qrCheckin
//
//  Created on 12/6/25.
//

import Foundation
import Combine

class MockDataService {
    static let shared = MockDataService()
    
    private init() {}
    
    // MARK: - Mock Users
    func getUsers() -> AnyPublisher<[User], Error> {
        let mockUsers: [User] = [
            User(
                id: "user_001",
                email: "john.doe@example.com",
                username: "johndoe",
                firstName: "John",
                lastName: "Doe",
                role: .user,
                isActive: true,
                createdAt: Date(timeIntervalSince1970: 1705306200),
                updatedAt: Date(timeIntervalSince1970: 1705306200)
            ),
            User(
                id: "user_002",
                email: "jane.smith@example.com",
                username: "janesmith",
                firstName: "Jane",
                lastName: "Smith",
                role: .staff,
                isActive: true,
                createdAt: Date(timeIntervalSince1970: 1705397100),
                updatedAt: Date(timeIntervalSince1970: 1705397100)
            ),
            User(
                id: "user_003",
                email: "admin@qrcheckin.com",
                username: "admin",
                firstName: "System",
                lastName: "Administrator",
                role: .admin,
                isActive: true,
                createdAt: Date(timeIntervalSince1970: 1704067200),
                updatedAt: Date(timeIntervalSince1970: 1704067200)
            )
        ]
        
        return Just(mockUsers)
            .setFailureType(to: Error.self)
            .eraseToAnyPublisher()
    }
    
    // MARK: - Mock Clubs
    func getClubs() -> AnyPublisher<[Club], Error> {
        let mockClubs: [Club] = [
            Club(
                id: "club_001",
                name: "Fitness Club Premium",
                description: "Câu lạc bộ thể hình và sức khỏe hàng đầu với đầy đủ tiện ích hiện đại",
                isActive: true,
                createdAt: Date(timeIntervalSince1970: 1704067200),
                updatedAt: Date(timeIntervalSince1970: 1704067200)
            ),
            Club(
                id: "club_002",
                name: "Yoga & Wellness Center",
                description: "Trung tâm yoga và thư giãn cho sức khỏe tinh thần và thể chất",
                isActive: true,
                createdAt: Date(timeIntervalSince1970: 1704067200),
                updatedAt: Date(timeIntervalSince1970: 1704067200)
            ),
            Club(
                id: "club_003",
                name: "Swimming Club",
                description: "Câu lạc bộ bơi lội chuyên nghiệp với hồ bơi Olympic",
                isActive: true,
                createdAt: Date(timeIntervalSince1970: 1704067200),
                updatedAt: Date(timeIntervalSince1970: 1704067200)
            )
        ]
        
        return Just(mockClubs)
            .setFailureType(to: Error.self)
            .eraseToAnyPublisher()
    }
    
    // MARK: - Mock Events
    func getEvents() -> AnyPublisher<[Event], Error> {
        let today = Date()
        let calendar = Calendar.current
        
        // Create event dates relative to today
        let tomorrow = calendar.date(byAdding: .day, value: 1, to: today)!
        let dayAfterTomorrow = calendar.date(byAdding: .day, value: 2, to: today)!
        let yesterday = calendar.date(byAdding: .day, value: -1, to: today)!
        
        let mockEvents: [Event] = [
            Event(
                id: "event_001",
                name: "Morning Fitness Class",
                description: "High-intensity interval training session",
                startTime: calendar.date(bySettingHour: 7, minute: 0, second: 0, of: today)!,
                endTime: calendar.date(bySettingHour: 8, minute: 0, second: 0, of: today)!,
                location: "Gym Room A",
                maxCapacity: 20,
                isActive: true,
                clubId: "club_001",
                createdAt: Date(timeIntervalSince1970: 1709287200),
                updatedAt: Date(timeIntervalSince1970: 1709287200)
            ),
            Event(
                id: "event_002",
                name: "Yoga Session",
                description: "Relaxing yoga and meditation class",
                startTime: calendar.date(bySettingHour: 18, minute: 0, second: 0, of: today)!,
                endTime: calendar.date(bySettingHour: 19, minute: 30, second: 0, of: today)!,
                location: "Studio B",
                maxCapacity: 15,
                isActive: true,
                clubId: "club_001",
                createdAt: Date(timeIntervalSince1970: 1709287500),
                updatedAt: Date(timeIntervalSince1970: 1709287500)
            ),
            Event(
                id: "event_003",
                name: "Swimming Pool Access",
                description: "Open swimming session",
                startTime: calendar.date(bySettingHour: 6, minute: 0, second: 0, of: tomorrow)!,
                endTime: calendar.date(bySettingHour: 22, minute: 0, second: 0, of: tomorrow)!,
                location: "Swimming Pool",
                maxCapacity: 50,
                isActive: true,
                clubId: "club_002",
                createdAt: Date(timeIntervalSince1970: 1709287800),
                updatedAt: Date(timeIntervalSince1970: 1709287800)
            ),
            Event(
                id: "event_004",
                name: "Tennis Tournament",
                description: "Monthly tennis tournament for members",
                startTime: calendar.date(bySettingHour: 9, minute: 0, second: 0, of: dayAfterTomorrow)!,
                endTime: calendar.date(bySettingHour: 17, minute: 0, second: 0, of: dayAfterTomorrow)!,
                location: "Tennis Courts 1-4",
                maxCapacity: 32,
                isActive: true,
                clubId: "club_003",
                createdAt: Date(timeIntervalSince1970: 1709288100),
                updatedAt: Date(timeIntervalSince1970: 1709288100)
            ),
            Event(
                id: "event_005",
                name: "Evening Fitness Class",
                description: "Strength training and conditioning",
                startTime: calendar.date(bySettingHour: 19, minute: 0, second: 0, of: yesterday)!,
                endTime: calendar.date(bySettingHour: 20, minute: 0, second: 0, of: yesterday)!,
                location: "Gym Room B",
                maxCapacity: 15,
                isActive: true,
                clubId: "club_001",
                createdAt: Date(timeIntervalSince1970: 1709288400),
                updatedAt: Date(timeIntervalSince1970: 1709288400)
            )
        ]
        
        return Just(mockEvents)
            .setFailureType(to: Error.self)
            .eraseToAnyPublisher()
    }
    
    // MARK: - Mock Checkin Logs
    func getCheckinLogs() -> AnyPublisher<[CheckinLog], Error> {
        let mockCheckinLogs: [CheckinLog] = [
            CheckinLog(
                id: "checkin_001",
                eventId: "event_001",
                userId: "user_001",
                timestamp: Date().addingTimeInterval(-3600),
                status: "CHECKED_IN"
            ),
            CheckinLog(
                id: "checkin_002",
                eventId: "event_002",
                userId: "user_002",
                timestamp: Date().addingTimeInterval(-7200),
                status: "CHECKED_IN"
            ),
            CheckinLog(
                id: "checkin_003",
                eventId: "event_001",
                userId: "user_003",
                timestamp: Date().addingTimeInterval(-1800),
                status: "CHECKED_IN"
            )
        ]
        
        return Just(mockCheckinLogs)
            .setFailureType(to: Error.self)
            .eraseToAnyPublisher()
    }
    
    // MARK: - Mock Login
    func mockLogin(email: String, password: String) -> AnyPublisher<User, Error> {
        // Simple mock for testing - in a real app, you'd validate credentials
        if email.lowercased() == "staff@example.com" && password == "password" {
            let user = User(
                id: "user_staff",
                email: "staff@example.com",
                username: "staffuser",
                firstName: "Staff",
                lastName: "User",
                role: .staff,
                isActive: true,
                createdAt: Date(),
                updatedAt: Date()
            )
            return Just(user)
                .setFailureType(to: Error.self)
                .eraseToAnyPublisher()
        } else {
            return Fail(error: NSError(domain: "MockService", code: 401, userInfo: [NSLocalizedDescriptionKey: "Invalid credentials"]))
                .eraseToAnyPublisher()
        }
    }
}
