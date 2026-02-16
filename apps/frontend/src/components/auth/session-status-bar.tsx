import { useEffect, useState } from 'react'
import { Clock, LogOut, RefreshCw } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { authService } from '@/services/auth'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface SessionStatusBarProps {
  className?: string
}

export function SessionStatusBar({ className = '' }: SessionStatusBarProps) {
  const { logout } = useAuth()
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    const checkTokenExpiry = () => {
      const token = authService.getToken()
      if (!token) {
        setTimeRemaining(null)
        return
      }

      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        const expiryTime = payload.exp * 1000
        const currentTime = Date.now()
        const timeUntilExpiry = expiryTime - currentTime

        if (timeUntilExpiry > 0) {
          setTimeRemaining(timeUntilExpiry)
        } else {
          setTimeRemaining(0)
        }
      } catch (error) {
        console.error('Error checking token expiry:', error)
        setTimeRemaining(null)
      }
    }

    // Check immediately
    checkTokenExpiry()

    // Set up interval to check every 30 seconds
    const interval = setInterval(checkTokenExpiry, 30000)

    return () => clearInterval(interval)
  }, [])

  const formatTimeRemaining = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    } else {
      return `${seconds}s`
    }
  }

  const getTimeColor = (milliseconds: number): string => {
    const minutes = milliseconds / (1000 * 60)
    if (minutes <= 5) return 'text-red-600'
    if (minutes <= 15) return 'text-yellow-600'
    return 'text-green-600'
  }

  const handleRefreshToken = async () => {
    setIsRefreshing(true)
    try {
      const result = await authService.refreshToken()
      if (result?.success) {
        // Token refreshed successfully
        console.log('Token refreshed successfully')
      } else {
        // Refresh failed, logout
        logout()
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
      logout()
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleLogout = () => {
    logout()
  }

  if (timeRemaining === null) {
    return null
  }

  const isExpiringSoon = timeRemaining <= 5 * 60 * 1000 // 5 minutes

  return (
    <div
      className={`flex items-center space-x-2 bg-white rounded-lg shadow-sm border px-3 py-2 ${className}`}
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center space-x-2">
              <Clock className={`h-4 w-4 ${getTimeColor(timeRemaining)}`} />
              <span
                className={`text-sm font-medium ${getTimeColor(timeRemaining)}`}
              >
                {formatTimeRemaining(timeRemaining)}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Sisa waktu sesi Anda</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {isExpiringSoon && (
        <>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleRefreshToken}
                  disabled={isRefreshing}
                  className="h-6 px-2"
                >
                  <RefreshCw
                    className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Perpanjang sesi</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleLogout}
                  className="h-6 px-2 text-red-600 hover:text-red-700"
                >
                  <LogOut className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Logout</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </>
      )}
    </div>
  )
}
