//
//  QRErrorAlertView.swift
//  qrCheckin
//
//  Created by toan on 12/6/25.
//

import SwiftUI

struct QRErrorAlertView: View {
    let errorType: QRErrorType
    let onRetry: () -> Void
    let onDismiss: () -> Void
    
    var body: some View {
        VStack(spacing: 0) {
            // Header with icon and title
            VStack(spacing: 16) {
                Circle()
                    .fill(errorType.backgroundColor)
                    .frame(width: 80, height: 80)
                    .overlay(
                        Image(systemName: errorType.iconName)
                            .font(.system(size: 32, weight: .medium))
                            .foregroundColor(.white)
                    )
                
                VStack(spacing: 8) {
                    Text(errorType.title)
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundColor(.primary)
                        .multilineTextAlignment(.center)
                    
                    Text(errorType.message)
                        .font(.body)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                        .fixedSize(horizontal: false, vertical: true)
                }
            }
            .padding(.horizontal, 24)
            .padding(.top, 32)
            .padding(.bottom, 24)
            
            // Suggestions (if any)
            if !errorType.suggestions.isEmpty {
                VStack(alignment: .leading, spacing: 12) {
                    Text("Suggestions:")
                        .font(.subheadline)
                        .fontWeight(.semibold)
                        .foregroundColor(.primary)
                    
                    ForEach(errorType.suggestions, id: \.self) { suggestion in
                        HStack(alignment: .top, spacing: 8) {
                            Circle()
                                .fill(Color.blue.opacity(0.2))
                                .frame(width: 6, height: 6)
                                .padding(.top, 6)
                            
                            Text(suggestion)
                                .font(.caption)
                                .foregroundColor(.secondary)
                                .fixedSize(horizontal: false, vertical: true)
                            
                            Spacer()
                        }
                    }
                }
                .padding(.horizontal, 24)
                .padding(.bottom, 24)
            }
            
            // Action buttons
            VStack(spacing: 12) {
                Button(action: onRetry) {
                    HStack {
                        Image(systemName: "arrow.clockwise")
                            .font(.subheadline)
                        Text("Try Again")
                            .fontWeight(.medium)
                    }
                    .foregroundColor(.white)
                    .padding()
                    .frame(maxWidth: .infinity)
                    .background(Color.blue)
                    .cornerRadius(12)
                }
                
                Button(action: onDismiss) {
                    Text("Cancel")
                        .fontWeight(.medium)
                        .foregroundColor(.secondary)
                        .padding()
                        .frame(maxWidth: .infinity)
                        .background(Color(.systemGray6))
                        .cornerRadius(12)
                }
            }
            .padding(.horizontal, 24)
            .padding(.bottom, 24)
        }
        .background(Color(.systemBackground))
        .cornerRadius(20)
        .shadow(color: Color.black.opacity(0.1), radius: 20, x: 0, y: 10)
        .padding(.horizontal, 32)
    }
}

enum QRErrorType {
    case invalidFormat
    case memberNotFound
    case networkError
    case expired
    case alreadyCheckedIn
    case permissionDenied
    case unknown(String)
    
    var title: String {
        switch self {
        case .invalidFormat:
            return "Invalid QR Code"
        case .memberNotFound:
            return "Member Not Found"
        case .networkError:
            return "Connection Issue"
        case .expired:
            return "QR Code Expired"
        case .alreadyCheckedIn:
            return "Already Checked In"
        case .permissionDenied:
            return "Access Denied"
        case .unknown:
            return "Something Went Wrong"
        }
    }
    
    var message: String {
        switch self {
        case .invalidFormat:
            return "The scanned QR code doesn't appear to be a valid member QR code. Please make sure you're scanning the correct code."
        case .memberNotFound:
            return "We couldn't find a member associated with this QR code. Please check with reception if you need assistance."
        case .networkError:
            return "We're having trouble connecting to our servers. Please check your internet connection and try again."
        case .expired:
            return "This QR code has expired. Please contact reception to get a new QR code."
        case .alreadyCheckedIn:
            return "This member is already checked in. If this is incorrect, please contact reception for assistance."
        case .permissionDenied:
            return "You don't have permission to perform this action. Please contact your administrator."
        case .unknown(let error):
            return error.isEmpty ? "An unexpected error occurred. Please try again or contact support if the problem persists." : error
        }
    }
    
    var iconName: String {
        switch self {
        case .invalidFormat:
            return "qrcode.viewfinder"
        case .memberNotFound:
            return "person.crop.circle.badge.questionmark"
        case .networkError:
            return "wifi.exclamationmark"
        case .expired:
            return "clock.badge.exclamationmark"
        case .alreadyCheckedIn:
            return "checkmark.circle.trianglebadge.exclamationmark"
        case .permissionDenied:
            return "hand.raised"
        case .unknown:
            return "exclamationmark.triangle"
        }
    }
    
    var backgroundColor: Color {
        switch self {
        case .invalidFormat:
            return .orange
        case .memberNotFound:
            return .blue
        case .networkError:
            return .red
        case .expired:
            return .yellow
        case .alreadyCheckedIn:
            return .green
        case .permissionDenied:
            return .red
        case .unknown:
            return .gray
        }
    }
    
    var suggestions: [String] {
        switch self {
        case .invalidFormat:
            return [
                "Ensure the QR code is clearly visible and not damaged",
                "Try holding your device steady while scanning",
                "Make sure there's adequate lighting"
            ]
        case .memberNotFound:
            return [
                "Verify this is the member's current QR code",
                "Check if the membership is active",
                "Contact reception for assistance"
            ]
        case .networkError:
            return [
                "Check your WiFi or mobile data connection",
                "Try moving to an area with better signal",
                "Restart the app if problems persist"
            ]
        case .expired:
            return [
                "Contact reception to renew your QR code",
                "Check if your membership needs renewal"
            ]
        case .alreadyCheckedIn:
            return [
                "If this is incorrect, please contact reception",
                "You can check your status in the app"
            ]
        case .permissionDenied:
            return [
                "Contact your system administrator",
                "Verify your account permissions"
            ]
        case .unknown:
            return [
                "Try scanning the QR code again",
                "Restart the app and try again",
                "Contact support if the problem continues"
            ]
        }
    }
}

#Preview {
    VStack {
        Spacer()
        QRErrorAlertView(
            errorType: .invalidFormat,
            onRetry: {},
            onDismiss: {}
        )
        Spacer()
    }
    .background(Color.black.opacity(0.3))
}
