import { Badge } from '../ui/badge'
import type { EventTask, VisitEvent } from '@/interface/visit-event'
import { type ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  MoreHorizontalIcon,
  RefreshCcwIcon,
  SendHorizonalIcon,
} from 'lucide-react'
import { useValidateVisitEvent, useResendVisitEvent } from '@/hooks/visit-event'

export type VisitEventWithTasks = VisitEvent & { EventTasks: EventTask[] }

const Refresh = ({ visit_id }: { visit_id: string }) => {
  const { mutateAsync } = useValidateVisitEvent()

  const handleRefresh = async () => {
    try {
      await mutateAsync(visit_id)
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
        onClick={handleRefresh}
      >
        <RefreshCcwIcon className="h-4 w-4" />
        <span>Validasi Ulang</span>
      </Button>
    </>
  )
}

const Resend = ({ visit_id }: { visit_id: string }) => {
  const { mutateAsync } = useResendVisitEvent()

  const handleResend = async () => {
    try {
      await mutateAsync(visit_id)
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
      >
        <SendHorizonalIcon className="h-4 w-4" />
        <span>Resend</span>
      </Button>
    </>
  )
}

const statusColors = (item: EventTask) => {
  switch (item.status) {
    case 'SEND':
      return 'secondary'
    case 'FAILED':
      return 'destructive'
    default:
      return 'default'
  }
}

export const columns: ColumnDef<VisitEventWithTasks, unknown>[] = [
  {
    accessorKey: 'visit_id',
    header: 'Kode Booking',
    cell: ({ row }) => {
      const payload = row.original.EventTasks
      return (
        <div>
          <p className="underline">{row.original.visit_id}</p>
          <div className="flex flex-col gap-2 mt-2">
            {payload.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                {item.task_id === 0 ? (
                  <p>Registrasi</p>
                ) : (
                  <p>Task ID: {item.task_id}</p>
                )}
                <Badge variant={statusColors(item)} className="font-semibold">
                  {item.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'jam_registrasi',
    header: 'Jam Registrasi',
  },
  {
    accessorKey: 'tanggal',
    accessorFn: (row) =>
      new Date(row.event_time).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    header: 'Tanggal',
  },
  {
    accessorFn: (row) => row.poli_id,
    header: 'Poli',
    cell: ({ row }) => {
      const payload = JSON.parse(row.original.payload)

      return (
        <div>
          <p className="underline">{row.original.poli_id}</p>
          <p>
            {(payload.namapoli as string).length > 7
              ? `${payload.namapoli.slice(0, 15)}...`
              : payload.namapoli}
          </p>
        </div>
      )
    },
  },
  {
    accessorFn: (row) => row.dokter_id,
    header: 'Dokter',
    cell: ({ row }) => {
      const payload = JSON.parse(row.original.payload)
      return (
        <div>
          <p className="underline">{row.original.dokter_id}</p>
          <p>
            {(payload.namadokter as string).length > 7
              ? `${payload.namadokter.slice(0, 20)}...`
              : payload.namadokter}
          </p>
        </div>
      )
    },
  },
  {
    accessorKey: 'id',
    header: 'Action',
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <ButtonGroup>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <MoreHorizontalIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <Refresh visit_id={row.original.visit_id} />
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Resend visit_id={row.original.visit_id} />
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </ButtonGroup>
        </div>
      )
    },
  },
]
