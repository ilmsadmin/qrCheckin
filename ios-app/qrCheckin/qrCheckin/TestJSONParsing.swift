//
//  TestJSONParsing.swift
//  qrCheckin
//
//  Created for debugging JSON parsing issues
//

import Foundation

class TestJSONParsing {
    static func testMemberParsing() {
        // Sample JSON from the logs - first customer
        let sampleJSON = """
        [
            {
                "id": "cm542v9kw000108l47qbr9mlk",
                "email": "john.doe@example.com",
                "firstName": "John",
                "lastName": "Doe",
                "phone": "+1234567890",
                "dateOfBirth": "1990-01-01T00:00:00.000Z",
                "gender": "Male",
                "address": "123 Main St",
                "city": "New York",
                "state": "NY",
                "country": "USA",
                "postalCode": "10001",
                "isActive": true,
                "createdAt": "2024-12-07T17:10:49.161Z",
                "updatedAt": "2024-12-07T17:10:49.161Z",
                "clubId": "cm542v9gl000008l41rl90ek9",
                "profileImageUrl": null,
                "fullName": "John Doe",
                "displayName": "John Doe",
                "currentSubscription": {
                    "id": "cm542vdz9000208l43dw2ghf4",
                    "name": "John's Membership",
                    "packageName": "Premium Monthly",
                    "type": "MONTHLY",
                    "status": "ACTIVE",
                    "originalPrice": 99.99,
                    "finalPrice": 99.99,
                    "duration": 30,
                    "maxCheckins": null,
                    "usedCheckins": 0,
                    "startDate": "2024-12-07T17:10:49.211Z",
                    "endDate": "2025-01-06T17:10:49.211Z",
                    "paymentStatus": "PAID",
                    "isActive": true,
                    "createdAt": "2024-12-07T17:10:49.211Z",
                    "updatedAt": "2024-12-07T17:10:49.211Z",
                    "package": null,
                    "payments": null
                },
                "currentQRCode": {
                    "id": "cm542vebm000308l4htjp7yt4",
                    "code": "john.doe@example.com_2024",
                    "usageCount": 0,
                    "lastUsed": null,
                    "lastUsedAt": null,
                    "expiresAt": null,
                    "isActive": true,
                    "createdAt": "2024-12-07T17:10:49.222Z",
                    "updatedAt": "2024-12-07T17:10:49.222Z"
                },
                "recentCheckins": [],
                "totalSubscriptions": 1,
                "totalCheckins": 0,
                "memberSince": "2024-12-07T17:10:49.161Z",
                "status": "ACTIVE",
                "subscriptionExpiry": "2025-01-06T17:10:49.211Z",
                "lastActivity": null,
                "thisMonthCheckins": null,
                "subscriptionHistory": null,
                "checkinHistory": null,
                "stats": null
            }
        ]
        """
        
        print("🧪 Testing Member JSON Parsing...")
        
        guard let jsonData = sampleJSON.data(using: .utf8) else {
            print("❌ Failed to convert sample JSON to data")
            return
        }
        
        // First try raw JSON parsing
        do {
            if let jsonArray = try JSONSerialization.jsonObject(with: jsonData) as? [[String: Any]] {
                print("✅ Raw JSON parsing successful - \(jsonArray.count) items")
                if let firstItem = jsonArray.first {
                    print("🔍 Keys in first member: \(Array(firstItem.keys).sorted())")
                    
                    // Check date fields specifically
                    let dateKeys = ["dateOfBirth", "createdAt", "updatedAt", "memberSince", "subscriptionExpiry", "lastActivity"]
                    for key in dateKeys {
                        if let value = firstItem[key] {
                            print("   \(key): \(type(of: value)) = \(String(describing: value))")
                        } else {
                            print("   \(key): nil")
                        }
                    }
                }
            }
        } catch {
            print("❌ Raw JSON parsing failed: \(error)")
            return
        }
        
        // Now try Swift struct decoding
        do {
            let members = try JSONDecoder.graphQLDecoder.decode([Member].self, from: jsonData)
            print("✅ Swift decoding successful - \(members.count) members")
            print("✅ First member: \(members[0].fullName) (\(members[0].email))")
        } catch {
            print("❌ Swift decoding failed: \(error)")
            if let decodingError = error as? DecodingError {
                switch decodingError {
                case .keyNotFound(let key, let context):
                    print("❌ Missing key: \(key.stringValue) at path: \(context.codingPath.map { $0.stringValue }.joined(separator: "."))")
                case .valueNotFound(let type, let context):
                    print("❌ Value not found for type: \(type) at path: \(context.codingPath.map { $0.stringValue }.joined(separator: "."))")
                case .typeMismatch(let type, let context):
                    print("❌ Type mismatch for type: \(type) at path: \(context.codingPath.map { $0.stringValue }.joined(separator: "."))")
                    print("❌ Debug description: \(context.debugDescription)")
                case .dataCorrupted(let context):
                    print("❌ Data corrupted at path: \(context.codingPath.map { $0.stringValue }.joined(separator: "."))")
                    print("❌ Debug description: \(context.debugDescription)")
                @unknown default:
                    print("❌ Unknown decoding error")
                }
            }
        }
    }
    
    static func testMemberStatsParsing() {
        // Sample member stats JSON
        let statsJSON = """
        {
            "totalMembers": 13,
            "activeMembers": 13,
            "inactiveMembers": 0,
            "thisMonthNewMembers": 13,
            "thisMonthExpiredMembers": 0,
            "upcomingExpirations": 0,
            "averageAge": 25.15,
            "genderDistribution": {
                "Male": 7,
                "Female": 6
            },
            "subscriptionTypeDistribution": {
                "MONTHLY": 7,
                "YEARLY": 6
            },
            "checkinStats": {
                "totalCheckins": 0,
                "thisMonthCheckins": 0,
                "thisWeekCheckins": 0,
                "todayCheckins": 0,
                "averageCheckinsPerMember": 0
            }
        }
        """
        
        print("🧪 Testing Member Stats JSON Parsing...")
        
        guard let jsonData = statsJSON.data(using: .utf8) else {
            print("❌ Failed to convert stats JSON to data")
            return
        }
        
        // First try raw JSON parsing
        do {
            if let jsonObject = try JSONSerialization.jsonObject(with: jsonData) as? [String: Any] {
                print("✅ Raw stats JSON parsing successful")
                print("🔍 Stats keys: \(Array(jsonObject.keys).sorted())")
            }
        } catch {
            print("❌ Raw stats JSON parsing failed: \(error)")
            return
        }
        
        // Now try Swift struct decoding
        do {
            let stats = try JSONDecoder.graphQLDecoder.decode(MemberStats.self, from: jsonData)
            print("✅ Stats Swift decoding successful")
            print("✅ Total members: \(stats.totalMembers), Active: \(stats.activeMembers)")
        } catch {
            print("❌ Stats Swift decoding failed: \(error)")
            if let decodingError = error as? DecodingError {
                switch decodingError {
                case .keyNotFound(let key, let context):
                    print("❌ Missing key: \(key.stringValue) at path: \(context.codingPath.map { $0.stringValue }.joined(separator: "."))")
                case .valueNotFound(let type, let context):
                    print("❌ Value not found for type: \(type) at path: \(context.codingPath.map { $0.stringValue }.joined(separator: "."))")
                case .typeMismatch(let type, let context):
                    print("❌ Type mismatch for type: \(type) at path: \(context.codingPath.map { $0.stringValue }.joined(separator: "."))")
                case .dataCorrupted(let context):
                    print("❌ Data corrupted at path: \(context.codingPath.map { $0.stringValue }.joined(separator: "."))")
                @unknown default:
                    print("❌ Unknown decoding error")
                }
            }
        }
    }
}
