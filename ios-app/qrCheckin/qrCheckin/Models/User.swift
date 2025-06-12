//
//  User.swift
//  qrCheckin
//
//  Created by toan on 12/6/25.
//

import Foundation

enum UserRole: String, CaseIterable, Codable {
    case admin = "ADMIN"
    case staff = "STAFF"
    case user = "USER"
}

struct User: Identifiable, Codable {
    let id: String
    let email: String
    let username: String
    let firstName: String?
    let lastName: String?
    let role: UserRole
    let isActive: Bool
    let createdAt: Date
    let updatedAt: Date
    
    var fullName: String {
        let first = firstName ?? ""
        let last = lastName ?? ""
        return "\(first) \(last)".trimmingCharacters(in: .whitespaces)
    }
    
    var displayName: String {
        return fullName.isEmpty ? username : fullName
    }
}