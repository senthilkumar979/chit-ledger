'use client'

import { chitTypeLabels } from '@/constants/chit-labels'
import { MaturityPayoutBreakdown } from '@/components/payments/MaturityPayoutBreakdown'
import { formatCurrency, formatDate } from '@/lib/utils'
import { formatInstallmentDueMonth } from '@/utils/installment-due'
import { resolveChitPaymentSummary } from '@/utils/chit-payment-summary'
import type { Chit, Payment } from '@/types/database'

interface ChitWithdrawalSummaryProps {
  chit: Chit
  payments: Payment[]
}

export function ChitWithdrawalSummary({
  chit,
  payments,
}: ChitWithdrawalSummaryProps) {
  const summary = resolveChitPaymentSummary(payments, chit)
  const installmentNo = summary.maturityInstallmentNo
  const dueMonth =
    chit.start_date && installmentNo != null
      ? formatInstallmentDueMonth(chit.start_date, installmentNo)
      : null

  return (
    <div className="space-y-4 rounded-2xl border border-danger/20 bg-danger/[0.04] p-4 sm:p-6">
      <div>
        <h3 className="font-semibold text-danger">Withdrawal recorded</h3>
        <p className="mt-1 text-2xl font-bold tabular-nums text-primary sm:text-3xl">
          {formatCurrency(summary.netMaturityPayout)}
        </p>
        <p className="mt-0.5 text-xs text-muted">Net maturity paid to member</p>
      </div>

      {installmentNo != null ? (
        <div className="rounded-xl border border-danger/25 bg-danger/[0.06] px-4 py-3 text-sm">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
            Maturity installment
          </p>
          <p className="mt-1 font-semibold text-danger">
            Installment #{installmentNo}
            {dueMonth ? (
              <span className="font-medium text-primary">
                {' '}
                · Withdrawn in {dueMonth}
              </span>
            ) : null}
          </p>
        </div>
      ) : null}

      <MaturityPayoutBreakdown summary={summary} compact />

      <dl className="flex gap-5 text-sm justify-between">
        {chit.withdrawal_date ? (
          <div>
            <dt className="text-muted">Date</dt>
            <dd className="font-medium text-primary">
              {formatDate(chit.withdrawal_date)}
            </dd>
          </div>
        ) : null}
        <div>
          <dt className="text-muted">Taken by</dt>
          <dd className="font-medium text-primary">
            {chit.withdrawal_by ?? '—'}
          </dd>
        </div>
        <div>
          <dt className="text-muted">Mode</dt>
          <dd className="font-medium text-primary">
            {chit.withdrawal_payment_mode ?? '—'}
          </dd>
        </div>
        {chit.withdrawal_proof_url ? (
          <div>
            <dt className="text-muted">Proof</dt>
            <dd>
              <a
                href={chit.withdrawal_proof_url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-accent hover:underline"
              >
                View document
              </a>
            </dd>
          </div>
        ) : null}
      </dl>
    </div>
  )
}
