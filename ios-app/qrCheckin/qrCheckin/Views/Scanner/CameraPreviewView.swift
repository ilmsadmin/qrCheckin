//
//  CameraPreviewView.swift
//  qrCheckin
//
//  Created by toan on 12/6/25.
//

import SwiftUI
import AVFoundation

struct CameraPreviewView: UIViewRepresentable {
    let scannerService: QRScannerService
    
    func makeUIView(context: Context) -> UIView {
        // Tạo container view
        let view = UIView()
        view.backgroundColor = .black
        
        // Chỉ tạo view, việc setup preview layer sẽ được thực hiện trong updateUIView
        // khi view đã có kích thước chính xác
        
        return view
    }
    
    func updateUIView(_ uiView: UIView, context: Context) {
        // Debug log để kiểm tra kích thước
        print("updateUIView called - bounds: \(uiView.bounds), frame: \(uiView.frame)")
        
        // Force layout nếu cần
        if uiView.bounds.width == 0 || uiView.bounds.height == 0 {
            uiView.setNeedsLayout()
            uiView.layoutIfNeeded()
            print("After layout - bounds: \(uiView.bounds), frame: \(uiView.frame)")
        }
        
        // Chỉ setup preview layer khi view đã có kích thước
        guard uiView.bounds.width > 0 && uiView.bounds.height > 0 else {
            print("View vẫn chưa có kích thước sau layout, skip setup preview layer")
            // Thử setup lại sau một chút
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                self.updateUIView(uiView, context: context)
            }
            return
        }
        
        if let previewLayer = scannerService.getPreviewLayer() {
            // Đặt frame để previewLayer fill toàn bộ view
            previewLayer.frame = uiView.bounds
            previewLayer.videoGravity = .resizeAspectFill
            previewLayer.cornerRadius = 12 // Bo góc cho đẹp
            previewLayer.masksToBounds = true
            
            // Kiểm tra và cập nhật orientation
            if let connection = previewLayer.connection {
                if connection.isVideoOrientationSupported {
                    // Đặt orientation dựa trên device orientation hiện tại
                    let deviceOrientation = UIDevice.current.orientation
                    var videoOrientation: AVCaptureVideoOrientation = .portrait
                    
                    switch deviceOrientation {
                    case .portrait:
                        videoOrientation = .portrait
                    case .landscapeLeft:
                        videoOrientation = .landscapeRight
                    case .landscapeRight:
                        videoOrientation = .landscapeLeft
                    case .portraitUpsideDown:
                        videoOrientation = .portraitUpsideDown
                    default:
                        videoOrientation = .portrait // Default to portrait
                    }
                    
                    connection.videoOrientation = videoOrientation
                    print("Set video orientation to: \(videoOrientation.rawValue)")
                }
            }
            
            // Thêm preview layer nếu chưa có
            if previewLayer.superlayer == nil {
                uiView.layer.addSublayer(previewLayer)
                print("Preview layer added to view: \(previewLayer.frame)")
                print("Container view bounds: \(uiView.bounds)")
            } else {
                // Chỉ update frame nếu đã có
                print("Preview layer frame updated: \(previewLayer.frame)")
            }
        } else {
            print("Failed to get preview layer from scanner service")
            
            // Hiển thị placeholder khi không có camera
            if uiView.subviews.isEmpty {
                let label = UILabel(frame: uiView.bounds)
                label.text = "Không thể truy cập camera"
                label.textAlignment = .center
                label.textColor = .white
                label.autoresizingMask = [.flexibleWidth, .flexibleHeight]
                uiView.addSubview(label)
            }
        }
    }
}
