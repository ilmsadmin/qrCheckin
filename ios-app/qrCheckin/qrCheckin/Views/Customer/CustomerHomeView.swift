//
//  CustomerHomeView.swift
//  qrCheckin
//
//  Created by toan on 12/6/25.
//

import SwiftUI

struct CustomerHomeView: View {
    @StateObject private var viewModel = CustomerViewModel()
    @EnvironmentObject private var loginViewModel: LoginViewModel
    
    var body: some View {
        TabView(selection: $viewModel.selectedTab) {
            // Home Tab
            customerDashboardView
                .tabItem {
                    Image(systemName: "house.fill")
                    Text("Home")
                }
                .tag(0)
            
            // QR Code Tab
            customerQRView
                .tabItem {
                    Image(systemName: "qrcode")
                    Text("My QR")
                }
                .tag(1)
            
            // Packages Tab
            packagesView
                .tabItem {
                    Image(systemName: "bag.fill")
                    Text("Packages")
                }
                .tag(2)
            
            // Profile Tab
            customerProfileView
                .tabItem {
                    Image(systemName: "person.fill")
                    Text("Profile")
                }
                .tag(3)
        }
        .tint(.blue)
        .onAppear {
            viewModel.loadCustomerData()
        }
        .alert(viewModel.alertTitle, isPresented: $viewModel.showAlert) {
            Button("OK") { }
        } message: {
            Text(viewModel.alertMessage)
        }
    }
    
    // MARK: - Customer Dashboard
    private var customerDashboardView: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    // Header with user info
                    headerView
                    
                    // Membership Card
                    membershipCardView
                    
                    // Quick Actions
                    quickActionsView
                    
                    // Recent Activity
                    recentActivityView
                    
                    Spacer()
                }
            }
            .navigationBarHidden(true)
            .background(Color(.systemGroupedBackground))
        }
    }
    
    // MARK: - Header
    private var headerView: some View {
        VStack(spacing: 0) {
            // Main header
            LinearGradient(
                gradient: Gradient(colors: [Color.blue, Color.indigo]),
                startPoint: .leading,
                endPoint: .trailing
            )
            .frame(height: 80)
            .overlay(
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Fitness Club Pro")
                            .font(.title2)
                            .fontWeight(.bold)
                            .foregroundColor(.white)
                        Text(viewModel.membershipCardTitle)
                            .font(.subheadline)
                            .foregroundColor(.blue.opacity(0.8))
                    }
                    
                    Spacer()
                    
                    HStack(spacing: 16) {
                        // Notification button
                        Button(action: {}) {
                            ZStack {
                                Image(systemName: "bell.fill")
                                    .font(.title3)
                                    .foregroundColor(.white)
                                
                                // Notification badge
                                Circle()
                                    .fill(Color.red)
                                    .frame(width: 18, height: 18)
                                    .overlay(
                                        Text("2")
                                            .font(.caption2)
                                            .fontWeight(.semibold)
                                            .foregroundColor(.white)
                                    )
                                    .offset(x: 8, y: -8)
                            }
                        }
                        
                        // Profile image
                        AsyncImage(url: URL(string: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80")) { image in
                            image
                                .resizable()
                                .aspectRatio(contentMode: .fill)
                        } placeholder: {
                            Circle()
                                .fill(Color.gray.opacity(0.3))
                        }
                        .frame(width: 40, height: 40)
                        .clipShape(Circle())
                        .overlay(
                            Circle()
                                .stroke(Color.white, lineWidth: 2)
                        )
                    }
                }
                .padding(.horizontal)
            )
        }
        .ignoresSafeArea(.container, edges: .top)
    }
    
    // MARK: - Membership Card
    private var membershipCardView: some View {
        LinearGradient(
            gradient: Gradient(colors: [Color.blue, Color.indigo]),
            startPoint: .leading,
            endPoint: .trailing
        )
        .frame(height: 180)
        .cornerRadius(16)
        .overlay(
            VStack(spacing: 0) {
                // Top section with name and QR icon
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Member")
                            .font(.caption)
                            .foregroundColor(.blue.opacity(0.7))
                        Text(viewModel.customerProfile?.displayName ?? "Loading...")
                            .font(.title3)
                            .fontWeight(.bold)
                            .foregroundColor(.white)
                    }
                    
                    Spacer()
                    
                    Button(action: {
                        viewModel.selectedTab = 1
                    }) {
                        RoundedRectangle(cornerRadius: 8)
                            .fill(Color.blue.opacity(0.3))
                            .frame(width: 40, height: 40)
                            .overlay(
                                Image(systemName: "qrcode")
                                    .font(.title3)
                                    .foregroundColor(.white)
                            )
                    }
                }
                .padding()
                
                Spacer()
                
                // Bottom section with membership details
                HStack(spacing: 20) {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Membership")
                            .font(.caption2)
                            .foregroundColor(.blue.opacity(0.7))
                        Text(viewModel.membershipCardTitle)
                            .font(.caption)
                            .fontWeight(.medium)
                            .foregroundColor(.white)
                    }
                    
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Status")
                            .font(.caption2)
                            .foregroundColor(.blue.opacity(0.7))
                        HStack(spacing: 4) {
                            Circle()
                                .fill(Color(viewModel.membershipStatusColor))
                                .frame(width: 8, height: 8)
                            Text(viewModel.membershipStatus)
                                .font(.caption)
                                .fontWeight(.medium)
                                .foregroundColor(.white)
                        }
                    }
                    
                    Spacer()
                    
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Member Since")
                            .font(.caption2)
                            .foregroundColor(.blue.opacity(0.7))
                        Text(viewModel.memberSince)
                            .font(.caption)
                            .fontWeight(.medium)
                            .foregroundColor(.white)
                    }
                    
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Expires")
                            .font(.caption2)
                            .foregroundColor(.blue.opacity(0.7))
                        Text(viewModel.membershipExpiry)
                            .font(.caption)
                            .fontWeight(.medium)
                            .foregroundColor(.white)
                    }
                }
                .padding()
                .padding(.bottom, 8)
            }
        )
        .padding(.horizontal)
        .shadow(color: Color.black.opacity(0.1), radius: 10, x: 0, y: 5)
    }
    
    // MARK: - Quick Actions
    private var quickActionsView: some View {
        HStack(spacing: 16) {
            quickActionButton(
                title: "Calendar",
                icon: "calendar",
                color: .blue,
                action: {}
            )
            
            quickActionButton(
                title: "History",
                icon: "clock.arrow.circlepath",
                color: .green,
                action: {}
            )
            
            quickActionButton(
                title: "Payment",
                icon: "creditcard.fill",
                color: .purple,
                action: {}
            )
        }
        .padding(.horizontal)
    }
    
    private func quickActionButton(title: String, icon: String, color: Color, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            VStack(spacing: 12) {
                RoundedRectangle(cornerRadius: 12)
                    .fill(color.opacity(0.1))
                    .frame(width: 48, height: 48)
                    .overlay(
                        Image(systemName: icon)
                            .font(.title3)
                            .foregroundColor(color)
                    )
                
                Text(title)
                    .font(.caption)
                    .foregroundColor(.primary)
            }
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
        .shadow(color: Color.black.opacity(0.1), radius: 5, x: 0, y: 2)
    }
    
    // MARK: - Recent Activity
    private var recentActivityView: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text("Recent Activity")
                    .font(.title3)
                    .fontWeight(.bold)
                    .foregroundColor(.primary)
                
                Spacer()
                
                Button("See All") {
                    // TODO: Navigate to full history
                }
                .font(.subheadline)
                .foregroundColor(.blue)
            }
            
            if viewModel.recentCheckins.isEmpty {
                VStack(spacing: 16) {
                    Image(systemName: "clock.arrow.circlepath")
                        .font(.system(size: 32))
                        .foregroundColor(.gray)
                    
                    Text("No recent activity")
                        .font(.subheadline)
                        .foregroundColor(.gray)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 40)
            } else {
                LazyVStack(spacing: 12) {
                    ForEach(viewModel.recentCheckins) { checkin in
                        recentActivityRow(checkin: checkin)
                    }
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
        .shadow(color: Color.black.opacity(0.1), radius: 5, x: 0, y: 2)
        .padding(.horizontal)
    }
    
    private func recentActivityRow(checkin: CheckinLog) -> some View {
        HStack {
            // Activity type indicator
            RoundedRectangle(cornerRadius: 4)
                .fill(checkin.type == .checkin ? Color.green : Color.red)
                .frame(width: 4, height: 40)
            
            RoundedRectangle(cornerRadius: 8)
                .fill((checkin.type == .checkin ? Color.green : Color.red).opacity(0.1))
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .overlay(
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text(checkin.type == .checkin ? "Check-in" : "Check-out")
                                .font(.subheadline)
                                .fontWeight(.medium)
                                .foregroundColor(.primary)
                            
                            Text(viewModel.formatCheckinTime(checkin))
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        
                        Spacer()
                        
                        Circle()
                            .fill(Color(.systemBackground))
                            .frame(width: 32, height: 32)
                            .overlay(
                                Image(systemName: checkin.type == .checkin ? "arrow.right" : "arrow.left")
                                    .font(.caption)
                                    .foregroundColor(checkin.type == .checkin ? .green : .red)
                            )
                    }
                    .padding(.horizontal, 12)
                )
        }
        .frame(height: 56)
    }
    
    // MARK: - Placeholder Views (will be implemented in separate files)
    private var customerQRView: some View {
        CustomerQRCodeView()
            .environmentObject(viewModel)
    }
    
    private var packagesView: some View {
        CustomerPackagesView()
            .environmentObject(viewModel)
    }
    
    private var customerProfileView: some View {
        CustomerProfileView()
            .environmentObject(viewModel)
            .environmentObject(loginViewModel)
    }
}

#Preview {
    CustomerHomeView()
        .environmentObject(LoginViewModel())
}
