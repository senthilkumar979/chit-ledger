import type { PaymentStatus } from '@/types/database';

export function computePaymentStatus(
  expected: number,
  amountPaid: number,
): PaymentStatus {
  if (amountPaid >= expected) return 'paid';
  if (amountPaid > 0) return 'partial';
  return 'pending';
}

export function paymentStatusLabel(status: PaymentStatus): string {
  const labels: Record<PaymentStatus, string> = {
    pending: 'Pending',
    paid: 'Paid',
    partial: 'Partial',
    overdue: 'Overdue',
  };
  return labels[status];
}

export function paymentStatusVariant(
  status: PaymentStatus,
): 'default' | 'success' | 'warning' | 'danger' | 'info' {
  const map: Record<PaymentStatus, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
    pending: 'default',
    paid: 'success',
    partial: 'warning',
    overdue: 'danger',
  };
  return map[status];
}
