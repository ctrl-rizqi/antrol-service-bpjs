export interface User {
  id: string
  name: string
  username: string
  role: string
  permissions: string[]
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

  logout: () => {
    //localStorage.removeItem(AUTH_TOKEN_KEY)
    //localStorage.removeItem(AUTH_USER_KEY)
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
