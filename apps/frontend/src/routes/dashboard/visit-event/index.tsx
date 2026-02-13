import { createFileRoute, redirect } from '@tanstack/react-router'
import Header from '@/components/Header'
import { DataTable } from '@/components/data-table'
import {
  columns,
  type VisitEventWithTasks,
} from '@/components/visit-event/columns'
import { Input } from '@/components/ui/input'
import { useVisitEvent } from '@/hooks/visit-event'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { CalendarIcon } from 'lucide-react'
import { type DateRange } from 'react-day-picker'
import { format } from 'date-fns'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export const Route = createFileRoute('/dashboard/visit-event/')({
  beforeLoad: () => {
    const userStr = localStorage.getItem('auth_user')
    if (!userStr) {
      throw redirect({ to: '/login' })
      return
    }
    const user = JSON.parse(userStr)
    const hasPermission =
      user.role === 'admin' ||
      user.permissions?.includes('poli:access') ||
      user.permissions?.includes('*')
    if (!hasPermission) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  })
  const [search, setSearch] = useState<string>('')
  const [page, setPage] = useState<number>(1)
  const [col, setCol] = useState<number>(10)
  const { data } = useVisitEvent(
    search,
    page,
    col,
    date?.from ? format(date.from, 'yyyy-MM-dd') : undefined,
    date?.to ? format(date.to, 'yyyy-MM-dd') : undefined,
  )

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
        <div className="flex items-center gap-3 flex-wrap">
          <Input
            placeholder="Cari kodebooking"
            className="max-w-xs"
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />

          <Popover>
            <PopoverTrigger asChild>
              <Button>
                <CalendarIcon className="h-5 w-5" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, 'LLL dd, y')} -{' '}
                      {format(date.to, 'LLL dd, y')}
                    </>
                  ) : (
                    format(date.from, 'LLL dd, y')
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
              />
            </PopoverContent>
          </Popover>
        </div>
        <DataTable
          columns={columns}
          data={(data?.data || []) as VisitEventWithTasks[]}
        />
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
