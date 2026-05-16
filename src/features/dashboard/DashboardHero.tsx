'use client';

import { AlertTriangle, Clock, IndianRupee, Landmark, CheckCircle2 } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';

interface DashboardHeroProps {
  activeChits: number;
  pendingCollections: number;
  monthlyRevenue: number;
  maturedChits: number;
  overdueAccounts: number;
}

export function DashboardHero({
  activeChits,
  pendingCollections,
  monthlyRevenue,
  maturedChits,
  overdueAccounts,
}: DashboardHeroProps) {
  const stats = [
    { label: 'Active chits', value: String(activeChits), icon: Landmark },
    {
      label: 'Due this month',
      value: formatCurrency(pendingCollections),
      icon: Clock,
      highlight: true,
    },
    { label: 'Collected (month)', value: formatCurrency(monthlyRevenue), icon: IndianRupee },
    { label: 'Matured', value: String(maturedChits), icon: CheckCircle2 },
    {
      label: 'Overdue',
      value: String(overdueAccounts),
      icon: AlertTriangle,
      warn: overdueAccounts > 0,
    },
  ];

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-secondary via-primary to-secondary p-6 text-white shadow-xl sm:p-8">
      <div className="pointer-events-none absolute -left-10 top-0 h-44 w-44 rounded-full bg-accent/25 blur-3xl" />
      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/55">Portfolio</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Dashboard</h1>
        <p className="mt-2 max-w-lg text-sm text-white/70">
          Pending collections reflect installments due in the current month only.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {stats.map(({ label, value, icon: Icon, highlight, warn }) => (
            <div
              key={label}
              className={cn(
                'rounded-xl border border-white/10 bg-white/5 px-3 py-3 backdrop-blur-sm',
                highlight && 'ring-1 ring-warning/40',
                warn && 'ring-1 ring-danger/40',
              )}
            >
              <Icon className={cn('mb-2 h-4 w-4', warn ? 'text-danger' : 'text-accent')} />
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
