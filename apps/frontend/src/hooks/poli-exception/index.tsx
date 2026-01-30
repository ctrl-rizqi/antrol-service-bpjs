import {
  fetchPoliException,
  fetchPoli,
  createPoliException,
} from '@/services/poli-exception'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export const usePoliException = () => {
  return useQuery({
    queryKey: ['poli-exception'],
    queryFn: async () => fetchPoliException(),
    staleTime: 1000 * 60,
  })
}

export const usePoli = () => {
  return useQuery({
    queryKey: ['poli'],
    queryFn: async () => fetchPoli(),
    staleTime: 1000 * 60,
  })
}

// handle submit
export const usePoliExceptionSubmit = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { poli_id: { poli_id: string; poli_nama: string }[] }) =>
      createPoliException(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['poli-exception'] })
    },
  })
}

// handle hapus
export const usePoliExceptionDelete = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => {
      return fetch(`/poli/delete/${id}`, {
        method: 'DELETE',
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['poli-exception'] })
    },
  })
}
