import { DataTable } from '@/components/data-table'
import Header from '@/components/Header'
import { createFileRoute } from '@tanstack/react-router'
import { columns } from '@/components/poli-exception/columns'
import { usePoliException } from '@/hooks/poli-exception'
import type { PoliException } from '@/interface/poli-exception'

export const Route = createFileRoute('/dashboard/poli-exception/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data } = usePoliException()

  return (
    <>
      <Header
        breadcrumb={[
          {
            title: 'Daftar pengecualian Poli',
            url: '/dashboard/poli-exception',
          },
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <DataTable
          columns={columns}
          data={(data?.data || []) as PoliException[]}
        />
      </div>
    </>
  )
}
