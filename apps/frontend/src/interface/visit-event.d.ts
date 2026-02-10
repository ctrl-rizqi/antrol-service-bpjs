import type { E } from 'node_modules/@faker-js/faker/dist/airline-CWrCIUHH'

export type Flag = {
  id: string
  visit_id: string
  category_id: number
  createdAt: string
  updatedAt: string
}

export type Category = {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

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

export type AutoHealthVisitEvent = {
  success: boolean
  data: {
    patientRegistrationUpdated: {
      no_reg: string
      no_rawat: string
      tgl_registrasi: string
      nama_hari: string
      jam_registrasi: string
      kd_dokter: string
      nama_dokter: string
      no_rkm_medis: string
      kd_poli: string
      nama_poli: string
      jenis_kunjungan: number
      pasien_baru: string
      jam_mulai: string
      jam_selesai: string
      kuota_jkn: number
      task_id_3: string
      task_id_4: string
      task_id_5: string
      task_id_6: string
      task_id_7: string
    }
  }
}
