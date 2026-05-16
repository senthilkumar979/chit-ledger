'use client';

import {
  AlertTriangle,
  Clock,
  IndianRupee,
  Landmark,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import type { DashboardMonthKpis } from '@/utils/dashboard-metrics';

interface DashboardHeroProps {
  kpis: DashboardMonthKpis;
  monthLabel: string;
}

export function DashboardHero({ kpis, monthLabel }: DashboardHeroProps) {
  const stats = [
    {
      label: 'Collected',
      value: formatCurrency(kpis.collectedInMonth),
      sub: `${kpis.paymentsRecordedInMonth} payments`,
      icon: IndianRupee,
      highlight: true,
    },
    {
      label: 'Extra collected',
      value: formatCurrency(kpis.extraCollectedInMonth),
      sub: kpis.shortfallInMonth > 0 ? `${formatCurrency(kpis.shortfallInMonth)} short` : 'Above expected',
      icon: TrendingUp,
      tone: 'accent' as const,
    },
    {
      label: 'Still due',
      value: formatCurrency(kpis.amountDueRemaining),
      sub: `${kpis.dueChitsCount} chits · ${kpis.installmentsDueInMonth - kpis.installmentsPaidInMonth} inst.`,
      icon: Clock,
      warn: kpis.amountDueRemaining > 0,
    },
    {
      label: 'Total chits',
      value: String(kpis.totalChits),
      sub: `${kpis.activeChits} active`,
      icon: Landmark,
    },
    {
      label: 'Overdue',
      value: String(kpis.overdueCount),
      sub: 'This month schedule',
      icon: AlertTriangle,
      warn: kpis.overdueCount > 0,
    },
  ];

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-secondary via-primary to-secondary p-5 text-white shadow-xl sm:p-8">
      <div className="pointer-events-none absolute -left-10 top-0 h-44 w-44 rounded-full bg-accent/25 blur-3xl" />
      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/55">Overview</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Dashboard</h1>
        <p className="mt-2 max-w-xl text-sm text-white/70">
          Earnings and dues for <strong className="text-white">{monthLabel}</strong>. Collected uses
          payment dates; due amounts follow installment schedules.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5 sm:gap-3">
          {stats.map(({ label, value, sub, icon: Icon, highlight, warn, tone }) => (
            <div
              key={label}
              className={cn(
                'rounded-xl border border-white/10 bg-white/5 px-3 py-3 backdrop-blur-sm',
                highlight && 'col-span-2 sm:col-span-1 ring-1 ring-accent/40',
                warn && 'ring-1 ring-danger/50',
              )}
            >
              <Icon
                className={cn(
                  'mb-2 h-4 w-4',
                  warn ? 'text-danger' : tone === 'accent' ? 'text-accent' : 'text-white/75',
                )}
              />
              <p className="text-lg font-bold tabular-nums leading-tight sm:text-xl">{value}</p>
              <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-white/50">
                {label}
              </p>
              <p className="mt-1 text-[11px] text-white/45">{sub}</p>
            </div>
          ))}
        </div>
        {kpis.shortfallInMonth > 0 ? (
          <p className="mt-4 flex items-center gap-1.5 text-xs text-warning">
            <TrendingDown className="h-3.5 w-3.5" />
            {formatCurrency(kpis.shortfallInMonth)} below expected on recorded payments this month.
          </p>
        ) : null}
      </div>
    </section>
  );
}
