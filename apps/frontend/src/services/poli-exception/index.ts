import { api } from '@/api'
import type { PaginationResponse } from '@/interface/response'
import type { Poli, PoliException } from '@/interface/poli-exception'

export const fetchPoliException = async () => {
  const response =
    await api.get<PaginationResponse<PoliException[]>>('poli/exception')

  return response.data
}

export const fetchPoli = async () => {
  const response = await api.get<PaginationResponse<Poli[]>>('/poli/list')

  return response.data
}

export const createPoliException = async (data: {
  poli_id: { poli_id: string; poli_nama: string }[]
}) => {
  const response = await api.post('/poli/exception', data)

  return response.data
}
