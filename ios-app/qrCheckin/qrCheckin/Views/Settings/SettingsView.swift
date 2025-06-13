//
//  SettingsView.swift
//  qrCheckin
//
//  Created on 12/6/25.
//

import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var loginViewModel: LoginViewModel
    @State private var showLogoutConfirmation = false
    @State private var showClearDataConfirmation = false
    @ObservedObject private var offlineService = OfflineService.shared
    
    var body: some View {
        NavigationView {
            List {
                // User Profile Section
                Section(header: Text("Profile")) {
                    if let user = loginViewModel.currentUser {
                        HStack(spacing: 15) {
                            Image(systemName: "person.circle.fill")
                                .font(.system(size: 50))
                                .foregroundColor(.blue)
                            
                            VStack(alignment: .leading, spacing: 5) {
                                Text(user.displayName)
                                    .font(.headline)
                                
                                Text(user.email)
                                    .font(.subheadline)
                                    .foregroundColor(.gray)
                                
                                Text(user.role.rawValue.capitalized)
                                    .font(.caption)
                                    .foregroundColor(.white)
                                    .padding(.horizontal, 8)
                                    .padding(.vertical, 2)
                                    .background(
                                        roleColor(for: user.role)
                                            .cornerRadius(10)
                                    )
                            }
                        }
                        .padding(.vertical, 5)
                    } else {
                        Text("Not logged in")
                            .foregroundColor(.gray)
                    }
                }
                
                // App Settings
                Section(header: Text("App Settings")) {
                    Toggle("Enable Offline Mode", isOn: $offlineService.enableOfflineMode)
                    
                    NavigationLink(destination: Text("Notification settings would go here")) {
                        Label("Notifications", systemImage: "bell")
                    }
                    
                    NavigationLink(destination: Text("Theme settings would go here")) {
                        Label("Appearance", systemImage: "paintbrush")
                    }
                }
                
                // Offline Data
                Section(header: Text("Offline Data")) {
                    HStack {
                        Label("Pending Sync Items", systemImage: "arrow.triangle.2.circlepath")
                        Spacer()
                        Text("\(offlineService.getQueuedItemsCount())")
                            .foregroundColor(.secondary)
                    }
                    
                    Button(action: {
                        offlineService.syncOfflineData()
                    }) {
                        Label("Sync Now", systemImage: "arrow.up.arrow.down.circle")
                    }
                    .disabled(!offlineService.isOnline || offlineService.getQueuedItemsCount() == 0)
                    
                    Button(action: {
                        showClearDataConfirmation = true
                    }) {
                        Label("Clear Offline Data", systemImage: "trash")
                            .foregroundColor(.red)
                    }
                    .disabled(offlineService.getQueuedItemsCount() == 0)
                }
                
                // App Info
                Section(header: Text("App Info")) {
                    HStack {
                        Text("Version")
                        Spacer()
                        Text("1.0.0 (beta)")
                            .foregroundColor(.secondary)
                    }
                    
                    NavigationLink(destination: Text("Privacy policy would go here")) {
                        Text("Privacy Policy")
                    }
                    
                    NavigationLink(destination: Text("Terms of service would go here")) {
                        Text("Terms of Service")
                    }
                }
                
                // Logout
                Section {
                    Button(action: {
                        showLogoutConfirmation = true
                    }) {
                        HStack {
                            Spacer()
                            Text("Logout")
                                .foregroundColor(.red)
                            Spacer()
                        }
                    }
                }
            }
            .listStyle(InsetGroupedListStyle())
            .navigationTitle("Settings")
            .alert("Logout", isPresented: $showLogoutConfirmation) {
                Button("Cancel", role: .cancel) { }
                Button("Logout", role: .destructive) {
                    loginViewModel.logout()
                }
            } message: {
                Text("Are you sure you want to logout?")
            }
            .alert("Clear Offline Data", isPresented: $showClearDataConfirmation) {
                Button("Cancel", role: .cancel) { }
                Button("Clear Data", role: .destructive) {
                    offlineService.clearOfflineData()
                }
            } message: {
                Text("This will clear all pending check-ins and check-outs that haven't been synced. This action cannot be undone.")
            }
        }
    }
    
    private func roleColor(for role: UserRole) -> Color {
        switch role {
        case .admin:
            return .red
        case .staff:
            return .blue
        case .user:
            return .green
        case .customer:
            return .orange
        case .systemAdmin:
            return .purple
        }
    }
}

struct SettingsView_Previews: PreviewProvider {
    static var previews: some View {
        SettingsView()
            .environmentObject(LoginViewModel())
    }
}
