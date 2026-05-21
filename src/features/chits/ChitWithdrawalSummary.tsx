'use client';

import { formatCurrency } from '@/lib/utils';
import { MaturityPayoutBreakdown } from '@/components/payments/MaturityPayoutBreakdown';
import { resolveChitPaymentSummary } from '@/utils/chit-payment-summary';
import type { Chit, Payment } from '@/types/database';

interface ChitWithdrawalSummaryProps {
  chit: Chit;
  payments: Payment[];
}

export function ChitWithdrawalSummary({ chit, payments }: ChitWithdrawalSummaryProps) {
  const summary = resolveChitPaymentSummary(payments, chit);

  return (
    <div className="space-y-4 rounded-2xl border border-info/20 bg-info/5 p-4 sm:p-6">
      <div>
        <h3 className="font-semibold text-info">Withdrawal recorded</h3>
        <p className="mt-1 text-2xl font-bold tabular-nums text-primary sm:text-3xl">
          {formatCurrency(summary.netMaturityPayout)}
        </p>
        <p className="mt-0.5 text-xs text-muted">Net maturity paid to member</p>
      </div>

      <MaturityPayoutBreakdown summary={summary} compact />

      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted">Date</dt>
          <dd className="font-medium text-primary">{chit.withdrawal_date}</dd>
        </div>
        <div>
          <dt className="text-muted">Taken by</dt>
          <dd className="font-medium text-primary">{chit.withdrawal_by}</dd>
        </div>
        <div>
          <dt className="text-muted">Mode</dt>
          <dd className="font-medium text-primary">{chit.withdrawal_payment_mode}</dd>
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
  );
}
