'use client';

import { useRouter } from 'next/navigation';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartPanel } from '@/components/analytics/ChartPanel';
import { DataTable, type DataTableColumn } from '@/components/analytics/DataTable';
import { formatCurrency } from '@/lib/utils';
import type { EnterpriseReportsMetrics, MemberRevenueRow } from '@/utils/enterprise-metrics';

interface ReportsAnalyticsSectionsProps {
  metrics: EnterpriseReportsMetrics;
  canViewLoanAnalytics: boolean;
}

export function ReportsAnalyticsSections({
  metrics,
  canViewLoanAnalytics,
}: ReportsAnalyticsSectionsProps) {
  const router = useRouter();

  const memberColumns: DataTableColumn<MemberRevenueRow>[] = [
    { id: 'member', header: 'Member', accessor: (r) => r.member },
    { id: 'city', header: 'City', accessor: (r) => r.city },
    { id: 'chits', header: 'Chits', accessor: (r) => r.chits },
    { id: 'paid', header: 'Total paid', accessor: (r) => r.totalPaid, isCurrency: true },
    { id: 'out', header: 'Outstanding', accessor: (r) => r.outstanding, isCurrency: true },
    { id: 'var', header: 'Variance', accessor: (r) => r.variance, isCurrency: true },
    { id: 'profit', header: 'Profit contribution', accessor: (r) => r.profitContribution, isCurrency: true },
  ];

  const cohortMonths = [...new Set(metrics.cohortHeatmap.map((c) => c.cohortMonth))].slice(-6);
  const installments = Array.from({ length: 20 }, (_, i) => i + 1);

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <SectionHeading title="Financial P&L" subtitle="Are expenses rising faster than revenue?" />
        <div className="grid gap-6 lg:grid-cols-2">
          <ChartPanel title="Revenue vs loan interest" description="Monthly comparison">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={metrics.monthlyPnL}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tickFormatter={(v) => `₹${Number(v) / 100000}L`} />
                <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                <Legend />
                <Bar dataKey="revenue" name="Revenue" fill="#0F172A" radius={[4, 4, 0, 0]} />
                <Line dataKey="loanInterest" name="Loan interest" stroke="#DC2626" strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartPanel>
          <ChartPanel title="Profit trend" description="Are we scaling profit?">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.profitTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tickFormatter={(v) => `₹${Number(v) / 1000}k`} />
                <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                <Area type="monotone" dataKey="profit" stroke="#16A34A" fill="#16A34A33" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartPanel>
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeading title="Member analytics" subtitle="Who drives business?" />
        <ChartPanel title="Pareto — top members" description="Top members by cumulative revenue %">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={metrics.pareto}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} angle={-25} textAnchor="end" height={60} />
              <YAxis tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(v, name) => (name === 'cumulativePct' ? `${v}%` : formatCurrency(Number(v)))} />
              <Area type="monotone" dataKey="cumulativePct" stroke="#2563EB" fill="#2563EB22" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartPanel>
        <DataTable
          columns={memberColumns}
          data={metrics.memberRevenue}
          rowKey={(r) => r.personId}
          exportFilename="member-revenue.csv"
          onRowClick={(r) => router.push(`/persons/${r.personId}`)}
        />
      </section>

      <section className="space-y-4">
        <SectionHeading title="Chit analytics" subtitle="Which batches perform better?" />
        <ChartPanel title="Cohort collection completion" description="Heatmap by start month × installment">
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr>
                  <th className="p-1 text-left">Cohort</th>
                  {installments.map((i) => (
                    <th key={i} className="p-1 text-center font-normal text-muted">
                      {i}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cohortMonths.map((cohort) => (
                  <tr key={cohort}>
                    <td className="p-1 font-medium">{cohort}</td>
                    {installments.map((inst) => {
                      const cell = metrics.cohortHeatmap.find(
                        (c) => c.cohortMonth === cohort && c.installment === inst,
                      );
                      const pct = cell?.completionPct ?? 0;
                      return (
                        <td
                          key={inst}
                          className="p-1 text-center tabular-nums"
                          style={{
                            backgroundColor: `rgba(22, 163, 74, ${pct / 100})`,
                            color: pct > 50 ? '#fff' : 'inherit',
                          }}
                        >
                          {cell ? `${pct}%` : '—'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartPanel>
        <ChartPanel title="Variance distribution" description="Profitable vs underperforming chits">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metrics.varianceHistogram}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bucket" tick={{ fontSize: 10 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#0F172A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
      </section>

      {canViewLoanAnalytics ? (
        <section className="space-y-4">
          <SectionHeading title="Loan analytics" subtitle="Are loans becoming dangerous?" />
          <div className="grid gap-6 lg:grid-cols-2">
            <ChartPanel title="Debt timeline">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.debtTimeline}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <Legend />
                  <Bar dataKey="principal" stackId="a" fill="#0F172A" />
                  <Bar dataKey="interest" stackId="a" fill="#DC2626" />
                  <Bar dataKey="repayments" fill="#16A34A" />
                </BarChart>
              </ResponsiveContainer>
            </ChartPanel>
            <ChartPanel title="Interest leakage" description="Interest paid as % of revenue">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics.interestLeakage}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tickFormatter={(v) => `${v}%`} />
                  <Tooltip formatter={(v) => `${v}%`} />
                  <Line dataKey="pctOfRevenue" stroke="#DC2626" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartPanel>
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <SectionHeading title="Operational performance" subtitle="How efficient is the team?" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiTile label="Avg collection delay" value={`${metrics.operational.avgCollectionDelayDays} days`} />
          <KpiTile label="Avg withdrawal delay" value={`${metrics.operational.avgWithdrawalDelayDays} days`} />
          <KpiTile label="Avg maturity time" value={`${metrics.operational.avgMaturityMonths} mo`} />
          <KpiTile label="Payment success rate" value={`${metrics.operational.paymentSuccessRate}%`} />
        </div>
      </section>
    </div>
  );
}

function SectionHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-primary">{title}</h2>
      <p className="text-sm text-muted">{subtitle}</p>
    </div>
  );
}

function KpiTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1 text-xl font-bold tabular-nums text-primary">{value}</p>
    </div>
  );
}

