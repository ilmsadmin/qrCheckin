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
                } else {
                    // Permission granted, setup capture session
                    self?.setupCaptureSession()
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
        
        if captureSession == nil {
            setupCaptureSession()
        }
        
        // Move camera session start to background thread to avoid UI blocking
        DispatchQueue.global(qos: .background).async { [weak self] in
            self?.captureSession?.startRunning()
            DispatchQueue.main.async {
                self?.isScanning = true
            }
        }
    }
    
    func stopScanning() {
        // Move camera session stop to background thread
        DispatchQueue.global(qos: .background).async { [weak self] in
            guard let self = self else { return }
            
            // Clean up delegate references before stopping
            if let session = self.captureSession {
                for output in session.outputs {
                    if let metadataOutput = output as? AVCaptureMetadataOutput {
                        metadataOutput.setMetadataObjectsDelegate(nil, queue: nil)
                    }
                }
                session.stopRunning()
            }
            
            DispatchQueue.main.async {
                self.isScanning = false
            }
        }
    }
    
    private func setupCaptureSession() {
        guard captureSession == nil else { return }
        
        guard let device = AVCaptureDevice.default(for: .video) else {
            error = AppError.scannerError("Failed to access camera")
            return
        }
        
        // Tạo mới AVCaptureSession
        let session = AVCaptureSession()
        self.captureSession = session
        
        // Kiểm tra và thiết lập chất lượng nếu có thể
        if session.canSetSessionPreset(.high) {
            session.sessionPreset = .high
        }
        
        do {
            // Thiết lập input từ thiết bị camera
            let input = try AVCaptureDeviceInput(device: device)
            if session.canAddInput(input) {
                session.addInput(input)
            } else {
                throw NSError(domain: "QRScanner", code: 1, userInfo: [NSLocalizedDescriptionKey: "Không thể thêm camera input vào session"])
            }
            
            // Thiết lập output cho QR scanning
            let metadataOutput = AVCaptureMetadataOutput()
            if session.canAddOutput(metadataOutput) {
                session.addOutput(metadataOutput)
                
                // Thiết lập delegate và queue
                metadataOutput.setMetadataObjectsDelegate(self, queue: DispatchQueue.main)
                
                // Thiết lập loại metadata cần quét (QR code)
                if metadataOutput.availableMetadataObjectTypes.contains(.qr) {
                    metadataOutput.metadataObjectTypes = [.qr]
                } else {
                    throw NSError(domain: "QRScanner", code: 2, userInfo: [NSLocalizedDescriptionKey: "Thiết bị không hỗ trợ quét mã QR"])
                }
            } else {
                throw NSError(domain: "QRScanner", code: 3, userInfo: [NSLocalizedDescriptionKey: "Không thể thêm metadata output vào session"])
            }
            
            // Khởi tạo preview layer và thiết lập thuộc tính
            let previewLayer = AVCaptureVideoPreviewLayer(session: session)
            previewLayer.videoGravity = .resizeAspectFill
            previewLayer.connection?.videoOrientation = .portrait
            self.previewLayer = previewLayer
            
            // Không gọi startRunning() tại đây
            // Thay vào đó, chúng ta sẽ gọi nó trong startScanning()
            
            // Đánh dấu là đã cấu hình thành công
            DispatchQueue.main.async {
                self.isScanning = true
            }
            
        } catch {
            self.captureSession = nil
            self.previewLayer = nil
            self.error = AppError.scannerError("Lỗi thiết lập camera: \(error.localizedDescription)")
            print("Camera setup error: \(error.localizedDescription)")
        }
    }
    
    func getPreviewLayer() -> AVCaptureVideoPreviewLayer? {
        // Nếu previewLayer đã tồn tại, trả về nó
        if let existingLayer = previewLayer {
            return existingLayer
        }
        
        // Nếu previewLayer chưa tồn tại nhưng captureSession có, tạo mới và trả về
        if let session = captureSession {
            print("Creating new preview layer from existing session")
            let newLayer = AVCaptureVideoPreviewLayer(session: session)
            newLayer.videoGravity = .resizeAspectFill
            
            // Cập nhật orientation tùy theo phiên bản iOS
            if let connection = newLayer.connection {
                if #available(iOS 17.0, *) {
                    if connection.isVideoRotationAngleSupported(0) {
                        connection.videoRotationAngle = 0
                      }
                } else {
                    if connection.isVideoOrientationSupported {
                        connection.videoOrientation = .portrait
                    }
                }
            }
            
            self.previewLayer = newLayer
            return newLayer
        }
        
        // Nếu chưa có session, gọi setupCaptureSession để tạo
        if cameraPermissionGranted {
            print("No session exists, setting up camera capture session")
            setupCaptureSession()
            
            // Sau khi setup, kiểm tra lại previewLayer
            if let layer = previewLayer {
                return layer
            }
        }
        
        print("Failed to create preview layer: No capture session available")
        return nil
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
                // Restart camera session on background thread
                DispatchQueue.global(qos: .background).async {
                    self?.captureSession?.startRunning()
                }
            }
        }
    }
    
    // MARK: - Cleanup
    deinit {
        // Properly clean up the delegate reference to prevent weak reference warnings
        if let session = captureSession {
            for output in session.outputs {
                if let metadataOutput = output as? AVCaptureMetadataOutput {
                    metadataOutput.setMetadataObjectsDelegate(nil, queue: nil)
                }
            }
        }
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
        DispatchQueue.global(qos: .background).async { [weak self] in
            self?.captureSession?.stopRunning()
        }
        
        processScannedCode(code)
    }
}
