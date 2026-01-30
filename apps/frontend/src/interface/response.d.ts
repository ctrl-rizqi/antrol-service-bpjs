export type Response<T> = {
  status: number
  message: string
  data: T
}

export type PaginationResponse<T> = {
  status: boolean
  data: T
  meta: {
    total: number
    limit: number
    page: number
    totalPages: number
    prevPage: number | null
    nextPage: number | null
  }
}
