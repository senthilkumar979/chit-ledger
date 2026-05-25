import { describe, expect, it } from '@jest/globals';
import { buildEnterpriseDashboardMetrics } from '@/utils/enterprise-metrics';
import type { PaymentWithChit } from '@/utils/payment-month';

describe('buildEnterpriseDashboardMetrics', () => {
  it('computes cash collected growth from month totals', () => {
    const payments = [
      {
        id: '1',
        chit_id: 'c1',
        installment_no: 5,
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
        installment_no: 4,
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
      {
        payments,
        chits: [
          {
            id: 'c1',
            person_id: 'p1',
            start_date: '2026-01-01',
            end_date: '2027-08-01',
            matured: false,
            withdrawal: false,
            payments: payments.map((payment) => ({ ...payment, chit: undefined })),
          },
        ],
        loans: [],
        repayments: [],
      },
      '2026-05',
    );

    expect(metrics.executive.cashCollected.thisMonth).toBe(5000);
    expect(metrics.executive.cashCollected.lastMonth).toBe(5000);
    expect(metrics.funnel.expected).toBe(5000);
    expect(metrics.funnel.collected).toBe(5000);
  });

  it('matches the payments-page schedule logic for month expected totals', () => {
    const payments = [
      {
        id: 'p1',
        chit_id: 'late-start',
        installment_no: 2,
        expected_amount: 4480,
        maturity_amount: 0,
        amount_paid: 4480,
        advance_amount_paid: 4480,
        status: 'paid',
        paid_date: '2026-02-20',
        payment_mode: null,
        paid_to: null,
        created_at: '',
        updated_at: '',
        chit: {
          id: 'late-start',
          start_date: '2026-01-31',
          end_date: '2027-08-31',
          type: 'ONE_LAKH',
          person: { name: 'Late Start', city: 'Chennai' },
        },
      },
    ] as PaymentWithChit[];

    const metrics = buildEnterpriseDashboardMetrics(
      {
        payments,
        chits: [
          {
            id: 'late-start',
            person_id: 'p1',
            start_date: '2026-01-31',
            end_date: '2027-08-31',
            matured: false,
            withdrawal: false,
            payments: payments.map((payment) => ({ ...payment, chit: undefined })),
          },
        ],
        loans: [],
        repayments: [],
      },
      '2026-02',
    );

    expect(metrics.funnel.expected).toBe(4480);
    expect(metrics.funnel.collected).toBe(4480);
  });
});
