#!/bin/bash

# Contoh penggunaan endpoint bulk repair
# Script ini menunjukkan cara menggunakan endpoint /api/task-id/bulk-repair

# Base URL API
BASE_URL="http://localhost:3000"

# Token autentikasi (ganti dengan token yang valid)
AUTH_TOKEN="your_jwt_token_here"

echo "=== BULK REPAIR TASK ID DEMO ==="
echo ""

# Contoh 1: Repair untuk range 1 hari
echo "Contoh 1: Repair untuk tanggal 2024-01-15"
curl -X POST "${BASE_URL}/api/task-id/bulk-repair" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -d '{
    "startDate": "2024-01-15",
    "endDate": "2024-01-15"
  }' | jq .

echo ""
echo "========================================="
echo ""

# Contoh 2: Repair untuk range 1 minggu
echo "Contoh 2: Repair untuk range 1 minggu (8-14 Januari 2024)"
curl -X POST "${BASE_URL}/api/task-id/bulk-repair" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -d '{
    "startDate": "2024-01-08",
    "endDate": "2024-01-14"
  }' | jq .

echo ""
echo "========================================="
echo ""

# Contoh 3: Repair untuk range 1 bulan
echo "Contoh 3: Repair untuk range 1 bulan (Januari 2024)"
curl -X POST "${BASE_URL}/api/task-id/bulk-repair" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -d '{
    "startDate": "2024-01-01",
    "endDate": "2024-01-31"
  }' | jq .

echo ""
echo "=== DEMO SELESAI ==="

# Catatan:
# 1. Pastikan server backend berjalan di localhost:3000
# 2. Ganti AUTH_TOKEN dengan token JWT yang valid
# 3. Pastikan jq terinstall untuk pretty print JSON (opsional)
# 4. Untuk production, gunakan HTTPS dan token yang aman