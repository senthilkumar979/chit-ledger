'use client';

import { ChartPanel } from '@/components/analytics/ChartPanel';
import { DataTable, type DataTableColumn } from '@/components/analytics/DataTable';
import type { EnterpriseReportsMetrics, MemberRevenueRow } from '@/utils/enterprise-metrics';
import { useRouter } from 'next/navigation';
import { MemberProfitStats } from './MemberProfitStats';

interface ReportsAnalyticsSectionsProps {
  metrics: EnterpriseReportsMetrics;
}

export function ReportsAnalyticsSections({ metrics }: ReportsAnalyticsSectionsProps) {
  const router = useRouter();

  const memberColumns: DataTableColumn<MemberRevenueRow>[] = [
    {
      id: 'member',
      header: 'Member',
      accessor: (r) => `${r.member} ${r.city}`,
      render: (r) => (
        <div>
          <p className="font-semibold text-primary">{r.member}</p>
          <p className="text-xs text-muted">{r.city}</p>
        </div>
      ),
    },
    { id: 'chits', header: 'Chits', accessor: (r) => r.chits },
    {
      id: 'paid',
      header: 'Total paid',
      accessor: (r) => r.totalPaid,
      isCurrency: true,
      cellClassName: 'text-info font-semibold',
    },
    {
      id: 'out',
      header: 'Outstanding',
      accessor: (r) => r.outstanding,
      isCurrency: true,
      cellClassName: 'text-violet-600 font-semibold',
    },
    {
      id: 'returned',
      header: 'Amount returned',
      accessor: (r) => r.amountReturned,
      isCurrency: true,
      cellClassName: 'text-warning font-semibold',
    },
    {
      id: 'profit',
      header: 'Profit',
      accessor: (r) => r.profit,
      isCurrency: true,
      cellClassName: (r) =>
        r.profit < 0 ? 'text-danger font-semibold' : 'text-accent font-semibold',
    },
    {
      id: 'var',
      header: 'Variance',
      accessor: (r) => r.variance,
      isCurrency: true,
      cellClassName: 'text-danger font-semibold',
    },
  ];

  const cohortMonths = [...new Set(metrics.cohortHeatmap.map((c) => c.cohortMonth))].sort();
  const installments = Array.from({ length: 20 }, (_, i) => i + 1);

  return (
    <div className="space-y-10">

      <section className="space-y-4">
        <SectionHeading title="Member analytics" subtitle="Who drives business?" />
        <MemberProfitStats rows={metrics.memberRevenue} />
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


