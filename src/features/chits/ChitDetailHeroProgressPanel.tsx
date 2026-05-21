'use client'

import { Wallet } from 'lucide-react'
import { ProgressRing } from './ProgressRing'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'
import { resolveChitPaymentSummary } from '@/utils/chit-payment-summary'
import { getChitWithdrawalEligibility } from './chit-status'
import type { ChitWithPayments } from '@/types/database'

interface ChitDetailHeroProgressPanelProps {
  chit: ChitWithPayments
  paidCount: number
  showWithdrawalCta: boolean
  onRecordWithdrawal?: () => void
}

export function ChitDetailHeroProgressPanel({
  chit,
  paidCount,
  showWithdrawalCta,
  onRecordWithdrawal,
}: ChitDetailHeroProgressPanelProps) {
  const summary = resolveChitPaymentSummary(chit.payments, chit)
  const withdrawal = getChitWithdrawalEligibility(chit.payments, chit)

  return (
    <div className="flex w-full flex-col gap-4 rounded-2xl border border-border/80 bg-gradient-to-br from-surface/90 via-card to-accent/[0.04] p-5 shadow-inner sm:max-w-[280px] lg:shrink-0">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted">
          Progress
        </p>
        <p className="mt-1 text-sm font-medium text-primary">
          {paidCount} of {chit.payments.length} paid
        </p>
      </div>
      <div className="flex justify-center py-1">
        <ProgressRing
          paid={paidCount}
          total={chit.payments.length}
          size={120}
        />
      </div>
      {showWithdrawalCta ? (
        <div className="space-y-2 border-t border-border/60 pt-4">
          <Button
            type="button"
            variant="accent"
            size="md"
            className="w-full shadow-md shadow-accent/20"
            disabled={!withdrawal.canRecord}
            title={withdrawal.disabledReason}
            onClick={onRecordWithdrawal}
          >
            <Wallet className="h-4 w-4" />
            Record withdrawal
          </Button>
          {withdrawal.disabledReason ? (
            <p className="text-center text-[11px] leading-snug text-muted">
              {withdrawal.disabledReason}
            </p>
          ) : null}
        </div>
      ) : null}
      {chit.withdrawal ||
      summary.paidInstallmentCount > 0 ||
      summary.partialCount > 0 ? (
        <div className="rounded-lg border border-accent/20 bg-accent/5 px-3 py-2 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
            {summary.usesRecordedWithdrawal ? 'Withdrawal paid' : 'Net payout'}
          </p>
          <p className="mt-0.5 text-sm font-bold tabular-nums text-accent">
            {formatCurrency(summary.netMaturityPayout)}
          </p>
          {!summary.usesRecordedWithdrawal && summary.collectionVariance !== 0 ? (
            <p className="mt-1 text-[10px] text-muted">
              {summary.varianceLabel}:{' '}
              {summary.collectionVariance > 0 ? '+' : '−'}
              {formatCurrency(Math.abs(summary.collectionVariance))}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
