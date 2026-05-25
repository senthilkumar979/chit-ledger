'use client';

import { TrendingDown, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { AnimatedCounter } from '@/components/analytics/AnimatedCounter';
import { Sparkline } from '@/components/analytics/Sparkline';
import { formatCurrency, cn } from '@/lib/utils';
import type { ExecutiveSnapshot } from '@/utils/enterprise-metrics';

interface ExecutiveSnapshotSectionProps {
  data: ExecutiveSnapshot;
}

export function ExecutiveSnapshotSection({ data }: ExecutiveSnapshotSectionProps) {
  const growthPositive = data.cashCollected.growthPct >= 0;
  const donut = [
    { name: 'Healthy', value: data.outstanding.progressPct },
    { name: 'At risk', value: Math.max(0, 100 - data.outstanding.progressPct) },
  ];

  return (
    <section className="sticky top-14 z-10 -mx-4 border-b border-border/80 bg-background/95 px-4 py-3 backdrop-blur-sm sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        <SnapshotCard title="Cash collected" question="Are collections improving?">
          <p className="text-lg font-bold tabular-nums sm:text-xl">
            <AnimatedCounter value={data.cashCollected.thisMonth} isCurrency />
          </p>
          <p className="text-xs text-muted">Today {formatCurrency(data.cashCollected.today)}</p>
          <div className="mt-2 flex items-end justify-between gap-2">
            <span
              className={cn(
                'flex items-center gap-0.5 text-xs font-semibold',
                growthPositive ? 'text-accent' : 'text-danger',
              )}
            >
              {growthPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {data.cashCollected.growthPct}% vs last month
            </span>
            <Sparkline data={data.cashCollected.sparkline} positive={growthPositive} />
          </div>
        </SnapshotCard>

        <SnapshotCard title="Outstanding" question="How much money is blocked?">
          <p className="text-lg font-bold tabular-nums">{formatCurrency(data.outstanding.totalDue)}</p>
          <p className="text-xs text-muted">Pending for selected month</p>
          <p className="text-xs text-danger">Overdue {formatCurrency(data.outstanding.overdue)}</p>
          <p className="text-xs text-muted">Partial {formatCurrency(data.outstanding.partialPending)}</p>
          <div className="mt-1 h-12">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={donut} innerRadius={14} outerRadius={22} dataKey="value" stroke="none">
                  <Cell fill="#16A34A" />
                  <Cell fill="#FECACA" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </SnapshotCard>

        <SnapshotCard title="Loan exposure" question="How risky is our borrowing?">
          <p className="text-lg font-bold">{data.loanExposure.activeLoans} active</p>
          <p className="text-xs tabular-nums">{formatCurrency(data.loanExposure.principalOutstanding)}</p>
          <p className="text-xs text-muted">
            ~{formatCurrency(data.loanExposure.monthlyInterestBurden)}/mo interest
          </p>
          <DebtGauge pct={Math.min(100, data.loanExposure.principalOutstanding / 10000)} />
        </SnapshotCard>

        <SnapshotCard title="Withdrawal liability" question="How much do we owe members?">
          <p className="text-lg font-bold">{data.withdrawalLiability.maturedNotWithdrawn} chits</p>
          <p className="text-xs tabular-nums">{formatCurrency(data.withdrawalLiability.totalPayoutLiability)}</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface">
            <div
              className="h-full rounded-full bg-primary"
              style={{
                width: `${Math.min(100, data.withdrawalLiability.maturedNotWithdrawn * 10)}%`,
              }}
            />
          </div>
        </SnapshotCard>
      </div>
    </section>
  );
}

function SnapshotCard({
  title,
  question,
  children,
}: {
  title: string;
  question: string;
  children: React.ReactNode;
}) {
  return (
    <article className="rounded-xl border border-border bg-card p-3 shadow-sm sm:p-4" title={question}>
      <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted">{title}</h3>
      {children}
    </article>
  );
}

function DebtGauge({ pct }: { pct: number }) {
  return (
    <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface">
      <div
        className={cn(
          'h-full rounded-full',
          pct > 70 ? 'bg-danger' : pct > 40 ? 'bg-warning' : 'bg-accent',
        )}
        style={{ width: `${Math.min(100, pct)}%` }}
      />
    </div>
  );
}
