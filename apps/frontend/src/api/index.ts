import axios from 'axios'
import { authService } from '@/services/auth'

const API = import.meta.env.VITE_API_BASE_URL

export const api = axios.create({
  baseURL: API,
})

// Flag to prevent multiple refresh attempts
let isRefreshing = false
let failedQueue: Array<{ resolve: (value: any) => void; reject: (reason: any) => void }> = []

const processFailedQueue = (error: any) => {
  failedQueue.forEach(promise => {
    if (error) {
      promise.reject(error)
    } else {
      promise.resolve(undefined)
    }
  })
  failedQueue = []
}

api.interceptors.request.use(async (config) => {
  const token = authService.getToken()
  
  if (token) {
    // Check if token is expired and attempt refresh
    if (authService.isTokenExpired(token)) {
      if (!isRefreshing) {
        isRefreshing = true
        
        try {
          const refreshResult = await authService.refreshToken()
          
          if (refreshResult?.success) {
            authService.setToken(refreshResult.data.token)
            processFailedQueue(null)
          } else {
            // Refresh failed, logout user
            authService.logout()
            window.location.href = '/login'
            return Promise.reject(new Error('Token refresh failed'))
          }
        } catch (error) {
          processFailedQueue(error)
          authService.logout()
          window.location.href = '/login'
          return Promise.reject(error)
        } finally {
          isRefreshing = false
        }
      }
      
      // Wait for refresh to complete
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then(() => {
        // Retry original request with new token
        const newToken = authService.getToken()
        if (newToken) {
          config.headers.Authorization = `Bearer ${newToken}`
        }
        return config
      }).catch(err => {
        return Promise.reject(err)
      })
    }
    
    // Token is still valid
    config.headers.Authorization = `Bearer ${token}`
  }
  
  return config
}, (error) => {
  return Promise.reject(error)
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // Handle specific token expiration error
      const errorCode = error.response?.data?.code
      const errorMessage = error.response?.data?.message || 'Token expired'
      
      // Jika ini adalah request refresh token yang gagal, langsung logout
      if (originalRequest.url?.includes('/auth/refresh')) {
        authService.logout()
        
        // Show user-friendly notification
        if (errorCode === 'TOKEN_EXPIRED') {
          console.log('Session expired due to token expiration')
        }
        
        window.location.href = '/login?expired=true'
        return Promise.reject(error)
      }

      if (isRefreshing) {
        // Jika sedang refresh, tunggu sampai selesai
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(() => {
          return api(originalRequest)
        }).catch(err => {
          return Promise.reject(err)
        })
      }
      
      originalRequest._retry = true
      isRefreshing = true

      try {
        // Coba refresh token
        const refreshResult = await authService.refreshToken()
        
        if (refreshResult?.success) {
          // Token berhasil di-refresh
          authService.setToken(refreshResult.data.token)
          processFailedQueue(null)
          
          // Ulangi request asli dengan token baru
          return api(originalRequest)
        } else {
          // Refresh gagal, logout
          authService.logout()
          window.location.href = '/login?expired=true'
          return Promise.reject(error)
        }
      } catch (refreshError) {
        // Error saat refresh, logout
        processFailedQueue(refreshError)
        authService.logout()
        window.location.href = '/login?expired=true'
        return Promise.reject(error)
      } finally {
        isRefreshing = false
      }
    }

    // Handle other errors
    if (error.response?.status === 403) {
      // Permission denied - bisa ditambahkan notifikasi khusus
      console.error('Permission denied:', error.response.data.message)
    }

    return Promise.reject(error)
  }
)
