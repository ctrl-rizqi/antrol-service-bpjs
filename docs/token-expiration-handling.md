# Token Expiration Handling - Implementation Guide

## 🎯 Problem Statement
Website masih bisa digunakan ketika token auth kedaluarsa karena localStorage masih menyimpan token, tetapi API calls gagal karena token tidak valid.

## ✅ Solution Overview
Implementasi sistem penanganan token expiration dengan:
1. **Token Validation**: Validasi token sebelum digunakan
2. **Auto Refresh**: Refresh token otomatis sebelum kedaluarsa
3. **Error Handling**: Penanganan error 401 dengan retry mechanism
4. **UI Feedback**: Notifikasi dan status token untuk user

## 🔧 Implementation Details

### 1. Backend Changes

#### New Endpoint: `POST /api/auth/refresh`
**File**: `apps/service/src/api/auth.ts`

```typescript
router.post("/refresh", authenticateToken, async (req: Request, res: Response) => {
  // Generate new token for authenticated user
  // Return new token with fresh expiration time
})
```

**Response Success**:
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "token": "new_jwt_token_here"
  }
}
```

### 2. Frontend Changes

#### Enhanced Auth Service
**File**: `apps/frontend/src/services/auth/index.ts`

New methods:
- `refreshToken()`: Request new token dari backend
- `isTokenExpired()`: Cek apakah token sudah kedaluarsa
- `validateToken()`: Validasi dan refresh token jika perlu

#### Enhanced API Interceptor
**File**: `apps/frontend/src/api/index.ts`

Features:
- **Request Interceptor**: Validasi token sebelum kirim request
- **Response Interceptor**: Handle 401 error dengan token refresh
- **Queue Management**: Menghindari race condition saat refresh
- **Auto Retry**: Retry request yang gagal setelah token direfresh

#### Token Utilities
**File**: `apps/frontend/src/utils/token.ts`

Functions:
- `decodeToken()`: Decode JWT payload
- `isTokenExpired()`: Cek expiration
- `getTimeUntilTokenExpires()`: Hitung sisa waktu
- `willTokenExpireSoon()`: Cek apakah akan segera kedaluarsa

#### Auth Context Provider
**File**: `apps/frontend/src/contexts/AuthContext.tsx`

Features:
- **Token Monitoring**: Monitor token setiap 30 detik
- **Auto Refresh**: Refresh otomatis 5 menit sebelum kedaluarsa
- **State Management**: Kelola auth state secara global
- **Auto Logout**: Logout otomatis saat token expired

#### UI Components
**File**: `apps/frontend/src/components/auth/TokenStatus.tsx`

Components:
- `TokenStatusBadge`: Menampilkan status token di header
- `TokenExpirationWarning`: Warning popup saat token akan kedaluarsa

## 🚀 How It Works

### Flow 1: Normal Operation
1. User login → Token disimpan di localStorage
2. Setiap API call → Token ditambahkan ke header
3. Token monitoring → Cek status setiap 30 detik
4. Token valid → Request berjalan normal

### Flow 2: Token Refresh
1. Token akan kedaluarsa (< 5 menit)
2. Auto refresh trigger → Call `/api/auth/refresh`
3. New token received → Update localStorage
4. Continue normal operation

### Flow 3: Token Expired
1. Token sudah kedaluarsa
2. API call mendapat 401 error
3. Interceptor attempt refresh
4. If refresh successful → Retry original request
5. If refresh failed → Redirect to login

### Flow 4: Manual Refresh
1. User click refresh button di header
2. Manual refresh triggered
3. New token received → Update UI
4. Success notification shown

## 📊 Token Status

### Status Indicators
- **Green/Default**: Token valid
- **Yellow/Warning**: Token akan kedaluarsa (< 5 menit)
- **Red/Destructive**: Token kedaluarsa (auto logout)

### Time Display
- Format: `25m 30s` (25 menit 30 detik)
- Update: Real-time setiap detik
- Refresh: Manual refresh button saat warning

## 🔒 Security Features

### Token Validation
- JWT signature validation di backend
- Expiration time checking di frontend
- User status verification (isActive)

### Error Handling
- Graceful handling saat refresh gagal
- Queue management untuk multiple requests
- Race condition prevention

### Session Management
- Auto logout saat token expired
- Clear localStorage saat logout
- Redirect ke login page

## 🛠️ Configuration

### Environment Variables
```bash
# Backend
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h  # Token expiration time

# Frontend
VITE_API_BASE_URL=http://localhost:3000
```

### Token Expiration Settings
```typescript
// Auto refresh threshold (5 minutes before expiration)
const REFRESH_THRESHOLD = 300 // seconds

// Token check interval (30 seconds)
const CHECK_INTERVAL = 30000 // milliseconds
```

## 🧪 Testing

### Test Token Expiration
1. Set short expiration time (e.g., 2 minutes)
2. Login dan tunggu hingga token hampir kedaluarsa
3. Pastikan auto refresh berfungsi
4. Pastikan UI update dengan benar

### Test Network Failure
1. Block `/api/auth/refresh` endpoint
2. Pastikan graceful logout terjadi
3. Pastikan user diarahkan ke login

### Test Multiple Requests
1. Buat multiple API calls saat token expired
2. Pastikan hanya 1 refresh request
3. Pastikan semua requests diretry dengan token baru

## 📈 Benefits

1. **User Experience**: Tidak tiba-tiba logout
2. **Data Safety**: Tidak kehilangan data karena token expired
3. **Security**: Token selalu fresh dan valid
4. **Reliability**: Automatic error recovery
5. **Visibility**: User tahu status session

## 🔧 Troubleshooting

### Common Issues
1. **Token not refreshing**: Cek network connection dan console logs
2. **Multiple refresh requests**: Normal behavior, queue system active
3. **UI not updating**: Cek React context provider setup
4. **Auto logout not working**: Cek token validation logic

### Debug Mode
Enable debug logging untuk melihat:
- Token validation status
- Refresh attempts
- Queue processing
- Error details

## 📚 Next Steps (Optional)

1. **Refresh Token Rotation**: Implement refresh token rotation untuk keamanan ekstra
2. **Remember Me**: Fitur remember me dengan longer expiration
3. **Session Timeout**: Konfigurasi timeout berbeda untuk user roles
4. **Audit Log**: Log semua auth events untuk security monitoring
5. **SSO Integration**: Integrasi dengan SSO system jika diperlukan