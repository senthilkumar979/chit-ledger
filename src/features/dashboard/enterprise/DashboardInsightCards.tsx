'use client';

import { useRouter } from 'next/navigation';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartTableFlipCard } from '@/components/analytics/ChartTableFlipCard';
import { DataTable, type DataTableColumn } from '@/components/analytics/DataTable';
import { formatCurrency } from '@/lib/utils';
import type {
  ChitPortfolioBar,
  ChitTypeSlice,
  CityGeoRow,
  EnterpriseDashboardMetrics,
  GeographicChitRow,
  RiskMemberRow,
  ScheduleCompareRow,
} from '@/utils/enterprise-metrics';

const GEO_CHART_COLORS = ['#16A34A', '#0284C7', '#DC2626'] as const;
const PIE_COLORS = ['#0F172A', '#2563EB', '#16A34A', '#F59E0B', '#DC2626', '#8B5CF6'];

interface DashboardInsightCardsProps {
  metrics: EnterpriseDashboardMetrics;
}

export function DashboardInsightCards({ metrics }: DashboardInsightCardsProps) {
  const router = useRouter();

  const riskColumns: DataTableColumn<RiskMemberRow>[] = [
    { id: 'name', header: 'Member', accessor: (r) => r.name },
    { id: 'city', header: 'City', accessor: (r) => r.city, hiddenOnMobile: true },
    { id: 'out', header: 'Outstanding', accessor: (r) => r.outstanding, isCurrency: true },
    { id: 'missed', header: 'Missed', accessor: (r) => r.missedInstallments },
    {
      id: 'risk',
      header: 'Risk',
      accessor: (r) => r.riskLevel.charAt(0).toUpperCase() + r.riskLevel.slice(1),
      sortable: false,
    },
  ];

  const geoColumns: DataTableColumn<CityGeoRow>[] = [
    { id: 'city', header: 'City', accessor: (r) => r.city },
    { id: 'members', header: 'Members', accessor: (r) => r.memberCount },
    { id: 'revenue', header: 'Revenue', accessor: (r) => r.revenue, isCurrency: true },
    { id: 'risk', header: 'Risk score', accessor: (r) => r.riskScore },
  ];

  const scheduleColumns: DataTableColumn<ScheduleCompareRow>[] = [
    { id: 'schedule', header: 'Schedule', accessor: (r) => r.schedule },
    { id: 'count', header: 'Chits', accessor: (r) => r.count },
    { id: 'revenue', header: 'Collected', accessor: (r) => r.revenue, isCurrency: true },
  ];

  const typeColumns: DataTableColumn<ChitTypeSlice>[] = [
    { id: 'label', header: 'Chit type', accessor: (r) => r.label },
    { id: 'count', header: 'Chits', accessor: (r) => r.count },
    { id: 'revenue', header: 'Revenue', accessor: (r) => r.revenue, isCurrency: true },
    { id: 'variance', header: 'Avg variance', accessor: (r) => r.avgVariance, isCurrency: true },
  ];

  const portfolioColumns: DataTableColumn<ChitPortfolioBar>[] = [
    { id: 'label', header: 'Status', accessor: (r) => r.label },
    { id: 'count', header: 'Chits', accessor: (r) => r.count },
  ];

  const geoChitColumns: DataTableColumn<GeographicChitRow>[] = [
    { id: 'city', header: 'City', accessor: (r) => r.city },
    { id: 'total', header: 'Total', accessor: (r) => r.total },
    { id: 'active', header: 'Active', accessor: (r) => r.active },
    { id: 'matured', header: 'Matured', accessor: (r) => r.matured },
    { id: 'withdrawn', header: 'Withdrawn', accessor: (r) => r.withdrawn },
  ];

  const geoChartData = metrics.cities.map((c) => ({
    ...c,
    shortCity: c.city.length > 14 ? `${c.city.slice(0, 12)}…` : c.city,
  }));

  const geoChitChartData = metrics.geographicChits.map((r) => ({
    ...r,
    shortCity: r.city.length > 14 ? `${r.city.slice(0, 12)}…` : r.city,
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ChartTableFlipCard
        title="Risk members"
        description="Who may default?"
        table={
          <DataTable
            columns={riskColumns}
            data={metrics.riskMembers}
            rowKey={(r) => r.personId}
            exportFilename="risk-members.csv"
            onRowClick={(r) => router.push(`/persons/${r.personId}`)}
            pageSize={8}
          />
        }
        chart={
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metrics.riskMembers.slice(0, 8)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tickFormatter={(v) => `₹${Number(v) / 1000}k`} />
              <YAxis type="category" dataKey="name" width={88} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <Bar dataKey="outstanding" name="Outstanding" fill="#DC2626" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        }
      />

      <ChartTableFlipCard
        title="Geographic insights"
        description="Revenue and risk by member city"
        table={
          <DataTable
            columns={geoColumns}
            data={metrics.cities}
            rowKey={(r) => r.city}
            exportFilename="geographic-insights.csv"
            pageSize={10}
          />
        }
        chart={
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={geoChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="shortCity" tick={{ fontSize: 10 }} />
              <YAxis tickFormatter={(v) => `₹${Number(v) / 1000}k`} />
              <Tooltip
                formatter={(v, name) =>
                  name === 'riskScore' ? [v, 'Risk score'] : [formatCurrency(Number(v)), 'Revenue']
                }
                labelFormatter={(_, payload) =>
                  payload?.[0]?.payload?.city ?? ''
                }
              />
              <Bar dataKey="revenue" name="Revenue" fill="#0F172A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        }
      />

      <ChartTableFlipCard
        title="Schedule-wise comparison"
        description="Chit count and collections by collection schedule"
        table={
          <DataTable
            columns={scheduleColumns}
            data={metrics.scheduleComparison}
            rowKey={(r) => r.schedule}
            exportFilename="schedule-comparison.csv"
            pageSize={10}
          />
        }
        chart={
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metrics.scheduleComparison}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="schedule"
                tick={{ fontSize: 9 }}
                interval={0}
                angle={-25}
                textAnchor="end"
                height={56}
              />
              <YAxis yAxisId="left" allowDecimals={false} />
              <YAxis
                yAxisId="right"
                orientation="right"
                tickFormatter={(v) => `₹${Number(v) / 1000}k`}
              />
              <Tooltip
                formatter={(v, name) =>
                  name === 'count' ? [v, 'Chits'] : [formatCurrency(Number(v)), 'Collected']
                }
              />
              <Legend />
              <Bar yAxisId="left" dataKey="count" name="Chits" fill="#0F172A" radius={[4, 4, 0, 0]} />
              <Bar
                yAxisId="right"
                dataKey="revenue"
                name="Collected"
                fill="#16A34A"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        }
      />

      <ChartTableFlipCard
        title="Chit type comparison"
        description="Product mix by scheme type (₹50K, ₹1L, ₹2L)"
        table={
          <DataTable
            columns={typeColumns}
            data={metrics.chitTypes}
            rowKey={(r) => r.type}
            exportFilename="chit-type-comparison.csv"
            pageSize={10}
          />
        }
        chart={
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={metrics.chitTypes}
                dataKey="count"
                nameKey="label"
                innerRadius={48}
                outerRadius={78}
                paddingAngle={2}
              >
                {metrics.chitTypes.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v, name) => [v, name === 'count' ? 'Chits' : String(name)]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        }
      />

      <ChartTableFlipCard
        title="Chit portfolio status"
        description="Total vs active vs matured vs withdrawn"
        table={
          <DataTable
            columns={portfolioColumns}
            data={metrics.chitPortfolio}
            rowKey={(r) => r.key}
            exportFilename="chit-portfolio.csv"
            pageSize={10}
          />
        }
        chart={
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metrics.chitPortfolio}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis allowDecimals={false} />
              <Tooltip formatter={(v) => [v, 'Chits']} />
              <Bar dataKey="count" name="Chits" radius={[4, 4, 0, 0]}>
                {metrics.chitPortfolio.map((row) => (
                  <Cell key={row.key} fill={row.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        }
      />

      <ChartTableFlipCard
        title="Chits by location"
        description="Chit counts by member city"
        table={
          <DataTable
            columns={geoChitColumns}
            data={metrics.geographicChits}
            rowKey={(r) => r.city}
            exportFilename="chits-by-location.csv"
            pageSize={10}
          />
        }
        chart={
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={geoChitChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="shortCity" tick={{ fontSize: 10 }} />
              <YAxis allowDecimals={false} />
              <Tooltip labelFormatter={(_, payload) => payload?.[0]?.payload?.city ?? ''} />
              <Legend />
              <Bar dataKey="active" stackId="a" name="Active" fill={GEO_CHART_COLORS[0]} />
              <Bar dataKey="matured" stackId="a" name="Matured" fill={GEO_CHART_COLORS[1]} />
              <Bar dataKey="withdrawn" stackId="a" name="Withdrawn" fill={GEO_CHART_COLORS[2]} />
            </BarChart>
          </ResponsiveContainer>
        }
      />
    </div>
  );
}
