//
//  CustomerPackagesView.swift
//  qrCheckin
//
//  Created by toan on 12/6/25.
//

import SwiftUI

struct CustomerPackagesView: View {
    @EnvironmentObject private var viewModel: CustomerViewModel
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    // Header
                    VStack(spacing: 8) {
                        Text("Subscription Packages")
                            .font(.title2)
                            .fontWeight(.bold)
                            .foregroundColor(.primary)
                        
                        Text("Choose the perfect plan for your fitness journey")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                    }
                    .padding(.top, 20)
                    
                    // Current Subscription
                    if let profile = viewModel.customerProfile,
                       let subscriptionRef = profile.activeSubscription {
                        currentSubscriptionCard(subscription: subscriptionRef.subscription)
                    }
                    
                    // Available Packages
                    if viewModel.subscriptionPackages.isEmpty {
                        emptyStateView
                    } else {
                        LazyVStack(spacing: 16) {
                            ForEach(viewModel.subscriptionPackages) { package in
                                packageCard(package: package)
                            }
                        }
                    }
                    
                    Spacer()
                }
                .padding(.horizontal)
            }
            .navigationBarHidden(true)
            .background(Color(.systemGroupedBackground))
        }
        .onAppear {
            viewModel.loadSubscriptionPackages()
        }
    }
    
    // MARK: - Current Subscription Card
    private func currentSubscriptionCard(subscription: Subscription) -> some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text("Current Subscription")
                    .font(.headline)
                    .foregroundColor(.primary)
                
                Spacer()
                
                Text("Active")
                    .font(.caption)
                    .fontWeight(.medium)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 4)
                    .background(Color.green.opacity(0.1))
                    .foregroundColor(.green)
                    .cornerRadius(12)
            }
            
            HStack(spacing: 16) {
                VStack(alignment: .leading, spacing: 4) {
                    Text(subscription.package?.name ?? "Unknown Plan")
                        .font(.title3)
                        .fontWeight(.semibold)
                    
                    Text("Expires: \(formatDate(subscription.endDate))")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                VStack(alignment: .trailing, spacing: 4) {
                    Text("\(subscription.daysRemaining)")
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundColor(.blue)
                    
                    Text("days left")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            
            // Renewal button
            Button(action: {
                // TODO: Handle renewal
            }) {
                Text("Renew Subscription")
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(.white)
                    .padding()
                    .frame(maxWidth: .infinity)
                    .background(Color.blue)
                    .cornerRadius(12)
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
        .shadow(color: Color.black.opacity(0.1), radius: 5, x: 0, y: 2)
    }
    
    // MARK: - Package Card
    private func packageCard(package: SubscriptionPackage) -> some View {
        VStack(alignment: .leading, spacing: 16) {
            // Header with name and popular badge
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(package.name)
                        .font(.title3)
                        .fontWeight(.bold)
                    
                    if let description = package.description {
                        Text(description)
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                }
                
                Spacer()
                
                if package.isPopular {
                    Text("Popular")
                        .font(.caption)
                        .fontWeight(.semibold)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(Color.orange)
                        .foregroundColor(.white)
                        .cornerRadius(8)
                }
            }
            
            // Pricing
            HStack(alignment: .bottom, spacing: 8) {
                if let discountPrice = package.discountPrice, discountPrice < package.price {
                    Text("$\(String(format: "%.0f", package.price))")
                        .font(.headline)
                        .strikethrough()
                        .foregroundColor(.secondary)
                    
                    Text("$\(String(format: "%.0f", discountPrice))")
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundColor(.primary)
                } else {
                    Text("$\(String(format: "%.0f", package.price))")
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundColor(.primary)
                }
                
                Text("/ \(package.type.rawValue.lowercased())")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
            
            // Features
            let features = package.features ?? []
            if !features.isEmpty {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Features")
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundColor(.primary)
                    
                    ForEach(features, id: \.self) { feature in
                        HStack(spacing: 8) {
                            Image(systemName: "checkmark.circle.fill")
                                .font(.caption)
                                .foregroundColor(.green)
                            
                            Text(feature)
                                .font(.caption)
                                .foregroundColor(.secondary)
                            
                            Spacer()
                        }
                    }
                }
            }
            
            // Purchase button
            Button(action: {
                // TODO: Handle purchase
            }) {
                Text("Select Plan")
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(.white)
                    .padding()
                    .frame(maxWidth: .infinity)
                    .background(package.isPopular ? Color.orange : Color.blue)
                    .cornerRadius(12)
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
        .shadow(color: Color.black.opacity(0.1), radius: 5, x: 0, y: 2)
        .overlay(
            package.isPopular ?
            RoundedRectangle(cornerRadius: 16)
                .stroke(Color.orange, lineWidth: 2)
            : nil
        )
    }
    
    // MARK: - Empty State
    private var emptyStateView: some View {
        VStack(spacing: 20) {
            Image(systemName: "bag.badge.plus")
                .font(.system(size: 60))
                .foregroundColor(.gray)
            
            Text("No Packages Available")
                .font(.title3)
                .fontWeight(.medium)
                .foregroundColor(.primary)
            
            Text("Check back later for available subscription packages")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
            
            Button("Refresh") {
                viewModel.loadSubscriptionPackages()
            }
            .foregroundColor(.blue)
        }
        .padding(.vertical, 40)
        .frame(maxWidth: .infinity)
    }
    
    // MARK: - Helper Methods
    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        return formatter.string(from: date)
    }
}

#Preview {
    CustomerPackagesView()
        .environmentObject(CustomerViewModel())
}
