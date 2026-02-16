export interface User {
  id: string
  name: string
  username: string
  role: string
  permissions: Array<string>
  isActive: boolean
}

export interface LoginResponse {
  success: boolean
  message: string
  data: {
    token: string
    user: User
  }
}

export interface RefreshTokenResponse {
  success: boolean
  message: string
  data: {
    token: string
  }
}

export interface MeResponse {
  success: boolean
  data: User
}

const AUTH_TOKEN_KEY = 'auth_token'
const AUTH_USER_KEY = 'auth_user'

export const authService = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const API = import.meta.env.VITE_API_BASE_URL
    const response = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })
    const data = await response.json()
    return data
  },

  refreshToken: async (): Promise<RefreshTokenResponse | null> => {
    const API = import.meta.env.VITE_API_BASE_URL
    const currentToken = authService.getToken()
    
    if (!currentToken) {
      return null
    }

    try {
      const response = await fetch(`${API}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`
        },
      })
      
      if (!response.ok) {
        return null
      }
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Token refresh failed:', error)
      return null
    }
  },

  logout: () => {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem(AUTH_USER_KEY)
  },

  getToken: (): string | null => {
    return localStorage.getItem(AUTH_TOKEN_KEY)
  },

  setToken: (token: string) => {
    localStorage.setItem(AUTH_TOKEN_KEY, token)
  },

  getUser: (): User | null => {
    const userStr = localStorage.getItem(AUTH_USER_KEY)
    if (!userStr) return null
    try {
      return JSON.parse(userStr)
    } catch {
      return null
    }
  },

  setUser: (user: User) => {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
  },

  isAuthenticated: (): boolean => {
    const token = authService.getToken()
    return !!token
  },

  isTokenExpired: (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Math.floor(Date.now() / 1000)
      return payload.exp < currentTime
    } catch (error) {
      return true
    }
  },

  isTokenExpiringSoon: (token: string, thresholdSeconds: number = 300): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Math.floor(Date.now() / 1000)
      const timeUntilExpiry = payload.exp - currentTime
      return timeUntilExpiry > 0 && timeUntilExpiry <= thresholdSeconds
    } catch (error) {
      return false
    }
  },

  validateToken: async (): Promise<boolean> => {
    const token = authService.getToken()
    if (!token) return false

    // Check if token is expired
    if (authService.isTokenExpired(token)) {
      console.log('Token expired, attempting refresh...')
      const refreshResult = await authService.refreshToken()
      
      if (refreshResult?.success) {
        authService.setToken(refreshResult.data.token)
        console.log('Token refreshed successfully')
        return true
      } else {
        console.log('Token refresh failed, logging out...')
        authService.logout()
        return false
      }
    }

    // Token is still valid
    return true
  },

  isAdmin: (): boolean => {
    const user = authService.getUser()
    return user?.role === 'admin'
  },

  hasPermission: (permission: string): boolean => {
    const user = authService.getUser()
    if (!user) return false
    if (user.role === 'admin') return true
    return (
      user.permissions.includes(permission) || user.permissions.includes('*')
    )
  },
}
