import { describe, expect, it } from '@jest/globals';
import {
  buildLoanInterestBreakdown,
  calculateLoanInterest,
  calculateMonthlyLoanInterest,
  calculateRepaymentAmount,
  countLoanMonthsHeld,
} from '@/utils/loan-calculations';
import {
  computeYearProfitLoss,
  interestPaidForLoanInYear,
} from '@/utils/profit-loss-metrics';

describe('loan-calculations', () => {
  it('counts inclusive calendar months held', () => {
    expect(countLoanMonthsHeld('2026-05-16', '2026-05-16')).toBe(1);
    expect(countLoanMonthsHeld('2026-01-15', '2026-02-14')).toBe(2);
    expect(countLoanMonthsHeld('2026-01-01', '2026-04-01')).toBe(4);
  });

  it('calculates monthly and total interest', () => {
    expect(calculateMonthlyLoanInterest(500_000, 0.01)).toBe(5000);
    expect(calculateLoanInterest(100_000, 0.01, 3)).toBe(3000);
    const summary = buildLoanInterestBreakdown(500_000, 0.01, '2026-05-16', '2026-05-16');
    expect(summary.monthlyInterest).toBe(5000);
    expect(summary.monthsHeld).toBe(1);
    expect(summary.totalInterest).toBe(5000);
    expect(calculateRepaymentAmount(100_000, 3000)).toBe(103_000);
  });
});

describe('computeYearProfitLoss', () => {
  it('subtracts loan interest from chit revenue', () => {
    const result = computeYearProfitLoss(
      2026,
      [
        {
          expected_amount: 5000,
          advance_amount_paid: 5000,
          status: 'paid',
          paid_date: '2026-03-01',
        },
      ] as never,
      [
        {
          principal: 50_000,
          interest_amount: 500,
          status: 'closed',
          closed_date: '2026-06-01',
          start_date: '2026-01-01',
        },
      ] as never,
    );

    expect(result.chitRevenue).toBe(5000);
    expect(result.loanInterestExpense).toBe(500);
    expect(result.netProfit).toBe(4500);
  });

  it('includes partial repayment interest in the selected year', () => {
    const loan = {
      id: 'l1',
      principal: 50_000,
      interest_amount: null,
      status: 'active',
      closed_date: null,
      start_date: '2026-01-01',
    } as never;

    const repayments = [
      {
        loan_id: 'l1',
        repayment_date: '2026-04-01',
        principal_paid: 10_000,
        interest_paid: 750,
        is_final: false,
      },
    ] as never;

    expect(interestPaidForLoanInYear(loan, repayments, 2026)).toBe(750);

    const result = computeYearProfitLoss(2026, [], [loan], repayments);
    expect(result.loanInterestExpense).toBe(750);
  });
});
