import { describe, expect, it } from '@jest/globals';
import { buildEnterpriseReportsMetrics } from '@/utils/enterprise-metrics';
import type { PaymentWithChit } from '@/utils/payment-month';

describe('enterprise cohort heatmap', () => {
  it('includes all cohorts and ignores installments not due yet', () => {
    const payments = [
      {
        id: 'c1-i1',
        chit_id: 'c1',
        installment_no: 1,
        expected_amount: 5000,
        maturity_amount: 73800,
        amount_paid: 5000,
        advance_amount_paid: 5000,
        status: 'paid',
        paid_date: '2026-01-05',
        payment_mode: null,
        paid_to: null,
        created_at: '',
        updated_at: '',
        chit: {
          id: 'c1',
          type: 'ONE_LAKH',
          category: '5th',
          start_date: '2026-01-01',
          person: { name: 'A', city: 'Chennai' },
        },
      },
      {
        id: 'c1-i2',
        chit_id: 'c1',
        installment_no: 2,
        expected_amount: 4000,
        maturity_amount: 75000,
        amount_paid: 2000,
        advance_amount_paid: 2000,
        status: 'partial',
        paid_date: '2026-02-05',
        payment_mode: null,
        paid_to: null,
        created_at: '',
        updated_at: '',
        chit: {
          id: 'c1',
          type: 'ONE_LAKH',
          category: '5th',
          start_date: '2026-01-01',
          person: { name: 'A', city: 'Chennai' },
        },
      },
      {
        id: 'c2-i1',
        chit_id: 'c2',
        installment_no: 1,
        expected_amount: 5000,
        maturity_amount: 73800,
        amount_paid: 0,
        advance_amount_paid: 0,
        status: 'pending',
        paid_date: null,
        payment_mode: null,
        paid_to: null,
        created_at: '',
        updated_at: '',
        chit: {
          id: 'c2',
          type: 'ONE_LAKH',
          category: '10th',
          start_date: '2026-03-01',
          person: { name: 'B', city: 'Madurai' },
        },
      },
      {
        id: 'future-i1',
        chit_id: 'future',
        installment_no: 1,
        expected_amount: 5000,
        maturity_amount: 73800,
        amount_paid: 0,
        advance_amount_paid: 0,
        status: 'pending',
        paid_date: null,
        payment_mode: null,
        paid_to: null,
        created_at: '',
        updated_at: '',
        chit: {
          id: 'future',
          type: 'ONE_LAKH',
          category: '15th',
          start_date: '2099-01-01',
          person: { name: 'Future', city: 'Salem' },
        },
      },
    ] as PaymentWithChit[];

    const metrics = buildEnterpriseReportsMetrics({
      payments,
      chits: [
        {
          id: 'c1',
          person_id: 'p1',
          type: 'ONE_LAKH',
          category: '5th',
          start_date: '2026-01-01',
          end_date: '2027-08-01',
          matured: false,
          withdrawal: false,
          person: { name: 'A', city: 'Chennai' },
        },
        {
          id: 'c2',
          person_id: 'p2',
          type: 'ONE_LAKH',
          category: '10th',
          start_date: '2026-03-01',
          end_date: '2027-10-01',
          matured: false,
          withdrawal: false,
          person: { name: 'B', city: 'Madurai' },
        },
        {
          id: 'future',
          person_id: 'p3',
          type: 'ONE_LAKH',
          category: '15th',
          start_date: '2099-01-01',
          end_date: '2100-08-01',
          matured: false,
          withdrawal: false,
          person: { name: 'Future', city: 'Salem' },
        },
      ],
      loans: [],
      repayments: [],
    });

    const cohorts = [...new Set(metrics.cohortHeatmap.map((cell) => cell.cohortMonth))];
    expect(cohorts).toEqual(['2026-01', '2026-03']);

    expect(
      metrics.cohortHeatmap.find(
        (cell) => cell.cohortMonth === '2026-01' && cell.installment === 1,
      )?.completionPct,
    ).toBe(100);

    expect(
      metrics.cohortHeatmap.find(
        (cell) => cell.cohortMonth === '2026-01' && cell.installment === 2,
      )?.completionPct,
    ).toBe(50);
  });
});
