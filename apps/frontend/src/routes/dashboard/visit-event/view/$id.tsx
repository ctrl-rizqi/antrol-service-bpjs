import Header from '@/components/Header'
import { Timeline, type TimelineProps } from '@/components/timeline'
import { Button } from '@/components/ui/button'
import {
  useResendVisitEvent,
  useValidateVisitEvent,
  useVisitEventTasks,
} from '@/hooks/visit-event'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { useSyncVisitEvent } from '@/hooks/visit-event'
import { useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  AlertCircleIcon,
  CheckCheckIcon,
  Loader2Icon,
} from 'lucide-react'

export const Route = createFileRoute('/dashboard/visit-event/view/$id')({
  beforeLoad: () => {
    const userStr = localStorage.getItem('auth_user')
    if (!userStr) {
      throw redirect({ to: '/login' })
    }
    const user = JSON.parse(userStr)
    const hasPermission = user.role === 'admin' || 
      user.permissions?.includes('poli:access') || 
      user.permissions?.includes('*')
    if (!hasPermission) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const QueryClient = useQueryClient()
  const { id } = Route.useParams()
  const { data, isLoading, isError, error, refetch } = useVisitEventTasks(id)

  const { mutateAsync, isPending: isSyncPending } = useSyncVisitEvent({
    onSuccess: (data) => {
      // Invalidate query untuk refetch data terbaru
      QueryClient.invalidateQueries({
        queryKey: ['visit-event-tasks', id],
      })

      // Success toast
      if (data?.data?.length === 0) {
        toast.success('Sinkronisasi Berhasil', {
          position: 'top-left',
          description: 'Data belum memiliki antrean',
          icon: <CheckCheckIcon className="h-4 w-4" />,
        })
      } else {
        toast.success('Sinkronisasi Berhasil', {
          position: 'top-left',
          description: 'Data antrean telah berhasil disinkronkan',
          icon: <CheckCheckIcon className="h-4 w-4" />,
        })
      }
    },
    onError: (error) => {
      toast.error('Sinkronisasi Gagal', {
        description:
          error instanceof Error
            ? error.message
            : 'Terjadi kesalahan saat sinkronisasi data antrean',
        icon: <AlertCircleIcon className="h-4 w-4" />,
      })
    },
  })

  const { mutateAsync: mutateAsyncValidate, isPending: isValidatePending } =
    useValidateVisitEvent({
      onSuccess: () => {
        QueryClient.invalidateQueries({
          queryKey: ['visit-event-tasks', 'visit-event', id],
        })

        toast.success('Validasi Ulang Berhasil', {
          position: 'top-left',
          description: 'Data antrean telah berhasil diverifikasi',
          icon: <CheckCheckIcon className="h-4 w-4" />,
        })
      },
      onError: (error) => {
        toast.error('Validasi Ulang Gagal', {
          description:
            error instanceof Error
              ? error.message
              : 'Terjadi kesalahan saat validasi ulang data antrean',
          icon: <AlertCircleIcon className="h-4 w-4" />,
        })
      },
    })

  const { mutateAsync: mutateAsyncResend, isPending: isResendPending } =
    useResendVisitEvent({
      onSuccess: () => {
        QueryClient.invalidateQueries({
          queryKey: ['visit-event-tasks', id],
        })
        toast.success('Resend Berhasil', {
          position: 'top-left',
          description: 'Data antrean telah berhasil dikirim ulang',
          icon: <CheckCheckIcon className="h-4 w-4" />,
        })
      },
      onError: (error) => {
        toast.error('Resend Gagal', {
          description:
            error instanceof Error
              ? error.message
              : 'Terjadi kesalahan saat resend data antrean',
          icon: <AlertCircleIcon className="h-4 w-4" />,
        })
      },
    })

  const handleSync = async () => {
    if (!data?.data.visit_id) {
      toast.error('Error', {
        position: 'top-left',
        description: 'Data antrean tidak ditemukan',
        icon: <AlertCircleIcon className="h-4 w-4" />,
      })
      return
    }
    try {
      await mutateAsync(data?.data.visit_id)
    } catch (error) {
      console.error(error)
    }
  }

  const handleValidate = async () => {
    if (!data?.data.visit_id) {
      toast.error('Error', {
        position: 'top-left',
        description: 'Data antrean tidak ditemukan',
        icon: <AlertCircleIcon className="h-4 w-4" />,
      })
      return
    }
    try {
      await mutateAsyncValidate(data?.data.visit_id)
    } catch (error) {
      console.error(error)
    }
  }

  const handleResend = async () => {
    if (!data?.data.visit_id) {
      toast.error('Error', {
        position: 'top-left',
        description: 'Data antrean tidak ditemukan',
        icon: <AlertCircleIcon className="h-4 w-4" />,
      })
      return
    }
    try {
      await mutateAsyncResend(data?.data.visit_id)
    } catch (error) {
      console.error(error)
    }
  }

  if (isLoading) {
    return (
      <>
        <Header
          breadcrumb={[
            {
              title: 'Daftar Antrol',
              url: '/dashboard/visit-event',
            },
            {
              title: 'Detail Antrol',
              url: '/dashboard/visit-event/view/',
            },
          ]}
        />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <LoadingSkeleton />
        </div>
      </>
    )
  }

  // Error state
  if (isError) {
    return (
      <>
        <Header
          breadcrumb={[
            {
              title: 'Daftar Antrol',
              url: '/dashboard/visit-event',
            },
            {
              title: 'Detail Antrol',
              url: '/dashboard/visit-event/view/',
            },
          ]}
        />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error instanceof Error
                ? error.message
                : 'Gagal memuat data antrean. Silakan coba lagi.'}
            </AlertDescription>
          </Alert>
          <Button onClick={() => refetch()} variant="outline">
            Coba Lagi
          </Button>
        </div>
      </>
    )
  }

  // Empty state
  if (!data?.data) {
    return (
      <>
        <Header
          breadcrumb={[
            {
              title: 'Daftar Antrol',
              url: '/dashboard/visit-event',
            },
            {
              title: 'Detail Antrol',
              url: '/dashboard/visit-event/view/',
            },
          ]}
        />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Tidak Ada Data</AlertTitle>
            <AlertDescription>Data antrean tidak ditemukan</AlertDescription>
          </Alert>
        </div>
      </>
    )
  }

  return (
    <>
      <Header
        breadcrumb={[
          {
            title: 'Daftar Antrol',
            url: '/dashboard/visit-event',
          },
          {
            title: 'Detail Antrol',
            url: '/dashboard/visit-event/view/',
          },
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 ">
        <div className="mb-10">
          {isLoading ? (
            <div className="h-12 w-100 bg-slate-200 rounded-md animate-pulse"></div>
          ) : (
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 tracking-tight">
              Detail Antrean {data?.data.visit_id}
            </h1>
          )}

          <div className="mt-6 space-y-4">
            {/* Registration Info */}
            <div className="flex items-center justify-between py-3 border-b border-border">
              <span className="text-sm text-muted-foreground">
                Jam Registrasi
              </span>
              <span className="text-sm font-medium text-foreground">
                {new Date(data?.data.event_time || '').toLocaleTimeString()}
              </span>
            </div>

            {/* Sync Info */}
            <div className="flex items-center justify-between py-3 border-b border-border">
              <span className="text-sm text-muted-foreground">Sync date</span>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-foreground">
                  {data?.data.syncedAt ? (
                    format(new Date(data?.data.syncedAt || ''), 'dd MMMM yyyy')
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Belum di singkronisasikan
                    </span>
                  )}
                </span>
                <Button size="sm" onClick={handleSync} disabled={isSyncPending}>
                  {isSyncPending ? (
                    <>
                      <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    'Sync'
                  )}
                </Button>

                <Button
                  size="sm"
                  onClick={handleValidate}
                  disabled={isValidatePending}
                >
                  {isValidatePending ? (
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    'Validasi Ulang'
                  )}
                </Button>

                <Button
                  size="sm"
                  onClick={handleResend}
                  disabled={isResendPending}
                >
                  {isResendPending ? (
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    'Resend'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-base font-semibold text-foreground mb-8 tracking-tight">
            Timeline pengiriman antrean online
          </h2>

          {data?.data.EventTasks.map((event, index) => (
            <Timeline key={index} event={event as unknown as TimelineProps} />
          ))}
        </div>
      </div>
    </>
  )
}

// Component untuk loading skeleton
function LoadingSkeleton() {
  return (
    <>
      <div className="h-12 w-full bg-slate-200 rounded-md animate-pulse" />
      <div className="h-12 w-full bg-slate-200 rounded-md animate-pulse" />
      <div className="h-12 w-full bg-slate-200 rounded-md animate-pulse" />
      <div className="h-12 w-full bg-slate-200 rounded-md animate-pulse" />
    </>
  )
}
