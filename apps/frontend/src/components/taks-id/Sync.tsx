import { Button } from '@/components/ui/button'
import { useSyncVisitEvent } from '@/hooks/task-id'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { AlertCircleIcon } from 'lucide-react'

export function Sync({ visit_id }: { visit_id: string }) {
  const QueryClient = useQueryClient()

  const { mutateAsync, isPending } = useSyncVisitEvent({
    onSuccess: () => {
      QueryClient.invalidateQueries({ queryKey: ['task-id'] })
      toast.success('Singkronasi Berhasil', {
        position: 'top-left',
        description: 'Data antrean telah berhasil disinkronkan',
      })
    },
    onError: (error) => {
      console.error(error)
      toast.error('Singkronasi Gagal', {
        description:
          error instanceof Error
            ? error.message
            : 'Terjadi kesalahan saat singkronasi data antrean',
      })
    },
  })

  const handleSync = async () => {
    try {
      if (!visit_id) {
        toast.error('Error', {
          position: 'top-left',
          description: 'Data antrean tidak ditemukan',
          icon: <AlertCircleIcon className="h-4 w-4" />,
        })
        return
      }
      await mutateAsync(visit_id)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <>
      <Button size="sm" onClick={handleSync} disabled={isPending}>
        Singkronasi
      </Button>
    </>
  )
}
