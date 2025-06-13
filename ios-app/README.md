# QR Check-in iOS App - Club Staff Mobile Application

Native iOS application for club staff to perform QR code scanning, customer check-in/check-out operations, and manage daily club activities.

## 🎯 Overview

The iOS app is designed specifically for club staff members who need to:
- Scan customer QR codes for check-in/check-out
- Manage events and select active events
- View real-time check-in logs and analytics
- Handle customer inquiries and support
- Operate offline when necessary with sync capabilities

## 👥 Target Users

- **Club Staff**: Front desk staff, trainers, and operational personnel
- **Club Admins**: Management personnel who need operational oversight
- **User Role**: `CLUB_STAFF` and `CLUB_ADMIN` in the backend system

## 🏗️ Technical Architecture

### Platform & Requirements
- **Minimum iOS Version**: iOS 14.0+
- **Deployment Target**: iOS 14.0
- **Device Support**: iPhone and iPad (Universal app)
- **Orientation**: Portrait primary, landscape supported

### Architecture Pattern
- **Architecture**: MVVM (Model-View-ViewModel)
- **UI Framework**: SwiftUI with UIKit integration where needed
- **Reactive Programming**: Combine framework for data binding
- **Dependency Injection**: Manual DI with protocol-based architecture

## 📱 Development Status

### ✅ Completed Features
- Basic project structure and architecture
- SwiftUI-based user interface
- Authentication flow with JWT tokens
- QR code scanning with AVFoundation
- Event selection and management
- Mock data services for development
- Unit tests for core functionality

### 🔄 In Development
- Real-time GraphQL API integration
- Offline support and sync capabilities
- Enhanced UI/UX design
- Comprehensive error handling
- Performance optimizations

### ⏳ Planned Features
- Push notifications
- Advanced analytics dashboard
- iPad-optimized interface
- Apple Watch companion app

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