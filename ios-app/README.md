# QR Check-in iOS App

## Overview
iOS application for QR Check-in system staff to scan QR codes and manage member check-ins.

## Features
- **QR Code Scanner**: Real-time camera-based QR code scanning with visual feedback
- **Member Check-in/Check-out**: Process member check-ins and check-outs for events
- **Event Management**: Select and manage active events
- **Attendance Logs**: View recent check-in activity and statistics
- **Offline Support**: Queue check-ins when offline for later sync
- **Authentication**: Secure login for staff members
- **Real-time Sync**: GraphQL-based communication with backend

## Tech Stack
- **Language**: Swift/SwiftUI
- **Architecture**: MVVM with Combine
- **Networking**: URLSession + GraphQL
- **Local Storage**: UserDefaults + Keychain
- **QR Scanner**: AVFoundation
- **Dependencies**: None (pure Swift implementation)

## Getting Started

### Prerequisites
- Xcode 15.0+
- iOS 16.0+
- Access to QR Check-in backend API

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd ios-app/qrCheckin

# Open Xcode project
open qrCheckin.xcodeproj
```

### Configuration
1. Update `Config.plist` with your backend API URL:
```xml
<key>API_BASE_URL</key>
<string>https://your-backend-domain.com</string>
<key>GRAPHQL_ENDPOINT</key>
<string>https://your-backend-domain.com/graphql</string>
```

2. Add camera permission to Info.plist:
```xml
<key>NSCameraUsageDescription</key>
<string>This app needs camera access to scan QR codes for member check-ins</string>
```

### Project Structure
```
QRCheckin/
├── Models/               # Data models (User, Event, CheckinLog, etc.)
│   ├── User.swift
│   ├── Event.swift
│   ├── CheckinLog.swift
│   ├── Club.swift
│   ├── Subscription.swift
│   └── QRCode.swift
├── Views/                # SwiftUI views
│   ├── Scanner/          # QR scanner interface
│   ├── Login/            # Authentication views
│   ├── Dashboard/        # Statistics and management
│   └── RootView.swift    # App root view
├── ViewModels/           # MVVM view models
│   ├── ScannerViewModel.swift
│   ├── LoginViewModel.swift
│   └── DashboardViewModel.swift
├── Services/             # API and business logic
│   ├── GraphQLService.swift
│   ├── QRScannerService.swift
│   ├── OfflineService.swift
│   └── KeychainHelper.swift
└── Utils/                # Helper utilities
    ├── Constants.swift
    └── ConfigManager.swift
```

## Build Instructions
1. Open project in Xcode
2. Select target device/simulator (iOS 16.0+)
3. Ensure camera permissions are configured
4. Build and run (⌘+R)

## Key Features

### QR Code Scanner
- **Camera Integration**: Uses AVFoundation for real-time QR code detection
- **Visual Feedback**: Animated scanner overlay with corner indicators
- **Permission Handling**: Proper camera permission requests and error handling
- **Debouncing**: Prevents duplicate scans with configurable delay

### Authentication
- **JWT Tokens**: Secure token-based authentication
- **Keychain Storage**: Sensitive data stored securely in iOS Keychain
- **Role-based Access**: Staff and admin role validation
- **Auto-login**: Remember user sessions across app launches

### Event Management
- **Real-time Events**: Fetch and display active events from backend
- **Event Selection**: Staff can select current event for check-ins
- **Event Status**: Visual indicators for ongoing/upcoming/completed events
- **Capacity Tracking**: Display event capacity and attendance

### Check-in System
- **Automatic Detection**: Smart check-in/check-out type detection
- **Manual Override**: Manual entry for problematic QR codes
- **Real-time Feedback**: Immediate success/error notifications
- **Recent Activity**: Display recent check-ins with user details

### Offline Support
- **Queue Management**: Queue check-ins when offline
- **Auto-sync**: Automatic sync when connection restored
- **Visual Indicators**: Clear offline mode indicators
- **Data Persistence**: Offline queue persisted across app sessions

### Dashboard
- **Statistics**: Daily check-in/check-out counts
- **Active Events**: List of ongoing and upcoming events
- **Recent Activity**: Timeline of recent check-in activities
- **Event Details**: Comprehensive event information display

## API Integration

### GraphQL Endpoints
- `login`: User authentication
- `events`: Fetch available events
- `processCheckin`: Process check-in/check-out
- `recentCheckins`: Get recent activity

### Error Handling
- Network connectivity issues
- Invalid QR codes
- Authentication failures
- Server errors
- Permission denials

## Testing
The app includes unit tests for core functionality:
```bash
# Run tests in Xcode
⌘+U
```

Test coverage includes:
- Data model validation
- User role and permission logic
- Event time calculations
- Check-in type logic
- Subscription validity
- QR code expiration

## Security
- **Keychain Storage**: Sensitive tokens stored in iOS Keychain
- **HTTPS Communication**: All API calls use secure HTTPS
- **Permission Validation**: Proper camera and network permissions
- **Data Validation**: Input sanitization and validation
- **Session Management**: Secure session handling with JWT

## Performance
- **Lazy Loading**: Efficient list rendering with LazyVStack
- **Image Caching**: Optimized asset loading
- **Memory Management**: Proper Combine subscription cleanup
- **Background Processing**: Camera operations on background queue

## Troubleshooting

### Camera Issues
- Ensure camera permissions are granted in Settings
- Check that device has working camera
- Verify good lighting conditions for QR scanning

### Network Issues
- Verify API endpoints in Config.plist
- Check network connectivity
- Ensure backend is running and accessible

### Authentication Issues
- Verify staff credentials with backend admin
- Check JWT token validity
- Clear app data if persistent issues

## Deployment
For production deployment:
1. Update API endpoints in Config.plist
2. Configure proper signing certificates
3. Enable production build optimizations
4. Test on physical devices
5. Submit to App Store or distribute via Enterprise

## Support
For technical support or feature requests, please contact the development team or create an issue in the repository.