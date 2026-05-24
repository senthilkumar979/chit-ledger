import type { Loan, LoanRepayment } from '@/types/database';
import {
  buildLoanPeriodInterestBreakdown,
  roundMoney,
  todayLocalIsoDate,
} from '@/utils/loan-calculations';

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

function repaymentsForLoan(loanId: string, repayments: LoanRepayment[]): LoanRepayment[] {
  return repayments.filter((r) => r.loan_id === loanId);
}

/** Total interest accrued to date (paid + currently accruing on outstanding). */
export function calculateLoanInterestSoFar(
  loan: Loan,
  repayments: LoanRepayment[],
  asOfDate = todayLocalIsoDate(),
): number {
  const loanRepayments = repaymentsForLoan(loan.id, repayments);

  if (loan.status === 'closed') {
    if (loan.interest_amount != null) return loan.interest_amount;
    const closeDate = loan.closed_date ?? asOfDate;
    return buildLoanPeriodInterestBreakdown(
      loan.principal,
      loan.interest_rate,
      loan.start_date,
      closeDate,
    ).totalInterest;
  }

  const balance = summarizeLoanBalance(loan, loanRepayments);
  const periodStart = interestPeriodStart(loan, loanRepayments);
  const accruing = buildLoanPeriodInterestBreakdown(
    balance.principalOutstanding,
    loan.interest_rate,
    periodStart,
    asOfDate,
  ).totalInterest;

  return roundMoney(balance.interestPaidToDate + accruing);
}
