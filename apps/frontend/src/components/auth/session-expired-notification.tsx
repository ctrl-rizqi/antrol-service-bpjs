import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Clock, X } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

export function SessionExpiredNotification() {
  const navigate = useNavigate()
  const [showNotification, setShowNotification] = useState(false)

  useEffect(() => {
    // Cek jika user datang dari redirect token expired
    const urlParams = new URLSearchParams(window.location.search)
    const expired = urlParams.get('expired')
    
    if (expired === 'true') {
      setShowNotification(true)
      // Hapus parameter dari URL
      window.history.replaceState({}, document.title, '/login')
    }
  }, [])

  const handleClose = () => {
    setShowNotification(false)
  }

  const handleReLogin = () => {
    setShowNotification(false)
    navigate({ to: '/login' })
  }

  if (!showNotification) return null

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <Alert className="border-orange-200 bg-orange-50">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <Clock className="h-5 w-5 text-orange-600 mt-0.5" />
            <div className="flex-1">
              <AlertTitle className="text-orange-900">
                Sesi Anda Telah Berakhir
              </AlertTitle>
              <AlertDescription className="text-orange-800 mt-1">
                Untuk keamanan Anda, sesi login telah berakhir. Silakan login kembali untuk melanjutkan.
              </AlertDescription>
              <div className="mt-3 flex space-x-2">
                <Button
                  size="sm"
                  onClick={handleReLogin}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Login Ulang
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleClose}
                  className="border-orange-300 text-orange-700 hover:bg-orange-100"
                >
                  Nanti
                </Button>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="p-1 h-6 w-6 text-orange-600 hover:text-orange-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Alert>
    </div>
  )
}