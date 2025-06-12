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
                TabView {
                    ScannerView()
                        .tabItem {
                            Label("Scanner", systemImage: "qrcode.viewfinder")
                        }
                    
                    DashboardView()
                        .tabItem {
                            Label("Dashboard", systemImage: "chart.bar")
                        }
                    
                    SettingsView()
                        .tabItem {
                            Label("Settings", systemImage: "gearshape")
                        }
                }
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