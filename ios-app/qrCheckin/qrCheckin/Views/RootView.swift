//
//  RootView.swift
//  qrCheckin
//
//  Created by toan on 12/6/25.
//

import SwiftUI

struct RootView: View {
    @StateObject private var loginViewModel = LoginViewModel()
    
    var body: some View {
        Group {
            if loginViewModel.isLoggedIn {
                // Route to appropriate interface based on user role
                if let user = loginViewModel.currentUser {
                    if user.role.isCustomer {
                        // Customer interface
                        CustomerHomeView()
                            .environmentObject(loginViewModel)
                    } else {
                        // Staff interface (Admin/Staff)
                        staffTabView
                            .environmentObject(loginViewModel)
                    }
                } else {
                    // User is logged in but no user data - show loading
                    LoadingView()
                        .environmentObject(loginViewModel)
                }
            } else {
                LoginView()
                    .environmentObject(loginViewModel)
            }
        }
        .animation(.easeInOut, value: loginViewModel.isLoggedIn)
    }
    
    // MARK: - Staff Tab View
    private var staffTabView: some View {
        TabView {
            EnhancedScannerView()
                .tabItem {
                    Label("Scan", systemImage: "qrcode.viewfinder")
                }
            
            // Members view (placeholder for now)
            NavigationView {
                Text("Members View - Coming Soon")
                    .navigationTitle("Members")
            }
            .tabItem {
                Label("Members", systemImage: "person.2.fill")
            }
            
            DashboardView()
                .tabItem {
                    Label("Activity", systemImage: "chart.line.uptrend.xyaxis")
                }
            
            SettingsView()
                .tabItem {
                    Label("Settings", systemImage: "gearshape.fill")
                }
        }
        .tint(.blue)
    }
}

// MARK: - Loading View
struct LoadingView: View {
    var body: some View {
        VStack(spacing: 20) {
            ProgressView()
                .scaleEffect(1.5)
            
            Text("Loading...")
                .font(.headline)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(.systemBackground))
    }
}

#Preview {
    RootView()
}