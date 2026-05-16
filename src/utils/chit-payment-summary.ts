import type { Payment } from '@/types/database';

export function getRecordedAmount(payment: Payment): number {
  const raw = payment.amount_paid ?? payment.advance_amount_paid;
  if (raw == null) return 0;
  return Number(raw);
}

export function hasRecordedPayment(payment: Payment): boolean {
  return payment.status === 'paid' || payment.status === 'partial';
}

export function getInstallmentVariance(payment: Payment): number {
  if (!hasRecordedPayment(payment)) return 0;
  return getRecordedAmount(payment) - Number(payment.expected_amount);
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
  maturityBase: number;
  netMaturityPayout: number;
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
  const maturityPayment = payments.find((p) => p.installment_no === 20);
  const maturityBase = maturityPayment ? Number(maturityPayment.maturity_amount) : 0;
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
    maturityBase,
    netMaturityPayout,
  };
}
