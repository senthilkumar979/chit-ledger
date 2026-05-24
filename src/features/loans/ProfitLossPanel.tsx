'use client';

import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  Calendar,
  HandCoins,
  IndianRupee,
  Percent,
  Scale,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import type { LoanYearStats, YearProfitLoss } from '@/utils/profit-loss-metrics';
import type { LucideIcon } from 'lucide-react';

interface ProfitLossPanelProps {
  data: YearProfitLoss;
  loanStats: LoanYearStats;
  year: number;
  onYearChange: (year: number) => void;
  yearOptions: number[];
}

export function ProfitLossPanel({
  data,
  loanStats,
  year,
  onYearChange,
  yearOptions,
}: ProfitLossPanelProps) {
  const isProfit = data.netProfit >= 0;
  const marginPct =
    data.chitRevenue > 0 ? Math.round((data.netProfit / data.chitRevenue) * 100) : null;

  return (
    <section className="rounded-2xl border border-border/80 bg-card shadow-sm">
      <header className="flex flex-col gap-3 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h2 className="text-lg font-semibold text-primary">Profit & loss · {year}</h2>
          <p className="text-sm text-muted">
            Chit collections vs loan interest for the selected year, plus live loan exposure
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm text-muted">
          <Calendar className="h-4 w-4 shrink-0" />
          <select
            value={year}
            onChange={(e) => onYearChange(Number(e.target.value))}
            className="rounded-lg border border-border bg-card px-3 py-2 font-medium text-primary"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
      </header>

      <div className="p-4 sm:p-6">
        <div
          className={cn(
            'flex flex-col gap-4 rounded-xl border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5',
            isProfit ? 'border-accent/30 bg-accent/5' : 'border-danger/30 bg-danger/5',
          )}
        >
          <div className="flex items-center gap-3">
            {isProfit ? (
              <TrendingUp className="h-9 w-9 shrink-0 text-accent" />
            ) : (
              <TrendingDown className="h-9 w-9 shrink-0 text-danger" />
            )}
            <div>
              <p className="text-sm font-medium text-muted">
                Net {isProfit ? 'profit' : 'loss'} · {year}
              </p>
              <p
                className={cn(
                  'text-3xl font-bold tabular-nums tracking-tight',
                  isProfit ? 'text-accent' : 'text-danger',
                )}
              >
                {formatCurrency(Math.abs(data.netProfit))}
              </p>
              {marginPct != null ? (
                <p className="mt-0.5 text-xs text-muted">
                  {marginPct}% of chit revenue retained after loan interest
                </p>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <FlowPill
              icon={ArrowUpRight}
              label="Chit in"
              value={formatCurrency(data.chitRevenue)}
              tone="accent"
            />
            <FlowPill
              icon={ArrowDownRight}
              label="Interest out"
              value={formatCurrency(data.loanInterestExpense)}
              tone="danger"
            />
          </div>
        </div>

        <p className="mt-6 text-[10px] font-semibold uppercase tracking-wider text-muted">
          Year snapshot
        </p>
        <div className="mt-2 grid grid-cols-2 gap-3 lg:grid-cols-3">
          <StatCard
            icon={IndianRupee}
            label="Chit revenue"
            value={formatCurrency(data.chitRevenue)}
            tone="accent"
          />
          <StatCard
            icon={TrendingDown}
            label="Loan interest (expense)"
            value={formatCurrency(data.loanInterestExpense)}
            tone="danger"
          />
          <StatCard
            icon={Banknote}
            label="Principal borrowed"
            value={formatCurrency(data.totalPrincipalBorrowed)}
            sub={`${data.loansTakenCount} loan${data.loansTakenCount !== 1 ? 's' : ''} taken`}
          />
          <StatCard
            icon={Wallet}
            label="Principal repaid"
            value={formatCurrency(data.totalPrincipalRepaid)}
            sub={`${data.loansClosedCount} closed in ${year}`}
          />
          <StatCard
            icon={Percent}
            label="Interest paid"
            value={formatCurrency(loanStats.interestPaidInYear)}
            sub={`Recorded in ${year}`}
            tone="warning"
          />
          <StatCard
            icon={Scale}
            label="Net result"
            value={formatCurrency(data.netProfit)}
            tone={isProfit ? 'accent' : 'danger'}
          />
        </div>

        <p className="mt-6 text-[10px] font-semibold uppercase tracking-wider text-muted">
          Active loan exposure (today)
        </p>
        <div className="mt-2 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            icon={HandCoins}
            label="Active loans"
            value={String(loanStats.activeCount)}
            sub={formatCurrency(loanStats.pendingPrincipal) + ' outstanding'}
            highlight={loanStats.activeCount > 0}
          />
          <StatCard
            icon={Percent}
            label="Interest / month"
            value={formatCurrency(loanStats.monthlyInterestBurden)}
            sub="On current outstanding"
            tone="danger"
            highlight
          />
          <StatCard
            icon={TrendingUp}
            label="Interest so far"
            value={formatCurrency(loanStats.interestAccruedSoFar)}
            sub="Paid + accruing on active"
            tone="warning"
          />
          <StatCard
            icon={IndianRupee}
            label="All-time loans"
            value={String(loanStats.totalLoansAllTime)}
            sub={`${loanStats.loansTakenInYear} started in ${year}`}
          />
        </div>
      </div>
    </section>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  tone = 'default',
  highlight,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sub?: string;
  tone?: keyof typeof toneClasses;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border/80 bg-surface/30 p-3 sm:p-4',
        highlight && 'border-warning/25 ring-1 ring-warning/10',
      )}
    >
      <div className={cn('mb-2 inline-flex rounded-lg p-2', toneClasses[tone])}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted sm:text-xs">
        {label}
      </p>
      <p className="mt-0.5 text-lg font-bold tabular-nums text-primary sm:text-xl">{value}</p>
      {sub ? <p className="mt-1 text-[11px] text-muted">{sub}</p> : null}
    </div>
  );
}

function FlowPill({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  tone: 'accent' | 'danger';
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm',
        tone === 'accent' ? 'border-accent/25 bg-accent/10 text-accent' : 'border-danger/25 bg-danger/10 text-danger',
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>
        <span className="block text-[10px] font-semibold uppercase tracking-wider opacity-80">
          {label}
        </span>
        <span className="font-bold tabular-nums">{value}</span>
      </span>
    </span>
  );
}

const toneClasses = {
  accent: 'bg-accent/10 text-accent',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger',
  default: 'bg-card text-primary border border-border/60',
} as const;
