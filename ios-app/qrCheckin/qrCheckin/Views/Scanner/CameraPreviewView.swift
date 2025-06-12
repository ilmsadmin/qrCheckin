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
        let view = UIView(frame: CGRect(x: 0, y: 0, width: Constants.UI.scannerFrameSize, height: Constants.UI.scannerFrameSize))
        
        if let previewLayer = scannerService.getPreviewLayer() {
            previewLayer.frame = view.bounds
            previewLayer.cornerRadius = Constants.UI.cornerRadius
            view.layer.addSublayer(previewLayer)
        }
        
        return view
    }
    
    func updateUIView(_ uiView: UIView, context: Context) {
        // Update preview layer frame if needed
        if let previewLayer = scannerService.getPreviewLayer() {
            previewLayer.frame = uiView.bounds
        }
    }
}