import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useAuth } from './use-auth'
import { authService } from '@/services/auth'

interface UseTokenExpirationOptions {
  warningThreshold?: number // minutes before expiry
  autoLogout?: boolean
  onTokenExpired?: () => void
}

export function useTokenExpiration(options: UseTokenExpirationOptions = {}) {
  const { warningThreshold = 10, autoLogout = true, onTokenExpired } = options
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [isTokenExpiring, setIsTokenExpiring] = useState(false)
  const [timeUntilExpiry, setTimeUntilExpiry] = useState<number | null>(null)

  useEffect(() => {
    let interval: NodeJS.Timeout

    const checkTokenStatus = () => {
      const token = authService.getToken()
      if (!token) {
        setIsTokenExpiring(false)
        setTimeUntilExpiry(null)
        return
      }

      // Check if token is expired
      if (authService.isTokenExpired(token)) {
        setIsTokenExpiring(false)
        setTimeUntilExpiry(0)

        if (autoLogout) {
          // Show user-friendly message
          toast('Sesi Telah Berakhir', {
            description:
              'Untuk keamanan, sesi Anda telah berakhir. Silakan login kembali.',

            duration: 5000,
          })

          // Execute callback if provided
          if (onTokenExpired) {
            onTokenExpired()
          } else {
            // Default behavior: logout and redirect
            logout()
            // navigate({ to: 'login?expired=true' })
            navigate({ to: '/login', params: { expired: true } })
          }
        }
        return
      }

      // Check time until expiry
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        const expiryTime = payload.exp * 1000
        const currentTime = Date.now()
        const timeRemaining = expiryTime - currentTime

        if (timeRemaining > 0) {
          setTimeUntilExpiry(timeRemaining)

          // Check if within warning threshold
          const warningTimeMs = warningThreshold * 60 * 1000
          if (timeRemaining <= warningTimeMs) {
            setIsTokenExpiring(true)

            // Show warning toast (only once)
            if (timeRemaining > warningTimeMs - 30000) {
              // Show within first 30 seconds of warning period
              toast('Sesi Akan Berakhir', {
                description: `Sesi Anda akan berakhir dalam ${Math.ceil(timeRemaining / 60000)} menit. Simpan pekerjaan Anda.`,

                duration: 4000,
              })
            }
          } else {
            setIsTokenExpiring(false)
          }
        }
      } catch (error) {
        console.error('Error checking token expiry:', error)
        setIsTokenExpiring(false)
        setTimeUntilExpiry(null)
      }
    }

    // Check immediately
    checkTokenStatus()

    // Set up interval to check every minute
    interval = setInterval(checkTokenStatus, 60000)

    return () => {
      clearInterval(interval)
    }
  }, [warningThreshold, autoLogout, logout, navigate, onTokenExpired])

  const formatTimeRemaining = (milliseconds: number): string => {
    const minutes = Math.ceil(milliseconds / (1000 * 60))
    if (minutes > 60) {
      const hours = Math.floor(minutes / 60)
      const remainingMinutes = minutes % 60
      return `${hours}j ${remainingMinutes}m`
    }
    return `${minutes} menit`
  }

  const extendSession = async (): Promise<boolean> => {
    try {
      const result = await authService.refreshToken()
      if (result?.success) {
        toast('Sesi Diperpanjang', {
          description: 'Sesi Anda telah berhasil diperpanjang.',

          duration: 3000,
        })
        return true
      } else {
        toast.error('Gagal Memperpanjang', {
          description: 'Tidak dapat memperpanjang sesi. Silakan login kembali.',

          duration: 4000,
        })
        return false
      }
    } catch (error) {
      console.error('Failed to extend session:', error)
      toast.error('Terjadi Kesalahan', {
        description: 'Terjadi kesalahan saat memperpanjang sesi.',

        duration: 4000,
      })
      return false
    }
  }

  return {
    isTokenExpiring,
    timeUntilExpiry,
    formatTimeRemaining,
    extendSession,
  }
}
