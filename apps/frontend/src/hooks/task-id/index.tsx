import { useEffect, useState } from 'react'
import {
  fetchTaskIdRegistration,
  syncTaskIdRegistration,
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
