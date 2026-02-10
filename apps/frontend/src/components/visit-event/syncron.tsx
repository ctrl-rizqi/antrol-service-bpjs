import { useSyncVisitEvent } from '@/hooks/visit-event'
import { useQueryClient } from '@tanstack/react-query'
import { AlertCircleIcon, CheckCheckIcon, CloudSync } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

export default function Syncron({ visit_id }: { visit_id: string }) {
  const QueryClient = useQueryClient()

  const { mutateAsync: mutateAsyncSync, isPending: isSyncPending } =
    useSyncVisitEvent({
      onSuccess: () => {
        QueryClient.invalidateQueries({
          queryKey: ['visit-event'],
        })
        toast.success('Singkronasi Ulang Berhasil', {
          position: 'top-left',
          description: 'Data antrean telah berhasil disinkronkan',
          icon: <CheckCheckIcon className="h-4 w-4" />,
        })
      },
      onError: (error) => {
        toast.error('Singkronasi Ulang Gagal', {
          description:
            error instanceof Error
              ? error.message
              : 'Terjadi kesalahan saat singkronasi ulang data antrean',
          icon: <AlertCircleIcon className="h-4 w-4" />,
        })
      },
    })

  const handleSync = async () => {
    if (!visit_id) {
      toast.error('Error', {
        position: 'top-left',
        description: 'Data antrean tidak ditemukan',
        icon: <AlertCircleIcon className="h-4 w-4" />,
      })
      return
    }
    try {
      await mutateAsyncSync(visit_id)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="justify-start p-0! w-full "
        onClick={handleSync}
        disabled={isSyncPending}
      >
        <CloudSync className="h-4 w-4" />
        <span>Singkronasi Ulang</span>
      </Button>
    </>
  )
}
