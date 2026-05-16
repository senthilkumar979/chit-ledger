'use client';

import { cn, formatCurrency } from '@/lib/utils';
import type { ChitPaymentSummary } from '@/utils/chit-payment-summary';

interface MaturityPayoutBreakdownProps {
  summary: ChitPaymentSummary;
  compact?: boolean;
}

export function MaturityPayoutBreakdown({ summary, compact = false }: MaturityPayoutBreakdownProps) {
  const { maturityBase, collectionVariance, netMaturityPayout, varianceLabel } = summary;
  const adjustmentTone =
    collectionVariance > 0 ? 'text-accent' : collectionVariance < 0 ? 'text-warning' : 'text-muted';

  return (
    <div
      className={
        compact
          ? 'space-y-2 rounded-xl border border-border/80 bg-surface/60 p-3 text-sm'
          : 'space-y-3 rounded-xl border border-accent/20 bg-accent/5 p-4'
      }
    >
      <p
        className={
          compact
            ? 'text-xs font-semibold uppercase tracking-wider text-muted'
            : 'font-semibold text-primary'
        }
      >
        Maturity payout
      </p>
      <dl className="space-y-2 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted">Base maturity</dt>
          <dd className="font-semibold tabular-nums text-primary">{formatCurrency(maturityBase)}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted">{varianceLabel}</dt>
          <dd className={cn('font-semibold tabular-nums', adjustmentTone)}>
            {collectionVariance === 0
              ? '—'
              : `${collectionVariance > 0 ? '+' : '−'}${formatCurrency(Math.abs(collectionVariance))}`}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-2">
          <dt className="font-medium text-primary">Net payout</dt>
          <dd className="text-base font-bold tabular-nums text-accent">
            {formatCurrency(netMaturityPayout)}
          </dd>
        </div>
      </dl>
      {!compact ? (
        <p className="text-xs leading-relaxed text-muted">
          Net payout adjusts the base maturity by the total difference between amounts collected and
          expected across recorded installments.
        </p>
      ) : null}
    </div>
  );
}
