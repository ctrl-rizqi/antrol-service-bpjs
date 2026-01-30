import { fetchVisitEvent } from '@/services/visit-event'
import { useQuery } from '@tanstack/react-query'

export const useVisitEvent = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => fetchVisitEvent(),
    staleTime: 1000 * 60,
  })
}
