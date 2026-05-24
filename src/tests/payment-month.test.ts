import {
  buildMonthlyScheduledPayments,
  buildMonthOptionsFromChits,
  computePaymentsMonthStats,
  filterPaymentsByMonth,
  filterPaymentsByStatus,
  filterPaymentsByCity,
  filterPaymentsByCategory,
  buildCityOptions,
  formatMonthLabel,
  sortPaymentsByStatus,
  type ChitWithSchedulePayments,
  type PaymentWithChit,
} from '@/utils/payment-month';
import type { Payment } from '@/types/database';

const basePayment = (
  chitId: string,
  installment: number,
  status: PaymentWithChit['status'] = 'pending',
): Payment => ({
  id: `${chitId}-${installment}`,
  chit_id: chitId,
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
});

const base = (status: PaymentWithChit['status'], installment: number): PaymentWithChit =>
  ({
    ...basePayment('c1', installment, status),
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

  it('builds scheduled payments from chits with nested payment status', () => {
    const makeChit = (id: string, start: string, end: string): ChitWithSchedulePayments => ({
      id,
      start_date: start,
      end_date: end,
      person: { name: id },
      payments: Array.from({ length: 20 }, (_, i) =>
        basePayment(id, i + 1, i === 16 ? 'paid' : 'pending'),
      ),
    });

    const chits = [makeChit('c-in-period', '2025-01-01', '2026-08-01'), makeChit('c-outside', '2023-01-01', '2024-08-01')];

    const result = buildMonthlyScheduledPayments(chits, '2026-05');
    expect(result.scheduledCount).toBe(1);
    expect(result.excludedOutsidePeriod).toBe(1);
    expect(result.scheduled).toHaveLength(1);
    expect(result.scheduled[0].installment_no).toBe(17);
    expect(result.scheduled[0].chit_id).toBe('c-in-period');
    expect(result.scheduled[0].status).toBe('paid');
  });

  it('builds month options from chit periods', () => {
    const options = buildMonthOptionsFromChits([
      { id: 'c1', start_date: '2025-01-01', end_date: '2025-03-01' },
    ]);
    const values = options.map((o) => o.value);
    expect(values).toEqual(expect.arrayContaining(['2025-01', '2025-02', '2025-03']));
  });
});
