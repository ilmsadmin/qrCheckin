//
//  ScannerOverlayView.swift
//  qrCheckin
//
//  Created by toan on 12/6/25.
//

import SwiftUI

struct ScannerOverlayView: View {
    @State private var isAnimating = false
    
    var body: some View {
        ZStack {
            // Scanning corners
            VStack {
                HStack {
                    CornerView(corner: .topLeft)
                    Spacer()
                    CornerView(corner: .topRight)
                }
                Spacer()
                HStack {
                    CornerView(corner: .bottomLeft)
                    Spacer()
                    CornerView(corner: .bottomRight)
                }
            }
            
            // Center content when no camera access
            VStack {
                Image(systemName: "qrcode")
                    .font(.system(size: 40))
                    .foregroundColor(.blue)
                    .opacity(0.7)
                
                Text("Position QR code here")
                    .font(.caption)
                    .foregroundColor(.white)
                    .opacity(0.8)
            }
            .scaleEffect(isAnimating ? 1.1 : 1.0)
            .animation(Animation.easeInOut(duration: 1.5).repeatForever(autoreverses: true), value: isAnimating)
            
            // Scanning line animation
            ScanningLineView()
        }
        .onAppear {
            isAnimating = true
        }
    }
}

struct CornerView: View {
    let corner: Corner
    
    enum Corner {
        case topLeft, topRight, bottomLeft, bottomRight
    }
    
    var body: some View {
        Rectangle()
            .stroke(Color.blue, lineWidth: 3)
            .frame(width: 20, height: 20)
            .clipped()
            .mask(
                Rectangle()
                    .frame(width: cornerMaskWidth, height: cornerMaskHeight)
                    .offset(x: cornerOffsetX, y: cornerOffsetY)
            )
    }
    
    private var cornerMaskWidth: CGFloat {
        switch corner {
        case .topLeft, .bottomLeft: return 12
        case .topRight, .bottomRight: return 12
        }
    }
    
    private var cornerMaskHeight: CGFloat {
        switch corner {
        case .topLeft, .topRight: return 12
        case .bottomLeft, .bottomRight: return 12
        }
    }
    
    private var cornerOffsetX: CGFloat {
        switch corner {
        case .topLeft, .bottomLeft: return -4
        case .topRight, .bottomRight: return 4
        }
    }
    
    private var cornerOffsetY: CGFloat {
        switch corner {
        case .topLeft, .topRight: return -4
        case .bottomLeft, .bottomRight: return 4
        }
    }
}

struct ScanningLineView: View {
    @State private var yPosition: CGFloat = 0
    
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
                    .repeatForever(autoreverses: true),
                value: yPosition
            )
            .onAppear {
                yPosition = Constants.UI.scannerFrameSize / 2 - 50
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                    yPosition = -Constants.UI.scannerFrameSize / 2 + 50
                }
            }
    }
}

#Preview {
    ScannerOverlayView()
        .frame(width: 250, height: 250)
        .background(Color.black)
}