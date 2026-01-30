import { api } from '@/api'
import type { PaginationResponse } from '@/interface/response'
import type { VisitEvent, EventTask } from '@/interface/visit-event'

export const fetchVisitEvent = async () => {
  const response =
    await api.get<
      PaginationResponse<VisitEvent & { EventTasks: EventTask[] }[]>
    >('/admin/visit-event')

  return response.data
}
