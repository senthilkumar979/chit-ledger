'use client';

import { IndianRupee, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { Payment } from '@/types/database';

interface ChitDetailStatsProps {
  payments: Payment[];
}

export function ChitDetailStats({ payments }: ChitDetailStatsProps) {
  const paid = payments.filter((p) => p.status === 'paid');
  const pending = payments.filter((p) => p.status === 'pending');
  const overdue = payments.filter((p) => p.status === 'overdue');
  const partial = payments.filter((p) => p.status === 'partial');

  const collected = paid.reduce((s, p) => s + Number(p.expected_amount), 0);
  const outstanding = [...pending, ...partial, ...overdue].reduce(
    (s, p) => s + Number(p.expected_amount),
    0,
  );

  const items = [
    { label: 'Collected', value: formatCurrency(collected), icon: CheckCircle2, tone: 'accent' },
    { label: 'Outstanding', value: formatCurrency(outstanding), icon: Clock, tone: 'warning' },
    { label: 'Paid installments', value: paid.length, icon: IndianRupee, tone: 'default' },
    { label: 'Overdue', value: overdue.length, icon: AlertTriangle, tone: 'danger' },
  ];

  const toneClasses: Record<string, string> = {
    accent: 'text-accent bg-accent/10',
    warning: 'text-warning bg-warning/10',
    danger: 'text-danger bg-danger/10',
    default: 'text-primary bg-surface',
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map(({ label, value, icon: Icon, tone }) => (
        <div
          key={label}
          className="rounded-xl border border-border/80 bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className={`mb-3 inline-flex rounded-lg p-2 ${toneClasses[tone]}`}>
            <Icon className="h-4 w-4" />
          </div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted">{label}</p>
          <p className="mt-1 text-xl font-bold tabular-nums text-primary">{value}</p>
        </div>
      ))}
    </div>
  );
}
