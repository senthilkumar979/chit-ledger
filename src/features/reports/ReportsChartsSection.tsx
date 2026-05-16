'use client';

import { BreakdownBarChart } from '@/components/charts/BreakdownBarChart';
import { DistributionPieChart } from '@/components/charts/DistributionPieChart';
import { RevenueChart } from '@/components/charts/RevenueChart';
import type { AnalyticsBundle, ChartDatum } from '@/services/analytics';

interface ReportsChartsSectionProps {
  analytics: AnalyticsBundle;
  byStatus: ChartDatum[];
  portfolioMix: ChartDatum[];
}

export function ReportsChartsSection({
  analytics,
  byStatus,
  portfolioMix,
}: ReportsChartsSectionProps) {
  return (
    <div className="space-y-6">
      <RevenueChart data={analytics.byMonth} />
      <div className="grid gap-6 lg:grid-cols-2">
        <DistributionPieChart
          title="Installment status"
          description="All installments by payment status"
          data={byStatus}
          valueLabel="Installments"
        />
        <DistributionPieChart
          title="Chit portfolio"
          description="Active, matured, and withdrawn chits"
          data={portfolioMix}
          valueLabel="Chits"
        />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <BreakdownBarChart
          title="Collections by scheme"
          description="Lifetime collected by chit type"
          data={analytics.byType}
          color="#0F172A"
        />
        <BreakdownBarChart
          title="By collection schedule"
          description="5th vs 20th and other schedules"
          data={analytics.byCategory}
          color="#2563EB"
        />
        <BreakdownBarChart
          title="Top cities"
          description="Collections by member city"
          data={analytics.byCity}
          color="#16A34A"
        />
      </div>
    </div>
  );
}
