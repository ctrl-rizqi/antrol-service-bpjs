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
  const response = await api.post<syncVisitEventResponse>('/task-id/manual', {
    kodebooking,
  })

  return response.data
}
