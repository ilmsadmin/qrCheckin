//
//  LoginViewModel.swift
//  qrCheckin
//
//  Created by toan on 12/6/25.
//

import Foundation
import Combine

// Note: AppError and Constants are defined in Constants.swift

@MainActor
class LoginViewModel: ObservableObject {
    @Published var isLoading = false
    @Published var showAlert = false
    @Published var alertMessage = ""
    @Published var isLoggedIn = false
    @Published var currentUser: User?
    
    private let graphQLService = GraphQLService.shared
    private var cancellables = Set<AnyCancellable>()
    
    init() {
        checkExistingAuth()
    }
    
    func login(email: String, password: String) {
        // Trim whitespace from email and password
        let trimmedEmail = email.trimmingCharacters(in: .whitespacesAndNewlines)
        let trimmedPassword = password.trimmingCharacters(in: .whitespacesAndNewlines)
        
        guard !trimmedEmail.isEmpty && !trimmedPassword.isEmpty else {
            showError("Please enter both email and password")
            return
        }
        
        // Validate email format
        guard trimmedEmail.contains("@") && trimmedEmail.contains(".") else {
            showError("Please enter a valid email address")
            return
        }
        
        isLoading = true
        
        graphQLService.login(email: trimmedEmail, password: trimmedPassword)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] (completion: Subscribers.Completion<AppError>) in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.handleAuthenticationError(error)
                    }
                },
                receiveValue: { [weak self] (user: User) in
                    
                    self?.currentUser = user
                    self?.isLoggedIn = true
                    self?.saveUserData(user)
                }
            )
            .store(in: &cancellables)
    }
    
    func logout() {
        isLoading = true
        
        graphQLService.logout()
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] (completion: Subscribers.Completion<AppError>) in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        // Logout locally even if server request fails
                    }
                    self?.performLocalLogout()
                },
                receiveValue: { [weak self] (_: Bool) in
                    self?.performLocalLogout()
                }
            )
            .store(in: &cancellables)
    }
    
    private func performLocalLogout() {
        currentUser = nil
        isLoggedIn = false
        clearUserData()
    }
    
    private func checkExistingAuth() {
        // Check if user has existing valid token
        if let token = KeychainHelper.shared.load(forKey: Constants.Auth.tokenKey),
           !token.isEmpty {
            // First load cached user data for faster startup
            loadUserData()
            
            // Then validate token with server
            graphQLService.getCurrentUser()
                .receive(on: DispatchQueue.main)
                .sink(
                    receiveCompletion: { [weak self] completion in
                        if case .failure(let error) = completion {
                            // Token is invalid, clear it and cached data
                            self?.clearUserData()
                            self?.currentUser = nil
                            self?.isLoggedIn = false
                        }
                    },
                    receiveValue: { [weak self] user in
                        // Token is valid, update user session with fresh data
                        self?.currentUser = user
                        self?.isLoggedIn = true
                        self?.saveUserData(user)
                    }
                )
                .store(in: &cancellables)
        }
    }
    
    private func saveUserData(_ user: User) {
        // Save user data to UserDefaults for quick access
        if let encoded = try? JSONEncoder().encode(user) {
            UserDefaults.standard.set(encoded, forKey: Constants.Auth.userKey)
        }
    }
    
    private func loadUserData() {
        if let userData = UserDefaults.standard.data(forKey: Constants.Auth.userKey),
           let user = try? JSONDecoder().decode(User.self, from: userData) {
            currentUser = user
            isLoggedIn = true
        }
    }
    
    private func clearUserData() {
        UserDefaults.standard.removeObject(forKey: Constants.Auth.userKey)
        KeychainHelper.shared.delete(forKey: Constants.Auth.tokenKey)
    }
    
    private func showError(_ message: String) {
        alertMessage = message
        showAlert = true
    }
    
    private func handleAuthenticationError(_ error: AppError) {
        switch error {
        case .networkError(let message):
            if message.contains("Invalid credentials") || message.contains("Unauthorized") {
                showError("Invalid email or password. Please try again.")
            } else if message.contains("not found") {
                showError("Network connection error. Please check your internet connection.")
            } else {
                showError("Login failed: \(message)")
            }
        case .authenticationError(let message):
            showError("Authentication failed: \(message)")
        default:
            showError("Login failed. Please try again.")
        }
    }
}
