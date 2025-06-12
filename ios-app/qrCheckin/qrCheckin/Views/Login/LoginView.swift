//
//  LoginView.swift
//  qrCheckin
//
//  Created by toan on 12/6/25.
//

import SwiftUI

struct LoginView: View {
    @StateObject private var viewModel = LoginViewModel()
    @State private var email = ""
    @State private var password = ""
    
    var body: some View {
        NavigationView {
            VStack(spacing: 30) {
                Spacer()
                
                // Logo and Title
                VStack(spacing: 16) {
                    Image(systemName: "qrcode")
                        .font(.system(size: 60))
                        .foregroundColor(.blue)
                    
                    Text("QR Check-in")
                        .font(.largeTitle)
                        .fontWeight(.bold)
                    
                    Text("Staff Application")
                        .font(.subheadline)
                        .foregroundColor(.gray)
                }
                
                // Login Form
                VStack(spacing: 20) {
                    TextField("Email", text: $email)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                        .keyboardType(.emailAddress)
                        .autocapitalization(.none)
                        .disableAutocorrection(true)
                    
                    SecureField("Password", text: $password)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                    
                    Button(action: {
                        viewModel.login(email: email, password: password)
                    }) {
                        HStack {
                            if viewModel.isLoading {
                                ProgressView()
                                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                    .scaleEffect(0.8)
                            }
                            Text("Sign In")
                        }
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.blue)
                        .cornerRadius(Constants.UI.cornerRadius)
                    }
                    .disabled(email.isEmpty || password.isEmpty || viewModel.isLoading)
                }
                
                Spacer()
                
                // Footer
                Text("For staff use only")
                    .font(.caption)
                    .foregroundColor(.gray)
            }
            .padding(.horizontal, 30)
            .navigationBarHidden(true)
            .alert("Error", isPresented: $viewModel.showAlert) {
                Button("OK") { }
            } message: {
                Text(viewModel.alertMessage)
            }
        }
    }
}

#Preview {
    LoginView()
}