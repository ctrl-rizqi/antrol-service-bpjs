import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useBulkRepairTaskId } from '@/hooks/task-id'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { CalendarIcon, WrenchIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export function BulkRepairDialog() {
  const [open, setOpen] = useState(false)
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()

  const { mutateAsync, isPending } = useBulkRepairTaskId({
    onSuccess: (data) => {
      const result = data.data
      if (result.success) {
        toast.success(result.message, {
          description: `Total: ${result.data.totalProcessed}, Success: ${result.data.successCount}, Failed: ${result.data.failedCount}`,
          duration: 5000,
        })
        setOpen(false)
        setStartDate(undefined)
        setEndDate(undefined)
      } else {
        toast.error('Bulk repair failed', {
          description: result.message,
        })
      }
    },
    onError: (error) => {
      toast.error('Bulk repair error', {
        description: error.message,
      })
    },
  })

  const handleSubmit = async () => {
    if (!startDate || !endDate) {
      toast.error('Tanggal harus diisi')
      return
    }

    if (startDate > endDate) {
      toast.error('Tanggal mulai tidak boleh lebih besar dari tanggal selesai')
      return
    }

    const startDateStr = format(startDate, 'yyyy-MM-dd')
    const endDateStr = format(endDate, 'yyyy-MM-dd')

    await mutateAsync({ startDate: startDateStr, endDate: endDateStr })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <WrenchIcon className="mr-2 h-4 w-4" />
          Bulk Repair
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Bulk Repair Task ID</DialogTitle>
          <DialogDescription>
            Memangkas 3 proses (auto repair, validasi ulang, kirim ulang) menjadi 1 proses.
            Pilih range tanggal untuk memproses semua visit event dalam periode tersebut.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="start-date" className="text-sm font-medium">
              Tanggal Mulai
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !startDate && 'text-muted-foreground',
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, 'PPP') : <span>Pilih tanggal</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid gap-2">
            <label htmlFor="end-date" className="text-sm font-medium">
              Tanggal Selesai
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !endDate && 'text-muted-foreground',
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, 'PPP') : <span>Pilih tanggal</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? 'Memproses...' : 'Mulai Repair'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}