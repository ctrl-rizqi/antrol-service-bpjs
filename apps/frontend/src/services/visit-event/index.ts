import { api } from '@/api'
import type { PaginationResponse } from '@/interface/response'
import type { VisitEvent, EventTask } from '@/interface/visit-event'

export const fetchVisitEvent = async (
  search?: string,
  page?: number,
  limit?: number,
  startDate?: string,
  endDate?: string,
) => {
  const response = await api.get<
    PaginationResponse<VisitEvent & { EventTasks: EventTask[] }[]>
  >('/admin/visit-event', {
    params: { search, page, limit, startDate, endDate },
  })

  return response.data
}

export const fetchVisitEventTasks = async (id: string) => {
  const response = await api.get<
    PaginationResponse<VisitEvent & { EventTasks: EventTask[] }>
  >(`/admin/visit-event/${id}/tasks`)

  return response.data
}
