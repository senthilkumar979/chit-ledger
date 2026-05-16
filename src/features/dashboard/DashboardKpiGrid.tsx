'use client';

import { CheckCircle2, Landmark, Wallet } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import type { DashboardMonthKpis } from '@/utils/dashboard-metrics';

interface DashboardKpiGridProps {
  kpis: DashboardMonthKpis;
}

export function DashboardKpiGrid({ kpis }: DashboardKpiGridProps) {
  const items = [
    {
      label: 'Expected (recorded)',
      value: formatCurrency(kpis.expectedOnPaidInMonth),
      icon: Wallet,
      tone: 'default',
    },
    {
      label: 'Matured chits',
      value: String(kpis.maturedChits),
      icon: CheckCircle2,
      tone: 'accent',
    },
    {
      label: 'Withdrawn',
      value: String(kpis.withdrawnChits),
      icon: Landmark,
      tone: 'default',
    },
    {
      label: 'Paid this schedule',
      value: `${kpis.installmentsPaidInMonth}/${kpis.installmentsDueInMonth}`,
      icon: CheckCircle2,
      tone: 'accent',
    },
  ];

  const toneClasses: Record<string, string> = {
    accent: 'text-accent bg-accent/10',
    default: 'text-primary bg-surface',
  };

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map(({ label, value, icon: Icon, tone }) => (
        <div
          key={label}
          className="rounded-xl border border-border/80 bg-card p-3 shadow-sm sm:p-4"
        >
          <div className={cn('mb-2 inline-flex rounded-lg p-2', toneClasses[tone])}>
            <Icon className="h-4 w-4" />
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted sm:text-xs">
            {label}
          </p>
          <p className="mt-1 text-lg font-bold tabular-nums text-primary sm:text-xl">{value}</p>
        </div>
      ))}
    </div>
  );
}
