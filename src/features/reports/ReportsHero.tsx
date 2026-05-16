'use client';

import { AlertTriangle, BarChart3, Landmark, Wallet } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { ReportsKpis } from '@/utils/report-metrics';

interface ReportsHeroProps {
  kpis: ReportsKpis;
}

export function ReportsHero({ kpis }: ReportsHeroProps) {
  const stats = [
    {
      label: 'Total collected',
      value: formatCurrency(kpis.totalCollected),
      sub: `${kpis.paidInstallments} paid installments`,
      icon: Wallet,
    },
    {
      label: 'Outstanding',
      value: formatCurrency(kpis.totalOutstanding),
      sub: `${kpis.overdueInstallments} overdue`,
      icon: AlertTriangle,
      warn: kpis.overdueInstallments > 0,
    },
    {
      label: 'Collection variance',
      value: formatCurrency(Math.abs(kpis.collectionVariance)),
      sub: kpis.collectionVariance >= 0 ? 'Extra vs expected' : 'Shortfall',
      icon: BarChart3,
    },
    {
      label: 'Portfolio',
      value: String(kpis.totalChits),
      sub: `${kpis.activeChits} active · ${kpis.maturedAwaitingWithdrawal} awaiting payout`,
      icon: Landmark,
    },
  ];

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-info/90 via-primary to-secondary p-6 text-white shadow-xl sm:p-8">
      <div className="pointer-events-none absolute -right-10 top-0 h-40 w-40 rounded-full bg-accent/20 blur-3xl" />
      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/55">Insights</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Reports & analytics</h1>
        <p className="mt-2 max-w-2xl text-sm text-white/70">
          Portfolio health, collection trends, outstanding installments, maturity pipeline, and
          exportable registers for your records.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map(({ label, value, sub, icon: Icon, warn }) => (
            <div
              key={label}
              className={`rounded-xl border border-white/10 bg-white/5 px-3 py-3 backdrop-blur-sm ${warn ? 'ring-1 ring-danger/40' : ''}`}
            >
              <Icon className={`mb-2 h-4 w-4 ${warn ? 'text-danger' : 'text-accent'}`} />
              <p className="text-lg font-bold tabular-nums sm:text-xl">{value}</p>
              <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-white/50">
                {label}
              </p>
              <p className="mt-1 text-[11px] text-white/45">{sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
