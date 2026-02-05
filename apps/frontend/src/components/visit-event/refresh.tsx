import { useValidateVisitEvent } from '@/hooks/visit-event'
import { useQueryClient } from '@tanstack/react-query'
import { AlertCircleIcon, CheckCheckIcon, RefreshCcwIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

export default function Refresh({ visit_id }: { visit_id: string }) {
  const QueryClient = useQueryClient()
  const { mutateAsync: mutateAsyncValidate, isPending: isValidatePending } =
    useValidateVisitEvent({
      onSuccess: () => {
        QueryClient.invalidateQueries({
          queryKey: ['visit-event'],
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

  const handleValidate = async () => {
    if (!visit_id) {
      toast.error('Error', {
        position: 'top-left',
        description: 'Data antrean tidak ditemukan',
        icon: <AlertCircleIcon className="h-4 w-4" />,
      })
      return
    }
    try {
      await mutateAsyncValidate(visit_id)
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
        onClick={handleValidate}
        disabled={isValidatePending}
      >
        <RefreshCcwIcon className="h-4 w-4" />
        <span>Validasi Ulang</span>
      </Button>
    </>
  )
}
