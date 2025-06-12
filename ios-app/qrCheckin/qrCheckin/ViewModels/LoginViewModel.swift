//
//  LoginViewModel.swift
//  qrCheckin
//
//  Created by toan on 12/6/25.
//

import Foundation
import Combine

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
        guard !email.isEmpty && !password.isEmpty else {
            showError("Please enter both email and password")
            return
        }
        
        isLoading = true
        
        graphQLService.login(email: email, password: password)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.showError(error.localizedDescription)
                    }
                },
                receiveValue: { [weak self] user in
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
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        print("Logout error: \(error.localizedDescription)")
                    }
                    // Logout locally even if server request fails
                    self?.performLocalLogout()
                },
                receiveValue: { [weak self] _ in
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
            // TODO: Validate token with server
            // For now, assume token is valid if it exists
            loadUserData()
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
}