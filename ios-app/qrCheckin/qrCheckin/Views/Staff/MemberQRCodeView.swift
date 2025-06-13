//
//  MemberQRCodeView.swift
//  qrCheckin
//
//  Created by toan on 12/6/25.
//

import SwiftUI
import CoreImage.CIFilterBuiltins

struct MemberQRCodeView: View {
    let member: Member
    @Environment(\.dismiss) private var dismiss
    @State private var qrImage: UIImage?
    @State private var isAnimating = false
    @State private var showShareSheet = false
    @State private var qrCodeSize: CGFloat = 250
    @State private var isLoading = true
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 30) {
                    // Header
                    headerView
                    
                    // QR Code Container
                    qrCodeContainer
                    
                    // Member Info
                    memberInfoView
                    
                    // Action Buttons
                    actionButtonsView
                    
                    // QR Code Information
                    qrCodeInfoView
                    
                    Spacer()
                }
                .padding(.horizontal)
            }
            .navigationTitle("Member QR Code")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Close") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Menu {
                        Button(action: {
                            regenerateQRCode()
                        }) {
                            Label("Regenerate QR Code", systemImage: "arrow.clockwise")
                        }
                        
                        Button(action: {
                            shareQRCode()
                        }) {
                            Label("Share QR Code", systemImage: "square.and.arrow.up")
                        }
                        
                        Button(action: {
                            saveQRCodeToPhotos()
                        }) {
                            Label("Save to Photos", systemImage: "photo")
                        }
                    } label: {
                        Image(systemName: "ellipsis.circle")
                    }
                }
            }
            .background(Color(.systemGroupedBackground))
        }
        .onAppear {
            generateQRCode()
            startAnimation()
        }
        .sheet(isPresented: $showShareSheet) {
            if let qrImage = qrImage {
                ShareSheet(items: [qrImage])
            }
        }
    }
    
    // MARK: - Header View
    private var headerView: some View {
        VStack(spacing: 8) {
            Text("QR Code for \(member.fullName)")
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(.primary)
            
            Text("Staff can scan this code for member check-in/check-out")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding(.top, 20)
    }
    
    // MARK: - QR Code Container
    private var qrCodeContainer: some View {
        ZStack {
            // Animated pulse ring
            RoundedRectangle(cornerRadius: 20)
                .stroke(Color.blue, lineWidth: 3)
                .scaleEffect(isAnimating ? 1.05 : 1.0)
                .opacity(isAnimating ? 0.3 : 0.7)
                .animation(
                    Animation.easeInOut(duration: 2.0)
                        .repeatForever(autoreverses: true),
                    value: isAnimating
                )
            
            // Main QR container
            RoundedRectangle(cornerRadius: 20)
                .fill(Color.white)
                .shadow(color: Color.black.opacity(0.1), radius: 15, x: 0, y: 10)
                .overlay(
                    VStack(spacing: 16) {
                        if isLoading {
                            // Loading state
                            VStack(spacing: 16) {
                                ProgressView()
                                    .scaleEffect(1.5)
                                
                                Text("Generating QR Code...")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                            .frame(width: qrCodeSize, height: qrCodeSize)
                        } else if let qrImage = qrImage {
                            // QR Code Image
                            Image(uiImage: qrImage)
                                .interpolation(.none)
                                .resizable()
                                .aspectRatio(contentMode: .fit)
                                .frame(width: qrCodeSize, height: qrCodeSize)
                                .onTapGesture {
                                    withAnimation(.spring()) {
                                        qrCodeSize = qrCodeSize == 250 ? 300 : 250
                                    }
                                }
                        } else {
                            // Error state
                            VStack(spacing: 12) {
                                Image(systemName: "exclamationmark.triangle")
                                    .font(.system(size: 40))
                                    .foregroundColor(.orange)
                                
                                Text("QR Code Unavailable")
                                    .font(.headline)
                                    .foregroundColor(.gray)
                                
                                Text("Unable to generate QR code")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                                
                                Button("Retry") {
                                    generateQRCode()
                                }
                                .font(.caption)
                                .padding(.horizontal, 16)
                                .padding(.vertical, 8)
                                .background(Color.blue)
                                .foregroundColor(.white)
                                .cornerRadius(8)
                            }
                            .frame(width: qrCodeSize, height: qrCodeSize)
                        }
                    }
                )
        }
        .frame(width: qrCodeSize + 40, height: qrCodeSize + 40)
    }
    
    // MARK: - Member Info View
    private var memberInfoView: some View {
        VStack(spacing: 12) {
            // Member Avatar and Name
            HStack(spacing: 16) {
                AsyncImage(url: URL(string: member.profileImageUrl ?? "")) { image in
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                } placeholder: {
                    Circle()
                        .fill(Color.gray.opacity(0.3))
                        .overlay(
                            Image(systemName: "person.fill")
                                .foregroundColor(.white)
                        )
                }
                .frame(width: 60, height: 60)
                .clipShape(Circle())
                
                VStack(alignment: .leading, spacing: 4) {
                    Text(member.fullName)
                        .font(.headline)
                        .foregroundColor(.primary)
                    
                    Text(member.email)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                    
                    // Status Badge
                    HStack(spacing: 4) {
                        Circle()
                            .fill(member.status.swiftUIColor)
                            .frame(width: 6, height: 6)
                        
                        Text(member.status.displayName)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                
                Spacer()
            }
            .padding()
            .background(Color(.systemBackground))
            .cornerRadius(12)
            .shadow(color: Color.black.opacity(0.1), radius: 5, x: 0, y: 2)
        }
    }
    
    // MARK: - Action Buttons
    private var actionButtonsView: some View {
        HStack(spacing: 16) {
            // Check-in Button
            actionButton(
                title: "Check-in",
                icon: "checkmark.circle.fill",
                color: .green,
                action: {
                    performCheckin(type: .checkin)
                }
            )
            
            // Check-out Button
            actionButton(
                title: "Check-out", 
                icon: "xmark.circle.fill",
                color: .red,
                action: {
                    performCheckin(type: .checkout)
                }
            )
            
            // Share Button
            actionButton(
                title: "Share",
                icon: "square.and.arrow.up",
                color: .blue,
                action: shareQRCode
            )
        }
    }
    
    private func actionButton(title: String, icon: String, color: Color, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            VStack(spacing: 8) {
                Image(systemName: icon)
                    .font(.title2)
                
                Text(title)
                    .font(.caption)
                    .fontWeight(.medium)
            }
            .foregroundColor(.white)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 16)
            .background(color)
            .cornerRadius(12)
        }
        .disabled(qrImage == nil)
    }
    
    // MARK: - QR Code Information
    private var qrCodeInfoView: some View {
        VStack(spacing: 16) {
            Text("QR Code Information")
                .font(.headline)
                .foregroundColor(.primary)
            
            VStack(spacing: 12) {
                if let qrCode = member.currentQRCode {
                    infoRow(title: "QR Code ID", value: qrCode.id, icon: "qrcode")
                    infoRow(title: "Usage Count", value: "\(qrCode.usageCount)", icon: "number.circle")
                    
                    if let lastUsed = qrCode.lastUsed {
                        infoRow(title: "Last Used", value: formatDateTime(lastUsed), icon: "clock")
                    }
                    
                    if let expiresAt = qrCode.expiresAt {
                        infoRow(title: "Expires", value: formatDateTime(expiresAt), icon: "calendar.badge.exclamationmark")
                    }
                    
                    infoRow(title: "Status", value: qrCode.isActive ? "Active" : "Inactive", icon: "info.circle")
                }
                
                infoRow(title: "Member ID", value: member.id, icon: "person.text.rectangle")
                infoRow(title: "Total Check-ins", value: "\(member.totalCheckins)", icon: "checkmark.circle")
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
        .shadow(color: Color.black.opacity(0.1), radius: 5, x: 0, y: 2)
    }
    
    private func infoRow(title: String, value: String, icon: String) -> some View {
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
    
    // MARK: - Helper Methods
    private func generateQRCode() {
        isLoading = true
        
        // Generate QR code data based on member and subscription
        let qrCodeData: String
        
        if let qrCode = member.currentQRCode {
            qrCodeData = qrCode.code
        } else {
            // Fallback QR code format
            qrCodeData = "MEMBER-\(member.id)-\(Date().timeIntervalSince1970)"
        }
        
        // Generate QR image
        DispatchQueue.global(qos: .userInitiated).async {
            let generatedImage = generateQRCodeImage(from: qrCodeData)
            
            DispatchQueue.main.async {
                qrImage = generatedImage
                isLoading = false
            }
        }
    }
    
    private func generateQRCodeImage(from string: String) -> UIImage? {
        let data = string.data(using: String.Encoding.ascii)
        
        if let filter = CIFilter(name: "CIQRCodeGenerator") {
            filter.setValue(data, forKey: "inputMessage")
            let transform = CGAffineTransform(scaleX: 10, y: 10)
            
            if let output = filter.outputImage?.transformed(by: transform) {
                let context = CIContext()
                if let cgImage = context.createCGImage(output, from: output.extent) {
                    return UIImage(cgImage: cgImage)
                }
            }
        }
        
        return nil
    }
    
    private func regenerateQRCode() {
        qrImage = nil
        generateQRCode()
    }
    
    private func shareQRCode() {
        guard qrImage != nil else { return }
        showShareSheet = true
    }
    
    private func saveQRCodeToPhotos() {
        guard let qrImage = qrImage else { return }
        
        UIImageWriteToSavedPhotosAlbum(qrImage, nil, nil, nil)
        
        // Show success feedback
        let impactFeedback = UIImpactFeedbackGenerator(style: .medium)
        impactFeedback.impactOccurred()
    }
    
    private func performCheckin(type: CheckinType) {
        guard let qrCode = member.currentQRCode else { return }
        
        // TODO: Implement check-in/check-out logic
        print("Performing \(type.rawValue) for member: \(member.fullName)")
        print("QR Code: \(qrCode.code)")
        
        // Provide haptic feedback
        let impactFeedback = UIImpactFeedbackGenerator(style: .medium)
        impactFeedback.impactOccurred()
    }
    
    private func startAnimation() {
        isAnimating = true
    }
    
    private func formatDateTime(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .short
        formatter.timeStyle = .short
        return formatter.string(from: date)
    }
}

// MARK: - Share Sheet
struct ShareSheet: UIViewControllerRepresentable {
    let items: [Any]
    
    func makeUIViewController(context: Context) -> UIActivityViewController {
        UIActivityViewController(activityItems: items, applicationActivities: nil)
    }
    
    func updateUIViewController(_ uiViewController: UIActivityViewController, context: Context) {}
}

#Preview {
    MemberQRCodeView(member: Member(
        id: "1",
        email: "john.doe@example.com",
        firstName: "John",
        lastName: "Doe",
        phone: "+1234567890",
        dateOfBirth: Date(),
        gender: "Male",
        address: "123 Main St",
        city: "New York",
        state: "NY",
        country: "USA",
        postalCode: "10001",
        isActive: true,
        createdAt: Date(),
        updatedAt: Date(),
        clubId: "1",
        profileImageUrl: nil,
        fullName: "John Doe",
        displayName: "John Doe",
        currentSubscription: nil,
        currentQRCode: MemberQRCode(
            id: "qr_1",
            code: "MEMBER-1-12345",
            usageCount: 15,
            lastUsed: Date(),
            lastUsedAt: Date(),
            expiresAt: Date().addingTimeInterval(86400 * 30), // 30 days
            isActive: true,
            createdAt: Date(),
            updatedAt: Date()
        ),
        recentCheckins: [],
        totalSubscriptions: 2,
        totalCheckins: 15,
        memberSince: Date(),
        status: .active,
        subscriptionExpiry: Date(),
        lastActivity: Date(),
        thisMonthCheckins: 5,
        subscriptionHistory: nil,
        checkinHistory: nil,
        stats: nil
    ))
}
