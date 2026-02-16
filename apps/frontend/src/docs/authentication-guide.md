# Sistem Autentikasi dan Token Expiration

## Cara Kerja Sistem Token

Aplikasi ini menggunakan sistem token JWT (JSON Web Token) untuk autentikasi dengan mekanisme sebagai berikut:

### 1. Login dan Token
- Saat login berhasil, sistem akan memberikan token yang berlaku selama 24 jam
- Token disimpan di browser dan digunakan untuk setiap request ke server
- Token otomatis disertakan di setiap permintaan API

### 2. Token Expiration Warning
- **Peringatan 10 menit sebelum kadaluarsa**: Sistem akan menampilkan notifikasi berwarna kuning
- **Peringatan 5 menit sebelum kadaluarsa**: Sistem akan menampilkan notifikasi berwarna merah dengan opsi perpanjangan
- **Status bar di sidebar**: Menampilkan sisa waktu sesi secara real-time

### 3. Otomatis Logout
- Jika token sudah kadaluarsa, sistem akan:
  1. Mencoba refresh token secara otomatis (jika masih memungkinkan)
  2. Jika refresh gagal, otomatis logout dan redirect ke halaman login
  3. Menampilkan pesan yang jelas: "Sesi Anda telah berakhir untuk keamanan"

### 4. Fitur Perpanjangan Sesi
- Tombol "Perpanjang Sesi" tersedia saat token akan kadaluarsa
- Klik tombol untuk memperpanjang sesi tanpa perlu login ulang
- Sistem akan memberikan token baru yang berlaku 24 jam

### 5. Keamanan
- Token otomatis kadaluarsa untuk keamanan user
- Tidak ada data sensitif yang disimpan di token
- Setiap permintaan diverifikasi di server

## Pesan Error yang Mungkin Muncul

1. **"Sesi Anda Akan Berakhir"** - Tampil 10 menit sebelum kadaluarsa
2. **"Sesi Anda Telah Berakhir"** - Tampil saat token sudah kadaluarsa
3. **"Gagal Memperpanjang Sesi"** - Tampil jika refresh token gagal

## Tips untuk User

1. **Simpan pekerjaan Anda** jika melihat peringatan token akan kadaluarsa
2. **Klik "Perpanjang Sesi"** jika ingin melanjutkan tanpa login ulang
3. **Login ulang** jika session sudah berakhir (normal dan aman)
4. **Jangan khawatir** jika ter-logout otomatis - ini untuk keamanan Anda

## Troubleshooting

**Masalah: Sering ter-logout otomatis**
- Solusi: Pastikan koneksi internet stabil saat memperpanjang sesi
- Token refresh membutuhkan koneksi ke server

**Masalah: Tombol perpanjangan tidak berfungsi**
- Solusi: Refresh halaman dan coba login ulang
- Mungkin terjadi karena masalah jaringan

**Masalah: Peringatan tidak muncul**
- Solusi: Bersihkan cache browser dan coba lagi
- Pastikan JavaScript di browser diaktifkan