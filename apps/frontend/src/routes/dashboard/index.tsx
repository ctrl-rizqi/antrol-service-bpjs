import { createFileRoute } from '@tanstack/react-router'
import Header from '@/components/Header'
import { RegistrationWeeklyChart } from '@/components/registration-weekly-chart'
import { DashboardSummaryCards } from '@/components/dashboard-summary-cards'
import { useWeeklyStats } from '@/hooks/dashboard'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardIndex,
})

function DashboardIndex() {
  const { data, isLoading } = useWeeklyStats()

  return (
    <>
      <Header
        breadcrumb={[
          {
            title: 'Dashboard',
            url: '/dashboard',
          },
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <DashboardSummaryCards summary={data?.summary} isLoading={isLoading} />
        <div className="grid auto-rows-min gap-4 md:grid-cols-1">
          <RegistrationWeeklyChart data={data?.data} isLoading={isLoading} />
        </div>
      </div>
    </>
  )
}
