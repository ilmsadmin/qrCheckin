# QR Check-in iOS App - API Integration Update

## Overview
This document describes the changes made to integrate the iOS app with the real backend API, replacing mock data with actual GraphQL API calls.

## Changes Made

### 1. GraphQLService Updates
- **File**: `Services/GraphQLService.swift`
- **Changes**:
  - Updated `performCheckin()` method to use separate `checkin` and `checkout` mutations
  - Added `performCheckout()` method for checkout operations
  - Updated `fetchEvents()` to use real events API
  - Added `fetchClubs()` method for club data
  - Updated `fetchRecentCheckins()` to use real checkin logs API
  - Updated response models to handle JSON string responses from backend

### 2. ScannerViewModel Updates
- **File**: `ViewModels/ScannerViewModel.swift`
- **Changes**:
  - Replaced `MockDataService` with `GraphQLService`
  - Updated `performCheckin()` to use real API calls based on checkin type
  - Added proper error handling for API failures
  - Maintained offline support for queued operations

### 3. DashboardViewModel Updates
- **File**: `ViewModels/DashboardViewModel.swift`
- **Changes**:
  - Replaced `MockDataService` with `GraphQLService`
  - Updated all data loading methods to use real API
  - Added club filtering to show only active clubs
  - Updated event filtering to work with real data

### 4. CheckinLog Model Updates
- **File**: `Models/CheckinLog.swift`
- **Changes**:
  - Updated to match backend Prisma schema
  - Added `subscriptionId`, `location`, and `notes` fields
  - Removed `createdAt` field (not in backend schema)
  - Updated initializers to support new structure

### 5. ScannerView Debug Features
- **File**: `Views/Scanner/ScannerView.swift`
- **Changes**:
  - Added debug section with sample QR codes for testing
  - Sample QR codes follow backend format: `USER-{userId}-SUB-{subscriptionId}`
  - Debug features only available in development builds

## API Endpoints Used

### Authentication
- `login(input: LoginInput!)` - User authentication
- `me()` - Get current user profile
- `logout()` - User logout

### Events
- `events()` - Fetch all events (returns JSON string)

### Clubs
- `clubs()` - Fetch all clubs

### Check-in/Check-out
- `checkin(qrCodeId: String!, eventId: String!)` - Process check-in (returns JSON string)
- `checkout(qrCodeId: String!, eventId: String!)` - Process check-out (returns JSON string)
- `checkinLogs(userId: String, eventId: String)` - Fetch check-in logs (returns JSON string)

## Sample QR Code Format

The backend expects QR codes in the format:
```
USER-{userId}-SUB-{subscriptionId}
```

Example QR codes for testing:
- `USER-user1-SUB-sub1`
- `USER-user2-SUB-sub2`

## Configuration

The app is configured to connect to the backend at:
- **Base URL**: `http://localhost:4000`
- **GraphQL Endpoint**: `http://localhost:4000/graphql`

These settings are defined in `Config.plist`.

## Testing

### Manual Testing
1. Launch the iOS app
2. Login with credentials:
   - **Staff**: `staff@qrcheckin.com` / `staff123`
   - **Admin**: `admin@qrcheckin.com` / `admin123`
3. Navigate to Scanner view
4. Use debug section (development builds only) to test sample QR codes
5. Verify check-in/check-out operations work with real API

### Debug Features
- Sample QR codes available in Scanner view (debug builds only)
- Manual QR code input for testing
- Offline queue support for when backend is unavailable

## Backend Requirements

The backend must be running with seeded data. Ensure:
1. PostgreSQL database is running
2. Backend server is running on port 4000
3. Database has been seeded with sample data (users, events, clubs, QR codes)

## Known Limitations

1. **Clubs API**: Backend clubs query requires authentication, but GraphQL schema shows it returns `[Club!]!` while the resolver returns objects. May need backend adjustment.

2. **Response Format**: Backend returns JSON strings for some queries instead of typed objects. This is handled by parsing JSON strings in the app.

3. **Error Handling**: Backend error messages may need improvement for better user experience.

## Next Steps

1. **Enhanced Error Handling**: Improve error messages based on backend response codes
2. **Real-time Updates**: Implement WebSocket support for live check-in updates
3. **Offline Sync**: Enhance offline queue management and sync logic
4. **Push Notifications**: Add support for event notifications
5. **Advanced Features**: Implement capacity tracking, analytics, and reporting

## Files Modified

- `Services/GraphQLService.swift`
- `ViewModels/ScannerViewModel.swift`
- `ViewModels/DashboardViewModel.swift`
- `Models/CheckinLog.swift`
- `Views/Scanner/ScannerView.swift`

## Dependencies

No new dependencies were added. The app continues to use pure Swift with Combine framework for reactive programming.
