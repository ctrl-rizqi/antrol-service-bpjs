import { DataTable } from '@/components/data-table'
import Header from '@/components/Header'
import { columns } from '@/components/taks-id/columns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSyncTaskId, useTaskId } from '@/hooks/task-id'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { useState } from 'react'
import { format } from 'date-fns'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CalendarIcon } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { useQueryClient } from '@tanstack/react-query'

export const Route = createFileRoute('/dashboard/task-id/')({
  beforeLoad: () => {
    const userStr = localStorage.getItem('auth_user')
    if (!userStr) {
      throw redirect({ to: '/login' })
    }
    const user = JSON.parse(userStr)
    const hasPermission = user.role === 'admin' || 
      user.permissions?.includes('task-id:access') || 
      user.permissions?.includes('*')
    if (!hasPermission) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [search, setSearch] = useState<string>('')
  const [page, setPage] = useState<number>(1)
  const [col, setCol] = useState<number>(10)
  const { data } = useTaskId(
    search,
    page,
    col,
    date ? format(date, 'yyyy-MM-dd') : new Date().toISOString().split('T')[0],
  )
  const QueryClient = useQueryClient()

  const { mutateAsync, isPending } = useSyncTaskId({
    onSuccess: () => {
      QueryClient.invalidateQueries({ queryKey: ['task-id'] })
    },
  })

  // handleSubmit
  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      await mutateAsync(
        date
          ? format(date, 'yyyy-MM-dd')
          : new Date().toISOString().split('T')[0],
      )
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <>
      <Header
        breadcrumb={[
          {
            title: 'Daftar Registrasi',
            url: '/dashboard/task-id',
          },
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center gap-3 flex-wrap">
          <Input
            placeholder="Cari berdasarkan kode booking"
            className="max-w-xs"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button>
                <CalendarIcon className="h-5 w-5" />
                {date ? format(date, 'LLL dd, y') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={date} onSelect={setDate} />
            </PopoverContent>
          </Popover>
          <form onSubmit={handleSubmit} className="flex-1">
            <Button type="submit" disabled={isPending}>
              Singkronasi
            </Button>
          </form>
        </div>
        <DataTable columns={columns} data={data?.data || []} />
        <div className="flex-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="mt-4">
                {col} per halaman
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {[10, 25, 50].map((pageSize) => (
                <DropdownMenuItem
                  key={pageSize}
                  onClick={() => {
                    setCol(pageSize)
                  }}
                >
                  {pageSize}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className={
                    !data?.meta?.prevPage
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                />
              </PaginationItem>
              <PaginationItem>
                <span className="px-4 text-sm">
                  Page {data?.meta?.page ?? 1} of {data?.meta?.totalPages ?? 1}
                </span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setPage((p) => (data?.meta?.nextPage ? p + 1 : p))
                  }
                  className={
                    !data?.meta?.nextPage
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </>
  )
}
