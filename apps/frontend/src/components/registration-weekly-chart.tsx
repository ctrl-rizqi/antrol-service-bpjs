'use client'

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import type { WeeklyStatsData } from '@antrol/shared'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'

const chartConfig = {
  selesai: {
    label: 'Selesai',
    color: 'hsl(var(--chart-1))',
  },
  belum_terkirim: {
    label: 'Belum Terkirim',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig

interface RegistrationWeeklyChartProps {
  data: WeeklyStatsData[] | undefined;
  isLoading?: boolean;
}

export function RegistrationWeeklyChart({ data, isLoading }: RegistrationWeeklyChartProps) {
  if (isLoading) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Statistik Registrasi Mingguan</CardTitle>
          <CardDescription>Data registrasi 7 hari terakhir</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Statistik Registrasi Mingguan</CardTitle>
        <CardDescription>
          Data registrasi 7 hari terakhir berdasarkan status kunjungan
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart data={data || []}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              allowDecimals={false}
            />
            <ChartTooltip
              cursor={{ fill: 'transparent' }}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar
              dataKey="selesai"
              fill="var(--color-selesai)"
              radius={[4, 4, 0, 0]}
              name="Selesai"
            />
            <Bar
              dataKey="belum_terkirim"
              fill="var(--color-belum_terkirim)"
              radius={[4, 4, 0, 0]}
              name="Belum Terkirim"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
