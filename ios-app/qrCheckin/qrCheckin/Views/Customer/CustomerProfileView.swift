//
//  CustomerProfileView.swift
//  qrCheckin
//
//  Created by toan on 12/6/25.
//

import SwiftUI

struct CustomerProfileView: View {
    @EnvironmentObject private var viewModel: CustomerViewModel
    @EnvironmentObject private var loginViewModel: LoginViewModel
    @State private var showLogoutAlert = false
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 24) {
                    // Profile Header
                    profileHeaderView
                    
                    // Personal Information
                    personalInfoSection
                    
                    // Membership Information
                    membershipInfoSection
                    
                    // Account Settings
                    accountSettingsSection
                    
                    // Support Section
                    supportSection
                    
                    // Logout Button
                    logoutSection
                    
                    Spacer()
                }
                .padding(.horizontal)
            }
            .navigationBarHidden(true)
            .background(Color(.systemGroupedBackground))
        }
        .alert("Logout", isPresented: $showLogoutAlert) {
            Button("Cancel", role: .cancel) { }
            Button("Logout", role: .destructive) {
                loginViewModel.logout()
            }
        } message: {
            Text("Are you sure you want to logout?")
        }
    }
    
    // MARK: - Profile Header
    private var profileHeaderView: some View {
        VStack(spacing: 16) {
            // Profile image
            AsyncImage(url: URL(string: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80")) { image in
                image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } placeholder: {
                Circle()
                    .fill(Color.gray.opacity(0.3))
            }
            .frame(width: 100, height: 100)
            .clipShape(Circle())
            .overlay(
                Circle()
                    .stroke(Color.white, lineWidth: 4)
            )
            .shadow(color: Color.black.opacity(0.1), radius: 10, x: 0, y: 5)
            
            // Name and membership
            VStack(spacing: 4) {
                Text(viewModel.customerProfile?.displayName ?? "Loading...")
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(.primary)
                
                Text(viewModel.membershipCardTitle)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
            
            // Status badge
            HStack(spacing: 4) {
                Circle()
                    .fill(Color(viewModel.membershipStatusColor))
                    .frame(width: 8, height: 8)
                
                Text(viewModel.membershipStatus)
                    .font(.caption)
                    .fontWeight(.medium)
                    .foregroundColor(.primary)
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
            .background(Color(viewModel.membershipStatusColor).opacity(0.1))
            .cornerRadius(16)
        }
        .padding(.top, 20)
    }
    
    // MARK: - Personal Information
    private var personalInfoSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Personal Information")
                .font(.headline)
                .foregroundColor(.primary)
            
            VStack(spacing: 12) {
                profileInfoRow(
                    title: "Email",
                    value: viewModel.customerProfile?.email ?? "N/A",
                    icon: "envelope.fill"
                )
                
                profileInfoRow(
                    title: "Phone",
                    value: viewModel.customerProfile?.phone ?? "Not provided",
                    icon: "phone.fill"
                )
                
                profileInfoRow(
                    title: "Member Since",
                    value: viewModel.memberSince,
                    icon: "calendar"
                )
                
                if let dateOfBirth = viewModel.customerProfile?.dateOfBirth {
                    profileInfoRow(
                        title: "Date of Birth",
                        value: formatDate(dateOfBirth),
                        icon: "gift.fill"
                    )
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
        .shadow(color: Color.black.opacity(0.1), radius: 5, x: 0, y: 2)
    }
    
    // MARK: - Membership Information
    private var membershipInfoSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Membership Information")
                .font(.headline)
                .foregroundColor(.primary)
            
            if let subscription = viewModel.customerProfile?.activeSubscription {
                VStack(spacing: 12) {
                    profileInfoRow(
                        title: "Current Plan",
                        value: subscription.package?.name ?? "Unknown",
                        icon: "star.fill"
                    )
                    
                    profileInfoRow(
                        title: "Start Date",
                        value: formatDate(subscription.startDate),
                        icon: "play.circle.fill"
                    )
                    
                    profileInfoRow(
                        title: "End Date",
                        value: formatDate(subscription.endDate),
                        icon: "stop.circle.fill"
                    )
                    
                    profileInfoRow(
                        title: "Days Remaining",
                        value: "\(subscription.daysRemaining) days",
                        icon: "hourglass"
                    )
                }
            } else {
                VStack(spacing: 12) {
                    Image(systemName: "exclamationmark.triangle.fill")
                        .font(.title2)
                        .foregroundColor(.orange)
                    
                    Text("No Active Subscription")
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundColor(.primary)
                    
                    Text("Purchase a subscription to access club services")
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                    
                    Button("Browse Packages") {
                        viewModel.selectedTab = 2 // Switch to packages tab
                    }
                    .font(.caption)
                    .foregroundColor(.blue)
                }
                .padding(.vertical, 8)
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
        .shadow(color: Color.black.opacity(0.1), radius: 5, x: 0, y: 2)
    }
    
    // MARK: - Account Settings
    private var accountSettingsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Account Settings")
                .font(.headline)
                .foregroundColor(.primary)
            
            VStack(spacing: 0) {
                settingsRow(
                    title: "Edit Profile",
                    icon: "person.crop.circle",
                    action: {}
                )
                
                Divider()
                    .padding(.leading, 44)
                
                settingsRow(
                    title: "Payment Methods",
                    icon: "creditcard",
                    action: {}
                )
                
                Divider()
                    .padding(.leading, 44)
                
                settingsRow(
                    title: "Notifications",
                    icon: "bell",
                    action: {}
                )
                
                Divider()
                    .padding(.leading, 44)
                
                settingsRow(
                    title: "Privacy Settings",
                    icon: "lock.shield",
                    action: {}
                )
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
        .shadow(color: Color.black.opacity(0.1), radius: 5, x: 0, y: 2)
    }
    
    // MARK: - Support Section
    private var supportSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Support")
                .font(.headline)
                .foregroundColor(.primary)
            
            VStack(spacing: 0) {
                settingsRow(
                    title: "Help Center",
                    icon: "questionmark.circle",
                    action: {}
                )
                
                Divider()
                    .padding(.leading, 44)
                
                settingsRow(
                    title: "Contact Support",
                    icon: "message",
                    action: {}
                )
                
                Divider()
                    .padding(.leading, 44)
                
                settingsRow(
                    title: "Report Issue",
                    icon: "exclamationmark.bubble",
                    action: {}
                )
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
        .shadow(color: Color.black.opacity(0.1), radius: 5, x: 0, y: 2)
    }
    
    // MARK: - Logout Section
    private var logoutSection: some View {
        Button(action: {
            showLogoutAlert = true
        }) {
            HStack {
                Image(systemName: "rectangle.portrait.and.arrow.right")
                    .font(.title3)
                    .foregroundColor(.red)
                
                Text("Logout")
                    .font(.headline)
                    .fontWeight(.medium)
                    .foregroundColor(.red)
                
                Spacer()
            }
            .padding()
            .background(Color(.systemBackground))
            .cornerRadius(16)
            .shadow(color: Color.black.opacity(0.1), radius: 5, x: 0, y: 2)
        }
    }
    
    // MARK: - Helper Views
    private func profileInfoRow(title: String, value: String, icon: String) -> some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundColor(.blue)
                .frame(width: 20)
            
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.caption)
                    .foregroundColor(.secondary)
                
                Text(value)
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(.primary)
            }
            
            Spacer()
        }
    }
    
    private func settingsRow(title: String, icon: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack(spacing: 12) {
                Image(systemName: icon)
                    .font(.title3)
                    .foregroundColor(.blue)
                    .frame(width: 20)
                
                Text(title)
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(.primary)
                
                Spacer()
                
                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            .padding(.vertical, 12)
        }
    }
    
    // MARK: - Helper Methods
    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        return formatter.string(from: date)
    }
}

#Preview {
    CustomerProfileView()
        .environmentObject(CustomerViewModel())
        .environmentObject(LoginViewModel())
}