# Testing Token Expiration

## Cara Test Token Expiration

### 1. Test Normal Flow
1. Login dengan username/password valid
2. Gunakan aplikasi seperti biasa
3. Perhatikan status bar di sidebar (akan menampilkan sisa waktu)
4. Tunggu hingga mendekati 24 jam atau ubah JWT_EXPIRES_IN menjadi lebih pendek

### 2. Test Warning System
1. Set JWT_EXPIRES_IN=10m (10 menit) di backend .env
2. Restart backend
3. Login dan tunggu 5 menit
4. Seharusnya muncul warning kuning
5. Tunggu 8 menit, seharusnya muncul warning merah dengan tombol perpanjangan

### 3. Test Auto-refresh
1. Klik tombol "Perpanjang Sesi" saat warning muncul
2. Token seharusnya diperbarui dan waktu reset ke 24 jam
3. Tidak perlu login ulang

### 4. Test Token Expired
1. Biarkan token kadaluarsa (atau ubah waktu sistem)
2. Sistem akan otomatis:
   - Coba refresh token
   - Jika gagal, redirect ke login
   - Tampilkan pesan: "Sesi Anda telah berakhir untuk keamanan"

### 5. Test Manual Logout
1. Klik logout di sidebar
2. Token dihapus dari localStorage
3. Redirect ke login page

## Pesan yang Muncul

### Warning Messages
- **10 menit sebelum kadaluarsa**: "Sesi Anda akan berakhir dalam 10 menit"
- **5 menit sebelum kadaluarsa**: "Sesi Anda akan berakhir dalam 5 menit"

### Error Messages
- **Token expired**: "Sesi Anda telah berakhir untuk keamanan. Silakan login kembali."
- **Refresh failed**: "Gagal memperpanjang sesi. Silakan login kembali."

### Success Messages
- **Token refreshed**: "Sesi diperpanjang berhasil"

## Troubleshooting

### Token tidak pernah kadaluarsa
- Cek JWT_EXPIRES_IN di backend .env
- Restart backend setelah perubahan
- Clear localStorage di browser

### Warning tidak muncul
- Cek console untuk error
- Pastikan JavaScript aktif
- Cek network tab untuk refresh token requests

### Auto-refresh gagal
- Cek koneksi internet
- Cek backend endpoint `/auth/refresh`
- Cek browser console untuk error details