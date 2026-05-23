import {
  computePaymentsMonthStats,
  filterPaymentsByMonth,
  filterPaymentsByStatus,
  filterPaymentsByCity,
  filterPaymentsByCategory,
  buildCityOptions,
  formatMonthLabel,
  sortPaymentsByStatus,
  type PaymentWithChit,
} from '@/utils/payment-month';

const base = (status: PaymentWithChit['status'], installment: number): PaymentWithChit =>
  ({
    id: `${status}-${installment}`,
    chit_id: 'c1',
    installment_no: installment,
    expected_amount: 5000,
    maturity_amount: 70000,
    status,
    advance_amount_paid: 0,
    amount_paid: 0,
    paid_date: null,
    payment_mode: null,
    paid_to: null,
    created_at: '',
    updated_at: '',
    chit: { start_date: '2025-01-01', person: { name: 'Test' } },
  }) as PaymentWithChit;

describe('payment-month', () => {
  it('formats month label', () => {
    expect(formatMonthLabel('2026-06')).toBe('Jun 26');
  });

  it('filters by due month', () => {
    const payments = [base('pending', 1), base('pending', 3)];
    const jan = filterPaymentsByMonth(payments, '2025-01');
    expect(jan).toHaveLength(1);
    expect(jan[0].installment_no).toBe(1);
  });

  it('filters by city and category', () => {
    const payments = [
      {
        ...base('pending', 1),
        chit: {
          start_date: '2025-01-01',
          category: '5th of every month',
          person: { name: 'A', city: 'Chennai' },
        },
      },
      {
        ...base('pending', 2),
        chit: {
          start_date: '2025-01-01',
          category: '20th of every month',
          person: { name: 'B', city: 'Madurai' },
        },
      },
    ] as PaymentWithChit[];
    expect(filterPaymentsByCity(payments, 'Chennai')).toHaveLength(1);
    expect(filterPaymentsByCategory(payments, '20th of every month')).toHaveLength(1);
    expect(buildCityOptions(payments)).toEqual(['Chennai', 'Madurai']);
  });

  it('filters by status', () => {
    const payments = [base('paid', 1), base('overdue', 2)];
    expect(filterPaymentsByStatus(payments, 'overdue')).toHaveLength(1);
  });

  it('computes month stats by status and recorded amounts', () => {
    const payments = [
      { ...base('paid', 1), amount_paid: 5000, advance_amount_paid: 5000 },
      { ...base('partial', 2), amount_paid: 2000, advance_amount_paid: 2000 },
      base('pending', 3),
      base('overdue', 4),
    ] as PaymentWithChit[];

    const stats = computePaymentsMonthStats(payments);
    expect(stats).toEqual({
      total: 4,
      paid: 1,
      pending: 1,
      partial: 1,
      overdue: 1,
      collectedAmount: 7000,
    });
  });

  it('sorts overdue before pending before paid', () => {
    const sorted = sortPaymentsByStatus([
      base('paid', 1),
      base('overdue', 2),
      base('pending', 3),
    ]);
    expect(sorted.map((p) => p.status)).toEqual(['overdue', 'pending', 'paid']);
  });
});
