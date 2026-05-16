import { differenceInCalendarMonths } from 'date-fns';
import { DEFAULT_LOAN_INTEREST_RATE } from '@/constants/loans';
import type { Loan } from '@/types/database';

/** Parse YYYY-MM-DD (or ISO timestamp) in local calendar without timezone drift. */
export function parseLoanDate(value: string): Date {
  const [y, m, d] = value.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function todayLocalIsoDate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Calendar months from start through close (inclusive).
 * Same month = 1 month; each crossed month boundary adds one.
 */
export function countLoanMonthsHeld(startDate: string, closeDate: string): number {
  const start = parseLoanDate(startDate);
  const end = parseLoanDate(closeDate);
  if (end < start) return 0;
  return Math.max(1, differenceInCalendarMonths(end, start) + 1);
}

/** Interest for one month at the agreed rate. */
export function calculateMonthlyLoanInterest(
  principal: number,
  rate = DEFAULT_LOAN_INTEREST_RATE,
): number {
  return roundMoney(principal * rate);
}

/** Interest = monthly interest × months held. */
export function calculateLoanInterest(
  principal: number,
  rate = DEFAULT_LOAN_INTEREST_RATE,
  monthsHeld = 1,
): number {
  const months = Math.max(1, monthsHeld);
  return roundMoney(calculateMonthlyLoanInterest(principal, rate) * months);
}

export interface LoanInterestBreakdown {
  monthlyInterest: number;
  monthsHeld: number;
  totalInterest: number;
  repaymentTotal: number;
}

export function buildLoanInterestBreakdown(
  principal: number,
  rate: number,
  startDate: string,
  closeDate: string,
): LoanInterestBreakdown {
  return buildLoanPeriodInterestBreakdown(principal, rate, startDate, closeDate);
}

/** Interest on outstanding principal from period start through close date (inclusive months). */
export function buildLoanPeriodInterestBreakdown(
  outstandingPrincipal: number,
  rate: number,
  periodStartDate: string,
  closeDate: string,
): LoanInterestBreakdown {
  const monthsHeld = countLoanMonthsHeld(periodStartDate, closeDate);
  const monthlyInterest = calculateMonthlyLoanInterest(outstandingPrincipal, rate);
  const totalInterest = roundMoney(monthlyInterest * monthsHeld);
  return {
    monthlyInterest,
    monthsHeld,
    totalInterest,
    repaymentTotal: calculateRepaymentAmount(outstandingPrincipal, totalInterest),
  };
}

export function calculateRepaymentAmount(principal: number, interestAmount: number): number {
  return roundMoney(principal + interestAmount);
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function rateToPercentLabel(rate: number): string {
  return `${(rate * 100).toFixed(2).replace(/\.?0+$/, '')}%`;
}

export function isLoanActive(loan: Pick<Loan, 'status'>): boolean {
  return loan.status === 'active';
}

export function isDateInYear(date: string | null | undefined, year: number): boolean {
  if (!date) return false;
  return new Date(date).getFullYear() === year;
}
