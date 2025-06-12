//
//  AppError.swift
//  qrCheckin
//
//  Created on 12/6/25.
//

import Foundation

struct ModelError: Error, Identifiable {
    let id = UUID()
    let message: String
    let title: String
    
    init(message: String, title: String = "Error") {
        self.message = message
        self.title = title
    }
}
