# Bulk Repair Endpoint Documentation

## Overview
Endpoint `/api/task-id/bulk-repair` memangkas 3 proses (auto repair, validasi ulang, kirim ulang) menjadi 1 endpoint dengan parameter `startDate` dan `endDate`.

## Endpoint
```
POST /api/task-id/bulk-repair
```

## Request Body
```json
{
  "startDate": "2024-01-01",
  "endDate": "2024-01-31"
}
```

### Parameters
- `startDate` (required): Tanggal awal range (format: YYYY-MM-DD)
- `endDate` (required): Tanggal akhir range (format: YYYY-MM-DD)

## Response

### Success Response (200)
```json
{
  "success": true,
  "message": "Bulk repair selesai. Success: 25, Failed: 2",
  "data": {
    "totalProcessed": 27,
    "successCount": 25,
    "failedCount": 2,
    "results": [
      {
        "visit_id": "2024/01/01/001",
        "status": "success",
        "message": "Auto repair + validasi ulang + kirim ulang berhasil",
        "data": { ... }
      },
      {
        "visit_id": "2024/01/01/002",
        "status": "failed",
        "message": "Registration dengan no_reg 2024/01/01/002 tidak ditemukan di Khanza",
        "error": "Registration dengan no_reg 2024/01/01/002 tidak ditemukan di Khanza"
      }
    ]
  }
}
```

### Error Response (400)
```json
{
  "success": false,
  "message": "Parameter startDate dan endDate diperlukan"
}
```

```json
{
  "success": false,
  "message": "Format tanggal tidak valid. Gunakan format YYYY-MM-DD"
}
```

```json
{
  "success": false,
  "message": "startDate tidak boleh lebih besar dari endDate"
}
```

### Error Response (500)
```json
{
  "success": false,
  "message": "Gagal melakukan bulk repair",
  "error": "Error message detail"
}
```

## Proses yang Dilakukan

### Step 1: Auto Repair
- Mengecek task_id yang missing (0, 3, 4, 5, 6, 7)
- Generate task_id yang missing menggunakan data dari Khanza dan BPJS
- Update data ke database Khanza

### Step 2: Validasi Ulang
- Fetch fresh data dari Khanza
- Delete VisitEvent dan tasks yang lama
- Reprocess data sebagai data baru

### Step 3: Kirim Ulang
- Mengirim ulang semua tasks ke BPJS secara sequential
- Task 0: Registration
- Task 3-7: Update tasks

## Contoh Penggunaan

### cURL
```bash
curl -X POST http://localhost:3000/api/task-id/bulk-repair \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "startDate": "2024-01-01",
    "endDate": "2024-01-31"
  }'
```

### JavaScript/Fetch
```javascript
const response = await fetch('http://localhost:3000/api/task-id/bulk-repair', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    startDate: '2024-01-01',
    endDate: '2024-01-31'
  })
});

const result = await response.json();
console.log(result);
```

## Logging
Endpoint ini akan mencetak log detail ke console:
```
[BULK-REPAIR] Memulai proses repair untuk range: 2024-01-01 sampai 2024-01-31
[BULK-REPAIR] Ditemukan 27 visit event untuk diproses
[BULK-REPAIR] Memproses visit_id: 2024/01/01/001
[BULK-REPAIR] Step 1: Auto repair untuk 2024/01/01/001
[BULK-REPAIR] Missing task_ids untuk 2024/01/01/001: [3, 4, 5]
[BULK-REPAIR] Task missing berhasil digenerate untuk 2024/01/01/001
[BULK-REPAIR] Step 2: Validasi ulang untuk 2024/01/01/001
[BULK-REPAIR] Validasi ulang berhasil untuk 2024/01/01/001
[BULK-REPAIR] Step 3: Kirim ulang untuk 2024/01/01/001
[BULK-REPAIR] Kirim ulang berhasil untuk 2024/01/01/001
[BULK-REPAIR] Proses selesai. Success: 25, Failed: 2
```

## Performance
- Proses dilakukan sequential untuk setiap visit event
- Setiap visit event membutuhkan waktu 1-3 detik tergantung jumlah task
- Untuk 100 visit event: estimasi 2-5 menit

## Error Handling
- Jika salah satu visit event gagal, proses akan lanjut ke visit event berikutnya
- Hasil setiap visit event akan dicatat dalam response
- Visit event yang gagal tidak akan menghentikan proses bulk repair