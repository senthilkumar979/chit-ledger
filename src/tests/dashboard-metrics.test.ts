import { describe, expect, it } from '@jest/globals';
import { computeDashboardMonthKpis } from '@/utils/dashboard-metrics';
import type { PaymentWithChit } from '@/utils/payment-month';

describe('computeDashboardMonthKpis', () => {
  it('sums calendar-month collections and extra amount', () => {
    const monthKey = '2026-05';
    const payments = [
      {
        id: '1',
        chit_id: 'c1',
        installment_no: 10,
        expected_amount: 4480,
        maturity_amount: 0,
        amount_paid: 4500,
        advance_amount_paid: 4500,
        status: 'paid',
        paid_date: '2026-05-10',
        payment_mode: null,
        paid_to: null,
        created_at: '',
        updated_at: '',
        chit: {
          start_date: '2025-08-01',
          category: '5th of every month',
          person: { name: 'A', city: 'Chennai' },
        },
      },
    ] as PaymentWithChit[];

    const kpis = computeDashboardMonthKpis(payments, [{ id: 'c1', matured: false, withdrawal: false }], monthKey);

    expect(kpis.collectedInMonth).toBe(4500);
    expect(kpis.extraCollectedInMonth).toBe(20);
    expect(kpis.totalChits).toBe(1);
  });
});
