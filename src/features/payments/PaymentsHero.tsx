'use client';

import { AlertCircle, CheckCircle2, Clock, CreditCard } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface PaymentsHeroProps {
  total: number;
  paid: number;
  pending: number;
  overdue: number;
  collectedAmount: number;
}

export function PaymentsHero({
  total,
  paid,
  pending,
  overdue,
  collectedAmount,
}: PaymentsHeroProps) {
  const stats = [
    { label: 'Installments', value: String(total), icon: CreditCard },
    { label: 'Paid', value: String(paid), icon: CheckCircle2 },
    { label: 'Pending', value: String(pending), icon: Clock },
    { label: 'Overdue', value: String(overdue), icon: AlertCircle },
    { label: 'Collected', value: formatCurrency(collectedAmount), icon: CreditCard },
  ];

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-accent/90 via-primary to-secondary p-6 text-white shadow-xl sm:p-8">
      <div className="pointer-events-none absolute -left-8 bottom-0 h-36 w-36 rounded-full bg-white/10 blur-3xl" />
      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/55">Collections</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Payments</h1>
        <p className="mt-2 max-w-lg text-sm text-white/70">
          Track installments across all chits. Record, edit, or reset payments from the chit ledger.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {stats.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 backdrop-blur-sm"
            >
              <Icon className="mb-2 h-4 w-4 text-white/80" />
              <p className="text-lg font-bold tabular-nums sm:text-xl">{value}</p>
              <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-white/50">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
