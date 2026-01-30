import { createFileRoute } from '@tanstack/react-router'
import Header from '@/components/Header'
import { DataTable } from '@/components/data-table'
import {
  columns,
  type VisitEventWithTasks,
} from '@/components/visit-event/columns'
import { Input } from '@/components/ui/input'
import { useVisitEvent } from '@/hooks/visit-event'

export const Route = createFileRoute('/dashboard/visit-event/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data } = useVisitEvent()

  return (
    <>
      <Header
        breadcrumb={[
          {
            title: 'Daftar Antrol',
            url: '/dashboard/visit-event',
          },
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center">
          <Input placeholder="Cari kodebooking" className="max-w-xs" />
        </div>
        <DataTable
          columns={columns}
          data={(data?.data || []) as VisitEventWithTasks[]}
        />
      </div>
    </>
  )
}
