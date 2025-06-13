# iOS App Connection Troubleshooting Checklist

## Hiện tại có lỗi: "The data couldn't be read because it isn't in the correct format"

### Checklist Debug Theo Thứ Tự:

#### ✅ 1. Backend Status 
- [x] Backend đang chạy trên port 4000
- [x] API trả về JSON hợp lệ khi test bằng curl
- [x] Login mutation hoạt động đúng

#### ⏳ 2. Network Connectivity (Cần test từ iOS app)
```bash
# Test từ máy tính (đã OK):
curl -X POST http://192.168.1.43:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __typename }"}'
# Response: {"data":{"__typename":"Query"}}
```

#### ⏳ 3. iOS App Debug Steps

**Bước 1: Test Connection**
1. Mở iOS app trong Xcode
2. Mở Debug Console (View → Debug Area → Console)
3. Nhấn button "Test Connection" 
4. Xem logs console:
   - Có thấy "🧪 Starting connection tests..." không?
   - HTTP test có pass không?
   - GraphQL test có pass không?

**Bước 2: Analyze Logs**
Tìm trong console:
- `🚀 GraphQL Request to [URL]`: URL có đúng không?
- `📤 Request Body`: Request body có đúng format không?
- `🔍 GraphQL Raw Response`: Response có phải JSON không?
- `❌ [Error]`: Lỗi cụ thể là gì?

**Bước 3: Test Login**
1. Nhấn "Test Login (Admin)"
2. Xem console logs chi tiết
3. Kiểm tra response structure

#### 🔍 4. Possible Issues & Solutions

**Issue 1: Wrong URL**
- Kiểm tra Constants.API.graphQLEndpoint
- Đảm bảo đúng IP: 192.168.1.40:4000

**Issue 2: CORS Error**
- Server logs có error CORS không?
- Response status code khác 200?

**Issue 3: JSON Parse Error**
- Server trả về HTML error page thay vì JSON
- GraphQL query syntax sai
- Response structure không match model

**Issue 4: SSL/HTTPS Issues**
- iOS có require HTTPS không?
- App Transport Security (ATS) settings

#### 🛠 5. Next Steps Dựa Trên Results

**Nếu HTTP Test Fail:**
- Check network connectivity
- Verify IP address và port
- Check firewall settings

**Nếu HTTP Test Pass, GraphQL Fail:**
- Check GraphQL query syntax
- Check response parsing
- Verify model structures

**Nếu Connection Tests Pass, Login Fail:**
- Check login mutation syntax
- Check LoginResponse model structure
- Verify token storage

#### 📝 6. Log Examples To Look For

**Good HTTP Test:**
```
🧪 Starting connection tests...
🚀 GraphQL Request to http://192.168.1.40:4000/graphql
📤 Request Body: {"query":"{ __typename }"}
🔍 HTTP Response Status: <NSHTTPURLResponse: ...>
📊 Status Code: 200
📦 Raw Response: {"data":{"__typename":"Query"}}
✅ JSON parsed successfully: ...
✅ Basic HTTP test passed
```

**Bad HTTP Test:**
```
🧪 Starting connection tests...
🚀 GraphQL Request to http://192.168.1.40:4000/graphql
📊 Status Code: 404  // ← Problem!
📦 Raw Response: <html>404 Not Found</html>  // ← HTML instead of JSON!
❌ HTTP Test Error: ...
```

## Action Items

1. **Chạy iOS app và test connection**
2. **Copy-paste console logs vào đây**
3. **Analyze logs theo checklist trên**
4. **Apply appropriate solution**

---

**Cập nhật logs sau khi test:**
```
[Paste console logs here after testing]
```
