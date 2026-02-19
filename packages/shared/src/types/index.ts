export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginationMeta {
  total: number;
  limit: number;
  page: number;
  totalPages: number;
  prevPage: number | null;
  nextPage: number | null;
}

export interface PaginationResponse<T> {
  status: boolean;
  data: T;
  meta: PaginationMeta;
}

export type TaskId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 99;

export type VisitStatus = 'pending' | 'sent' | 'failed' | 'completed';

export type EventTaskStatus = 'DONE' | 'FAILED' | 'SEND';

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'user';
  permissions: string[];
}

export interface VisitEventPayload {
  kodebooking: string;
  taskid: TaskId;
  waktu: string;
}

export interface PoliMapping {
  khanzaKodePoli: string;
  bpjsKodePoli: string;
  bpjsKodeSubspesialis?: string;
}

export interface Category {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Flag {
  id: string;
  visit_id: string;
  category_id: number;
  createdAt: string;
  updatedAt: string;
}

export interface VisitEvent {
  id: string;
  visit_id: string;
  event_time: string;
  tanggal: string;
  jam_registrasi: string;
  poli_id: string;
  dokter_id: number;
  no_rkm_medis: string;
  nomor_antrean: string;
  angka_antrean: number;
  payload: string;
  createdAt: string;
  updatedAt: string;
  syncedAt: string | null;
}

export interface EventTask {
  id: string;
  task_id: number;
  visit_event_id: string;
  status: EventTaskStatus;
  event_time: string;
  original_event_time: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskIdRegistration {
  id: string;
  visit_id: string;
  event_time: string;
  event_time_datetime: string;
  no_rkm_medis: string;
  sumber_data: string;
  tanggal: string;
  kodedokter: number;
  kodepoli: string;
  status_peserta: boolean;
  status_kunjungan: boolean;
  payload: TaskIdRegistrationPayload;
  fetchedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskIdRegistrationPayload {
  nik: string;
  nohp: string;
  status: string;
  nokapst: string;
  tanggal: string;
  kodepoli: string;
  ispeserta: boolean;
  noantrean: string;
  jampraktek: string;
  kodedokter: number;
  sumberdata: string;
  createdtime: number;
  kodebooking: string;
  norekammedis: string;
  jeniskunjungan: number;
  nomorreferensi: string;
  estimasidilayani: number;
}

export interface WeeklyStatsData {
  date: string;
  day: string;
  selesai: number;
  belum_terkirim: number;
}

export interface WeeklyStatsSummary {
  total_selesai: number;
  total_belum_terkirim: number;
  total_keseluruhan: number;
}

export interface WeeklyStatsResponse {
  success: boolean;
  data: WeeklyStatsData[];
  summary: WeeklyStatsSummary;
}

export interface BulkRepairResult {
  visit_id: string;
  status: 'success' | 'failed';
  message: string;
  data?: VisitEvent & { EventTasks: EventTask[] };
  error?: string;
}

export interface BulkRepairResponse {
  success: boolean;
  message: string;
  data: {
    totalProcessed: number;
    successCount: number;
    failedCount: number;
    results: BulkRepairResult[];
  };
}
