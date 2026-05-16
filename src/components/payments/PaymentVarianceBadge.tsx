'use client';

import { cn, formatCurrency } from '@/lib/utils';
import { getInstallmentVariance, hasRecordedPayment } from '@/utils/chit-payment-summary';
import type { Payment } from '@/types/database';

interface PaymentVarianceBadgeProps {
  payment: Payment;
  className?: string;
}

export function PaymentVarianceBadge({ payment, className }: PaymentVarianceBadgeProps) {
  if (!hasRecordedPayment(payment)) return null;

  const variance = getInstallmentVariance(payment);
  if (variance === 0) return null;

  const isExtra = variance > 0;

  return (
    <span
      className={cn(
        'inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-semibold tabular-nums',
        isExtra ? 'bg-accent/15 text-accent' : 'bg-warning/15 text-warning',
        className,
      )}
    >
      {isExtra ? '+' : '−'}
      {formatCurrency(Math.abs(variance)).replace('₹', '')}
    </span>
  );
}
