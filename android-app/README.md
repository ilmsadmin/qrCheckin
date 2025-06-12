# QR Check-in Android App

## Overview
Android application for QR Check-in system staff to scan QR codes and manage member check-ins.

## Features Implemented

### ✅ Core Architecture
- **Clean Architecture**: Separation of concerns with data, domain, and presentation layers
- **MVVM Pattern**: ViewModels manage UI state with StateFlow
- **Jetpack Compose**: Modern UI toolkit for native Android development
- **Repository Pattern**: Abstraction layer for data access

### ✅ UI Components
- **QR Scanner Screen**: Main interface for scanning QR codes and managing check-ins
- **Bottom Navigation**: Navigation between Scanner, Logs, Stats, and Profile screens
- **Event Selection**: Dropdown to select current event for check-ins
- **Recent Scans**: List showing recent check-in/check-out activities
- **Action Buttons**: Check-in and check-out functionality
- **Dark Theme**: Professional dark theme matching design mockup

### ✅ Domain Models
- **User**: User information with roles (Admin, Staff, User)
- **Event**: Event details with time, location, and capacity
- **CheckinLog**: Check-in/check-out logging with timestamps
- **QRCode**: QR code data linking users to subscriptions
- **Enums**: Role, CheckinType for type safety

### ✅ Business Logic
- **Use Cases**: CheckinUseCase, GetEventsUseCase for business operations
- **Repository Interfaces**: Abstraction for data access (CheckinRepository, EventRepository, AuthRepository)
- **State Management**: Reactive UI state with Kotlin coroutines and Flow

### 🔧 Prepared for Integration
- **Network DTOs**: Data transfer objects for GraphQL/REST API integration
- **Data Mappers**: Conversion between network DTOs and domain models
- **Permissions**: Camera and network permissions for QR scanning
- **Dependencies**: Build configuration ready for ML Kit, CameraX, networking libraries

## Architecture Structure

```
app/src/main/java/com/zplus/qrcheckin/
├── data/
│   ├── local/            # Room database (ready for implementation)
│   ├── remote/           # API services & DTOs
│   │   └── dto/          # Network data models
│   ├── repository/       # Repository implementations
│   └── mapper/           # Data mappers
├── domain/
│   ├── model/            # Domain models
│   ├── repository/       # Repository interfaces
│   └── usecase/          # Use cases
├── presentation/
│   ├── scanner/          # QR Scanner screen & ViewModel
│   ├── navigation/       # Bottom navigation components
│   ├── dashboard/        # Dashboard (placeholder)
│   └── login/            # Login (placeholder)
├── di/                   # Dependency injection (ready for Hilt)
└── util/                 # Utility classes
```

## Tech Stack
- **Language**: Kotlin
- **UI**: Jetpack Compose
- **Architecture**: MVVM + Clean Architecture
- **State Management**: StateFlow, Compose State
- **Navigation**: Bottom Navigation (ready for Navigation Compose)
- **Async**: Coroutines & Flow
- **Build System**: Gradle Kotlin DSL

## Next Steps for Full Implementation

### 🔄 Immediate Tasks
1. **QR Scanning**: Integrate ML Kit Barcode Scanning or CameraX
2. **Network Layer**: Implement GraphQL client (Apollo) or REST API (Retrofit)
3. **Local Storage**: Add Room database for offline support
4. **Dependency Injection**: Set up Hilt modules
5. **Authentication**: Implement JWT-based login flow

### 📱 Additional Screens
1. **Login Screen**: Staff authentication
2. **Logs Screen**: Detailed check-in history with filtering
3. **Stats Screen**: Analytics and reporting dashboard
4. **Profile Screen**: User profile and settings

### 🔗 Backend Integration
1. **GraphQL Queries**: Connect to backend GraphQL endpoint
2. **Real-time Updates**: WebSocket/Server-Sent Events for live data
3. **Error Handling**: Network error handling and retry logic
4. **Caching**: Implement caching strategy for offline support

### 🧪 Testing
1. **Unit Tests**: ViewModels, Use Cases, Repositories
2. **Integration Tests**: API integration tests
3. **UI Tests**: Compose UI testing
4. **End-to-End Tests**: Full user journey testing

## Getting Started

### Prerequisites
- Android Studio Giraffe+
- Android SDK 24+
- Kotlin 1.7+

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd android-app

# Open in Android Studio
# File -> Open -> Select android-app folder
```

### Configuration
1. Update backend API URL in configuration
2. Configure GraphQL schema in `apollo/` directory (when implemented)
3. Set up Firebase (if using for notifications)

### Build Instructions
1. Open project in Android Studio
2. Sync Gradle files
3. Run on device/emulator

## Design Implementation

The UI closely follows the provided design mockup (`mock/design/qr-scanner.html`):

- **Dark Theme**: Professional black/gray color scheme
- **Scanner Frame**: Blue-bordered frame with QR code icon
- **Event Selection**: Dropdown matching design
- **Action Buttons**: Green check-in, red check-out buttons
- **Recent Scans**: Card-based list with status indicators
- **Bottom Navigation**: Four-tab navigation (Scanner, Logs, Stats, Profile)

## Notes

This implementation provides a solid foundation for the QR Check-in Android app with:
- Clean, maintainable architecture
- Type-safe Kotlin implementation
- Modern Compose UI
- Ready for backend integration
- Scalable structure for additional features

The current implementation includes comprehensive UI components and business logic structure, with mock data for demonstration. Integration with the actual backend GraphQL API and QR scanning functionality can be added incrementally.