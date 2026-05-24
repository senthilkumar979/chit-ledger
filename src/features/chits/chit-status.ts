import type { Chit, Payment } from '@/types/database';
import { hasRecordedPayment } from '@/utils/chit-payment-summary';
import { formatDate } from '@/lib/utils';

export type ChitLifecycleVariant = 'success' | 'info' | 'danger';

export interface ChitLifecycleStatus {
  label: string;
  variant: ChitLifecycleVariant;
}

export function getChitLifecycleStatus(chit: Chit): ChitLifecycleStatus {
  if (chit.withdrawal) return { label: 'Withdrawn', variant: 'danger' };
  if (chit.matured) return { label: 'Matured', variant: 'info' };
  return { label: 'Active', variant: 'success' };
}

/** Table cell label; em dash when not withdrawn or date missing. */
export function getChitWithdrawalDateLabel(
  chit: Pick<Chit, 'withdrawal' | 'withdrawal_date'>,
): string {
  if (!chit.withdrawal || !chit.withdrawal_date) return '—';
  return formatDate(chit.withdrawal_date);
}

export function countPaidInstallments(chit: Chit): number {
  return chit.payments?.filter((p) => p.status === 'paid').length ?? 0;
}

export function countRecordedPayments(payments: Payment[]): number {
  return payments.filter(hasRecordedPayment).length;
}

export interface ChitWithdrawalEligibility {
  canRecord: boolean;
  disabledReason?: string;
}

export function getChitWithdrawalEligibility(
  payments: Payment[],
  chit: Pick<Chit, 'withdrawal'>,
): ChitWithdrawalEligibility {
  const recordedCount = countRecordedPayments(payments);

  if (chit.withdrawal) {
    return { canRecord: false, disabledReason: 'Withdrawal already recorded' };
  }

  if (recordedCount === 0) {
    return {
      canRecord: false,
      disabledReason: 'Record at least one installment payment first',
    };
  }

  return { canRecord: true };
}
