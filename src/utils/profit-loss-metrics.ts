import { getRecordedAmount, hasRecordedPayment } from '@/utils/chit-payment-summary';
import { summarizeLoanBalance } from '@/utils/loan-balance';
import type { Loan, LoanRepayment } from '@/types/database';
import type { PaymentWithChit } from '@/utils/payment-month';
import { isDateInYear } from '@/utils/loan-calculations';

export interface YearProfitLoss {
  year: number;
  chitRevenue: number;
  loanInterestExpense: number;
  netProfit: number;
  loansTakenCount: number;
  loansClosedCount: number;
  totalPrincipalBorrowed: number;
  totalPrincipalRepaid: number;
}

export interface LoanYearStats {
  activeCount: number;
  pendingPrincipal: number;
  loansTakenInYear: number;
  loansClosedInYear: number;
  interestPaidInYear: number;
  totalLoansAllTime: number;
}

function repaymentsForLoan(repayments: LoanRepayment[], loanId: string): LoanRepayment[] {
  return repayments.filter((r) => r.loan_id === loanId);
}

export function interestPaidForLoanInYear(
  loan: Loan,
  repayments: LoanRepayment[],
  year: number,
): number {
  const rows = repaymentsForLoan(repayments, loan.id).filter((r) =>
    isDateInYear(r.repayment_date, year),
  );

  if (rows.length) {
    return rows.reduce((sum, r) => sum + Number(r.interest_paid), 0);
  }

  if (loan.status === 'closed' && isDateInYear(loan.closed_date, year)) {
    return Number(loan.interest_amount ?? 0);
  }

  return 0;
}

export function principalRepaidForLoanInYear(
  loan: Loan,
  repayments: LoanRepayment[],
  year: number,
): number {
  const rows = repaymentsForLoan(repayments, loan.id).filter((r) =>
    isDateInYear(r.repayment_date, year),
  );

  if (rows.length) {
    return rows.reduce((sum, r) => sum + Number(r.principal_paid), 0);
  }

  if (loan.status === 'closed' && isDateInYear(loan.closed_date, year)) {
    return Number(loan.principal);
  }

  return 0;
}

export function computeLoanYearStats(
  loans: Loan[],
  repayments: LoanRepayment[],
  year: number,
): LoanYearStats {
  const active = loans.filter((l) => l.status === 'active');
  const takenInYear = loans.filter((l) => isDateInYear(l.start_date, year));
  const closedInYear = loans.filter(
    (l) => l.status === 'closed' && isDateInYear(l.closed_date, year),
  );

  const pendingPrincipal = active.reduce((sum, loan) => {
    const balance = summarizeLoanBalance(loan, repaymentsForLoan(repayments, loan.id));
    return sum + balance.principalOutstanding;
  }, 0);

  const interestPaidInYear = loans.reduce(
    (sum, loan) => sum + interestPaidForLoanInYear(loan, repayments, year),
    0,
  );

  return {
    activeCount: active.length,
    pendingPrincipal: round(pendingPrincipal),
    loansTakenInYear: takenInYear.length,
    loansClosedInYear: closedInYear.length,
    interestPaidInYear: round(interestPaidInYear),
    totalLoansAllTime: loans.length,
  };
}

export function computeYearProfitLoss(
  year: number,
  payments: PaymentWithChit[],
  loans: Loan[],
  repayments: LoanRepayment[] = [],
): YearProfitLoss {
  let chitRevenue = 0;
  for (const payment of payments) {
    if (!hasRecordedPayment(payment) || !payment.paid_date) continue;
    if (!isDateInYear(payment.paid_date, year)) continue;
    chitRevenue += getRecordedAmount(payment);
  }

  const takenInYear = loans.filter((l) => isDateInYear(l.start_date, year));

  const loanInterestExpense = loans.reduce(
    (sum, loan) => sum + interestPaidForLoanInYear(loan, repayments, year),
    0,
  );

  const totalPrincipalBorrowed = takenInYear.reduce((s, l) => s + Number(l.principal), 0);
  const totalPrincipalRepaid = loans.reduce(
    (sum, loan) => sum + principalRepaidForLoanInYear(loan, repayments, year),
    0,
  );

  const closedInYear = loans.filter(
    (l) => l.status === 'closed' && isDateInYear(l.closed_date, year),
  );

  return {
    year,
    chitRevenue: round(chitRevenue),
    loanInterestExpense: round(loanInterestExpense),
    netProfit: round(chitRevenue - loanInterestExpense),
    loansTakenCount: takenInYear.length,
    loansClosedCount: closedInYear.length,
    totalPrincipalBorrowed: round(totalPrincipalBorrowed),
    totalPrincipalRepaid: round(totalPrincipalRepaid),
  };
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

export function buildYearOptions(
  loans: Loan[],
  payments: PaymentWithChit[],
  repayments: LoanRepayment[] = [],
): number[] {
  const years = new Set<number>([new Date().getFullYear()]);
  for (const loan of loans) {
    if (loan.start_date) years.add(new Date(loan.start_date).getFullYear());
    if (loan.closed_date) years.add(new Date(loan.closed_date).getFullYear());
  }
  for (const payment of payments) {
    if (payment.paid_date) years.add(new Date(payment.paid_date).getFullYear());
  }
  for (const repayment of repayments) {
    if (repayment.repayment_date) years.add(new Date(repayment.repayment_date).getFullYear());
  }
  return [...years].sort((a, b) => b - a);
}
