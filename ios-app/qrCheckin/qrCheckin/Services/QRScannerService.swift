//
//  QRScannerService.swift
//  qrCheckin
//
//  Created by toan on 12/6/25.
//

import Foundation
import AVFoundation
import Combine
import UIKit

class QRScannerService: NSObject, ObservableObject {
    @Published var scannedCode: String = ""
    @Published var isScanning: Bool = false
    @Published var error: AppError?
    @Published var cameraPermissionGranted: Bool = false
    
    private var captureSession: AVCaptureSession?
    private var previewLayer: AVCaptureVideoPreviewLayer?
    private var lastScannedCode: String?
    private var lastScanTime: Date = Date()
    
    override init() {
        super.init()
        checkCameraPermission()
    }
    
    // MARK: - Camera Permission
    func checkCameraPermission() {
        let status = AVCaptureDevice.authorizationStatus(for: .video)
        
        switch status {
        case .authorized:
            cameraPermissionGranted = true
        case .notDetermined:
            requestCameraPermission()
        case .denied, .restricted:
            cameraPermissionGranted = false
            error = AppError.scannerError("Camera access denied. Please enable camera access in Settings.")
        @unknown default:
            cameraPermissionGranted = false
            error = AppError.scannerError("Unknown camera permission status")
        }
    }
    
    private func requestCameraPermission() {
        AVCaptureDevice.requestAccess(for: .video) { [weak self] granted in
            DispatchQueue.main.async {
                self?.cameraPermissionGranted = granted
                if !granted {
                    self?.error = AppError.scannerError("Camera access is required for QR scanning")
                }
            }
        }
    }
    
    // MARK: - Scanner Setup
    func startScanning() {
        guard cameraPermissionGranted else {
            checkCameraPermission()
            return
        }
        
        setupCaptureSession()
        isScanning = true
    }
    
    func stopScanning() {
        captureSession?.stopRunning()
        isScanning = false
    }
    
    private func setupCaptureSession() {
        guard let device = AVCaptureDevice.default(for: .video) else {
            error = AppError.scannerError("Failed to access camera")
            return
        }
        
        do {
            let input = try AVCaptureDeviceInput(device: device)
            let output = AVCaptureMetadataOutput()
            
            captureSession = AVCaptureSession()
            captureSession?.addInput(input)
            captureSession?.addOutput(output)
            
            output.setMetadataObjectsDelegate(self, queue: DispatchQueue.main)
            output.metadataObjectTypes = [.qr]
            
            DispatchQueue.global(qos: .background).async { [weak self] in
                self?.captureSession?.startRunning()
            }
            
        } catch {
            self.error = AppError.scannerError("Failed to setup camera: \(error.localizedDescription)")
        }
    }
    
    func getPreviewLayer() -> AVCaptureVideoPreviewLayer? {
        guard let captureSession = captureSession else { return nil }
        
        if previewLayer == nil {
            previewLayer = AVCaptureVideoPreviewLayer(session: captureSession)
            previewLayer?.videoGravity = .resizeAspectFill
        }
        
        return previewLayer
    }
    
    // MARK: - Manual Code Input (for testing/fallback)
    func processManualCode(_ code: String) {
        processScannedCode(code)
    }
    
    private func processScannedCode(_ code: String) {
        // Prevent duplicate scans too quickly
        let now = Date()
        if code == lastScannedCode && now.timeIntervalSince(lastScanTime) < Constants.Scanner.scanDelay {
            return
        }
        
        lastScannedCode = code
        lastScanTime = now
        
        // Provide haptic feedback
        if Constants.Scanner.vibrationEnabled {
            let impactFeedback = UIImpactFeedbackGenerator(style: .medium)
            impactFeedback.impactOccurred()
        }
        
        // Update scanned code
        scannedCode = code
        
        // Temporarily stop scanning to process result
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) { [weak self] in
            if self?.isScanning == true {
                self?.captureSession?.startRunning()
            }
        }
    }
    
    // MARK: - Cleanup
    deinit {
        stopScanning()
    }
}

// MARK: - AVCaptureMetadataOutputObjectsDelegate
extension QRScannerService: AVCaptureMetadataOutputObjectsDelegate {
    func metadataOutput(_ output: AVCaptureMetadataOutput, didOutput metadataObjects: [AVMetadataObject], from connection: AVCaptureConnection) {
        
        guard let metadataObject = metadataObjects.first,
              let readableObject = metadataObject as? AVMetadataMachineReadableCodeObject,
              let code = readableObject.stringValue else {
            return
        }
        
        // Temporarily stop running to prevent multiple rapid scans
        captureSession?.stopRunning()
        
        processScannedCode(code)
    }
}