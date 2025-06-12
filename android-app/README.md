# QR Check-in Android App

## Overview
Android application for QR Check-in system staff to scan QR codes and manage member check-ins.

## Features
- QR Code Scanner
- Member Check-in/Check-out
- Event Management
- Attendance Logs
- Offline Support
- Real-time Sync with Backend

## Tech Stack
- **Language**: Kotlin
- **Architecture**: MVVM + Clean Architecture
- **UI**: Jetpack Compose
- **Networking**: Retrofit + Apollo GraphQL
- **Local Database**: Room
- **QR Scanner**: ML Kit Barcode Scanning
- **Dependencies**:
  - Apollo GraphQL Android
  - Jetpack Navigation Compose
  - Hilt for DI
  - Coroutines & Flow

## Getting Started

### Prerequisites
- Android Studio Giraffe+
- Android SDK 26+
- Kotlin 1.9+

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd android-app

# Open in Android Studio
# File -> Open -> Select android-app folder
```

### Project Structure
```
android-app/
├── app/
│   ├── src/main/java/com/qrcheckin/
│   │   ├── data/
│   │   │   ├── local/
│   │   │   ├── remote/
│   │   │   └── repository/
│   │   ├── domain/
│   │   │   ├── model/
│   │   │   ├── repository/
│   │   │   └── usecase/
│   │   ├── presentation/
│   │   │   ├── scanner/
│   │   │   ├── dashboard/
│   │   │   └── login/
│   │   ├── di/
│   │   └── util/
│   ├── src/main/res/
│   └── src/test/
├── build.gradle
└── settings.gradle
```

## Configuration
1. Update `build.gradle` with your backend API URL
2. Configure GraphQL schema in `apollo/` directory
3. Set up Firebase (if using for notifications)

## Build Instructions
1. Open project in Android Studio
2. Sync Gradle files
3. Run on device/emulator

## Testing
```bash
# Unit tests
./gradlew test

# UI tests
./gradlew connectedAndroidTest
```