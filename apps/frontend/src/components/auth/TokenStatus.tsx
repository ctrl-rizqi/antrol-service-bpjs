import { useEffect, useState } from 'react'
import { RefreshCw, Clock, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { authService } from '@/services/auth'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { toast } from 'sonner'

const formatExpirationTime = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  } else {
    return `${seconds}s`
  }
}

export function TokenStatusBadge() {
  const { logout } = useAuth()
  const [status, setStatus] = useState<'valid' | 'expired' | 'expiring-soon'>(
    'valid',
  )
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const checkTokenStatus = (): 'valid' | 'expired' | 'expiring-soon' => {
    const token = authService.getToken()
    if (!token || authService.isTokenExpired(token)) {
      return 'expired'
    }

    if (authService.isTokenExpiringSoon(token, 300)) {
      return 'expiring-soon'
    }

    return 'valid'
  }

  const getTimeUntilExpiration = (): number => {
    const token = authService.getToken()
    if (!token) return 0

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const expiryTime = payload.exp * 1000
      const currentTime = Date.now()
      return Math.max(0, expiryTime - currentTime)
    } catch {
      return 0
    }
  }

  useEffect(() => {
    setStatus(checkTokenStatus())
    setTimeLeft(getTimeUntilExpiration())
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(checkTokenStatus())
      setTimeLeft(getTimeUntilExpiration())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleManualRefresh = async () => {
    setIsRefreshing(true)
    try {
      const result = await authService.refreshToken()
      if (result?.success) {
        authService.setToken(result.data.token)
        toast.success('Token refreshed successfully')
        setStatus('valid')
        setTimeLeft(getTimeUntilExpiration())
      } else {
        toast.error('Failed to refresh token')
        logout()
      }
    } catch (error) {
      toast.error('Token refresh failed')
      logout()
    } finally {
      setIsRefreshing(false)
    }
  }

  const getBadgeVariant = () => {
    switch (status) {
      case 'expired':
        return 'destructive'
      case 'expiring-soon':
        return 'secondary'
      default:
        return 'default'
    }
  }

  const getIcon = () => {
    switch (status) {
      case 'expired':
        return <AlertTriangle className="h-3 w-3" />
      case 'expiring-soon':
        return <Clock className="h-3 w-3" />
      default:
        return <Clock className="h-3 w-3" />
    }
  }

  if (status === 'expired') {
    return null // Don't show badge if expired (user should be redirected to login)
  }

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant={getBadgeVariant()} className="cursor-pointer">
              <div className="flex items-center gap-1">
                {getIcon()}
                <span className="text-xs">
                  {formatExpirationTime(timeLeft)}
                </span>
              </div>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {status === 'expiring-soon'
                ? 'Token will expire soon. Click refresh to extend session.'
                : 'Token is valid'}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {status === 'expiring-soon' && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="h-6 px-2"
        >
          <RefreshCw
            className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`}
          />
        </Button>
      )}
    </div>
  )
}

export function TokenExpirationWarning() {
  const [showWarning, setShowWarning] = useState(false)

  const checkTokenStatus = (): 'valid' | 'expired' | 'expiring-soon' => {
    const token = authService.getToken()
    if (!token || authService.isTokenExpired(token)) {
      return 'expired'
    }

    if (authService.isTokenExpiringSoon(token, 300)) {
      return 'expiring-soon'
    }

    return 'valid'
  }

  useEffect(() => {
    const status = checkTokenStatus()
    setShowWarning(status === 'expiring-soon')
  }, [])

  if (!showWarning) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <div>
            <p className="text-sm font-medium text-yellow-800">
              Session akan segera berakhir
            </p>
            <p className="text-xs text-yellow-600">
              Token anda akan kedaluarsa dalam beberapa menit. Simpan pekerjaan
              anda untuk menghindari kehilangan data.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
