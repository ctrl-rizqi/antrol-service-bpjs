import { fetchPoliException } from '@/services/poli-exception'
import { useQuery } from '@tanstack/react-query'

export const usePoliException = () => {
  return useQuery({
    queryKey: ['poli-exception'],
    queryFn: async () => fetchPoliException(),
    staleTime: 1000 * 60,
  })
}
