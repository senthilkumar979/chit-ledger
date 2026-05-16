'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchEnterpriseData } from '@/services/enterprise-analytics';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { getCurrentMonthKey } from '@/utils/payment-month';
import { ExecutiveSnapshotSection } from './enterprise/ExecutiveSnapshotSection';
import { DashboardAnalyticsSections } from './enterprise/DashboardAnalyticsSections';

export function EnterpriseDashboardView() {
  const [selectedMonthKey, setSelectedMonthKey] = useState(getCurrentMonthKey);

  const { data, isLoading } = useQuery({
    queryKey: ['enterprise-dashboard', selectedMonthKey],
    queryFn: () => fetchEnterpriseData(selectedMonthKey),
  });

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">
          Operations dashboard
        </h1>
        <p className="mt-1 text-sm text-muted">
          Finance control center — collections, risk, portfolio, and cash position
        </p>
      </header>
      <ExecutiveSnapshotSection data={data.dashboard.executive} />
      <DashboardAnalyticsSections
        metrics={data.dashboard}
        selectedMonthKey={selectedMonthKey}
        onMonthSelect={setSelectedMonthKey}
      />
    </div>
  );
}
