import { api } from '@/api'
import type {
  AutoHealthVisitEvent,
  EventTask,
  VisitEvent,
} from '@/interface/visit-event'
import {
  autoHealthVisitEvent,
  fetchVisitEvent,
  fetchVisitEventTasks,
  syncVisitEvent,
} from '@/services/visit-event'
import {
  useMutation,
  useQuery,
  type UseMutationOptions,
} from '@tanstack/react-query'
import { useEffect, useState } from 'react'

export const useVisitEvent = (
  search: string,
  page: number = 1,
  limit: number = 10,
  startDate?: string,
  endDate?: string,
) => {
  const [debouncedSearch, setDebouncedSearch] = useState(search)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search)
    }, 500)
    return () => clearTimeout(handler)
  }, [search])

  return useQuery({
    queryKey: ['visit-event', debouncedSearch, page, limit, startDate, endDate],
    queryFn: async () =>
      fetchVisitEvent(debouncedSearch, page, limit, startDate, endDate),
    staleTime: 1000 * 60 * 5,
  })
}

export const useVisitEventTasks = (id: string) => {
  return useQuery({
    queryKey: ['visit-event-tasks', id],
    queryFn: async () => fetchVisitEventTasks(id),
    staleTime: 1000 * 60,
  })
}

export const useValidateVisitEvent = (
  options?: UseMutationOptions<
    {
      data: VisitEvent & {
        EventTasks: EventTask[]
      }
    },
    Error,
    string
  >,
) => {
  return useMutation({
    mutationFn: (kodebooking: string) => {
      return api.post('/admin/visit-event/revalidate', { kodebooking })
    },
    ...options,
  })
}

export const useResendVisitEvent = (
  options?: UseMutationOptions<{ data: EventTask[] }, Error, string>,
) => {
  return useMutation({
    mutationFn: (kodebooking: string) => {
      return api.post('/admin/visit-event/resend', { kodebooking })
    },
    ...options,
  })
}

export const useSyncVisitEvent = (
  options?: UseMutationOptions<{ data: EventTask[] }, Error, string>,
) => {
  return useMutation({
    mutationFn: (kodebooking: string) => syncVisitEvent(kodebooking),
    ...options,
  })
}

export const useAutoHealthVisitEvent = (
  options?: UseMutationOptions<AutoHealthVisitEvent, Error, string>,
) => {
  return useMutation({
    mutationFn: (kodebooking: string) => autoHealthVisitEvent(kodebooking),
    ...options,
  })
}
