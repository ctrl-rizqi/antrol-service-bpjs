import { api } from '@/api'
import type { PaginationResponse } from '@/interface/response'
import type {
  VisitEvent,
  EventTask,
  VisitEventLog,
  AutoHealthVisitEvent,
} from '@/interface/visit-event'

export const fetchVisitEvent = async (
  search?: string,
  page?: number,
  limit?: number,
  startDate?: string,
  endDate?: string,
) => {
  const response = await api.get<
    PaginationResponse<
      VisitEvent & { EventTasks: EventTask & { logs: VisitEventLog[] }[] }[]
    >
  >('/admin/visit-event', {
    params: { search, page, limit, startDate, endDate },
  })

  return response.data
}

export const fetchVisitEventTasks = async (id: string) => {
  const response = await api.get<
    PaginationResponse<
      VisitEvent & { EventTasks: EventTask & { logs: VisitEventLog[] }[] }
    >
  >(`/admin/visit-event/${id}/tasks`)

  return response.data
}

export const syncVisitEvent = async (kodebooking: string) => {
  const response = await api.post(`/admin/visit-event/sync`, { kodebooking })

  return response.data
}

export const autoHealthVisitEvent = async (visit_id: string) => {
  const response = await api.post<AutoHealthVisitEvent>(`/task-id/autorepair`, { visit_id })

  return response.data
}
