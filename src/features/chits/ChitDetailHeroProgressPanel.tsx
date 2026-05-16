'use client'

import { Wallet } from 'lucide-react'
import { ProgressRing } from './ProgressRing'
import { Button } from '@/components/ui/Button'
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
  const paidFully = paidCount >= chit.payments.length

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
            disabled={chit.matured || chit.withdrawal}
            title={
              !chit.matured
                ? 'Pay installment 20 in full to mature this chit'
                : undefined
            }
            onClick={onRecordWithdrawal}
          >
            <Wallet className="h-4 w-4" />
            Record withdrawal
          </Button>
          {!chit.matured ? (
            <p className="text-center text-[11px] leading-snug text-muted">
              Maturity is set automatically when installment 20 is paid in full.
            </p>
          ) : null}
        </div>
      ) : null}
      {paidFully && chit.matured && !chit.withdrawal ? (
        <p className="text-center text-[11px] text-accent">
          Ready to record payout.
        </p>
      ) : null}
    </div>
  )
}
