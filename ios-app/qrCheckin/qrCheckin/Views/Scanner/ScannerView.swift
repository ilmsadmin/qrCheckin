//
//  ScannerView.swift
//  qrCheckin
//
//  Created by toan on 12/6/25.
//

import SwiftUI

struct ScannerView: View {
    @StateObject private var viewModel = ScannerViewModel()
    @StateObject private var offlineService = OfflineService.shared
    @State private var showManualInput = false
    @State private var manualCode = ""
    @State private var selectedCheckinType: CheckinType = .checkin
    
    var body: some View {
        NavigationView {
            ZStack {
                Color(.systemBackground)
                
                ScrollView {
                    VStack(spacing: 20) {
                        // Header
                        //headerView
                        
                        // Offline Status Banner
                        if !offlineService.isOnline {
                            offlineStatusBanner
                        }
                        
                        // Scanner Frame
                        scannerFrameView
                        
                        // Instructions
                        instructionsView
                        
                        // Event Selection
                        eventSelectionView
                        
                        // Action Buttons
                        actionButtonsView
                        
                        // Recent Check-ins
                        recentCheckinsView
                    }
                    .padding()
                }
                .safeAreaInset(edge: .top) {
                    // Tạo khoảng trống chính xác cho status bar + 10pt
                    Spacer()
                        .frame(height: 10)
                        .background(Color(.systemBackground))
                }
                
                // Loading Overlay
                if viewModel.isLoading || viewModel.processingCheckin {
                    loadingOverlay
                }
            }
            .navigationBarTitleDisplayMode(.inline)
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
            .sheet(isPresented: $showManualInput) {
                manualInputView
            }
        }
    }
    
    /*
    // MARK: - Header
    private var headerView: some View {
        HStack {
            Image(systemName: "barcode.viewfinder")
                .font(.largeTitle)
                .foregroundColor(.primary)
            
            Text("QR Check-in")
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(.primary)
            
            Spacer()
        }
    }
    */
    // MARK: - Offline Status Banner
    private var offlineStatusBanner: some View {
        HStack {
            Image(systemName: "wifi.slash")
                .foregroundColor(.orange)
            
            VStack(alignment: .leading, spacing: 2) {
                Text("Offline Mode")
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .foregroundColor(.orange)
                
                if offlineService.getQueuedItemsCount() > 0 {
                    Text("\(offlineService.getQueuedItemsCount()) items queued for sync")
                        .font(.caption)
                        .foregroundColor(.gray)
                }
            }
            
            Spacer()
        }
        .padding()
        .background(Color.orange.opacity(0.1))
        .cornerRadius(Constants.UI.cornerRadius)
        .overlay(
            RoundedRectangle(cornerRadius: Constants.UI.cornerRadius)
                .stroke(Color.orange.opacity(0.3), lineWidth: 1)
        )
    }
    
    // MARK: - Scanner Frame
    private var scannerFrameView: some View {
        ZStack {
            // Khung bao bên ngoài
            RoundedRectangle(cornerRadius: Constants.UI.cornerRadius)
                .fill(Color.black)
                .frame(width: Constants.UI.scannerFrameSize, height: Constants.UI.scannerFrameSize)
            
            // Camera Preview với padding 5pt
            CameraPreviewView(scannerService: viewModel.scannerService)
                .frame(width: Constants.UI.scannerFrameSize - 10, height: Constants.UI.scannerFrameSize - 10)
                .clipShape(RoundedRectangle(cornerRadius: Constants.UI.cornerRadius - 5))
            
            // Scanner Overlay với padding 5pt
            ScannerOverlayView()
                .frame(width: Constants.UI.scannerFrameSize - 10, height: Constants.UI.scannerFrameSize - 10)
        }
    }
    
    // MARK: - Instructions
    private var instructionsView: some View {
        VStack(spacing: 8) {
            Text("Scan Member QR Code")
                .font(.title3)
                .fontWeight(.semibold)
                .foregroundColor(.primary)
            
            Text("Align the QR code within the frame to check-in/check-out")
                .font(.caption)
                .foregroundColor(.gray)
                .multilineTextAlignment(.center)
        }
    }
    
    // MARK: - Event Selection
    private var eventSelectionView: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Current Event")
                .font(.caption)
                .foregroundColor(.gray)
            
            Menu {
                ForEach(viewModel.events) { event in
                    Button(action: {
                        viewModel.selectEvent(event)
                    }) {
                        HStack {
                            Text(event.name)
                            if event.id == viewModel.selectedEvent?.id {
                                Image(systemName: "checkmark")
                            }
                        }
                    }
                }
            } label: {
                HStack {
                    Text(viewModel.selectedEvent?.name ?? "Select Event")
                        .foregroundColor(.primary)
                    Spacer()
                    Image(systemName: "chevron.down")
                        .foregroundColor(.gray)
                }
                .padding()
                .background(Color.gray.opacity(0.2))
                .cornerRadius(Constants.UI.cornerRadius)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
    
    // MARK: - Action Buttons
    private var actionButtonsView: some View {
        HStack(spacing: 16) {
            Button(action: {
                selectedCheckinType = .checkin
                showManualInput = true
            }) {
                HStack {
                    Image(systemName: "person.badge.plus")
                    Text("Check In")
                }
                .foregroundColor(.white)
                .padding()
                .background(Color.green)
                .cornerRadius(Constants.UI.cornerRadius)
            }
            
            Button(action: {
                selectedCheckinType = .checkout
                showManualInput = true
            }) {
                HStack {
                    Image(systemName: "person.badge.minus")
                    Text("Check Out")
                }
                .foregroundColor(.white)
                .padding()
                .background(Color.red)
                .cornerRadius(Constants.UI.cornerRadius)
            }
        }
    }
    
    // MARK: - Recent Check-ins
    private var recentCheckinsView: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Recent Activity")
                .font(.headline)
                .foregroundColor(.primary)
            
            if viewModel.recentCheckins.isEmpty {
                Text("No recent activity")
                    .font(.caption)
                    .foregroundColor(.gray)
                    .frame(maxWidth: .infinity, alignment: .center)
                    .padding()
            } else {
                LazyVStack(spacing: 8) {
                    ForEach(viewModel.recentCheckins) { checkin in
                        RecentCheckinRowView(checkin: checkin)
                    }
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
    
    // MARK: - Loading Overlay
    private var loadingOverlay: some View {
        ZStack {
            Color.black.opacity(0.5)
                .ignoresSafeArea()
            
            VStack {
                ProgressView()
                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
                    .scaleEffect(1.5)
                
                Text(viewModel.processingCheckin ? "Processing..." : "Loading...")
                    .foregroundColor(.white)
                    .padding(.top)
            }
        }
    }
    
    // MARK: - Manual Input View
    private var manualInputView: some View {
        NavigationView {
            VStack(spacing: 20) {
                Text("Manual \(selectedCheckinType == .checkin ? "Check-in" : "Check-out")")
                    .font(.title2)
                    .fontWeight(.semibold)
                
                TextField("Enter QR Code", text: $manualCode)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .autocapitalization(.none)
                    .disableAutocorrection(true)
                
                Button(action: {
                    viewModel.performManualCheckin(code: manualCode, type: selectedCheckinType)
                    manualCode = ""
                    showManualInput = false
                }) {
                    Text("Process \(selectedCheckinType == .checkin ? "Check-in" : "Check-out")")
                        .foregroundColor(.white)
                        .padding()
                        .frame(maxWidth: .infinity)
                        .background(selectedCheckinType == .checkin ? Color.green : Color.red)
                        .cornerRadius(Constants.UI.cornerRadius)
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
                }
            )
        }
    }
}
