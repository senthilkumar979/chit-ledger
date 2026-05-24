'use client';

import { cn, formatCurrency } from '@/lib/utils';
import type { ChitPaymentSummary } from '@/utils/chit-payment-summary';

interface MaturityPayoutBreakdownProps {
  summary: ChitPaymentSummary;
  compact?: boolean;
}

export function MaturityPayoutBreakdown({ summary, compact = false }: MaturityPayoutBreakdownProps) {
  const {
    maturityInstallmentNo,
    maturityBase,
    collectionVariance,
    netMaturityPayout,
    varianceLabel,
    usesRecordedWithdrawal,
  } = summary;
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
        {usesRecordedWithdrawal ? 'Withdrawal payout' : 'Maturity payout'}
        {maturityInstallmentNo != null ? (
          <span className="ml-1 font-normal normal-case tracking-normal text-muted">
            · installment #{maturityInstallmentNo}
          </span>
        ) : null}
      </p>
      <dl className="space-y-2 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted">
            {usesRecordedWithdrawal
              ? maturityInstallmentNo != null
                ? `Installment #${maturityInstallmentNo} maturity`
                : 'Withdrawal maturity base'
              : maturityInstallmentNo != null
                ? `Month ${maturityInstallmentNo} maturity`
                : 'Base maturity'}
          </dt>
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
          {usesRecordedWithdrawal
            ? 'Amount paid to the member when withdrawal was recorded.'
            : 'Uses the maturity ladder value for the latest recorded installment, adjusted by collection variance across all recorded payments.'}
        </p>
      ) : null}
    </div>
  );
}
