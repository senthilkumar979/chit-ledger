import { describe, expect, it } from '@jest/globals';
import {
  getInstallmentVariance,
  getRecordedAmount,
  resolveChitPaymentSummary,
  summarizeChitPayments,
} from '@/utils/chit-payment-summary';
import type { Payment } from '@/types/database';

function payment(overrides: Partial<Payment>): Payment {
  return {
    id: 'p1',
    chit_id: 'c1',
    installment_no: 1,
    expected_amount: 4480,
    maturity_amount: 95000,
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

describe('chit-payment-summary', () => {
  it('reads amount from advance_amount_paid when amount_paid is zero', () => {
    const p = payment({
      status: 'paid',
      amount_paid: 0,
      advance_amount_paid: 4500,
      paid_date: '2026-01-01',
    });
    expect(getRecordedAmount(p)).toBe(4500);
  });

  it('stores variance when paid over expected', () => {
    const p = payment({
      status: 'paid',
      amount_paid: 4500,
      paid_date: '2026-01-01',
    });
    expect(getRecordedAmount(p)).toBe(4500);
    expect(getInstallmentVariance(p)).toBe(20);
  });

  it('stores variance when paid under expected', () => {
    const p = payment({
      status: 'partial',
      amount_paid: 4400,
      paid_date: '2026-01-01',
    });
    expect(getInstallmentVariance(p)).toBe(-80);
  });

  it('uses latest recorded installment maturity, not installment 20', () => {
    const payments: Payment[] = [
      payment({
        installment_no: 1,
        status: 'paid',
        amount_paid: 4500,
        expected_amount: 4480,
        maturity_amount: 73800,
      }),
      payment({
        installment_no: 15,
        status: 'paid',
        amount_paid: 4750,
        expected_amount: 4750,
        maturity_amount: 90000,
      }),
      payment({
        installment_no: 20,
        status: 'pending',
        expected_amount: 3000,
        maturity_amount: 95000,
      }),
    ];
    const summary = summarizeChitPayments(payments);
    expect(summary.maturityInstallmentNo).toBe(15);
    expect(summary.maturityBase).toBe(90000);
    expect(summary.collectionVariance).toBe(20);
    expect(summary.netMaturityPayout).toBe(90020);
    expect(summary.varianceLabel).toBe('Extra paid');
  });

  it('uses recorded withdrawal amount when chit is withdrawn', () => {
    const payments: Payment[] = [
      payment({
        installment_no: 15,
        status: 'paid',
        amount_paid: 4750,
        expected_amount: 4750,
        maturity_amount: 90000,
      }),
      payment({
        installment_no: 20,
        status: 'pending',
        maturity_amount: 95000,
      }),
    ];
    const summary = resolveChitPaymentSummary(payments, {
      withdrawal: true,
      withdrawal_net_amount: 88500,
      collection_variance: -1500,
    });
    expect(summary.usesRecordedWithdrawal).toBe(true);
    expect(summary.maturityInstallmentNo).toBeNull();
    expect(summary.netMaturityPayout).toBe(88500);
    expect(summary.collectionVariance).toBe(-1500);
    expect(summary.maturityBase).toBe(90000);
  });
});
