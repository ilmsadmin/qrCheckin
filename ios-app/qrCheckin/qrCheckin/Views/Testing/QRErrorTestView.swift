//
//  QRErrorTestView.swift
//  qrCheckin
//
//  Created by toan on 12/6/25.
//  This file is for testing QR error alerts in development

import SwiftUI

struct QRErrorTestView: View {
    @State private var showErrorAlert = false
    @State private var selectedErrorType: QRErrorType = .invalidFormat
    
    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                Text("QR Error Alert Testing")
                    .font(.title2)
                    .fontWeight(.bold)
                    .padding()
                
                VStack(spacing: 12) {
                    ForEach(errorTypes, id: \.title) { errorType in
                        Button(action: {
                            selectedErrorType = errorType
                            showErrorAlert = true
                        }) {
                            HStack {
                                Image(systemName: errorType.iconName)
                                Text(errorType.title)
                                Spacer()
                                Image(systemName: "chevron.right")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                            .padding()
                            .background(Color(.systemGray6))
                            .cornerRadius(12)
                        }
                        .foregroundColor(.primary)
                    }
                }
                .padding(.horizontal)
                
                Spacer()
            }
            .navigationTitle("Error Testing")
            .navigationBarTitleDisplayMode(.large)
        }
        .overlay(
            Group {
                if showErrorAlert {
                    ZStack {
                        Color.black.opacity(0.4)
                            .ignoresSafeArea()
                            .onTapGesture {
                                showErrorAlert = false
                            }
                        
                        QRErrorAlertView(
                            errorType: selectedErrorType,
                            onRetry: {
                                showErrorAlert = false
                                print("Retry tapped for: \(selectedErrorType.title)")
                            },
                            onDismiss: {
                                showErrorAlert = false
                                print("Dismiss tapped for: \(selectedErrorType.title)")
                            }
                        )
                        .transition(.asymmetric(
                            insertion: .scale.combined(with: .opacity),
                            removal: .opacity
                        ))
                    }
                    .animation(.spring(response: 0.5, dampingFraction: 0.8), value: showErrorAlert)
                }
            }
        )
    }
    
    private var errorTypes: [QRErrorType] {
        [
            .invalidFormat,
            .memberNotFound,
            .networkError,
            .expired,
            .alreadyCheckedIn,
            .permissionDenied,
            .unknown("This is a custom error message for testing purposes")
        ]
    }
}

#Preview {
    QRErrorTestView()
}
