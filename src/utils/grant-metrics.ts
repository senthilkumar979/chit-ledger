import {
  buildLoanPeriodInterestBreakdown,
  calculateMonthlyLoanInterest,
  todayLocalIsoDate,
} from '@/utils/loan-calculations';
import type { Grant } from '@/types/database';

export interface GrantDisplayMetrics {
  monthlyInterest: number;
  interestSoFar: number;
  monthsSinceStart: number;
  asOfDate: string;
}

export function buildGrantDisplayMetrics(
  grant: Pick<Grant, 'amount' | 'interest_rate' | 'interest_start_date'>,
  asOfDate = todayLocalIsoDate(),
): GrantDisplayMetrics {
  const breakdown = buildLoanPeriodInterestBreakdown(
    grant.amount,
    grant.interest_rate,
    grant.interest_start_date,
    asOfDate,
  );

  return {
    monthlyInterest: calculateMonthlyLoanInterest(grant.amount, grant.interest_rate),
    interestSoFar: breakdown.totalInterest,
    monthsSinceStart: breakdown.monthsHeld,
    asOfDate,
  };
}
