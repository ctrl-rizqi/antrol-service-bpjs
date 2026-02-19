export const TASK_ID_LABELS = {
  1: 'Belum dilayani',
  2: 'Dalam antrian',
  3: 'Sedang dilayani',
  4: 'Selesai dilayani',
  5: 'Belum hadir / batal',
  6: 'Meninggal',
  7: 'Rujuk',
  99: 'Invalid',
} as const;

export const VISIT_STATUS_LABELS = {
  pending: 'Menunggu',
  sent: 'Terkirim',
  failed: 'Gagal',
  completed: 'Selesai',
} as const;

export const BPJS_BASE_URL = process.env.BPJS_BASE_URL || 'https://api.bpjs-kesehatan.go.id';

export const DEFAULT_PAGE_LIMIT = 10;
export const MAX_PAGE_LIMIT = 100;

export const TASK_ID_VALIDATION_ORDER: readonly number[] = [1, 2, 3, 4, 5, 6, 7, 99];
