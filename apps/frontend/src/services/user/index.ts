import { api } from '@/api'
import type { User } from '@/services/auth'

export interface UsersResponse {
  success: boolean
  data: User[]
}

export interface UserResponse {
  success: boolean
  data: User
  message?: string
}

export const userService = {
  getUsers: async (): Promise<UsersResponse> => {
    const response = await api.get<UsersResponse>('/auth/users')
    return response.data
  },

  createUser: async (data: {
    username: string
    password: string
    name: string
    role?: string
    permissions?: string[]
  }): Promise<UserResponse> => {
    const response = await api.post<UserResponse>('/auth/users', data)
    return response.data
  },

  updateUser: async (
    id: string,
    data: {
      name?: string
      role?: string
      isActive?: boolean
      password?: string
    }
  ): Promise<UserResponse> => {
    const response = await api.put<UserResponse>(`/auth/users/${id}`, data)
    return response.data
  },

  updatePermissions: async (
    id: string,
    permissions: string[]
  ): Promise<UserResponse> => {
    const response = await api.put<UserResponse>(`/auth/users/${id}/permissions`, {
      permissions,
    })
    return response.data
  },

  deleteUser: async (id: string): Promise<UserResponse> => {
    const response = await api.delete<UserResponse>(`/auth/users/${id}`)
    return response.data
  },
}
