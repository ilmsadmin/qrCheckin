//
//  EnhancedScannerView.swift
//  qrCheckin
//
//  Created by toan on 12/6/25.
//

import SwiftUI

struct EnhancedScannerView: View {
    @StateObject private var viewModel = ScannerViewModel()
    @StateObject private var offlineService = OfflineService.shared
    @State private var showManualInput = false
    @State private var manualCode = ""
    @State private var selectedCheckinType: CheckinType = .checkin
    @State private var showScanResult = false
    @State private var lastScannedResult: CheckinLog?
    
    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()
            
            VStack(spacing: 0) {
                // Header
                headerView
                
                // Camera/Scanner Area
                scannerAreaView
                    .frame(maxHeight: .infinity)
                
                // Quick Controls
                quickControlsView
            }
        }
        .navigationBarHidden(true)
        .onAppear {
            viewModel.scannerService.startScanning()
        }
        .onDisappear {
            viewModel.scannerService.stopScanning()
        }
        .alert(viewModel.alertTitle, isPresented: $viewModel.showAlert) {
            Button("OK") { }
        } message: {
            Text(viewModel.alertMessage)
        }
        .overlay(
            // Custom QR Error Alert
            Group {
                if viewModel.showQRErrorAlert {
                    ZStack {
                        Color.black.opacity(0.4)
                            .ignoresSafeArea()
                            .onTapGesture {
                                viewModel.dismissQRError()
                            }
                        
                        QRErrorAlertView(
                            errorType: viewModel.qrErrorType,
                            onRetry: {
                                viewModel.retryQRScan()
                            },
                            onDismiss: {
                                viewModel.dismissQRError()
                            }
                        )
                        .transition(.asymmetric(
                            insertion: .scale.combined(with: .opacity),
                            removal: .opacity
                        ))
                    }
                    .animation(.spring(response: 0.5, dampingFraction: 0.8), value: viewModel.showQRErrorAlert)
                }
            }
        )
        .sheet(isPresented: $showManualInput) {
            manualInputView
        }
        .sheet(isPresented: $showScanResult) {
            scanResultModal
        }
        .onChange(of: viewModel.lastCheckinResult) { result in
            if let result = result {
                lastScannedResult = result
                showScanResult = true
            }
        }
    }
    
    // MARK: - Header
    private var headerView: some View {
        HStack {
            HStack(spacing: 12) {
                Image(systemName: "qrcode")
                    .font(.title2)
                    .foregroundColor(.white)
                
                Text("Fitness Club Pro")
                    .font(.title3)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
            }
            
            Spacer()
        }
        .padding()
        .background(Color.blue.opacity(0.9))
    }
    
    // MARK: - Scanner Area
    private var scannerAreaView: some View {
        ZStack {
            // Background
            Color.black
            
            // Camera Preview - đặt chính xác cùng kích thước với khung QR
            CameraPreviewView(scannerService: viewModel.scannerService)
                .frame(width: UIScreen.main.bounds.width * 0.8, height: 250)
                .clipShape(RoundedRectangle(cornerRadius: 20))
            
            // Scanner overlay
            scannerOverlay
            
            // Flash button
            VStack {
                Spacer()
                
                Button(action: {
                    // Toggle flash
                }) {
                    Circle()
                        .fill(Color.white)
                        .frame(width: 56, height: 56)
                        .overlay(
                            Image(systemName: "bolt.fill")
                                .font(.title2)
                                .foregroundColor(.blue)
                        )
                        .shadow(color: Color.black.opacity(0.2), radius: 8, x: 0, y: 4)
                }
                .padding(.bottom, 24)
            }
        }
    }
    
    // MARK: - Scanner Overlay
    private var scannerOverlay: some View {
        ZStack {
            // Dimmed background with cutout
            Rectangle()
                .fill(Color.black.opacity(0.5))
                .overlay(
                    RoundedRectangle(cornerRadius: 20)
                        .frame(width: UIScreen.main.bounds.width * 0.8, height: 250)
                        .blendMode(.destinationOut)
                )
                .compositingGroup()
            
            // Scanner frame - chỉ hiển thị viền, không làm mờ camera
            RoundedRectangle(cornerRadius: 20)
                .stroke(Color.blue.opacity(0.8), lineWidth: 3)
                .frame(width: UIScreen.main.bounds.width * 0.8, height: 250)
                .overlay(
                    scannerAnimation
                )
            
            // Scanning text
            VStack {
                Spacer()
                
                Text("Scanning for QR code...")
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(.white)
                    .padding(.top, 180)
                    .shadow(color: .black, radius: 2)
                
                Spacer()
            }
        }
    }
    
    // MARK: - Scanner Animation
    private var scannerAnimation: some View {
        ZStack {
            // Corner indicators
            VStack {
                HStack {
                    scannerCorner(corners: [.topLeft, .topLeft])
                    Spacer()
                    scannerCorner(corners: [.topRight, .topRight])
                }
                Spacer()
                HStack {
                    scannerCorner(corners: [.bottomLeft, .bottomLeft])
                    Spacer()
                    scannerCorner(corners: [.bottomRight, .bottomRight])
                }
            }
            .padding(8)
            
            // Scanning line
            ScanningLine()
        }
    }
    
    private func scannerCorner(corners: UIRectCorner) -> some View {
        Rectangle()
            .stroke(Color.blue, lineWidth: 4)
            .frame(width: 20, height: 20)
            .clipped()
    }
    
    // MARK: - Quick Controls
    private var quickControlsView: some View {
        HStack(spacing: 0) {
            quickControlButton(
                title: "Manual",
                icon: "plus.circle",
                color: .blue,
                action: {
                    showManualInput = true
                }
            )
            
            quickControlButton(
                title: "Check-in",
                icon: "checkmark.circle.fill",
                color: .green,
                action: {
                    selectedCheckinType = .checkin
                    showManualInput = true
                }
            )
            
            quickControlButton(
                title: "Check-out",
                icon: "xmark.circle.fill",
                color: .red,
                action: {
                    selectedCheckinType = .checkout
                    showManualInput = true
                }
            )
            
            quickControlButton(
                title: "History",
                icon: "clock.arrow.circlepath",
                color: .purple,
                action: {
                    // TODO: Show history
                }
            )
        }
        .padding(.vertical, 12)
        .background(Color(.systemBackground))
        .overlay(
            Rectangle()
                .frame(height: 1)
                .foregroundColor(Color(.separator)),
            alignment: .top
        )
    }
    
    private func quickControlButton(title: String, icon: String, color: Color, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            VStack(spacing: 8) {
                Circle()
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
    }
    
    // MARK: - Manual Input View
    private var manualInputView: some View {
        NavigationView {
            VStack(spacing: 24) {
                Text("Enter QR Code Manually")
                    .font(.title2)
                    .fontWeight(.bold)
                    .padding(.top)
                
                TextField("Enter QR code", text: $manualCode)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .font(.body)
                
                Picker("Type", selection: $selectedCheckinType) {
                    Text("Check-in").tag(CheckinType.checkin)
                    Text("Check-out").tag(CheckinType.checkout)
                }
                .pickerStyle(SegmentedPickerStyle())
                
                Button(action: {
                    processManualCode()
                }) {
                    Text("Process \(selectedCheckinType == .checkin ? "Check-in" : "Check-out")")
                        .foregroundColor(.white)
                        .padding()
                        .frame(maxWidth: .infinity)
                        .background(selectedCheckinType == .checkin ? Color.green : Color.red)
                        .cornerRadius(12)
                }
                .disabled(manualCode.isEmpty)
                
                Spacer()
            }
            .padding()
            .navigationTitle("Manual Entry")
            .navigationBarTitleDisplayMode(.inline)
            .navigationBarItems(
                leading: Button("Cancel") {
                    showManualInput = false
                    manualCode = ""
                }
            )
        }
    }
    
    // MARK: - Scan Result Modal
    private var scanResultModal: some View {
        VStack(spacing: 0) {
            // Success header
            VStack(spacing: 16) {
                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 60))
                    .foregroundColor(.white)
                
                Text("Check-in Successful")
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
            }
            .padding(.vertical, 32)
            .frame(maxWidth: .infinity)
            .background(Color.green)
            
            // Member details
            if let result = lastScannedResult {
                VStack(spacing: 20) {
                    // Member info
                    HStack(spacing: 16) {
                        AsyncImage(url: URL(string: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80")) { image in
                            image
                                .resizable()
                                .aspectRatio(contentMode: .fill)
                        } placeholder: {
                            Circle()
                                .fill(Color.gray.opacity(0.3))
                        }
                        .frame(width: 60, height: 60)
                        .clipShape(Circle())
                        
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Sarah Johnson") // This would come from the result
                                .font(.title3)
                                .fontWeight(.medium)
                            
                            Text("Premium Membership")
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                        }
                        
                        Spacer()
                    }
                    
                    // Details grid
                    LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 2), spacing: 16) {
                        detailItem("Check-in Time", formatTime(result.timestamp))
                        detailItem("Membership Status", "Active")
                        detailItem("Expiration", "July 15, 2025")
                        detailItem("Visits This Month", "12 visits")
                    }
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(12)
                    
                    // Action buttons
                    HStack(spacing: 12) {
                        Button("Done") {
                            showScanResult = false
                            lastScannedResult = nil
                        }
                        .foregroundColor(.white)
                        .padding()
                        .frame(maxWidth: .infinity)
                        .background(Color.green)
                        .cornerRadius(12)
                        
                        Button(action: {}) {
                            Image(systemName: "ellipsis")
                                .font(.title3)
                        }
                        .foregroundColor(.primary)
                        .padding()
                        .background(Color(.systemGray5))
                        .cornerRadius(12)
                    }
                }
                .padding()
            }
            
            Spacer()
        }
        .background(Color(.systemBackground))
        .cornerRadius(20)
        .shadow(color: Color.black.opacity(0.3), radius: 20, x: 0, y: 10)
        .padding()
    }
    
    private func detailItem(_ title: String, _ value: String) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
            
            if title == "Membership Status" {
                HStack(spacing: 4) {
                    Circle()
                        .fill(Color.green)
                        .frame(width: 8, height: 8)
                    Text(value)
                        .font(.caption)
                        .fontWeight(.medium)
                }
            } else {
                Text(value)
                    .font(.caption)
                    .fontWeight(.medium)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
    
    // MARK: - Helper Methods
    private func processManualCode() {
        guard !manualCode.isEmpty else { return }
        
        if selectedCheckinType == .checkin {
            viewModel.processCheckin(qrCode: manualCode)
        } else {
            viewModel.processCheckout(qrCode: manualCode)
        }
        
        showManualInput = false
        manualCode = ""
    }
    
    private func formatTime(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.timeStyle = .short
        formatter.dateStyle = .none
        
        let calendar = Calendar.current
        if calendar.isDateInToday(date) {
            return "\(formatter.string(from: date)), Today"
        } else {
            let dateFormatter = DateFormatter()
            dateFormatter.dateStyle = .medium
            dateFormatter.timeStyle = .none
            return "\(formatter.string(from: date)), \(dateFormatter.string(from: date))"
        }
    }
}

// MARK: - Scanning Line Animation
struct ScanningLine: View {
    @State private var yPosition: CGFloat = -125
    
    var body: some View {
        Rectangle()
            .fill(
                LinearGradient(
                    gradient: Gradient(colors: [.clear, .blue, .clear]),
                    startPoint: .leading,
                    endPoint: .trailing
                )
            )
            .frame(height: 2)
            .offset(y: yPosition)
            .animation(
                Animation.linear(duration: 2.0)
                    .repeatForever(autoreverses: false),
                value: yPosition
            )
            .onAppear {
                yPosition = 125
            }
    }
}

#Preview {
    EnhancedScannerView()
}