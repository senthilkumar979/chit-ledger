import type { Loan, LoanRepayment } from '@/types/database';
import { roundMoney } from '@/utils/loan-calculations';

export interface LoanBalanceSummary {
  originalPrincipal: number;
  principalRepaid: number;
  principalOutstanding: number;
  interestPaidToDate: number;
  totalRepaidToDate: number;
  partialRepaymentCount: number;
  lastRepaymentDate: string | null;
}

export function summarizeLoanBalance(loan: Loan, repayments: LoanRepayment[]): LoanBalanceSummary {
  const partials = repayments.filter((r) => !r.is_final);
  let principalRepaid = 0;
  let interestPaidToDate = 0;

  for (const row of repayments) {
    principalRepaid += Number(row.principal_paid);
    interestPaidToDate += Number(row.interest_paid);
  }

  const principalOutstanding = Math.max(0, roundMoney(loan.principal - principalRepaid));

  const sorted = [...repayments].sort((a, b) => a.repayment_date.localeCompare(b.repayment_date));
  const lastRepaymentDate = sorted.length ? sorted[sorted.length - 1].repayment_date : null;

  return {
    originalPrincipal: loan.principal,
    principalRepaid: roundMoney(principalRepaid),
    principalOutstanding,
    interestPaidToDate: roundMoney(interestPaidToDate),
    totalRepaidToDate: roundMoney(principalRepaid + interestPaidToDate),
    partialRepaymentCount: partials.length,
    lastRepaymentDate,
  };
}

export function interestPeriodStart(loan: Loan, repayments: LoanRepayment[]): string {
  const balance = summarizeLoanBalance(loan, repayments);
  return balance.lastRepaymentDate ?? loan.start_date.slice(0, 10);
}
