import { api } from '@/api'

export const fetchVisitEvent = async () => {
  const response = await api.get('admin/visit-event')

  return response.data
}
