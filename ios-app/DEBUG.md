# iOS App Debugging Guide

## Kết nối và Authentication

### 1. Kiểm tra API Server
Trước khi test iOS app, đảm bảo backend đang chạy:

```bash
cd /Volumes/DATA/project/qrCheckin/backend
npm run start:dev
```

Server sẽ chạy trên: `http://localhost:4000`

### 2. Kiểm tra Config.plist
File: `ios-app/qrCheckin/qrCheckin/Config.plist`

Đảm bảo các endpoint đúng:
- API_BASE_URL: `http://192.168.1.40:4000`
- GRAPHQL_ENDPOINT: `http://192.168.1.40:4000/graphql`

**Lưu ý:** Thay `192.168.1.40` bằng IP thực của máy tính (dùng `ifconfig` để kiểm tra)

### 3. Test kết nối từ terminal
```bash
# Test basic connectivity
curl -X POST http://192.168.1.40:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __typename }"}'

# Test login
curl -X POST http://192.168.1.40:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation Login($input: LoginInput!) { login(input: $input) { access_token user { id email username role } } }",
    "variables": {
      "input": {
        "email": "admin@qrcheckin.com",
        "password": "admin123"
      }
    }
  }'
```

### 4. Test Accounts
Backend có sẵn các tài khoản test:

- **Admin**: admin@qrcheckin.com / admin123
- **Staff**: staff@qrcheckin.com / staff123
- **User**: user@qrcheckin.com / user123
- **Toan**: toan@zplus.vn / ToanLinh

### 5. Debug iOS App

#### A. Xem Console Log
Trong Xcode, mở Debug Console để xem:
- 🚀 GraphQL Request logs
- 📤 Request Body
- 🔍 Raw Response
- 🚨 Decode Errors
- 🧪 Connection test results

#### B. Sử dụng Debug Buttons
iOS app hiện có các nút debug trong LoginView:
1. **"Test Connection"**: Test kết nối cơ bản và GraphQL
2. **"Test Login (Admin)"**: Test login với credentials admin@qrcheckin.com/admin123
3. **"Skip Login (Test)"**: Bypass login để test UI

#### C. Debug Flow
1. Nhấn "Test Connection" trước → xem console logs
2. Nếu connection OK, nhấn "Test Login (Admin)" → xem login flow
3. Kiểm tra logs để tìm lỗi cụ thể

#### D. Các lỗi thường gặp:

**"The data couldn't be read because it isn't in the correct format"**
- Server trả về HTML thay vì JSON (thường do CORS hoặc server không chạy)
- GraphQL query syntax error
- Response structure không match với model

**"Cannot connect to server"**
- Kiểm tra IP address trong Config.plist
- Đảm bảo máy và simulator/thiết bị cùng mạng WiFi
- Kiểm tra firewall không block port 4000

**"Network error"**
- Kiểm tra backend CORS settings
- Đảm bảo server đang chạy
- Test với curl trước

### 6. Cấu hình CORS Backend
File: `backend/src/main.ts`

Đảm bảo có:
```typescript
app.enableCors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://192.168.1.40:3000', // Frontend
    'http://192.168.1.40:4000'  // iOS app
  ],
  credentials: true
});
```

### 7. Reset App State
Nếu gặp vấn đề, reset app state:

```swift
// Trong iOS app, xóa stored data
KeychainHelper.shared.delete(forKey: Constants.Auth.tokenKey)
UserDefaults.standard.removeObject(forKey: Constants.Auth.userKey)
```

## Troubleshooting Steps

1. **Kiểm tra backend**: `curl` test như trên
2. **Kiểm tra network**: Ping IP address
3. **Kiểm tra CORS**: Xem server logs
4. **Xem iOS logs**: Debug console trong Xcode
5. **Test từng bước**: Connection test → Login → Token validation

## Debug Commands

```bash
# Kiểm tra IP
ifconfig | grep "inet " | grep -v 127.0.0.1

# Check backend processes
lsof -i :4000

# Restart backend
cd backend && npm run start:dev
```
