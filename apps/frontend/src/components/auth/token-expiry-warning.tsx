import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { authService } from '@/services/auth'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

interface TokenExpiryWarningProps {
  warningThreshold?: number // minutes before expiry to show warning
  onExtendSession?: () => void
}

export function TokenExpiryWarning({ 
  warningThreshold = 5,
  onExtendSession 
}: TokenExpiryWarningProps) {
  const { logout } = useAuth()
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [showWarning, setShowWarning] = useState(false)

  useEffect(() => {
    const checkTokenExpiry = () => {
      const token = authService.getToken()
      if (!token) return

      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        const expiryTime = payload.exp * 1000 // Convert to milliseconds
        const currentTime = Date.now()
        const timeUntilExpiry = expiryTime - currentTime

        if (timeUntilExpiry > 0) {
          setTimeRemaining(timeUntilExpiry)
          
          // Show warning if within threshold
          const warningTime = warningThreshold * 60 * 1000 // Convert minutes to milliseconds
          if (timeUntilExpiry <= warningTime) {
            setShowWarning(true)
          }
        } else {
          // Token already expired
          setTimeRemaining(0)
          setShowWarning(false)
        }
      } catch (error) {
        console.error('Error checking token expiry:', error)
        setTimeRemaining(null)
        setShowWarning(false)
      }
    }

    // Check immediately
    checkTokenExpiry()

    // Set up interval to check every 30 seconds
    const interval = setInterval(checkTokenExpiry, 30000)

    return () => clearInterval(interval)
  }, [warningThreshold])

  const formatTimeRemaining = (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / (1000 * 60))
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000)
    
    if (minutes > 0) {
      return `${minutes} menit ${seconds} detik`
    } else {
      return `${seconds} detik`
    }
  }

  const handleExtendSession = () => {
    if (onExtendSession) {
      onExtendSession()
    } else {
      // Default behavior: refresh token
      authService.refreshToken().then(result => {
        if (result?.success) {
          setShowWarning(false)
          // Show success feedback
          console.log('Session extended successfully')
        }
      }).catch(error => {
        console.error('Failed to extend session:', error)
        // If refresh fails, logout
        logout()
      })
    }
  }

  const handleLogout = () => {
    logout()
  }

  if (!showWarning || timeRemaining === null) {
    return null
  }

  if (timeRemaining <= 0) {
    // Auto logout if token is expired
    setTimeout(() => {
      logout()
    }, 1000)
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <Alert className="border-yellow-200 bg-yellow-50">
        <div className="flex items-start space-x-3">
          <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div className="flex-1">
            <AlertDescription className="text-yellow-800">
              <p className="font-medium mb-2">Sesi Anda Akan Berakhir</p>
              <p className="text-sm mb-3">
                Waktu tersisa: <span className="font-mono font-bold">{formatTimeRemaining(timeRemaining)}</span>
              </p>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={handleExtendSession}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  Perpanjang Sesi
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleLogout}
                  className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                >
                  Logout
                </Button>
              </div>
            </AlertDescription>
          </div>
        </div>
      </Alert>
    </div>
  )
}