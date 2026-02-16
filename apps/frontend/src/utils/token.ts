/**
 * Token validation and management utilities
 */

export interface TokenPayload {
  id: string
  username: string
  role: string
  permissions: string[]
  iat: number
  exp: number
}

/**
 * Decode JWT token payload
 */
export function decodeToken(token: string): TokenPayload | null {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        })
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    return null
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = decodeToken(token)
    if (!payload) return true
    
    const currentTime = Math.floor(Date.now() / 1000)
    return payload.exp < currentTime
  } catch (error) {
    return true
  }
}

/**
 * Get token expiration time
 */
export function getTokenExpirationTime(token: string): number | null {
  try {
    const payload = decodeToken(token)
    return payload?.exp || null
  } catch (error) {
    return null
  }
}

/**
 * Get time until token expires (in seconds)
 */
export function getTimeUntilTokenExpires(token: string): number {
  try {
    const payload = decodeToken(token)
    if (!payload) return 0
    
    const currentTime = Math.floor(Date.now() / 1000)
    return Math.max(0, payload.exp - currentTime)
  } catch (error) {
    return 0
  }
}

/**
 * Check if token will expire soon (within threshold)
 */
export function willTokenExpireSoon(token: string, thresholdSeconds: number = 300): boolean {
  const timeUntilExpires = getTimeUntilTokenExpires(token)
  return timeUntilExpires > 0 && timeUntilExpires <= thresholdSeconds
}

/**
 * Format expiration time to human readable string
 */
export function formatExpirationTime(expiresInSeconds: number): string {
  if (expiresInSeconds <= 0) {
    return 'Expired'
  }
  
  const hours = Math.floor(expiresInSeconds / 3600)
  const minutes = Math.floor((expiresInSeconds % 3600) / 60)
  const seconds = expiresInSeconds % 60
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  } else {
    return `${seconds}s`
  }
}