import { api } from '@/api'
import type { PaginationResponse } from '@/interface/response'
import type { PoliException } from '@/interface/poli-exception'

export const fetchPoliException = async () => {
  const response =
    await api.get<PaginationResponse<PoliException[]>>('poli/exception')

  return response.data
}
