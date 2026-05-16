'use client';

import { formatCurrency, cn } from '@/lib/utils';
import type { ReportsKpis } from '@/utils/report-metrics';

interface ReportsKpiGridProps {
  kpis: ReportsKpis;
}

export function ReportsKpiGrid({ kpis }: ReportsKpiGridProps) {
  const items = [
    { label: 'Partial', value: String(kpis.partialInstallments) },
    { label: 'Pending', value: String(kpis.pendingInstallments) },
    { label: 'Matured', value: String(kpis.maturedChits) },
    { label: 'Withdrawn', value: String(kpis.withdrawnChits) },
    { label: 'Expected (paid)', value: formatCurrency(kpis.totalExpectedOnPaid) },
    {
      label: 'Awaiting withdrawal',
      value: String(kpis.maturedAwaitingWithdrawal),
      highlight: kpis.maturedAwaitingWithdrawal > 0,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {items.map((item) => (
        <div
          key={item.label}
          className={cn(
            'rounded-xl border border-border/80 bg-card px-3 py-3 shadow-sm',
            item.highlight && 'ring-1 ring-accent/30',
          )}
        >
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
            {item.label}
          </p>
          <p className="mt-1 text-lg font-bold tabular-nums text-primary">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
