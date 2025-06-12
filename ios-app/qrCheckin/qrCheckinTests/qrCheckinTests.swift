//
//  qrCheckinTests.swift
//  qrCheckinTests
//
//  Created by toan on 12/6/25.
//

import XCTest
@testable import qrCheckin

final class qrCheckinTests: XCTestCase {

    func testUserModel() {
        let user = User(
            id: "test_user",
            email: "test@example.com",
            username: "testuser",
            firstName: "Test",
            lastName: "User",
            role: .staff,
            isActive: true,
            createdAt: Date(),
            updatedAt: Date()
        )
        
        XCTAssertEqual(user.fullName, "Test User")
        XCTAssertEqual(user.displayName, "Test User")
        XCTAssertEqual(user.role, .staff)
    }
    
    func testUserModelWithoutName() {
        let user = User(
            id: "test_user",
            email: "test@example.com",
            username: "testuser",
            firstName: nil,
            lastName: nil,
            role: .user,
            isActive: true,
            createdAt: Date(),
            updatedAt: Date()
        )
        
        XCTAssertEqual(user.fullName, "")
        XCTAssertEqual(user.displayName, "testuser")
    }
    
    func testEventModel() {
        let startTime = Date()
        let endTime = Date().addingTimeInterval(3600) // 1 hour later
        
        let event = Event(
            id: "test_event",
            name: "Test Event",
            description: "A test event",
            startTime: startTime,
            endTime: endTime,
            location: "Test Location",
            maxCapacity: 20,
            isActive: true,
            clubId: "test_club",
            createdAt: Date(),
            updatedAt: Date()
        )
        
        XCTAssertEqual(event.duration, 3600)
        XCTAssertEqual(event.durationString, "1h 0m")
        XCTAssertTrue(event.isUpcoming)
        XCTAssertFalse(event.isCompleted)
    }
    
    func testCheckinLogTimeAgo() {
        let checkin = CheckinLog(
            id: "test_checkin",
            userId: "test_user",
            eventId: "test_event",
            qrCodeId: "test_qr",
            type: .checkin,
            timestamp: Date().addingTimeInterval(-300), // 5 minutes ago
            createdAt: Date()
        )
        
        XCTAssertTrue(checkin.timeAgo.contains("min"))
    }
    
    func testCheckinTypes() {
        XCTAssertEqual(CheckinType.checkin.rawValue, "CHECKIN")
        XCTAssertEqual(CheckinType.checkout.rawValue, "CHECKOUT")
    }
    
    func testUserRoles() {
        XCTAssertEqual(UserRole.admin.rawValue, "ADMIN")
        XCTAssertEqual(UserRole.staff.rawValue, "STAFF")
        XCTAssertEqual(UserRole.user.rawValue, "USER")
    }
    
    func testSubscriptionValidation() {
        let subscription = Subscription(
            id: "test_sub",
            userId: "test_user",
            clubId: "test_club",
            packageId: "test_package",
            type: .monthly,
            startDate: Date().addingTimeInterval(-86400), // Yesterday
            endDate: Date().addingTimeInterval(86400), // Tomorrow
            isActive: true,
            createdAt: Date(),
            updatedAt: Date()
        )
        
        XCTAssertTrue(subscription.isValid)
        XCTAssertFalse(subscription.isExpired)
        XCTAssertEqual(subscription.daysRemaining, 1)
    }
    
    func testExpiredSubscription() {
        let subscription = Subscription(
            id: "test_sub",
            userId: "test_user",
            clubId: "test_club",
            packageId: "test_package",
            type: .monthly,
            startDate: Date().addingTimeInterval(-172800), // 2 days ago
            endDate: Date().addingTimeInterval(-86400), // Yesterday
            isActive: true,
            createdAt: Date(),
            updatedAt: Date()
        )
        
        XCTAssertFalse(subscription.isValid)
        XCTAssertTrue(subscription.isExpired)
        XCTAssertEqual(subscription.daysRemaining, 0)
    }
    
    func testQRCodeValidation() {
        let qrCode = QRCode(
            id: "test_qr",
            code: "TEST_QR_CODE",
            userId: "test_user",
            subscriptionId: "test_sub",
            isActive: true,
            expiresAt: Date().addingTimeInterval(3600), // 1 hour from now
            createdAt: Date(),
            updatedAt: Date()
        )
        
        XCTAssertTrue(qrCode.isValid)
        XCTAssertFalse(qrCode.isExpired)
    }
    
    func testExpiredQRCode() {
        let qrCode = QRCode(
            id: "test_qr",
            code: "TEST_QR_CODE",
            userId: "test_user",
            subscriptionId: "test_sub",
            isActive: true,
            expiresAt: Date().addingTimeInterval(-3600), // 1 hour ago
            createdAt: Date(),
            updatedAt: Date()
        )
        
        XCTAssertFalse(qrCode.isValid)
        XCTAssertTrue(qrCode.isExpired)
    }
}
