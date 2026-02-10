import { Link } from '@tanstack/react-router'
import type {
  Category,
  EventTask,
  Flag,
  VisitEvent,
} from '@/interface/visit-event'
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
import { MoreHorizontalIcon } from 'lucide-react'
import Refresh from './refresh'
import Resend from './resend'
import PayloadTimeline from './payload-timeline'
import Syncron from './syncron'
import { VisitEventAutoHealth } from './autohealth'

export type VisitEventWithTasks = VisitEvent & {
  EventTasks: EventTask[]
  flags: Flag &
    {
      category: Category
    }[]
}

export const columns: ColumnDef<VisitEventWithTasks, unknown>[] = [
  {
    accessorKey: 'visit_id',
    header: 'Kode Booking',
    cell: ({ row }) => {
      const payload = row.original.EventTasks
      return (
        <div className="flex flex-col gap-2">
          <div className="flex flex-row gap-2 items-end">
            <Link
              to={`/dashboard/visit-event/view/$id`}
              params={{
                id: row.original.id,
              }}
              className="underline"
            >
              {row.original.visit_id}
            </Link>
            {row.original.flags && row.original.flags.length > 0 && (
              <div className="flex flex-row gap-2">
                {row.original.flags.map((flag) => (
                  <span
                    key={flag.category.id}
                    className="bg-gray-300 p-1 rounded-full text-xs text-gray-600 px-2"
                  >
                    {flag.category.name}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <PayloadTimeline payload={payload} />
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
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <VisitEventAutoHealth visit_id={row.original.visit_id} />
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Syncron visit_id={row.original.visit_id} />
                  </DropdownMenuItem>
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
