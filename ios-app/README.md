# QR Check-in iOS App

## Overview
iOS application for QR Check-in system staff to scan QR codes and manage member check-ins.

## Features
- QR Code Scanner
- Member Check-in/Check-out
- Event Management
- Attendance Logs
- Real-time Sync with Backend

## Tech Stack
- **Language**: Swift/SwiftUI
- **Architecture**: MVVM
- **Networking**: URLSession + GraphQL
- **Local Storage**: Core Data
- **QR Scanner**: AVFoundation
- **Dependencies**: 
  - Apollo GraphQL iOS
  - SwiftUI Navigation
  - Keychain Services

## Getting Started

### Prerequisites
- Xcode 15.0+
- iOS 16.0+
- CocoaPods or Swift Package Manager

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd ios-app

# Install dependencies (if using CocoaPods)
pod install

# Open Xcode workspace
open QRCheckin.xcworkspace
```

### Project Structure
```
ios-app/
├── QRCheckin/
│   ├── App/
│   │   └── QRCheckinApp.swift
│   ├── Models/
│   │   ├── User.swift
│   │   ├── Event.swift
│   │   └── CheckinLog.swift
│   ├── Views/
│   │   ├── Scanner/
│   │   ├── Dashboard/
│   │   └── Login/
│   ├── ViewModels/
│   │   ├── ScannerViewModel.swift
│   │   └── DashboardViewModel.swift
│   ├── Services/
│   │   ├── GraphQLService.swift
│   │   └── QRScannerService.swift
│   └── Utils/
│       └── Constants.swift
├── QRCheckinTests/
└── QRCheckinUITests/
```

## Configuration
1. Update `Config.plist` with your backend API URL
2. Configure GraphQL endpoint in `GraphQLService.swift`
3. Set up push notification certificates (if needed)

## Build Instructions
1. Open project in Xcode
2. Select target device/simulator
3. Build and run (⌘+R)