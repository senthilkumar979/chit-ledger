'use client';

import { BarChart3, FileText, Users, Wallet } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface ReportsHeroProps {
  totalCollected: number;
  defaulterCount: number;
  maturedCount: number;
  withdrawalPending: number;
}

export function ReportsHero({
  totalCollected,
  defaulterCount,
  maturedCount,
  withdrawalPending,
}: ReportsHeroProps) {
  const stats = [
    { label: 'Total collected', value: formatCurrency(totalCollected), icon: Wallet },
    { label: 'Defaulters', value: String(defaulterCount), icon: Users },
    { label: 'Matured', value: String(maturedCount), icon: BarChart3 },
    { label: 'Awaiting withdrawal', value: String(withdrawalPending), icon: FileText },
  ];

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-info/90 via-primary to-secondary p-6 text-white shadow-xl sm:p-8">
      <div className="pointer-events-none absolute -right-10 top-0 h-40 w-40 rounded-full bg-accent/20 blur-3xl" />
      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/55">Insights</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Reports & analytics</h1>
        <p className="mt-2 max-w-lg text-sm text-white/70">
          Breakdowns by month, chit type, city, and collection schedule. Export tabular reports as CSV or PDF.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 backdrop-blur-sm"
            >
              <Icon className="mb-2 h-4 w-4 text-accent" />
              <p className="text-xl font-bold tabular-nums">{value}</p>
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
