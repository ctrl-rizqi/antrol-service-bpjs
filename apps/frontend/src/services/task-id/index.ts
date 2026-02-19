import { api } from '@/api'
import type { PaginationResponse } from '@/interface/response'
import type {
  EventTask,
  TaskIdRegistration,
  VisitEvent,
} from '@/interface/visit-event'

export const fetchTaskIdRegistration = async (
  search?: string,
  page?: number,
  limit?: number,
  tanggal?: string,
) => {
  const response = await api.get<PaginationResponse<TaskIdRegistration[]>>(
    '/task-id',
    {
      params: { search, page, limit, tanggal },
    },
  )

  return response.data
}

export const syncTaskIdRegistration = async (tanggal: string) => {
  const response = await api.post<{ success: boolean; message: string }>(
    '/task-id/sync',
    { tanggal },
  )

  return response.data
}

export type syncVisitEventResponse = {
  success: boolean
  message: string
  data: VisitEvent & {
    EventTasks: EventTask[]
  }
}

export const syncVisitEvent = async (kodebooking: string) => {
  const response = await api.post<syncVisitEventResponse>(
    '/admin/visit-event/manual',
    {
      kodebooking,
    },
  )

  return response.data
}

export type BulkRepairResponse = {
  success: boolean
  message: string
  data: {
    totalProcessed: number
    successCount: number
    failedCount: number
    results: Array<{
      visit_id: string
      status: 'success' | 'failed'
      message: string
      data?: VisitEvent & { EventTasks: EventTask[] }
      error?: string
    }>
  }
}

export const bulkRepairTaskId = async (startDate: string, endDate: string) => {
  const response = await api.post<BulkRepairResponse>(
    '/task-id/bulk-repair',
    {
      startDate,
      endDate,
    },
  )

  return response.data
}

export type WeeklyStatsData = {
  date: string
  day: string
  selesai: number
  belum_terkirim: number
}

export type WeeklyStatsResponse = {
  success: boolean
  data: WeeklyStatsData[]
  summary: {
    total_selesai: number
    total_belum_terkirim: number
    total_keseluruhan: number
  }
}

export const fetchWeeklyStats = async () => {
  const response = await api.get<WeeklyStatsResponse>('/task-id/stats/weekly')
  return response.data
}
