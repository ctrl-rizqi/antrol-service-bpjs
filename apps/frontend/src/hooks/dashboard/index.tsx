import { useQuery } from '@tanstack/react-query'
import type { UseQueryOptions } from '@tanstack/react-query'
import type { WeeklyStatsResponse } from '@antrol/shared'
import { api } from '@/api'

export const useWeeklyStats = (
  options?: Omit<UseQueryOptions<WeeklyStatsResponse>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: ['dashboard', 'stats', 'weekly'],
    queryFn: async () => {
      const response = await api.get<WeeklyStatsResponse>(
        '/task-id/stats/weekly',
      )
      return response.data
    },
    staleTime: 1000 * 60 * 5,
    ...options,
  })
}

export const useDailyStats = (
  tanggal?: string,
  options?: Omit<UseQueryOptions<WeeklyStatsResponse>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: ['dashboard', 'stats', 'daily', tanggal],
    queryFn: async () => {
      const response = await api.get<WeeklyStatsResponse>(
        '/task-id/stats/weekly',
        {
          params: { tanggal },
        },
      )
      return response.data
    },
    staleTime: 1000 * 60 * 5,
    ...options,
  })
}
