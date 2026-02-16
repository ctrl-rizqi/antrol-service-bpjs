import React, { createContext, useContext, useEffect, useState } from 'react'
import { authService } from '@/services/auth'
import type { User } from '@/services/auth'
import {
  isTokenExpired,
  getTimeUntilTokenExpires,
  willTokenExpireSoon,
} from '@/utils/token'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  refreshAuth: () => Promise<boolean>
  checkTokenStatus: () => 'valid' | 'expired' | 'expiring-soon'
  timeUntilExpiration: number
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeUntilExpiration, setTimeUntilExpiration] = useState(0)

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      const token = authService.getToken()
      const userData = authService.getUser()

      if (token && userData) {
        if (isTokenExpired(token)) {
          // Token expired, attempt refresh
          const refreshed = await refreshAuth()
          if (!refreshed) {
            // Refresh failed, logout
            logout()
          }
        } else {
          // Token valid, set user
          setUser(userData)
          setTimeUntilExpiration(getTimeUntilTokenExpires(token))
        }
      }
      setIsLoading(false)
    }

    initializeAuth()
  }, [])

  // Monitor token expiration
  useEffect(() => {
    if (!user) return

    const token = authService.getToken()
    if (!token) return

    const interval = setInterval(() => {
      const timeLeft = getTimeUntilTokenExpires(token)
      setTimeUntilExpiration(timeLeft)

      // Auto refresh when token is about to expire (5 minutes before)
      if (willTokenExpireSoon(token, 300) && timeLeft > 0) {
        refreshAuth()
      }

      // Logout when token is expired
      if (timeLeft <= 0) {
        logout()
      }
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [user])

  const login = async (username: string, password: string) => {
    try {
      const response = await authService.login(username, password)

      if (response.success) {
        authService.setToken(response.data.token)
        authService.setUser(response.data.user)
        setUser(response.data.user)
        setTimeUntilExpiration(getTimeUntilTokenExpires(response.data.token))
      } else {
        throw new Error(response.message)
      }
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
    setTimeUntilExpiration(0)
    window.location.href = '/login'
  }

  const refreshAuth = async (): Promise<boolean> => {
    try {
      const response = await authService.refreshToken()

      if (response?.success) {
        authService.setToken(response.data.token)
        setTimeUntilExpiration(getTimeUntilTokenExpires(response.data.token))
        return true
      }
      return false
    } catch (error) {
      console.error('Auth refresh failed:', error)
      return false
    }
  }

  const checkTokenStatus = (): 'valid' | 'expired' | 'expiring-soon' => {
    const token = authService.getToken()
    if (!token || isTokenExpired(token)) {
      return 'expired'
    }

    if (willTokenExpireSoon(token, 300)) {
      return 'expiring-soon'
    }

    return 'valid'
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshAuth,
    checkTokenStatus,
    timeUntilExpiration,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
