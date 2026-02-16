import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { formatExpirationTime } from '@/utils/token'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw, Clock, AlertTriangle } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { toast } from 'sonner'

export function TokenStatusBadge() {
  const { checkTokenStatus, timeUntilExpiration, refreshAuth } = useAuth()
  const [status, setStatus] = useState<'valid' | 'expired' | 'expiring-soon'>('valid')
  const [timeLeft, setTimeLeft] = useState(timeUntilExpiration)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    setStatus(checkTokenStatus())
    setTimeLeft(timeUntilExpiration)
  }, [timeUntilExpiration, checkTokenStatus])

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(checkTokenStatus())
      setTimeLeft(timeUntilExpiration)
    }, 1000)

    return () => clearInterval(interval)
  }, [timeUntilExpiration, checkTokenStatus])

  const handleManualRefresh = async () => {
    setIsRefreshing(true)
    try {
      const success = await refreshAuth()
      if (success) {
        toast.success('Token refreshed successfully')
      } else {
        toast.error('Failed to refresh token')
      }
    } catch (error) {
      toast.error('Token refresh failed')
    } finally {
      setIsRefreshing(false)
    }
  }

  const getBadgeVariant = () => {
    switch (status) {
      case 'expired':
        return 'destructive'
      case 'expiring-soon':
        return 'warning'
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
                : 'Token is valid'
              }
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
          <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      )}
    </div>
  )
}

export function TokenExpirationWarning() {
  const { checkTokenStatus } = useAuth()
  const [showWarning, setShowWarning] = useState(false)

  useEffect(() => {
    const status = checkTokenStatus()
    setShowWarning(status === 'expiring-soon')
  }, [checkTokenStatus])

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
              Token anda akan kedaluarsa dalam beberapa menit. Simpan pekerjaan anda untuk menghindari kehilangan data.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}