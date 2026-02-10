import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { useAutoHealthVisitEvent } from '@/hooks/visit-event'
import { toast } from 'sonner'
import { AlertCircleIcon, CheckCheckIcon } from 'lucide-react'

export function VisitEventAutoHealth({ visit_id }: { visit_id: string }) {
  const QueryClient = useQueryClient()

  const { mutateAsync: mutateAsyncAutoHealth, isPending: isAutoHealthPending } =
    useAutoHealthVisitEvent({
      onSuccess: () => {
        QueryClient.invalidateQueries({ queryKey: ['visit-event'] })
        toast.success('Auto Health Berhasil', {
          position: 'top-left',
          description: 'Data antrean telah berhasil dikirim ulang',
          icon: <CheckCheckIcon className="h-4 w-4" />,
        })
      },
      onError: (error) => {
        toast.error('Auto Health Gagal', {
          description:
            error instanceof Error
              ? error.message
              : 'Terjadi kesalahan saat auto health data antrean',
          icon: <AlertCircleIcon className="h-4 w-4" />,
        })
      },
    })

  const handleAutoHealth = async () => {
    if (!visit_id) {
      toast.error('Error', {
        position: 'top-left',
        description: 'Data antrean tidak ditemukan',
        icon: <AlertCircleIcon className="h-4 w-4" />,
      })
      return
    }
    try {
      await mutateAsyncAutoHealth(visit_id)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="justify-start p-0! w-full"
        onClick={handleAutoHealth}
        disabled={isAutoHealthPending}
      >
        <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
        <span>Auto Health</span>
      </Button>
    </>
  )
}
