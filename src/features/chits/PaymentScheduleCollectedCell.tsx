'use client';

import { formatCurrency } from '@/lib/utils';
import { getRecordedAmount, getInstallmentVariance, hasRecordedPayment } from '@/utils/chit-payment-summary';
import type { Payment } from '@/types/database';

interface PaymentScheduleCollectedCellProps {
  payment: Payment;
  stacked?: boolean;
}

export function PaymentScheduleCollectedCell({
  payment,
  stacked = false,
}: PaymentScheduleCollectedCellProps) {
  if (!hasRecordedPayment(payment)) {
    return <p className="text-sm font-medium text-muted">—</p>;
  }

  const collected = getRecordedAmount(payment);
  const variance = getInstallmentVariance(payment);

  if (stacked) {
    return (
      <div>
        <p className="text-sm font-semibold tabular-nums text-primary">{formatCurrency(collected)}</p>
        {variance !== 0 ? (
          <p
            className={
              variance > 0
                ? 'mt-0.5 text-[11px] font-medium text-accent'
                : 'mt-0.5 text-[11px] font-medium text-warning'
            }
          >
            {variance > 0 ? '+' : '−'}
            {formatCurrency(Math.abs(variance))} vs expected
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div>
      <p className="py-1 text-sm font-medium tabular-nums text-primary">{formatCurrency(collected)}</p>
      {variance !== 0 ? (
        <p className={variance > 0 ? 'text-[11px] text-accent' : 'text-[11px] text-warning'}>
          {variance > 0 ? '+' : '−'}
          {formatCurrency(Math.abs(variance))}
        </p>
      ) : null}
    </div>
  );
}
