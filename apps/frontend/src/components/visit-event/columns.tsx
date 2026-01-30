import { Badge } from '../ui/badge'
import type { EventTask, VisitEvent } from '@/interface/visit-event'
import { type ColumnDef } from '@tanstack/react-table'

export type VisitEventWithTasks = VisitEvent & { EventTasks: EventTask[] }

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
]
