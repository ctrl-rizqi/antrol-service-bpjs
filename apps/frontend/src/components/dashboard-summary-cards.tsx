import { IconCheck, IconClock, IconUsers } from '@tabler/icons-react';
import type { WeeklyStatsSummary } from '@antrol/shared';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface DashboardSummaryCardsProps {
  summary: WeeklyStatsSummary | undefined;
  isLoading?: boolean;
}

export function DashboardSummaryCards({ summary, isLoading }: DashboardSummaryCardsProps) {
  if (isLoading || !summary) {
    return (
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="@container/card">
            <CardHeader>
              <CardDescription className="h-4 w-24 bg-muted animate-pulse rounded" />
              <CardTitle className="h-8 w-16 bg-muted animate-pulse rounded mt-2" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  const successRate = summary.total_keseluruhan > 0
    ? ((summary.total_selesai / summary.total_keseluruhan) * 100).toFixed(1)
    : '0';

  const cards = [
    {
      title: 'Total Selesai',
      value: summary.total_selesai,
      icon: IconCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950',
      description: `${successRate}% dari total`,
    },
    {
      title: 'Belum Terkirim',
      value: summary.total_belum_terkirim,
      icon: IconClock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
      description: 'Perlu ditindaklanjuti',
    },
    {
      title: 'Total Keseluruhan',
      value: summary.total_keseluruhan,
      icon: IconUsers,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      description: '7 hari terakhir',
    },
  ];

  return (
    <div className="grid auto-rows-min gap-4 md:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.title} className="@container/card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription className="text-sm font-medium">
              {card.title}
            </CardDescription>
            <div className={`rounded-lg p-2 ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <div className="p-6 pt-0">
            <CardTitle className={`text-2xl font-bold ${card.color}`}>
              {card.value.toLocaleString('id-ID')}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {card.description}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
}
