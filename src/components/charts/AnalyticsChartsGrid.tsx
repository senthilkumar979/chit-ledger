'use client';

import { BreakdownBarChart } from './BreakdownBarChart';
import { RevenueChart } from './RevenueChart';
import type { AnalyticsBundle } from '@/services/analytics';

interface AnalyticsChartsGridProps {
  analytics: AnalyticsBundle;
}

export function AnalyticsChartsGrid({ analytics }: AnalyticsChartsGridProps) {
  return (
    <div className="space-y-6">
      <RevenueChart data={analytics.byMonth} />
      <div className="grid gap-6 lg:grid-cols-2">
        <BreakdownBarChart
          title="By chit type"
          description="Collections by scheme"
          data={analytics.byType}
          color="#0F172A"
        />
        <BreakdownBarChart
          title="By collection schedule"
          description="Collections by 5th vs 20th"
          data={analytics.byCategory}
          color="#2563EB"
        />
        <BreakdownBarChart
          title="By city"
          description="Top member cities"
          data={analytics.byCity}
          color="#16A34A"
        />
      </div>
    </div>
  );
}
