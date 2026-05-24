import type { Loan, LoanRepayment } from '@/types/database';
import {
  calculateLoanInterestSoFar,
  interestPeriodStart,
  summarizeLoanBalance,
  type LoanBalanceSummary,
} from '@/utils/loan-balance';
import {
  buildLoanPeriodInterestBreakdown,
  calculateMonthlyLoanInterest,
  calculateRepaymentAmount,
  countLoanMonthsHeld,
  todayLocalIsoDate,
  type LoanInterestBreakdown,
} from '@/utils/loan-calculations';

export interface LoanDetailMetrics {
  balance: LoanBalanceSummary;
  isActive: boolean;
  asOfDate: string;
  periodEndDate: string;
  monthsSinceBorrowed: number;
  monthlyInterestOnOutstanding: number;
  monthlyInterestOnOriginal: number;
  interestSoFar: number;
  interestAccruingThisPeriod: number;
  currentPeriodStart: string;
  currentPeriodBreakdown: LoanInterestBreakdown;
  lifeBreakdown: LoanInterestBreakdown;
  settlementIfClosedToday: number | null;
  storedRepaymentAmount: number | null;
}

export function buildLoanDetailMetrics(
  loan: Loan,
  repayments: LoanRepayment[],
  asOfDate = todayLocalIsoDate(),
): LoanDetailMetrics {
  const loanRepayments = repayments.filter((r) => r.loan_id === loan.id);
  const balance = summarizeLoanBalance(loan, loanRepayments);
  const isActive = loan.status === 'active';
  const periodEndDate = isActive ? asOfDate : loan.closed_date ?? asOfDate;
  const periodStart = interestPeriodStart(loan, loanRepayments);
  const principalForCurrentPeriod = isActive ? balance.principalOutstanding : loan.principal;
  const startForCurrentPeriod = isActive ? periodStart : loan.start_date;

  const currentPeriodBreakdown = buildLoanPeriodInterestBreakdown(
    principalForCurrentPeriod,
    loan.interest_rate,
    startForCurrentPeriod,
    periodEndDate,
  );

  const lifeBreakdown = buildLoanPeriodInterestBreakdown(
    loan.principal,
    loan.interest_rate,
    loan.start_date,
    periodEndDate,
  );

  const settlementIfClosedToday = isActive
    ? calculateRepaymentAmount(
        balance.principalOutstanding,
        currentPeriodBreakdown.totalInterest,
      )
    : null;

  return {
    balance,
    isActive,
    asOfDate,
    periodEndDate,
    monthsSinceBorrowed: countLoanMonthsHeld(loan.start_date, periodEndDate),
    monthlyInterestOnOutstanding: calculateMonthlyLoanInterest(
      balance.principalOutstanding,
      loan.interest_rate,
    ),
    monthlyInterestOnOriginal: calculateMonthlyLoanInterest(loan.principal, loan.interest_rate),
    interestSoFar: calculateLoanInterestSoFar(loan, loanRepayments, asOfDate),
    interestAccruingThisPeriod: isActive ? currentPeriodBreakdown.totalInterest : 0,
    currentPeriodStart: periodStart,
    currentPeriodBreakdown,
    lifeBreakdown,
    settlementIfClosedToday,
    storedRepaymentAmount: loan.repayment_amount,
  };
}
