'use client';

import { CheckCircle2, Landmark, TrendingUp, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChitsHeroProps {
  total: number;
  active: number;
  matured: number;
  withdrawn: number;
}

export function ChitsHero({ total, active, matured, withdrawn }: ChitsHeroProps) {
  const stats = [
    { label: 'Total chits', value: total, icon: Landmark },
    { label: 'Active', value: active, icon: TrendingUp },
    { label: 'Matured', value: matured, icon: CheckCircle2 },
    { label: 'Withdrawn', value: withdrawn, icon: Wallet },
  ];

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-secondary via-primary to-secondary p-6 text-white shadow-xl sm:p-8">
      <div className="pointer-events-none absolute -left-10 top-0 h-44 w-44 rounded-full bg-accent/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 right-0 h-40 w-40 rounded-full bg-info/20 blur-3xl" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(90deg, transparent 49%, white 50%, transparent 51%)',
          backgroundSize: '32px 32px',
        }}
      />
      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/55">
          Chit portfolio
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          Schemes & installments
        </h1>
        <p className="mt-2 max-w-lg text-sm text-white/70">
          Each chit auto-generates 20 installments. Track maturity, withdrawals, and collections in one place.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {stats.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className={cn(
                'rounded-xl border border-white/10 bg-white/5 px-3 py-3 backdrop-blur-sm',
                'transition-colors hover:bg-white/10 sm:py-4',
              )}
            >
              <Icon className="mb-2 h-4 w-4 text-accent" />
              <p className="text-xl font-bold tabular-nums sm:text-2xl">{value}</p>
              <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-white/50 sm:text-xs">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
