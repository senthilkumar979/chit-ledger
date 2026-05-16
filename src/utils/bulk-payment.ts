import type { Payment } from '@/types/database';

export function getUnpaidInstallments(payments: Payment[]): Payment[] {
  return [...payments]
    .filter((p) => p.status !== 'paid')
    .sort((a, b) => a.installment_no - b.installment_no);
}

export function getBulkPaymentTargets(
  payments: Payment[],
  count: number,
): Payment[] {
  if (count < 1) return [];
  return getUnpaidInstallments(payments).slice(0, count);
}

export function sumExpectedAmount(installments: Payment[]): number {
  return installments.reduce((sum, p) => sum + Number(p.expected_amount), 0);
}

export interface BulkPaymentPreview {
  targets: Payment[];
  totalAmount: number;
  fromInstallment: number | null;
  toInstallment: number | null;
}

export function previewBulkPayment(
  payments: Payment[],
  count: number,
): BulkPaymentPreview {
  const targets = getBulkPaymentTargets(payments, count);
  const fromInstallment = targets[0]?.installment_no ?? null;
  const toInstallment = targets[targets.length - 1]?.installment_no ?? null;
  return {
    targets,
    totalAmount: sumExpectedAmount(targets),
    fromInstallment,
    toInstallment,
  };
}
