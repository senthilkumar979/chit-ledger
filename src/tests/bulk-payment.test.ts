import { describe, expect, it } from '@jest/globals';
import {
  getBulkPaymentTargets,
  getUnpaidInstallments,
  previewBulkPayment,
} from '@/utils/bulk-payment';
import type { Payment } from '@/types/database';

function payment(overrides: Partial<Payment>): Payment {
  return {
    id: overrides.id ?? 'p1',
    chit_id: 'c1',
    installment_no: 1,
    expected_amount: 1000,
    maturity_amount: 50000,
    paid_date: null,
    payment_mode: null,
    paid_to: null,
    advance_amount_paid: 0,
    amount_paid: 0,
    status: 'pending',
    created_at: '',
    updated_at: '',
    ...overrides,
  };
}

describe('bulk-payment', () => {
  const payments = [
    payment({ id: 'p1', installment_no: 1, status: 'paid' }),
    payment({ id: 'p2', installment_no: 2, status: 'pending', expected_amount: 2000 }),
    payment({ id: 'p3', installment_no: 3, status: 'overdue', expected_amount: 3000 }),
    payment({ id: 'p4', installment_no: 4, status: 'partial', expected_amount: 4000 }),
  ];

  it('lists unpaid installments in order', () => {
    const unpaid = getUnpaidInstallments(payments);
    expect(unpaid.map((p) => p.installment_no)).toEqual([2, 3, 4]);
  });

  it('selects the next N unpaid installments', () => {
    const targets = getBulkPaymentTargets(payments, 2);
    expect(targets.map((p) => p.installment_no)).toEqual([2, 3]);
  });

  it('previews installment range and total', () => {
    const preview = previewBulkPayment(payments, 2);
    expect(preview.fromInstallment).toBe(2);
    expect(preview.toInstallment).toBe(3);
    expect(preview.totalAmount).toBe(5000);
  });
});
