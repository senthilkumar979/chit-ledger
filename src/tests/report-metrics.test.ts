import { describe, expect, it } from '@jest/globals';
import { buildReportsBundle, filterCollectionsByMonth } from '@/utils/report-metrics';
import type { PaymentWithChit } from '@/utils/payment-month';

const analytics = { byMonth: [], byType: [], byCity: [], byCategory: [] };

describe('buildReportsBundle', () => {
  it('aggregates collection and outstanding rows', () => {
    const payments = [
      {
        id: 'p1',
        chit_id: 'c1',
        installment_no: 1,
        expected_amount: 5000,
        advance_amount_paid: 5100,
        status: 'paid',
        paid_date: '2026-05-10',
        chit: { type: 'ONE_LAKH', category: '5th', person: { name: 'A', city: 'Chennai' } },
      },
      {
        id: 'p2',
        chit_id: 'c1',
        installment_no: 2,
        expected_amount: 4000,
        advance_amount_paid: null,
        status: 'overdue',
        paid_date: null,
        chit: { type: 'ONE_LAKH', category: '5th', person: { name: 'A', city: 'Chennai' } },
      },
    ] as PaymentWithChit[];

    const chits = [
      {
        id: 'c1',
        matured: false,
        withdrawal: false,
        type: 'ONE_LAKH',
        category: '5th',
        person: { name: 'A', city: 'Chennai' },
      },
    ];

    const bundle = buildReportsBundle(payments, chits, analytics);

    expect(bundle.collections).toHaveLength(1);
    expect(bundle.outstanding).toHaveLength(1);
    expect(bundle.kpis.totalCollected).toBe(5100);
    expect(bundle.kpis.overdueInstallments).toBe(1);
  });
});

describe('filterCollectionsByMonth', () => {
  it('filters by yyyy-mm prefix', () => {
    const rows = [
      { paidDate: '2026-05-01' },
      { paidDate: '2026-04-15' },
    ] as Parameters<typeof filterCollectionsByMonth>[0];

    expect(filterCollectionsByMonth(rows, '2026-05')).toHaveLength(1);
  });
});
