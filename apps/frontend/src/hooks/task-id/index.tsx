import { useEffect, useState } from 'react'
import {
  fetchTaskIdRegistration,
  syncTaskIdRegistration,
  syncVisitEvent,
  type syncVisitEventResponse,
  bulkRepairTaskId,
  type BulkRepairResponse,
} from '@/services/task-id'
import {
  useMutation,
  useQuery,
  type UseMutationOptions,
} from '@tanstack/react-query'

export const useTaskId = (
  search: string,
  page: number = 1,
  limit: number = 10,
  tanggal?: string,
) => {
  const [debouncedSearch, setDebouncedSearch] = useState<string>(search)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search)
    }, 500)
    return () => clearTimeout(handler)
  }, [search])

  return useQuery({
    queryKey: ['task-id', debouncedSearch, page, limit, tanggal],
    queryFn: async () =>
      fetchTaskIdRegistration(debouncedSearch, page, limit, tanggal),
    staleTime: 1000 * 60 * 5,
  })
}

export const useSyncTaskId = (
  options?: UseMutationOptions<
    { data: { success: boolean; message: string } },
    Error,
    string
  >,
) => {
  return useMutation({
    mutationFn: async (tanggal: string) => {
      const result = await syncTaskIdRegistration(tanggal)
      return { data: result }
    },
    ...options,
  })
}

export const useSyncVisitEvent = (
  options?: UseMutationOptions<
    {
      data: syncVisitEventResponse
    },
    Error,
    string
  >,
) => {
  return useMutation({
    mutationFn: async (kodebooking: string) => {
      const result = await syncVisitEvent(kodebooking)
      return { data: result }
    },
    ...options,
  })
}

export const useBulkRepairTaskId = (
  options?: UseMutationOptions<
    {
      data: BulkRepairResponse
    },
    Error,
    { startDate: string; endDate: string }
  >,
) => {
  return useMutation({
    mutationFn: async ({ startDate, endDate }: { startDate: string; endDate: string }) => {
      const result = await bulkRepairTaskId(startDate, endDate)
      return { data: result }
    },
    ...options,
  })
}
