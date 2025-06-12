//
//  RootView.swift
//  qrCheckin
//
//  Created by toan on 12/6/25.
//

import SwiftUI

struct RootView: View {
    @StateObject private var loginViewModel = LoginViewModel()
    
    var body: some View {
        Group {
            if loginViewModel.isLoggedIn {
                ScannerView()
                    .environmentObject(loginViewModel)
            } else {
                LoginView()
                    .environmentObject(loginViewModel)
            }
        }
        .animation(.easeInOut, value: loginViewModel.isLoggedIn)
    }
}

#Preview {
    RootView()
}