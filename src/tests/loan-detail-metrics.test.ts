import { describe, expect, it } from '@jest/globals';
import { buildLoanDetailMetrics } from '@/utils/loan-detail-metrics';
import type { Loan, LoanRepayment } from '@/types/database';

const baseLoan: Loan = {
  id: 'loan-1',
  loan_from_person_id: null,
  principal: 100_000,
  interest_rate: 0.01,
  interest_amount: null,
  repayment_amount: null,
  status: 'active',
  start_date: '2026-01-01',
  closed_date: null,
  notes: null,
  created_at: '',
  updated_at: '',
};

describe('buildLoanDetailMetrics', () => {
  it('computes months since borrowed and monthly interest on outstanding', () => {
    const metrics = buildLoanDetailMetrics(baseLoan, [], '2026-04-01');
    expect(metrics.monthsSinceBorrowed).toBe(4);
    expect(metrics.monthlyInterestOnOutstanding).toBe(1_000);
    expect(metrics.monthlyInterestOnOriginal).toBe(1_000);
    expect(metrics.interestSoFar).toBe(4_000);
    expect(metrics.interestAccruingThisPeriod).toBe(4_000);
    expect(metrics.settlementIfClosedToday).toBe(104_000);
  });

  it('uses stored totals for closed loans', () => {
    const closed: Loan = {
      ...baseLoan,
      status: 'closed',
      interest_amount: 3_000,
      repayment_amount: 103_000,
      closed_date: '2026-03-01',
    };
    const metrics = buildLoanDetailMetrics(closed, [], '2026-06-01');
    expect(metrics.interestSoFar).toBe(3_000);
    expect(metrics.storedRepaymentAmount).toBe(103_000);
    expect(metrics.isActive).toBe(false);
  });

  it('reduces monthly interest after partial principal repayment', () => {
    const repayments: LoanRepayment[] = [
      {
        id: 'r1',
        loan_id: 'loan-1',
        repayment_date: '2026-02-01',
        principal_paid: 40_000,
        interest_paid: 1_000,
        is_final: false,
        notes: null,
        created_at: '',
        updated_at: '',
      },
    ];
    const metrics = buildLoanDetailMetrics(baseLoan, repayments, '2026-04-01');
    expect(metrics.balance.principalOutstanding).toBe(60_000);
    expect(metrics.monthlyInterestOnOutstanding).toBe(600);
    expect(metrics.interestSoFar).toBeGreaterThan(1_000);
  });
});
