import { createFileRoute } from '@tanstack/react-router'
import Header from '@/components/Header'
import { DataTable } from '@/components/data-table'
import { columns, type Payment } from '@/components/dashboard/columns'
import { Input } from '@/components/ui/input'

export const Route = createFileRoute('/dashboard/visit-event/')({
  component: RouteComponent,
})

const data: Payment[] = [
  {
    id: '728ed52f',
    amount: 100,
    status: 'pending',
    email: 'm@example.com',
  },
]

function RouteComponent() {
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
        <DataTable columns={columns} data={data} />
      </div>
    </>
  )
}
