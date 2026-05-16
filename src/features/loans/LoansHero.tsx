'use client';

import { Banknote, CircleDollarSign, HandCoins, Percent } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { LoanYearStats } from '@/utils/profit-loss-metrics';

interface LoansHeroProps {
  stats: LoanYearStats;
  year: number;
}

export function LoansHero({ stats, year }: LoansHeroProps) {
  const items = [
    {
      label: 'Active loans',
      value: String(stats.activeCount),
      sub: formatCurrency(stats.pendingPrincipal) + ' pending',
      icon: HandCoins,
      warn: stats.activeCount > 0,
    },
    {
      label: `Loans in ${year}`,
      value: String(stats.loansTakenInYear),
      sub: `${stats.loansClosedInYear} closed`,
      icon: Banknote,
    },
    {
      label: 'Interest paid',
      value: formatCurrency(stats.interestPaidInYear),
      sub: `Closed in ${year}`,
      icon: Percent,
    },
    {
      label: 'All-time loans',
      value: String(stats.totalLoansAllTime),
      sub: 'Recorded in ledger',
      icon: CircleDollarSign,
    },
  ];

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-secondary via-primary to-info/90 p-6 text-white shadow-xl sm:p-8">
      <div className="pointer-events-none absolute -right-8 top-0 h-36 w-36 rounded-full bg-accent/25 blur-3xl" />
      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/55">Capital</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Loans & profit / loss</h1>
        <p className="mt-2 max-w-2xl text-sm text-white/70">
          Track loans taken for chit operations, close with interest, and compare yearly chit
          revenue against loan interest for profit or loss.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {items.map(({ label, value, sub, icon: Icon, warn }) => (
            <div
              key={label}
              className={`rounded-xl border border-white/10 bg-white/5 px-3 py-3 backdrop-blur-sm ${warn ? 'ring-1 ring-warning/40' : ''}`}
            >
              <Icon className="mb-2 h-4 w-4 text-accent" />
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
