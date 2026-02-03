import type { E } from 'node_modules/@faker-js/faker/dist/airline-CWrCIUHH'

export type VisitEvent = {
  id: string
  visit_id: string
  event_time: string
  tanggal: string
  jam_registrasi: string
  poli_id: string
  dokter_id: number
  no_rkm_medis: string
  nomor_antrean: string
  angka_antrean: number
  payload: string
  createdAt: string
  updatedAt: string
  syncedAt: string | null
}

export type EventTask = {
  id: string
  task_id: number
  visit_event_id: string
  status: 'DONE' | 'FAILED' | 'SEND'
  event_time: string
  original_event_time: string | null
  createdAt: string
  updatedAt: string
}

export type VisitEventPayload = {
  jenis_kunjungan: number
  status_poli: string
  jampraktek: string
  namapoli: string
  namadokter: string
  kuota: number
  sisa_kuota: number
  estimasi_dilayani: number
}

export type VisitEventLog = {
  id: string
  visit_id: string
  task_id: string
  event_time: string
  payload: string
  http_code: number
  retry_count: number
  last_error: string
  sentAt: string
  createdAt: string
  updatedAt: string
}
