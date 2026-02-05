import { SendHorizonalIcon } from 'lucide-react'
import { useResendVisitEvent } from '@/hooks/visit-event'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { AlertCircleIcon, CheckCheckIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Resend({ visit_id }: { visit_id: string }) {
  const QueryClient = useQueryClient()

  const { mutateAsync: mutateAsyncResend, isPending: isResendPending } =
    useResendVisitEvent({
      onSuccess: () => {
        QueryClient.invalidateQueries({
          queryKey: ['visit-event'],
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

  const handleResend = async () => {
    if (!visit_id) {
      toast.error('Error', {
        position: 'top-left',
        description: 'Data antrean tidak ditemukan',
        icon: <AlertCircleIcon className="h-4 w-4" />,
      })
      return
    }
    try {
      await mutateAsyncResend(visit_id)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="justify-start p-0!"
        onClick={handleResend}
        disabled={isResendPending}
      >
        <SendHorizonalIcon className="h-4 w-4" />
        <span>Resend</span>
      </Button>
    </>
  )
}
