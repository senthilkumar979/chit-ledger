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

  it('uses selected-month pending, active portfolio ranking, schedule totals, and loan monthly interest', () => {
    const payments = [
      {
        id: 'p1',
        chit_id: 'alpha-1',
        installment_no: 5,
        expected_amount: 5000,
        maturity_amount: 0,
        amount_paid: 5000,
        advance_amount_paid: 5000,
        status: 'paid',
        paid_date: '2026-05-08',
        payment_mode: null,
        paid_to: null,
        created_at: '',
        updated_at: '',
        chit: {
          id: 'alpha-1',
          start_date: '2026-01-01',
          end_date: '2027-08-01',
          type: 'ONE_LAKH',
          category: '5th',
          person: { name: 'Alpha', city: 'Chennai' },
        },
      },
      {
        id: 'p2',
        chit_id: 'alpha-2',
        installment_no: 5,
        expected_amount: 2500,
        maturity_amount: 0,
        amount_paid: 0,
        advance_amount_paid: 0,
        status: 'pending',
        paid_date: null,
        payment_mode: null,
        paid_to: null,
        created_at: '',
        updated_at: '',
        chit: {
          id: 'alpha-2',
          start_date: '2026-01-01',
          end_date: '2027-08-01',
          type: 'FIFTY_THOUSAND',
          category: '5th',
          person: { name: 'Alpha', city: 'Chennai' },
        },
      },
      {
        id: 'p3',
        chit_id: 'beta-1',
        installment_no: 5,
        expected_amount: 5000,
        maturity_amount: 0,
        amount_paid: 0,
        advance_amount_paid: 0,
        status: 'pending',
        paid_date: null,
        payment_mode: null,
        paid_to: null,
        created_at: '',
        updated_at: '',
        chit: {
          id: 'beta-1',
          start_date: '2026-01-01',
          end_date: '2027-08-01',
          type: 'TWO_LAKH',
          category: '10th',
          person: { name: 'Beta', city: 'Madurai' },
        },
      },
    ] as PaymentWithChit[];

    const metrics = buildEnterpriseDashboardMetrics(
      {
        payments,
        chits: [
          {
            id: 'alpha-1',
            person_id: 'person-alpha',
            type: 'ONE_LAKH',
            category: '5th',
            start_date: '2026-01-01',
            end_date: '2027-08-01',
            matured: false,
            withdrawal: false,
            person: { name: 'Alpha', city: 'Chennai' },
            payments: [payments[0]],
          },
          {
            id: 'alpha-2',
            person_id: 'person-alpha',
            type: 'FIFTY_THOUSAND',
            category: '5th',
            start_date: '2026-01-01',
            end_date: '2027-08-01',
            matured: false,
            withdrawal: false,
            person: { name: 'Alpha', city: 'Chennai' },
            payments: [payments[1]],
          },
          {
            id: 'beta-1',
            person_id: 'person-beta',
            type: 'TWO_LAKH',
            category: '10th',
            start_date: '2026-01-01',
            end_date: '2027-08-01',
            matured: false,
            withdrawal: false,
            person: { name: 'Beta', city: 'Madurai' },
            payments: [payments[2]],
          },
        ],
        loans: [
          {
            id: 'loan-1',
            person_id: 'person-alpha',
            principal: 100000,
            interest_rate: 0.01,
            interest_amount: 0,
            repayment_amount: 0,
            start_date: '2026-01-01',
            status: 'active',
            closed_date: null,
            notes: null,
            created_at: '',
            updated_at: '',
          },
        ],
        repayments: [],
      },
      '2026-05',
    );

    expect(metrics.executive.cashCollected.thisMonth).toBe(5000);
    expect(metrics.executive.outstanding.totalDue).toBe(7500);
    expect(metrics.executive.loanExposure.monthlyInterestBurden).toBe(1000);
    expect(metrics.topMembers.map((row) => row.personId)).toEqual([
      'person-beta',
      'person-alpha',
    ]);
    expect(metrics.topMembers.find((row) => row.personId === 'person-alpha')).toMatchObject({
      activeChitCount: 2,
      portfolioValue: 150000,
    });
    expect(metrics.scheduleComparison).toEqual([
      {
        schedule: '5th',
        installments: 2,
        expected: 7500,
        collected: 5000,
        pending: 2500,
      },
      {
        schedule: '10th',
        installments: 1,
        expected: 5000,
        collected: 0,
        pending: 5000,
      },
    ]);
  });
});
