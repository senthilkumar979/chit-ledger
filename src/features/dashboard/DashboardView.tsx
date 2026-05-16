'use client';

import { useQuery } from '@tanstack/react-query';
import { formatDate } from '@/lib/utils';
import { DashboardHero } from './DashboardHero';
import { AnalyticsChartsGrid } from '@/components/charts/AnalyticsChartsGrid';
import { Card, CardHeader } from '@/components/ui/Card';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { fetchDashboardStats } from '@/services/dashboard';

export function DashboardView() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
  });

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <DashboardHero
        activeChits={data.activeChits}
        pendingCollections={data.pendingCollections}
        monthlyRevenue={data.monthlyRevenue}
        maturedChits={data.maturedChits}
        overdueAccounts={data.overdueAccounts}
      />
      <AnalyticsChartsGrid analytics={data.analytics} />
      <Card padding="lg">
        <CardHeader title="Recent collections" description="Latest recorded payments" />
        <ul className="space-y-3">
          {data.recentActivity.length ? (
            data.recentActivity.map((item) => (
              <li key={item.id} className="flex justify-between gap-2 border-b border-border/60 pb-3 text-sm last:border-0">
                <span className="text-primary">{item.text}</span>
                <span className="shrink-0 text-xs text-muted">
                  {item.time ? formatDate(item.time) : '—'}
                </span>
              </li>
            ))
          ) : (
            <p className="py-6 text-center text-sm text-muted">No payments recorded yet.</p>
          )}
        </ul>
      </Card>
    </div>
  );
}
