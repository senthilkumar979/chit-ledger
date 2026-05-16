import { describe, expect, it } from '@jest/globals';
import { buildEnterpriseDashboardMetrics } from '@/utils/enterprise-metrics';
import type { PaymentWithChit } from '@/utils/payment-month';

describe('buildEnterpriseDashboardMetrics', () => {
  it('computes cash collected growth from month totals', () => {
    const payments = [
      {
        id: '1',
        chit_id: 'c1',
        installment_no: 1,
        expected_amount: 5000,
        maturity_amount: 0,
        amount_paid: 5000,
        advance_amount_paid: 5000,
        status: 'paid',
        paid_date: '2026-05-10',
        payment_mode: null,
        paid_to: null,
        created_at: '',
        updated_at: '',
        chit: { start_date: '2026-01-01', type: 'ONE_LAKH', person: { name: 'A', city: 'Chennai' } },
      },
      {
        id: '2',
        chit_id: 'c1',
        installment_no: 2,
        expected_amount: 5000,
        maturity_amount: 0,
        amount_paid: 5000,
        advance_amount_paid: 5000,
        status: 'paid',
        paid_date: '2026-04-10',
        payment_mode: null,
        paid_to: null,
        created_at: '',
        updated_at: '',
        chit: { start_date: '2026-01-01', type: 'ONE_LAKH', person: { name: 'A', city: 'Chennai' } },
      },
    ] as PaymentWithChit[];

    const metrics = buildEnterpriseDashboardMetrics(
      { payments, chits: [{ id: 'c1', person_id: 'p1', matured: false, withdrawal: false }], loans: [], repayments: [] },
      '2026-05',
    );

    expect(metrics.executive.cashCollected.thisMonth).toBe(5000);
    expect(metrics.executive.cashCollected.lastMonth).toBe(5000);
    expect(metrics.funnel.collected).toBeGreaterThanOrEqual(0);
  });
});
