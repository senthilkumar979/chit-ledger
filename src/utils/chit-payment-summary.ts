import type { Chit, Payment } from '@/types/database';
import { getChitSchedule, type ChitType } from '@/constants/chit-config';

export type ChitWithdrawalSnapshot = Pick<
  Chit,
  'withdrawal' | 'withdrawal_net_amount' | 'collection_variance'
> & {
  type?: ChitType;
};

function amountsEqual(a: number, b: number): boolean {
  return Math.round(a) === Math.round(b);
}

/** Maturity ladder value before collection variance (net payout − variance). */
export function getMaturityBaseFromWithdrawal(
  withdrawalNetAmount: number,
  collectionVariance: number | null | undefined,
): number {
  if (collectionVariance != null) {
    return Number(withdrawalNetAmount) - Number(collectionVariance);
  }
  return Number(withdrawalNetAmount);
}

/**
 * Installment whose maturity amount (payments table / chit-config ladder) matches
 * the withdrawal payout — not withdrawal_date.
 */
export function findWithdrawalInstallmentNo(
  payments: Payment[],
  withdrawalNetAmount: number | null | undefined,
  collectionVariance: number | null | undefined,
  chitType?: ChitType | null,
): number | null {
  if (withdrawalNetAmount == null) return null;

  const net = Number(withdrawalNetAmount);
  const maturityBase = getMaturityBaseFromWithdrawal(net, collectionVariance);

  const fromPayments = payments.find((p) =>
    amountsEqual(Number(p.maturity_amount), maturityBase),
  );
  if (fromPayments) return fromPayments.installment_no;

  if (chitType) {
    const schedule = getChitSchedule(chitType);
    const index = schedule.maturity.findIndex((amount) => amountsEqual(amount, maturityBase));
    if (index >= 0) return index + 1;
  }

  const fromNet = payments.find((p) => amountsEqual(Number(p.maturity_amount), net));
  return fromNet?.installment_no ?? null;
}

export function getRecordedAmount(payment: Payment): number {
  const amount = payment.amount_paid != null ? Number(payment.amount_paid) : null;
  const advance =
    payment.advance_amount_paid != null ? Number(payment.advance_amount_paid) : null;

  if (amount != null && amount > 0) return amount;
  if (advance != null && advance > 0) return advance;
  return 0;
}

export function hasRecordedPayment(payment: Payment): boolean {
  return payment.status === 'paid' || payment.status === 'partial';
}

export function getInstallmentVariance(payment: Payment): number {
  if (!hasRecordedPayment(payment)) return 0;
  return getRecordedAmount(payment) - Number(payment.expected_amount);
}

/** Latest installment with a recorded collection — drives maturity ladder at withdrawal. */
export function getHighestRecordedInstallment(payments: Payment[]): Payment | null {
  let highest: Payment | null = null;

  for (const payment of payments) {
    if (!hasRecordedPayment(payment)) continue;
    if (!highest || payment.installment_no > highest.installment_no) {
      highest = payment;
    }
  }

  return highest;
}

export type CollectionVarianceLabel = 'Extra paid' | 'Shortfall' | 'Balanced';

export interface ChitPaymentSummary {
  totalCollected: number;
  totalExpectedOnRecorded: number;
  collectionVariance: number;
  varianceLabel: CollectionVarianceLabel;
  outstanding: number;
  paidInstallmentCount: number;
  partialCount: number;
  overdueCount: number;
  maturityInstallmentNo: number | null;
  maturityBase: number;
  netMaturityPayout: number;
  /** True when net payout comes from a recorded withdrawal, not the live ladder. */
  usesRecordedWithdrawal: boolean;
}

export function summarizeChitPayments(payments: Payment[]): ChitPaymentSummary {
  let totalCollected = 0;
  let totalExpectedOnRecorded = 0;
  let outstanding = 0;
  let paidInstallmentCount = 0;
  let partialCount = 0;
  let overdueCount = 0;

  for (const payment of payments) {
    const expected = Number(payment.expected_amount);

    if (payment.status === 'overdue') overdueCount++;

    if (hasRecordedPayment(payment)) {
      const collected = getRecordedAmount(payment);
      totalCollected += collected;
      totalExpectedOnRecorded += expected;

      if (payment.status === 'paid') paidInstallmentCount++;
      if (payment.status === 'partial') {
        partialCount++;
        outstanding += Math.max(0, expected - collected);
      }
    } else if (payment.status === 'pending' || payment.status === 'overdue') {
      outstanding += expected;
    }
  }

  const collectionVariance = totalCollected - totalExpectedOnRecorded;
  const maturityAnchor = getHighestRecordedInstallment(payments);
  const maturityInstallmentNo = maturityAnchor?.installment_no ?? null;
  const maturityBase = maturityAnchor ? Number(maturityAnchor.maturity_amount) : 0;
  const netMaturityPayout = maturityBase + collectionVariance;

  const varianceLabel: CollectionVarianceLabel =
    collectionVariance > 0 ? 'Extra paid' : collectionVariance < 0 ? 'Shortfall' : 'Balanced';

  return {
    totalCollected,
    totalExpectedOnRecorded,
    collectionVariance,
    varianceLabel,
    outstanding,
    paidInstallmentCount,
    partialCount,
    overdueCount,
    maturityInstallmentNo,
    maturityBase,
    netMaturityPayout,
    usesRecordedWithdrawal: false,
  };
}

/** Applies stored withdrawal payout when the chit has been withdrawn. */
export function resolveChitPaymentSummary(
  payments: Payment[],
  chit?: ChitWithdrawalSnapshot | null,
): ChitPaymentSummary {
  const summary = summarizeChitPayments(payments);

  if (!chit?.withdrawal) return summary;

  const netMaturityPayout =
    chit.withdrawal_net_amount != null
      ? Number(chit.withdrawal_net_amount)
      : summary.netMaturityPayout;
  const collectionVariance =
    chit.collection_variance != null
      ? Number(chit.collection_variance)
      : summary.collectionVariance;
  const maturityBase = netMaturityPayout - collectionVariance;
  const withdrawalInstallmentNo = findWithdrawalInstallmentNo(
    payments,
    chit.withdrawal_net_amount,
    chit.collection_variance,
    chit.type,
  );

  const varianceLabel: CollectionVarianceLabel =
    collectionVariance > 0 ? 'Extra paid' : collectionVariance < 0 ? 'Shortfall' : 'Balanced';

  return {
    ...summary,
    maturityInstallmentNo: withdrawalInstallmentNo ?? summary.maturityInstallmentNo,
    maturityBase,
    collectionVariance,
    varianceLabel,
    netMaturityPayout,
    usesRecordedWithdrawal: true,
  };
}
