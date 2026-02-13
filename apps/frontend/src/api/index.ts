import axios from 'axios'
import { authService } from '@/services/auth'

const API = import.meta.env.VITE_API_BASE_URL

export const api = axios.create({
  baseURL: API,
})

api.interceptors.request.use((config) => {
  const token = authService.getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      authService.logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
