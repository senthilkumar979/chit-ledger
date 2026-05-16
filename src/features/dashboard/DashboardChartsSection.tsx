'use client';

import { BreakdownBarChart } from '@/components/charts/BreakdownBarChart';
import { MonthComparisonChart } from '@/components/charts/MonthComparisonChart';
import { RevenueChart } from '@/components/charts/RevenueChart';
import { VarianceTrendChart } from '@/components/charts/VarianceTrendChart';
import type { AnalyticsBundle } from '@/services/analytics';
import type { DashboardMonthKpis } from '@/utils/dashboard-metrics';
import type { VarianceMonthDatum } from '@/utils/dashboard-metrics';

interface DashboardChartsSectionProps {
  kpis: DashboardMonthKpis;
  monthLabel: string;
  analytics: AnalyticsBundle;
  monthBreakdown: {
    byType: { name: string; amount: number }[];
    byCity: { name: string; amount: number }[];
    byCategory: { name: string; amount: number }[];
  };
  varianceTrend: VarianceMonthDatum[];
}

export function DashboardChartsSection({
  kpis,
  monthLabel,
  analytics,
  monthBreakdown,
  varianceTrend,
}: DashboardChartsSectionProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <MonthComparisonChart
          expected={kpis.expectedOnPaidInMonth}
          collected={kpis.collectedInMonth}
          monthLabel={monthLabel}
        />
        <VarianceTrendChart data={varianceTrend} />
      </div>
      <RevenueChart data={analytics.byMonth} />
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <BreakdownBarChart
          title="By scheme (this month)"
          description="Collections recorded this month"
          data={monthBreakdown.byType}
          color="#0F172A"
        />
        <BreakdownBarChart
          title="By schedule"
          description="5th vs 20th collections"
          data={monthBreakdown.byCategory}
          color="#2563EB"
        />
        <BreakdownBarChart
          title="By city"
          description="Top member cities"
          data={monthBreakdown.byCity}
          color="#16A34A"
        />
      </div>
    </div>
  );
}
