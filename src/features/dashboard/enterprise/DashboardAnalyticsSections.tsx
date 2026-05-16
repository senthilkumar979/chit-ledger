'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartPanel } from '@/components/analytics/ChartPanel';
import { DataTable, type DataTableColumn } from '@/components/analytics/DataTable';
import { CashFlowComboChart } from '@/components/charts/enterprise/CashFlowComboChart';
import { formatCurrency, cn } from '@/lib/utils';
import type {
  EnterpriseDashboardMetrics,
  MemberLeaderboardRow,
  RiskMemberRow,
} from '@/utils/enterprise-metrics';

interface DashboardAnalyticsSectionsProps {
  metrics: EnterpriseDashboardMetrics;
  selectedMonthKey?: string;
  onMonthSelect: (monthKey: string) => void;
}

export function DashboardAnalyticsSections({
  metrics,
  selectedMonthKey,
  onMonthSelect,
}: DashboardAnalyticsSectionsProps) {
  const router = useRouter();
  const funnelData = [
    { stage: 'Expected', value: metrics.funnel.expected },
    { stage: 'Collected', value: metrics.funnel.collected },
    { stage: 'Shortfall', value: metrics.funnel.shortfall },
  ];

  const memberColumns: DataTableColumn<RiskMemberRow>[] = [
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

  return (
    <div className="space-y-8">
      <ChartPanel
        title="Cash flow intelligence"
        description="Where is money coming and going? Tap a month to filter widgets."
        height="h-80"
      >
        <CashFlowComboChart
          data={metrics.cashFlow}
          activeMonthKey={selectedMonthKey}
          onMonthSelect={onMonthSelect}
        />
      </ChartPanel>

      <div className="grid gap-6 lg:grid-cols-3">
        <ChartPanel title="Collection efficiency" description="How efficient are collections?">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={funnelData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tickFormatter={(v) => `₹${Number(v) / 1000}k`} />
              <YAxis type="category" dataKey="stage" width={72} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                <Cell fill="#0F172A" />
                <Cell fill="#16A34A" />
                <Cell fill="#DC2626" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Installment aging" description="What debts need action?">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metrics.aging} layout="vertical">
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="label" width={72} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <Bar dataKey="amount" fill="#2563EB" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Collection trend" description="Are we consistently under-collecting?">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={metrics.collectionTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tickFormatter={(v) => `₹${Number(v) / 1000}k`} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <Legend />
              <Line dataKey="expected" stroke="#94A3B8" strokeDasharray="4 4" dot={false} />
              <Line dataKey="actual" stroke="#16A34A" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartPanel>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartPanel title="Top members by revenue" description="Who are our most valuable members?">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={metrics.topMembers}
              layout="vertical"
              onClick={(s) => {
                const payload = s as { activePayload?: { payload?: MemberLeaderboardRow }[] } | null;
                const id = payload?.activePayload?.[0]?.payload?.personId;
                if (id) router.push(`/persons/${id}`);
              }}
            >
              <XAxis type="number" tickFormatter={(v) => `₹${Number(v) / 1000}k`} />
              <YAxis type="category" dataKey="name" width={88} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <Bar dataKey="totalPaid" fill="#0F172A" radius={[0, 4, 4, 0]} className="cursor-pointer" />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Risk members" description="Who may default?">
          <DataTable
            columns={memberColumns}
            data={metrics.riskMembers}
            rowKey={(r) => r.personId}
            exportFilename="risk-members.csv"
            onRowClick={(r) => router.push(`/persons/${r.personId}`)}
            pageSize={10}
          />
        </ChartPanel>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartPanel title="Chit type distribution" description="What products drive business?">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={metrics.chitTypes} dataKey="revenue" nameKey="label" innerRadius={50} outerRadius={80}>
                {metrics.chitTypes.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? '#0F172A' : '#2563EB'} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Maturity pipeline" description="What payouts are approaching?">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metrics.maturityPipeline}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="left" tickFormatter={(v) => String(v)} />
              <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `₹${Number(v) / 1000}k`} />
              <Tooltip />
              <Bar yAxisId="left" dataKey="count" name="Chits" fill="#0F172A" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="liability" name="Liability" fill="#DC2626" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
      </div>

      <ChartPanel title="Geographic insights" description="Which locations perform better?">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {metrics.cities.map((city) => (
            <CityCard key={city.city} city={city.city} revenue={city.revenue} risk={city.riskScore} members={city.memberCount} />
          ))}
        </div>
      </ChartPanel>

      <AlertsPanel alerts={metrics.alerts} />
    </div>
  );
}

function CityCard({
  city,
  revenue,
  risk,
  members,
}: {
  city: string;
  revenue: number;
  risk: number;
  members: number;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface/30 p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-primary">{city}</p>
          <p className="text-xs text-muted">{members} members</p>
        </div>
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-[10px] font-semibold',
            risk >= 60 ? 'bg-danger/10 text-danger' : risk >= 30 ? 'bg-warning/10 text-warning' : 'bg-accent/10 text-accent',
          )}
        >
          Risk {risk}
        </span>
      </div>
      <p className="mt-2 text-lg font-bold tabular-nums">{formatCurrency(revenue)}</p>
    </div>
  );
}

function AlertsPanel({
  alerts,
}: {
  alerts: EnterpriseDashboardMetrics['alerts'];
}) {
  if (!alerts.length) {
    return (
      <section className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted">
        No priority alerts today.
      </section>
    );
  }

  const severityStyle = {
    critical: 'border-danger/30 bg-danger/5',
    warning: 'border-warning/30 bg-warning/5',
    info: 'border-border bg-surface/40',
  };

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-primary">Priority alerts</h2>
      <p className="text-sm text-muted">What needs action today?</p>
      <div className="space-y-2">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={cn(
              'flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between',
              severityStyle[alert.severity],
            )}
          >
            <div>
              <p className="font-semibold text-primary">{alert.title}</p>
              <p className="text-sm text-muted">{alert.description}</p>
            </div>
            <Link
              href={alert.href}
              className="inline-flex shrink-0 items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              {alert.actionLabel}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
