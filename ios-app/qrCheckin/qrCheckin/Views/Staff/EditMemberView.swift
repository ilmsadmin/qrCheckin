//
//  EditMemberView.swift
//  qrCheckin
//
//  Created by toan on 12/6/25.
//

import SwiftUI

struct EditMemberView: View {
    let member: Member
    @Environment(\.dismiss) private var dismiss
    @StateObject private var viewModel = MembersViewModel()
    
    // Form fields
    @State private var firstName: String
    @State private var lastName: String
    @State private var email: String
    @State private var phone: String
    @State private var dateOfBirth: Date
    @State private var gender: String
    @State private var address: String
    @State private var city: String
    @State private var state: String
    @State private var country: String
    @State private var postalCode: String
    
    // UI State
    @State private var isLoading = false
    @State private var showAlert = false
    @State private var alertMessage = ""
    @State private var showDatePicker = false
    @State private var selectedGender = 0
    
    private let genderOptions = ["Male", "Female", "Other", "Prefer not to say"]
    
    init(member: Member) {
        self.member = member
        _firstName = State(initialValue: member.firstName)
        _lastName = State(initialValue: member.lastName)
        _email = State(initialValue: member.email)
        _phone = State(initialValue: member.phone ?? "")
        _dateOfBirth = State(initialValue: member.dateOfBirth ?? Date())
        _gender = State(initialValue: member.gender ?? "")
        _address = State(initialValue: member.address ?? "")
        _city = State(initialValue: member.city ?? "")
        _state = State(initialValue: member.state ?? "")
        _country = State(initialValue: member.country ?? "")
        _postalCode = State(initialValue: member.postalCode ?? "")
    }
    
    var body: some View {
        NavigationView {
            Form {
                // Personal Information Section
                Section("Personal Information") {
                    HStack {
                        Image(systemName: "person.fill")
                            .foregroundColor(.blue)
                            .frame(width: 20)
                        TextField("First Name", text: $firstName)
                    }
                    
                    HStack {
                        Image(systemName: "person.fill")
                            .foregroundColor(.blue)
                            .frame(width: 20)
                        TextField("Last Name", text: $lastName)
                    }
                    
                    HStack {
                        Image(systemName: "envelope.fill")
                            .foregroundColor(.blue)
                            .frame(width: 20)
                        TextField("Email", text: $email)
                            .keyboardType(.emailAddress)
                            .autocapitalization(.none)
                    }
                    
                    HStack {
                        Image(systemName: "phone.fill")
                            .foregroundColor(.blue)
                            .frame(width: 20)
                        TextField("Phone Number", text: $phone)
                            .keyboardType(.phonePad)
                    }
                    
                    // Date of Birth
                    HStack {
                        Image(systemName: "gift.fill")
                            .foregroundColor(.blue)
                            .frame(width: 20)
                        
                        Button(action: {
                            showDatePicker = true
                        }) {
                            HStack {
                                Text("Date of Birth")
                                    .foregroundColor(.primary)
                                Spacer()
                                Text(formatDate(dateOfBirth))
                                    .foregroundColor(.secondary)
                            }
                        }
                    }
                    
                    // Gender Selection
                    HStack {
                        Image(systemName: "person.2.fill")
                            .foregroundColor(.blue)
                            .frame(width: 20)
                        
                        Picker("Gender", selection: $selectedGender) {
                            ForEach(0..<genderOptions.count, id: \.self) { index in
                                Text(genderOptions[index]).tag(index)
                            }
                        }
                        .pickerStyle(MenuPickerStyle())
                        .onAppear {
                            if let index = genderOptions.firstIndex(of: gender) {
                                selectedGender = index
                            }
                        }
                        .onChange(of: selectedGender) { newValue in
                            gender = genderOptions[newValue]
                        }
                    }
                }
                
                // Address Information Section
                Section("Address Information") {
                    HStack {
                        Image(systemName: "house.fill")
                            .foregroundColor(.blue)
                            .frame(width: 20)
                        TextField("Street Address", text: $address)
                    }
                    
                    HStack {
                        Image(systemName: "building.2.fill")
                            .foregroundColor(.blue)
                            .frame(width: 20)
                        TextField("City", text: $city)
                    }
                    
                    HStack {
                        Image(systemName: "map.fill")
                            .foregroundColor(.blue)
                            .frame(width: 20)
                        TextField("State/Province", text: $state)
                    }
                    
                    HStack {
                        Image(systemName: "location.fill")
                            .foregroundColor(.blue)
                            .frame(width: 20)
                        TextField("Postal Code", text: $postalCode)
                    }
                    
                    HStack {
                        Image(systemName: "globe")
                            .foregroundColor(.blue)
                            .frame(width: 20)
                        TextField("Country", text: $country)
                    }
                }
                
                // Member Status Section
                Section("Member Status") {
                    HStack {
                        Image(systemName: "info.circle.fill")
                            .foregroundColor(.blue)
                            .frame(width: 20)
                        
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Current Status")
                                .font(.subheadline)
                            
                            HStack {
                                Circle()
                                    .fill(member.status.swiftUIColor)
                                    .frame(width: 8, height: 8)
                                
                                Text(member.status.displayName)
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                        }
                        
                        Spacer()
                    }
                    
                    HStack {
                        Image(systemName: "calendar")
                            .foregroundColor(.blue)
                            .frame(width: 20)
                        
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Member Since")
                                .font(.subheadline)
                            
                            Text(formatDate(member.memberSince))
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        
                        Spacer()
                    }
                }
                
                // Action Buttons Section
                Section {
                    Button(action: saveMember) {
                        HStack {
                            if isLoading {
                                ProgressView()
                                    .scaleEffect(0.8)
                                    .padding(.trailing, 8)
                            }
                            
                            Text(isLoading ? "Saving..." : "Save Changes")
                                .fontWeight(.medium)
                        }
                        .frame(maxWidth: .infinity)
                        .foregroundColor(.white)
                        .padding()
                        .background(isFormValid ? Color.blue : Color.gray)
                        .cornerRadius(12)
                    }
                    .disabled(!isFormValid || isLoading)
                    
                    Button(action: {
                        dismiss()
                    }) {
                        Text("Cancel")
                            .fontWeight(.medium)
                            .frame(maxWidth: .infinity)
                            .foregroundColor(.red)
                            .padding()
                            .background(Color.red.opacity(0.1))
                            .cornerRadius(12)
                    }
                }
                .listRowBackground(Color.clear)
            }
            .navigationTitle("Edit Member")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Save") {
                        saveMember()
                    }
                    .disabled(!isFormValid || isLoading)
                }
            }
        }
        .sheet(isPresented: $showDatePicker) {
            DatePicker("Date of Birth", selection: $dateOfBirth, displayedComponents: .date)
                .datePickerStyle(WheelDatePickerStyle())
                .padding()
                .presentationDetents([.medium])
        }
        .alert("Update Status", isPresented: $showAlert) {
            Button("OK") { }
        } message: {
            Text(alertMessage)
        }
    }
    
    // MARK: - Helper Properties
    private var isFormValid: Bool {
        !firstName.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty &&
        !lastName.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty &&
        !email.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty &&
        isValidEmail(email)
    }
    
    // MARK: - Helper Methods
    private func saveMember() {
        guard isFormValid else { return }
        
        isLoading = true
        
        // Create updated member object
        let updatedMemberData = [
            "firstName": firstName.trimmingCharacters(in: .whitespacesAndNewlines),
            "lastName": lastName.trimmingCharacters(in: .whitespacesAndNewlines),
            "email": email.trimmingCharacters(in: .whitespacesAndNewlines).lowercased(),
            "phone": phone.trimmingCharacters(in: .whitespacesAndNewlines),
            "dateOfBirth": ISO8601DateFormatter().string(from: dateOfBirth),
            "gender": gender,
            "address": address.trimmingCharacters(in: .whitespacesAndNewlines),
            "city": city.trimmingCharacters(in: .whitespacesAndNewlines),
            "state": state.trimmingCharacters(in: .whitespacesAndNewlines),
            "country": country.trimmingCharacters(in: .whitespacesAndNewlines),
            "postalCode": postalCode.trimmingCharacters(in: .whitespacesAndNewlines)
        ]
        
        // TODO: Implement actual API call to update member
        Task {
            await updateMemberAsync(memberData: updatedMemberData)
        }
    }
    
    @MainActor
    private func updateMemberAsync(memberData: [String: String]) async {
        do {
            // Simulate API call delay
            try await Task.sleep(for: .seconds(1))
            
            // TODO: Replace with actual GraphQL mutation
            // let updatedMember = try await viewModel.updateMember(id: member.id, data: memberData)
            
            isLoading = false
            alertMessage = "Member information updated successfully!"
            showAlert = true
            
            // Dismiss after showing success
            DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
                dismiss()
            }
            
        } catch {
            isLoading = false
            alertMessage = "Failed to update member: \(error.localizedDescription)"
            showAlert = true
        }
    }
    
    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        return formatter.string(from: date)
    }
    
    private func isValidEmail(_ email: String) -> Bool {
        let emailRegex = "[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,64}"
        let emailPredicate = NSPredicate(format: "SELF MATCHES %@", emailRegex)
        return emailPredicate.evaluate(with: email)
    }
}

#Preview {
    EditMemberView(member: Member(
        id: "1",
        email: "john.doe@example.com",
        firstName: "John",
        lastName: "Doe",
        phone: "+1234567890",
        dateOfBirth: Date(),
        gender: "Male",
        address: "123 Main St",
        city: "New York",
        state: "NY",
        country: "USA",
        postalCode: "10001",
        isActive: true,
        createdAt: Date(),
        updatedAt: Date(),
        clubId: "1",
        profileImageUrl: nil,
        fullName: "John Doe",
        displayName: "John Doe",
        currentSubscription: nil,
        currentQRCode: nil,
        recentCheckins: [],
        totalSubscriptions: 2,
        totalCheckins: 15,
        memberSince: Date(),
        status: .active,
        subscriptionExpiry: Date(),
        lastActivity: Date(),
        thisMonthCheckins: 5,
        subscriptionHistory: nil,
        checkinHistory: nil,
        stats: nil
    ))
}
