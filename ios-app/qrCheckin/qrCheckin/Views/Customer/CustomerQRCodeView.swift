//
//  CustomerQRCodeView.swift
//  qrCheckin
//
//  Created by toan on 12/6/25.
//

import SwiftUI

struct CustomerQRCodeView: View {
    @EnvironmentObject private var viewModel: CustomerViewModel
    @State private var qrImage: UIImage?
    @State private var isAnimating = false
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 30) {
                    // Header
                    VStack(spacing: 8) {
                        Text("Your QR Code")
                            .font(.title2)
                            .fontWeight(.bold)
                            .foregroundColor(.primary)
                        
                        Text("Present this QR code when you arrive at the club")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                    }
                    .padding(.top, 20)
                    
                    // QR Code Container
                    qrCodeContainer
                    
                    // Action Buttons
                    actionButtonsView
                    
                    // Instructions
                    instructionsView
                    
                    Spacer()
                }
                .padding(.horizontal)
            }
            .navigationBarHidden(true)
            .background(Color(.systemGroupedBackground))
        }
        .sheet(isPresented: $viewModel.showQREnlarged) {
            enlargedQRView
        }
        .onAppear {
            generateQRCode()
            startAnimation()
        }
    }
    
    // MARK: - QR Code Container
    private var qrCodeContainer: some View {
        ZStack {
            // Animated pulse ring
            RoundedRectangle(cornerRadius: 16)
                .stroke(Color.blue, lineWidth: 3)
                .scaleEffect(isAnimating ? 1.1 : 1.0)
                .opacity(isAnimating ? 0.3 : 0.7)
                .animation(
                    Animation.easeInOut(duration: 1.5)
                        .repeatForever(autoreverses: true),
                    value: isAnimating
                )
            
            // Main QR container
            RoundedRectangle(cornerRadius: 16)
                .fill(Color(.systemBackground))
                .shadow(color: Color.black.opacity(0.1), radius: 10, x: 0, y: 5)
                .overlay(
                    VStack(spacing: 16) {
                        if let qrImage = qrImage {
                            Image(uiImage: qrImage)
                                .interpolation(.none)
                                .resizable()
                                .aspectRatio(contentMode: .fit)
                                .frame(width: 240, height: 240)
                        } else if viewModel.hasQRCode {
                            // Loading placeholder
                            RoundedRectangle(cornerRadius: 8)
                                .fill(Color.gray.opacity(0.2))
                                .frame(width: 240, height: 240)
                                .overlay(
                                    ProgressView()
                                        .scaleEffect(1.5)
                                )
                        } else {
                            // No QR code available
                            VStack(spacing: 12) {
                                Image(systemName: "qrcode")
                                    .font(.system(size: 60))
                                    .foregroundColor(.gray)
                                
                                Text("QR Code Unavailable")
                                    .font(.headline)
                                    .foregroundColor(.gray)
                                
                                Text("Please contact support")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                            .frame(width: 240, height: 240)
                        }
                        
                        Button(action: {
                            viewModel.enlargeQRCode()
                        }) {
                            Text("Tap to enlarge")
                                .font(.caption)
                                .foregroundColor(.blue)
                        }
                        .disabled(!viewModel.hasQRCode)
                    }
                    .padding()
                )
        }
        .frame(width: 280, height: 320)
        .onTapGesture {
            if viewModel.hasQRCode {
                viewModel.enlargeQRCode()
            }
        }
    }
    
    // MARK: - Action Buttons
    private var actionButtonsView: some View {
        HStack(spacing: 20) {
            actionButton(
                title: "Refresh",
                icon: "arrow.clockwise",
                color: .blue,
                action: {
                    viewModel.refreshData()
                    generateQRCode()
                }
            )
            
            actionButton(
                title: "Share",
                icon: "square.and.arrow.up",
                color: .green,
                action: shareQRCode
            )
        }
    }
    
    private func actionButton(title: String, icon: String, color: Color, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack(spacing: 8) {
                Image(systemName: icon)
                    .font(.subheadline)
                Text(title)
                    .font(.subheadline)
                    .fontWeight(.medium)
            }
            .foregroundColor(.white)
            .padding(.horizontal, 24)
            .padding(.vertical, 12)
            .background(color)
            .cornerRadius(25)
        }
        .disabled(!viewModel.hasQRCode)
    }
    
    // MARK: - Instructions
    private var instructionsView: some View {
        VStack(spacing: 16) {
            HStack(spacing: 12) {
                Image(systemName: "1.circle.fill")
                    .font(.title3)
                    .foregroundColor(.blue)
                
                VStack(alignment: .leading, spacing: 4) {
                    Text("Arrive at the club")
                        .font(.subheadline)
                        .fontWeight(.medium)
                    Text("Present your QR code to staff at the entrance")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
            }
            
            HStack(spacing: 12) {
                Image(systemName: "2.circle.fill")
                    .font(.title3)
                    .foregroundColor(.green)
                
                VStack(alignment: .leading, spacing: 4) {
                    Text("Quick scan")
                        .font(.subheadline)
                        .fontWeight(.medium)
                    Text("Staff will scan your code for instant check-in")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
            }
            
            HStack(spacing: 12) {
                Image(systemName: "3.circle.fill")
                    .font(.title3)
                    .foregroundColor(.purple)
                
                VStack(alignment: .leading, spacing: 4) {
                    Text("Enjoy your visit")
                        .font(.subheadline)
                        .fontWeight(.medium)
                    Text("Your activity will be automatically tracked")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.1), radius: 5, x: 0, y: 2)
    }
    
    // MARK: - Enlarged QR View
    private var enlargedQRView: some View {
        NavigationView {
            VStack(spacing: 30) {
                Text("Your QR Code")
                    .font(.title2)
                    .fontWeight(.bold)
                
                Text("Show this to club staff")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                
                if let qrImage = qrImage {
                    Image(uiImage: qrImage)
                        .interpolation(.none)
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                        .frame(maxWidth: 300, maxHeight: 300)
                        .background(Color.white)
                        .cornerRadius(16)
                        .shadow(color: Color.black.opacity(0.1), radius: 10, x: 0, y: 5)
                }
                
                HStack(spacing: 16) {
                    Button("Close") {
                        viewModel.dismissQRCode()
                    }
                    .foregroundColor(.white)
                    .padding()
                    .frame(maxWidth: .infinity)
                    .background(Color.blue)
                    .cornerRadius(12)
                    
                    Button(action: shareQRCode) {
                        Image(systemName: "square.and.arrow.up")
                            .font(.title3)
                    }
                    .foregroundColor(.blue)
                    .padding()
                    .background(Color.gray.opacity(0.2))
                    .cornerRadius(12)
                }
                
                Spacer()
            }
            .padding()
            .navigationBarHidden(true)
        }
    }
    
    // MARK: - Helper Methods
    private func generateQRCode() {
        guard viewModel.hasQRCode else { return }
        
        let qrCodeData = viewModel.qrCodeData
        qrImage = generateQRCode(from: qrCodeData)
    }
    
    private func generateQRCode(from string: String) -> UIImage? {
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
    
    private func startAnimation() {
        isAnimating = true
    }
    
    private func shareQRCode() {
        guard let qrImage = qrImage else { return }
        
        let activityViewController = UIActivityViewController(
            activityItems: [qrImage],
            applicationActivities: nil
        )
        
        // Get the root view controller to present the share sheet
        if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
           let window = windowScene.windows.first,
           let rootViewController = window.rootViewController {
            
            // Configure for iPad
            if let popover = activityViewController.popoverPresentationController {
                popover.sourceView = rootViewController.view
                popover.sourceRect = CGRect(x: rootViewController.view.bounds.midX,
                                         y: rootViewController.view.bounds.midY,
                                         width: 0, height: 0)
                popover.permittedArrowDirections = []
            }
            
            rootViewController.present(activityViewController, animated: true)
        }
    }
}

#Preview {
    CustomerQRCodeView()
        .environmentObject(CustomerViewModel())
}