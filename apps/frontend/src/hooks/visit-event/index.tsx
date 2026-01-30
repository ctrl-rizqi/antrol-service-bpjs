import { api } from '@/api'
import { fetchVisitEvent, fetchVisitEventTasks } from '@/services/visit-event'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export const useVisitEvent = (
  search: string,
  page: number = 1,
  limit: number = 10,
  startDate?: string,
  endDate?: string,
) => {
  return useQuery({
    queryKey: ['visit-event', search, page, limit, startDate, endDate],
    queryFn: async () =>
      fetchVisitEvent(search, page, limit, startDate, endDate),
    staleTime: 1000 * 60,
  })
}

export const useVisitEventTasks = (id: string) => {
  return useQuery({
    queryKey: ['visit-event-tasks', id],
    queryFn: async () => fetchVisitEventTasks(id),
    staleTime: 1000 * 60,
  })
}

export const useValidateVisitEvent = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (kodebooking: string) => {
      return api.post('/admin/visit-event/revalidate', { kodebooking })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['visit-event'],
      })
    },
  })
}

export const useResendVisitEvent = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (kodebooking: string) => {
      return api.post('/admin/visit-event/resend', { kodebooking })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['visit-event'],
      })
    },
  })
}
