'use client';

import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { rateToPercentLabel } from '@/utils/loan-calculations';
import type { LoanInterestBreakdown } from '@/utils/loan-calculations';

interface LoanInterestBreakdownCardProps {
  principal: number;
  rate: number;
  startDate: string;
  closeDate: string;
  breakdown: LoanInterestBreakdown;
  periodLabel?: string;
}

export function LoanInterestBreakdownCard({
  principal,
  rate,
  startDate,
  closeDate,
  breakdown,
  periodLabel,
}: LoanInterestBreakdownCardProps) {
  const { monthlyInterest, monthsHeld, totalInterest } = breakdown;

  return (
    <div className="rounded-xl border border-border/80 bg-surface/60 px-4 py-4 text-sm shadow-sm">
      {periodLabel ? (
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">{periodLabel}</p>
      ) : null}
      <p className={cn(periodLabel ? 'mt-2' : '', 'text-muted')}>
        Principal{' '}
        <span className="font-semibold text-primary">{formatCurrency(principal)}</span>
      </p>
      <p className="mt-1 text-muted">
        Rate{' '}
        <span className="font-medium text-primary">{rateToPercentLabel(rate)} per month</span>
        {' · '}
        {periodLabel ?? `From ${formatDate(startDate)}`}
      </p>
      <p className="mt-1 text-muted">
        Repayment date{' '}
        <span className="font-medium text-primary">{formatDate(closeDate)}</span>
        {' · '}
        {monthsHeld} month{monthsHeld !== 1 ? 's' : ''} held
      </p>

      <dl className="mt-3 grid gap-2 rounded-lg border border-border/60 bg-card/80 px-3 py-3">
        <div className="flex items-baseline justify-between gap-2">
          <dt className="text-xs font-medium uppercase tracking-wider text-muted">
            Interest per month
          </dt>
          <dd className="text-right font-semibold tabular-nums text-primary">
            {formatCurrency(monthlyInterest)}
          </dd>
        </div>
        <dd className="-mt-1 text-right text-[11px] text-muted">
          {formatCurrency(principal)} × {rateToPercentLabel(rate)}
        </dd>
        <div className="flex items-baseline justify-between gap-2 border-t border-border/50 pt-2">
          <dt className="text-xs font-medium uppercase tracking-wider text-muted">
            Total interest
          </dt>
          <dd className="text-right font-semibold tabular-nums text-accent">
            {formatCurrency(totalInterest)}
          </dd>
        </div>
        <dd className="-mt-1 text-right text-[11px] text-muted">
          {formatCurrency(monthlyInterest)} × {monthsHeld} month
          {monthsHeld !== 1 ? 's' : ''}
        </dd>
      </dl>
    </div>
  );
}
